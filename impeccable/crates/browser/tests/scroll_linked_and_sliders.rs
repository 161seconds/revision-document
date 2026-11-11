//! Corpus decision r6-t6-hidden-scroll-linked in the URL engine, over
//! `tests/fixtures/antipatterns/`, rendered by an installed browser. Skips
//! cleanly when there is none.
//!
//! - `content-hidden-scroll-linked.html`: a section and a sticky stage whose
//!   opacity a script scrubs with the scroll position sit at 0 with the page
//!   at the top. The scan scrolls to each and sees it show, so they leave the
//!   hidden share; a stalled reveal beside them still counts. With
//!   `#frozen` the script drives nothing and the same page reports.
//! - `content-hidden-unstarted-slider.html`: two sliders with every slide
//!   hidden leave both counts and print a capture note instead of a finding;
//!   a started slider's waiting slides still count.

use std::collections::HashMap;
use std::io::{Read, Write};
use std::net::{TcpListener, TcpStream};
use std::path::{Path, PathBuf};

use impeccable_browser::{detect_url_evidence, origin, replay_url_scan, BrowserEngine, EvidenceRequest};
use impeccable_core::findings::Finding;
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

fn engine() -> Option<BrowserEngine> {
    let env: HashMap<String, String> = std::env::vars().collect();
    if impeccable_browser::discovery::find_browser(&env).is_err() {
        eprintln!("skip: no installed browser found");
        return None;
    }
    Some(BrowserEngine::new(env))
}

fn of<'a>(findings: &'a [Finding], rule: &str) -> Vec<&'a Finding> {
    findings.iter().filter(|f| f.antipattern == rule).collect()
}

#[test]
fn scroll_linked_reveals_leave_the_hidden_share() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/content-hidden-scroll-linked.html");

    let scrubbed = engine.detect_url_scan(&url, &ScanOptions::default()).expect("scan");
    let hidden = of(&scrubbed.findings, "content-hidden-at-rest");
    assert!(hidden.is_empty(), "{hidden:#?}");
    assert!(scrubbed.notes.is_empty(), "{:?}", scrubbed.notes);

    // The same markup with nothing driving it: every section is hidden.
    let frozen = engine.detect_url(&format!("{url}#frozen"), &ScanOptions::default()).expect("scan");
    let hidden: Vec<&str> = of(&frozen, "content-hidden-at-rest").iter().map(|f| f.snippet.as_str()).collect();
    assert_eq!(hidden, vec![FROZEN], "{hidden:#?}");
}

const FROZEN: &str = "71% of page text (706 of 1000 chars) stays at opacity 0 / visibility hidden after reveal handlers ran (e.g. \"Automated material movement\")";

#[test]
fn unstarted_sliders_are_a_capture_note() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let url = format!("http://127.0.0.1:{port}/content-hidden-unstarted-slider.html");
    let scan = engine.detect_url_scan(&url, &ScanOptions::default()).expect("scan");
    let hidden = of(&scan.findings, "content-hidden-at-rest");
    assert!(hidden.is_empty(), "{hidden:#?}");
    assert_eq!(
        scan.notes,
        vec![format!(
            "Capture note: 545 chars of text on {url} sit in sliders that never started (every slide hidden, e.g. \"Stage 1: the opening time trial\"), so content-hidden-at-rest left them out. The page may not have finished loading; scan it again to check that text."
        )]
    );
}

/// The probe's answers are recorded with the capture's hit tests, so a
/// replay of the capture measures what the live scan measured, and prints
/// the same capture note.
#[test]
fn the_probe_and_the_note_replay() {
    let Some(engine) = engine() else { return };
    let port = serve();
    let mut browser = engine.launch().expect("launch");
    for (fixture, shown) in [
        ("content-hidden-scroll-linked.html", vec![true, true, false]),
        ("content-hidden-unstarted-slider.html", vec![]),
    ] {
        let url = format!("http://127.0.0.1:{port}/{fixture}");
        let options = ScanOptions::default();
        let (findings, evidence) =
            detect_url_evidence(&mut browser, &url, &options, "networkidle0", 0, &EvidenceRequest::default())
                .expect("evidence scan");
        // In document order: the scrubbed section, the sticky stage's copy,
        // the stalled block.
        let mut answers: Vec<(u32, bool)> =
            evidence.scan_facts.shown_on_scroll.iter().map(|s| (s.el, s.shown)).collect();
        answers.sort_by_key(|a| a.0);
        assert_eq!(answers.iter().map(|a| a.1).collect::<Vec<_>>(), shown, "{fixture}: {answers:?}");
        let snapshot = evidence.scan_snapshot.as_deref().expect("snapshot");
        let replay = replay_url_scan(&url, snapshot, &evidence.scan_facts, None, &options).expect("replay");
        let replayable: Vec<&Finding> = findings
            .iter()
            .zip(&evidence.origins)
            .filter(|(_, o)| **o == origin::SCAN || **o == origin::CONTENT_HIDDEN)
            .map(|(f, _)| f)
            .collect();
        assert_eq!(replay.findings.iter().collect::<Vec<_>>(), replayable, "{fixture}");
        assert_eq!(replay.capture_notes, evidence.capture_notes, "{fixture}");
        assert_eq!(evidence.capture_notes.is_empty(), fixture.contains("scroll-linked"), "{fixture}");
    }
    browser.close();
}
