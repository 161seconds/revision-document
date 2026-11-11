//! Taste calls r5-p30 and r5-p31 on the URL engine, over
//! `tests/fixtures/antipatterns/low-contrast-labelled-placeholders.html` and
//! `low-contrast-heavy-faces.html`, rendered by an installed browser. Skips
//! cleanly when there is none.
//!
//! A low-contrast placeholder is advisory when a visible label names its
//! field and keeps failing when the placeholder is the only label; a family
//! named as a bold cut is bold for the large-text bar at computed weight 400.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

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
    let rel = request
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(1))
        .unwrap_or("/")
        .trim_start_matches('/')
        .to_string();
    let (status, body) = match std::fs::read(fixtures_dir().join(&rel)) {
        Ok(body) if !rel.contains("..") => ("200 OK", body),
        _ => ("404 Not Found", b"missing".to_vec()),
    };
    let head = format!(
        "HTTP/1.0 {status}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(&body);
    let _ = stream.flush();
}

/// `(snippet, selector, severity, advisory flag)` for every `low-contrast`
/// finding on one fixture, or `None` when no browser is installed.
fn scan(fixture: &str) -> Option<Vec<(String, String, String, bool)>> {
    let env: HashMap<String, String> = std::env::vars().collect();
    if impeccable_browser::discovery::find_browser(&env).is_err() {
        eprintln!("skip: no installed browser found");
        return None;
    }
    let engine = BrowserEngine::new(env);
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/{fixture}");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    Some(
        findings
            .iter()
            .filter(|f| f.antipattern == "low-contrast")
            .map(|f| {
                let selector = f
                    .extras
                    .get("selector")
                    .and_then(|s| s.as_str())
                    .unwrap_or("")
                    .to_string();
                (f.snippet.clone(), selector, f.severity.clone(), f.advisory == Some(true))
            })
            .collect(),
    )
}

/// The one finding whose snippet names `needle`.
fn naming<'a>(
    findings: &'a [(String, String, String, bool)],
    needle: &str,
) -> &'a (String, String, String, bool) {
    let hits: Vec<_> = findings.iter().filter(|f| f.0.contains(needle)).collect();
    assert_eq!(hits.len(), 1, "expected one finding naming {needle}, got {findings:#?}");
    hits[0]
}

#[test]
fn a_placeholder_under_a_visible_label_is_advisory() {
    let Some(findings) = scan("low-contrast-labelled-placeholders.html") else {
        return;
    };
    for only_label in [
        "Work email address",
        "Company website link",
        "Search trials and targets",
        "Plate number or VIN",
        "Look up a compound",
        "Newsletter email address",
        "Family name goes here",
    ] {
        let f = naming(&findings, only_label);
        assert!(f.2 != "advisory" && !f.3, "expected failing: {f:?}");
    }
    for hint in [
        "Optional for individuals",
        "What are you working on this quarter",
        "Include the country code",
        "What should we call you",
        "Where the parcel goes",
        "Where do you work today",
    ] {
        let f = naming(&findings, hint);
        assert!(f.2 == "advisory" && f.3, "expected advisory: {f:?}");
    }
    assert_eq!(findings.len(), 13, "{findings:#?}");
}

#[test]
fn a_family_named_as_a_bold_cut_takes_the_large_text_bar() {
    let Some(findings) = scan("low-contrast-heavy-faces.html") else {
        return;
    };
    for (surface, bar) in [
        ("#ff572a", "(need 4.5:1)"),
        ("#ff5757", "(need 4.5:1)"),
        ("#f93258", "(need 4.5:1)"),
        ("#f41987", "(need 4.5:1)"),
        ("#fa6400", "(need 4.5:1)"),
        ("#ff9494", "(need 3:1)"),
    ] {
        let f = naming(&findings, surface);
        assert!(f.0.contains(bar), "{f:?}");
        assert!(f.2 != "advisory" && !f.3, "expected failing: {f:?}");
    }
    assert_eq!(findings.len(), 6, "{findings:#?}");
}
