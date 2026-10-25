#!/usr/bin/env node
/**
 * make-pack.mjs - compile the Hallmark skill text into a single system prompt.
 *
 * Two packs:
 *   --pack floor  SKILL.md "The Floor" + "Flow" sections only,
 *                 behind a 3-line one-shot preamble. The cheapest prompt that
 *                 should still hold the non-negotiables.
 *   --pack full   The entire SKILL.md plus references/craft.md and the gate
 *                 table portion of gates.md, concatenated with file-path separators.
 *
 * Usage:
 *   node eval/make-pack.mjs --pack floor              # size summary
 *   node eval/make-pack.mjs --pack floor --list       # what the pack includes
 *   node eval/make-pack.mjs --pack full --out /tmp/full.txt
 *
 * Node 18+, zero dependencies.
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const EVAL_DIR = dirname(fileURLToPath(import.meta.url));
const SKILL_DIR = resolve(EVAL_DIR, "..", "skills", "hallmark");
const SKILL_MD = resolve(SKILL_DIR, "SKILL.md");
const REFS = resolve(SKILL_DIR, "references");

// One-shot preamble: the skill assumes an agentic harness with file writes and
// scripts; a bare chat completion has neither, so the output contract must be
// restated up front. Kept to three lines by design.
const PREAMBLE = [
  "You are running the Hallmark design skill. Produce a complete single-file index.html with all of its CSS inline in one <style> tag and any JS inline; no build step, no external images (Google Fonts via <link> is allowed).",
  "You have no file system, no scripts, and no tools: apply every rule below yourself, including the slop gates, before you emit. Real copy only, no lorem ipsum, no placeholder boxes.",
  "Output the final page as ONE fenced ```html block from <!doctype html> to </html>. Emitting that block ends the task; write nothing after it.",
].join("\n");

/** Extract a section from markdown: the heading line through the line before
 *  the next heading of the same or higher level. Trailing `---` rules that
 *  merely separate it from the next section are trimmed. */
function extractSection(markdown, headingText) {
  const lines = markdown.split("\n");
  const headingRe = /^(#{1,6})\s+(.*)$/;
  let start = -1;
  let level = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(headingRe);
    if (m && m[2].trim() === headingText) {
      start = i;
      level = m[1].length;
      break;
    }
  }
  if (start < 0) throw new Error(`heading not found in SKILL sources: "${headingText}"`);
  let end = lines.length;
  for (let i = start + 1; i < lines.length; i++) {
    const m = lines[i].match(headingRe);
    if (m && m[1].length <= level) {
      end = i;
      break;
    }
  }
  const body = lines.slice(start, end);
  while (body.length && /^(---\s*|\s*)$/.test(body[body.length - 1])) body.pop();
  return body.join("\n");
}

/** The gate table portion of gates.md: from "## 4. The gates" to the end. */
function gatePortion(text) {
  const idx = text.search(/^## 4\. The gates/m);
  if (idx < 0) throw new Error('gates.md: "## 4. The gates" heading not found');
  return text.slice(idx).trimEnd();
}

function sep(relPath) {
  return `\n\n===== FILE: ${relPath} =====\n\n`;
}

function buildFloor() {
  const skill = readFileSync(SKILL_MD, "utf8");
  const parts = [
    { label: "preamble (3 lines)", text: PREAMBLE },
    { label: 'SKILL.md :: "The Floor"', text: extractSection(skill, "The Floor") },
    { label: 'SKILL.md :: "Flow"', text: extractSection(skill, "Flow") },
  ];
  const text =
    PREAMBLE +
    sep("skills/hallmark/SKILL.md (The Floor + Flow)") +
    parts[1].text +
    "\n\n" +
    parts[2].text +
    "\n";
  return { parts, text };
}

function buildFull() {
  const files = [
    ["skills/hallmark/SKILL.md", SKILL_MD, (t) => t],
    ["skills/hallmark/references/craft.md", resolve(REFS, "craft.md"), (t) => t],
    ["skills/hallmark/references/gates.md (gate table portion)", resolve(REFS, "gates.md"), gatePortion],
  ];
  const parts = [{ label: "preamble (3 lines)", text: PREAMBLE }];
  let text = PREAMBLE;
  for (const [rel, abs, transform] of files) {
    const t = transform(readFileSync(abs, "utf8")).trimEnd();
    parts.push({ label: rel, text: t });
    text += sep(rel) + t;
  }
  return { parts, text: text + "\n" };
}

// ---------------------------------------------------------------------------

function parseArgs(argv) {
  const args = { pack: null, out: null, list: false };
  for (let i = 2; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--pack") args.pack = argv[++i];
    else if (a === "--out") args.out = argv[++i];
    else if (a === "--list") args.list = true;
    else {
      console.error(`unknown argument: ${a}`);
      process.exit(2);
    }
  }
  if (!["floor", "full"].includes(args.pack ?? "")) {
    console.error("usage: node eval/make-pack.mjs --pack floor|full [--out <file>] [--list]");
    process.exit(2);
  }
  return args;
}

const approxTokens = (s) => Math.round(s.length / 4);

const args = parseArgs(process.argv);
const { parts, text } = args.pack === "floor" ? buildFloor() : buildFull();

if (args.list) {
  console.log(`pack "${args.pack}" includes:`);
  for (const p of parts) {
    console.log(`  - ${p.label}  (${p.text.length} chars, ~${approxTokens(p.text)} tok)`);
  }
  console.log(`  total: ${text.length} chars, ~${approxTokens(text)} tok`);
} else if (args.out) {
  mkdirSync(dirname(resolve(args.out)), { recursive: true });
  writeFileSync(resolve(args.out), text, "utf8");
  console.log(`wrote ${resolve(args.out)} (${text.length} chars, ~${approxTokens(text)} tok)`);
} else {
  console.log(
    `pack "${args.pack}": ${parts.length} part(s), ${text.length} chars, ~${approxTokens(text)} tok`,
  );
}
