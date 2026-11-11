# Live v2: architecture plan

> **Status (2026-07-27): implemented.** P0 through P3 landed in one pass: roots manifest (`skill/scripts/live/roots.mjs`, every live CLI re-anchors via `enterLiveRoot`), mount-ack protocol with per-variant render truth and persistent error card, server-first rehydration, AST scaffolder (`live/svelte-ast.mjs`) with source-preview fallback, unified mechanical accept (`live/accept-css.mjs`, compiler-pruned; `live-complete` refuses dirty source), revisioned preview dirs bumped per publish, attach probe with named root-mismatch diagnosis, monorepo runtime fixture, and e2e failing on preview-tree 404s. One deliberate deviation from section 3.3: the preview tree stays under `node_modules/.impeccable-live` because SvelteKit restricts vite `server.fs.allow` to src/lib, routes, .svelte-kit, and node_modules (verified: `.impeccable/` under the app root 403s); staleness is defeated by per-publish revision directories instead of watcher reliance. P4 (registry, consolidation, control-flow fixtures, nightly matrix) in flight.

Driven by the 2026-07-25 Codex session in `~/code/agent-reviews` (session `019f9bf4-24a3-7661-afc5-bba7eb1e327f`), where a SvelteKit monorepo live session hit a chain of failures: wrong project root, silent 404 on variant modules, flattened `{#each}` blocks, stale module republish, unrecoverable browser state loss, and an accept that appended CSS instead of merging it. Every finding below was verified against current source; this is not a transcription of the Codex report.

## 1. Verified findings (Codex claim → root cause in code)

| # | Codex finding | Verified root cause |
|---|---|---|
| 1 | Wrong monorepo root | `findMonorepoRoot()` (`skill/scripts/context.mjs:262-303`) only recognizes "official" monorepos (workspaces field, turbo/pnpm/nx/lerna markers). A plain repo with a nested `website/` app falls into the non-monorepo branch and roots at cwd. `nearestTargetContextRoot` deliberately ignores `package.json` as a marker. Nothing ever correlates the dev server's root with `projectRoot`. |
| 2 | Published mistaken for rendered | `arrivedVariants` is backfilled from `expectedVariants` on the agent's `--reply done` (`live/session-store.mjs:211-241`). On the component-preview path the browser never sends a mount checkpoint; success calls only `saveSession()` (`live-browser.js:5592`). There is no `mounted` / `mount_failed` anywhere in the protocol. |
| 3 | Silent mount failures | Import catch is `console.error` + `return false` (`live-browser.js:5413-5419`). First-mount failure calls `abortSvelteComponentInjection` (`:5621-5651`), which clears localStorage, resets to PICKING, shows a 5s toast, and tells the server nothing. Variant-switch failure has no user feedback at all (`:4941-4950`). |
| 4 | Svelte `{#each}` flattened | Prop extraction is pure regex (`live/svelte-component.mjs:18,44-88`). `{#each}` / `{/if}` block tokens become scalar string props (`prop0`, `prop5`); a 5-item loop scaffolds as one `<li>`. A second, independent slot-shift bug: `buildSvelteExpressionTextMap` (`live-browser.js:5830-5871`) zips source tokens against live text nodes by index, and block tokens consume slots. |
| 5 | Brittle temp module paths | Modules written to `<projectRoot>/node_modules/.impeccable-live/` but imported from `location.origin` root-relative (`live-browser.js:5163-5165`). Two roots that must agree by convention. Manifest/CSS come from the helper's `/source`; the executable module from the dev server. Two transports for one artifact. |
| 6 | Stale republish | Cache-bust is only a client-side `?t=Date.now()` on the leaf module (`live-browser.js:5377`). Vite's watcher ignores `node_modules`, so a rewrite of `vN.svelte` never invalidates the dev server's transform cache. Scaffold is write-once (`svelte-component.mjs:173`). No revision in the path; the runtime shim is memoized forever. |
| 7 | Browser-local state is a single point of failure | Every restore path gates on localStorage first (`live-browser.js:8196-8246`). Server `activeSessions` only enrich an already-known local id. Mount failure deliberately wipes local state, manufacturing the orphaned-durable-session case. |
| 8 | Parent context not discovered | Context root and project root are one variable. In the non-monorepo branch `repoRoot = absCwd` (`context.mjs:213`), so `website/` never looks one directory up for PRODUCT.md / DESIGN.md. The Codex session worked around it with symlinks that are still on disk. |
| 9 | DESIGN panel disagrees with helper | Two causes: the panel is content-driven (needs frontmatter/sidecar, `live-browser.js:11037-11068`) while `hasDesign` is presence-driven; and the server snapshot of context is frozen at module load (`live-server.mjs:61-65`) while `live.mjs` re-resolves per boot and reuses a running server. |
| 10 | Stop leaves `__runtime.js` | Sweeper skips non-directories and `__*` names (`svelte-component.mjs:732-742`). Confirmed still on disk in agent-reviews. Also unswept: accept receipts, session journals, deferred accepts in `os.tmpdir()`. |
| 11 | CSS appended, not merged | `appendCssToSvelteStyle` (`svelte-component.mjs:278-296`) splices the variant CSS before the last `</style>`. No reconciliation exists. Worse: `mergeOriginalTopLevelAttrs` (`:646-681`) copies the original root's classes onto the new markup, guaranteeing stale rules keep matching. |
| 12 | Incomplete param baking | `sanitizeAcceptedSvelteCss` early-returns unless CSS contains `data-impeccable-variant` (`svelte-component.mjs:311-312`), which authoring rules forbid on this path, so the entire steps/toggle pruning pipeline is unreachable dead code. Only `range` vars get substituted; `toggle` bakes the raw JS boolean (`true`) into CSS. |
| 13 | Formatting destroyed | `line.trimStart()` + one flat indent for every markup line (`svelte-component.mjs:544-547`); every CSS line reindented to 2 spaces (`:280`). No formatter anywhere. The Branch-H (HTML/JSX) path preserves relative indent; the Svelte path regressed against its own sibling. |
| 14 | Preview cascade ≠ accepted cascade | Svelte scoping is compile-time per file; a detached preview component inherits none of the route's scoped CSS, so variants reimplement everything. The runtime then injects the variant CSS a second time, re-prefixed and un-hashed (`live-browser.js:5220-5280`), with different specificity than the compiled copy. |
| 18 | Steer affordance | No Send button; Enter-only (`live-browser.js:9558-9712`). Good loading state, no queue-position feedback, 120s timeout blames the wrong component. The element-level Go bar has a visible submit button; the steer bar doesn't. |

