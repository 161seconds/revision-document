//! A page that replaces the JavaScript built-ins with its own still captures,
//! and captures exactly as it would have without them.
//!
//! work24.go.kr declares a global `var Map = function () {...}`, so the
//! snapshot producer's `new Map()` built the page's object and the capture
//! failed with `states.set is not a function` (corpus observations-1004,
//! round 11). Two servers hand out the same HTML, and only the classic script
//! it loads differs, so the two captures must be equal byte for byte.
//!
//! - The capture test replaces or breaks every built-in the snapshot producer
//!   (`browser-bundle/05-natives.js` + `15-snapshot.js`) reaches for.
//! - The scan test runs the whole URL engine, whose own page scripts (the
//!   visual pass's scroll-into-view, the scroll probe, consent and overlay
//!   handling) build Maps and Sets too, over two scripts: the class legacy
//!   sites ship (their own collection constructors, statics reassigned on
//!   the shared objects) and the full replacement set above.
//!
//! Skips cleanly when no browser is installed.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::time::Duration;

use impeccable_browser::{
    cdp::Browser, detect_url_evidence, discovery, snapshot_engine, BrowserEngine, EvidenceRequest,
};
use impeccable_detect::engines::ScanOptions;
use serde_json::Value;

/// Exercises every part of the capture: a linked stylesheet (with a media
/// rule, a supports rule and keyframes), recorded states, a running
/// animation, a shadow tree, a placeholder and an image. The faint text on a
/// gradient below the first viewport sends the scan's visual-contrast pass
/// through its scroll-into-view script, which keeps a `Map` of the scroll
/// offsets it moved.
const PAGE: &str = r#"<!doctype html><html><head>
<meta charset="utf-8">
<title>Globals</title>
<script src="/globals.js"></script>
<link rel="stylesheet" href="/site.css">
</head><body>
<header class="masthead"><h1 class="title">Employment services</h1></header>
<main>
  <p class="lede">Find work, training and benefits in one place.</p>
  <form>
    <input type="checkbox" checked> <label>Remember me</label>
    <input type="text" placeholder="Search jobs">
    <button disabled>Search</button>
  </form>
  <div class="pulse">New</div>
  <img alt="" width="40" height="40" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%23345'/%3E%3C/svg%3E">
  <div id="host"></div>
  <section class="band"><p class="faint">Office hours and holiday closures</p></section>
</main>
<script>
  document.getElementById('host').attachShadow({ mode: 'open' }).innerHTML = '<button disabled>Inside</button>';
</script>
</body></html>"#;

