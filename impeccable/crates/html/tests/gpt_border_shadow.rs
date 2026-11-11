//! `gpt-thin-border-wide-shadow` in the file scan: the hairline-and-halo pair
//! is reported only where a row of sibling cards repeats it.

use impeccable_html::{detect_html_source, DetectHtmlOptions};
use std::path::Path;

fn snippets(html: &str) -> Vec<String> {
    detect_html_source(
        html,
        Path::new("/tmp/gpt-border-shadow.html"),
        &DetectHtmlOptions::default(),
    )
    .into_iter()
    .filter(|f| f.antipattern == "gpt-thin-border-wide-shadow")
    .map(|f| f.snippet)
    .collect()
}

/// `n` sibling cards, each with a hairline on every side and `shadow`.
fn row(n: usize, shadow: &str) -> String {
    let card = format!(
        "<div class=\"card\" style=\"width:180px;height:140px;border:1px solid #e5e7eb;box-shadow:{shadow}\">Card</div>"
    );
    format!(
        "<!DOCTYPE html><html><body><div class=\"row\">{}</div></body></html>",
        card.repeat(n)
    )
}

fn repo_root() -> std::path::PathBuf {
    std::env::var("IMPECCABLE_PUBLIC_REPO")
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|_| Path::new(env!("CARGO_MANIFEST_DIR")).join("../.."))
}

#[test]
fn a_row_of_three_flags_and_a_pair_does_not() {
    let halo = "0 0 40px rgba(15,23,42,0.18)";
    assert!(snippets(&row(1, halo)).is_empty());
    assert!(snippets(&row(2, halo)).is_empty());
    assert_eq!(
        snippets(&row(3, halo)),
        vec![
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row"
        ]
    );
}

#[test]
fn a_row_lit_from_above_counts() {
    // Every step of every mainstream elevation scale casts a y-offset, so a
    // repeated drop shadow is the population the rule is named for.
    for shadow in [
        "0 8px 40px rgba(15,23,42,0.22)",
        "0 30px 60px -12px rgba(15,23,42,0.35)",
    ] {
        assert_eq!(
            snippets(&row(3, shadow)).len(),
            3,
            "{shadow} is a wide shadow on every card of the row"
        );
    }
}

#[test]
fn tight_and_inset_shadows_stay_silent() {
    for shadow in [
        "0 0 24px rgba(15,23,42,0.18)",
        "0 8px 24px rgba(15,23,42,0.22)",
        // A negative spread pulls the blurred shape in: these are tight lifts
        // under the box, 20px and 14px once the spread is taken off.
        "0 30px 60px -40px rgba(15,23,42,0.35)",
        "0 18px 40px -26px rgba(0,0,0,0.95)",
        "inset 0 0 40px rgba(15,23,42,0.18)",
        "inset 0 8px 40px rgba(15,23,42,0.18)",
    ] {
        assert!(
            snippets(&row(4, shadow)).is_empty(),
            "{shadow} should not read as the repeated signature"
        );
    }
}

#[test]
fn a_row_of_cards_with_different_tags_is_not_a_row() {
    let html = "<!DOCTYPE html><html><body><div class=\"row\">\
<div style=\"border:1px solid #e5e7eb;box-shadow:0 0 40px rgba(15,23,42,0.18)\">A</div>\
<section style=\"border:1px solid #e5e7eb;box-shadow:0 0 40px rgba(15,23,42,0.18)\">B</section>\
<aside style=\"border:1px solid #e5e7eb;box-shadow:0 0 40px rgba(15,23,42,0.18)\">C</aside>\
</div></body></html>";
    assert!(snippets(html).is_empty());
}

const HAIRLINE_HALO: &str = "border:1px solid #e5e7eb;box-shadow:0 0 40px rgba(15,23,42,0.18)";

