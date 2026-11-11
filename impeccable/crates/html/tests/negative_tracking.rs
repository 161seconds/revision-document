//! Integration tests for `extreme-negative-tracking` over the repo fixture:
//! the size-scaled threshold and the CJK exemption.

use impeccable_html::{detect_html_source, DetectHtmlOptions};
use std::path::{Path, PathBuf};

fn repo_root() -> PathBuf {
    std::env::var("IMPECCABLE_PUBLIC_REPO")
        .map(PathBuf::from)
        .unwrap_or_else(|_| Path::new(env!("CARGO_MANIFEST_DIR")).join("../.."))
}

fn tracking_snippets() -> Vec<String> {
    let path = repo_root().join("tests/fixtures/antipatterns/extreme-negative-tracking.html");
    let html = std::fs::read_to_string(&path).expect("fixture");
    detect_html_source(&html, &path, &DetectHtmlOptions::default())
        .into_iter()
        .filter(|f| f.antipattern == "extreme-negative-tracking")
        .map(|f| f.snippet)
        .collect()
}

#[test]
fn flags_only_the_crushed_column() {
    let snippets = tracking_snippets();
    assert_eq!(snippets.len(), 3, "{snippets:?}");
    assert!(
        snippets.iter().all(|s| s.contains("Tracking crushed")),
        "{snippets:?}"
    );
}

#[test]
fn snippet_carries_em_value_and_font_size() {
    let snippets = tracking_snippets();
    assert!(
        snippets
            .iter()
            .any(|s| s.starts_with("letter-spacing: -0.08em at 16px — \"Tracking crushed em")),
        "{snippets:?}"
    );
    assert!(
        snippets
            .iter()
            .any(|s| s.starts_with("letter-spacing: -0.10em at 14px — \"Tracking crushed pixel")),
        "{snippets:?}"
    );
    assert!(
        snippets
            .iter()
            .any(|s| s.starts_with("letter-spacing: -0.10em at 48px — \"Tracking crushed display")),
        "{snippets:?}"
    );
}