const CSS: &str = r#"body { font-family: Georgia, serif; margin: 0; color: #222; }
.masthead { padding: 24px; background: #f4f1ea; }
.title { font-size: 40px; }
@media (min-width: 600px) { .lede { font-size: 20px; } }
@supports (display: grid) { main { display: grid; gap: 12px; padding: 24px; } }
@keyframes pulse { from { opacity: 0.4; } to { opacity: 1; } }
.pulse { animation: pulse 600s steps(1, end) infinite; width: 60px; }
.band { margin-top: 1400px; padding: 24px; background: linear-gradient(90deg, #6d6d6d, #7a7a7a); }
.faint { color: #5f5f5f; font-size: 16px; }
"#;

/// What work24.go.kr does (a global `Map` constructor with its own API), and
/// then every other built-in the snapshot producer and the URL engine's page
/// scripts name, each replaced the way a legacy library or a careless global
/// would replace it.
const HOSTILE: &str = r#"
var Map = function () { this.map = {}; };
Map.prototype.put = function (k, v) { this.map[k] = v; };
var Set = function () { this.items = []; };
var WeakMap = function () {};
var WeakSet = function () {};
var Promise = function () { throw new Error('page Promise'); };
var URL = function () { throw new Error('page URL'); };
var Image = function () { throw new Error('page Image'); };
var JSON = { stringify: function () { return '"page JSON"'; }, parse: function () { return null; } };
var Math = { min: function () { return 0; }, max: function () { return 0; }, round: function () { return 0; } };
var String = function () { return 'page String'; };
var Number = function () { return 0; };
var Boolean = function () { return false; };
var CSS = {};
var performance = {};
var getComputedStyle = function () { return {}; };
var matchMedia = function () { return { matches: false }; };
var setTimeout = function () { return 0; };
var clearTimeout = function () {};
var requestAnimationFrame = function () { return 0; };
var parseFloat = function () { return 0; };
Reflect.construct = function () { throw new Error('page Reflect.construct'); };
Reflect.apply = function () { throw new Error('page Reflect.apply'); };
Array.from = function () { return []; };
Array.isArray = function () { return false; };
Object.keys = function () { return []; };
Object.entries = function () { return []; };
Object.assign = function (t) { return t; };
"#;

/// The class legacy sites ship: their own collection constructors and
/// replaced statics on the built-in objects.
const LEGACY: &str = r#"
var Map = function () { this.map = {}; };
Map.prototype.put = function (k, v) { this.map[k] = v; };
var Set = function () { this.items = []; };
var WeakMap = function () {};
var WeakSet = function () {};
Array.from = function () { return []; };
Array.isArray = function () { return false; };
Object.keys = function () { return []; };
Object.entries = function () { return []; };
Object.assign = function (t) { return t; };
JSON.stringify = function () { return '"page JSON"'; };
JSON.parse = function () { return null; };
"#;

/// The control: a script that touches nothing.
const BENIGN: &str = "var pageReady = true;\n";

fn serve(script: &'static str) -> u16 {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind");
    let port = listener.local_addr().unwrap().port();
    std::thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            std::thread::spawn(move || handle(stream, script));
        }
    });
    port
}

fn handle(mut stream: TcpStream, script: &str) {
    let mut buf = [0u8; 8192];
    let n = stream.read(&mut buf).unwrap_or(0);
    let request = String::from_utf8_lossy(&buf[..n]);
    let path = request.split_whitespace().nth(1).unwrap_or("/");
    let (kind, body) = match path {
        "/globals.js" => ("text/javascript", script),
        "/site.css" => ("text/css", CSS),
        _ => ("text/html; charset=utf-8", PAGE),
    };
    let head = format!(
        "HTTP/1.0 200 OK\r\nContent-Type: {kind}\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(body.as_bytes());
    let _ = stream.flush();
}

fn browser() -> Option<Browser> {
    let env: HashMap<String, String> = std::env::vars().collect();
    let Ok(exe) = discovery::find_browser(&env) else {
        eprintln!("skip: no installed browser found");
        return None;
    };
    // A browser that is installed but will not start is a failure, not a skip.
    Some(Browser::launch(&exe, &[], false).unwrap_or_else(|e| panic!("launch: {}", e.message)))
}

/// Load the page from `port`, capture it, and hand back the capture's JSON
/// plus what the page's visual IO answers for the image.
fn capture(browser: &mut Browser, port: u16) -> (Value, Value) {
    let mut page = browser.new_page().unwrap();
    page.goto(&format!("http://127.0.0.1:{port}/"), "load", Duration::from_secs(15))
        .unwrap();
    snapshot_engine::ensure_snapshot_js(&mut page).unwrap();
    let json = snapshot_engine::capture_snapshot_json(&mut page).expect("capture");
    let image = page
        .evaluate_value(
            "window.__impIO.loadImage(document.querySelector('img').src).then(r => r && { w: r.w, h: r.h })",
        )
        .expect("visual IO");
    // The engine's own scripts (the CLI's asset capture reads resource
    // timings) still reach every Performance method through the stash.
    let entries = page
        .evaluate_value("performance.getEntriesByType('navigation').length")
        .expect("performance entries");
    assert_eq!(entries, serde_json::json!(1));
    // The global functions and the constructor facades the engine's own
    // scripts reach (the scroll probe's and the validity probe's opacity
    // reads, `new Array(n)`), even with the page's `parseFloat`,
    // `Reflect.construct` and `Reflect.apply` replaced.
    let scoped = page
        .evaluate_value("[parseFloat('0.5'), new Array(3).length, Number('7'), Array.from('ab').length]")
        .expect("scoped natives");
    assert_eq!(scoped, serde_json::json!([0.5, 3, 7, 2]));
    page.close();
    (serde_json::from_str(&json).expect("capture json"), image)
}

#[test]
fn page_replaced_builtins_do_not_change_the_capture() {
    let Some(mut browser) = browser() else { return };
    let hostile = serve(HOSTILE);
    let benign = serve(BENIGN);

    let (hostile_snap, hostile_image) = capture(&mut browser, hostile);
    let (benign_snap, benign_image) = capture(&mut browser, benign);
    browser.close();

    // Every part of the capture that builds a Map, a Set or an array ran.
    let els = hostile_snap["els"].as_array().expect("els");
    assert!(els.len() > 10);
    assert!(els.iter().any(|e| e.get("an").is_some()), "running animation recorded");
    assert!(els.iter().any(|e| e.get("st").is_some()), "states recorded");
    assert!(els.iter().any(|e| e.get("sh").is_some()), "shadow tree captured");
    let linked = hostile_snap["linkedCss"].as_str().unwrap_or("");
    assert!(linked.contains(".lede") && linked.contains("@keyframes pulse"), "{linked}");
    assert_eq!(benign_image, serde_json::json!({ "w": 40, "h": 40 }));
    assert_eq!(hostile_image, benign_image);
    assert_eq!(hostile_snap, benign_snap);
}

#[test]
fn page_replaced_builtins_do_not_change_the_scan() {
    let env: HashMap<String, String> = std::env::vars().collect();
    if discovery::find_browser(&env).is_err() {
        eprintln!("skip: no installed browser found");
        return;
    }
    let legacy = serve(LEGACY);
    let hostile = serve(HOSTILE);
    let benign = serve(BENIGN);
    let scan = |port: u16| {
        let engine = BrowserEngine::new(env.clone());
        let mut browser = engine.launch().expect("launch");
        let options = ScanOptions { viewport: Some((1280, 800)), ..Default::default() };
        let request = EvidenceRequest { screenshot: false, ..Default::default() };
        let (findings, evidence) = detect_url_evidence(
            &mut browser,
            &format!("http://127.0.0.1:{port}/"),
            &options,
            "load",
            100,
            &request,
        )
        .expect("scan");
        browser.close();
        let ids: Vec<String> = findings.iter().map(|f| format!("{}|{}", f.antipattern, f.snippet)).collect();
        (ids, evidence.scan_snapshot.is_some())
    };
    let (benign_findings, benign_captured) = scan(benign);
    assert!(benign_captured);
    assert!(
        benign_findings.iter().any(|f| f.starts_with("low-contrast|")),
        "the faint band reaches the visual pass: {benign_findings:?}"
    );
    for (name, port) in [("legacy", legacy), ("hostile", hostile)] {
        let (findings, captured) = scan(port);
        assert!(captured, "{name}");
        assert_eq!(findings, benign_findings, "{name}");
    }
}
