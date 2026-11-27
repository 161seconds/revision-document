// tests/0020-fire-omp.test.mjs
// ADR-0020 and ADR-0026 (D-OMP-FIRE-1, D-OMP-CI-3): the real `omp` fire tests, split from 0020-fire-plugin-ext because the OMP
// block runs spawnSync (build, plugin link) that blocks the event loop of its process. In the shared file that starved the 10 s
// MCP timer of the VS Code setup check on ubuntu and macos. Two files run in two processes (same reason as the first split).
// ADR-0003: this file never imports from src/. The tests skip with a reason when omp is not on PATH.

import { describe, test } from "node:test";
import { CONC } from "./_lib/concurrency.mjs";
import assert from "node:assert/strict";
import http from "node:http";
import { spawn, spawnSync } from "node:child_process";
import { openSync, mkdtempSync, mkdirSync, writeFileSync, rmSync, existsSync, readdirSync } from "node:fs";
import { devNull, tmpdir } from "node:os";
import { join, resolve } from "node:path";

describe("ADR-0020 fire, OMP host", { concurrency: CONC }, () => {
  describe("ADR-0020 fire omp", () => {
    // ADR-0026 M7 (D-OMP-FIRE-1, T36-T42): the real `omp` (18.20.0, no login, no key) against a local fake
    // OpenAI-compatible model. The fake saves every request. A request with no tools gets summary text (compaction); a
    // request whose last message is not a tool message gets one tool call picked by a prompt keyword; the next request gets
    // text. The built package is linked with the host's own `omp plugin link <dir>` into a temp HOME
    // (startup.setupWizard false). Print mode runs with stdin from /dev/null (OMP reads stdin, row 28); RPC mode
    // (`omp --mode rpc`) runs through a small JSON-lines driver for the input event and compact.
    // Skipped when omp is not on PATH. Temp HOME only.

    const BUILD = resolve("build/build.mjs");
    const hasOmp = spawnSync("omp", ["--version"], { stdio: "ignore" }).status === 0;
    const RUN_MS = 120000;
    const PAYLOAD_HEAD = "context-mode keeps large output out of the conversation.";
    const CTX_TOOLS = ["ctx_execute", "ctx_batch", "ctx_index", "ctx_search", "ctx_resume", "ctx_stats", "ctx_doctor", "ctx_upgrade", "ctx_purge"];

    const text = (c) => (typeof c === "string" ? c : JSON.stringify(c));
    function provider(bodies) {
      let n = 0;
      return http.createServer((req, res) => {
        let b = "";
        req.on("data", (d) => { b += d; });
        req.on("end", () => {
          if (!req.url.includes("chat/completions")) { res.writeHead(200, { "content-type": "application/json" }); res.end(JSON.stringify({ data: [{ id: "fake" }] })); return; }
          n++;
          let body = {};
          try { body = JSON.parse(b); } catch { /* not JSON */ }
          bodies.push(body);
          const msgs = body.messages ?? [];
          const last = msgs.at(-1);
          const ch = (delta, fin) => res.write(`data: ${JSON.stringify({ id: "c" + n, object: "chat.completion.chunk", created: 1, model: "fake", choices: [{ index: 0, delta, finish_reason: fin ?? null }] })}\n\n`);
          res.writeHead(200, { "content-type": "text/event-stream" });
          if (!(body.tools ?? []).length) {
            ch({ role: "assistant", content: "R67_SUMMARY text" }); ch({}, "stop");
          } else if (last && last.role !== "tool") {
            const said = text(last.content);
            const call = said.includes("R67BIGREAD") ? ["read", { path: "big.txt" }]
              : said.includes("R67BIG") ? ["bash", { command: "seq 1 40000" }]
              : said.includes("R67STATS") ? ["ctx_stats", {}]
              : ["read", { path: "small.txt" }];
            ch({ role: "assistant", content: null, tool_calls: [{ index: 0, id: "call_" + n, type: "function", function: { name: call[0], arguments: JSON.stringify(call[1]) } }] });
            ch({}, "tool_calls");
          } else {
            ch({ role: "assistant", content: "done" }); ch({}, "stop");
          }
          res.write(`data: ${JSON.stringify({ id: "c" + n, object: "chat.completion.chunk", created: 1, model: "fake", choices: [], usage: { prompt_tokens: 1, completion_tokens: 1, total_tokens: 2 } })}\n\n`);
          res.end("data: [DONE]\n\n");
        });
      });
    }

    let pkg;
    function buildPkg() {
      if (pkg) return pkg;
      pkg = mkdtempSync(join(tmpdir(), "cm-ompfire-pkg-"));
      const built = spawnSync(process.execPath, [BUILD, "--out", pkg], { encoding: "utf8" });
      assert.equal(built.status, 0, built.stderr);
      return pkg;
    }

    /** A temp HOME with the fake model and the linked package; returns the dirs, env and the saved requests. */
    async function sandbox(t) {
      const d = mkdtempSync(join(tmpdir(), "cm-ompfire-"));
      t.after(() => rmSync(d, { recursive: true, force: true }));
      const home = join(d, "home");
      const agent = join(home, ".omp", "agent");
      const work = join(d, "work");
      mkdirSync(agent, { recursive: true });
      mkdirSync(work);
      writeFileSync(join(work, "small.txt"), "small file line\n");
      writeFileSync(join(work, "big.txt"), "line lorem ipsum dolor sit amet\n".repeat(3403));
      writeFileSync(join(work, "AGENTS.md"), "R67_AGENTS_MARKER project rule\n");
      const bodies = [];
      const srv = provider(bodies);
      await new Promise((r) => srv.listen(0, "127.0.0.1", r));
      t.after(() => srv.close());
      writeFileSync(join(agent, "models.yml"), `providers:\n  faketools:\n    baseUrl: http://127.0.0.1:${srv.address().port}/v1\n    apiKey: FAKE_KEY\n    api: openai-completions\n    models:\n      - id: fake\n        name: fake\n`);
      writeFileSync(join(agent, "config.yml"), "compaction:\n  keepRecentTokens: 1\nstartup:\n  setupWizard: false\n  checkUpdate: false\n");
      const env = { PATH: process.env.PATH, HOME: home, USERPROFILE: home, TMPDIR: tmpdir() };
      const link = spawnSync("omp", ["plugin", "link", buildPkg()], { cwd: work, env, encoding: "utf8", timeout: 120000, stdio: ["ignore", "pipe", "pipe"] });
      assert.equal(link.status, 0, `${link.stdout}${link.stderr}`);
      return { home, work, env, bodies };
    }

    /** Print mode, stdin from /dev/null. */
    const print = (s, prompt) => new Promise((resolveRun) => {
      const c = spawn("omp", ["-p", "--no-session", "--model", "faketools/fake", prompt], { cwd: s.work, env: s.env, stdio: [openSync(devNull, "r"), "ignore", "ignore"] });
      const k = setTimeout(() => c.kill("SIGKILL"), RUN_MS);
      c.on("close", () => { clearTimeout(k); resolveRun(); });
    });

    /** RPC mode: runs the steps ({ prompt } or { compact: true }) one after the other; returns the JSON lines seen. */
    async function rpc(s, steps) {
      const c = spawn("omp", ["--mode", "rpc", "--no-session", "--model", "faketools/fake"], { cwd: s.work, env: s.env, stdio: ["pipe", "pipe", "ignore"] });
      const seen = [];
      const waiters = [];
      let buf = "";
      c.stdout.on("data", (d) => {
        buf += d;
        let i;
        while ((i = buf.indexOf("\n")) >= 0) {
          const line = buf.slice(0, i);
          buf = buf.slice(i + 1);
          let j;
          try { j = JSON.parse(line); } catch { continue; }
          seen.push(j);
          for (const w of [...waiters]) if (w.f(j)) { waiters.splice(waiters.indexOf(w), 1); w.r(true); }
        }
      });
      const until = (f, ms = 90000) => new Promise((r) => { if (seen.some(f)) { r(true); return; } waiters.push({ f, r }); setTimeout(() => r(false), ms); });
      const send = (o) => c.stdin.write(JSON.stringify(o) + "\n");
      await until((j) => j.type === "ready", 30000);
      let id = 0;
      for (const step of steps) {
        id++;
        const before = seen.length;
        if (step.compact) { send({ id: String(id), type: "compact" }); await until((j) => seen.indexOf(j) >= before && j.type === "response" && j.command === "compact"); }
        else { send({ id: String(id), type: "prompt", message: step.prompt }); await until((j) => seen.indexOf(j) >= before && j.type === "agent_end"); }
      }
      c.stdin.end();
      await new Promise((r) => { const k = setTimeout(() => { c.kill("SIGKILL"); r(); }, 5000); c.on("close", () => { clearTimeout(k); r(); }); });
      return seen;
    }

    const system = (body) => (body.messages ?? []).filter((m) => m.role === "system" || m.role === "developer").map((m) => text(m.content)).join("\n");
    const toolText = (bodies) => bodies.flatMap((b) => (b.messages ?? []).filter((m) => m.role === "tool").map((m) => text(m.content))).at(-1) ?? "";
    const count = (hay, needle) => hay.split(needle).length - 1;

    /** Rows of one table from every context.db under the temp HOME. */
    async function rows(home, sql) {
      const { DatabaseSync } = await import("node:sqlite");
      const root = join(home, ".context-mode", "projects");
      if (!existsSync(root)) return [];
      const { readdirSync } = await import("node:fs");
      const out = [];
      for (const p of readdirSync(root)) {
        const f = join(root, p, "context.db");
        if (!existsSync(f)) continue;
        const db = new DatabaseSync(f);
        try { out.push(...db.prepare(sql).all()); } finally { db.close(); }
      }
      return out;
    }

    const opts = { skip: !hasOmp && "omp not on PATH", timeout: 300000 };

    test("D-OMP-FIRE-1 (T36, T37): print mode, the system text holds the OMP base, <project-context>, AGENTS.md, then the payload once; the 9 ctx_* tools are top-level", opts, async (t) => {
      const s = await sandbox(t);
      await print(s, "hi");
      const first = s.bodies.find((b) => (b.tools ?? []).length > 0);
      assert.ok(first, `omp sent ${s.bodies.length} requests, none with tools`);
      const sys = system(first);
      const base = sys.indexOf("RFC 2119");
      const pc = sys.indexOf("<project-context>");
      const payload = sys.indexOf(PAYLOAD_HEAD);
      assert.ok(base >= 0, "OMP base kept: " + sys.slice(0, 300));
      assert.ok(pc > base, "<project-context> after the base");
      assert.ok(sys.includes("R67_AGENTS_MARKER"), "AGENTS.md in the system text");
      assert.ok(payload > pc, "payload after <project-context>");
      assert.equal(count(sys, PAYLOAD_HEAD), 1, "payload once");
      const names = first.tools.map((x) => x.function?.name);
      for (const n of CTX_TOOLS) assert.ok(names.includes(n), `${n} top-level: ${names.join(",")}`);
      for (const n of ["read", "bash"]) assert.ok(names.includes(n), `${n} built-in kept`);
    });

    test("D-OMP-FIRE-1 (T37): the model calls ctx_stats and gets the stats text", opts, async (t) => {
      const s = await sandbox(t);
      await print(s, "R67STATS");
      const out = toolText(s.bodies);
      assert.ok(out.includes("context-mode"), out.slice(0, 400));
    });

    test("D-OMP-FIRE-1 (T38): tool_call denies a read of a 108 KB file and the model sees the ctx_execute redirect", opts, async (t) => {
      const s = await sandbox(t);
      await print(s, "R67BIGREAD");
      const out = toolText(s.bodies);
      assert.ok(out.includes("ctx_execute"), out.slice(0, 400));
      assert.ok(out.length < 4000, `the model got ${out.length} bytes, not the 108 KB file`);
    });

    test("D-OMP-FIRE-1 (T39): tool_result replaces a large bash output with the ctx_search hint; events and sources rows carry agent omp", opts, async (t) => {
      const s = await sandbox(t);
      await print(s, "R67BIG");
      const out = toolText(s.bodies);
      assert.ok(out.includes("ctx_search"), out.slice(0, 400));
      assert.ok(out.length < 20000, `the model got ${out.length} bytes, not the seq output`);
      const ev = await rows(s.home, "SELECT agent, kind FROM events");
      assert.ok(ev.some((r) => r.agent === "omp"), JSON.stringify(ev));
      assert.ok(!ev.some((r) => r.agent === "pi"), JSON.stringify(ev));
      const src = await rows(s.home, "SELECT agent FROM sources");
      assert.ok(src.length > 0 && src.every((r) => r.agent === "omp"), JSON.stringify(src));
    });

    test("D-OMP-FIRE-1 (T40): an RPC prompt writes a prompt row with the text; print mode writes none (host limit)", opts, async (t) => {
      const s = await sandbox(t);
      await print(s, "R67_PRINT_PROMPT");
      const printed = await rows(s.home, "SELECT body FROM events WHERE kind = 'prompt'");
      assert.ok(!printed.some((r) => String(r.body).includes("R67_PRINT_PROMPT")), JSON.stringify(printed));
      const seen = await rpc(s, [{ prompt: "R67_RPC_PROMPT read small" }]);
      assert.ok(seen.some((j) => j.type === "agent_end"), "RPC turn ended");
      const after = await rows(s.home, "SELECT agent, body FROM events WHERE kind = 'prompt'");
      assert.ok(after.some((r) => r.agent === "omp" && String(r.body).includes("R67_RPC_PROMPT")), JSON.stringify(after));
    });

    test("D-OMP-FIRE-1 (T41, T42): RPC prompt, compact, one more prompt: the next turn sends base + INSTRUCTIONS and OMP's summary", opts, async (t) => {
      const s = await sandbox(t);
      const seen = await rpc(s, [{ prompt: "R67_P1 read small" }, { compact: true }, { prompt: "R67_P2 read small again" }]);
      assert.equal(seen.filter((j) => j.type === "agent_end").length, 2, "two turns ended");
      assert.ok(seen.some((j) => j.type === "response" && j.command === "compact" && j.success !== false), "compact answered");
      const turn2 = s.bodies.filter((b) => (b.tools ?? []).length > 0 && JSON.stringify(b.messages ?? []).includes("R67_P2")).at(0);
      assert.ok(turn2, "turn 2 reached the model");
      const sys = system(turn2);
      assert.ok(sys.indexOf("RFC 2119") >= 0, "OMP base kept after compact");
      assert.equal(count(sys, PAYLOAD_HEAD), 1, "INSTRUCTIONS once after compact");
      assert.ok(JSON.stringify(turn2.messages).includes("R67_SUMMARY"), "OMP summary in the messages");
    });

    test.after?.(() => { if (pkg) rmSync(pkg, { recursive: true, force: true }); });
  });
});
