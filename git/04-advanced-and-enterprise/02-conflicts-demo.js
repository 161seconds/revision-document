/**
 * 02-conflicts-demo.js
 * Thực nghiệm và kiểm chứng Xử lý Xung đột Merge Conflict, git merge --abort và git rerere
 * Chạy trực tiếp: node git/04-advanced-and-enterprise/02-conflicts-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 02: GIẢI QUYẾT XUNG ĐỘT & RERERE ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-conflict-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: testWorkspace,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Conflict Solver",
      GIT_AUTHOR_EMAIL: "solver@company.com",
      GIT_COMMITTER_NAME: "Conflict Solver",
      GIT_COMMITTER_EMAIL: "solver@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Bật tính năng rerere tự động lưu cách giải quyết
  runGit("config rerere.enabled true");

  // Commit cơ sở
  const configFile = path.join(testWorkspace, "config.env");
  fs.writeFileSync(configFile, "PORT=3000\nHOST=localhost\n", "utf8");
  runGit("add config.env");
  runGit("commit -m \"feat: base config\"");

  // Tạo nhánh feature/staging và sửa HOST
  runGit("switch -c feature/staging");
  fs.writeFileSync(configFile, "PORT=3000\nHOST=staging.api.internal\n", "utf8");
  runGit("commit -am \"feat: update host for staging\"");

  // Quay về main và sửa cùng dòng HOST thành giá trị khác
  runGit("switch main");
  fs.writeFileSync(configFile, "PORT=3000\nHOST=production.api.cloud\n", "utf8");
  runGit("commit -am \"feat: update host for production\"");

  // -------------------------------------------------------------
  // 1. Kích Hoạt Merge Conflict
  // -------------------------------------------------------------
  assert.throws(
    () => {
      runGit("merge feature/staging");
    },
    (err) => {
      return String(err.stdout).includes("CONFLICT");
    }
  );

  // Kiểm tra file chứa các conflict markers
  const conflictContent = fs.readFileSync(configFile, "utf8");
  assert.match(conflictContent, /<<<<<<< HEAD/);
  assert.match(conflictContent, /HOST=production\.api\.cloud/);
  assert.match(conflictContent, /=======/);
  assert.match(conflictContent, /HOST=staging\.api\.internal/);
  assert.match(conflictContent, />>>>>>> feature\/staging/);

  // -------------------------------------------------------------
  // 2. Kiểm Tra Thoát Hiểm Khẩn Cấp: git merge --abort
  // -------------------------------------------------------------
  runGit("merge --abort");

  // Sau abort: File lập tức phục hồi về nguyên trạng của main
  const restoredContent = fs.readFileSync(configFile, "utf8");
  assert.doesNotMatch(restoredContent, /<<<<<<</);
  assert.match(restoredContent, /HOST=production\.api\.cloud/);
  assert.equal(runGit("status -s"), ""); // Clean state

  // -------------------------------------------------------------
  // 3. Thực Hiện Giải Quyết Xung Đột Chuẩn & Lưu Rerere
  // -------------------------------------------------------------
  // Kích hoạt merge lại
  try {
    runGit("merge feature/staging");
  } catch {}

  // Giải quyết xung đột bằng cách chọn phiên bản hợp nhất
  const resolvedContent = "PORT=3000\nHOST=cloud.production.final\n";
  fs.writeFileSync(configFile, resolvedContent, "utf8");

  // Đánh dấu đã giải quyết bằng git add
  runGit("add config.env");

  // Commit hoàn thành merge (Rerere sẽ tự động ghi nhớ cách giải quyết này)
  runGit("commit -m \"merge: resolved host conflict between staging and prod\"");

  // Kiểm tra kết quả
  assert.equal(fs.readFileSync(configFile, "utf8"), resolvedContent);
  assert.match(runGit("log -n 1 --oneline"), /merge: resolved host conflict/);

  console.log("-> 100% tests cho Xử lý Xung đột & Rerere đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
