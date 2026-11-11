// Side accents through the regex engine's markup and style-object matchers.
// A left or right accent reports only on a card rounded away from the stripe:
// the rounded-* classes in the same tag, or the radius in the same style
// object. Each case uses a unique width so every finding attributes to one.

export function FlagTailwindRounded() {
  return <div className="border-l-4 border-teal-700 rounded-r-lg p-4">Rounded away from the stripe</div>;
}

export function FlagStyleObjectRounded() {
  return <div style={{ borderRight: '5px solid #0f766e', borderRadius: 12 }}>Style object on a rounded card</div>;
}

export function PassTailwindSquare() {
  return <div className="border-l-2 border-teal-700 p-4">Square callout with a left rule</div>;
}

export function PassTailwindUnderStripe() {
  return <div className="border-r-8 border-teal-700 rounded-r-lg p-4">Rounded only under the stripe</div>;
}

export function PassTailwindSquaredOff() {
  return <div className="border-s-4 border-teal-700 rounded-lg rounded-s-none p-4">Rounded, then squared off away from the stripe</div>;
}

export function PassStyleObjectSquare() {
  return <div style={{ borderLeft: '6px solid #0f766e', padding: 16 }}>Style object on a square box</div>;
}

// A style-object accent inside a media query key reads the object around it.
export function FlagObjectMediaRounded() {
  return <Box sx={{ borderRadius: '12px', '@media (min-width: 600px)': { borderLeft: '10px solid #0f766e' } }}>Rounded card</Box>;
}

export function PassObjectMediaSquare() {
  return <Box sx={{ borderRadius: 0, '@media (min-width: 600px)': { borderLeft: '11px solid #0f766e' } }}>Square box</Box>;
}
