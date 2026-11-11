//! Taste calls r3-02 and r3-04 on the URL engine, over
//! `tests/fixtures/antipatterns/low-contrast-near-bar.html` and
//! `low-contrast-decorative.html`, rendered by an installed browser. Skips
//! cleanly when there is none.
//!
//! Every `low-contrast` producer carries the severity: the element pass, the
//! link and span path, the sampled pass (`browser contrast`) and the pixel
//! pass (`pixel contrast`). A ratio just under its bar, and text with no
//! reading job, are advisory; everything else keeps failing.

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

/// The one finding whose selector ends with `tail`.
fn by_selector<'a>(
    findings: &'a [(String, String, String, bool)],
    tail: &str,
) -> &'a (String, String, String, bool) {
    let hits: Vec<_> = findings.iter().filter(|f| f.1.ends_with(tail)).collect();
    assert_eq!(hits.len(), 1, "expected one finding on {tail}, got {findings:#?}");
    hits[0]
}

fn assert_severity(f: &(String, String, String, bool), advisory: bool) {
    if advisory {
        assert!(f.2 == "advisory" && f.3, "expected advisory: {f:?}");
    } else {
        assert!(f.2 != "advisory" && !f.3, "expected failing: {f:?}");
    }
}

#[test]
fn near_bar_ratios_are_advisory_on_every_pass() {
    let Some(findings) = scan("low-contrast-near-bar.html") else {
        return;
    };
    for (tail, advisory, prefix) in [
        ("p.body-copy.fail-body", false, "4.1:1"),
        ("a.fail-link", false, "4.1:1"),
        ("p.large-copy.fail-large", false, "2.7:1"),
        ("p.display.fail-display", false, "2.7:1"),
        ("p.fail-image", false, "browser contrast 4.0:1"),
        ("div.pill.fail-pill", false, "pixel contrast "),
        ("p.body-copy.adv-edge", true, "4.2:1"),
        ("p.body-copy.adv-body", true, "4.48:1"),
        ("a.adv-link", true, "4.4:1"),
        ("span.adv-span", true, "4.3:1"),
        ("p.large-copy.adv-large", true, "2.8:1"),
        ("p.display.adv-display", true, "2.99:1"),
        ("p.adv-image", true, "browser contrast 4.3:1"),
        ("div.pill.adv-pill", true, "pixel contrast 4."),
    ] {
        let f = by_selector(&findings, tail);
        assert!(f.0.starts_with(prefix), "{tail}: {f:?}");
        assert_severity(f, advisory);
    }
    for readable in ["pass-body", "pass-link", "pass-large"] {
        assert!(findings.iter().all(|f| !f.1.contains(readable)), "{findings:#?}");
    }
}

#[test]
fn decorative_shapes_are_advisory_on_every_pass() {
    let Some(findings) = scan("low-contrast-decorative.html") else {
        return;
    };
    for tail in [
        "span.av",
        "div.tile",
        "p.stamp",
        "span.build",
        "p.sig",
        "span.author-signature",
        "span.mock-label:nth-of-type(1)",
        "code",
    ] {
        assert_severity(by_selector(&findings, tail), true);
    }
    for tail in [
        "a.letter-link",
        "span.count",
        "div.badge-new",
        "div.corner",
        "p.note",
        "h3.script-title",
        "span.signature-dish",
        "span.fine-print",
        "div.utility-card > span",
        "section.panel.mockups > p",
        "kbd.key",
        "span.info",
        "h3.release-h",
        "a.version-link",
        "span.release-year",
        "div.panel.mock-exam > p",
        "div.panel.illustration-credit > p",
        "div.panel.mockups-grid > p",
    ] {
        assert_severity(by_selector(&findings, tail), false);
    }
    // The svg avatar initial is measured by the pixel pass alone, and the
    // svg digit beside it keeps failing there.
    let svg: Vec<_> = findings.iter().filter(|f| f.0.starts_with("pixel contrast")).collect();
    let initial = svg.iter().find(|f| f.0.ends_with("\"S\"")).expect("the svg initial");
    assert_severity(initial, true);
    let digit = svg.iter().find(|f| f.0.ends_with("\"7\"")).expect("the svg digit");
    assert_severity(digit, false);
    assert!(findings.iter().all(|f| !f.0.contains("#1d4ed8") && !f.1.contains("stamp-ok")));
}
