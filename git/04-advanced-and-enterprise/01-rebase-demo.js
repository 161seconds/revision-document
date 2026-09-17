/**
 * 01-rebase-demo.js
 * Thực nghiệm và kiểm chứng Tuyến tính hóa lịch sử qua Git Rebase & Autosquash
 * Chạy trực tiếp: node git/04-advanced-and-enterprise/01-rebase-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 01: GIT REBASE & TUYẾN TÍNH HÓA LỊCH SỬ ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-rebase-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: testWorkspace,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Rebase Master",
      GIT_AUTHOR_EMAIL: "rebase@company.com",
      GIT_COMMITTER_NAME: "Rebase Master",
      GIT_COMMITTER_EMAIL: "rebase@company.com",
      GIT_SEQUENCE_EDITOR: ":", // No-op editor cho phép rebase -i tự động không block terminal
      EDITOR: ":",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Commit C1
  fs.writeFileSync(path.join(testWorkspace, "init.txt"), "C1 base\n", "utf8");
  runGit("add init.txt");
  runGit("commit -m \"feat: base C1\"");

  // Rẽ nhánh feature
  runGit("switch -c feature/login");
  fs.writeFileSync(path.join(testWorkspace, "login.js"), "function login() {}\n", "utf8");
  runGit("add login.js");
  runGit("commit -m \"feat: create login component\"");
  const originalFeatureHash = runGit("rev-parse HEAD");

  // Quay về main và tạo commit C2 độc lập
  runGit("switch main");
  fs.writeFileSync(path.join(testWorkspace, "main_work.txt"), "C2 work\n", "utf8");
  runGit("add main_work.txt");
  runGit("commit -m \"feat: main independent C2\"");
  const mainC2Hash = runGit("rev-parse HEAD");

  // -------------------------------------------------------------
  // 1. Kiểm tra Standard Rebase
  // -------------------------------------------------------------
  runGit("switch feature/login");
  runGit("rebase main");

  // Sau rebase: Commit của feature phải được đặt trực tiếp lên trên mainC2
  const rebasedFeatureHash = runGit("rev-parse HEAD");
  assert.notEqual(originalFeatureHash, rebasedFeatureHash, "Rebase must produce new commit hash");

  // Kiểm tra commit cha trực tiếp của feature: BẮT BUỘC là mainC2
  const parentCommit = runGit("rev-parse HEAD~1");
  assert.equal(parentCommit, mainC2Hash);

  // Lịch sử là một đường thẳng hoàn hảo
  const onelineLog = runGit("log --oneline");
  assert.match(onelineLog, /feat: create login component/);
  assert.match(onelineLog, /feat: main independent C2/);
  assert.match(onelineLog, /feat: base C1/);
  assert.doesNotMatch(onelineLog, /Merge branch/);

  // -------------------------------------------------------------
  // 2. Kiểm tra Autosquash với --fixup
  // -------------------------------------------------------------
  // Sửa lỗi nhỏ trong login component
  fs.appendFileSync(path.join(testWorkspace, "login.js"), "// Added input sanitization\n", "utf8");
  runGit("add login.js");

  // Tạo commit fixup trỏ thẳng vào commit rebase vừa rồi
  runGit(`commit --fixup ${rebasedFeatureHash}`);
  assert.match(runGit("log -n 1 --oneline"), /fixup! feat: create login component/);

  // Chạy autosquash tự động qua no-op editor
  runGit("rebase -i --autosquash HEAD~2");

  // Kết quả: Commit fixup đã được gộp hoàn toàn, commit message fixup biến mất
  const squashedLog = runGit("log -n 1 --oneline");
  assert.match(squashedLog, /feat: create login component/);
  assert.doesNotMatch(squashedLog, /fixup!/);

  // Code bên trong vẫn chứa đầy đủ nội dung sửa đổi
  const finalCode = fs.readFileSync(path.join(testWorkspace, "login.js"), "utf8");
  assert.match(finalCode, /Added input sanitization/);

  console.log("-> 100% tests cho Git Rebase & Autosquash đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
