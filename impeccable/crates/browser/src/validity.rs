//! Whether a loaded page is the site, or something standing in front of it.
//!
//! A bot challenge, a WAF block page, or an HTTP error page is a real page the
//! rules can run over, and a challenge page is small enough to come back
//! clean. A scan of it reports on the wrong page and exits 0, which reads as
//! "this site is fine". The URL engine classifies the page right after
//! navigation and refuses to report on a blocked one, so a clean result
//! always describes the site that was asked about.
//!
//! The decision is pure ([`classify`]) over two inputs: the main document's
//! HTTP response as CDP saw it, and a small in-page probe ([`probe_js`]).
//! Header and HTTP-status signals stand alone. Titles and DOM markers only
//! count on a small page, because a real page can carry a captcha widget on a
//! form or be titled "Access denied" in a CMS without being a block page.
//! A known bot manager's challenge sheet showing over the viewport counts on
//! any page ([`CHALLENGE_OVERLAYS`]): it is laid over a page already rendered
//! behind it.
//!
//! The probe also names the known consent managers ([`crate::consent`]) whose
//! banner is showing, how much visible text sits inside them, and what content
//! lies outside them. It runs before the scan hides those banners, so a page
//! that is nothing but a consent wall (hiding the manager would leave next to
//! nothing: no more than a line of text, no form control, no sizable image)
//! is refused as one, instead of being scanned empty and reported clean. A
//! short page that carries an ordinary banner (a sign-in form, a splash page,
//! an image-first portfolio) is a page, and is scanned. With the banners kept
//! (`--no-consent-hiding`) the gate is off: that scan reads the banner, which
//! is what the flag asks for.

use serde_json::{json, Value};

/// Challenge pages are short. A page with more visible text than this is
/// treated as content even when its title or a marker looks like a challenge.
pub const SMALL_PAGE_CHARS: u64 = 3000;

/// A page with a known consent manager showing is a consent wall when fewer
/// than this many visible characters lie outside the manager's roots (a
/// preference center alone can run past [`SMALL_PAGE_CHARS`], so the page's
/// total is not the test),
/// nothing else shows outside them (no form control and no image, video or
/// frame of 10,000 square pixels or more, see [`crate::consent`]), and the
/// manager holds at least [`CONSENT_WALL_MIN_CHARS`] characters itself.
pub const CONSENT_WALL_OUTSIDE_CHARS: u64 = 20;
pub const CONSENT_WALL_MIN_CHARS: u64 = 100;

/// Titles challenge and block pages use, lowercased and trimmed. Matched by
/// prefix, so "Access Denied" also covers "Access Denied - Reference #18...".
const CHALLENGE_TITLE_PREFIXES: &[&str] = &[
    "just a moment",
    "attention required! | cloudflare",
    "checking your browser",
    "human verification",
    "access denied",
    "access to this page has been denied",
    "pardon our interruption",
    "are you a robot",
    "robot or human",
    "please verify you are a human",
    "verify you are human",
    "bot verification",
    "security check",
    "you have been blocked",
    "request rejected",
    "ddos-guard",
    "one more step",
    "403 forbidden",
    "radware bot manager",
    "captcha",
];

/// Hosts that only serve challenges. A page that ends up on one of them after
/// redirects is a challenge whatever its title says.
const CHALLENGE_HOSTS: &[&str] = &["perfdrive.com", "captcha-delivery.com"];

/// DOM markers of challenge widgets that fill a page (not inline form
/// captchas). Each entry is `(selector, label)`; the probe reports the labels
/// of the selectors that match.
pub const CHALLENGE_MARKERS: &[(&str, &str)] = &[
    ("#challenge-form, #challenge-running, #cf-challenge-running", "cloudflare-challenge"),
    ("#px-captcha", "perimeterx-captcha"),
    ("iframe[src*='captcha-delivery.com']", "datadome-captcha"),
    ("iframe[src*='_Incapsula_Resource']", "imperva-incapsula"),
    ("#sec-if-cpt-container, #sec-cpt-if", "akamai-challenge"),
    ("#captcha-container[class*='amzn'], awswaf-captcha", "aws-waf-captcha"),
    (".geetest_holder, #nc_1_wrapper, #aliyunCaptcha-sliding-wrapper", "slider-captcha"),
];

