//! Where a CSS gradient paints under a piece of text.
//!
//! The background walk used to hand the contrast check every stop of a
//! gradient and score the text against the worst one. That is the right
//! answer only when the text could sit anywhere on the gradient. A button
//! label sits in the middle of its button, a hero pill sits where a radial
//! glow has already faded to nothing, and an underline drawn as a 2px
//! gradient tile sits under no glyph at all. This module answers the
//! geometric question from the computed style: given the box a gradient is
//! painted on and the box the text occupies, what colour does each layer
//! paint at a handful of points inside the text box.
//!
//! Everything here is pure data. Anything it cannot read (a `calc()` stop, a
//! `conic-gradient`, `background-attachment: fixed`, a four-value position)
//! answers [`UnderText::Unknown`], and the callers keep their old worst-stop
//! verdict.

use crate::color::{parse_any_color, split_top_level_commas, Rgba};
use crate::js::{self, math_round, parse_float};

/// An axis-aligned box in CSS pixels.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct Box2 {
    pub x: f64,
    pub y: f64,
    pub w: f64,
    pub h: f64,
}

impl Box2 {
    pub fn new(x: f64, y: f64, w: f64, h: f64) -> Self {
        Box2 { x, y, w, h }
    }
    fn finite(&self) -> bool {
        [self.x, self.y, self.w, self.h].iter().all(|v| v.is_finite())
    }
}

/// The box a background is painted on: its border box plus the border and
/// padding widths, `[top, right, bottom, left]`, that `background-origin`
/// subtracts.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct PaintBox {
    pub border_box: Box2,
    pub border: [f64; 4],
    pub padding: [f64; 4],
}

/// The computed background properties of one box, each a comma-separated
/// list with one entry per layer.
#[derive(Debug, Clone, Copy, PartialEq, Default)]
pub struct BackgroundLayers<'a> {
    pub image: &'a str,
    pub size: &'a str,
    pub position: &'a str,
    /// The computed `background` shorthand, which is where the snapshot
    /// carries `background-repeat`, `-attachment` and `-origin`.
    pub shorthand: &'a str,
}

/// What a box's gradient layers paint inside a text box.
#[derive(Debug, Clone, PartialEq)]
pub enum UnderText {
    /// The colour, possibly translucent, at each sample point.
    Paint(Vec<Rgba>),
    /// No layer paints under any sample point: the gradient is not a
    /// background of this text.
    Misses,
    /// The geometry or a layer could not be read.
    Unknown,
}

/// A premultiplied colour, so layers composite and interpolate the way the
/// browser does.
#[derive(Debug, Clone, Copy, PartialEq)]
struct Premul {
    r: f64,
    g: f64,
    b: f64,
    a: f64,
}

impl Premul {
    const CLEAR: Premul = Premul { r: 0.0, g: 0.0, b: 0.0, a: 0.0 };

    fn from(c: &Rgba) -> Premul {
        let a = c.alpha_or_one().clamp(0.0, 1.0);
        Premul { r: c.r * a, g: c.g * a, b: c.b * a, a }
    }

    /// `self` painted over `under`.
    fn over(self, under: Premul) -> Premul {
        let k = 1.0 - self.a;
        Premul {
            r: self.r + under.r * k,
            g: self.g + under.g * k,
            b: self.b + under.b * k,
            a: self.a + under.a * k,
        }
    }

    fn scale(self, o: f64) -> Premul {
        Premul { r: self.r * o, g: self.g * o, b: self.b * o, a: self.a * o }
    }

    fn lerp(self, other: Premul, f: f64) -> Premul {
        Premul {
            r: self.r + (other.r - self.r) * f,
            g: self.g + (other.g - self.g) * f,
            b: self.b + (other.b - self.b) * f,
            a: self.a + (other.a - self.a) * f,
        }
    }

    fn unpremultiply(self) -> Rgba {
        if self.a <= 0.0 {
            return Rgba::new(0.0, 0.0, 0.0, 0.0);
        }
        Rgba::new(self.r / self.a, self.g / self.a, self.b / self.a, self.a.min(1.0))
    }

    /// Flattened over an opaque colour, rounded to 8-bit channels.
    fn flatten_over(self, base: &Rgba) -> Rgba {
        let k = 1.0 - self.a;
        Rgba::new(
            math_round(self.r + base.r * k),
            math_round(self.g + base.g * k),
            math_round(self.b + base.b * k),
            1.0,
        )
    }
}

/// Tokens split on whitespace outside parentheses.
fn top_level_tokens(s: &str) -> Vec<String> {
    let mut out = Vec::new();
    let mut depth = 0i32;
    let mut cur = String::new();
    for ch in s.chars() {
        match ch {
            '(' => {
                depth += 1;
                cur.push(ch);
            }
            ')' => {
                depth -= 1;
                cur.push(ch);
            }
            c if c.is_ascii_whitespace() && depth == 0 => {
                if !cur.is_empty() {
                    out.push(std::mem::take(&mut cur));
                }
            }
            c => cur.push(c),
        }
    }
    if !cur.is_empty() {
        out.push(cur);
    }
    out
}

/// A length a gradient stop or size may carry.
#[derive(Debug, Clone, Copy, PartialEq)]
enum Len {
    Px(f64),
    Pct(f64),
}

impl Len {
    fn resolve(self, basis: f64) -> f64 {
        match self {
            Len::Px(v) => v,
            Len::Pct(p) => basis * p / 100.0,
        }
    }
}

