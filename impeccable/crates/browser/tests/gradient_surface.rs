//! How the URL engine resolves the surface and the ink of a piece of text
//! for low-contrast, against an installed browser. Skips cleanly when there
//! is none.
//!
//! - A gradient is read where the text sits inside the box that paints it,
//!   and the snippet names that box.
//! - A gradient tile that paints under no glyph is not a background.
//! - Every translucent fill between the text and its surface is composited.
//! - The ink's alpha and the opacity of the boxes around it are blended
//!   before the ink is scored and printed.

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
    let path = request
        .lines()
        .next()
        .and_then(|l| l.split_whitespace().nth(1))
        .unwrap_or("/")
        .split('?')
        .next()
        .unwrap_or("/")
        .to_string();
    let (status, body) = match std::fs::read(fixtures_dir().join(path.trim_start_matches('/'))) {
        Ok(body) => ("200 OK", body),
        Err(_) => ("404 Not Found", b"missing".to_vec()),
    };
    let head = format!(
        "HTTP/1.0 {status}\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(&body);
    let _ = stream.flush();
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
fn the_url_engine_reads_the_surface_under_the_text() {
    let Some(engine) = engine() else { return };
    if !fixtures_dir().join("gradient-surface-contrast.html").exists() {
        eprintln!("skip: fixture not present");
        return;
    }
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/gradient-surface-contrast.html");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    let snippets: Vec<String> = findings
        .iter()
        .filter(|f| f.antipattern == "low-contrast")
        .map(|f| f.snippet.clone())
        .collect();

    for (case, expected) in [
        ("label on the light band of its gradient", "text #fffdf7 on #fde68a (gradient on a.band-button)"),
        ("copy on a gradient too light everywhere", "(gradient on div.pale-panel)"),
        ("link filled by a covering gradient", "text #d4d4d8 on #e4e4e7 (gradient on a.fill-link)"),
        ("label on a faint orange tint", "text #ea580d on #fdeee7"),
        ("span at half opacity", "text #b5b9c0 on #ffffff"),
        ("copy in a translucent ink", "text #acaeb3 on #ffffff"),
        ("copy inside a faded wrapper", "text #9399a1 on #ffffff"),
        ("copy running to the light end of a banner", "(gradient on div.edge-banner)"),
    ] {
        assert!(
            snippets.iter().any(|s| s.contains(expected)),
            "{case} should flag as `{expected}`, got {snippets:?}"
        );
    }
    // One text colour on one header box is one report however many links
    // sit on it; same-class tiles on different gradients are two surfaces,
    // and the navy tile beside them passes.
    let header = snippets.iter().filter(|s| s.contains("#cbd5e0")).count();
    assert_eq!(header, 1, "two links on one header, got {snippets:?}");
    let tiles: Vec<&String> = snippets.iter().filter(|s| s.contains("text #fdfdfd")).collect();
    assert_eq!(tiles.len(), 2, "amber and lime tiles, got {snippets:?}");
    assert!(tiles.iter().all(|s| s.ends_with("(gradient on div.feature-tile)")), "{tiles:?}");
    for (case, color) in [
        ("label on the dark band of its gradient", "#fffdf8"),
        ("short copy at the dark end of a banner", "#dfdfe0"),
        ("pill far from a radial glow", "#475569"),
        ("link with a collapsed gradient underline", "#0f172a"),
        ("link with a full-width gradient underline", "#1e293b"),
        ("dark label on a faint dark tint", "#0f172b"),
        ("span at nine tenths opacity", "#111828"),
        ("copy in a nearly opaque ink", "#111827"),
    ] {
        assert!(
            !snippets.iter().any(|s| s.contains(color)),
            "{case} ({color}) should not flag, got {snippets:?}"
        );
    }
}
