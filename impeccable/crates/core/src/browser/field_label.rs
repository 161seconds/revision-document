//! Whether a form field has a visible label of its own, so its placeholder
//! is a hint and not the field's name (taste call r5-p30: "Report a
//! placeholder as advisory when its field has a visible label (a label
//! element, aria-labelledby text, or a text label right above the field). A
//! placeholder that is the field's only label keeps failing.").
//!
//! A label counts only where a reader sees it: HubSpot's forms keep a
//! `<label for>` on every field and hide it with `display: none`, and there
//! the placeholder is the only name the field shows. `aria-label` is never
//! visible and never counts.

use super::dom::{tag_lower, Dom, ElId};
use super::painted::painted_at_capture;
use crate::js;

/// The longest text, in characters, an unassociated element above a field
/// can hold and still read as that field's label.
pub const TEXT_LABEL_MAX_CHARS: usize = 40;
/// How far above the field, in px, such a label's bottom edge can sit.
pub const TEXT_LABEL_MAX_GAP_PX: f64 = 24.0;
/// How far the label's bottom edge can dip under the field's top edge.
const TEXT_LABEL_OVERLAP_PX: f64 = 4.0;
/// How many wrappers that hold the field first are climbed to find the
/// element before it.
const TEXT_LABEL_MAX_CLIMB: usize = 2;

/// Tags an unassociated text label is written in.
const TEXT_LABEL_TAGS: &[&str] = &["label", "span", "div", "p", "legend", "dt", "strong", "b", "small"];
/// Tags whose text is not label text, and whose subtree is not searched.
const NOT_LABEL_TEXT_TAGS: &[&str] =
    &["input", "select", "textarea", "button", "option", "script", "style", "template", "noscript"];
/// What an element cannot hold and still be a plain text label.
const CONTROL_SELECTOR: &str =
    "input, select, textarea, button, a, [role=\"button\"], [role=\"link\"], [contenteditable]";
/// Boxes the climb for a label above the field does not leave.
const LABEL_CLIMB_STOP_TAGS: &[&str] = &["form", "fieldset", "body", "html", "td", "th", "li", "tr"];

/// Whether `root` shows text of its own: it or a descendant outside any
/// control holds a non-blank text node in a box painted at capture and
/// larger than the 1px square screen-reader text is clipped to.
fn shows_text(dom: &dyn Dom, root: ElId, field: ElId) -> bool {
    let mut stack = vec![root];
    while let Some(el) = stack.pop() {
        if el == field || NOT_LABEL_TEXT_TAGS.contains(&tag_lower(dom, el).as_str()) {
            continue;
        }
        if dom.direct_text_nodes(el).iter().any(|t| !js::trim(t).is_empty()) {
            let r = dom.rect(el);
            if r.width > 1.0 && r.height > 1.0 && painted_at_capture(dom, el) {
                return true;
            }
        }
        stack.extend(dom.children(el));
    }
    false
}

fn all(dom: &dyn Dom, selector: &str) -> Vec<ElId> {
    dom.query_all(None, selector).unwrap_or_default()
}

/// A `<label for>` naming the field, or a `<label>` around it.
fn label_element(dom: &dyn Dom, field: ElId) -> bool {
    let id = dom.attr(field, "id").unwrap_or_default();
    if !id.is_empty()
        && all(dom, "label")
            .into_iter()
            .any(|l| dom.attr(l, "for").as_deref() == Some(id.as_str()) && shows_text(dom, l, field))
    {
        return true;
    }
    dom.closest(field, "label")
        .ok()
        .flatten()
        .is_some_and(|l| shows_text(dom, l, field))
}

/// Text the field's `aria-labelledby` points at.
fn labelledby_text(dom: &dyn Dom, field: ElId) -> bool {
    let Some(ids) = dom.attr(field, "aria-labelledby") else {
        return false;
    };
    let ids: Vec<&str> = ids.split_whitespace().collect();
    if ids.is_empty() {
        return false;
    }
    all(dom, "*").into_iter().any(|e| {
        e != field
            && dom.attr(e, "id").is_some_and(|id| ids.contains(&id.as_str()))
            && shows_text(dom, e, field)
    })
}

