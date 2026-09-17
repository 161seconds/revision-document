/**
 * practice.js - Module 01: Git Core Architecture & Fundamentals Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách Git tự động hóa:
 * 1. Git Object Graph Traversal Engine (Commit -> Tree -> Blob)
 * 2. Multi-Stage Staging Lifecycle & Diff Verification Engine
 * 3. Fast-Forward vs 3-Way Merge Commit Parent Verification
 * 4. Stash Stack & Untracked File Recovery Engine
 * 5. Dynamic .gitignore Pattern Matcher & Un-tracking Engine
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 01 - GIT BASICS & ARCHITECTURE ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-module01-practice-"));

function runInRepo(dir, cmd) {
  return execSync(`git ${cmd}`, {
    cwd: dir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Git Master",
      GIT_AUTHOR_EMAIL: "master@enterprise.com",
      GIT_COMMITTER_NAME: "Git Master",
      GIT_COMMITTER_EMAIL: "master@enterprise.com",
    },
  }).trim();
}

try {
  // -------------------------------------------------------------
  // THỬ THÁCH 1: GIT OBJECT GRAPH TRAVERSAL ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 1: Object Graph Traversal (Commit -> Tree -> Blob)...");
  const repo1 = path.join(testWorkspace, "repo1");
  fs.mkdirSync(repo1);
  runInRepo(repo1, "init -b main");

  const secretPayload = "Enterprise Ultra Secret String\n";
  fs.writeFileSync(path.join(repo1, "payload.txt"), secretPayload, "utf8");
  runInRepo(repo1, "add payload.txt");
  runInRepo(repo1, "commit -m \"feat: store payload\"");

  const headCommit = runInRepo(repo1, "rev-parse HEAD");
  const commitRaw = runInRepo(repo1, `cat-file -p ${headCommit}`);
  const treeMatch = commitRaw.match(/^tree ([0-9a-f]{40})/m);
  assert.ok(treeMatch, "Commit must contain tree pointer");
  const treeHash = treeMatch[1];

  // Đọc nội dung của Tree
  const treeRaw = runInRepo(repo1, `cat-file -p ${treeHash}`);
  assert.match(treeRaw, /100644 blob [0-9a-f]{40}\tpayload\.txt/);
  const blobHash = treeRaw.match(/blob ([0-9a-f]{40})/)[1];

  // Đọc nội dung Blob
  const blobContent = runInRepo(repo1, `cat-file -p ${blobHash}`);
  assert.equal(blobContent, secretPayload.trim());
  console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 2: MULTI-STAGE LIFECYCLE & DIFF ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 2: Staging Lifecycle & Diff Verification...");
  const fileTracked = path.join(repo1, "data.txt");
  fs.writeFileSync(fileTracked, "Line 1: Staged\n", "utf8");
  runInRepo(repo1, "add data.txt");

  fs.appendFileSync(fileTracked, "Line 2: Unstaged\n", "utf8");

  // Diff unstaged phải thấy Line 2, không thấy Line 1
  const diffUnstaged = runInRepo(repo1, "diff");
  assert.match(diffUnstaged, /\+Line 2: Unstaged/);

  // Diff staged phải thấy Line 1, không thấy Line 2
  const diffStaged = runInRepo(repo1, "diff --staged");
  assert.match(diffStaged, /\+Line 1: Staged/);

  runInRepo(repo1, "add data.txt");
  runInRepo(repo1, "commit -m \"feat: complete multi-stage file\"");
  console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 3: FAST-FORWARD VS 3-WAY MERGE PARENT ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 3: Fast-Forward vs 3-Way Merge Verification...");
  runInRepo(repo1, "switch -c feature/ff");
  fs.writeFileSync(path.join(repo1, "ff.txt"), "FF\n", "utf8");
  runInRepo(repo1, "add ff.txt");
  runInRepo(repo1, "commit -m \"feat: ff candidate\"");
  const ffHash = runInRepo(repo1, "rev-parse HEAD");

  runInRepo(repo1, "switch main");
  const ffOutput = runInRepo(repo1, "merge feature/ff");
  assert.match(ffOutput, /Fast-forward/);
  assert.equal(runInRepo(repo1, "rev-parse HEAD"), ffHash);

  // Tạo nhánh song song để ép 3-way merge
  runInRepo(repo1, "switch -c branch-x");
  fs.writeFileSync(path.join(repo1, "x.txt"), "X\n", "utf8");
  runInRepo(repo1, "add x.txt");
  runInRepo(repo1, "commit -m \"feat: commit X\"");
  const commitXHash = runInRepo(repo1, "rev-parse HEAD");

  runInRepo(repo1, "switch main");
  fs.writeFileSync(path.join(repo1, "y.txt"), "Y\n", "utf8");
  runInRepo(repo1, "add y.txt");
  runInRepo(repo1, "commit -m \"feat: commit Y on main\"");
  const commitYHash = runInRepo(repo1, "rev-parse HEAD");

  runInRepo(repo1, "merge branch-x -m \"merge: branch-x into main\"");
  const mergeCommit = runInRepo(repo1, "rev-parse HEAD");
  const mergeDetails = runInRepo(repo1, `cat-file -p ${mergeCommit}`);
  const parents = [...mergeDetails.matchAll(/^parent ([0-9a-f]{40})/gm)].map((m) => m[1]);

  assert.equal(parents.length, 2, "3-Way Merge commit must have exactly 2 parents");
  assert.equal(parents[0], commitYHash);
  assert.equal(parents[1], commitXHash);
  console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 4: STASH STACK & UNTRACKED RECOVERY ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 4: Stash Stack & Untracked Recovery...");
  fs.writeFileSync(path.join(repo1, "untracked.tmp"), "Untracked data\n", "utf8");
  fs.appendFileSync(path.join(repo1, "ff.txt"), "Modified line\n", "utf8");

  // Stash -u
  runInRepo(repo1, "stash push -u -m \"WIP: test untracked\"");
  assert.equal(fs.existsSync(path.join(repo1, "untracked.tmp")), false);

  // Restore via pop
  runInRepo(repo1, "stash pop");
  assert.equal(fs.existsSync(path.join(repo1, "untracked.tmp")), true);
  assert.match(fs.readFileSync(path.join(repo1, "ff.txt"), "utf8"), /Modified line/);

  // Clean up
  runInRepo(repo1, "add .");
  runInRepo(repo1, "commit -m \"chore: clean after stash test\"");
  console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 5: DYNAMIC .GITIGNORE PATTERN & UN-TRACKING
  // -------------------------------------------------------------
  console.log("-> Thử thách 5: Gitignore & Un-tracking Engine...");
  fs.writeFileSync(path.join(repo1, ".gitignore"), "*.log\nbuild/\n", "utf8");
  fs.writeFileSync(path.join(repo1, "error.log"), "Error text\n", "utf8");

  assert.match(runInRepo(repo1, "check-ignore -v error.log"), /\.gitignore:1:\*\.log/);

  // Commit nhầm file
  fs.writeFileSync(path.join(repo1, "tracked_bad.log"), "Should not be here\n", "utf8");
  runInRepo(repo1, "add -f tracked_bad.log .gitignore");
  runInRepo(repo1, "commit -m \"feat: bad log committed\"");

  // Un-track bằng git rm --cached
  runInRepo(repo1, "rm --cached tracked_bad.log");
  runInRepo(repo1, "commit -m \"chore: untrack bad log\"");

  assert.equal(fs.existsSync(path.join(repo1, "tracked_bad.log")), true);
  assert.doesNotMatch(runInRepo(repo1, "status -s"), /tracked_bad\.log/);
  console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

  console.log("\n=======================================================");
  console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 01 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
