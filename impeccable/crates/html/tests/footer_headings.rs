//! `skipped-heading` and footer column titles in the static engine
//! (r5-p29-skipped-heading-footer-titles), as in the URL engine: a skip into
//! a footer is chrome; a skip after a footer's first heading reports when
//! that heading itself skipped in (a column title, not a closing call to
//! action).

use impeccable_html::{detect_html_source, DetectHtmlOptions};
use std::path::Path;

fn skips(body: &str) -> Vec<String> {
    let html = format!("<!DOCTYPE html><html><head></head><body>{body}</body></html>");
    detect_html_source(&html, Path::new("/tmp/footer-headings.html"), &DetectHtmlOptions::default())
        .into_iter()
        .filter(|f| f.antipattern == "skipped-heading")
        .map(|f| f.snippet)
        .collect()
}

#[test]
fn a_footer_that_opens_on_a_column_title_reports_the_next_skip() {
    assert_eq!(
        skips("<h2>Ready to start?</h2><footer><h4>Company</h4><h6>Legal</h6></footer>"),
        vec!["<h4> \"Company\" followed by <h6> \"Legal\" (missing h5)"]
    );
    // A footer heading that opens the page continues no outline.
    assert_eq!(
        skips("<footer><h4>Company</h4><h6>Legal</h6></footer>"),
        vec!["<h4> \"Company\" followed by <h6> \"Legal\" (missing h5)"]
    );
    // A closing call to action inside the footer still excuses the titles.
    assert!(skips("<h1>Energy</h1><footer><h2>Ready to level up?</h2><h4>Products</h4><h4>Company</h4></footer>").is_empty());
}
