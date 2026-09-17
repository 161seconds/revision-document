/**
 * 03-hooks-demo.js
 * Thực nghiệm và kiểm chứng Git Cherry-pick (-x) & Git Hooks Tự Động Hóa (commit-msg enforcer)
 * Chạy trực tiếp: node git/04-advanced-and-enterprise/03-hooks-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 03: CHERRY-PICK & GIT HOOKS ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-hooks-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: testWorkspace,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Hook Master",
      GIT_AUTHOR_EMAIL: "hooks@company.com",
      GIT_COMMITTER_NAME: "Hook Master",
      GIT_COMMITTER_EMAIL: "hooks@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Commit cơ sở
  fs.writeFileSync(path.join(testWorkspace, "init.txt"), "Initial framework\n", "utf8");
  runGit("add init.txt");
  runGit("commit -m \"feat: initial framework\"");

  // -------------------------------------------------------------
  // 1. Kiểm tra Git Cherry-Pick với cờ -x
  // -------------------------------------------------------------
  runGit("switch -c develop");

  // Tạo commit C2 (tính năng chưa hoàn thiện)
  fs.writeFileSync(path.join(testWorkspace, "wip.js"), "// Half-done\n", "utf8");
  runGit("add wip.js");
  runGit("commit -m \"feat: wip feature\"");

  // Tạo commit C3 (Bản vá lỗi khẩn cấp cần đưa lên main ngay)
  fs.writeFileSync(path.join(testWorkspace, "hotfix.js"), "function emergencyPatch() { return true; }\n", "utf8");
  runGit("add hotfix.js");
  runGit("commit -m \"fix: emergency critical patch\"");
  const hotfixHash = runGit("rev-parse HEAD");

  // Quay về main và nhặt lẻ duy nhất hotfix C3
  runGit("switch main");
  assert.equal(fs.existsSync(path.join(testWorkspace, "hotfix.js")), false);

  runGit(`cherry-pick -x ${hotfixHash}`);

  // Kiểm tra file hotfix đã có trên main
  assert.equal(fs.existsSync(path.join(testWorkspace, "hotfix.js")), true);
  // File wip.js từ develop BẮT BUỘC KHÔNG được xuất hiện trên main
  assert.equal(fs.existsSync(path.join(testWorkspace, "wip.js")), false);

  // Kiểm tra cờ -x tự động thêm xuất xứ commit gốc
  const latestLog = runGit("log -n 1");
  assert.match(latestLog, /fix: emergency critical patch/);
  assert.match(latestLog, new RegExp(`cherry picked from commit ${hotfixHash}`));

  // -------------------------------------------------------------
  // 2. Kiểm tra Tự Động Hóa Git Hooks (commit-msg enforcer)
  // -------------------------------------------------------------
  const hooksDir = path.join(testWorkspace, ".git", "hooks");
  const commitMsgHookPath = path.join(hooksDir, "commit-msg");

  // Viết script Node.js kiểm tra Conventional Commits
  const hookScript = `#!/usr/bin/env node
const fs = require('fs');
const msgFile = process.argv[2];
const msg = fs.readFileSync(msgFile, 'utf8').trim();

const regex = /^(feat|fix|docs|style|refactor|test|chore)(\\(.+\\))?: .+/;
if (!regex.test(msg)) {
  console.error("ERROR: Commit message must follow Conventional Commits format!");
  process.exit(1);
}
`;

  fs.writeFileSync(commitMsgHookPath, hookScript, { encoding: "utf8", mode: 0o755 });

  // Sửa code chuẩn bị test hook
  fs.appendFileSync(path.join(testWorkspace, "init.txt"), "Update line\n", "utf8");
  runGit("add init.txt");

  // Trường hợp 1: Commit với thông điệp sai chuẩn -> BẮT BUỘC bị Hook chặn (exit code 1)
  assert.throws(() => {
    runGit("commit -m \"bad message without prefix\"");
  }, /ERROR: Commit message must follow Conventional Commits format/);

  // Trường hợp 2: Commit với thông điệp chuẩn -> Thành công
  runGit("commit -m \"chore(core): valid conventional message\"");
  const successLog = runGit("log -n 1 --oneline");
  assert.match(successLog, /chore\(core\): valid conventional message/);

  console.log("-> 100% tests cho Cherry-pick & Git Hooks đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
