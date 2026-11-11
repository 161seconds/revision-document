/**
 * Scripted user bot for the new-work interactive smoke suite.
 *
 * Given a workspace directory, it discovers a running serve-question daemon
 * from `.impeccable/questions/<key>.state.json`, opens the served page in a
 * real browser, and drives it through a scripted policy: it clicks the real
 * `button.choose`, `#reroll`, and `#canon` controls, types into `#steer`, and
 * closes the tab for the exit-4 path. Because a real page runs the page's own
 * JS, heartbeats fire and re-roll reloads behave exactly as a user's would.
 *
 * The deterministic tier passes an already-launched Playwright browser in.
 * Run as a CLI (`--workspace DIR --policy '<json>'`) it launches its own
 * Chromium. The policy is an ordered list of actions:
 *
 *   { "pick": "assigned" }                    click the assigned card
 *   { "pick": "challenger-*" }                click the first matching card
 *   { "pickIndex": 1 }                        click the Nth choose button
 *   { "reroll": true, "steer": "warmer" }     type the steer, click Re-roll
 *   { "canon": true }                         click Play it straight
 *   { "close": true }                         close the tab (stops heartbeats)
 *
 * A `steer` on any action is typed into `#steer` first when the field exists.
 * After a re-roll the bot waits for the page to reload into the next hand
 * (delivered out of band by `serve-question --update`) before the next action.
 */

import { readdirSync, readFileSync, existsSync } from 'node:fs';
import path from 'node:path';

function questionsDir(workspaceDir) {
  return path.join(workspaceDir, '.impeccable', 'questions');
}

// Resolve the served URL from the daemon state file. When no key is given and
// several exist, the newest wins.
export function resolveQuestion(workspaceDir, key = null) {
  const dir = questionsDir(workspaceDir);
  if (!existsSync(dir)) throw new Error(`no questions dir at ${dir}`);
  const stateFiles = readdirSync(dir).filter((f) => f.endsWith('.state.json'));
  if (stateFiles.length === 0) throw new Error(`no *.state.json in ${dir}`);
  let file;
  if (key) {
    file = `${key}.state.json`;
    if (!stateFiles.includes(file)) throw new Error(`no state file for key ${key}`);
  } else {
    file = stateFiles
      .map((f) => ({ f, mtime: readFileSync(path.join(dir, f), 'utf8') && f }))
      .sort()
      .pop().f;
  }
  const resolvedKey = file.replace(/\.state\.json$/, '');
  const state = JSON.parse(readFileSync(path.join(dir, file), 'utf8'));
  return { key: resolvedKey, url: state.url, port: state.port, pid: state.pid };
}

function stateLastBeat(workspaceDir, key) {
  try {
    const state = JSON.parse(readFileSync(path.join(questionsDir(workspaceDir), `${key}.state.json`), 'utf8'));
    return state.lastBeat || 0;
  } catch {
    return 0;
  }
}

async function typeSteer(page, action) {
  if (action.steer == null) return;
  const steer = await page.$('#steer');
  if (steer) await steer.fill(String(action.steer));
}

function chooseSelector(pick) {
  if (pick.endsWith('*')) {
    const prefix = pick.slice(0, -1);
    return `button.choose[data-id^="${prefix}"]`;
  }
  return `button.choose[data-id="${pick}"]`;
}

async function runAction(page, action, { workspaceDir, key }) {
  await typeSteer(page, action);

  if (action.reroll) {
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'load', timeout: 60000 }).catch(() => {}),
      page.click('#reroll'),
    ]);
    // Fresh hand loaded: wait for the interactive controls of the next round.
    await page.waitForSelector('button.choose', { timeout: 30000 });
    return { action: 'reroll', reloaded: true };
  }

  if (action.canon) {
    await page.click('#canon');
    return { action: 'canon' };
  }

  if (action.close) {
    // Make sure at least one heartbeat has been recorded so the --wait poll can
    // later see the beat go stale (the exit-4 PAGE CLOSED path).
    const deadline = Date.now() + 8000;
    while (Date.now() < deadline && !stateLastBeat(workspaceDir, key)) {
      await page.waitForTimeout(200);
    }
    await page.close();
    return { action: 'close', beat: stateLastBeat(workspaceDir, key) };
  }

  if (action.pickIndex != null) {
    const buttons = await page.$$('button.choose');
    const btn = buttons[action.pickIndex];
    if (!btn) throw new Error(`no choose button at index ${action.pickIndex}`);
    await btn.click();
    return { action: 'pick', index: action.pickIndex };
  }

  if (action.pick) {
    await page.click(chooseSelector(action.pick));
    return { action: 'pick', id: action.pick };
  }

  throw new Error(`unknown action: ${JSON.stringify(action)}`);
}

/**
 * Drive the served question page through the policy. Pass a launched
 * Playwright `browser` (deterministic tier) or omit it to launch Chromium.
 */
export async function runUserBot({ workspaceDir, key = null, policy = [], browser = null }) {
  let ownBrowser = null;
  let pw = null;
  if (!browser) {
    pw = await import('playwright');
    ownBrowser = await pw.chromium.launch({ headless: true });
    browser = ownBrowser;
  }
  const question = resolveQuestion(workspaceDir, key);
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(question.url, { waitUntil: 'load' });
  await page.waitForSelector('button.choose', { timeout: 30000 });

  const results = [];
  let closed = false;
  try {
    for (const action of policy) {
      const result = await runAction(page, action, { workspaceDir, key: question.key });
      results.push(result);
      if (result.action === 'close') { closed = true; break; }
      // Give the answer POST time to land before the process may exit.
      if (result.action === 'pick' || result.action === 'canon') {
        await page.waitForTimeout(300);
      }
    }
  } finally {
    if (!closed) await context.close().catch(() => {});
    if (ownBrowser) await ownBrowser.close().catch(() => {});
  }
  return { key: question.key, url: question.url, results };
}

// --------------------------------------------------------------------------
// CLI
// --------------------------------------------------------------------------
function cliArg(name, fallback = null) {
  const i = process.argv.indexOf(`--${name}`);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : fallback;
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  const workspaceDir = cliArg('workspace');
  const key = cliArg('key');
  const policyRaw = cliArg('policy');
  if (!workspaceDir || !policyRaw) {
    console.error('user-bot: --workspace <dir> and --policy <json> are required.');
    process.exit(1);
  }
  let policy;
  try {
    policy = JSON.parse(policyRaw);
  } catch (err) {
    console.error(`user-bot: --policy must be JSON (${err.message})`);
    process.exit(1);
  }
  runUserBot({ workspaceDir, key, policy })
    .then((out) => {
      console.log(JSON.stringify(out));
      process.exit(0);
    })
    .catch((err) => {
      console.error(`user-bot: ${err.message}`);
      process.exit(1);
    });
}