fn parse_len(token: &str) -> Option<Len> {
    let t = js::to_lower_case(js::trim(token));
    let num = |s: &str| {
        let v = parse_float(s);
        (v.is_finite() && s.chars().all(|c| c.is_ascii_digit() || matches!(c, '.' | '-' | '+' | 'e')))
            .then_some(v)
    };
    if let Some(n) = t.strip_suffix('%') {
        return num(n).map(Len::Pct);
    }
    if let Some(n) = t.strip_suffix("px") {
        return num(n).map(Len::Px);
    }
    if num(&t) == Some(0.0) {
        return Some(Len::Px(0.0));
    }
    None
}

fn parse_stop_color(s: &str) -> Option<Rgba> {
    let t = js::trim(s);
    if js::to_lower_case(t) == "transparent" {
        return Some(Rgba::new(0.0, 0.0, 0.0, 0.0));
    }
    parse_any_color(Some(t))
}

#[derive(Debug, Clone, Copy, PartialEq)]
struct Stop {
    color: Premul,
    pos: Option<Len>,
}

fn parse_stops(args: &[String]) -> Option<Vec<Stop>> {
    let mut stops = Vec::new();
    for arg in args {
        let tokens = top_level_tokens(arg);
        let mut positions = Vec::new();
        let mut color_end = tokens.len();
        while color_end > 0 {
            match parse_len(&tokens[color_end - 1]) {
                Some(len) => {
                    positions.push(len);
                    color_end -= 1;
                }
                None => break,
            }
        }
        positions.reverse();
        if color_end != 1 || positions.len() > 2 {
            // A colour hint (a bare position), a position this does not read
            // (`calc()`, `em`), or a shape this does not read.
            return None;
        }
        let color = parse_stop_color(&tokens[..color_end].join(" "))?;
        let color = Premul::from(&color);
        if positions.is_empty() {
            stops.push(Stop { color, pos: None });
        }
        for pos in positions {
            stops.push(Stop { color, pos: Some(pos) });
        }
    }
    (!stops.is_empty()).then_some(stops)
}

/// Stop positions as fractions of `length`, with the CSS fix-ups: the first
/// and last default to 0% and 100%, a position never goes backwards, and a
/// run without positions spreads evenly between its neighbours.
fn resolve_positions(stops: &[Stop], length: f64) -> Option<Vec<f64>> {
    if stops.is_empty() || !(length > 0.0) {
        return None;
    }
    let n = stops.len();
    let mut pos: Vec<Option<f64>> = stops.iter().map(|s| s.pos.map(|l| l.resolve(length) / length)).collect();
    if pos[0].is_none() {
        pos[0] = Some(0.0);
    }
    if pos[n - 1].is_none() {
        pos[n - 1] = Some(1.0);
    }
    let mut max = f64::NEG_INFINITY;
    for p in pos.iter_mut().flatten() {
        if *p < max {
            *p = max;
        }
        max = *p;
    }
    let mut i = 0;
    while i < n {
        if pos[i].is_some() {
            i += 1;
            continue;
        }
        let start = i - 1;
        let mut end = i;
        while pos[end].is_none() {
            end += 1;
        }
        let (a, b) = (pos[start].unwrap(), pos[end].unwrap());
        let steps = (end - start) as f64;
        for (k, slot) in pos.iter_mut().enumerate().take(end).skip(start + 1) {
            *slot = Some(a + (b - a) * (k - start) as f64 / steps);
        }
        i = end;
    }
    pos.into_iter().collect()
}

fn color_at_fraction(stops: &[Stop], positions: &[f64], t: f64) -> Premul {
    let n = stops.len();
    if n == 1 || t <= positions[0] {
        return stops[0].color;
    }
    if t >= positions[n - 1] {
        return stops[n - 1].color;
    }
    for i in 0..n - 1 {
        let (a, b) = (positions[i], positions[i + 1]);
        if t >= a && t <= b {
            if b - a <= f64::EPSILON {
                return stops[i + 1].color;
            }
            return stops[i].color.lerp(stops[i + 1].color, (t - a) / (b - a));
        }
    }
    stops[n - 1].color
}

#[derive(Debug, Clone, PartialEq)]
enum Direction {
    Angle(f64),
    /// `to <corner>`: horizontal and vertical signs.
    Corner(f64, f64),
}

#[derive(Debug, Clone, Copy, PartialEq)]
enum RadialSize {
    ClosestSide,
    ClosestCorner,
    FarthestSide,
    FarthestCorner,
    Explicit(Len, Len),
}

#[derive(Debug, Clone, PartialEq)]
enum Geometry {
    Linear(Direction),
    Radial { circle: bool, size: RadialSize, at: (Len, Len) },
}

/// One parsed gradient layer.
#[derive(Debug, Clone, PartialEq)]
pub struct Gradient {
    geometry: Geometry,
    stops: Vec<Stop>,
}

fn parse_angle(token: &str) -> Option<f64> {
    let t = js::to_lower_case(js::trim(token));
    let (num, scale) = if let Some(n) = t.strip_suffix("deg") {
        (n, 1.0)
    } else if let Some(n) = t.strip_suffix("grad") {
        (n, 0.9)
    } else if let Some(n) = t.strip_suffix("rad") {
        (n, 180.0 / std::f64::consts::PI)
    } else if let Some(n) = t.strip_suffix("turn") {
        (n, 360.0)
    } else {
        return None;
    };
    let v = parse_float(num);
    v.is_finite().then_some(v * scale)
}