Findings 15-17 (hook anti-pattern gaps, copy quality, visual-collision detection) are design-hook scope, not live scope; tracked separately.

Structural facts that explain why these all shipped:

- The 826-line `svelte-component.mjs`, which owns scaffolding, CSS append, and param baking, has **zero direct unit tests**. The only runtime Svelte fixture (`vite8-sveltekit`) has no props, no `{#if}`, no `{#each}`, no `<script>`.
- No runtime fixture has repo root ≠ app root. `nextjs-turborepo` is static-only and its one wrap case asserts `element_not_found`.
- The e2e console check allowlists 404s, the exact signal of a missing variant module.
- Accept has two implementations. The correct merge semantics (carbonize's five steps) exist only as prose in `live.md`, and apply only to the HTML/JSX path. The Svelte path hard-codes `carbonize: false` = "nothing to do."
- `projectRoot` is an ambient parameter (child-process cwd), re-derived independently in at least 12 scripts, never persisted, never validated.

## 2. Diagnosis: five structural problems

1. **Root identity is conflated and ambient.** Four distinct concepts travel as one cwd: repo root (git), app root (what the dev server serves), context root (where PRODUCT.md / DESIGN.md live), session root (where `.impeccable/live` state goes). Nothing validates the choice against reality.
2. **The protocol has no truth about rendering.** The server's state machine ends at "agent said done." Compile, import, and mount happen on the other side of a network boundary with no acknowledgement channel, so every failure past publish is invisible to the agent and the journal.
3. **The Svelte path is a parallel universe.** Its own scaffolding (regex, not AST), its own serving path (dev server + helper, two transports), its own CSS semantics (detached compile scope, double injection), and its own accept (append, no carbonize). Every one of this session's worst bugs lived in that universe.
4. **Acceptance enforces the wrong things.** Mechanical code handles locking, receipts, and markers well, but the actual quality contract (merge CSS, prune dead branches, bake params, format) is prose for one path and absent for the other. `live-complete.mjs` acknowledges without reading the file.
5. **Tests assert bookkeeping, not reality.** DOM mount is verified once, for one variant, in fake mode; component-preview "arrival" is the browser's own counter; accepted-source checks are marker absence plus one coarse regex. The failure modes that burned this session (404, stale module, nested root) have no test.

## 3. Target architecture

### 3.1 Root manifest: resolve once, pass explicitly, validate at attach

Introduce a single `resolveRoots(target)` in one module, producing a persisted manifest:

```json
{
  "appRoot": "/repo/website",        // nearest dir above target with package.json + dev-server config (vite/svelte/next/astro/nuxt config file)
  "repoRoot": "/repo",               // git root
  "contextRoot": "/repo",            // nearest dir from appRoot up to repoRoot holding PRODUCT.md/DESIGN.md
  "sessionRoot": "/repo/website/.impeccable/live",
  "resolvedFrom": "target:website/src/routes/+page.svelte"
}
```

- App-root detection keys on **dev-server config presence**, not monorepo brand markers. A nested `website/` with `vite.config.js` wins over the repo root regardless of workspaces fields. The "official monorepo" logic becomes one input, not the gatekeeper.
- Context discovery walks **up from appRoot to repoRoot** (git boundary), checking each level. This makes the agent-reviews symlink workaround unnecessary and removes the `repoRoot = absCwd` bug.
- The manifest is written into `server.json` at boot. Every helper script (`live-wrap`, `live-accept`, `live-poll`, `live-resume`, `live-status`, adapters) takes `--root` or reads the manifest; **none re-derives roots from cwd**. A helper invoked from a different cwd finds the manifest via upward search and uses it, instead of silently forking a second empty project (which also fixes the two-servers-two-ports failure in `readLiveServerInfo`).
- **Attach-time validation**: on handshake, the browser fetches a probe module the helper wrote under the assumed app root (`<appRoot>/.impeccable/live/preview/__probe.js`) through the **dev server origin**. If it 404s, the root assumption is wrong or the dev server doesn't serve that tree; the session fails at boot with a named error (`preview_unreachable`, including both the assumed root and the failed URL) instead of failing silently at first variant. This one check would have caught the entire agent-reviews root fiasco in second one.

### 3.2 Delivery state machine with mount acknowledgements

Make the variant lifecycle explicit, per variant: `published → fetched → compiled → mounted | failed`.

- Browser emits `variant_mounted {variant, revision}` after a successful mount and `variant_mount_failed {variant, url, error}` from every import/mount catch, including variant switches. These are first-class events (like `agent_error`), not checkpoints, so they reach the agent's poll queue.
- Server phase reaches `variants_ready` only when at least one mount ack arrives; a new `variants_published` phase covers the gap. `arrivedVariants` is only ever incremented by mount acks; delete the `expectedVariants` backfill.
- UI: mount failure renders a **persistent error card** in the bar (failed URL, error, Retry button) and keeps the session alive. `abortSvelteComponentInjection`'s clear-everything behavior is deleted; state reset happens only on explicit user discard/exit.
- `live-resume.mjs` / `live-status.mjs` report the per-variant mount state, so the agent can distinguish "user is comparing" from "nothing ever rendered."

### 3.3 Variant serving: one transport, revisioned paths, watched directory

- Move the preview tree from `node_modules/.impeccable-live/` to `<appRoot>/.impeccable/live/preview/<sessionId>/r<revision>/`. Under the app root, Vite (and SvelteKit/Astro/Nuxt/TanStack, all Vite-family) serves and **watches** it, so republish invalidation is native HMR instead of a `?t=` fig leaf.
- **Revision in the path**, bumped on every publish. Republish = new directory; the old one is deleted. Staleness becomes structurally impossible; no query-string games, no memoized runtime shim problem (the shim lives inside the revisioned tree).
- The browser imports the module and reads params/manifest **through the same dev-server origin**; the helper `/source` route stays for source files only. One transport, one cache story. Respect the dev server's `base` by deriving the URL from the injected script's own URL rather than `location.origin`.
- Sweep the whole preview tree on stop and on boot (heals crashes and `kill -9`). Receipts, journals, and deferred accepts move under the same `sessionRoot` with a retention sweep at boot; the `os.tmpdir()` deferred-accepts file is retired.

### 3.4 Svelte scaffolding on the real AST

The project being edited has `svelte` installed; the scaffolder can `import('svelte/compiler')` from the **app's** node_modules (resolved from appRoot).

- `parse()` gives a real template AST. Control-flow blocks (`{#each}`, `{#if}`, `{#await}`, `{#snippet}`) are preserved as blocks. Collections cross the prop contract as **structured values** (the `{#each}` source expression becomes one array prop hydrated from the live DOM), never as flattened scalar text.
- The live-DOM-to-prop text mapping stops zipping by index; the AST tells us which text nodes are expressions and which are static.
- Round-trip invariant, enforced by test: `restore(scaffold(source)) === source` for every fixture component. This is the property the regex version silently broke.
- If `svelte/compiler` can't be resolved or the parse fails, fall back to **source-preview mode** (the wrapper path every other framework uses) rather than shipping a wrong scaffold. Degraded-but-correct beats clever-but-broken.
- Seed each variant stub with the source component's `<style>` rules that matched the selected element, so variants start from the real cascade instead of reimplementing it blind, and delete the runtime's second re-prefixed CSS injection (`applySvelteComponentVariantStyle`): the compiled component already carries its scoped styles.

### 3.5 One accept pipeline, mechanical reconcile, enforced postconditions

Collapse Branch S and Branch H into one flow: **splice markup → reconcile CSS → bake params → format → verify**.

- **CSS reconcile, not append.** Parse both the component's existing style block and the variant CSS (vendor `css-tree` or an equivalent small parser into `skill/scripts/live/`). Replace rules whose selectors match, append genuinely new rules. Then use the framework's own compiler as the dead-rule oracle: compile the accepted `.svelte` file and delete every rule the compiler reports as an unused selector. That deterministically removes the stale divider rules this session shipped.
- **Param baking driven by `params.json`**, not regex sniffing: `range` → substitute the literal (or set the var's new default), `steps` → keep the chosen `[data-p-*]` branch, rewrite to a semantic selector, delete siblings; `toggle` → normalize to `0`/`1`, same branch logic. Scrub every `data-p-*` / `data-impeccable-*` attribute from promoted markup. All pure functions, all unit-tested.
- **Formatting**: preserve relative indentation on splice (port Branch H's `deindentContent` approach), then run the project's own formatter if configured (detect prettier/biome config; run on the touched file only; skip silently if absent).
- **Postcondition gate**: a `verifyAcceptedSource(file)` scanner (no markers, no `data-p-*`, no `var(--p-`, no duplicate selectors vs. pre-accept, file parses in its framework). `live-complete.mjs` runs it and **refuses to complete while dirty**, returning findings for the agent to fix. The carbonize prose contract becomes enforced, and the same scanner runs in every e2e fixture.
- Add the generated-file refusal to the Svelte path (it currently only exists on Branch H).

### 3.6 Server-first browser rehydration

- On SSE `connected`, if localStorage has no session but the server reports active sessions for this page URL, **rehydrate from the server snapshot**: session id, phase, variant count, mount states, preview manifest, param values. localStorage becomes a cache for browser-only extras (scroll, picked-anchor viewport hint), not the source of truth.
- The snapshot already carries almost everything (`summarizeActiveSessionForClient`); add the picked-element anchor descriptor to the `generate` event payload so it is journaled and replayable.
- Result: closed tab, cleared storage, different browser profile, or the mount-failure wipe all recover to the same comparison. `live-resume.mjs`'s "tell the user to re-click Go" era ends.

### 3.7 Framework support as a registry with a conformance contract

Today framework knowledge is smeared across `live-inject.mjs`, two adapters, `live-wrap.mjs`, and browser special cases. Define a registry (`skill/scripts/live/frameworks/<name>.mjs`) where each entry declares:

```
detect(appRoot)            → confidence
inject / remove            → how live.js reaches the page (crash-safe: journal what was written, heal on boot)
previewStrategy            → 'source-wrapper' | 'component' (+ scaffolder)
cssAuthoring               → mode + styleTag
acceptStrategy             → shared pipeline options
conformance                → fixture name(s)
```

"Supported framework" then has an operational definition: **its fixture passes the shared conformance scenario battery** (pick → Go → all variants mount-verified → tune params → accept → postcondition scan → resume-after-reload → mount-failure recovery). Adding a framework = adding a registry entry + a fixture; the battery is the same for all. This is what makes each framework rock solid instead of anecdotally working.

## 4. Testing plan

**Unit (default suite, cheap):**
1. `svelte-component` scaffolder: round-trip property tests (`restore(scaffold(x)) === x`) over a corpus including `{#each}`, `{#if}/{:else}`, `{#await}`, `{@const}`, snippets, `<script module>`, expression-bearing attributes.
2. Accept pipeline: CSS reconciler (replace/append/delete cases, `@media` nesting), param baking per kind (including `calc()` in defaults and boolean normalization), postcondition scanner, indentation preservation on tab- and space-indented files.
3. Root manifest: table-driven cases for plain nested app, workspaces monorepo, turbo, context above app root, target vs cwd disagreement, two-servers prevention.

**Runtime e2e (hardened):**
4. **Monorepo fixture** (top priority): repo root with its own package.json, app in `apps/web` or `website/`, PRODUCT.md/DESIGN.md at repo root, dev server booted from the app dir. Asserts the manifest roots, probe validation, preview URLs, and accept landing in the right tree. Nothing today exercises root ≠ app root against a live server.
5. **Promote `vite8-sveltekit-stateful` to runtime and add `{#each}`**; assert expression survival (`assertSourceContains: ["{#each", "{expenses[0].name}"]`). Add the same expression-survival assertion to `vite8-react-mapped-list` (`{item.title}`), copying the `vite8-react-tsx-repeated-aside` pattern; today the suite green-lights baking literals into mapped lists.
6. **Mount proof for every variant**: per-variant computed-style markers in the fake agent, asserted for v1/v2/v3, on both preview paths, via DOM (never `debugState`).
7. **Fail on 404s**: remove `Failed to load resource ... 404` from the console allowlist; explicitly assert zero requests to the preview tree returned 404.
8. **Failure-injection scenarios** as first-class fixture options: delete `v2.svelte` before cycling (assert persistent error card + Retry + session survives), republish a corrected module (assert new revision mounts), kill localStorage mid-session (assert server rehydration), stop dev server before accept.
9. **Params end-to-end**: the harness clicks Tune, changes a range + a steps value, accepts, and asserts the baked output (today Tune is never clicked, so baking is never exercised).
10. **Accepted-source quality in every fixture**: run the shared postcondition scanner + `prettier --check` where the fixture has a config, instead of one coarse regex.

**Fake agent realism:**
11. Variants must include nested markup (the current single-flat-element output structurally cannot catch container bugs), a mapped list on list fixtures, and distinct per-variant markers.

**CI cadence:**
12. PR smoke set grows to include the monorepo fixture and the stateful Svelte fixture, and runs the failure scenarios (drop `SCENARIOS: core` gating for them). Full 20-fixture matrix moves from manual `workflow_dispatch` to a nightly cron with an issue filed on failure. Add a build check that fixture names in `ci.yml` match discovered runtime fixtures so the matrix can't silently drift.

## 5. Complexity and overhead reductions

- **Split `live-browser.js`** (11.7k lines, one file) into ES modules bundled at build time (the build system and `browser-script-parts.mjs` already exist). Unit-test the state machine and rehydration logic in jsdom; today the browser runtime is only testable end-to-end.
- **One protocol module**: event types, phases, checkpoint reasons, and agent_phase values as shared enums imported by the validator, the browser build, and docs. Delete the ~9 agent_phase values nothing emits, the duplicate cycling counters, and two of the three revision counters.
- **One root resolver, one glob matcher** (currently three glob implementations with "keep in sync" comments).
- **Session store**: cache snapshots in memory keyed by journal mtime; stop replaying the full journal on every append/read, and stop writing snapshots as a side effect of reads (`live-status` currently mutates state).
- **Crash-safe adapters**: injection journals what it wrote; boot heals leftovers (fixes the SIGKILL orphan and the `stop`-from-wrong-root orphan). `stop` sweeps the entire preview tree, receipts, and completed session journals.
- **Steer bar**: add the visible Send button (the Go bar already has one), queue-position feedback when a generate holds the lease, and reword the timeout message.
- **DESIGN panel**: serve context lazily (resolve on request, not at server module load) so a server outliving `impeccable document` stops lying; when DESIGN.md exists but has no parseable system, say that ("DESIGN.md found, no structured tokens") instead of "No design system data available."

## 6. Phasing

| Phase | Scope | Size |
|---|---|---|
| **P0: stop the bleeding** | Sweep `__runtime.js` + preview tree on stop/boot; persistent mount-error card + first-class `variant_mount_failed` event; delete the localStorage wipe on mount failure; context walk-up to git root; e2e: fail on 404s + expression-survival assertions (findings 3, 8, 10, partial 2) | days |
| **P1: roots** | Root manifest, explicit `--root` everywhere, attach-time probe validation, monorepo runtime fixture (findings 1, 5, 8) | ~1 wk |
| **P2: delivery truth** | Full mount-ack state machine, `arrivedVariants` from acks only, server-first rehydration, resume surfacing mount state, failure-injection e2e scenarios (findings 2, 3, 7) | ~1 wk |
| **P3: Svelte + accept** | AST scaffolder with source-preview fallback, revisioned preview tree under appRoot, single-transport serving, unified accept pipeline (reconcile + bake + format + postcondition gate), stateful Svelte fixture + params e2e (findings 4, 6, 11-14) | 2-3 wk |
| **P4: consolidation** | Framework registry + conformance battery, browser-runtime module split, protocol enum pruning, session-store caching, nightly full matrix (structural) | ongoing |

P0-P2 are independent of P3 and directly remove the four failure classes Codex ranked most costly (root detection, mount acks, Svelte scaffolding, accept merging); Svelte scaffolding and accept land in P3 because they need the parser and reconciler foundations.
