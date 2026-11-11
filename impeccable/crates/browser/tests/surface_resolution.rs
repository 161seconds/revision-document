//! Surfaces and ink low-contrast used to misread, against an installed
//! browser. Skips cleanly when there is none.
//!
//! - A `display: contents` root at `#000` is not the surface.
//! - A surface in exactly the text's own colour prints no verdict; one shade
//!   off still does.
//! - Open shadow trees are walked for the fill and the ink.
//! - The page's one report of a colour pair goes to the copy wholly on screen.
//! - An icon font's ligature and a close control's `x` are not read.
//! - A single digit 8px wide is scored.
//! - Two translucent inks on one gradient box are two reports.
//! - A title cut by the viewport's edge is answered from what is visible.
//! - A frosted header's 95% fill ends the visual pass's walk before its
//!   backdrop blur can block the reading.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

const FIXTURE: &str = "surface-resolution-contrast.html";

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
fn low_contrast_reads_the_surface_and_ink_a_reader_sees() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/{FIXTURE}");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    let flagged: Vec<(String, String, String)> = findings
        .iter()
        .map(|f| {
            (
                f.antipattern.clone(),
                f.extras
                    .get("selector")
                    .and_then(|v| v.as_str())
                    .unwrap_or("")
                    .to_string(),
                f.snippet.clone(),
            )
        })
        .collect();
    let has = |selector: &str| {
        flagged
            .iter()
            .any(|(r, s, _)| r == "low-contrast" && s == selector)
    };
    for selector in [
        "#flag-edge-title",
        "#flag-contents-eyebrow",
        "#flag-near-white-caption",
        "#flag-shadow-light-band",
        "#flag-onscreen-copy",
        "#flag-word-label",
        "#flag-green-next",
        "#flag-counter-total",
        "#flag-translucent-link",
        "#flag-translucent-caption",
        "#flag-frosted-tagline",
    ] {
        assert!(has(selector), "missing low-contrast on {selector} in {flagged:#?}");
    }
    for selector in [
        "#pass-edge-photo-title",
        "#pass-contents-copy",
        "#pass-photo-heading",
        "#pass-shadow-dark-band",
        "#pass-shadow-button-label",
        "#pass-offscreen-copy",
        "#pass-icon-ligature",
        "#pass-close-letter",
        "#pass-readable-counter",
        "#pass-step-numeral",
        "#pass-same-ink-copy",
        "#pass-frosted-readable",
    ] {
        assert!(!has(selector), "low-contrast on {selector} was flagged in {flagged:#?}");
    }
    // The eyebrow is scored against the page white, not the contents root.
    let eyebrow = flagged
        .iter()
        .find(|(_, s, _)| s == "#flag-contents-eyebrow")
        .map(|(_, _, snippet)| snippet.clone())
        .unwrap_or_default();
    assert!(eyebrow.contains("on #ffffff"), "{eyebrow}");
    // The light band is read from the shadow tree.
    let band = flagged
        .iter()
        .find(|(_, s, _)| s == "#flag-shadow-light-band")
        .map(|(_, _, snippet)| snippet.clone())
        .unwrap_or_default();
    assert!(band.contains("on #f4f4f4"), "{band}");
}