fn parse_linear_direction(arg: &str) -> Option<Option<Direction>> {
    let tokens = top_level_tokens(&js::to_lower_case(arg));
    if tokens.first().map(String::as_str) == Some("to") {
        let mut sx = 0.0;
        let mut sy = 0.0;
        for t in &tokens[1..] {
            match t.as_str() {
                "left" => sx = -1.0,
                "right" => sx = 1.0,
                "top" => sy = -1.0,
                "bottom" => sy = 1.0,
                _ => return None,
            }
        }
        return Some(Some(match (sx, sy) {
            (0.0, 0.0) => return None,
            (0.0, -1.0) => Direction::Angle(0.0),
            (1.0, 0.0) => Direction::Angle(90.0),
            (0.0, 1.0) => Direction::Angle(180.0),
            (-1.0, 0.0) => Direction::Angle(270.0),
            (x, y) => Direction::Corner(x, y),
        }));
    }
    if tokens.len() == 1 {
        if let Some(a) = parse_angle(&tokens[0]) {
            return Some(Some(Direction::Angle(a)));
        }
    }
    if tokens.iter().any(|t| t == "in") {
        // A colour-interpolation method: another space than sRGB.
        return None;
    }
    Some(None)
}

fn is_position_keyword(t: &str) -> bool {
    matches!(t, "left" | "right" | "top" | "bottom" | "center")
}

/// A one- or two-value `<position>`, as `(x, y)` fractions or lengths of the
/// box. Keywords become percentages.
fn parse_position(tokens: &[String]) -> Option<(Len, Len)> {
    let kw = |t: &str| match t {
        "left" | "top" => Some(Len::Pct(0.0)),
        "center" => Some(Len::Pct(50.0)),
        "right" | "bottom" => Some(Len::Pct(100.0)),
        _ => None,
    };
    let len = |t: &str| kw(t).or_else(|| parse_len(t));
    match tokens {
        [] => Some((Len::Pct(50.0), Len::Pct(50.0))),
        [a] => {
            let a = a.as_str();
            if a == "top" || a == "bottom" {
                Some((Len::Pct(50.0), kw(a)?))
            } else {
                Some((len(a)?, Len::Pct(50.0)))
            }
        }
        [a, b] => {
            let (a, b) = (a.as_str(), b.as_str());
            if a == "top" || a == "bottom" || b == "left" || b == "right" {
                if !is_position_keyword(a) || !is_position_keyword(b) {
                    return None;
                }
                Some((len(b)?, len(a)?))
            } else {
                Some((len(a)?, len(b)?))
            }
        }
        _ => None,
    }
}

fn parse_radial_spec(arg: &str) -> Option<Option<Geometry>> {
    let lower = js::to_lower_case(arg);
    let tokens = top_level_tokens(&lower);
    let first = tokens.first().map(String::as_str).unwrap_or("");
    let keyword_first = matches!(
        first,
        "circle" | "ellipse" | "closest-side" | "closest-corner" | "farthest-side" | "farthest-corner" | "at"
    );
    // `620px 360px at 50% 38%`: a size written as lengths, which a colour
    // stop never starts with.
    let lengths_first = parse_len(first).is_some()
        && tokens
            .iter()
            .all(|t| parse_len(t).is_some() || is_position_keyword(t) || matches!(t.as_str(), "at" | "circle" | "ellipse"));
    let names_shape = keyword_first || lengths_first;
    if !names_shape {
        if tokens.iter().any(|t| t == "in") {
            return None;
        }
        return Some(None);
    }
    let at = tokens.iter().position(|t| t == "at");
    let (shape_tokens, pos_tokens) = match at {
        Some(i) => (&tokens[..i], &tokens[i + 1..]),
        None => (&tokens[..], &tokens[0..0]),
    };
    let mut circle: Option<bool> = None;
    let mut size: Option<RadialSize> = None;
    let mut lengths: Vec<Len> = Vec::new();
    for t in shape_tokens {
        match t.as_str() {
            "circle" => circle = Some(true),
            "ellipse" => circle = Some(false),
            "closest-side" => size = Some(RadialSize::ClosestSide),
            "closest-corner" => size = Some(RadialSize::ClosestCorner),
            "farthest-side" => size = Some(RadialSize::FarthestSide),
            "farthest-corner" => size = Some(RadialSize::FarthestCorner),
            other => lengths.push(parse_len(other)?),
        }
    }
    if !lengths.is_empty() {
        if size.is_some() {
            return None;
        }
        match lengths.as_slice() {
            [r] => {
                if matches!(r, Len::Pct(_)) || circle == Some(false) {
                    return None;
                }
                circle = Some(true);
                size = Some(RadialSize::Explicit(*r, *r));
            }
            [rx, ry] => {
                if circle == Some(true) {
                    return None;
                }
                circle = Some(false);
                size = Some(RadialSize::Explicit(*rx, *ry));
            }
            _ => return None,
        }
    }
    let at = parse_position(pos_tokens)?;
    Some(Some(Geometry::Radial {
        circle: circle.unwrap_or(false),
        size: size.unwrap_or(RadialSize::FarthestCorner),
        at,
    }))
}

impl Gradient {
    /// Parses one `linear-gradient(...)` or `radial-gradient(...)` layer.
    /// Repeating and conic gradients, and anything with a part this does
    /// not read, answer `None`.
    pub fn parse(layer: &str) -> Option<Gradient> {
        let t = js::trim(layer);
        let open = t.find('(')?;
        if !t.ends_with(')') {
            return None;
        }
        let name = js::to_lower_case(js::trim(&t[..open]));
        let inner = &t[open + 1..t.len() - 1];
        let args = split_top_level_commas(inner);
        if args.is_empty() {
            return None;
        }
        let (geometry, stop_args) = match name.as_str() {
            "linear-gradient" => {
                match parse_linear_direction(&args[0])? {
                    Some(d) => (Geometry::Linear(d), &args[1..]),
                    None => (Geometry::Linear(Direction::Angle(180.0)), &args[..]),
                }
            }
            "radial-gradient" => match parse_radial_spec(&args[0])? {
                Some(g) => (g, &args[1..]),
                None => (
                    Geometry::Radial {
                        circle: false,
                        size: RadialSize::FarthestCorner,
                        at: (Len::Pct(50.0), Len::Pct(50.0)),
                    },
                    &args[..],
                ),
            },
            _ => return None,
        };
        let stops = parse_stops(stop_args)?;
        Some(Gradient { geometry, stops })
    }

