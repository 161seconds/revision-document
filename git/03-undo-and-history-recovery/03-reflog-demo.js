/**
 * 03-reflog-demo.js
 * Thực nghiệm và kiểm chứng Cứu hộ dữ liệu khẩn cấp qua Git Reflog
 * Chạy trực tiếp: node git/03-undo-and-history-recovery/03-reflog-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 03: GIT REFLOG & CỨU HỘ DỮ LIỆU ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-reflog-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: testWorkspace,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Rescue Hero",
      GIT_AUTHOR_EMAIL: "rescue@company.com",
      GIT_COMMITTER_NAME: "Rescue Hero",
      GIT_COMMITTER_EMAIL: "rescue@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Commit C1
  fs.writeFileSync(path.join(testWorkspace, "app.js"), "// Version 1\n", "utf8");
  runGit("add app.js");
  runGit("commit -m \"feat: initial app\"");

  // Commit C2 (Commit quan trọng chứa logic thanh toán)
  fs.writeFileSync(path.join(testWorkspace, "payment.js"), "function pay() { return true; }\n", "utf8");
  runGit("add payment.js");
  runGit("commit -m \"feat: critical payment logic\"");
  const paymentCommitHash = runGit("rev-parse HEAD");

  // -------------------------------------------------------------
  // KỊCH BẢN 1: CỨU DỮ LIỆU SAU KHI LỠ TAY RESET --HARD
  // -------------------------------------------------------------
  // Lỡ tay reset lùi về quá khứ và xóa sạch working tree
  runGit("reset --hard HEAD~1");

  // Kiểm tra: File payment.js đã biến mất khỏi đĩa cứng
  assert.equal(fs.existsSync(path.join(testWorkspace, "payment.js")), false);

  // git log bình thường KHÔNG THỂ nhìn thấy commit thanh toán nữa
  const standardLog = runGit("log --oneline");
  assert.doesNotMatch(standardLog, /critical payment logic/);

  // Nhưng git reflog VẪN LƯU VẾT 100%!
  const reflogOutput = runGit("reflog");
  assert.match(reflogOutput, /feat: critical payment logic/);

  // Cứu hộ: Tạo nhánh mới từ commit tìm được trong reflog
  runGit(`switch -c rescue-payment ${paymentCommitHash}`);

  // Kiểm tra kỳ tích: File payment.js đã sống lại 100% nguyên vẹn!
  assert.equal(fs.existsSync(path.join(testWorkspace, "payment.js")), true);
  const rescuedCode = fs.readFileSync(path.join(testWorkspace, "payment.js"), "utf8");
  assert.match(rescuedCode, /function pay/);

  // -------------------------------------------------------------
  // KỊCH BẢN 2: HỒI SINH NHÁNH BỊ XÓA BẰNG 'git branch -D'
  // -------------------------------------------------------------
  runGit("switch main");
  runGit("switch -c secret-experiment");
  fs.writeFileSync(path.join(testWorkspace, "ai.js"), "// AI neural engine\n", "utf8");
  runGit("add ai.js");
  runGit("commit -m \"feat: experimental AI code\"");
  const aiCommitHash = runGit("rev-parse HEAD");

  // Chuyển về main và xóa sổ nhánh secret-experiment bằng -D (ép buộc)
  runGit("switch main");
  runGit("branch -D secret-experiment");

  // Nhánh đã không còn trong danh sách branch
  assert.doesNotMatch(runGit("branch"), /secret-experiment/);

  // Cứu lại nhánh từ mã commit trong reflog
  runGit(`branch secret-experiment ${aiCommitHash}`);
  assert.match(runGit("branch"), /secret-experiment/);

  // Chuyển sang nhánh vừa cứu và kiểm tra code
  runGit("switch secret-experiment");
  assert.equal(fs.existsSync(path.join(testWorkspace, "ai.js")), true);

  console.log("-> 100% tests cho Git Reflog & Cứu hộ dữ liệu đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
