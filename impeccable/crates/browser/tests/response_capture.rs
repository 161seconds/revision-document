//! Native transport evidence: read the response that was rendered, never refetch.
use impeccable_browser::{cdp::Browser, discovery};
use std::collections::HashMap;
use std::sync::{
    Arc,
    atomic::{AtomicUsize, Ordering},
};
use std::time::{Duration, Instant};
#[path = "support/http.rs"]
mod http;

fn launch(exe: &std::path::Path) -> Option<Browser> {
    Browser::launch(exe, &[], false)
        .map_err(|e| eprintln!("skip: could not launch browser: {}", e.message))
        .ok()
}

#[test]
fn response_capture_reads_original_bytes_and_preserves_repeated_url_ambiguity() {
    let env: HashMap<String, String> = std::env::vars().collect();
    let Ok(exe) = discovery::find_browser(&env) else {
        eprintln!("skip: no browser");
        return;
    };
    let hits = Arc::new(AtomicUsize::new(0));
    let icon_requests = Arc::new(AtomicUsize::new(0));
    let (count, icons) = (hits.clone(), icon_requests.clone());
    let origin = http::serve(move |path| match path {
        "/asset.bin" => {
            let number = count.fetch_add(1, Ordering::SeqCst);
            Some((
                "application/octet-stream",
                if number == 0 { vec![0, 255, 13, 128, 42] } else { vec![99, 4, 0, 128] },
            ))
        }
        "/icon.png" | "/favicon.ico" => {
            icons.fetch_add(1, Ordering::SeqCst);
            None
        }
        _ => Some(("text/html", b"<!doctype html><title>capture</title><link rel=icon href=/icon.png><body>fixture</body>".to_vec())),
    });
    let Some(mut browser) = launch(&exe) else { return; };
    let mut page = browser.new_page().unwrap();
    assert!(
        page.response_evidence(&[]).is_err(),
        "capture must be explicitly enabled"
    );
    page.begin_response_capture().unwrap();
    page.goto(&origin, "load", Duration::from_secs(15)).unwrap();
    // Chrome fetches the declared tab icon after load, on its own schedule.
    // Wait for it so everything below covers it: it is the browser's request,
    // not the page's, and must not read as a page dependency or a change.
    let waited = Instant::now();
    while icon_requests.load(Ordering::SeqCst) == 0 && waited.elapsed() < Duration::from_secs(10) {
        std::thread::sleep(Duration::from_millis(20));
    }
    assert!(icon_requests.load(Ordering::SeqCst) > 0, "the browser never fetched the declared icon");
    page.evaluate_value("true").unwrap();
    assert!(
        page.observed_response_urls().unwrap().iter().all(|u| !u.ends_with("/icon.png") && !u.ends_with("/favicon.ico")),
        "the browser's icon fetch is not a page dependency"
    );
    page.evaluate_value("fetch('/asset.bin').then(r=>r.arrayBuffer()).then(()=>true)")
        .unwrap();
    // Pump a browser round-trip after the fetch's completion event.
    page.evaluate_value("true").unwrap();
    let urls = vec![format!("{origin}/asset.bin")];
    let first = page.response_evidence(&urls).unwrap();
    assert_eq!(first.responses.len(), 1);
    assert_eq!(
        first.responses[0].body.as_deref(),
        Some(&[0, 255, 13, 128, 42][..])
    );
    assert!(!first.responses[0].ambiguous_url);
    assert_eq!(
        hits.load(Ordering::SeqCst),
        1,
        "body evidence must not make another request"
    );
    page.evaluate_value("fetch('/asset.bin').then(r=>r.arrayBuffer()).then(()=>true)")
        .unwrap();
    page.evaluate_value("true").unwrap();
    let repeated = page.response_evidence(&urls).unwrap();
    assert_eq!(repeated.responses.len(), 2);
    assert!(repeated.responses.iter().all(|r| r.ambiguous_url));
    assert_eq!(
        repeated.responses[0].body.as_deref(),
        Some(&[0, 255, 13, 128, 42][..])
    );
    assert_eq!(
        repeated.responses[1].body.as_deref(),
        Some(&[99, 4, 0, 128][..])
    );
    assert_eq!(hits.load(Ordering::SeqCst), 2);
    assert!(!repeated.changed_during_collection);
    assert!(!repeated.truncated);
    assert_eq!(repeated.responses[0].status, Some(200.0));
    assert_eq!(repeated.responses[0].mime_type, "application/octet-stream");
    // A new document must not borrow response evidence from its predecessor.
    page.goto(&format!("{origin}/next"), "load", Duration::from_secs(15))
        .unwrap();
    let next = page.response_evidence(&urls).unwrap();
    assert!(next.responses.is_empty());
    assert_eq!(next.missing_urls, urls);
    assert_eq!(hits.load(Ordering::SeqCst), 2);
    page.close();
    browser.close();
}