    /// The colour this gradient paints at `(x, y)` inside a `w` x `h` tile.
    fn color_at(&self, x: f64, y: f64, w: f64, h: f64) -> Option<Premul> {
        match &self.geometry {
            Geometry::Linear(direction) => {
                let angle = match direction {
                    Direction::Angle(a) => a.to_radians(),
                    Direction::Corner(sx, sy) => {
                        // Perpendicular to the diagonal through the other two
                        // corners, pointing into the named corner's quadrant.
                        let (vx, vy) = (sx * h, sy * w);
                        vx.atan2(-vy)
                    }
                };
                let (dx, dy) = (angle.sin(), -angle.cos());
                let length = (w * angle.sin()).abs() + (h * angle.cos()).abs();
                let positions = resolve_positions(&self.stops, length)?;
                let t = ((x - w / 2.0) * dx + (y - h / 2.0) * dy) / length + 0.5;
                Some(color_at_fraction(&self.stops, &positions, t))
            }
            Geometry::Radial { circle, size, at } => {
                let cx = at.0.resolve(w);
                let cy = at.1.resolve(h);
                let dx_min = cx.abs().min((w - cx).abs());
                let dx_max = cx.abs().max((w - cx).abs());
                let dy_min = cy.abs().min((h - cy).abs());
                let dy_max = cy.abs().max((h - cy).abs());
                let (rx, ry) = match (size, circle) {
                    (RadialSize::Explicit(a, b), _) => (a.resolve(w), b.resolve(h)),
                    (RadialSize::ClosestSide, true) => {
                        let r = dx_min.min(dy_min);
                        (r, r)
                    }
                    (RadialSize::FarthestSide, true) => {
                        let r = dx_max.max(dy_max);
                        (r, r)
                    }
                    (RadialSize::ClosestCorner, true) => {
                        let r = dx_min.hypot(dy_min);
                        (r, r)
                    }
                    (RadialSize::FarthestCorner, true) => {
                        let r = dx_max.hypot(dy_max);
                        (r, r)
                    }
                    (RadialSize::ClosestSide, false) => (dx_min, dy_min),
                    (RadialSize::FarthestSide, false) => (dx_max, dy_max),
                    (RadialSize::ClosestCorner, false) => {
                        (dx_min * std::f64::consts::SQRT_2, dy_min * std::f64::consts::SQRT_2)
                    }
                    (RadialSize::FarthestCorner, false) => {
                        (dx_max * std::f64::consts::SQRT_2, dy_max * std::f64::consts::SQRT_2)
                    }
                };
                if !(rx > 0.0 && ry > 0.0) {
                    return None;
                }
                let positions = resolve_positions(&self.stops, rx)?;
                let t = ((x - cx) / rx).hypot((y - cy) / ry);
                Some(color_at_fraction(&self.stops, &positions, t))
            }
        }
    }
}

const REPEAT_KEYWORDS: [&str; 6] = ["repeat", "no-repeat", "repeat-x", "repeat-y", "space", "round"];
const BOX_KEYWORDS: [&str; 3] = ["border-box", "padding-box", "content-box"];

/// The parts of one `background` shorthand layer the geometry needs.
#[derive(Debug, Clone, PartialEq, Default)]
pub struct ShorthandLayer {
    /// Whether the tile repeats along x and y.
    pub repeat: (bool, bool),
    pub fixed: bool,
    /// `background-origin`, when the layer states one.
    pub origin: Option<String>,
    /// The size after `/`, when the layer states one.
    pub size: Option<String>,
}

/// Reads repeat, attachment, origin and size out of one `background`
/// shorthand layer (a computed style's, or an author's).
pub fn parse_shorthand_layer(layer: &str) -> ShorthandLayer {
    // A minified stylesheet writes `0 100%/100% 2px`: set the slash apart
    // wherever it sits outside a function.
    let mut spaced = String::with_capacity(layer.len() + 4);
    let mut depth = 0i32;
    for ch in js::to_lower_case(layer).chars() {
        match ch {
            '(' => depth += 1,
            ')' => depth -= 1,
            '/' if depth == 0 => {
                spaced.push_str(" / ");
                continue;
            }
            _ => {}
        }
        spaced.push(ch);
    }
    let tokens = top_level_tokens(&spaced);
    let mut out = ShorthandLayer { repeat: (true, true), ..Default::default() };
    let mut repeats: Vec<&str> = Vec::new();
    let mut boxes: Vec<&str> = Vec::new();
    let mut i = 0;
    while i < tokens.len() {
        let t = tokens[i].as_str();
        if REPEAT_KEYWORDS.contains(&t) {
            repeats.push(t);
        } else if BOX_KEYWORDS.contains(&t) {
            boxes.push(t);
        } else if t == "fixed" {
            out.fixed = true;
        } else if t == "/" {
            let size: Vec<&str> = tokens[i + 1..]
                .iter()
                .map(String::as_str)
                .take_while(|s| {
                    parse_len(s).is_some() || matches!(*s, "auto" | "cover" | "contain")
                })
                .take(2)
                .collect();
            if !size.is_empty() {
                out.size = Some(size.join(" "));
            }
        }
        i += 1;
    }
    out.repeat = repeat_axes(&repeats);
    out.origin = boxes.first().map(|s| s.to_string());
    out
}

