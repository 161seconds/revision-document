//! How the URL engine reads a surface painted on the element's own box, ink
//! that is not the computed `color`, and text whose verdict only pixels can
//! give, against an installed browser. Skips cleanly when there is none.
//!
//! - A gradient over the same box's opaque fill is the surface, and an
//!   upper gradient layer lies over the layers below it.
//! - SVG text is scored only where its fill is `currentColor`; a filter
//!   that repaints the ink, and a word of a colour reveal, leave no verdict.
//! - Text the element pass hands to the pixels is read inside an
//!   `aria-hidden` box; a `fixed` image and sample points that disagree go
//!   to the pixel pass rather than print a sampled verdict.

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

/// `(rule, selector, snippet)` for every finding of a scan.
fn scan(engine: &BrowserEngine, fixture: &str) -> Vec<(String, String, String)> {
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/{fixture}");
    engine
        .detect_url(&url, &ScanOptions::default())
        .expect("scan")
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
        .collect()
}

fn snippet<'a>(flagged: &'a [(String, String, String)], rule: &str, selector: &str) -> Option<&'a str> {
    flagged
        .iter()
        .find(|(r, s, _)| r == rule && s == selector)
        .map(|(_, _, snippet)| snippet.as_str())
}

#[test]
fn own_box_surfaces_repainted_ink_and_pixel_reads() {
    let Some(engine) = engine() else { return };
    if !fixtures_dir().join("own-box-surface-and-ink-contrast.html").exists() {
        eprintln!("skip: fixture not present");
        return;
    }
    let flagged = scan(&engine, "own-box-surface-and-ink-contrast.html");
    for selector in [
        "#flag-label-on-pale-gradient-over-dark-fill",
        "#flag-pale-initials-on-pastel-layers",
        "#flag-copy-under-resting-filter",
        "#flag-coloured-word-at-rest",
        "#flag-svg-label-filled-with-current-colour",
        "#flag-date-on-pale-photo-in-aria-hidden",
        "#flag-copy-on-fixed-pale-patch",
    ] {
        assert!(
            snippet(&flagged, "low-contrast", selector).is_some(),
            "missing low-contrast on {selector} in {flagged:#?}"
        );
    }
    for selector in [
        "#pass-label-on-dark-gradient-over-pale-fill",
        "#pass-dark-initials-on-pastel-layers",
        "#pass-label-repainted-by-filter",
        "#pass-reveal-word",
        "#pass-svg-label-without-fill",
        "#pass-date-on-dark-photo-in-aria-hidden",
        "#pass-copy-on-fixed-dark-photo",
        "#pass-copy-on-photo-with-bright-streak",
        "#pass-copy-on-pseudo-scrim-over-pale-photo",
    ] {
        assert!(
            snippet(&flagged, "low-contrast", selector).is_none(),
            "low-contrast on {selector} was flagged in {flagged:#?}"
        );
    }
    // No other reveal word, and no SVG label without a fill, reports either.
    assert!(
        !flagged.iter().any(|(rule, _, s)| rule == "low-contrast" && (s.contains("#acb0cf") || s.contains("#f2f4ef"))),
        "{flagged:#?}"
    );
    assert!(!flagged.iter().any(|(rule, _, s)| rule == "gray-on-color" && s.contains("#363637")), "{flagged:#?}");
    // The button is printed against the gradient that paints it, not the
    // fill beneath, and the initials against the wheel, not the section.
    let label = snippet(&flagged, "low-contrast", "#flag-label-on-pale-gradient-over-dark-fill").unwrap_or_default();
    assert!(
        label.ends_with("(gradient on a#flag-label-on-pale-gradient-over-dark-fill)") && !label.contains("#1e3a8a"),
        "{label}"
    );
    let initials = snippet(&flagged, "low-contrast", "#flag-pale-initials-on-pastel-layers").unwrap_or_default();
    assert!(initials.ends_with("(gradient on span.avatar)") && !initials.contains("#13162a"), "{initials}");
    // What only pixels can say is read from pixels: the date inside the
    // `aria-hidden` box, and the copy over the fixed image.
    for selector in ["#flag-date-on-pale-photo-in-aria-hidden", "#flag-copy-on-fixed-pale-patch"] {
        let s = snippet(&flagged, "low-contrast", selector).unwrap_or_default();
        assert!(s.starts_with("pixel contrast "), "{selector}: {s}");
    }
}
