/**
 * practice.js - Module 03: Git Undo & History Recovery Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách tích hợp Undo & History Recovery:
 * 1. Atomic Commit Amend & Hash Mutation Engine
 * 2. Forward Undo Revert & Inverted State Engine
 * 3. 3-Tree Reset Simulation (--soft vs --mixed vs --hard)
 * 4. Modern Restore & Staged Deselection Engine
 * 5. Reflog Rescue & Orphaned Branch Resurrection Engine
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 03 - UNDO & HISTORY RECOVERY ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-module03-practice-"));

function runInRepo(dir, cmd, user = "UndoMaster") {
  return execSync(`git ${cmd}`, {
    cwd: dir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: user,
      GIT_AUTHOR_EMAIL: `${user.toLowerCase()}@enterprise.com`,
      GIT_COMMITTER_NAME: user,
      GIT_COMMITTER_EMAIL: `${user.toLowerCase()}@enterprise.com`,
    },
  }).trim();
}

try {
  const repo = path.join(testWorkspace, "main-repo");
  fs.mkdirSync(repo);
  runInRepo(repo, "init -b main");

  // -------------------------------------------------------------
  // THỬ THÁCH 1: ATOMIC COMMIT AMEND & HASH MUTATION ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 1: Commit Amend & Hash Replacement Engine...");
  fs.writeFileSync(path.join(repo, "f1.txt"), "F1 initial\n", "utf8");
  runInRepo(repo, "add f1.txt");
  runInRepo(repo, "commit -m \"feat: initial F1\"");
  const hash1 = runInRepo(repo, "rev-parse HEAD");

  // Amend thêm file
  fs.writeFileSync(path.join(repo, "f2.txt"), "F2 added via amend\n", "utf8");
  runInRepo(repo, "add f2.txt");
  runInRepo(repo, "commit --amend -m \"feat: combined F1 and F2\"");
  const hash2 = runInRepo(repo, "rev-parse HEAD");

  assert.notEqual(hash1, hash2, "Amended commit must have distinct SHA-1");
  const showRaw = runInRepo(repo, "show --stat");
  assert.match(showRaw, /f1\.txt/);
  assert.match(showRaw, /f2\.txt/);
  console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 2: FORWARD UNDO REVERT ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 2: Safe Forward Revert Engine...");
  fs.writeFileSync(path.join(repo, "toxic.txt"), "Toxic bug payload\n", "utf8");
  runInRepo(repo, "add toxic.txt");
  runInRepo(repo, "commit -m \"feat: bad commit toxic\"");
  const toxicHash = runInRepo(repo, "rev-parse HEAD");
  assert.equal(fs.existsSync(path.join(repo, "toxic.txt")), true);

  runInRepo(repo, `revert --no-edit ${toxicHash}`);
  assert.equal(fs.existsSync(path.join(repo, "toxic.txt")), false);

  const logList = runInRepo(repo, "log --oneline");
  assert.match(logList, /Revert "feat: bad commit toxic"/);
  assert.match(logList, /feat: bad commit toxic/);
  console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 3: 3-TREE RESET SIMULATION ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 3: The 3-Tree Reset Simulation (--soft vs --mixed)...");
  fs.writeFileSync(path.join(repo, "step.txt"), "Step Base\n", "utf8");
  runInRepo(repo, "add step.txt");
  runInRepo(repo, "commit -m \"feat: step base\"");
  const baseStepHash = runInRepo(repo, "rev-parse HEAD");

  fs.appendFileSync(path.join(repo, "step.txt"), "Step Addition\n", "utf8");
  runInRepo(repo, "commit -am \"feat: step addition\"");

  // Reset --soft: HEAD lùi về base, index giữ staged
  runInRepo(repo, "reset --soft HEAD~1");
  assert.equal(runInRepo(repo, "rev-parse HEAD"), baseStepHash);
  assert.equal(runInRepo(repo, "status -s"), "M  step.txt"); // Staged!

  // Reset --mixed: HEAD lùi về base, index bị hủy
  runInRepo(repo, "reset --mixed HEAD");
  assert.match(runInRepo(repo, "status -s"), /M step\.txt/); // Unstaged!

  // Đưa về clean state
  runInRepo(repo, "restore step.txt");
  assert.equal(runInRepo(repo, "status -s"), "");
  console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 4: MODERN RESTORE & STAGED DESELECTION ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 4: Modern Restore Engine...");
  fs.appendFileSync(path.join(repo, "step.txt"), "Dirty Edit\n", "utf8");
  runInRepo(repo, "add step.txt");
  assert.equal(runInRepo(repo, "status -s"), "M  step.txt");

  // Restore --staged (Unstage)
  runInRepo(repo, "restore --staged step.txt");
  assert.match(runInRepo(repo, "status -s"), /M step\.txt/);

  // Restore working tree
  runInRepo(repo, "restore step.txt");
  assert.equal(runInRepo(repo, "status -s"), "");
  assert.doesNotMatch(fs.readFileSync(path.join(repo, "step.txt"), "utf8"), /Dirty Edit/);
  console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 5: REFLOG RESCUE & RESURRECTION ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 5: Reflog Rescue & Dangling Commit Resurrection...");
  fs.writeFileSync(path.join(repo, "gold.txt"), "100 Gold Coins\n", "utf8");
  runInRepo(repo, "add gold.txt");
  runInRepo(repo, "commit -m \"feat: treasure gold\"");
  const goldHash = runInRepo(repo, "rev-parse HEAD");

  // Thảm họa: reset --hard 2 commit
  runInRepo(repo, "reset --hard HEAD~2");
  assert.equal(fs.existsSync(path.join(repo, "gold.txt")), false);

  // Soi reflog và giải cứu
  const reflog = runInRepo(repo, "reflog");
  assert.match(reflog, /feat: treasure gold/);

  // Hồi sinh sang nhánh cứu hộ
  runInRepo(repo, `switch -c rescue-gold ${goldHash}`);
  assert.equal(fs.existsSync(path.join(repo, "gold.txt")), true);
  assert.equal(fs.readFileSync(path.join(repo, "gold.txt"), "utf8").trim(), "100 Gold Coins");
  console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

  console.log("\n=======================================================");
  console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 03 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