fn repeat_axes(tokens: &[&str]) -> (bool, bool) {
    let one = |t: &str| !matches!(t, "no-repeat");
    match tokens {
        [] => (true, true),
        ["repeat-x"] => (true, false),
        ["repeat-y"] => (false, true),
        [t] => (one(t), one(t)),
        [a, b, ..] => (one(a), one(b)),
    }
}

/// The tile a gradient layer is drawn in, relative to its positioning area.
/// A gradient has no intrinsic size, so `auto`, `cover` and `contain` all
/// mean the whole area.
fn tile_box(size: &str, position: &str, area_w: f64, area_h: f64) -> Option<Box2> {
    let tokens = top_level_tokens(&js::to_lower_case(size));
    let axis = |t: Option<&String>, basis: f64| -> Option<f64> {
        match t.map(String::as_str) {
            None | Some("auto") => Some(basis),
            Some(s) => parse_len(s).map(|l| l.resolve(basis)),
        }
    };
    let (w, h) = match tokens.as_slice() {
        [] => (area_w, area_h),
        [one] if one == "cover" || one == "contain" => (area_w, area_h),
        [a] => (axis(Some(a), area_w)?, area_h),
        [a, b] => (axis(Some(a), area_w)?, axis(Some(b), area_h)?),
        _ => return None,
    };
    let pos_tokens = top_level_tokens(&js::to_lower_case(position));
    let place = |t: &str, container: f64, painted: f64| -> Option<f64> {
        match t {
            "left" | "top" => Some(0.0),
            "center" => Some((container - painted) / 2.0),
            "right" | "bottom" => Some(container - painted),
            s => parse_len(s).map(|l| match l {
                Len::Pct(p) => (container - painted) * p / 100.0,
                Len::Px(v) => v,
            }),
        }
    };
    let (x, y) = match pos_tokens.as_slice() {
        [] => (0.0, 0.0),
        [a] => {
            if a == "top" || a == "bottom" {
                ((area_w - w) / 2.0, place(a, area_h, h)?)
            } else {
                (place(a, area_w, w)?, (area_h - h) / 2.0)
            }
        }
        [a, b] => {
            if a == "top" || a == "bottom" || b == "left" || b == "right" {
                (place(b, area_w, w)?, place(a, area_h, h)?)
            } else {
                (place(a, area_w, w)?, place(b, area_h, h)?)
            }
        }
        _ => return None,
    };
    Some(Box2::new(x, y, w, h))
}

/// The point `(x, y)` of the positioning area in the tile's own coordinates,
/// or `None` where the tile does not paint.
fn point_in_tile(tile: &Box2, repeat: (bool, bool), x: f64, y: f64) -> Option<(f64, f64)> {
    if !(tile.w > 0.0 && tile.h > 0.0) {
        return None;
    }
    let axis = |p: f64, start: f64, len: f64, repeats: bool| {
        let local = p - start;
        if repeats {
            Some(local.rem_euclid(len))
        } else if local >= 0.0 && local < len {
            Some(local)
        } else {
            None
        }
    };
    Some((axis(x, tile.x, tile.w, repeat.0)?, axis(y, tile.y, tile.h, repeat.1)?))
}

/// The sample points inside a text box. Three rows, at a sixth, a half and
/// five sixths of its height, keep off the top and bottom edges, where a
/// rule or an underline sits. Five columns: a sixth, a half and five sixths
/// of its width, and both ends of the line, half a pixel in so a text box
/// that ends where its painting box ends still lands inside it. A long line
/// over a horizontal gradient is read where its first and last words sit.
fn sample_points(text: &Box2) -> Vec<(f64, f64)> {
    let inset = (text.w / 2.0).min(0.5);
    let xs = [
        text.x + inset,
        text.x + text.w / 6.0,
        text.x + text.w * 0.5,
        text.x + text.w * 5.0 / 6.0,
        text.x + text.w - inset,
    ];
    let mut points = Vec::with_capacity(15);
    for fy in [1.0 / 6.0, 0.5, 5.0 / 6.0] {
        for x in xs {
            points.push((x, text.y + text.h * fy));
        }
    }
    points
}

/// Alpha below which a sample paints nothing a reader could see.
const CLEAR_ALPHA: f64 = 0.005;

