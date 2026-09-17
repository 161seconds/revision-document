/**
 * 05-ignoring-demo.js
 * Thực nghiệm và kiểm chứng .gitignore, git rm --cached và git check-ignore
 * Chạy trực tiếp: node git/01-basics-and-architecture/05-ignoring-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 05: .GITIGNORE & QUY TẮC BỎ QUA ===");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-ignore-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: tmpDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Ignore Tester",
      GIT_AUTHOR_EMAIL: "ignore@company.com",
      GIT_COMMITTER_NAME: "Ignore Tester",
      GIT_COMMITTER_EMAIL: "ignore@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // 1. Tạo file .gitignore với các quy tắc mẫu
  const gitignoreContent = [
    "*.log",
    "!important.log",
    "temp/",
    ".env",
  ].join("\n") + "\n";

  fs.writeFileSync(path.join(tmpDir, ".gitignore"), gitignoreContent, "utf8");

  // Tạo các file test
  fs.writeFileSync(path.join(tmpDir, "debug.log"), "Debug log content\n", "utf8");
  fs.writeFileSync(path.join(tmpDir, "important.log"), "Crucial audit log\n", "utf8");

  fs.mkdirSync(path.join(tmpDir, "temp"));
  fs.writeFileSync(path.join(tmpDir, "temp", "cache.dat"), "Cache binary data\n", "utf8");

  fs.writeFileSync(path.join(tmpDir, "app.js"), "console.log('App running');\n", "utf8");

  // Kiểm tra git status
  const statusOutput = runGit("status -s");

  // debug.log và temp/cache.dat BẮT BUỘC KHÔNG xuất hiện
  assert.doesNotMatch(statusOutput, /debug\.log/);
  assert.doesNotMatch(statusOutput, /temp/);

  // important.log và app.js BẮT BUỘC phải xuất hiện (Trackable)
  assert.match(statusOutput, /important\.log/);
  assert.match(statusOutput, /app\.js/);

  // 2. Kiểm tra lệnh truy vết git check-ignore
  const checkIgnoreDebug = runGit("check-ignore -v debug.log");
  assert.match(checkIgnoreDebug, /\.gitignore:1:\*\.log\s+debug\.log/);

  // 3. BẪY KINH ĐIỂN: git rm --cached cho file đã lỡ commit
  // Tạo và commit file bí mật .env (mô phỏng lúc chưa có .gitignore)
  const secretEnvFile = path.join(tmpDir, ".env");
  fs.writeFileSync(secretEnvFile, "DATABASE_PASSWORD=super_secret_123\n", "utf8");

  // Bắt buộc add kể cả khi bị ignore bằng cờ -f
  runGit("add -f .env");
  runGit("add .gitignore app.js important.log");
  runGit("commit -m \"feat: initial commit with accidental env\"");

  // Giờ sửa .env, Git vẫn theo dõi vì nó đã nằm trong commit
  fs.appendFileSync(secretEnvFile, "API_KEY=xyz987\n", "utf8");
  assert.match(runGit("status -s"), /M \.env/);

  // Áp dụng giải pháp: git rm --cached
  runGit("rm --cached .env");

  // File vật lý trên đĩa cứng BẮT BUỘC vẫn còn nguyên vẹn!
  assert.equal(fs.existsSync(secretEnvFile), true);
  const preservedEnvContent = fs.readFileSync(secretEnvFile, "utf8");
  assert.match(preservedEnvContent, /DATABASE_PASSWORD=super_secret_123/);

  // Commit việc gỡ bỏ theo dõi
  runGit("commit -m \"chore: remove .env from git tracking\"");

  // Sau khi commit, file .env trở về trạng thái bị ignore (hoàn toàn sạch sẽ)
  assert.doesNotMatch(runGit("status -s"), /\.env/);

  console.log("-> 100% tests cho .gitignore & Thuộc tính đã pass thành công!");
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}
