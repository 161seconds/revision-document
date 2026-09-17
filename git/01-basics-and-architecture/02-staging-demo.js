/**
 * 02-staging-demo.js
 * Thực nghiệm và kiểm chứng vòng đời Staging, Diff và Trạng thái file trong Git
 * Chạy trực tiếp: node git/01-basics-and-architecture/02-staging-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 02: LỆNH CƠ BẢN & VÒNG ĐỜI STAGING ===");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-staging-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: tmpDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Staging Tester",
      GIT_AUTHOR_EMAIL: "staging@company.com",
      GIT_COMMITTER_NAME: "Staging Tester",
      GIT_COMMITTER_EMAIL: "staging@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // 1. Kiểm tra trạng thái Untracked ban đầu
  const noteFile = path.join(tmpDir, "notes.txt");
  fs.writeFileSync(noteFile, "Initial line 1\n", "utf8");

  let statusShort = runGit("status -s");
  assert.equal(statusShort, "?? notes.txt"); // '??' là Untracked

  // 2. Chuyển sang Staged
  runGit("add notes.txt");
  statusShort = runGit("status -s");
  assert.equal(statusShort, "A  notes.txt"); // 'A ' (cột 1 là 'A': staged mới)

  // 3. Commit lần đầu
  runGit("commit -m \"feat: add initial notes\"");
  statusShort = runGit("status -s");
  assert.equal(statusShort, ""); // Clean working tree

  // 4. BẪY KINH ĐIỂN: Sửa file sau khi add
  fs.appendFileSync(noteFile, "Unstaged line 2\n", "utf8");
  statusShort = runGit("status -s");
  assert.match(statusShort, /M notes\.txt/); // Modified chưa staged

  // Staging line 2
  runGit("add notes.txt");
  statusShort = runGit("status -s");
  assert.equal(statusShort, "M  notes.txt"); // 'M ' (cột 1 là 'M': modified đã staged)

  // Sửa tiếp line 3 mà KHÔNG add
  fs.appendFileSync(noteFile, "Unstaged line 3\n", "utf8");
  statusShort = runGit("status -s");
  assert.equal(statusShort, "MM notes.txt"); // 'MM': Vừa có staged vừa có unstaged!

  // 5. Kiểm tra phân biệt giữa git diff và git diff --staged
  const unstagedDiff = runGit("diff");
  assert.match(unstagedDiff, /\+Unstaged line 3/);
  assert.doesNotMatch(unstagedDiff, /\+Unstaged line 2/);

  const stagedDiff = runGit("diff --staged");
  assert.match(stagedDiff, /\+Unstaged line 2/);
  assert.doesNotMatch(stagedDiff, /\+Unstaged line 3/);

  // 6. Kiểm tra git restore --staged (Unstage an toàn không mất Working Tree)
  runGit("restore --staged notes.txt");
  const fileContentAfterUnstage = fs.readFileSync(noteFile, "utf8");
  assert.match(fileContentAfterUnstage, /Unstaged line 3/); // Vẫn còn nguyên vẹn trên đĩa

  statusShort = runGit("status -s");
  assert.match(statusShort, /M notes\.txt/); // Đã hạ từ Staged về Modified

  // 7. Hoàn tất commit toàn bộ
  runGit("add notes.txt");
  runGit("commit -m \"docs: finalize complete notes\"");

  const logOneLine = runGit("log --oneline");
  assert.match(logOneLine, /docs: finalize complete notes/);
  assert.match(logOneLine, /feat: add initial notes/);

  console.log("-> 100% tests cho Vòng đời Staging & Diff đã pass thành công!");
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}
