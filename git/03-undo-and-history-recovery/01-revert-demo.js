/**
 * 01-revert-demo.js
 * Thực nghiệm và kiểm chứng Git Amend, Git Revert và Hoàn tác Merge Commit (revert -m 1)
 * Chạy trực tiếp: node git/03-undo-and-history-recovery/01-revert-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 01: GIT AMEND & REVERT AN TOÀN ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-revert-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: testWorkspace,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Undo Master",
      GIT_AUTHOR_EMAIL: "undo@company.com",
      GIT_COMMITTER_NAME: "Undo Master",
      GIT_COMMITTER_EMAIL: "undo@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Commit cơ sở
  fs.writeFileSync(path.join(testWorkspace, "base.txt"), "Base stable\n", "utf8");
  runGit("add base.txt");
  runGit("commit -m \"feat: base stable\"");

  // -------------------------------------------------------------
  // 1. Kiểm tra Git Commit --amend
  // -------------------------------------------------------------
  fs.writeFileSync(path.join(testWorkspace, "feature.txt"), "Feature draft\n", "utf8");
  runGit("add feature.txt");
  runGit("commit -m \"feat: feature draft\"");
  const originalCommitHash = runGit("rev-parse HEAD");

  // Nhận ra quên file cấu hình và muốn sửa lại commit message
  fs.writeFileSync(path.join(testWorkspace, "config.json"), '{"env": "prod"}\n', "utf8");
  runGit("add config.json");
  runGit("commit --amend -m \"feat: complete feature with config\"");
  const amendedCommitHash = runGit("rev-parse HEAD");

  // Mã hash SHA-1 BẮT BUỘC phải thay đổi (commit cũ bị thay thế)
  assert.notEqual(originalCommitHash, amendedCommitHash);

  // Commit mới phải chứa cả file bổ sung
  const logLatest = runGit("log -n 1 --stat");
  assert.match(logLatest, /feat: complete feature with config/);
  assert.match(logLatest, /config\.json/);
  assert.match(logLatest, /feature\.txt/);

  // -------------------------------------------------------------
  // 2. Kiểm tra Git Revert Commit Thường (Forward Undo)
  // -------------------------------------------------------------
  // Thêm một tính năng bị bug
  fs.writeFileSync(path.join(testWorkspace, "buggy.js"), "throw new Error('CRITICAL BUG');\n", "utf8");
  runGit("add buggy.js");
  runGit("commit -m \"feat: introduces critical bug\"");
  const buggyCommitHash = runGit("rev-parse HEAD");

  // Revert commit bị lỗi mà không cần tương tác editor (--no-edit)
  runGit(`revert --no-edit ${buggyCommitHash}`);

  // File buggy.js BẮT BUỘC đã bị xóa khỏi Working Tree
  assert.equal(fs.existsSync(path.join(testWorkspace, "buggy.js")), false);

  // Lịch sử commit BẮT BUỘC vẫn giữ nguyên cả commit lỗi lẫn commit revert
  const logRevert = runGit("log --oneline");
  assert.match(logRevert, /Revert "feat: introduces critical bug"/);
  assert.match(logRevert, /feat: introduces critical bug/);

  // -------------------------------------------------------------
  // 3. Kiểm tra Hoàn Tác Merge Commit (git revert -m 1)
  // -------------------------------------------------------------
  // Tạo nhánh phụ và merge vào main
  runGit("switch -c bad-branch");
  fs.writeFileSync(path.join(testWorkspace, "bad_module.js"), "module.exports = 'bad';\n", "utf8");
  runGit("add bad_module.js");
  runGit("commit -m \"feat: bad module on branch\"");

  runGit("switch main");
  // Ép tạo 3-way merge commit bằng --no-ff
  runGit("merge --no-ff bad-branch -m \"merge: integrate bad-branch into main\"");
  const mergeCommitHash = runGit("rev-parse HEAD");
  assert.equal(fs.existsSync(path.join(testWorkspace, "bad_module.js")), true);

  // Nếu revert merge commit mà không có -m -> Git phải ném lỗi
  assert.throws(() => {
    runGit(`revert --no-edit ${mergeCommitHash}`);
  }, /is a merge but no -m option was given/);

  // Revert chuẩn với -m 1 (giữ nhánh main)
  runGit(`revert --no-edit -m 1 ${mergeCommitHash}`);

  // File bad_module.js từ nhánh phụ đã bị loại bỏ hoàn toàn
  assert.equal(fs.existsSync(path.join(testWorkspace, "bad_module.js")), false);

  console.log("-> 100% tests cho Git Amend & Revert đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