/// A short run of plain text right above the field: the element before it
/// (or before a wrapper the field comes first in), holding no control,
/// sitting over the field within [`TEXT_LABEL_MAX_GAP_PX`].
fn text_label_above(dom: &dyn Dom, field: ElId) -> bool {
    let fr = dom.rect(field);
    let mut cur = field;
    for _ in 0..=TEXT_LABEL_MAX_CLIMB {
        if let Some(prev) = dom.previous_element_sibling(cur) {
            if !TEXT_LABEL_TAGS.contains(&tag_lower(dom, prev).as_str()) {
                return false;
            }
            // A `<label for>` belongs to the field it names.
            if dom.attr(prev, "for").is_some_and(|f| !f.is_empty()) {
                return false;
            }
            let text = js::trim(&dom.text_content(prev)).split_whitespace().collect::<Vec<_>>().join(" ");
            let chars = text.chars().count();
            if chars == 0 || chars > TEXT_LABEL_MAX_CHARS {
                return false;
            }
            if !dom.query_all(Some(prev), CONTROL_SELECTOR).unwrap_or_default().is_empty() {
                return false;
            }
            let pr = dom.rect(prev);
            let gap = fr.top - (pr.top + pr.height);
            let overlaps_x = pr.left < fr.left + fr.width && fr.left < pr.left + pr.width;
            return (-TEXT_LABEL_OVERLAP_PX..=TEXT_LABEL_MAX_GAP_PX).contains(&gap)
                && overlaps_x
                && shows_text(dom, prev, field);
        }
        let Some(parent) = dom.parent(cur) else {
            return false;
        };
        if LABEL_CLIMB_STOP_TAGS.contains(&tag_lower(dom, parent).as_str()) {
            return false;
        }
        cur = parent;
    }
    false
}