/// What a box's background layers paint inside `text`, when every layer is a
/// gradient (or `none`) whose geometry this can read.
pub fn gradient_paint_under_text(layers: &BackgroundLayers<'_>, paint: &PaintBox, text: &Box2) -> UnderText {
    if !text.finite() || !(text.w > 0.0 && text.h > 0.0) || !paint.border_box.finite() {
        return UnderText::Unknown;
    }
    let images = split_top_level_commas(layers.image);
    if images.is_empty() {
        return UnderText::Unknown;
    }
    let shorthand = split_top_level_commas(layers.shorthand);
    if shorthand.len() != images.len() {
        return UnderText::Unknown;
    }
    struct Layer {
        gradient: Gradient,
        tile: Box2,
        area: Box2,
        repeat: (bool, bool),
    }
    let mut parsed: Vec<Layer> = Vec::new();
    for (i, image) in images.iter().enumerate() {
        let image = js::trim(image);
        if js::to_lower_case(image) == "none" {
            continue;
        }
        let Some(gradient) = Gradient::parse(image) else {
            return UnderText::Unknown;
        };
        let meta = parse_shorthand_layer(&shorthand[i]);
        if meta.fixed {
            return UnderText::Unknown;
        }
        let b = &paint.border_box;
        let [bt, br, bb, bl] = paint.border;
        let [pt, pr, pb, pl] = paint.padding;
        let area = match meta.origin.as_deref() {
            Some("border-box") => *b,
            Some("content-box") => Box2::new(b.x + bl + pl, b.y + bt + pt, b.w - bl - br - pl - pr, b.h - bt - bb - pt - pb),
            _ => Box2::new(b.x + bl, b.y + bt, b.w - bl - br, b.h - bt - bb),
        };
        if !area.finite() || !(area.w > 0.0 && area.h > 0.0) {
            return UnderText::Unknown;
        }
        let size = layer_value(layers.size, i);
        let position = layer_value(layers.position, i);
        let Some(tile) = tile_box(&size, &position, area.w, area.h) else {
            return UnderText::Unknown;
        };
        parsed.push(Layer { gradient, tile, area, repeat: meta.repeat });
    }
    if parsed.is_empty() {
        return UnderText::Misses;
    }
    let mut samples = Vec::with_capacity(9);
    for (px, py) in sample_points(text) {
        let mut acc = Premul::CLEAR;
        // The first layer paints on top, so composite from the last one up.
        for layer in parsed.iter().rev() {
            let Some((lx, ly)) = point_in_tile(&layer.tile, layer.repeat, px - layer.area.x, py - layer.area.y) else {
                continue;
            };
            let Some(color) = layer.gradient.color_at(lx, ly, layer.tile.w, layer.tile.h) else {
                return UnderText::Unknown;
            };
            acc = color.over(acc);
        }
        samples.push(acc);
    }
    if samples.iter().all(|s| s.a < CLEAR_ALPHA) {
        return UnderText::Misses;
    }
    UnderText::Paint(samples.into_iter().map(Premul::unpremultiply).collect())
}

fn layer_value(list: &str, index: usize) -> String {
    let parts = split_top_level_commas(list);
    if parts.is_empty() {
        return String::new();
    }
    js::trim(&parts[index % parts.len()]).to_string()
}

/// Whether a single gradient layer's tile, from its size and repeat alone,
/// cannot cover a line of text set at `font_size_px`: a tile that does not
/// repeat along an axis and is zero on that axis, or shorter than the font
/// size vertically. That is the underline drawn as `linear-gradient(#000,
/// #000) no-repeat 0 100% / 0% 2px`. The static engine has no layout, so
/// this is all it can say; anything else counts as covering.
pub fn gradient_tile_misses_text(size: &str, repeat: (bool, bool), font_size_px: f64) -> bool {
    if split_top_level_commas(size).len() > 1 {
        return false;
    }
    let tokens = top_level_tokens(&js::to_lower_case(size));
    let (w, h) = match tokens.as_slice() {
        [w] => (parse_len(w), None),
        [w, h] => (parse_len(w), parse_len(h)),
        _ => return false,
    };
    let zero = |l: Option<Len>| matches!(l, Some(Len::Px(v)) | Some(Len::Pct(v)) if v <= 0.0);
    let short = |l: Option<Len>| {
        font_size_px.is_finite() && font_size_px > 0.0 && matches!(l, Some(Len::Px(v)) if v < font_size_px)
    };
    (!repeat.0 && zero(w)) || (!repeat.1 && (zero(h) || short(h)))
}

/// The repeat axes an author declared for a box, from the
/// `background-repeat` longhand when present, else from the shorthand text.
pub fn repeat_from(longhand: &str, shorthand: &str) -> (bool, bool) {
    let long = js::trim(longhand);
    if !long.is_empty() {
        let first = split_top_level_commas(long).into_iter().next().unwrap_or_default();
        let lower = js::to_lower_case(&first);
        let tokens: Vec<&str> = lower.split_ascii_whitespace().collect();
        return repeat_axes(&tokens);
    }
    let first = split_top_level_commas(shorthand).into_iter().next().unwrap_or_default();
    parse_shorthand_layer(&first).repeat
}

/// The text colour and the surface colour a reader sees after the opacity
/// of the boxes between the text and its opaque surface is applied.
///
/// `layers` runs from the text's own element outward and stops before the
/// box that paints the surface: each entry is that box's own translucent
/// fill, if any, and its `opacity`. A group at `opacity < 1` fades its own
/// fill and everything inside it, including the glyphs, over whatever sits
/// behind it, so the fold composites in premultiplied space the way a
/// compositor does and flattens both over `surface` at the end.
pub fn fold_opacity(text: &Rgba, layers: &[(Option<Rgba>, f64)], surface: &Rgba) -> (Rgba, Rgba) {
    let mut fg = Premul::from(text);
    let mut bg = Premul::CLEAR;
    for (fill, opacity) in layers {
        if let Some(fill) = fill {
            let f = Premul::from(fill);
            fg = fg.over(f);
            bg = bg.over(f);
        }
        let o = if opacity.is_finite() { opacity.clamp(0.0, 1.0) } else { 1.0 };
        fg = fg.scale(o);
        bg = bg.scale(o);
    }
    (fg.flatten_over(surface), bg.flatten_over(surface))
}

