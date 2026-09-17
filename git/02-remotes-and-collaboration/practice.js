/**
 * practice.js - Module 02: Git Remotes & Team Collaboration Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách tích hợp Remote & Collaboration:
 * 1. Remote Configuration & Multi-URL Mutation Engine
 * 2. Upstream Branch Tracking & Ahead/Behind Detection Engine
 * 3. Non-Fast-Forward Conflict Rejection & Rebase Convergence
 * 4. Dual-Remote Fork/Upstream Contribution Synchronization Engine
 * 5. Shallow Clone Optimization & Unshallow Conversion Engine
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 02 - REMOTES & COLLABORATION ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-module02-practice-"));

function runInRepo(dir, cmd, user = "Master") {
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
  // -------------------------------------------------------------
  // THỬ THÁCH 1: REMOTE CONFIGURATION & MULTI-URL MUTATION
  // -------------------------------------------------------------
  console.log("-> Thử thách 1: Remote Configuration & Multi-URL Mutation...");
  const clientRepo = path.join(testWorkspace, "client-repo");
  fs.mkdirSync(clientRepo);
  runInRepo(clientRepo, "init -b main");

  runInRepo(clientRepo, "remote add origin https://github.com/my-org/project.git");
  runInRepo(clientRepo, "remote add backup git@gitlab.com:my-org/project-backup.git");

  const remotes = runInRepo(clientRepo, "remote -v");
  assert.match(remotes, /origin\s+https:\/\/github\.com\/my-org\/project\.git/);
  assert.match(remotes, /backup\s+git@gitlab\.com:my-org\/project-backup\.git/);

  // Đổi URL và đổi tên remote
  runInRepo(clientRepo, "remote set-url origin git@github.com:my-org/project.git");
  runInRepo(clientRepo, "remote rename backup mirror");

  assert.match(runInRepo(clientRepo, "remote -v"), /origin\s+git@github\.com:my-org\/project\.git/);
  assert.match(runInRepo(clientRepo, "remote"), /mirror/);
  console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 2: UPSTREAM TRACKING & AHEAD/BEHIND ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 2: Upstream Branch Tracking & Ahead/Behind Engine...");
  const bareServer = path.join(testWorkspace, "bare-server.git");
  fs.mkdirSync(bareServer);
  runInRepo(bareServer, "init --bare -b main");

  fs.writeFileSync(path.join(clientRepo, "init.txt"), "Init\n", "utf8");
  runInRepo(clientRepo, "add init.txt");
  runInRepo(clientRepo, "commit -m \"feat: init repo\"");
  runInRepo(clientRepo, `remote set-url origin "${bareServer}"`);
  runInRepo(clientRepo, "push -u origin main");

  // Tạo 2 commit mới tại client mà chưa push
  fs.appendFileSync(path.join(clientRepo, "init.txt"), "Commit 2\n", "utf8");
  runInRepo(clientRepo, "commit -am \"feat: commit 2\"");
  fs.appendFileSync(path.join(clientRepo, "init.txt"), "Commit 3\n", "utf8");
  runInRepo(clientRepo, "commit -am \"feat: commit 3\"");

  // Kiểm tra số lượng ahead (phải là ahead 2)
  const aheadCount = runInRepo(clientRepo, "rev-list --count origin/main..HEAD");
  assert.equal(aheadCount, "2");

  runInRepo(clientRepo, "push origin main");
  assert.equal(runInRepo(clientRepo, "rev-list --count origin/main..HEAD"), "0");
  console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 3: NON-FAST-FORWARD CONFLICT REJECTION & REBASE
  // -------------------------------------------------------------
  console.log("-> Thử thách 3: Non-Fast-Forward Rejection & Rebase Convergence...");
  // Clone sang coworker repo
  const coworkerRepo = path.join(testWorkspace, "coworker-repo");
  runInRepo(testWorkspace, `clone "${bareServer}" coworker-repo`, "Coworker");

  // Client commit và push
  fs.writeFileSync(path.join(clientRepo, "client_feature.txt"), "Client Feature\n", "utf8");
  runInRepo(clientRepo, "add client_feature.txt");
  runInRepo(clientRepo, "commit -m \"feat: client feature by Master\"");
  runInRepo(clientRepo, "push origin main");

  // Coworker cũng commit độc lập
  fs.writeFileSync(path.join(coworkerRepo, "coworker_feature.txt"), "Coworker Feature\n", "utf8");
  runInRepo(coworkerRepo, "add coworker_feature.txt", "Coworker");
  runInRepo(coworkerRepo, "commit -m \"feat: coworker feature\"", "Coworker");

  // Coworker push bị từ chối
  assert.throws(() => {
    runInRepo(coworkerRepo, "push origin main", "Coworker");
  }, /rejected/);

  // Coworker kéo về qua rebase
  runInRepo(coworkerRepo, "pull --rebase origin main", "Coworker");

  // Lịch sử commit tuyến tính
  const logCoworker = runInRepo(coworkerRepo, "log --oneline", "Coworker");
  assert.match(logCoworker, /feat: coworker feature/);
  assert.match(logCoworker, /feat: client feature by Master/);

  runInRepo(coworkerRepo, "push origin main", "Coworker");
  console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 4: DUAL-REMOTE FORK/UPSTREAM CONTRIBUTION ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 4: Dual-Remote Fork/Upstream Sync...");
  const devFork = path.join(testWorkspace, "dev-fork.git");
  runInRepo(testWorkspace, `clone --bare "${bareServer}" dev-fork.git`);

  const devLocal = path.join(testWorkspace, "dev-local");
  runInRepo(testWorkspace, `clone "${devFork}" dev-local`, "Dev");
  runInRepo(devLocal, `remote add upstream "${bareServer}"`, "Dev");

  // Tổ chức có commit mới
  fs.writeFileSync(path.join(clientRepo, "patch.txt"), "Urgent patch\n", "utf8");
  runInRepo(clientRepo, "add patch.txt");
  runInRepo(clientRepo, "commit -m \"fix: org patch\"");
  runInRepo(clientRepo, "pull --rebase origin main");
  runInRepo(clientRepo, "push origin main");

  // Dev fetch upstream và merge --ff-only
  runInRepo(devLocal, "fetch upstream", "Dev");
  runInRepo(devLocal, "merge --ff-only upstream/main", "Dev");
  runInRepo(devLocal, "push origin main", "Dev");

  assert.equal(fs.existsSync(path.join(devLocal, "patch.txt")), true);
  console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 5: SHALLOW CLONE OPTIMIZATION & UNSHALLOW
  // -------------------------------------------------------------
  console.log("-> Thử thách 5: Shallow Clone & Unshallow Conversion...");
  const shallowDir = path.join(testWorkspace, "shallow-runner");
  const serverFileUrl = `file://${bareServer.replace(/\\/g, "/")}`;

  runInRepo(testWorkspace, `clone --depth 1 "${serverFileUrl}" shallow-runner`);
  assert.equal(runInRepo(shallowDir, "rev-list --count HEAD"), "1");

  // Chuyển đổi thành repo đầy đủ qua --unshallow
  runInRepo(shallowDir, "fetch --unshallow");
  const fullCount = parseInt(runInRepo(shallowDir, "rev-list --count HEAD"), 10);
  assert.ok(fullCount >= 4, "Unshallow must restore full commit history");
  console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

  console.log("\n=======================================================");
  console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 02 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