/// Whether a visible label names `field` (see the module docs).
pub fn field_has_visible_label(dom: &dyn Dom, field: ElId) -> bool {
    label_element(dom, field) || labelledby_text(dom, field) || text_label_above(dom, field)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::browser::fake_dom::FakeDom;

    fn text_el(d: &mut FakeDom, parent: ElId, tag: &str, text: &str, rect: (f64, f64, f64, f64)) -> ElId {
        let el = d.add(Some(parent), tag);
        d.add_text(el, text);
        d.set_rect(el, rect.0, rect.1, rect.2, rect.3);
        el
    }

    fn field(d: &mut FakeDom, parent: ElId, top: f64) -> ElId {
        let el = d.add(Some(parent), "input");
        d.set_rect(el, 0.0, top, 280.0, 40.0);
        el
    }

    #[test]
    fn a_label_for_the_field_counts_only_where_it_shows() {
        // superradiant.co: `<label for>` over the field.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let label = text_el(&mut d, body, "label", "Organization", (0.0, 0.0, 120.0, 20.0));
        d.set_attr(label, "for", "org");
        let input = field(&mut d, body, 28.0);
        d.set_attr(input, "id", "org");
        assert!(field_has_visible_label(&d, input));

        // aisdr.com's HubSpot form: the label is there and not rendered.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let label = text_el(&mut d, body, "label", "Work email", (0.0, 0.0, 0.0, 0.0));
        d.set_attr(label, "for", "email");
        d.set_style(label, "display", "none");
        let input = field(&mut d, body, 28.0);
        d.set_attr(input, "id", "email");
        assert!(!field_has_visible_label(&d, input));

        // Screen-reader text clipped to a 1px square.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let label = text_el(&mut d, body, "label", "Search", (0.0, 0.0, 1.0, 1.0));
        d.set_attr(label, "for", "q");
        let input = field(&mut d, body, 28.0);
        d.set_attr(input, "id", "q");
        assert!(!field_has_visible_label(&d, input));
    }

    #[test]
    fn a_wrapping_label_and_labelledby_text_count() {
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let label = d.add(Some(body), "label");
        d.set_rect(label, 0.0, 0.0, 280.0, 70.0);
        text_el(&mut d, label, "span", "Your name", (0.0, 0.0, 100.0, 20.0));
        let input = field(&mut d, label, 28.0);
        assert!(field_has_visible_label(&d, input));

        // A label that wraps only the field names nothing.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let label = d.add(Some(body), "label");
        d.set_rect(label, 0.0, 0.0, 280.0, 40.0);
        let input = field(&mut d, label, 0.0);
        assert!(!field_has_visible_label(&d, input));

        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let heading = text_el(&mut d, body, "h3", "Billing address", (0.0, 0.0, 200.0, 24.0));
        d.set_attr(heading, "id", "billing");
        let spacer = d.add(Some(body), "hr");
        d.set_rect(spacer, 0.0, 30.0, 280.0, 1.0);
        let input = field(&mut d, body, 200.0);
        d.set_attr(input, "aria-labelledby", "billing");
        assert!(field_has_visible_label(&d, input));
        d.set_attr(input, "aria-labelledby", "missing");
        assert!(!field_has_visible_label(&d, input));
    }

    #[test]
    fn text_right_above_the_field_counts() {
        // pool-web-eight.vercel.app: a `<label>` with no `for`, then the field.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let row = d.add(Some(body), "div");
        text_el(&mut d, row, "label", "Your Name", (0.0, 0.0, 280.0, 24.0));
        let input = field(&mut d, row, 32.0);
        assert!(field_has_visible_label(&d, input));

        // The same text, with the field in a wrapper of its own.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let row = d.add(Some(body), "div");
        text_el(&mut d, row, "div", "Company", (0.0, 0.0, 280.0, 20.0));
        let wrap = d.add(Some(row), "div");
        d.set_rect(wrap, 0.0, 28.0, 280.0, 40.0);
        let input = field(&mut d, wrap, 28.0);
        assert!(field_has_visible_label(&d, input));
    }

    #[test]
    fn what_is_not_a_label_above_the_field_does_not_count() {
        // onco.cc: a paragraph of copy above a search box with `aria-label`.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        text_el(
            &mut d,
            body,
            "p",
            "Every technology, target, product, company and trial in oncology, linked together.",
            (0.0, 0.0, 600.0, 48.0),
        );
        let input = field(&mut d, body, 56.0);
        d.set_attr(input, "aria-label", "Search OnCo");
        assert!(!field_has_visible_label(&d, input));

        // A heading, an icon, a link, text far above, text beside the field.
        for (tag, text, rect) in [
            ("h2", "Send us a message", (0.0, 0.0, 280.0, 24.0)),
            ("svg", "", (0.0, 0.0, 16.0, 16.0)),
            ("a", "Forgot password?", (0.0, 0.0, 280.0, 20.0)),
            ("span", "Newsletter", (0.0, -200.0, 280.0, 20.0)),
            ("span", "Search", (-120.0, 40.0, 100.0, 20.0)),
        ] {
            let mut d = FakeDom::new();
            let (_, body) = d.with_page();
            let row = d.add(Some(body), "div");
            text_el(&mut d, row, tag, text, rect);
            let input = field(&mut d, row, 32.0);
            assert!(!field_has_visible_label(&d, input), "{tag} {text}");
        }

        // The first field's label does not name the second field.
        let mut d = FakeDom::new();
        let (_, body) = d.with_page();
        let row = d.add(Some(body), "div");
        let first = d.add(Some(row), "div");
        d.set_rect(first, 0.0, 0.0, 280.0, 70.0);
        text_el(&mut d, first, "label", "First name", (0.0, 0.0, 280.0, 20.0));
        field(&mut d, first, 28.0);
        let second = d.add(Some(row), "div");
        d.set_rect(second, 0.0, 78.0, 280.0, 40.0);
        let input = field(&mut d, second, 78.0);
        assert!(!field_has_visible_label(&d, input));
    }
}
