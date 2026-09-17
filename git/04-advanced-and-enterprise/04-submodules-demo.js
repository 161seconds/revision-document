/**
 * 04-submodules-demo.js
 * Thực nghiệm và kiểm chứng Git Submodules, .gitmodules và Cập nhật Con trỏ Submodule
 * Chạy trực tiếp: node git/04-advanced-and-enterprise/04-submodules-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 04: GIT SUBMODULES & CẤU HÌNH ENTERPRISE ===");

const testWorkspace = fs.mkdtempSync(path.join(os.tmpdir(), "git-submodule-demo-"));

function runGit(repoDir, cmd) {
  return execSync(`git ${cmd}`, {
    cwd: repoDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Submodule Master",
      GIT_AUTHOR_EMAIL: "submodule@company.com",
      GIT_COMMITTER_NAME: "Submodule Master",
      GIT_COMMITTER_EMAIL: "submodule@company.com",
    },
  }).trim();
}

try {
  // Cấu hình cho phép file protocol khi clone submodule trên máy local (Git 2.38+ security patch)
  execSync("git config --global protocol.file.allow always");

  // 1. Tạo thư viện dùng chung (Shared Library Bare Repo)
  const libServerPath = path.join(testWorkspace, "shared-lib.git");
  fs.mkdirSync(libServerPath);
  runGit(libServerPath, "init --bare -b main");

  // Đẩy code V1 vào thư viện
  const libDevPath = path.join(testWorkspace, "lib-dev");
  fs.mkdirSync(libDevPath);
  runGit(libDevPath, "init -b main");
  fs.writeFileSync(path.join(libDevPath, "logger.js"), "function log(m) { return '[LOG] ' + m; }\n", "utf8");
  runGit(libDevPath, "add logger.js");
  runGit(libDevPath, "commit -m \"feat: initial logger v1.0\"");
  runGit(libDevPath, `remote add origin "${libServerPath}"`);
  runGit(libDevPath, "push -u origin main");
  const libV1Hash = runGit(libDevPath, "rev-parse HEAD");

  // 2. Tạo dự án chính (Main App)
  const appPath = path.join(testWorkspace, "main-app");
  fs.mkdirSync(appPath);
  runGit(appPath, "init -b main");
  fs.writeFileSync(path.join(appPath, "app.js"), "// Main application\n", "utf8");
  runGit(appPath, "add app.js");
  runGit(appPath, "commit -m \"feat: initial main app\"");

  // 3. Thêm Submodule vào main-app
  const libUrl = `file://${libServerPath.replace(/\\/g, "/")}`;
  runGit(appPath, `submodule add "${libUrl}" libs/shared-lib`);

  // Kiểm tra file .gitmodules được tự động sinh ra
  const gitmodulesPath = path.join(appPath, ".gitmodules");
  assert.equal(fs.existsSync(gitmodulesPath), true);
  const gitmodulesContent = fs.readFileSync(gitmodulesPath, "utf8");
  assert.match(gitmodulesContent, /\[submodule "libs\/shared-lib"\]/);
  assert.match(gitmodulesContent, /path = libs\/shared-lib/);

  // File logger.js của submodule đã xuất hiện trong thư mục con
  assert.equal(fs.existsSync(path.join(appPath, "libs", "shared-lib", "logger.js")), true);

  // Commit việc thêm submodule
  runGit(appPath, "commit -am \"chore: add shared-lib as submodule\"");

  // Kiểm tra con trỏ submodule trong repo cha trỏ đúng vào libV1Hash
  const submoduleStatus = runGit(appPath, "submodule status");
  assert.match(submoduleStatus, new RegExp(`${libV1Hash}.*libs/shared-lib`));

  // -------------------------------------------------------------
  // 4. Thư viện phát hành bản V2 & Repo cha cập nhật
  // -------------------------------------------------------------
  fs.appendFileSync(path.join(libDevPath, "logger.js"), "function errorLog(m) { return '[ERR] ' + m; }\n", "utf8");
  runGit(libDevPath, "commit -am \"feat: add errorLog v2.0\"");
  runGit(libDevPath, "push origin main");
  const libV2Hash = runGit(libDevPath, "rev-parse HEAD");

  // Main app cập nhật submodule từ remote
  runGit(appPath, "submodule update --remote --merge");

  // Con trỏ submodule trong main app BẮT BUỘC đã nhảy lên V2
  const updatedSubmoduleStatus = runGit(appPath, "submodule status");
  assert.match(updatedSubmoduleStatus, new RegExp(`${libV2Hash}.*libs/shared-lib`));

  // File trong submodule đã có hàm errorLog mới
  const updatedLoggerCode = fs.readFileSync(path.join(appPath, "libs", "shared-lib", "logger.js"), "utf8");
  assert.match(updatedLoggerCode, /function errorLog/);

  console.log("-> 100% tests cho Git Submodules đã pass thành công!");
} finally {
  try {
    fs.rmSync(testWorkspace, { recursive: true, force: true });
  } catch {}
}
