//! `radial-spotlight-glow` over the static engine: a declared glow is only a
//! finding when it is prominent — bright against the surface it paints on,
//! not scaled away by opacity, and sitting behind copy.

use impeccable_html::{detect_html_source, DetectHtmlOptions};
use std::path::Path;

fn glow_snippets(body_css: &str, body_html: &str) -> Vec<String> {
    let html = format!(
        "<!DOCTYPE html><html><head><style>{body_css}</style></head><body>{body_html}</body></html>"
    );
    let opts = DetectHtmlOptions::default();
    detect_html_source(&html, Path::new("/nonexistent/dir/x.html"), &opts)
        .into_iter()
        .filter(|f| f.antipattern == "radial-spotlight-glow")
        .map(|f| f.snippet)
        .collect()
}

fn glow_hits(body_css: &str, body_html: &str) -> usize {
    glow_snippets(body_css, body_html).len()
}

const DARK: &str = "body { background-color: #0b0d13; } \
    .glow { width: 900px; height: 600px; }";

#[test]
fn bright_glow_behind_copy_flags() {
    let css = format!(
        "{DARK} .glow {{ background-image: radial-gradient(circle, rgba(0,209,239,0.26), transparent 70%); }}"
    );
    assert_eq!(glow_hits(&css, "<div class=\"glow\"><h2>Headline</h2></div>"), 1);
}

#[test]
fn faint_wash_on_its_own_ground_stays_silent() {
    let css = format!(
        "{DARK} .glow {{ background-image: radial-gradient(circle, rgba(26,189,226,0.10), transparent 70%); }}"
    );
    assert_eq!(glow_hits(&css, "<div class=\"glow\"><h2>Headline</h2></div>"), 0);
}

#[test]
fn pastel_glow_on_a_white_surface_stays_silent() {
    let css = "body { background-color: #ffffff; } \
        .glow { width: 900px; height: 600px; \
        background-image: radial-gradient(circle, rgba(63,227,223,0.20), transparent 65%); }";
    assert_eq!(glow_hits(css, "<div class=\"glow\"><h2>Headline</h2></div>"), 0);
}

#[test]
fn element_opacity_scales_the_glow_away() {
    let css = format!(
        "{DARK} .glow {{ opacity: 0.35; background-image: radial-gradient(circle, rgba(0,209,239,0.38), transparent 70%); }}"
    );
    assert_eq!(glow_hits(&css, "<div class=\"glow\"><h2>Headline</h2></div>"), 0);
}

#[test]
fn a_glow_with_no_copy_over_it_is_surface_treatment() {
    let css = format!(
        "{DARK} .glow {{ background-image: radial-gradient(circle, rgba(0,209,239,0.26), transparent 70%); }}"
    );
    assert_eq!(glow_hits(&css, "<figure class=\"glow\"></figure>"), 0);
}

#[test]
fn an_overlay_layer_inherits_the_copy_of_the_section_it_covers() {
    let css = format!(
        "{DARK} .hero {{ position: relative; background-color: #0b0d13; }} \
         .glow {{ position: absolute; background-image: radial-gradient(circle, rgba(0,209,239,0.26), transparent 70%); }}"
    );
    assert_eq!(
        glow_hits(
            &css,
            "<section class=\"hero\"><h2>Headline</h2><div class=\"glow\"></div></section>"
        ),
        1
    );
}

#[test]
fn an_in_flow_layer_with_no_copy_of_its_own_is_not_behind_text() {
    // The static engine has no layout, so an element in normal flow takes its
    // own band of the page and the copy around it does not sit on the glow.
    // The browser measures the rectangles and can say otherwise.
    let css = format!(
        "{DARK} .hero {{ background-color: #0b0d13; }} \
         .glow {{ background-image: radial-gradient(circle, rgba(0,209,239,0.26), transparent 70%); }}"
    );
    assert_eq!(
        glow_hits(
            &css,
            "<section class=\"hero\"><h2>Headline</h2><div class=\"glow\"></div></section>"
        ),
        0
    );
}

#[test]
fn a_hero_painted_with_a_gradient_is_still_a_measurable_surface() {
    // The commonest build of the pattern: a glow over a hero whose own
    // background is a gradient. The cascade names no color for it, so the
    // mean of its stops is the surface the glow is measured against.
    let css = "body { background-color: #0b0d13; } \
        .hero { position: relative; background-image: linear-gradient(180deg, #0b0d13, #141a2b); } \
        .glow { position: absolute; width: 900px; height: 600px; \
        background-image: radial-gradient(circle, rgba(139,92,246,0.42), transparent 70%); }";
    assert_eq!(
        glow_hits(
            css,
            "<section class=\"hero\"><h1>Headline</h1><div class=\"glow\"></div></section>"
        ),
        1
    );

    // A pale gradient hero swallows the same glow.
    let pale = "body { background-color: #ffffff; } \
        .hero { position: relative; background-image: linear-gradient(180deg, #ecf4f8, #ffffff); } \
        .glow { position: absolute; width: 900px; height: 600px; \
        background-image: radial-gradient(circle, rgba(63,227,223,0.20), transparent 65%); }";
    assert_eq!(
        glow_hits(
            pale,
            "<section class=\"hero\"><h1>Headline</h1><div class=\"glow\"></div></section>"
        ),
        0
    );
}

