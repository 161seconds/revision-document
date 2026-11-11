//! The rules that joined the painted-at-capture predicate, against an
//! installed browser. Skips cleanly when there is none.
//!
//! Each should-pass case in `painted-gate-coverage.html` carries its
//! should-flag twin's measurement and differs only in paint: the base engine
//! (5ce750e5) reports every one of them.
//!
//! - blinking-cursor, bounce-easing, dark-glow, ai-color-palette and
//!   italic-serif-display skip an element nobody sees; a cursor caught in the
//!   off phase of its own blink still reports.
//! - kicker-above-heading skips a pair in a section at `hidden` or on an
//!   inactive slide.
//! - The page-level forms of bounce-easing, dark-glow and pulsing-dot report
//!   only where their selector matches something painted.
//! - text-occlusion skips the items of a closed `<details>`, a card inside
//!   one, text blurred past reading and a lone emoji, and names an SVG shape
//!   and a border-only field for what they are.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

const FIXTURE: &str = "painted-gate-coverage.html";

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
fn rules_behind_the_painted_gate_skip_what_nobody_sees() {
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
    let on = |rule: &str, selector: &str| flagged.iter().any(|(r, s, _)| r == rule && s == selector);
    let snippet_of = |rule: &str, selector: &str| {
        flagged
            .iter()
            .find(|(r, s, _)| r == rule && s == selector)
            .map(|(_, _, snippet)| snippet.clone())
            .unwrap_or_default()
    };
    let page_form = |rule: &str, needle: &str| flagged.iter().any(|(r, _, snippet)| r == rule && snippet.contains(needle));

    for want in [
        ("blinking-cursor", "#flag-cursor"),
        // Caught in the off phase of an opacity blink, and of a visibility
        // blink.
        ("blinking-cursor", "#flag-cursor-off"),
        ("blinking-cursor", "#flag-cursor-vis-off"),
        ("bounce-easing", "#flag-bounce"),
        ("dark-glow", "#flag-glow"),
        ("ai-color-palette", "#flag-palette"),
        ("italic-serif-display", "#flag-italic"),
        // The open menu covers the copy beneath it.
        ("text-occlusion", "#flag-details-copy"),
        ("text-occlusion", "#flag-overhang-title"),
        ("text-occlusion", "#flag-cover-copy"),
        ("text-occlusion", "#flag-two-letters"),
        ("text-occlusion", "#flag-svg-covered"),
        ("text-occlusion", "#flag-input-covered"),
    ] {
        assert!(on(want.0, want.1), "missing {want:?} in {flagged:#?}");
    }
    assert!(page_form("kicker-above-heading", "Invitation protocol"), "{flagged:#?}");
    assert!(page_form("pulsing-dot", ".live-dot"), "{flagged:#?}");

    // What covers the text is named for what it draws.
    assert!(snippet_of("text-occlusion", "#flag-cover-copy").contains("covered by an opaque element (div.cover-box)"));
    assert!(
        snippet_of("text-occlusion", "#flag-svg-covered").contains("covered by an SVG graphic (rect)"),
        "{flagged:#?}"
    );
    assert!(
        snippet_of("text-occlusion", "#flag-input-covered").contains("covered by a bordered element (input.input-cover)"),
        "{flagged:#?}"
    );

    for unwanted in [
        ("blinking-cursor", "#pass-cursor-faded"),
        ("blinking-cursor", "#pass-cursor-hidden"),
        ("bounce-easing", "#pass-bounce-loader"),
        ("bounce-easing", "#pass-bounce-row"),
        ("dark-glow", "#pass-glow-faded"),
        ("dark-glow", "#pass-glow-bar"),
        ("ai-color-palette", "#pass-palette-parked"),
        ("italic-serif-display", "#pass-italic-hidden"),
    ] {
        assert!(!on(unwanted.0, unwanted.1), "unexpected {unwanted:?} in {flagged:#?}");
    }
    let occluded_pass: Vec<&(String, String, String)> = flagged
        .iter()
        .filter(|(r, s, _)| r == "text-occlusion" && s.starts_with("#pass-"))
        .collect();
    assert!(occluded_pass.is_empty(), "{occluded_pass:#?}");
    for (rule, needle) in [
        ("kicker-above-heading", "Channel battle"),
        ("kicker-above-heading", "Investor relations"),
        ("bounce-easing", "animation: pgc-bounce"),
        ("bounce-easing", "cubic-bezier(0.68, -0.55, 0.265, 1.55)"),
        ("pulsing-dot", ".pass-rail"),
        ("dark-glow", "#1a3ad6"),
    ] {
        assert!(!page_form(rule, needle), "unexpected {rule} {needle} in {flagged:#?}");
    }
}
