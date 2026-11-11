//! Which text the visual-contrast passes measure, and what they read as its
//! surface, over `tests/fixtures/antipatterns/visual-contrast-gates.html`,
//! rendered by an installed browser. Skips cleanly when there is none.
//!
//! - The sampled and pixel passes take a candidate only once it clears the
//!   element pass's text gates: a cell clipped past its strip, a disabled
//!   button and a launcher label set in 0px transparent ink report nothing,
//!   while their visible twins still flag.
//! - A background image that covers neither its box nor the text is not the
//!   text's surface: a white count inside a frame sprite on a dark badge, and
//!   a label beside a button's icon, are not scored against the photo under
//!   them.
//! - Text with no letter and no digit is not scored on any tag.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

const FIXTURE: &str = "visual-contrast-gates.html";

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

#[test]
fn the_visual_passes_measure_only_text_a_reader_sees_on_its_own_surface() {
    let env: HashMap<String, String> = std::env::vars().collect();
    if impeccable_browser::discovery::find_browser(&env).is_err() {
        eprintln!("skip: no installed browser found");
        return;
    }
    let engine = BrowserEngine::new(env);
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/{FIXTURE}");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    let low: Vec<(String, String)> = findings
        .iter()
        .filter(|f| f.antipattern == "low-contrast")
        .map(|f| {
            let selector = f
                .extras
                .get("selector")
                .and_then(|s| s.as_str())
                .unwrap_or("")
                .to_string();
            (selector, f.snippet.clone())
        })
        .collect();
    let flagged = |class: &str| low.iter().any(|(sel, _)| sel.contains(class));

    for class in [
        "tab-cell-visible",
        "fade-button-enabled",
        "circle-words",
        "count-light",
        "brace-words",
        "launcher-visible",
    ] {
        assert!(flagged(class), "{class} should flag, got {low:?}");
    }
    for class in [
        "tab-cell-hidden",
        "fade-button-disabled",
        "circle-glyph",
        "count-dark",
        "icon-button",
        "launcher-silent",
        "brace-glyph",
    ] {
        assert!(!flagged(class), "{class} should not flag, got {low:?}");
    }
}
