//! Images and text that are not at rest, against an installed browser. Skips
//! cleanly when there is none.
//!
//! Each should-pass case in `not-at-rest.html` carries its should-flag twin's
//! measurement and differs only in whether it is at rest, or in whose text it
//! is; the base engine (3b1dced5) reports every one of them.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

const FIXTURE: &str = "not-at-rest.html";

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

/// The characters hidden at rest: the section whose reveal never ran (632)
/// and the card copy waiting at opacity 0 (55).
const HIDDEN_CHARS: usize = 632 + 55;
/// The page's text: every label and case, the 267 characters a view timeline
/// holds at 0 among them, and none of the 177 parked under the closed rows.
const TOTAL_CHARS: usize = 1654;

#[test]
fn what_is_not_at_rest_is_not_scored() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/{FIXTURE}");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    let flagged: Vec<(String, String, String)> = findings
        .iter()
        .filter(|f| {
            matches!(
                f.antipattern.as_str(),
                "buried-raster" | "cramped-padding" | "dark-glow" | "content-hidden-at-rest"
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
    let reports = |rule: &str, needle: &str| flagged.iter().any(|(r, _, snippet)| r == rule && snippet.contains(needle));

    for want in [
        ("buried-raster", "#flag-buried"),
        ("buried-raster", "#flag-buried-alone"),
        ("cramped-padding", "#flag-card-shifted"),
        ("cramped-padding", "#flag-card-label"),
    ] {
        assert!(on(want.0, want.1), "missing {want:?} in {flagged:#?}");
    }
    // The glow a painted button runs is named by the stylesheet alone.
    assert!(reports("dark-glow", "#ff00c8"), "{flagged:#?}");

    let passed: Vec<&(String, String, String)> = flagged
        .iter()
        .filter(|(_, s, _)| s.starts_with("#pass-"))
        .collect();
    assert!(passed.is_empty(), "unexpected should-pass findings: {passed:#?}");
    assert_eq!(flagged.iter().filter(|(r, _, _)| r == "buried-raster").count(), 2, "{flagged:#?}");
    assert_eq!(flagged.iter().filter(|(r, _, _)| r == "cramped-padding").count(), 2, "{flagged:#?}");
    // Keyframes no painted element runs put no glow on the page.
    assert!(!reports("dark-glow", "#00c8ff"), "{flagged:#?}");
    assert!(!reports("dark-glow", "#7dff00"), "{flagged:#?}");

    // One share for the page: the stalled section alone is hidden, the text
    // a view timeline holds counts as shown, the parked answers do not count.
    let hidden: Vec<&str> = flagged
        .iter()
        .filter(|(r, _, _)| r == "content-hidden-at-rest")
        .map(|(_, _, s)| s.as_str())
        .collect();
    assert_eq!(hidden.len(), 1, "{flagged:#?}");
    let counts = hidden[0]
        .split_once('(')
        .and_then(|(_, rest)| rest.split_once(" chars)"))
        .map(|(counts, _)| counts)
        .unwrap_or("");
    assert_eq!(counts, format!("{HIDDEN_CHARS} of {TOTAL_CHARS}"), "{}", hidden[0]);
    assert!(hidden[0].contains("This section was meant to fade in"), "{}", hidden[0]);
}