/// Challenge sheets a bot manager lays over the real page it has already
/// rendered, so the page behind is a full page and the small-page gate never
/// applies. Each entry is `(selector, label)`; one counts only while it is
/// showing and covers at least [`CHALLENGE_OVERLAY_MIN_COVER`] of the
/// viewport. HUMAN Security (formerly PerimeterX) serves its "Press & hold"
/// check as `iframe#px-captcha-modal`, fixed over the whole viewport at
/// z-index 2147483647 (target.com, run 28 captures 4166, 4168, 4170, 4172,
/// whose pages load `client.px-cloud.net` as `script#humanSensor`).
pub const CHALLENGE_OVERLAYS: &[(&str, &str)] = &[("#px-captcha-modal, #px-captcha-wrapper", "human-press-and-hold")];

/// The share of the viewport a challenge overlay covers before it stands in
/// front of the page.
pub const CHALLENGE_OVERLAY_MIN_COVER: f64 = 0.5;

/// The in-page probe: title, visible text length, final URL, which
/// challenge markers are present, which challenge overlays are showing over
/// the page, and which consent managers are showing with the visible text
/// inside them. Read-only; returns a plain object.
pub fn probe_js() -> String {
    let markers: Vec<Value> = CHALLENGE_MARKERS
        .iter()
        .map(|(selector, label)| json!([selector, label]))
        .collect();
    let overlays: Vec<Value> = CHALLENGE_OVERLAYS
        .iter()
        .map(|(selector, label)| json!([selector, label]))
        .collect();
    format!(
        r#"(() => {{
  const markers = {markers};
  const found = [];
  for (const [selector, label] of markers) {{
    try {{ if (document.querySelector(selector)) found.push(label); }} catch (e) {{}}
  }}
  const overlayMarkers = {overlays};
  const overlays = [];
  const vw = window.innerWidth || 0, vh = window.innerHeight || 0;
  for (const [selector, label] of overlayMarkers) {{
    try {{
      for (const el of document.querySelectorAll(selector)) {{
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) <= 0.02) continue;
        // An ancestor can hide it too (a wrapper at opacity 0 or display: none).
        try {{ if (el.checkVisibility && !el.checkVisibility({{ opacityProperty: true, visibilityProperty: true }})) continue; }} catch (e) {{}}
        const r = el.getBoundingClientRect();
        const w = Math.max(0, Math.min(r.right, vw) - Math.max(r.left, 0));
        const h = Math.max(0, Math.min(r.bottom, vh) - Math.max(r.top, 0));
        if (vw > 0 && vh > 0 && (w * h) / (vw * vh) >= {cover}) {{ overlays.push(label); break; }}
      }}
    }} catch (e) {{}}
  }}
  {consent}
  const text = (document.body && document.body.innerText) || '';
  return {{
    title: String(document.title || ''),
    textChars: text.replace(/\s+/g, ' ').trim().length,
    href: String(location.href || ''),
    markers: found,
    overlays,
    consent,
    consentChars,
    consentShadowChars,
    consentPageShadowChars,
    consentFrames,
    consentOutside,
  }};
}})()"#,
        markers = Value::Array(markers),
        overlays = Value::Array(overlays),
        cover = CHALLENGE_OVERLAY_MIN_COVER,
        consent = crate::consent::probe_fragment(),
    )
}

/// What the probe saw in the page.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct PageProbe {
    pub title: String,
    pub text_chars: u64,
    pub href: String,
    pub markers: Vec<String>,
    /// Challenge overlays ([`CHALLENGE_OVERLAYS`]) showing over the page.
    pub overlays: Vec<String>,
    /// Known consent managers whose banner was showing, before any was hidden.
    pub consent: Vec<String>,
    /// Visible characters inside those managers' roots.
    pub consent_chars: u64,
    /// Visible form controls and sizable media outside those roots (up to 20).
    pub consent_outside: u64,
    /// The part of `consent_chars` that `text_chars` (the page's
    /// `body.innerText`) does not see: shadow-root text, and a root outside
    /// `<body>`.
    pub consent_shadow_chars: u64,
    /// Visible text in the page's own open shadow roots, outside the
    /// managers' roots: page text `text_chars` does not see.
    pub consent_page_shadow_chars: u64,
    /// Sizable frames inside those roots: a message drawn in an iframe,
    /// whose text the page cannot read.
    pub consent_frames: u64,
}

