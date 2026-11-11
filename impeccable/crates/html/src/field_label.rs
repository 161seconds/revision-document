//! The static engine's reading of whether a form field has a visible label
//! (taste call r5-p30; the browser engines' reading and the decision's
//! wording are in `impeccable_core::browser::field_label`).
//!
//! There is no layout here, so "visible" is what the cascade can say: the
//! label and its ancestors are not `display: none`, `hidden`,
//! `visibility: hidden`, fully transparent or written as screen-reader text.
//! "Right above the field" cannot be measured, so of the unassociated text
//! before a field only a `<label>` element counts; any other text there is
//! not evidence, and the finding keeps its severity.

use crate::background::sv;
use crate::dom::StaticElement;
use crate::quality::is_visually_hidden;
use impeccable_core::browser::field_label::TEXT_LABEL_MAX_CHARS;
use impeccable_core::js;

const NOT_LABEL_TEXT_TAGS: &[&str] =
    &["input", "select", "textarea", "button", "option", "script", "style", "template", "noscript"];
const CONTROL_TAGS: &[&str] = &["input", "select", "textarea", "button", "a"];
const LABEL_CLIMB_STOP_TAGS: &[&str] = &["form", "fieldset", "body", "html", "td", "th", "li", "tr"];
const TEXT_LABEL_MAX_CLIMB: usize = 2;

/// Whether nothing the cascade declares hides `el`.
fn shows(el: &StaticElement<'_>) -> bool {
    if is_visually_hidden(el, el.style()) {
        return false;
    }
    std::iter::successors(Some(*el), |e| e.parent_element()).all(|e| {
        let style = e.style();
        let display = js::to_lower_case(js::trim(sv(style, "display")));
        if display == "none" || (e.get_attribute("hidden").is_some() && display.is_empty()) {
            return false;
        }
        let visibility = js::to_lower_case(js::trim(sv(style, "visibility")));
        if visibility == "hidden" || visibility == "collapse" {
            return false;
        }
        let opacity = js::parse_float(sv(style, "opacity"));
        !(opacity.is_finite() && opacity <= 0.02)
    })
}

/// Whether `root` holds text of its own, outside any control, that shows.
fn shows_text(root: &StaticElement<'_>, field: &StaticElement<'_>) -> bool {
    let mut stack = vec![*root];
    while let Some(el) = stack.pop() {
        if el == *field || NOT_LABEL_TEXT_TAGS.contains(&el.tag_lower().as_str()) {
            continue;
        }
        if !js::trim(&el.direct_text()).is_empty() && shows(&el) {
            return true;
        }
        stack.extend(el.children());
    }
    false
}

fn holds_control(el: &StaticElement<'_>) -> bool {
    let mut stack = el.children();
    while let Some(e) = stack.pop() {
        if CONTROL_TAGS.contains(&e.tag_lower().as_str())
            || e.get_attribute("role").is_some_and(|r| matches!(js::trim(r), "button" | "link"))
            || e.get_attribute("contenteditable").is_some()
        {
            return true;
        }
        stack.extend(e.children());
    }
    false
}

/// A `<label>` with no `for` right before the field, or before a wrapper
/// the field comes first in.
fn label_before(field: &StaticElement<'_>) -> bool {
    let mut cur = *field;
    for _ in 0..=TEXT_LABEL_MAX_CLIMB {
        if let Some(prev) = cur.previous_element_sibling() {
            if prev.tag_lower() != "label" || prev.get_attribute("for").is_some_and(|f| !f.is_empty()) {
                return false;
            }
            let chars = prev.text_content().split_whitespace().collect::<Vec<_>>().join(" ").chars().count();
            return chars > 0 && chars <= TEXT_LABEL_MAX_CHARS && !holds_control(&prev) && shows_text(&prev, field);
        }
        let Some(parent) = cur.parent_element() else {
            return false;
        };
        if LABEL_CLIMB_STOP_TAGS.contains(&parent.tag_lower().as_str()) {
            return false;
        }
        cur = parent;
    }
    false
}

/// Whether a visible label names `field`: a `<label for>`, a `<label>`
/// around it or right before it, or the text `aria-labelledby` points at.
pub fn field_has_visible_label(field: &StaticElement<'_>) -> bool {
    let id = field.id_attr();
    let labelledby: Vec<&str> = field
        .get_attribute("aria-labelledby")
        .map(|v| v.split_whitespace().collect())
        .unwrap_or_default();
    if !id.is_empty() || !labelledby.is_empty() {
        for e in field.doc.all_elements() {
            if e == *field {
                continue;
            }
            let names = !id.is_empty() && e.tag_lower() == "label" && e.get_attribute("for") == Some(id);
            let pointed = !e.id_attr().is_empty() && labelledby.contains(&e.id_attr());
            if (names || pointed) && shows_text(&e, field) {
                return true;
            }
        }
    }
    if field.closest("label").is_some_and(|l| shows_text(&l, field)) {
        return true;
    }
    label_before(field)
}
