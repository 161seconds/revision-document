#!/usr/bin/env node
// Tier A eval harness: drive the REAL Claude Code binary against a brief with
// the Hallmark skill installed, and measure conformance on the real harness
// (load-order discipline, stamp, files written) - not just bare-API
// instruction-following like Tier B (gen-direct.py).
//
//   node gen-cli.mjs --brief b1|all --arm claude|bare|glm|kimi|all [--force] [--dry-run]
//                     [--model sonnet|opus|...] [--effort low|medium|high|max]
//                     [--budget-usd 5] [--max-turns 60] [--tag v27]
//
// --budget-usd caps spend per cell (default 5). A measured derived build on
// Opus lands near $3 and stops mid Step-7 at the old cap of 3, which scores a
// complete artifact as an error_max_budget_usd failure and never exercises the
// gate sweep. Raise it rather than reading a truncated run as a skill result.
//
// A/B: the "bare" arm is the no-skill control - same binary, same auth, plain
// brief prompt, NO skill copied, and --setting-sources project on the call so
// the user-scope ~/.claude/skills install cannot leak in (applied to BOTH arms
// so the skill arm always runs the project-scope copy). stampPresent on a bare
// cell doubles as the leak detector (must be false).
//
// IMPORTANT (measured): skills do NOT auto-trigger in `claude -p` headless mode,
// so we invoke the skill BY NAME ("/hallmark <brief>"). This is a CONFORMANCE
// harness (does the skill FOLLOW its discipline), not an auto-trigger test.
//
// Auth: the `claude` arm sets NO key and uses your Claude subscription -
// run it in a terminal where `claude` is logged in. The open-model arms
// (glm via Z.ai, kimi via Moonshot) are Anthropic-shaped and DISABLED until you
// add ZAI_AUTH_TOKEN / MOONSHOT_AUTH_TOKEN for them; Together/OpenRouter cannot back
// `claude -p` (it needs an Anthropic-shaped endpoint).
//
// Output: eval/runs/<brief>/<arm>-cli/{index.html?, transcript.jsonl, run.json}
// reusing the Tier B run.json schema plus Tier-A fields (skillLoaded, filesWritten,
// refReads, loadOrderOk).

import { readFileSync, writeFileSync, mkdirSync, existsSync, cpSync, rmSync, readdirSync } from "node:fs";
import { spawn } from "node:child_process";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = dirname(fileURLToPath(import.meta.url));
const REPO = dirname(ROOT);
const SKILL_SRC = join(REPO, "skills", "hallmark");
const RUNS = join(ROOT, "runs");
const SCRATCH = join(ROOT, "_cli-scratch");

// --- arms (Tier A only; Anthropic-shaped endpoints) ------------------------
const ARMS = {
  "claude": { model: null, enabled: true, skill: true, note: "Hallmark arm; Claude subscription; set NO key, must be logged in." },
  "bare":   { model: null, enabled: true, skill: false, note: "No-skill control; same binary and auth." },
  // Hallmark with a reference archive attached. Since fa12b99 signal 8 inverts the
  // flow: the archive owns Steps 1-6 and Hallmark enters at Step 7 as a sweep, so
  // this arm measures a different code path from "claude", not a better-resourced
  // version of it. Local stdio server, no credentials in the config.
  "inspo":  { model: null, enabled: true, skill: true, mcp: true, note: "Hallmark + Inspo MCP; exercises the signal-8 sweep path." },
  "glm":   { model: "glm-5.2[1m]", base: "https://api.z.ai/api/anthropic", tokenEnv: "ZAI_AUTH_TOKEN", enabled: false },
  "kimi":  { model: "kimi-k3", base: "https://api.moonshot.ai/anthropic", tokenEnv: "MOONSHOT_AUTH_TOKEN", enabled: false },
};

function parseArgs(argv) {
  const a = { brief: "all", arm: "all" };
  for (let i = 0; i < argv.length; i++) {
    const t = argv[i];
    if (t === "--force" || t === "--dry-run") a[t.slice(2)] = true;
    else if (t.startsWith("--")) a[t.slice(2)] = argv[++i];
  }
  return a;
}
const args = parseArgs(process.argv.slice(2));