#[test]
fn same_tag_boxes_of_very_different_sizes_are_not_a_row() {
    // A sidebar, a hero panel and a footer card under one wrapper: same tag,
    // same treatment, declared sizes nothing alike. A browser scan compares
    // rects here; the file scan compares the pixel lengths the boxes declare.
    let html = format!(
        "<!DOCTYPE html><html><body><div class=\"page\">\
<div style=\"width:240px;height:720px;{HAIRLINE_HALO}\">Sidebar</div>\
<div style=\"width:960px;height:320px;{HAIRLINE_HALO}\">Hero</div>\
<div style=\"width:320px;height:96px;{HAIRLINE_HALO}\">Footer</div>\
</div></body></html>"
    );
    assert!(snippets(&html).is_empty());

    // Declared within tolerance, the same three are one row.
    let html = format!(
        "<!DOCTYPE html><html><body><div class=\"row\">\
<div style=\"width:168px;height:80px;{HAIRLINE_HALO}\">A</div>\
<div style=\"width:180px;height:88px;{HAIRLINE_HALO}\">B</div>\
<div style=\"width:192px;height:96px;{HAIRLINE_HALO}\">C</div>\
</div></body></html>"
    );
    assert_eq!(snippets(&html).len(), 3);
}

#[test]
fn cards_wrapped_in_grid_items_are_a_row() {
    let card = format!("<div class=\"card\" style=\"{HAIRLINE_HALO}\">Card</div>");
    for (open, close) in [
        ("<a href=\"#\">", "</a>"),
        ("<li><a href=\"#\">", "</a></li>"),
    ] {
        let cell = format!("{open}{card}{close}");
        let html = format!(
            "<!DOCTYPE html><html><body><ul class=\"grid\">{}</ul></body></html>",
            cell.repeat(3)
        );
        assert_eq!(snippets(&html).len(), 3, "{open} cells");
    }
}

#[test]
fn panels_repeated_one_per_article_are_a_row() {
    // The panels sit at the same depth of each article but not at the same
    // index: the middle article puts its panel first.
    let panel = "<figure style=\"margin:0;border:1px solid rgba(15,126,126,0.35);box-shadow:inset 0 1px 0 rgba(255,255,255,0.04), 0 30px 60px -12px rgba(8,33,25,0.6)\"></figure>";
    let html = format!(
        "<!DOCTYPE html><html><body><div class=\"stack\">\
<article><p>Copy</p><div class=\"viz\">{panel}</div></article>\
<article><div class=\"viz\">{panel}</div><p>Copy</p></article>\
<article><p>Copy</p><div class=\"viz\">{panel}</div></article>\
</div></body></html>"
    );
    assert_eq!(
        snippets(&html),
        vec!["1px border + 60px shadow blur, repeated across the row"; 3]
    );
}

#[test]
fn a_lone_panel_among_repeated_articles_stays_silent() {
    let html = format!(
        "<!DOCTYPE html><html><body><div class=\"stack\">\
<article><p>Copy</p><div class=\"viz\"><figure style=\"{HAIRLINE_HALO}\"></figure></div></article>\
<article><p>Copy</p><div class=\"viz\"><figure></figure></div></article>\
<article><p>Copy</p><div class=\"viz\"><figure></figure></div></article>\
</div></body></html>"
    );
    assert!(snippets(&html).is_empty());
}

#[test]
fn the_row_walk_climbs_at_most_two_wrappers() {
    let cell = format!(
        "<li><a href=\"#\"><span><div style=\"{HAIRLINE_HALO}\">Card</div></span></a></li>"
    );
    let html = format!(
        "<!DOCTYPE html><html><body><ul class=\"grid\">{}</ul></body></html>",
        cell.repeat(3)
    );
    assert!(snippets(&html).is_empty());
}

/// A nav bar of three items, each holding a trigger link and a flyout that
/// wears the pair and opens on hover. `flyout_css` joins the flyout's rule
/// and `flyout_attrs` goes on each flyout element.
fn nav_flyouts(flyout_css: &str, flyout_attrs: &str) -> String {
    let item = format!(
        "<li class=\"item\"><a href=\"#\">Topic</a><div class=\"flyout\"{flyout_attrs}><a href=\"#\">Link</a></div></li>"
    );
    format!(
        "<!DOCTYPE html><html><head><style>\
.item{{position:relative}}\
.flyout{{position:absolute;top:32px;left:0;width:320px;height:200px;background:#fff;border:1px solid #e5e7eb;box-shadow:0 20px 50px rgba(15,23,42,0.18);{flyout_css}}}\
.item:hover .flyout{{opacity:1;visibility:visible;display:block}}\
</style></head><body><nav><ul class=\"nav\">{}</ul></nav></body></html>",
        item.repeat(3)
    )
}