impl PageProbe {
    pub fn from_value(v: &Value) -> PageProbe {
        PageProbe {
            title: v.get("title").and_then(Value::as_str).unwrap_or("").to_string(),
            text_chars: v.get("textChars").and_then(Value::as_f64).unwrap_or(0.0).max(0.0) as u64,
            href: v.get("href").and_then(Value::as_str).unwrap_or("").to_string(),
            markers: v
                .get("markers")
                .and_then(Value::as_array)
                .map(|a| a.iter().filter_map(Value::as_str).map(String::from).collect())
                .unwrap_or_default(),
            overlays: v
                .get("overlays")
                .and_then(Value::as_array)
                .map(|a| a.iter().filter_map(Value::as_str).map(String::from).collect())
                .unwrap_or_default(),
            consent: v
                .get("consent")
                .and_then(Value::as_array)
                .map(|a| a.iter().filter_map(Value::as_str).map(String::from).collect())
                .unwrap_or_default(),
            consent_chars: v.get("consentChars").and_then(Value::as_f64).unwrap_or(0.0).max(0.0) as u64,
            consent_outside: v.get("consentOutside").and_then(Value::as_f64).unwrap_or(0.0).max(0.0) as u64,
            consent_shadow_chars: v.get("consentShadowChars").and_then(Value::as_f64).unwrap_or(0.0).max(0.0) as u64,
            consent_page_shadow_chars: v
                .get("consentPageShadowChars")
                .and_then(Value::as_f64)
                .unwrap_or(0.0)
                .max(0.0) as u64,
            consent_frames: v.get("consentFrames").and_then(Value::as_f64).unwrap_or(0.0).max(0.0) as u64,
        }
    }

    pub fn to_value(&self) -> Value {
        let mut v = json!({
            "title": self.title,
            "textChars": self.text_chars,
            "href": self.href,
            "markers": self.markers,
            "consent": self.consent,
            "consentChars": self.consent_chars,
            "consentOutside": self.consent_outside,
        });
        // Named only when they hold something, so a page without them
        // records what it did before they were measured.
        if self.consent_frames > 0 {
            v["consentFrames"] = json!(self.consent_frames);
        }
        if self.consent_shadow_chars > 0 {
            v["consentShadowChars"] = json!(self.consent_shadow_chars);
        }
        if self.consent_page_shadow_chars > 0 {
            v["consentPageShadowChars"] = json!(self.consent_page_shadow_chars);
        }
        // Named only when one shows, so a page with none records what it did
        // before overlays were probed.
        if !self.overlays.is_empty() {
            v["overlays"] = json!(self.overlays);
        }
        v
    }

}

/// The main document's HTTP response (the last one for the main frame, so
/// after redirects). `headers` names are lowercased.
#[derive(Debug, Clone, Default, PartialEq)]
pub struct DocumentResponse {
    pub url: String,
    pub status: u16,
    pub headers: Vec<(String, String)>,
}

impl DocumentResponse {
    /// From a CDP `Network.Response` object.
    pub fn from_cdp(response: &Value) -> Option<DocumentResponse> {
        let status = response.get("status").and_then(Value::as_f64)?;
        let headers = response
            .get("headers")
            .and_then(Value::as_object)
            .map(|m| {
                m.iter()
                    .map(|(k, v)| {
                        (
                            k.to_ascii_lowercase(),
                            v.as_str().map(String::from).unwrap_or_else(|| v.to_string()),
                        )
                    })
                    .collect()
            })
            .unwrap_or_default();
        Some(DocumentResponse {
            url: response.get("url").and_then(Value::as_str).unwrap_or("").to_string(),
            status: status.max(0.0) as u16,
            headers,
        })
    }

    pub fn header(&self, name: &str) -> Option<&str> {
        self.headers
            .iter()
            .find(|(k, _)| k == name)
            .map(|(_, v)| v.as_str())
    }