const briefs = JSON.parse(readFileSync(join(ROOT, "briefs.json"), "utf8"));
const pickBriefs = args.brief === "all" ? briefs : briefs.filter((b) => b.id === args.brief);
const armIds = args.arm === "all" ? Object.keys(ARMS).filter((k) => ARMS[k].enabled) : args.arm.split(",");

// --- stream-json parsing: pull the signals we care about -------------------
function analyzeTranscript(lines, runDir) {
  let cost = null, model = null, sessionInit = false, resultText = "", isError = false, earlyStop = false;
  let usage = null, numTurns = null, stop = null;
  const refReads = [], filesWritten = [];
  for (const line of lines) {
    let ev; try { ev = JSON.parse(line); } catch { continue; }
    if (ev.type === "system" && ev.subtype === "init") { sessionInit = true; model = ev.model ?? model; }
    if (ev.type === "result") {
      cost = ev.total_cost_usd ?? cost; resultText = ev.result ?? resultText; isError = !!ev.is_error;
      numTurns = ev.num_turns ?? numTurns; stop = ev.subtype ?? stop;
      if (ev.usage && typeof ev.usage === "object" && "input_tokens" in ev.usage) usage = ev.usage;
      else if (ev.modelUsage) {
        usage = { input_tokens: 0, output_tokens: 0, cache_read_input_tokens: 0 };
        for (const m of Object.values(ev.modelUsage)) {
          usage.input_tokens += m.inputTokens ?? 0; usage.output_tokens += m.outputTokens ?? 0;
          usage.cache_read_input_tokens += m.cacheReadInputTokens ?? 0;
        }
      }
    }
    const record = (name, inp) => {
      const fp = (inp && (inp.file_path || inp.path)) || "";
      if (!fp) return;
      if (name === "Read") refReads.push(fp.replace(SKILL_SRC + "/", "").replace(runDir + "/", ""));
      if (name === "Write" || name === "Edit" || name === "MultiEdit") filesWritten.push(fp.replace(runDir + "/", ""));
    };
    // --verbose emits tool calls as full `assistant` messages (message.content[] tool_use blocks)
    if (ev.type === "assistant" && Array.isArray(ev?.message?.content)) {
      for (const b of ev.message.content) if (b?.type === "tool_use") record(b.name, b.input);
    }
    // --include-partial-messages emits them as stream_event/content_block_start instead
    const cb = ev?.event?.content_block;
    if (ev.type === "stream_event" && ev?.event?.type === "content_block_start" && cb?.type === "tool_use") {
      record(cb.name, cb.input);
    }
  }
  return { cost, model, sessionInit, resultText, isError, refReads, filesWritten, earlyStop, usage, numTurns, stop };
}

// Reference-read budget. A page build loads six files at Step 4 (layout, imagery,
// craft, the genre, the theme, gates.md) plus at most a few conditionals (one
// macrostructure, data-viz, texture) and the two review files; 12 still catches
// the failure this check exists for, defensive pre-loading of the reference tree.
const REF_BUDGET = 12;

function loadOrderCheck(refReads) {
  const refs = refReads.filter((r) => r.startsWith("references/") || r.endsWith(".md"));
  return { refCount: refs.length, refsWithinBudget: refs.length <= REF_BUDGET, refs };
}

// What MCP surface did the child actually have, and did it use any of it? Recorded
// on every run so a control arm can be proven clean rather than assumed clean.
function mcpAudit(lines) {
  let advertised = [], called = [];
  for (const l of lines) {
    let d; try { d = JSON.parse(l); } catch { continue; }
    if (d.type === "system" && Array.isArray(d.tools)) {
      advertised = d.tools.filter((t) => String(t).startsWith("mcp__"));
    }
    const blocks = d?.message?.content;
    if (Array.isArray(blocks)) {
      for (const b of blocks) {
        if (b?.type === "tool_use" && String(b.name).startsWith("mcp__")) called.push(b.name);
      }
    }
  }
  return { advertised, called: [...new Set(called)] };
}