/// A translucent colour flattened over an opaque one, without rounding, for
/// callers that composite further before they round.
pub fn over_unrounded(top: &Rgba, base: &Rgba) -> Rgba {
    let p = Premul::from(top).over(Premul::from(base));
    p.unpremultiply()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn rgb(r: f64, g: f64, b: f64) -> Rgba {
        Rgba::new(r, g, b, 1.0)
    }

    fn layers<'a>(image: &'a str, size: &'a str, position: &'a str, shorthand: &'a str) -> BackgroundLayers<'a> {
        BackgroundLayers { image, size, position, shorthand }
    }

    fn plain_box(x: f64, y: f64, w: f64, h: f64) -> PaintBox {
        PaintBox { border_box: Box2::new(x, y, w, h), ..Default::default() }
    }

    fn paint(u: UnderText) -> Vec<Rgba> {
        match u {
            UnderText::Paint(v) => v,
            other => panic!("expected paint, got {other:?}"),
        }
    }

    #[test]
    fn a_vertical_gradient_is_read_at_the_label_not_at_its_rim() {
        // askjo.ai: a 54px button whose top stop is the light rim.
        let image = "linear-gradient(rgb(193, 106, 87) 0%, rgb(148, 75, 59) 52%, rgb(149, 69, 52) 100%)";
        let shorthand = format!("rgba(0, 0, 0, 0) {image} repeat scroll 0% 0% / auto padding-box border-box");
        let bg = layers(image, "auto", "0% 0%", &shorthand);
        let samples = paint(gradient_paint_under_text(&bg, &plain_box(32.0, 606.0, 216.0, 54.0), &Box2::new(59.0, 625.0, 117.0, 15.0)));
        assert_eq!(samples.len(), 15);
        let lightest = samples.iter().map(|c| c.r).fold(0.0, f64::max);
        assert!(lightest < 170.0, "{samples:?}");
        assert!(lightest > 148.0, "{samples:?}");
    }

    #[test]
    fn a_long_line_is_read_where_its_last_word_sits() {
        // A banner black until 85% of its width, then to white. The copy runs
        // the full width, so its last word sits on the light end, which a
        // grid kept a sixth inside the text box never reaches.
        let image = "linear-gradient(90deg, rgb(0, 0, 0) 0%, rgb(0, 0, 0) 85%, rgb(255, 255, 255) 100%)";
        let shorthand = format!("rgba(0, 0, 0, 0) {image} repeat scroll 0% 0% / auto padding-box border-box");
        let bg = layers(image, "auto", "0% 0%", &shorthand);
        let banner = plain_box(0.0, 0.0, 520.0, 36.0);
        let line = paint(gradient_paint_under_text(&bg, &banner, &Box2::new(16.0, 8.0, 488.0, 20.0)));
        let lightest = line.iter().map(|c| c.r).fold(0.0, f64::max);
        assert!(lightest > 190.0, "{line:?}");
        // Short copy at the dark end is read on black.
        let short = paint(gradient_paint_under_text(&bg, &banner, &Box2::new(16.0, 8.0, 120.0, 20.0)));
        assert!(short.iter().all(|c| c.r < 1.0), "{short:?}");
        // A text box that ends where its painting box ends still lands inside
        // it, half a pixel in.
        let flush = paint(gradient_paint_under_text(
            &bg,
            &plain_box(0.0, 0.0, 520.0, 36.0),
            &Box2::new(0.0, 8.0, 520.0, 20.0),
        ));
        let lightest = flush.iter().map(|c| c.r).fold(0.0, f64::max);
        assert!(lightest > 250.0, "{flush:?}");
        assert!(flush.iter().all(|c| c.alpha_or_one() > 0.99), "{flush:?}");
    }

    #[test]
    fn corner_directions_and_angles_agree_on_a_square() {
        let a = Gradient::parse("linear-gradient(to right bottom, rgb(0, 0, 0), rgb(255, 255, 255))").unwrap();
        let b = Gradient::parse("linear-gradient(135deg, rgb(0, 0, 0), rgb(255, 255, 255))").unwrap();
        for (x, y) in [(0.0, 0.0), (25.0, 75.0), (100.0, 100.0), (50.0, 50.0)] {
            let ca = a.color_at(x, y, 100.0, 100.0).unwrap();
            let cb = b.color_at(x, y, 100.0, 100.0).unwrap();
            assert!((ca.r - cb.r).abs() < 1e-6, "{x},{y}: {ca:?} vs {cb:?}");
        }
        let top_left = a.color_at(0.0, 0.0, 100.0, 100.0).unwrap();
        let bottom_right = a.color_at(100.0, 100.0, 100.0, 100.0).unwrap();
        assert!(top_left.r < 1.0 && bottom_right.r > 254.0);
        // On a wide box `to right bottom` still reaches its end colour at the corner.
        let wide = a.color_at(1280.0, 392.0, 1280.0, 392.0).unwrap();
        assert!(wide.r > 254.0, "{wide:?}");
    }

    #[test]
    fn a_radial_glow_that_has_faded_paints_nothing_under_the_pill() {
        let image = "radial-gradient(620px 360px at 50% 38%, rgba(63, 227, 223, 0.2) 0%, rgba(202, 255, 175, 0.14) 36%, rgba(255, 255, 255, 0) 74%)";
        let shorthand = format!("{image} repeat scroll 0% 0% / auto padding-box border-box");
        let bg = layers(image, "auto", "0% 0%", &shorthand);
        // Far outside the ellipse: every sample is clear.
        assert_eq!(gradient_paint_under_text(&bg, &plain_box(0.0, 0.0, 1280.0, 900.0), &Box2::new(20.0, 850.0, 80.0, 20.0)), UnderText::Misses);
        // At the centre the first stop paints.
        let centre = paint(gradient_paint_under_text(&bg, &plain_box(0.0, 0.0, 1280.0, 900.0), &Box2::new(630.0, 332.0, 20.0, 20.0)));
        assert!(centre.iter().all(|c| (c.alpha_or_one() - 0.2).abs() < 0.02), "{centre:?}");
    }

    #[test]
    fn an_underline_tile_is_not_under_the_glyphs() {
        // rtx.com: the hover underline, collapsed to 0% wide.
        let image = "linear-gradient(rgb(0, 0, 0), rgb(0, 0, 0))";
        let shorthand = format!("rgba(0, 0, 0, 0) {image} no-repeat scroll 0% 100% / 0% 2px padding-box border-box");
        let bg = layers(image, "0% 2px", "0% 100%", &shorthand);
        let host = plain_box(278.0, 40.0, 111.0, 31.0);
        let text = Box2::new(290.0, 46.0, 90.0, 19.0);
        assert_eq!(gradient_paint_under_text(&bg, &host, &text), UnderText::Misses);
        // Drawn full width it is still a 2px rule under the text box.
        let bg = layers(image, "100% 2px", "0% 100%", &shorthand);
        assert_eq!(gradient_paint_under_text(&bg, &host, &text), UnderText::Misses);
        // Repeating, a 2px tile covers the whole box.
        let tiled = format!("rgba(0, 0, 0, 0) {image} repeat scroll 0% 100% / 100% 2px padding-box border-box");
        let bg = layers(image, "100% 2px", "0% 100%", &tiled);
        assert!(matches!(gradient_paint_under_text(&bg, &host, &text), UnderText::Paint(_)));
    }

    #[test]
    fn unreadable_parts_answer_unknown() {
        let host = plain_box(0.0, 0.0, 100.0, 100.0);
        let text = Box2::new(10.0, 10.0, 50.0, 20.0);
        for image in [
            "conic-gradient(rgb(0, 0, 0), rgb(255, 255, 255))",
            "repeating-linear-gradient(rgb(0, 0, 0) 0px, rgb(255, 255, 255) 10px)",
            "linear-gradient(rgb(0, 0, 0) calc(10% + 2px), rgb(255, 255, 255))",
            "linear-gradient(in oklch, rgb(0, 0, 0), rgb(255, 255, 255))",
            "url(\"a.png\")",
        ] {
            let shorthand = format!("{image} repeat scroll 0% 0% / auto padding-box border-box");
            let bg = layers(image, "auto", "0% 0%", &shorthand);
            assert_eq!(gradient_paint_under_text(&bg, &host, &text), UnderText::Unknown, "{image}");
        }
        let image = "linear-gradient(rgb(0, 0, 0), rgb(255, 255, 255))";
        let fixed = format!("{image} repeat fixed 0% 0% / auto padding-box border-box");
        assert_eq!(gradient_paint_under_text(&layers(image, "auto", "0% 0%", &fixed), &host, &text), UnderText::Unknown);
        let shorthand = format!("{image} repeat scroll 0% 0% / auto padding-box border-box");
        assert_eq!(
            gradient_paint_under_text(&layers(image, "auto", "0% 0%", &shorthand), &host, &Box2::new(0.0, 0.0, 0.0, 0.0)),
            UnderText::Unknown
        );
    }

    #[test]
    fn stop_positions_fix_up_like_css() {
        let g = Gradient::parse("linear-gradient(rgb(0, 0, 0), rgb(100, 100, 100) 80%, rgb(200, 200, 200) 20%, rgb(255, 255, 255))").unwrap();
        let p = resolve_positions(&g.stops, 100.0).unwrap();
        assert_eq!(p, vec![0.0, 0.8, 0.8, 1.0]);
        let even = Gradient::parse("linear-gradient(red, lime, blue, black)").unwrap();
        let p = resolve_positions(&even.stops, 90.0).unwrap();
        assert!((p[1] - 1.0 / 3.0).abs() < 1e-9 && (p[2] - 2.0 / 3.0).abs() < 1e-9);
        // Two positions on one stop make a hard band.
        let band = Gradient::parse("linear-gradient(to right, rgb(0, 0, 0) 0% 50%, rgb(255, 255, 255) 50% 100%)").unwrap();
        assert!(band.color_at(49.0, 0.0, 100.0, 10.0).unwrap().r < 1.0);
        assert!(band.color_at(51.0, 0.0, 100.0, 10.0).unwrap().r > 254.0);
    }

    #[test]
    fn the_static_coverage_test_reads_size_and_repeat() {
        let layer = parse_shorthand_layer("linear-gradient(#000, #000) no-repeat 0 100% / 0% 2px");
        assert_eq!(layer.repeat, (false, false));
        assert_eq!(layer.size.as_deref(), Some("0% 2px"));
        let minified = parse_shorthand_layer("linear-gradient(#000,#000) no-repeat 0 100%/100% 2px");
        assert_eq!(minified.size.as_deref(), Some("100% 2px"));
        assert!(gradient_tile_misses_text("0% 2px", layer.repeat, 16.0));
        assert!(gradient_tile_misses_text("100% 2px", (false, false), 16.0));
        assert!(!gradient_tile_misses_text("100% 2px", (true, true), 16.0));
        assert!(!gradient_tile_misses_text("100% 100%", (false, false), 16.0));
        assert!(!gradient_tile_misses_text("auto", (false, false), 16.0));
        assert_eq!(repeat_from("repeat-x", ""), (true, false));
        assert_eq!(repeat_from("", "linear-gradient(red, red) no-repeat"), (false, false));
    }

    #[test]
    fn opacity_fades_the_glyphs_toward_their_surface() {
        // yna.co.kr: a span at opacity 0.5 on a white footer.
        let (fg, bg) = fold_opacity(&rgb(210.0, 152.0, 64.0), &[(None, 0.5)], &rgb(255.0, 255.0, 255.0));
        assert_eq!(fg, rgb(233.0, 204.0, 160.0));
        assert_eq!(bg, rgb(255.0, 255.0, 255.0));
        // A dark card faded to half over white fades its own fill too.
        let (fg, bg) = fold_opacity(&rgb(255.0, 255.0, 255.0), &[(None, 1.0), (Some(rgb(0.0, 0.0, 0.0)), 0.5)], &rgb(255.0, 255.0, 255.0));
        assert_eq!(fg, rgb(255.0, 255.0, 255.0));
        assert_eq!(bg, rgb(128.0, 128.0, 128.0));
    }
}