    pub fn to_value(&self) -> Value {
        let headers: serde_json::Map<String, Value> = self
            .headers
            .iter()
            .map(|(k, v)| (k.clone(), Value::String(v.clone())))
            .collect();
        json!({ "url": self.url, "status": self.status, "headers": headers })
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum BlockKind {
    /// A bot challenge, captcha, or WAF block page.
    Challenge,
    /// The server answered with a 4xx/5xx status.
    HttpError,
    /// The page is a known consent manager's wall with next to no page behind it.
    ConsentWall,
}

impl BlockKind {
    pub fn as_str(self) -> &'static str {
        match self {
            BlockKind::Challenge => "challenge",
            BlockKind::HttpError => "http-error",
            BlockKind::ConsentWall => "consent-wall",
        }
    }
}

#[derive(Debug, Clone, PartialEq)]
pub enum PageValidity {
    Ok,
    Blocked {
        kind: BlockKind,
        /// Human-readable signals, in the order they were checked.
        evidence: Vec<String>,
    },
}

impl PageValidity {
    pub fn is_blocked(&self) -> bool {
        matches!(self, PageValidity::Blocked { .. })
    }

    pub fn to_value(&self) -> Value {
        match self {
            PageValidity::Ok => json!({ "status": "ok" }),
            PageValidity::Blocked { kind, evidence } => {
                json!({ "status": kind.as_str(), "evidence": evidence })
            }
        }
    }