function stampPresent(runDir) {
  // Scan every emitted artifact, not a fixed filename list: builds name their
  // stylesheet whatever the page wants (page.css, style.css, main.css), and a
  // measured derived run put the stamp in page.css while the old list checked
  // index.html / styles.css / tokens.css only. The marker is also not always
  // flush against the comment open, since a derived header reads
  // "/* <Brand> · Hallmark derived system", so match Hallmark anywhere in a
  // leading block comment rather than immediately after the slash-star.
  let names;
  try { names = readdirSync(runDir); } catch { return false; }
  for (const name of names) {
    if (!/\.(css|html)$/i.test(name)) continue;
    const src = readFileSync(join(runDir, name), "utf8");
    if (/\/\*[^*]{0,120}Hallmark/.test(src)) return true;
  }
  return false;
}

async function runCell(brief, armId) {
  const arm = ARMS[armId];
  const effortTag = (args.effort ? `-${args.effort}` : "") + (args.tag ? `-${args.tag}` : "");
  const cell = `${armId}${effortTag}-cli`;
  const runDir = join(RUNS, brief.id, cell);
  const runJson = join(runDir, "run.json");
  if (existsSync(runJson) && !args.force) { console.log(`skip  ${brief.id}/${cell} (run.json exists)`); return; }

  const work = join(SCRATCH, `${brief.id}-${armId}${effortTag}`);
  if (args["dry-run"]) { console.log(`would run ${brief.id}/${cell} in ${work}`); return; }

  rmSync(work, { recursive: true, force: true });
  if (arm.skill === false) {
    mkdirSync(work, { recursive: true });
  } else {
    mkdirSync(join(work, ".claude", "skills"), { recursive: true });
    cpSync(SKILL_SRC, join(work, ".claude", "skills", "hallmark"), { recursive: true });
  }
  mkdirSync(runDir, { recursive: true });

  const env = { ...process.env };
  delete env.ANTHROPIC_API_KEY; // never spend the API key; use the subscription
  delete env.ANTHROPIC_BASE_URL; // a host session (e.g. running inside Claude Code) exports this and breaks child auth
  for (const k of Object.keys(env)) if (/^CLAUDE(CODE$|_CODE_|_)/.test(k)) delete env[k]; // shed host-session vars
  if (arm.base) {
    env.ANTHROPIC_BASE_URL = arm.base;
    env.ANTHROPIC_MODEL = arm.model;
    const tok = process.env[arm.tokenEnv];
    if (!tok) { console.log(`skip  ${brief.id}/${armId}-cli (missing ${arm.tokenEnv})`); return; }
    env.ANTHROPIC_AUTH_TOKEN = tok;
  }

  const prompt = arm.skill === false
    ? `${brief.brief}\nWrite the result as index.html (plus css files if you like) in the current directory. Infer what you need; do not ask questions.`
    : `/hallmark ${brief.brief}\nGo ahead and infer audience, use, and tone from the brief; do not ask me questions.`;
  const allowed = ["Read", "Write", "Edit", "Bash"];
  const cliArgs = ["-p", prompt, "--output-format", "stream-json", "--verbose",
    "--permission-mode", "acceptEdits",
    "--max-turns", String(args["max-turns"] || 60), "--max-budget-usd", String(args["budget-usd"] || 5), "--setting-sources", "project"];
  if (arm.mcp) {
    // Pointed at the user's own local Inspo checkout. Read from ~/.claude.json so
    // the arm follows wherever that server actually lives rather than hardcoding it.
    const home = JSON.parse(readFileSync(join(process.env.HOME, ".claude.json"), "utf8"));
    let inspo = null;
    (function walk(o) {
      if (!o || typeof o !== "object" || inspo) return;
      if (o.mcpServers && o.mcpServers.inspo) { inspo = o.mcpServers.inspo; return; }
      for (const v of Object.values(o)) walk(v);
    })(home);
    if (!inspo) { console.log(`skip  ${brief.id}/${cell} (no inspo server in ~/.claude.json)`); return; }
    const cfg = join(work, ".mcp-inspo.json");
    writeFileSync(cfg, JSON.stringify({ mcpServers: { inspo } }, null, 2));
    cliArgs.push("--mcp-config", cfg, "--strict-mcp-config");
    allowed.push("mcp__inspo");
  } else {
    // No archive arm means no MCP at all. Without this the child inherits whatever
    // servers live in the user's ~/.claude.json: a measured bare run was advertised
    // eight Google Drive tools it never asked for, which is not a clean control even
    // though it never called them. --strict-mcp-config with no --mcp-config is zero.
    cliArgs.push("--strict-mcp-config");
  }
  cliArgs.push("--allowedTools", allowed.join(","));
  for (const d of brief.addDirs || []) cliArgs.push("--add-dir", d.replace(/^~(?=\/)/, process.env.HOME));
  if (args.model) cliArgs.push("--model", args.model);
  if (args.effort) cliArgs.push("--effort", args.effort);

  const started = Date.now();
  console.log(`run   ${brief.id}/${cell} ...`);
  const lines = await new Promise((resolve) => {
    const p = spawn("claude", cliArgs, { cwd: work, env, stdio: ["ignore", "pipe", "pipe"] });
    const out = [];
    let buf = "";
    p.stdout.on("data", (d) => {
      buf += d.toString();
      let nl; while ((nl = buf.indexOf("\n")) >= 0) { const l = buf.slice(0, nl); buf += ""; buf = buf.slice(nl + 1); if (l.trim()) out.push(l); }
    });
    p.stderr.on("data", () => {});
    p.on("close", () => { if (buf.trim()) out.push(buf); resolve(out); });
    p.on("error", () => resolve(out));
  });

  writeFileSync(join(runDir, "transcript.jsonl"), lines.join("\n") + "\n");
  // Archive every top-level artifact, not a fixed filename list. Builds name
  // their stylesheet whatever the page wants (page.css cost one cell its
  // skillLoaded score when the stamp lived there and only tokens.css was
  // copied), and stampPresent scans this archive, so the archive must be whole.
  // A scaffolded build may write into a subfolder (site/, public/); archive the
  // first folder that holds an index.html, the work root first.
  const pageDir = [work, ...readdirSync(work).filter((d) => !d.startsWith(".")).map((d) => join(work, d))]
    .find((d) => existsSync(join(d, "index.html"))) || work;
  for (const f of readdirSync(pageDir)) {
    if (/\.(html|css)$/i.test(f)) cpSync(join(pageDir, f), join(runDir, f));
  }
  const a = analyzeTranscript(lines, work);
  const lo = loadOrderCheck(a.refReads);
  const run = {
    brief: brief.id, arm: cell, skill: arm.skill !== false, effort: args.effort ?? null,
    tier: "A", model: a.model ?? arm.model ?? "claude-subscription",
    ok: a.sessionInit && !a.isError, durationSec: +((Date.now() - started) / 1000).toFixed(1),
    costUSD: a.cost, turns: a.numTurns, stopSubtype: a.stop,
    tokens: a.usage ? { in: a.usage.input_tokens ?? null, out: a.usage.output_tokens ?? null,
      cacheRead: a.usage.cache_read_input_tokens ?? null } : null,
    skillLoaded: stampPresent(runDir),
    mcpAdvertised: mcpAudit(lines).advertised,
    mcpCalled: mcpAudit(lines).called,
    filesWritten: [...new Set(a.filesWritten)].slice(0, 20),
    refReadCount: lo.refCount,
    loadOrderOk: arm.skill === false ? null : lo.refsWithinBudget,
    refReads: lo.refs.slice(0, 20),
    resultPreview: (a.resultText || "").slice(0, 200), isError: a.isError,
    generatedAt: new Date().toISOString(),
  };
  writeFileSync(runJson, JSON.stringify(run, null, 2) + "\n");
  console.log(`done  ${brief.id}/${cell} | ok=${run.ok} skillLoaded=${run.skillLoaded} turns=${run.turns} cost=${run.costUSD} ${run.durationSec}s`);
}

// --- main ------------------------------------------------------------------
if (armIds.length === 0) { console.log("no enabled arms. Enable an arm in ARMS or pass --arm claude-cli."); process.exit(0); }
console.log(`Tier A: ${pickBriefs.length} brief(s) x ${armIds.length} arm(s): ${armIds.join(", ")}`);
if (args["dry-run"]) console.log("(dry run)");
for (const brief of pickBriefs) for (const armId of armIds) {
  if (!ARMS[armId]) { console.log(`unknown arm ${armId}`); continue; }
  await runCell(brief, armId);
}
