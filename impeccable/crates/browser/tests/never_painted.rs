//! Paint that never reaches the screen, against an installed browser. Skips
//! cleanly when there is none.
//!
//! Each should-pass case in `never-painted.html` carries its should-flag
//! twin's measurement and differs only in paint, or in what the probe can
//! know; the base engine (156c3150) reports every one of them.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

const FIXTURE: &str = "never-painted.html";

fn fixtures_dir() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../tests/fixtures/antipatterns")
}

fn serve() -> u16 {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind");
    let port = listener.local_addr().unwrap().port();
    std::thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            std::thread::spawn(move || handle(stream));
        }
    });
    port
}

fn handle(mut stream: TcpStream) {
    let mut buf = [0u8; 8192];
    let n = stream.read(&mut buf).unwrap_or(0);
    let request = String::from_utf8_lossy(&buf[..n]);
    let path = request
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(1))
        .unwrap_or("/")
        .to_string();
    let body = std::fs::read(fixtures_dir().join(path.trim_start_matches('/'))).unwrap_or_default();
    let head = format!(
        "HTTP/1.0 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(&body);
}

fn engine() -> Option<BrowserEngine> {
    let env: HashMap<String, String> = std::env::vars().collect();
    if impeccable_browser::discovery::find_browser(&env).is_err() {
        eprintln!("skip: no installed browser found");
        return None;
    }
    Some(BrowserEngine::new(env))
}

#[test]
fn paint_that_never_reaches_the_screen_is_not_scored() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/{FIXTURE}");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    let flagged: Vec<(String, String, String)> = findings
        .iter()
        .map(|f| {
            (
                f.antipattern.clone(),
                f.extras.get("selector").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                f.snippet.clone(),
            )
        })
        .collect();
    let on = |rule: &str, selector: &str| flagged.iter().any(|(r, s, _)| r == rule && s == selector);
    let reports = |rule: &str, needle: &str| flagged.iter().any(|(r, _, snippet)| r == rule && snippet.contains(needle));

    for want in [
        ("low-contrast", "#flag-dot"),
        ("low-contrast", "#flag-fallback-copy"),
        ("low-contrast", "#flag-flip-front"),
        ("low-contrast", "#flag-placeholder"),
        ("low-contrast", "#flag-limit-visible"),
        ("side-tab", "#flag-side-tab"),
        ("gradient-text", "#flag-gradient"),
        ("clipped-overflow-container", "#flag-clip"),
        ("buried-raster", "#flag-buried"),
        ("text-occlusion", "#flag-label-covered"),
        ("text-occlusion", "#flag-overlap-under"),
        ("text-occlusion", "#flag-brand-label"),
        ("text-occlusion", "#flag-kicker-under"),
    ] {
        assert!(on(want.0, want.1), "missing {want:?} in {flagged:#?}");
    }
    // Words in an inline colour that no transition moves are at rest.
    assert!(reports("low-contrast", "text #e2e2e6 on #ffffff"), "{flagged:#?}");
    // Copy an editor coloured under a theme's transition is not a reveal:
    // the footer list, the one-link paragraphs and the TinyMCE spans.
    for pair in ["text #b1b1b1 on #ffffff", "text #a9a9aa on #ffffff", "text #c4c4c5 on #ffffff"] {
        assert!(reports("low-contrast", pair), "missing {pair} in {flagged:#?}");
    }

    let passed: Vec<&(String, String, String)> = flagged
        .iter()
        .filter(|(_, s, _)| s.starts_with("#pass-"))
        .collect();
    assert!(passed.is_empty(), "unexpected should-pass findings: {passed:#?}");
    // The reveal's words carry no id; their colour names them.
    assert!(!reports("low-contrast", "text #e4e4e7 on #ffffff"), "{flagged:#?}");
    // The drawer's gradient label is the page's only other clipped gradient,
    // and the page form does not stand in for it.
    assert_eq!(flagged.iter().filter(|(r, _, _)| r == "gradient-text").count(), 1, "{flagged:#?}");
}
