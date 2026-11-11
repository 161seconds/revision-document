//! `clipped-overflow-container` over its fixture: every container in the
//! flag column is reported and named with the child it cuts, and no
//! container in the pass column is.

use impeccable_html::{detect_html_source, DetectHtmlOptions};
use std::path::{Path, PathBuf};

fn repo_root() -> PathBuf {
    std::env::var("IMPECCABLE_PUBLIC_REPO")
        .map(PathBuf::from)
        .unwrap_or_else(|_| Path::new(env!("CARGO_MANIFEST_DIR")).join("../.."))
}

fn snippets() -> Vec<String> {
    let path = repo_root().join("tests/fixtures/antipatterns/clipped-overflow-container.html");
    let src = std::fs::read_to_string(&path).expect("fixture");
    detect_html_source(&src, &path, &DetectHtmlOptions::default())
        .into_iter()
        .filter(|f| f.antipattern == "clipped-overflow-container")
        .map(|f| f.snippet)
        .collect()
}

#[test]
fn flag_column_containers_are_reported_with_the_child_they_cut() {
    let snippets = snippets();
    for (container, child) in [
        ("flag-overflow-hidden", "ul.pop"),
        ("flag-overflow-clip", "span.pop"),
        ("flag-overflow-negative", "span.tip-negative"),
        ("flag-overflow-right", "div.flyout"),
        ("flag-shadow-utility", "div.pop.bg-white.shadow-lg"),
        ("flag-overlay-surface", "div.pop.modal-overlay"),
        ("flag-rail-tooltip", "span.rail-tooltip"),
        // Nested clips: the row nearest each layer owns it, and the second
        // row is its own finding rather than one the shell absorbs.
        ("flag-nested-row", "span.tip-negative"),
        ("flag-nested-note", "span.tip-second"),
        ("flag-translated-menu", "div.translated-menu"),
        // An empty menu layer is still a menu, not an ornament.
        ("flag-empty-menu", "div.empty-menu"),
        // An open native dialog is a dialog without the role.
        ("flag-native-dialog", "dialog.pop.native-dialog"),
    ] {
        let want = format!("clips positioned {child}");
        assert!(
            snippets
                .iter()
                .any(|s| s.contains(container) && s.ends_with(&want)),
            "expected {container} reported as \"{want}\", got {snippets:#?}"
        );
    }
}

#[test]
fn pass_column_containers_are_not_reported() {
    let snippets = snippets();
    for container in [
        "pass-hidden-no-abs",
        "pass-visible-abs",
        "pass-scroll-abs",
        "pass-contained-abs",
        "pass-button-shine",
        "pass-crop-photo",
        "pass-contained-overlay",
        "pass-carousel-viewport",
        "pass-fisheye-list",
        "pass-split-container",
        "pass-contents-shell",
        "pass-media-bleed",
        "pass-corner-ticks",
        "pass-hover-sheen",
        "pass-news-band",
        "pass-x-clip",
        "pass-swiper-rail",
        "pass-swap-reveal",
        // r6-t1: a layer that is not a popover is cut on purpose.
        "pass-ribbon-notch",
        "pass-masthead-curve",
        "pass-unnamed-dropdown",
        "pass-closed-dialog",
        "pass-modal-dialog",
        // The shell around two nested clips: the nearer clip owns each layer.
        "nested-outer-clip",
    ] {
        assert!(
            !snippets.iter().any(|s| s.contains(container)),
            "{container} should not be reported, got {snippets:#?}"
        );
    }
}