#[test]
fn large_utf8_document_retains_exact_bytes_without_refetch() {
    let env: HashMap<String, String> = std::env::vars().collect();
    let Ok(exe) = discovery::find_browser(&env) else { return; };
    // One non-Latin-1 character makes Blink retain a two-byte string. The
    // inspector buffer must accommodate it even though the UTF-8 body is <16MiB.
    let body = format!("<!doctype html><meta charset=utf-8><title>€</title><!--{}-->", "a".repeat(9 * 1024 * 1024)).into_bytes();
    let served = body.clone();
    let hits = Arc::new(AtomicUsize::new(0));
    let count = hits.clone();
    let origin = http::serve(move |path| {
        (path == "/index.html").then(|| {
            count.fetch_add(1, Ordering::SeqCst);
            ("text/html; charset=utf-8", served.clone())
        })
    });
    let url = format!("{origin}/index.html");
    let Some(mut browser) = launch(&exe) else { return; };
    let mut page = browser.new_page().unwrap();
    page.begin_response_capture().unwrap();
    page.goto(&url, "load", Duration::from_secs(15)).unwrap();
    let evidence = page.response_evidence(&[url]).unwrap();
    let response = &evidence.responses[0];
    assert!(response.unavailable_reason.is_none(), "{:?}", response.unavailable_reason);
    assert_eq!(response.body.as_deref(), Some(body.as_slice()));
    assert_eq!(hits.load(Ordering::SeqCst), 1);
    page.close();
    browser.close();
}

#[test]
fn decoded_text_bodies_match_only_their_served_bytes() {
    let env: HashMap<String, String> = std::env::vars().collect();
    let Ok(exe) = discovery::find_browser(&env) else { return; };
    // Blink reports these as text: the BOM dropped, the Latin-1 byte as U+FFFD.
    let html = b"\xEF\xBB\xBF<!doctype html><link rel=stylesheet href=a.css><p>x</p>".to_vec();
    let css = b"/* caf\xE9 */\r\np{color:red}".to_vec();
    let (served_html, served_css) = (html.clone(), css.clone());
    let origin = http::serve(move |path| match path {
        "/a.css" => Some(("text/css; charset=utf-8", served_css.clone())),
        "/" => Some(("text/html; charset=utf-8", served_html.clone())),
        _ => None,
    });
    let Some(mut browser) = launch(&exe) else { return; };
    let mut page = browser.new_page().unwrap();
    page.begin_response_capture().unwrap();
    page.goto(&format!("{origin}/"), "load", Duration::from_secs(15)).unwrap();
    let urls = vec![format!("{origin}/"), format!("{origin}/a.css")];
    let evidence = page.response_evidence(&urls).unwrap();
    let find = |u: &str| evidence.responses.iter().find(|r| r.url == u).unwrap();
    let (doc, sheet) = (find(&urls[0]), find(&urls[1]));
    assert!(doc.text && sheet.text, "fixture must exercise decoded text bodies");
    assert_ne!(sheet.body.as_deref(), Some(css.as_slice()));
    assert!(doc.body_matches(&html) && sheet.body_matches(&css));
    let mut tampered = css.clone();
    tampered[9] = b'e';
    assert!(!sheet.body_matches(&tampered) && !sheet.body_matches(&html));
    assert!(!doc.body_matches(&html[3..].iter().chain(b" ").copied().collect::<Vec<_>>()));
    page.close();
    browser.close();
}
