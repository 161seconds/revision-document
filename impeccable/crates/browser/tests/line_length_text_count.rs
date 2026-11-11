//! `line-length` counts the characters that reached the rendered lines, on
//! `line-length-text-count.html`, against an installed browser. Skips cleanly
//! when there is none.
//!
//! The rule divides an element's characters among its line rects. Counted
//! from `textContent`, a paragraph with an inline `<style>` child, deep
//! source indentation or a script written with combining marks was charged
//! with characters that are on no line, and a comfortable measure read as a
//! long column.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

const FIXTURE: &str = "line-length-text-count.html";

fn fixture_path() -> PathBuf {
    Path::new(env!("CARGO_MANIFEST_DIR")).join("../../tests/fixtures/antipatterns").join(FIXTURE)
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

/// Serves the one fixture this test scans at `/<FIXTURE>` and nothing else,
/// so no request path reaches the rest of the disk.
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
    let fixture = (path.strip_prefix('/') == Some(FIXTURE))
        .then(|| std::fs::read(fixture_path()).ok())
        .flatten();
    let (status, body) = match fixture {
        Some(body) => ("200 OK", body),
        None => ("404 Not Found", b"missing".to_vec()),
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

/// The snippet of each finding of `rule` on the fixture.
fn findings(engine: &BrowserEngine, port: u16, rule: &str) -> Vec<String> {
    let url = format!("http://127.0.0.1:{port}/{FIXTURE}");
    engine
        .detect_url(&url, &ScanOptions::default())
        .expect("scan")
        .into_iter()
        .filter(|f| f.antipattern == rule)
        .map(|f| f.snippet)
        .collect()
}

/// Every case is compared with a plain twin on the same page rather than with
/// a fixed count: the fixture sets `system-ui`, so where the lines wrap, and
/// with it the count per line, is the host's font's business. What the rule
/// owes is that a case counts exactly what its twin counts.
///
/// A URL finding does not name its element, so the twins are matched by
/// their snippets: each group of twins reports one snippet as many times as
/// it has members. The wide column and its two cases are a group of three,
/// the `pre-wrap` paragraph and the normal one with a `pre-wrap` span a group
/// of two, and the plain measure and its four cases a group of five when a
/// narrow host font makes a 560px measure long enough to flag at all. Every
/// finding has to belong to one of those groups: a case that counts
/// something its twin does not reports a snippet of its own, or flags where
/// its twin does not, and either one changes the groups. Counted from
/// `textContent`, no case read what its twin reads (the style child's CSS,
/// the hidden children and the script, and the indentation were charged to
/// the lines, and the span's runs of spaces were folded away).
#[test]
fn line_length_counts_the_characters_on_the_lines() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let found = findings(&engine, port, "line-length");
    let mut groups: HashMap<&str, usize> = HashMap::new();
    for snippet in &found {
        *groups.entry(snippet.as_str()).or_default() += 1;
    }
    let mut sizes: Vec<usize> = groups.values().copied().collect();
    sizes.sort_unstable_by(|a, b| b.cmp(a));
    assert!(
        sizes == [3, 2] || sizes == [5, 3, 2],
        "every finding belongs to a group of twins that read alike: {found:?}"
    );
}
