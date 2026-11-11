//! The shared half of decision r4-p17-nested-cards-embedded-content: how both
//! engines read the controls inside a box that might frame embedded content
//! (a figure with its caption, a monospace output block, a media player).
//!
//! The decision skips a box only when the embedded content is its main child:
//! "Inner boxes that hold ordinary text and controls still report." So each
//! embedded-content reading also asks what else the box holds. A figure's
//! other text must be caption-length with no control outside the figure, an
//! output block may carry no control but its own chrome (a copy button, an
//! icon button), and a player's controls must all be the player's own.

use crate::js;

/// Most non-whitespace characters a caption (the text beside a figure, or a
/// player's title and time) may hold.
pub const CAPTION_MAX_CHARS: usize = 140;

/// What a control inside a box does, as far as these readings care.
#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum Control {
    /// A button (`<button>`, `role="button"`, a button-type input).
    Button,
    /// A seek control: `role="slider"` or a range input.
    Seek,
    /// Any other field: a text input, a select, a switch, a tab.
    Field,
}

/// The control an element is, from its tag, its `type` and its `role`, or
/// `None` when it is not one (a hidden input is not a control).
pub fn control_of(tag: &str, input_type: Option<&str>, role: Option<&str>) -> Option<Control> {
    if let Some(role) = role {
        for token in role.split_ascii_whitespace() {
            match js::to_lower_case(token).as_str() {
                "slider" => return Some(Control::Seek),
                "button" => return Some(Control::Button),
                "switch" | "checkbox" | "radio" | "combobox" | "tab" | "textbox" | "searchbox"
                | "spinbutton" => return Some(Control::Field),
                _ => {}
            }
        }
    }
    match tag {
        "button" => Some(Control::Button),
        "select" | "textarea" => Some(Control::Field),
        "input" => {
            let kind = input_type.map(|t| js::to_lower_case(js::trim(t))).unwrap_or_default();
            match kind.as_str() {
                "hidden" => None,
                "range" => Some(Control::Seek),
                "button" | "submit" | "reset" | "image" => Some(Control::Button),
                _ => Some(Control::Field),
            }
        }
        _ => None,
    }
}

/// Words a media player's own buttons are named with.
const MEDIA_WORDS: [&str; 24] = [
    "play", "pause", "stop", "mute", "unmute", "volume", "sound", "skip", "forward", "fast",
    "rewind", "replay", "back", "previous", "prev", "next", "seek", "speed", "playback",
    "fullscreen", "full", "exit", "captions", "subtitles",
];

fn first_word(name: &str) -> String {
    js::to_lower_case(js::trim(name))
        .split(|c: char| !c.is_alphanumeric())
        .find(|w| !w.is_empty())
        .unwrap_or("")
        .to_string()
}

/// A play or pause button's name.
pub fn is_play_name(name: &str) -> bool {
    matches!(first_word(name).as_str(), "play" | "pause")
}

/// A button a player draws for itself: named with a media word, or unnamed
/// (an icon button).
pub fn is_media_control_name(name: &str) -> bool {
    let word = first_word(name);
    word.is_empty() || MEDIA_WORDS.contains(&word.as_str())
}

/// A copy button's name.
pub fn is_copy_name(name: &str) -> bool {
    matches!(first_word(name).as_str(), "copy" | "copied")
}

/// A control a code block or a terminal carries as its own chrome: a button
/// named as a copy button, or an icon button with no text of its own (a copy
/// icon, a "more options" menu). A button that shows a label (Save,
/// Upgrade) is an ordinary control.
pub fn is_output_chrome(kind: Control, name: &str, own_text: &str) -> bool {
    kind == Control::Button && (is_copy_name(name) || visible_chars(own_text) == 0)
}

/// Non-whitespace characters in `text`.
pub fn visible_chars(text: &str) -> usize {
    text.chars().filter(|c| !c.is_whitespace()).count()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn controls_and_names() {
        assert_eq!(control_of("button", None, None), Some(Control::Button));
        assert_eq!(control_of("div", None, Some("slider")), Some(Control::Seek));
        assert_eq!(control_of("input", Some("range"), None), Some(Control::Seek));
        assert_eq!(control_of("input", Some("hidden"), None), None);
        assert_eq!(control_of("input", None, None), Some(Control::Field));
        assert_eq!(control_of("div", None, Some("switch")), Some(Control::Field));
        assert_eq!(control_of("div", None, None), None);
        assert!(is_play_name("Play intro"));
        assert!(is_play_name(" pause "));
        assert!(!is_play_name("Playground"));
        assert!(is_media_control_name(""));
        assert!(is_media_control_name("Mute audio"));
        assert!(!is_media_control_name("Choose"));
        assert!(is_copy_name("Copy code"));
        assert!(!is_copy_name("Upgrade"));
        assert!(is_output_chrome(Control::Button, "More options", ""));
        assert!(is_output_chrome(Control::Button, "Copy", "Copy"));
        assert!(!is_output_chrome(Control::Button, "Upgrade", "Upgrade"));
        assert!(!is_output_chrome(Control::Field, "", ""));
        assert_eq!(visible_chars(" a b\nc "), 3);
    }
}
