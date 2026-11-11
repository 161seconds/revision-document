//! Whether a picture paints under a run of text, read from markup and the
//! cascade alone.
//!
//! The browser engine answers this from layout (`layer_under_text` in
//! `impeccable_core::browser::visual`). This engine has no layout, no
//! `z-index` and no rects, so it reads the one shape a background photograph
//! is written in and that the cascade does carry: a media element, or a box
//! with a raster background, taken out of flow and stretched over its
//! containing block (`position: absolute` with `inset: 0`, every side at 0,
//! or `width` and `height` at 100%), where that containing block holds the
//! text; or a `::before` / `::after` drawn the same way on a box that holds
//! the text. A photo sized to part of its block (a half-width picture) is not
//! read as under the whole run, and is scored like the browser scores it.

use crate::background::{read_own_background_color, sv};
use crate::cascade::StyleValues;
use crate::dom::StaticElement;
use impeccable_core::js;

/// Replaced boxes that paint a picture rather than a colour.
const MEDIA_TAGS: &[&str] = &["img", "picture", "video", "canvas"];

/// Bounds, each a count of DOM hops, and a budget on the whole test. It runs
/// only for a SAFE_TAGS hit whose colour pair the page has not reported yet.
const MAX_LEVELS: usize = 32;
const MAX_SIBLINGS: usize = 32;
const MAX_DEPTH: usize = 6;
const MAX_CHILDREN: usize = 16;
const MAX_NODES: usize = 512;

fn zero_length(value: &str) -> bool {
    matches!(js::trim(value), "0" | "0px" | "0%")
}

/// Whether a box is taken out of flow and stretched over its containing
/// block, the way a background photo is laid under a section's content.
fn stretched_over_its_block(style: &StyleValues) -> bool {
    let position = js::trim(sv(style, "position"));
    if position != "absolute" && position != "fixed" {
        return false;
    }
    let inset = js::trim(sv(style, "inset"));
    (!inset.is_empty() && inset.split_ascii_whitespace().all(zero_length))
        || ["top", "right", "bottom", "left"]
            .iter()
            .all(|side| zero_length(sv(style, side)))
        || (js::trim(sv(style, "width")) == "100%" && js::trim(sv(style, "height")) == "100%")
}

/// Where the descent into a sibling stands with respect to the text.
#[derive(Debug, Clone, Copy, PartialEq)]
enum Block {
    /// No positioned box on the way down yet, so an out-of-flow box here is
    /// laid out against an ancestor of the sibling, which holds the text too.
    Open,
    /// A box on the way down is stretched over a block that holds the text,
    /// and what fills it is under the text.
    Stretched,
}

/// Whether `el`, or a box a few levels inside it, is a picture laid over a
/// block that holds the text. A positioned box that is not stretched ends the
/// descent: everything out of flow inside it is laid out against it, and it
/// is a box beside the text, not around it.
fn stretched_picture_in(
    el: &StaticElement<'_>,
    block: Block,
    depth: usize,
    budget: &mut usize,
) -> bool {
    if *budget == 0 {
        return false;
    }
    *budget -= 1;
    let style = el.style();
    if sv(style, "visibility") == "hidden" {
        return false;
    }
    let block = match block {
        Block::Stretched => Block::Stretched,
        Block::Open if stretched_over_its_block(style) => Block::Stretched,
        Block::Open => {
            let position = js::trim(sv(style, "position"));
            if !position.is_empty() && position != "static" {
                return false;
            }
            Block::Open
        }
    };
    if block == Block::Stretched
        && (MEDIA_TAGS.contains(&el.tag_lower().as_str())
            || js::to_lower_case(sv(style, "backgroundImage")).contains("url(")
            || el.doc.has_pseudo_picture(el.id()))
    {
        return true;
    }
    depth < MAX_DEPTH
        && el
            .children()
            .iter()
            .take(MAX_CHILDREN)
            .any(|child| stretched_picture_in(child, block, depth + 1, budget))
}

/// Whether a background photograph is laid under this element's text: a
/// pseudo-element photo on the element or an ancestor, or a stretched
/// picture beside any ancestor on the way up whose containing block holds
/// the text. The climb stops at the first opaque ancestor fill, which covers
/// whatever lies beneath it, so a link on a white card over a hero photo is
/// still scored on the card.
///
/// Without `z-index` this cannot tell a photo laid beneath the content from
/// one laid over it, and it reads both as beneath: a photo stretched over the
/// text it covers would hide that text, which no page ships.
pub fn picture_under_text(el: &StaticElement<'_>) -> bool {
    let mut budget = MAX_NODES;
    let mut node = *el;
    for _ in 0..MAX_LEVELS {
        if el.doc.has_pseudo_picture(node.id()) {
            return true;
        }
        if read_own_background_color(&node, node.style()).map_or(false, |c| c.alpha_or_one() >= 0.95)
        {
            return false;
        }
        let Some(parent) = node.parent_element() else {
            return false;
        };
        let siblings = parent.children();
        if let Some(index) = siblings.iter().position(|s| s.id() == node.id()) {
            let earlier = siblings[..index].iter().rev().take(MAX_SIBLINGS);
            let later = siblings[index + 1..].iter().take(MAX_SIBLINGS);
            if earlier
                .chain(later)
                .any(|s| stretched_picture_in(s, Block::Open, 0, &mut budget))
            {
                return true;
            }
        }
        node = parent;
    }
    false
}