    /// The error the CLI prints for a blocked page, or `None` when it is fine.
    pub fn error_message(&self) -> Option<String> {
        let PageValidity::Blocked { kind, evidence } = self else {
            return None;
        };
        let signals = evidence.join(", ");
        Some(match kind {
            BlockKind::Challenge => format!(
                "the page is a bot challenge, not the site ({signals}). Findings would describe the challenge page, so none are reported."
            ),
            BlockKind::HttpError => format!(
                "the page returned an error ({signals}). Findings would describe the error page, so none are reported."
            ),
            BlockKind::ConsentWall => format!(
                "the page is a consent wall, not the site ({signals}). Findings would describe the consent dialog, so none are reported."
            ),
        })
    }
}

/// Page- and server-supplied text made safe to print: control characters
/// (an escape sequence in a `<title>`, a newline in a header) are written as
/// `\u{..}` escapes, so the evidence the CLI prints to a terminal cannot drive
/// that terminal.
fn printable(s: &str) -> String {
    let mut out = String::with_capacity(s.len());
    for c in s.chars() {
        if c.is_control() {
            out.extend(c.escape_unicode());
        } else {
            out.push(c);
        }
    }
    out
}

/// Classify a loaded page. `response` is `None` when no main-document
/// response was seen (a `file://` URL, or a same-document navigation).
/// `consent_wall` turns the consent-wall gate on; a scan that keeps the
/// banners turns it off.
pub fn classify_with(response: Option<&DocumentResponse>, probe: &PageProbe, consent_wall: bool) -> PageValidity {
    let mut challenge: Vec<String> = Vec::new();
    if let Some(r) = response {
        if let Some(action) = r.header("x-amzn-waf-action") {
            challenge.push(format!("x-amzn-waf-action: {}", printable(action)));
        }
        if let Some(v) = r.header("cf-mitigated") {
            if v.eq_ignore_ascii_case("challenge") {
                challenge.push("cf-mitigated: challenge".to_string());
            }
        }
    }
    if let Ok(final_url) = url::Url::parse(&probe.href) {
        if let Some(host) = final_url.host_str() {
            let host = host.to_ascii_lowercase();
            if CHALLENGE_HOSTS
                .iter()
                .any(|h| host == *h || host.ends_with(&format!(".{h}")))
            {
                challenge.push(format!("challenge host {host}"));
            }
        }
    }
    // A challenge sheet over a rendered page blocks it whatever the page
    // behind it holds.
    for o in &probe.overlays {
        challenge.push(format!("overlay {o}"));
    }
    let small = probe.text_chars <= SMALL_PAGE_CHARS;
    if small {
        let title = probe.title.trim().to_lowercase();
        if !title.is_empty() && CHALLENGE_TITLE_PREFIXES.iter().any(|p| title.starts_with(p)) {
            challenge.push(format!("title \"{}\"", printable(probe.title.trim())));
        }
        for m in &probe.markers {
            challenge.push(format!("marker {m}"));
        }
    }
    let status = response.map(|r| r.status).unwrap_or(0);
    if !challenge.is_empty() {
        if status >= 400 {
            challenge.insert(0, format!("HTTP {status}"));
        }
        return PageValidity::Blocked {
            kind: BlockKind::Challenge,
            evidence: challenge,
        };
    }
    if status >= 400 {
        return PageValidity::Blocked {
            kind: BlockKind::HttpError,
            evidence: vec![format!("HTTP {status}")],
        };
    }
    if consent_wall && !probe.consent.is_empty() {
        // The page's own text count leaves out what the manager renders in a
        // shadow root, and the manager's count includes it: both are read
        // over the same text here, while the challenge checks above keep the
        // page's own count.
        // The page's own shadow-root text is outside the managers too.
        let total = probe.text_chars + probe.consent_shadow_chars + probe.consent_page_shadow_chars;
        let outside = total.saturating_sub(probe.consent_chars);
        if outside < CONSENT_WALL_OUTSIDE_CHARS
            && probe.consent_outside == 0
            && (probe.consent_chars >= CONSENT_WALL_MIN_CHARS || probe.consent_frames > 0)
        {
            return PageValidity::Blocked {
                kind: BlockKind::ConsentWall,
                evidence: vec![
                    format!("consent manager {}", probe.consent.join(", ")),
                    format!("{outside} of {total} visible characters outside it"),
                    "no control or image outside it".to_string(),
                ],
            };
        }
    }
    PageValidity::Ok
}

/// [`classify_with`] with every gate on, the consent wall included.
pub fn classify(response: Option<&DocumentResponse>, probe: &PageProbe) -> PageValidity {
    classify_with(response, probe, true)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn resp(status: u16, headers: &[(&str, &str)]) -> DocumentResponse {
        DocumentResponse {
            url: "https://example.com/".into(),
            status,
            headers: headers.iter().map(|(k, v)| (k.to_string(), v.to_string())).collect(),
        }
    }

    fn probe(title: &str, text_chars: u64, markers: &[&str]) -> PageProbe {
        PageProbe {
            title: title.into(),
            text_chars,
            href: "https://example.com/".into(),
            markers: markers.iter().map(|m| m.to_string()).collect(),
            ..Default::default()
        }
    }

    #[test]
    fn a_page_that_is_only_a_consent_wall_is_refused() {
        let mut p = probe("Example", 872, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 860;
        let v = classify(Some(&resp(200, &[])), &p);
        assert_eq!(
            v,
            PageValidity::Blocked {
                kind: BlockKind::ConsentWall,
                evidence: vec![
                    "consent manager OneTrust".into(),
                    "12 of 872 visible characters outside it".into(),
                    "no control or image outside it".into(),
                ],
            }
        );
        assert!(v.error_message().unwrap().starts_with("the page is a consent wall"));
        // A scan that keeps the banners reads the wall instead.
        assert_eq!(classify_with(Some(&resp(200, &[])), &p, false), PageValidity::Ok);
    }

    #[test]
    fn a_preference_center_longer_than_a_small_page_is_still_a_wall() {
        // A OneTrust preference center lists every purpose and vendor: more
        // text than a challenge page holds, and still nothing but the dialog.
        let mut p = probe("Example", 5400, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 5392;
        assert!(matches!(
            classify(Some(&resp(200, &[])), &p),
            PageValidity::Blocked { kind: BlockKind::ConsentWall, .. }
        ));
        // The same dialog over a long page is the page.
        let mut p = probe("Example", 9400, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 5392;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
    }

    #[test]
    fn a_manager_drawn_in_a_frame_is_a_wall_over_an_empty_page() {
        let mut p = probe("Example", 0, &[]);
        p.consent = vec!["Sourcepoint".into()];
        p.consent_frames = 1;
        assert!(matches!(
            classify(Some(&resp(200, &[])), &p),
            PageValidity::Blocked { kind: BlockKind::ConsentWall, .. }
        ));
        // The same frame over a page with copy of its own is the page.
        p.text_chars = 400;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
    }

    #[test]
    fn shadow_consent_text_is_counted_on_both_sides_and_not_against_challenges() {
        // 90 characters of the page's own under a 300-character shadow-root
        // banner: the page's count does not include the banner.
        let mut p = probe("Example", 90, &[]);
        p.consent = vec!["Usercentrics".into()];
        p.consent_chars = 300;
        p.consent_shadow_chars = 300;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
        // A challenge page under a long shadow-root banner is still small.
        let mut c = probe("Just a moment...", 2900, &[]);
        c.consent = vec!["Usercentrics".into()];
        c.consent_chars = 800;
        c.consent_shadow_chars = 800;
        assert!(matches!(
            classify(Some(&resp(403, &[])), &c),
            PageValidity::Blocked { kind: BlockKind::Challenge, .. }
        ));
    }

    #[test]
    fn the_pages_own_shadow_text_is_outside_the_banner() {
        // A web-component app: its text lives in its own shadow roots, under
        // a light-DOM OneTrust banner that holds all of body.innerText.
        let mut p = probe("Example", 400, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 400;
        assert!(matches!(
            classify(Some(&resp(200, &[])), &p),
            PageValidity::Blocked { kind: BlockKind::ConsentWall, .. }
        ));
        p.consent_page_shadow_chars = 600;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
    }

    #[test]
    fn a_short_page_under_a_banner_is_the_page() {
        // The review's sign-in page: an h1, two fields, a hint and a button
        // under a OneTrust bar. 48 characters of its own and four controls.
        let mut p = probe("Sign in", 411, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 363;
        p.consent_outside = 4;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
        // An image-first page: a caption's worth of text and a large image.
        let mut p = probe("Portfolio", 380, &[]);
        p.consent = vec!["Cookiebot".into()];
        p.consent_chars = 372;
        p.consent_outside = 1;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
        // A line of its own text and nothing else is still more than a wall.
        let mut p = probe("Splash", 400, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 370;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
        // An empty page under a two-word banner is not a wall either.
        let mut p = probe("Example", 60, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 60;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
    }

    #[test]
    fn a_consent_banner_over_a_page_is_the_page() {
        // A short page under a shorter banner.
        let mut p = probe("Example", 272, &[]);
        p.consent = vec!["OneTrust".into()];
        p.consent_chars = 190;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
        let mut p = probe("Example", 2400, &[]);
        p.consent = vec!["Cookiebot".into()];
        p.consent_chars = 700;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
        // A large page is content whatever the banner holds.
        let mut p = probe("Example", 40000, &[]);
        p.consent = vec!["Cookiebot".into()];
        p.consent_chars = 39900;
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
    }

    #[test]
    fn aws_waf_captcha_is_a_challenge() {
        // siemens.com, 2026-09-11: CloudFront answered 405 with a captcha page.
        let v = classify(
            Some(&resp(405, &[("x-amzn-waf-action", "captcha")])),
            &probe("Human Verification", 120, &[]),
        );
        assert_eq!(
            v,
            PageValidity::Blocked {
                kind: BlockKind::Challenge,
                evidence: vec![
                    "HTTP 405".into(),
                    "x-amzn-waf-action: captcha".into(),
                    "title \"Human Verification\"".into(),
                ],
            }
        );
        assert!(v.error_message().unwrap().starts_with("the page is a bot challenge"));
    }

    #[test]
    fn page_supplied_evidence_cannot_carry_control_characters() {
        let v = classify(
            Some(&resp(403, &[("x-amzn-waf-action", "captcha\r\n\u{1b}[2J")])),
            &probe("Human Verification\u{1b}]0;owned\u{7}", 120, &[]),
        );
        let message = v.error_message().unwrap();
        assert!(!message.chars().any(|c| c.is_control()), "{message:?}");
        assert!(message.contains("title \"Human Verification\\u{1b}]0;owned\\u{7}\""), "{message}");
        assert!(message.contains("x-amzn-waf-action: captcha\\u{d}\\u{a}\\u{1b}[2J"), "{message}");
    }

    #[test]
    fn cloudflare_interstitial_title_on_a_small_page() {
        let v = classify(Some(&resp(403, &[])), &probe("Just a moment...", 80, &[]));
        assert!(matches!(v, PageValidity::Blocked { kind: BlockKind::Challenge, .. }));
    }

    #[test]
    fn cf_mitigated_header_alone_is_enough() {
        let v = classify(
            Some(&resp(200, &[("cf-mitigated", "challenge")])),
            &probe("Example", 20000, &[]),
        );
        assert!(matches!(v, PageValidity::Blocked { kind: BlockKind::Challenge, .. }));
    }

    #[test]
    fn challenge_title_on_a_content_page_is_content() {
        let v = classify(Some(&resp(200, &[])), &probe("Access denied: a novel", 40000, &[]));
        assert_eq!(v, PageValidity::Ok);
    }

    #[test]
    fn captcha_marker_on_a_content_page_is_content() {
        let v = classify(Some(&resp(200, &[])), &probe("Sign up", 9000, &["slider-captcha"]));
        assert_eq!(v, PageValidity::Ok);
    }

    #[test]
    fn marker_on_a_small_page_is_a_challenge() {
        let v = classify(Some(&resp(200, &[])), &probe("", 40, &["datadome-captcha"]));
        assert_eq!(
            v,
            PageValidity::Blocked {
                kind: BlockKind::Challenge,
                evidence: vec!["marker datadome-captcha".into()],
            }
        );
    }

    #[test]
    fn radware_redirect_host_is_a_challenge() {
        // yad2.co.il, 2026-09-11: a 302 to validate.perfdrive.com, which answers 200.
        let mut p = probe("Radware Bot Manager Block", 300, &[]);
        p.href = "https://validate.perfdrive.com/ccb4768f/?ssa=1".into();
        let v = classify(Some(&resp(200, &[])), &p);
        assert_eq!(
            v,
            PageValidity::Blocked {
                kind: BlockKind::Challenge,
                evidence: vec![
                    "challenge host validate.perfdrive.com".into(),
                    "title \"Radware Bot Manager Block\"".into(),
                ],
            }
        );
    }

    #[test]
    fn a_press_and_hold_sheet_over_a_rendered_page_is_a_challenge() {
        // target.com, run 28: HUMAN Security's `iframe#px-captcha-modal` over
        // the home page, 2270 visible characters and no challenge title.
        let mut p = probe("Target : Expect More. Pay Less.", 2270, &[]);
        p.overlays = vec!["human-press-and-hold".into()];
        assert_eq!(
            classify(Some(&resp(200, &[])), &p),
            PageValidity::Blocked {
                kind: BlockKind::Challenge,
                evidence: vec!["overlay human-press-and-hold".into()],
            }
        );
        // On a large page it still stands in front of the site.
        p.text_chars = 40000;
        assert!(classify(Some(&resp(200, &[])), &p).is_blocked());
        // With no sheet showing, the same page is the page.
        p.overlays.clear();
        assert_eq!(classify(Some(&resp(200, &[])), &p), PageValidity::Ok);
        let v = p.to_value();
        assert!(v.get("overlays").is_none(), "{v}");
        assert_eq!(PageProbe::from_value(&v), p);
    }

    #[test]
    fn http_error_without_challenge_signals() {
        let v = classify(Some(&resp(404, &[])), &probe("Page not found", 400, &[]));
        assert_eq!(
            v,
            PageValidity::Blocked {
                kind: BlockKind::HttpError,
                evidence: vec!["HTTP 404".into()],
            }
        );
        assert!(v.error_message().unwrap().contains("HTTP 404"));
    }

    #[test]
    fn ordinary_pages_and_file_urls_pass() {
        assert_eq!(classify(Some(&resp(200, &[])), &probe("Stripe", 12000, &[])), PageValidity::Ok);
        assert_eq!(classify(None, &probe("fixture", 10, &[])), PageValidity::Ok);
    }

    #[test]
    fn response_from_cdp_lowercases_headers() {
        let r = DocumentResponse::from_cdp(&json!({
            "url": "https://example.com/",
            "status": 405,
            "headers": { "X-Amzn-Waf-Action": "captcha", "Server": "CloudFront" },
        }))
        .unwrap();
        assert_eq!(r.status, 405);
        assert_eq!(r.header("x-amzn-waf-action"), Some("captcha"));
    }

    #[test]
    fn probe_js_embeds_every_marker() {
        let js = probe_js();
        for (selector, label) in CHALLENGE_MARKERS.iter().chain(CHALLENGE_OVERLAYS) {
            assert!(js.contains(label));
            assert!(js.contains(&selector.replace('\'', "'")));
        }
    }
}
