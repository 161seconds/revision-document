/**
 * 02-reset-demo.js
 * Thực nghiệm và kiểm chứng Bản chất 3 Cờ Reset (--soft, --mixed, --hard) & Modern Restore
 * Chạy trực tiếp: node git/03-undo-and-history-recovery/02-reset-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 02: TOÁN TỬ RESET & RESTORE ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-reset-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: testWorkspace,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Reset Tester",
      GIT_AUTHOR_EMAIL: "reset@company.com",
      GIT_COMMITTER_NAME: "Reset Tester",
      GIT_COMMITTER_EMAIL: "reset@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Commit C1
  fs.writeFileSync(path.join(testWorkspace, "app.js"), "// App V1\n", "utf8");
  runGit("add app.js");
  runGit("commit -m \"feat: base C1\"");
  const hashC1 = runGit("rev-parse HEAD");

  // Commit C2
  fs.appendFileSync(path.join(testWorkspace, "app.js"), "// Feature C2\n", "utf8");
  runGit("commit -am \"feat: step C2\"");
  const hashC2 = runGit("rev-parse HEAD");

  // -------------------------------------------------------------
  // 1. Kiểm tra Git Reset --soft (Chỉ dời HEAD, giữ Staged)
  // -------------------------------------------------------------
  runGit("reset --soft HEAD~1");

  // HEAD đã lùi về C1
  assert.equal(runGit("rev-parse HEAD"), hashC1);

  // Nhưng trạng thái trong Staging Area BẮT BUỘC vẫn còn nguyên
  const statusSoft = runGit("status -s");
  assert.equal(statusSoft, "M  app.js"); // 'M ' (cột 1: staged)

  // Working tree vẫn chứa đầy đủ nội dung C2
  const appContentSoft = fs.readFileSync(path.join(testWorkspace, "app.js"), "utf8");
  assert.match(appContentSoft, /\/\/ Feature C2/);

  // Commit lại để test --mixed
  runGit("commit -m \"feat: step C2 restored\"");

  // -------------------------------------------------------------
  // 2. Kiểm tra Git Reset --mixed (Dời HEAD + Clear Index, giữ Working Tree)
  // -------------------------------------------------------------
  runGit("reset --mixed HEAD~1");

  assert.equal(runGit("rev-parse HEAD"), hashC1);

  // Trạng thái Staging Area đã bị xóa, chuyển về Modified (chưa staged)
  const statusMixed = runGit("status -s");
  assert.match(statusMixed, /M app\.js/);

  // Working tree vẫn còn nguyên nội dung
  const appContentMixed = fs.readFileSync(path.join(testWorkspace, "app.js"), "utf8");
  assert.match(appContentMixed, /\/\/ Feature C2/);

  // Commit lại để test --hard
  runGit("commit -am \"feat: step C2 restored again\"");

  // -------------------------------------------------------------
  // 3. Kiểm tra Git Reset --hard (Dời HEAD + Xóa Index + Xóa Working Tree)
  // -------------------------------------------------------------
  runGit("reset --hard HEAD~1");

  assert.equal(runGit("rev-parse HEAD"), hashC1);

  // Working tree và Index hoàn toàn sạch sẽ, nội dung C2 bị XÓA SỔ
  assert.equal(runGit("status -s"), "");
  const appContentHard = fs.readFileSync(path.join(testWorkspace, "app.js"), "utf8");
  assert.doesNotMatch(appContentHard, /\/\/ Feature C2/);

  // -------------------------------------------------------------
  // 4. Kiểm tra Lệnh Hiện Đại: git restore & git restore --staged
  // -------------------------------------------------------------
  // Chỉnh sửa file
  fs.appendFileSync(path.join(testWorkspace, "app.js"), "// Unwanted edit\n", "utf8");
  assert.match(runGit("status -s"), /M app\.js/);

  // git restore: Hủy bỏ chỉnh sửa Working Tree
  runGit("restore app.js");
  assert.equal(runGit("status -s"), "");
  assert.doesNotMatch(fs.readFileSync(path.join(testWorkspace, "app.js"), "utf8"), /Unwanted edit/);

  // Staged một file rồi un-staged bằng restore --staged
  fs.appendFileSync(path.join(testWorkspace, "app.js"), "// Staged edit\n", "utf8");
  runGit("add app.js");
  assert.equal(runGit("status -s"), "M  app.js");

  runGit("restore --staged app.js");
  assert.match(runGit("status -s"), /M app\.js/); // Trở về modified chưa staged

  console.log("-> 100% tests cho Git Reset & Restore đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
