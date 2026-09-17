/**
 * practice.js - Module 04: Advanced Git & Enterprise Best Practices Test Suite
 * Chạy độc lập: node practice.js
 * Bộ kiểm tra toàn diện 5 thử thách Git nâng cao tự động hóa:
 * 1. Linear History Rebase Convergence Engine
 * 2. Automated Non-Interactive Autosquash & Fixup Engine
 * 3. 3-Way Merge Conflict Detection & Clean Abort Engine
 * 4. Cherry-Pick Provenance & Audit Trail Tracking (-x)
 * 5. Submodule Lifecycle & OID Pointer Mutation Engine
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 04 - ADVANCED GIT & ENTERPRISE ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-module04-practice-"));

function runInRepo(dir, cmd, user = "EnterpriseMaster") {
  return execSync(`git ${cmd}`, {
    cwd: dir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: user,
      GIT_AUTHOR_EMAIL: `${user.toLowerCase()}@enterprise.com`,
      GIT_COMMITTER_NAME: user,
      GIT_COMMITTER_EMAIL: `${user.toLowerCase()}@enterprise.com`,
      GIT_SEQUENCE_EDITOR: ":",
      EDITOR: ":",
    },
  }).trim();
}

try {
  // Cho phép file protocol cho submodule
  execSync("git config --global protocol.file.allow always");

  const repo = path.join(testWorkspace, "main-app");
  fs.mkdirSync(repo);
  runInRepo(repo, "init -b main");

  // -------------------------------------------------------------
  // THỬ THÁCH 1: LINEAR HISTORY REBASE CONVERGENCE ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 1: Linear History Rebase Convergence...");
  fs.writeFileSync(path.join(repo, "base.txt"), "Base Line\n", "utf8");
  runInRepo(repo, "add base.txt");
  runInRepo(repo, "commit -m \"feat: base commit\"");

  runInRepo(repo, "switch -c feature/linear");
  fs.writeFileSync(path.join(repo, "feature.txt"), "Feature Code\n", "utf8");
  runInRepo(repo, "add feature.txt");
  runInRepo(repo, "commit -m \"feat: feature commit\"");

  runInRepo(repo, "switch main");
  fs.writeFileSync(path.join(repo, "main_line.txt"), "Main parallel\n", "utf8");
  runInRepo(repo, "add main_line.txt");
  runInRepo(repo, "commit -m \"feat: main parallel work\"");
  const mainHead = runInRepo(repo, "rev-parse HEAD");

  // Rebase feature onto main
  runInRepo(repo, "switch feature/linear");
  runInRepo(repo, "rebase main");

  // Parent của feature BẮT BUỘC là mainHead
  assert.equal(runInRepo(repo, "rev-parse HEAD~1"), mainHead);
  assert.doesNotMatch(runInRepo(repo, "log --oneline"), /Merge/);
  console.log("   ✓ Thử thách 1 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 2: AUTOMATED AUTOSQUASH & FIXUP ENGINE
  // -------------------------------------------------------------
  console.log("-> Thử thách 2: Automated Autosquash & Fixup Engine...");
  const currentHead = runInRepo(repo, "rev-parse HEAD");
  fs.appendFileSync(path.join(repo, "feature.txt"), "// Quick typo fix\n", "utf8");
  runInRepo(repo, "add feature.txt");
  runInRepo(repo, `commit --fixup ${currentHead}`);

  // Rebase autosquash
  runInRepo(repo, "rebase -i --autosquash HEAD~2");
  const logAfterSquash = runInRepo(repo, "log -n 1 --oneline");
  assert.match(logAfterSquash, /feat: feature commit/);
  assert.doesNotMatch(logAfterSquash, /fixup!/);
  assert.match(fs.readFileSync(path.join(repo, "feature.txt"), "utf8"), /Quick typo fix/);
  console.log("   ✓ Thử thách 2 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 3: 3-WAY CONFLICT DETECTION & CLEAN ABORT
  // -------------------------------------------------------------
  console.log("-> Thử thách 3: Conflict Detection & Clean Abort...");
  runInRepo(repo, "switch main");
  const conflictFile = path.join(repo, "shared.env");
  fs.writeFileSync(conflictFile, "PORT=8080\n", "utf8");
  runInRepo(repo, "add shared.env");
  runInRepo(repo, "commit -m \"feat: base port\"");

  runInRepo(repo, "switch -c side-branch");
  fs.writeFileSync(conflictFile, "PORT=9090\n", "utf8");
  runInRepo(repo, "commit -am \"feat: update port to 9090\"");

  runInRepo(repo, "switch main");
  fs.writeFileSync(conflictFile, "PORT=7070\n", "utf8");
  runInRepo(repo, "commit -am \"feat: update port to 7070\"");

  // Merge gây conflict
  assert.throws(
    () => {
      runInRepo(repo, "merge side-branch");
    },
    (err) => String(err.stdout).includes("CONFLICT")
  );

  assert.match(fs.readFileSync(conflictFile, "utf8"), /<<<<<<< HEAD/);

  // Abort
  runInRepo(repo, "merge --abort");
  assert.doesNotMatch(fs.readFileSync(conflictFile, "utf8"), /<<<<<<</);
  assert.match(fs.readFileSync(conflictFile, "utf8"), /PORT=7070/);
  console.log("   ✓ Thử thách 3 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 4: CHERRY-PICK PROVENANCE & AUDIT ENGINE (-x)
  // -------------------------------------------------------------
  console.log("-> Thử thách 4: Cherry-Pick Provenance Engine (-x)...");
  runInRepo(repo, "switch side-branch");
  fs.writeFileSync(path.join(repo, "patch.js"), "const FIXED = true;\n", "utf8");
  runInRepo(repo, "add patch.js");
  runInRepo(repo, "commit -m \"fix(security): emergency CVE patch\"");
  const sideCommitHash = runInRepo(repo, "rev-parse HEAD");

  runInRepo(repo, "switch main");
  runInRepo(repo, `cherry-pick -x ${sideCommitHash}`);

  assert.equal(fs.existsSync(path.join(repo, "patch.js")), true);
  const cherryLog = runInRepo(repo, "log -n 1");
  assert.match(cherryLog, /fix\(security\): emergency CVE patch/);
  assert.match(cherryLog, new RegExp(`cherry picked from commit ${sideCommitHash}`));
  console.log("   ✓ Thử thách 4 hoàn thành xuất sắc!");

  // -------------------------------------------------------------
  // THỬ THÁCH 5: SUBMODULE LIFECYCLE & POINTER MUTATION
  // -------------------------------------------------------------
  console.log("-> Thử thách 5: Submodule Lifecycle & Pointer Mutation...");
  const bareDep = path.join(testWorkspace, "bare-dep.git");
  fs.mkdirSync(bareDep);
  runInRepo(bareDep, "init --bare -b main");

  const depClient = path.join(testWorkspace, "dep-client");
  fs.mkdirSync(depClient);
  runInRepo(depClient, "init -b main");
  fs.writeFileSync(path.join(depClient, "lib.js"), "// lib v1\n", "utf8");
  runInRepo(depClient, "add lib.js");
  runInRepo(depClient, "commit -m \"feat: lib v1\"");
  runInRepo(depClient, `remote add origin "${bareDep}"`);
  runInRepo(depClient, "push -u origin main");
  const depV1Hash = runInRepo(depClient, "rev-parse HEAD");

  // Add submodule vào main app
  const bareDepUrl = `file://${bareDep.replace(/\\/g, "/")}`;
  runInRepo(repo, `submodule add "${bareDepUrl}" modules/lib`);
  runInRepo(repo, "commit -am \"chore: add lib submodule\"");

  const subStatus = runInRepo(repo, "submodule status");
  assert.match(subStatus, new RegExp(`${depV1Hash}.*modules/lib`));

  // Lib cập nhật V2
  fs.appendFileSync(path.join(depClient, "lib.js"), "// lib v2\n", "utf8");
  runInRepo(depClient, "commit -am \"feat: lib v2\"");
  runInRepo(depClient, "push origin main");
  const depV2Hash = runInRepo(depClient, "rev-parse HEAD");

  // Update submodule
  runInRepo(repo, "submodule update --remote --merge");
  const updatedSubStatus = runInRepo(repo, "submodule status");
  assert.match(updatedSubStatus, new RegExp(`${depV2Hash}.*modules/lib`));
  console.log("   ✓ Thử thách 5 hoàn thành xuất sắc!");

  console.log("\n=======================================================");
  console.log("-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 04 ĐÃ VƯỢT QUA 100%!");
  console.log("=======================================================");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
