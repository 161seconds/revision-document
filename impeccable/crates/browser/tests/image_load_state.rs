//! An image's load state as the `Dom` trait reports it, read from a page an
//! installed browser rendered. Skips cleanly when there is none.
//!
//! The capture and the live page's probe are two readers of the same
//! element: each must tell a loaded image from one whose source failed and
//! from a lazy one the browser has not requested, and they must agree.

#[path = "support/http.rs"]
mod http;

use std::collections::{BTreeMap, HashMap};
use std::time::Duration;

use impeccable_browser::{cdp::Browser, discovery, snapshot_engine};
use impeccable_core::browser::Dom;
use serde_json::{json, Value};

/// The in-page probe the live overlay's rule core reads the page through.
const PROBE_JS: &str = include_str!("../../../browser-bundle/10-probe.js");

const PICTURE: &str = r#"<svg xmlns="http://www.w3.org/2000/svg" width="40" height="30"><rect width="40" height="30" fill="navy"/></svg>"#;

/// A loaded image, one whose source is a 404, a `picture` whose chosen
/// source is a 404, a lazy image far below the fold, and three elements that
/// are not an HTML `img`.
const PAGE: &str = r#"<!doctype html><html><body style="margin:0;height:30000px;position:relative">
<img id="loaded" src="/ok.svg" alt="Loaded">
<img id="failed" src="/gone.png" alt="Failed" width="200" height="100">
<picture><source srcset="/gone.webp" type="image/webp"><img id="picture" src="/ok.svg" alt="Picture"></picture>
<img id="lazy" loading="lazy" src="/later.svg" alt="Lazy" width="200" height="100" style="position:absolute;top:25000px;left:0">
<input id="input" type="image" src="/ok.svg" alt="Go">
<svg width="40" height="30"><image id="svgimage" href="/ok.svg" width="40" height="30"/></svg>
<div id="plain">Text</div>
</body></html>"#;

/// `[natural size, complete, currentSrc]`, each `None` where there is no answer.
type State = (Option<[f64; 2]>, Option<bool>, Option<String>);

fn browser() -> Option<Browser> {
    let env: HashMap<String, String> = std::env::vars().collect();
    let Ok(exe) = discovery::find_browser(&env) else {
        eprintln!("skip: no installed browser found");
        return None;
    };
    Browser::launch(&exe, &[], false)
        .map_err(|e| eprintln!("skip: could not launch browser: {}", e.message))
        .ok()
}

#[test]
fn the_capture_and_the_page_probe_agree_on_image_load_state() {
    let Some(mut browser) = browser() else { return };
    let origin = http::serve(|path| match path {
        "/" => Some(("text/html; charset=utf-8", PAGE.as_bytes().to_vec())),
        "/ok.svg" | "/later.svg" => Some(("image/svg+xml", PICTURE.as_bytes().to_vec())),
        _ => None,
    });
    let mut page = browser.new_page().unwrap();
    page.goto(&format!("{origin}/"), "load", Duration::from_secs(15)).unwrap();

    const IDS: [&str; 7] = ["loaded", "failed", "picture", "lazy", "input", "svgimage", "plain"];

    // The live page's probe: `[natural size, complete, currentSrc]` per id,
    // with the sentinels it hands the wasm side spelled as JSON null.
    let script = format!(
        "(() => {{ {PROBE_JS}\n const out = {{}}; for (const id of {ids}) {{ const h = __intern(document.getElementById(id)); const size = __impeccableDom.image_natural_size(h); const done = __impeccableDom.image_complete(h); const src = __impeccableDom.image_current_src(h); out[id] = [size.length ? size : null, done === -1 ? null : done === 1, src === undefined ? null : src]; }} return out; }})()",
        ids = json!(IDS)
    );
    let live = page.evaluate_value(&script).unwrap();

    snapshot_engine::ensure_snapshot_js(&mut page).unwrap();
    let dom = snapshot_engine::capture_snapshot(&mut page).unwrap();
    let mut captured = serde_json::Map::new();
    for id in IDS {
        let el = dom.query_one(None, &format!("#{id}")).unwrap().expect(id);
        captured.insert(
            id.to_string(),
            json!([
                dom.image_natural_size(el).map(|(w, h)| [w, h]),
                dom.image_complete(el),
                dom.image_current_src(el),
            ]),
        );
    }
    let captured = Value::Object(captured);

    let expected = json!({
        "loaded": [[40.0, 30.0], true, format!("{origin}/ok.svg")],
        // The fetch ended in a 404: complete, a selected source, no pixels.
        "failed": [[0.0, 0.0], true, format!("{origin}/gone.png")],
        // The source the browser picked from the `picture` is the one that failed.
        "picture": [[0.0, 0.0], true, format!("{origin}/gone.webp")],
        // Never requested: no pixels either, but nothing selected and not complete.
        "lazy": [[0.0, 0.0], false, ""],
        // Neither interface has a natural size or `complete`.
        "input": [null, null, null],
        "svgimage": [null, null, null],
        "plain": [null, null, null],
    });
    // Typed, so a whole number reads the same from either side.
    let read = |v: Value| -> BTreeMap<String, State> { serde_json::from_value(v).unwrap() };
    let expected = read(expected);
    assert_eq!(read(live), expected, "the page probe");
    assert_eq!(read(captured), expected, "the capture");

    page.close();
    browser.close();
}