#[test]
fn hidden_per_item_flyouts_stay_silent() {
    // Shown at rest, the three flyouts read as one row through their
    // wrappers, so the silence below comes from the visibility gate.
    assert_eq!(snippets(&nav_flyouts("", "")).len(), 3);
    for (css, attrs) in [
        ("opacity:0;visibility:hidden;transform:translateY(8px)", ""),
        ("opacity:0;pointer-events:none", ""),
        ("visibility:hidden", ""),
        ("display:none", ""),
        ("", " style=\"display:none\""),
        ("", " hidden"),
    ] {
        assert!(
            snippets(&nav_flyouts(css, attrs)).is_empty(),
            "flyouts closed with `{css}{attrs}` should stay silent"
        );
    }
}

#[test]
fn a_hidden_popover_is_not_a_row_mate() {
    let card = format!("<div class=\"card\" style=\"{HAIRLINE_HALO}\">Card</div>");
    let popover = format!(
        "<div class=\"card\" style=\"position:absolute;opacity:0;{HAIRLINE_HALO}\">Menu</div>"
    );
    let page = |cells: &str| {
        format!("<!DOCTYPE html><html><body><div class=\"row\">{cells}</div></body></html>")
    };
    assert!(snippets(&page(&format!("{card}{card}{popover}"))).is_empty());
    // A third card that shows makes the row; the popover reports nothing.
    assert_eq!(
        snippets(&page(&format!("{card}{card}{popover}{card}"))).len(),
        3
    );
    // A whole row inside a closed container shows nothing at rest.
    let closed = format!(
        "<!DOCTYPE html><html><body><div hidden><div class=\"row\">{}</div></div></body></html>",
        card.repeat(3)
    );
    assert!(snippets(&closed).is_empty());
}

#[test]
fn a_row_staged_for_a_scroll_reveal_still_counts() {
    // Before a scroll reveal runs, the content sits transparent or hidden in
    // the flow. A visitor sees it by scrolling, so it is still a row.
    let panel = format!("<figure style=\"{HAIRLINE_HALO}\"></figure>");
    let articles =
        format!("<article class=\"reveal\"><p>Copy</p><div class=\"viz\">{panel}</div></article>")
            .repeat(3);
    let html = format!(
        "<!DOCTYPE html><html><head><style>.reveal{{opacity:0;transform:translateY(18px)}}</style></head>\
<body><div class=\"stack\">{articles}</div></body></html>"
    );
    assert_eq!(snippets(&html).len(), 3);
    for staging in ["opacity:0", "visibility:hidden"] {
        let card = format!("<div class=\"card\" style=\"{staging};{HAIRLINE_HALO}\">Card</div>");
        let html = format!(
            "<!DOCTYPE html><html><body><div class=\"row\">{}</div></body></html>",
            card.repeat(3)
        );
        assert_eq!(snippets(&html).len(), 3, "cards staged with {staging}");
    }
}

#[test]
fn a_card_deep_in_a_long_list_still_finds_its_row_mates() {
    let filler = "<div class=\"filler\">Filler</div>".repeat(400);
    let card = "<div class=\"card\" style=\"border:1px solid #e5e7eb;box-shadow:0 0 40px rgba(15,23,42,0.18)\">Card</div>";
    let html = format!(
        "<!DOCTYPE html><html><body><div class=\"row\">{filler}{}</div></body></html>",
        card.repeat(3)
    );
    assert_eq!(snippets(&html).len(), 3);
}

#[test]
fn fixture_flag_and_pass_columns() {
    let fixture = repo_root().join("tests/fixtures/antipatterns/gpt-thin-border-wide-shadow.html");
    let html = std::fs::read_to_string(&fixture).unwrap();
    let found: Vec<String> = detect_html_source(&html, &fixture, &DetectHtmlOptions::default())
        .into_iter()
        .filter(|f| f.antipattern == "gpt-thin-border-wide-shadow")
        .map(|f| f.snippet)
        .collect();
    // The five flag rows, and from the pass column only the dark row: a file
    // scan reads no painted surface, so it cannot tell a black halo on a
    // near-black ground, or a hairline in the card's own colour, from one that
    // shows. The browser test pins that the URL engine drops that row too.
    assert_eq!(
        found,
        vec![
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 48px shadow blur, repeated across the row",
            "1px border + 48px shadow blur, repeated across the row",
            "1px border + 48px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 60px shadow blur, repeated across the row",
            "1px border + 60px shadow blur, repeated across the row",
            "1px border + 60px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
            "1px border + 40px shadow blur, repeated across the row",
        ],
        "fixture columns moved"
    );
}
