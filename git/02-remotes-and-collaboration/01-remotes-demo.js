/**
 * 01-remotes-demo.js
 * Thực nghiệm và kiểm chứng Quản lý Remote (Add, Rename, Set-url, Inspect .git/config)
 * Chạy trực tiếp: node git/02-remotes-and-collaboration/01-remotes-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 01: MÁY CHỦ TỪ XA & GIAO THỨC REMOTE ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-remote-demo-"));

function runGit(repoDir, cmd) {
  return execSync(`git ${cmd}`, {
    cwd: repoDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Remote Tester",
      GIT_AUTHOR_EMAIL: "remote@company.com",
      GIT_COMMITTER_NAME: "Remote Tester",
      GIT_COMMITTER_EMAIL: "remote@company.com",
    },
  }).trim();
}

try {
  // 1. Tạo một Bare Repository đóng vai trò Remote Server trên ổ đĩa
  const bareServerPath = path.join(testWorkspace, "company-server.git");
  fs.mkdirSync(bareServerPath);
  runGit(bareServerPath, "init --bare -b main");

  // 2. Tạo Local Repository làm việc
  const localRepoPath = path.join(testWorkspace, "local-client");
  fs.mkdirSync(localRepoPath);
  runGit(localRepoPath, "init -b main");

  // Commit ban đầu
  fs.writeFileSync(path.join(localRepoPath, "README.md"), "# Company System\n", "utf8");
  runGit(localRepoPath, "add README.md");
  runGit(localRepoPath, "commit -m \"feat: initial commit\"");

  // -------------------------------------------------------------
  // 3. Thao Tác Thêm & Quản Lý Remote
  // -------------------------------------------------------------
  // Ban đầu chưa có remote
  assert.equal(runGit(localRepoPath, "remote"), "");

  // Thêm remote origin
  runGit(localRepoPath, `remote add origin "${bareServerPath}"`);
  assert.equal(runGit(localRepoPath, "remote"), "origin");

  // Kiểm tra remote -v
  const remoteVerbose = runGit(localRepoPath, "remote -v");
  assert.match(remoteVerbose, /origin\s+.*company-server\.git \(fetch\)/);
  assert.match(remoteVerbose, /origin\s+.*company-server\.git \(push\)/);

  // Đổi URL của remote (set-url)
  const dummyHttpsUrl = "https://github.com/company/enterprise-app.git";
  runGit(localRepoPath, `remote set-url origin ${dummyHttpsUrl}`);
  assert.match(runGit(localRepoPath, "remote -v"), /https:\/\/github\.com\/company\/enterprise-app\.git/);

  // Khôi phục lại URL bare server thật
  runGit(localRepoPath, `remote set-url origin "${bareServerPath}"`);

  // Đổi tên remote (rename)
  runGit(localRepoPath, "remote rename origin upstream");
  assert.equal(runGit(localRepoPath, "remote"), "upstream");

  // Đổi lại thành origin
  runGit(localRepoPath, "remote rename upstream origin");

  // -------------------------------------------------------------
  // 4. Kiểm Tra Tác Động Trực Tiếp Đến File .git/config
  // -------------------------------------------------------------
  const gitConfigContent = fs.readFileSync(path.join(localRepoPath, ".git", "config"), "utf8");
  assert.match(gitConfigContent, /\[remote "origin"\]/);
  assert.match(gitConfigContent, /fetch = \+refs\/heads\/\*:refs\/remotes\/origin\/\*/);

  // -------------------------------------------------------------
  // 5. Kiểm Tra Xóa Remote (remove)
  // -------------------------------------------------------------
  runGit(localRepoPath, "remote add staging https://staging.server/app.git");
  assert.match(runGit(localRepoPath, "remote"), /staging/);

  runGit(localRepoPath, "remote remove staging");
  assert.doesNotMatch(runGit(localRepoPath, "remote"), /staging/);

  console.log("-> 100% tests cho Quản lý Git Remote đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
