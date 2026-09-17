/**
 * 03-branching-demo.js
 * Thực nghiệm và kiểm chứng Phân nhánh, Fast-Forward, 3-Way Merge và Xóa nhánh an toàn
 * Chạy trực tiếp: node git/01-basics-and-architecture/03-branching-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 03: PHÂN NHÁNH & HỢP NHẤT TRONG GIT ===");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-branch-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: tmpDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Branch Tester",
      GIT_AUTHOR_EMAIL: "branch@company.com",
      GIT_COMMITTER_NAME: "Branch Tester",
      GIT_COMMITTER_EMAIL: "branch@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Commit gốc C1
  fs.writeFileSync(path.join(tmpDir, "root.txt"), "Root version 1\n", "utf8");
  runGit("add root.txt");
  runGit("commit -m \"feat: base commit\"");
  const baseHash = runGit("rev-parse HEAD");

  // -------------------------------------------------------------
  // 1. Kiểm tra Fast-Forward Merge
  // -------------------------------------------------------------
  // Tạo và chuyển sang nhánh feature/fast-track
  runGit("switch -c feature/fast-track");
  assert.equal(runGit("branch --show-current"), "feature/fast-track");

  fs.writeFileSync(path.join(tmpDir, "feature.txt"), "Feature code\n", "utf8");
  runGit("add feature.txt");
  runGit("commit -m \"feat: add fast feature\"");
  const featureHash = runGit("rev-parse HEAD");

  // Chuyển về main và merge
  runGit("switch main");
  assert.equal(runGit("rev-parse HEAD"), baseHash);

  const mergeOutput = runGit("merge feature/fast-track");
  assert.match(mergeOutput, /Fast-forward/);

  // Sau Fast-Forward: main nhảy thẳng lên cùng commit với feature
  assert.equal(runGit("rev-parse HEAD"), featureHash);

  // -------------------------------------------------------------
  // 2. Kiểm tra 3-Way Merge Commit (Two Parents)
  // -------------------------------------------------------------
  // Tạo nhánh song song A
  runGit("switch -c branch-a");
  fs.writeFileSync(path.join(tmpDir, "file_a.txt"), "Branch A Work\n", "utf8");
  runGit("add file_a.txt");
  runGit("commit -m \"feat: branch A work\"");
  const branchAHash = runGit("rev-parse HEAD");

  // Quay về main và tạo commit độc lập B
  runGit("switch main");
  fs.writeFileSync(path.join(tmpDir, "file_b.txt"), "Branch Main Work\n", "utf8");
  runGit("add file_b.txt");
  runGit("commit -m \"feat: main independent work\"");
  const mainBeforeMerge = runGit("rev-parse HEAD");

  // Thực hiện 3-way merge
  runGit("merge branch-a -m \"merge: integrate branch-a into main\"");
  const mergeCommitHash = runGit("rev-parse HEAD");

  // Kiểm tra commit cha của Merge Commit: BẮT BUỘC có 2 parent
  const mergeDetails = runGit(`cat-file -p ${mergeCommitHash}`);
  const parentMatches = [...mergeDetails.matchAll(/^parent ([0-9a-f]{40})/gm)];
  assert.equal(parentMatches.length, 2);

  // Parent 1 là main trước đó, Parent 2 là branch-a
  assert.equal(parentMatches[0][1], mainBeforeMerge);
  assert.equal(parentMatches[1][1], branchAHash);

  // -------------------------------------------------------------
  // 3. Kiểm tra Cơ Chế Xóa Nhánh An Toàn (git branch -d)
  // -------------------------------------------------------------
  // Xóa nhánh đã merge thành công
  const deleteMergedResult = runGit("branch -d branch-a");
  assert.match(deleteMergedResult, /Deleted branch branch-a/);

  // Tạo một nhánh mới chưa hề merge
  runGit("switch -c unmerged-feature");
  fs.writeFileSync(path.join(tmpDir, "secret.txt"), "Unmerged Code\n", "utf8");
  runGit("add secret.txt");
  runGit("commit -m \"feat: secret unmerged\"");

  runGit("switch main");

  // git branch -d BẮT BUỘC phải báo lỗi từ chối xóa vì chưa merge
  assert.throws(() => {
    runGit("branch -d unmerged-feature");
  }, /not fully merged/);

  // Chỉ khi dùng cờ -D (ép buộc) mới xóa được
  const forceDeleteResult = runGit("branch -D unmerged-feature");
  assert.match(forceDeleteResult, /Deleted branch unmerged-feature/);

  console.log("-> 100% tests cho Phân nhánh & Hợp nhất đã pass thành công!");
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}
