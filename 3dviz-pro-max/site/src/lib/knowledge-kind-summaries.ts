// What each knowledge_kind is, in one line, keyed by the directory name build-data emits. The store
// describes its records, never its kinds, and the reference pages under
// skills/3dviz-pro-max/references/catalog-knowledge/ are generated indexes — so these lines
// are page copy (the maintainer's, written against the records' own titles), like chapter-subtitles.
//
// A kind with no line here is an authoring error, not a variant: `knowledgeKindSummary` throws, and
// tests/catalog-data.test.mjs asserts these keys are exactly the kinds build-data emits.
const KNOWLEDGE_KIND_SUMMARIES = {
  blueprint:
    'A proved kit: a procedural module or glTF with parameters, sockets, a detail ladder and a proof capture at its tier.',
  'composition-profile':
    'How a scene is arranged so the subject reads: hero placement, comparison stages, rest areas, scale transitions.',
  'domain-validation':
    'A numeric or convention check a subject must pass: analytic against sampled values, units, coordinate frames, label sides.',
  'geometry-profile':
    'Construction contracts for shapes: bevels and normals, LOD transitions, tessellation, topology that survives export.',
  'inspection-pattern':
    'A way of looking at a built scene: cutaways, before-and-after stages, detail insets, measurements in declared units.',
  'interaction-profile':
    'What the viewer can do: selection and part identity, constrained manipulation, guided steps with an honest reset.',
  'lighting-profile':
    'A named lighting setup: key, fill, rim, practicals and sky, and the mood they produce together.',
  'material-profile':
    'Surface families: colour, roughness, metalness and wear, and how they read at the viewing distance.',
  'motion-profile':
    'How movement is authored and handed off: animation layers, articulation, skinning and morph ownership, clip events.',
  'object-archetype':
    'The parts, proportions and load paths of a recurring object class, decided before any template is opened.',
  'output-profile':
    'What leaves the scene: deterministic capture packages, embeddable hosts, streaming stages, exchange formats.',
  'physical-behavior':
    'Behaviour that is actually modelled: locomotion stance, buoyancy, bending, breakage thresholds, with its limits stated.',
  'presentation-profile':
    'Layer reveals, named viewpoints, relationship graphs and progressive disclosure that carry an explanation.',
  'reasoning-rule':
    'A decision rule the agent applies while planning or refining: when to bake, trace, re-frame or re-method.',
  'style-profile':
    'An art direction: palette, sky, fog, tone mapping, post and camera defaults, with the rationale for each value.',
  'theme-profile':
    'A subject-world theme: story clues by scale, the fiction-versus-reference boundary, variation without cloning.',
  'tool-adapter':
    'How a tool is driven: Blender bakes and exports, colour handoff to Three.js, capture and probe scripts, with their limits.',
  'validation-profile':
    'The parity and invariant checks a finished scene must pass: colours and normals, glTF round trips, identity and accessibility.',
} as const;

export type KnowledgeKind = keyof typeof KNOWLEDGE_KIND_SUMMARIES;

export function knowledgeKindSummary(kind: string): string {
  const summary = (KNOWLEDGE_KIND_SUMMARIES as Record<string, string>)[kind];
  if (!summary) throw new Error(`knowledge kind "${kind}" has no authored summary`);
  return summary;
}

export default KNOWLEDGE_KIND_SUMMARIES;
