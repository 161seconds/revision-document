// The one-line subtitle each gallery chapter carries, keyed by the `## ` heading of
// examples/README.md that names it. The headings come from the data; these lines are page copy
// from the Daylight design, so they live here and not in the generated JSON.
//
// A heading with no line here is an authoring error, not a variant: `chapterSubtitle` throws, and
// tests/chapter-grouping.test.mjs asserts these keys are exactly the chapters build-data emits.
const CHAPTER_SUBTITLES = {
  'Crafted worlds, characters, architecture, and props':
    'Procedural geometry, no third-party model assets.',
  'Lighting studies': 'Source, receiver and shadow behaviour at night.',
  'Anatomy and physiology': 'Registered meshes credit BodyParts3D.',
  Mathematics: 'Geometry you can turn in your hands.',
  'Physics and mechanisms': 'Modelled behaviour, not decorative motion.',
} as const;

export type Chapter = keyof typeof CHAPTER_SUBTITLES;

export function chapterSubtitle(heading: string): string {
  const subtitle = (CHAPTER_SUBTITLES as Record<string, string>)[heading];
  if (!subtitle) throw new Error(`chapter "${heading}" has no authored subtitle`);
  return subtitle;
}

export default CHAPTER_SUBTITLES;
