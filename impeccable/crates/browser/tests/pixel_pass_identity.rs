//! The pixel pass measures the element its candidate came from when the page
//! repeats the id the candidate's selector is anchored on, and reads a
//! right-to-left page's pixels where its text paints. Rendered by an
//! installed browser; skips cleanly when there is none.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::Path;

use impeccable_browser::BrowserEngine;
use impeccable_detect::engines::{ScanOptions, UrlEngine};

fn serve(body: String) -> u16 {
    let listener = TcpListener::bind("127.0.0.1:0").expect("bind");
    let port = listener.local_addr().unwrap().port();
    std::thread::spawn(move || {
        for stream in listener.incoming().flatten() {
            let body = body.clone();
            std::thread::spawn(move || handle(stream, &body));
        }
    });
    port
}

fn handle(mut stream: TcpStream, body: &str) {
    let mut buf = [0u8; 8192];
    let _ = stream.read(&mut buf);
    let head = format!(
        "HTTP/1.0 200 OK\r\nContent-Type: text/html; charset=utf-8\r\nContent-Length: {}\r\nConnection: close\r\n\r\n",
        body.len()
    );
    let _ = stream.write_all(head.as_bytes());
    let _ = stream.write_all(body.as_bytes());
    let _ = stream.flush();
}

#[test]
fn a_repeated_id_does_not_send_the_pixel_pass_to_a_collapsed_copy() {
    let env: HashMap<String, String> = std::env::vars().collect();
    if impeccable_browser::discovery::find_browser(&env).is_err() {
        eprintln!("skip: no installed browser found");
        return;
    }
    let fixture = Path::new(env!("CARGO_MANIFEST_DIR"))
        .join("../../tests/fixtures/antipatterns/fullpage-screenshot-scroller.html");
    let html = std::fs::read_to_string(fixture).expect("fixture");
    // A collapsed copy of the vector-copy paragraph, first in the document:
    // `querySelector` answers with it, and it sits in the first viewport, so
    // scrolling it into view moves nothing.
    let html = html.replacen(
        "<body>",
        "<body>\n<div style=\"height:0;overflow:hidden\"><p id=\"flag-scroller-vector-copy\">Collapsed copy.</p></div>",
        1,
    );
    assert!(html.contains("Collapsed copy."));
    let port = serve(html);
    let engine = BrowserEngine::new(env);
    let url = format!("http://127.0.0.1:{port}/");
    let findings = engine.detect_url(&url, &ScanOptions::default()).expect("scan");
    let pixel: Vec<&str> = findings
        .iter()
        .filter(|f| {
            f.antipattern == "low-contrast"
                && f.extras.get("selector").and_then(|v| v.as_str()) == Some("#flag-scroller-vector-copy")
        })
        .map(|f| f.snippet.as_str())
        .collect();
    assert!(
        pixel.iter().any(|s| s.starts_with("pixel contrast ")),
        "the vector copy past the body scroller's fold was not measured: {pixel:?}"
    );
}

/// A right-to-left page wider than the viewport keeps its overflow at
/// negative document x, and a beyond-viewport clip's x 0 is the left edge of
/// that overflow. White text on pale vector artwork only the pixel pass can
/// answer, once inside the first viewport at the right and once in the
/// overflow at negative x; each clip has to be moved by the scroll origin or
/// both shots read somewhere else. The overflow copy is short and set at the
/// right of its padded box, so only its text's own x finds it.
const RTL_VECTOR_PAGE: &str = r##"<!DOCTYPE html>
<html lang="he" dir="rtl"><head><meta charset="UTF-8"><title>Right-to-left vector copy</title>
<style>
  body { margin: 0; background: #ffffff; color: #111111; font: 16px/1.5 Arial, sans-serif; }
  .wide { width: 2400px; height: 40px; background: #ffffff; }
  .vector-panel {
    position: relative; isolation: isolate; width: 420px; height: 96px; margin: 24px 0 0;
    background: #1d2330 url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='16' height='16'><rect width='16' height='16' fill='%231d2330'/><circle cx='8' cy='8' r='3' fill='%23262d3b'/></svg>") repeat;
  }
  .vector-panel svg { position: absolute; right: 0; top: 0; z-index: 0; display: block; width: 420px; height: 96px; }
  .vector-panel p { position: relative; z-index: 1; margin: 0; padding: 24px; width: 372px; font-size: 16px; line-height: 1.6; color: #fdfdfd; }
  .overflow-row { width: 2400px; }
  .overflow-row .vector-panel { margin-right: 1400px; }
</style></head>
<body>
  <div class="wide"></div>
  <div class="vector-panel">
    <svg viewBox="0 0 420 96" aria-hidden="true"><rect width="420" height="96" fill="#f5f2ea"/></svg>
    <p id="rtl-vector-copy">White text on pale vector artwork.</p>
  </div>
  <div class="overflow-row">
    <div class="vector-panel">
      <svg viewBox="0 0 420 96" aria-hidden="true"><rect width="420" height="96" fill="#f5f2ea"/></svg>
      <p id="rtl-overflow-copy">Pale copy.</p>
    </div>
  </div>
</body></html>"##;

#[test]
fn a_right_to_left_page_reads_pixels_where_the_text_paints() {
    let env: HashMap<String, String> = std::env::vars().collect();
    if impeccable_browser::discovery::find_browser(&env).is_err() {
        eprintln!("skip: no installed browser found");
        return;
    }
    let port = serve(RTL_VECTOR_PAGE.to_string());
    let engine = BrowserEngine::new(env);
    let url = format!("http://127.0.0.1:{port}/");
    let options = ScanOptions { viewport: Some((1280, 800)), ..Default::default() };
    let findings = engine.detect_url(&url, &options).expect("scan");
    for id in ["#rtl-vector-copy", "#rtl-overflow-copy"] {
        let pixel: Vec<&str> = findings
            .iter()
            .filter(|f| f.antipattern == "low-contrast" && f.extras.get("selector").and_then(|v| v.as_str()) == Some(id))
            .map(|f| f.snippet.as_str())
            .collect();
        assert!(
            pixel.iter().any(|s| s.starts_with("pixel contrast ")),
            "{id} on a right-to-left page was not measured where it paints: {pixel:?}"
        );
    }
}
