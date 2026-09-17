/**
 * 02-pull-push-demo.js
 * Thực nghiệm và kiểm chứng Quy trình Đồng bộ Remote (Push -u, Fetch, Non-fast-forward Reject, Pull --rebase)
 * Chạy trực tiếp: node git/02-remotes-and-collaboration/02-pull-push-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 02: ĐỒNG BỘ FETCH, PULL, PUSH & UPSTREAM ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-sync-demo-"));

function runGit(repoDir, cmd, user = "Tester") {
  return execSync(`git ${cmd}`, {
    cwd: repoDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: user,
      GIT_AUTHOR_EMAIL: `${user.toLowerCase()}@company.com`,
      GIT_COMMITTER_NAME: user,
      GIT_COMMITTER_EMAIL: `${user.toLowerCase()}@company.com`,
    },
  }).trim();
}

try {
  // 1. Tạo Central Bare Repository đóng vai trò GitHub Server
  const serverPath = path.join(testWorkspace, "central-repo.git");
  fs.mkdirSync(serverPath);
  runGit(serverPath, "init --bare -b main");

  // 2. Máy trạm Alice: Khởi tạo và đẩy code ban đầu
  const aliceRepo = path.join(testWorkspace, "alice-workspace");
  fs.mkdirSync(aliceRepo);
  runGit(aliceRepo, "init -b main", "Alice");

  fs.writeFileSync(path.join(aliceRepo, "app.js"), "// Version 1.0\n", "utf8");
  runGit(aliceRepo, "add app.js", "Alice");
  runGit(aliceRepo, "commit -m \"feat: initial release by Alice\"", "Alice");

  // Alice cấu hình remote và push với cờ -u (tracking)
  runGit(aliceRepo, `remote add origin "${serverPath}"`, "Alice");
  const alicePushOutput = runGit(aliceRepo, "push -u origin main", "Alice");
  assert.match(alicePushOutput, /branch 'main' set up to track/i);

  // 3. Máy trạm Bob: Clone repository từ server
  const bobRepo = path.join(testWorkspace, "bob-workspace");
  runGit(testWorkspace, `clone "${serverPath}" bob-workspace`, "Bob");
  assert.equal(fs.existsSync(path.join(bobRepo, "app.js")), true);

  // 4. Alice commit và push tính năng mới lên server
  fs.appendFileSync(path.join(aliceRepo, "app.js"), "// Alice Feature A\n", "utf8");
  runGit(aliceRepo, "add app.js", "Alice");
  runGit(aliceRepo, "commit -m \"feat: Alice feature A\"", "Alice");
  runGit(aliceRepo, "push origin main", "Alice");

  // 5. Trong lúc đó Bob cũng sửa code tại local mà chưa pull
  fs.appendFileSync(path.join(bobRepo, "bob_task.txt"), "Bob independent task\n", "utf8");
  runGit(bobRepo, "add bob_task.txt", "Bob");
  runGit(bobRepo, "commit -m \"feat: Bob independent task\"", "Bob");

  // Bob cố tình push -> BẮT BUỘC bị reject vì non-fast-forward
  assert.throws(() => {
    runGit(bobRepo, "push origin main", "Bob");
  }, /rejected.*fetch first|non-fast-forward/i);

  // 6. Bob sử dụng chuẩn hiện đại: git pull --rebase
  runGit(bobRepo, "pull --rebase origin main", "Bob");

  // Kiểm tra lịch sử Bob: Code của Alice nằm trước, commit của Bob nằm sau (Linear History!)
  const bobLog = runGit(bobRepo, "log --oneline", "Bob");
  assert.match(bobLog, /feat: Bob independent task/);
  assert.match(bobLog, /feat: Alice feature A/);
  assert.match(bobLog, /feat: initial release by Alice/);
  // Tuyệt đối không xuất hiện merge commit rác
  assert.doesNotMatch(bobLog, /Merge branch/);

  // 7. Giờ Bob push bình thường thành công
  runGit(bobRepo, "push origin main", "Bob");

  // Alice fetch về và kiểm tra
  runGit(aliceRepo, "fetch origin", "Alice");
  const aliceTrackingLog = runGit(aliceRepo, "log HEAD..origin/main --oneline", "Alice");
  assert.match(aliceTrackingLog, /feat: Bob independent task/);

  console.log("-> 100% tests cho Đồng bộ Fetch, Pull, Push đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
