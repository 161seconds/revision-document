//! Boxes a timed animation or a pending state change is about to move,
//! against an installed browser. Skips cleanly when there is none.
//!
//! Each should-pass case in `not-at-rest-timed.html` carries its should-flag
//! twin's measurement; the base engine (2a26f1c5) reports every one of them,
//! and the page's hidden share with them.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

const FIXTURE: &str = "not-at-rest-timed.html";

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
fn what_a_timed_change_is_about_to_move_is_not_scored() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/{FIXTURE}");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    let flagged: Vec<(String, String, String)> = findings
        .iter()
        .filter(|f| {
            matches!(
                f.antipattern.as_str(),
                "buried-raster" | "undersized-ui-text" | "low-contrast" | "content-hidden-at-rest"
            )
        })
        .map(|f| {
            (
                f.antipattern.clone(),
                f.extras.get("selector").and_then(|v| v.as_str()).unwrap_or("").to_string(),
                f.snippet.clone(),
            )
        })
        .collect();
    let on = |rule: &str, selector: &str| flagged.iter().any(|(r, s, _)| r == rule && s == selector);

    for want in [
        ("undersized-ui-text", "#flag-url-old"),
        ("low-contrast", "#flag-segment-heading"),
        ("buried-raster", "#flag-buried-beside-photo"),
        ("buried-raster", "#flag-poster-unseen-video"),
    ] {
        assert!(on(want.0, want.1), "missing {want:?} in {flagged:#?}");
    }
    let passed: Vec<&(String, String, String)> = flagged
        .iter()
        .filter(|(_, s, _)| s.starts_with("#pass-"))
        .collect();
    assert!(passed.is_empty(), "unexpected should-pass findings: {passed:#?}");
    // The delayed fade-in and the slid-off menu hold most of the page's
    // text; neither is hidden content.
    let hidden: Vec<&(String, String, String)> =
        flagged.iter().filter(|(r, _, _)| r == "content-hidden-at-rest").collect();
    assert!(hidden.is_empty(), "{hidden:#?}");
}