#[test]
fn a_hero_painted_with_a_photograph_falls_back_to_alpha_and_copy() {
    // Nothing can say what the photo looks like under the glow, so the
    // contrast test drops out and the alpha and the copy decide.
    let css = "body { background-color: #0b0d13; } \
        .hero { position: relative; background-image: url('/hero.jpg'); } \
        .glow { position: absolute; width: 900px; height: 600px; \
        background-image: radial-gradient(circle, rgba(139,92,246,0.42), transparent 70%); }";
    assert_eq!(
        glow_hits(
            css,
            "<section class=\"hero\"><h1>Headline</h1><div class=\"glow\"></div></section>"
        ),
        1
    );

    let wash = css.replace("rgba(139,92,246,0.42)", "rgba(139,92,246,0.10)");
    assert_eq!(
        glow_hits(
            &wash,
            "<section class=\"hero\"><h1>Headline</h1><div class=\"glow\"></div></section>"
        ),
        0
    );
}

#[test]
fn the_brightest_stop_decides_whichever_way_round_it_is_declared() {
    let bright_first = format!(
        "{DARK} .glow {{ background-image: radial-gradient(circle, rgba(120,220,255,0.40) 0%, rgba(20,20,90,0.30) 45%, transparent 75%); }}"
    );
    let bright_second = format!(
        "{DARK} .glow {{ background-image: radial-gradient(circle, rgba(20,20,90,0.30) 0%, rgba(120,220,255,0.40) 45%, transparent 75%); }}"
    );
    let body = "<div class=\"glow\"><h2>Headline</h2></div>";
    assert_eq!(glow_hits(&bright_first, body), 1);
    assert_eq!(glow_hits(&bright_second, body), 1);
}

#[test]
fn a_pale_core_does_not_mask_the_saturated_ring() {
    let css = format!(
        "{DARK} .glow {{ background-image: radial-gradient(circle, rgba(255,228,186,0.08) 0%, rgba(255,90,0,0.40) 45%, transparent 75%); }}"
    );
    let snippets = glow_snippets(&css, "<div class=\"glow\"><h2>Headline</h2></div>");
    assert_eq!(snippets.len(), 1);
    assert!(snippets[0].contains("#ff5a00 a0.40"), "{}", snippets[0]);
}

#[test]
fn the_same_hue_flags_whichever_stop_is_declared_first() {
    for stops in [
        "rgba(255,90,120,0.28) 0%, rgba(255,90,120,0.12) 45%",
        "rgba(255,90,120,0.12) 0%, rgba(255,90,120,0.28) 45%",
    ] {
        let css = format!(
            "{DARK} .glow {{ background-image: radial-gradient(circle, {stops}, transparent 75%); }}"
        );
        let snippets = glow_snippets(&css, "<div class=\"glow\"><h2>Headline</h2></div>");
        assert_eq!(snippets.len(), 1, "{stops}");
        assert!(snippets[0].contains("#ff5a78 a0.28"), "{}", snippets[0]);
    }
}

#[test]
fn a_faint_decorative_layer_above_the_glow_is_measured_not_skipped() {
    // The pastel-on-white wash stays silent with a faint fade in its hero, as
    // it does without one.
    let css = "body { background-color: #ffffff; } \
        .host { position: relative; \
        background-image: radial-gradient(circle at 50% 0%, rgba(0,0,0,0.04), transparent 70%); } \
        .bare { position: relative; } \
        .glow { position: absolute; width: 900px; height: 600px; \
        background-image: radial-gradient(circle, rgba(63,227,223,0.20), transparent 65%); }";
    let html = "<section class=\"host\"><h1>Headline</h1><div class=\"glow\"></div></section>\
        <section class=\"bare\"><h1>Headline</h1><div class=\"glow\"></div></section>";
    assert_eq!(glow_hits(css, html), 0);

    // A dark translucent fade over a dark page keeps the ground dark, and a
    // bright glow in it still flags.
    let dark = "body { background-color: #0b0d13; } \
        .host { position: relative; background-image: linear-gradient(180deg, rgba(20,26,43,0.6), transparent); } \
        .glow { position: absolute; width: 900px; height: 600px; \
        background-image: radial-gradient(circle, rgba(139,92,246,0.42), transparent 70%); }";
    assert_eq!(
        glow_hits(
            dark,
            "<section class=\"host\"><h1>Headline</h1><div class=\"glow\"></div></section>"
        ),
        1
    );
}

#[test]
fn a_glow_reads_the_layers_beneath_it_in_its_own_value() {
    let css = format!(
        "{DARK} .glow {{ background-color: #0b0d13; background-image: radial-gradient(circle, rgba(63,227,223,0.20), transparent 65%), linear-gradient(180deg, #ecf4f8, #ffffff); }}"
    );
    assert_eq!(glow_hits(&css, "<div class=\"glow\"><h2>Headline</h2></div>"), 0);
}
