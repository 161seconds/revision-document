/**
 * 03-workflows-demo.js
 * Thực nghiệm và kiểm chứng Quy trình Fork, Upstream Syncing và Shallow Clone
 * Chạy trực tiếp: node git/02-remotes-and-collaboration/03-workflows-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 03: FORK, UPSTREAM & QUY TRÌNH DỰ ÁN ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-workflow-demo-"));

function runGit(repoDir, cmd, user = "Dev") {
  return execSync(`git ${cmd}`, {
    cwd: repoDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: user,
      GIT_AUTHOR_EMAIL: `${user.toLowerCase()}@org.com`,
      GIT_COMMITTER_NAME: user,
      GIT_COMMITTER_EMAIL: `${user.toLowerCase()}@org.com`,
    },
  }).trim();
}

try {
  // 1. Tạo kho lưu trữ gốc của Tổ chức (Upstream Core Repo)
  const upstreamPath = path.join(testWorkspace, "core-org.git");
  fs.mkdirSync(upstreamPath);
  runGit(upstreamPath, "init --bare -b main");

  // Đẩy commit ban đầu vào Upstream
  const initClient = path.join(testWorkspace, "init-client");
  fs.mkdirSync(initClient);
  runGit(initClient, "init -b main");
  fs.writeFileSync(path.join(initClient, "framework.js"), "// Core framework\n", "utf8");
  runGit(initClient, "add framework.js");
  runGit(initClient, "commit -m \"feat: initial framework\"");
  runGit(initClient, `remote add origin "${upstreamPath}"`);
  runGit(initClient, "push -u origin main");

  // 2. Mô phỏng Fork: Tạo bare repo cá nhân của Alice (Origin Fork)
  const aliceForkPath = path.join(testWorkspace, "alice-fork.git");
  runGit(testWorkspace, `clone --bare "${upstreamPath}" alice-fork.git`);

  // 3. Alice Clone fork về máy tính cá nhân
  const aliceLocal = path.join(testWorkspace, "alice-local");
  runGit(testWorkspace, `clone "${aliceForkPath}" alice-local`);

  // Alice cấu hình thêm remote upstream trỏ về Core Org
  runGit(aliceLocal, `remote add upstream "${upstreamPath}"`);

  const remotesList = runGit(aliceLocal, "remote -v");
  assert.match(remotesList, /origin\s+.*alice-fork\.git/);
  assert.match(remotesList, /upstream\s+.*core-org\.git/);

  // 4. Tổ chức gốc (Upstream) phát hành bản vá C2 từ lập trình viên khác
  fs.appendFileSync(path.join(initClient, "framework.js"), "// Upstream Security Patch C2\n", "utf8");
  runGit(initClient, "add framework.js");
  runGit(initClient, "commit -m \"fix: security patch v1.0.1 by Core\"");
  runGit(initClient, "push origin main");

  // 5. Alice đồng bộ code mới nhất từ Upstream về Fork cá nhân
  runGit(aliceLocal, "fetch upstream");
  runGit(aliceLocal, "merge --ff-only upstream/main");

  // Kiểm tra lịch sử local Alice đã có commit của tổ chức
  const aliceLog = runGit(aliceLocal, "log --oneline");
  assert.match(aliceLog, /fix: security patch v1\.0\.1 by Core/);

  // Alice đẩy đồng bộ lên fork của mình
  runGit(aliceLocal, "push origin main");

  // -------------------------------------------------------------
  // 6. Kiểm tra Shallow Clone (--depth 1)
  // -------------------------------------------------------------
  // Tạo thêm vài commit trên upstream để kiểm tra depth
  fs.appendFileSync(path.join(initClient, "framework.js"), "// Commit 3\n", "utf8");
  runGit(initClient, "commit -am \"feat: commit 3\"");
  fs.appendFileSync(path.join(initClient, "framework.js"), "// Commit 4\n", "utf8");
  runGit(initClient, "commit -am \"feat: commit 4\"");
  runGit(initClient, "push origin main");

  // CI/CD runner thực hiện shallow clone depth 1 (dùng file:// để kích hoạt cờ --depth)
  const ciRunnerPath = path.join(testWorkspace, "ci-runner");
  const fileUrl = `file://${upstreamPath.replace(/\\/g, "/")}`;
  runGit(testWorkspace, `clone --depth 1 "${fileUrl}" ci-runner`);

  // Lịch sử commit trên CI runner BẮT BUỘC chỉ có đúng 1 dòng duy nhất!
  const ciCommitCount = runGit(ciRunnerPath, "rev-list --count HEAD");
  assert.equal(ciCommitCount, "1");

  console.log("-> 100% tests cho Fork, Upstream Sync & Shallow Clone đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
