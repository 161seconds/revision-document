/**
 * 01-architecture-demo.js
 * Thực nghiệm và kiểm chứng kiến trúc nội tại Git (Objects, Hash, HEAD, Refs)
 * Chạy trực tiếp: node git/01-basics-and-architecture/01-architecture-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 01: KIẾN TRÚC NỘI TẠI CỦA GIT ===");

// Tạo thư mục tạm cô lập cho test
const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-arch-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: tmpDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Dev Tester",
      GIT_AUTHOR_EMAIL: "tester@company.com",
      GIT_COMMITTER_NAME: "Dev Tester",
      GIT_COMMITTER_EMAIL: "tester@company.com",
    },
  }).trim();
}

try {
  // 1. Khởi tạo Git Repo
  runGit("init -b main");
  assert.equal(fs.existsSync(path.join(tmpDir, ".git")), true);
  assert.equal(fs.existsSync(path.join(tmpDir, ".git", "objects")), true);
  assert.equal(fs.existsSync(path.join(tmpDir, ".git", "refs")), true);

  // 2. Kiểm tra file HEAD ban đầu
  const headContent = fs.readFileSync(path.join(tmpDir, ".git", "HEAD"), "utf8").trim();
  assert.equal(headContent, "ref: refs/heads/main");

  // 3. Cơ chế Content-Addressable Storage (CAS) & Hash Object
  const sampleContent = "Hello Enterprise Git Internals\n";
  const filePathA = path.join(tmpDir, "file_a.txt");
  const filePathB = path.join(tmpDir, "file_b.txt");

  fs.writeFileSync(filePathA, sampleContent, "utf8");
  fs.writeFileSync(filePathB, sampleContent, "utf8"); // Cùng nội dung, khác tên file

  // Tính mã hash bằng git hash-object
  const hashA = runGit("hash-object file_a.txt");
  const hashB = runGit("hash-object file_b.txt");

  // Hai file cùng nội dung BẮT BUỘC có cùng mã hash SHA-1
  assert.equal(hashA, hashB);
  assert.equal(typeof hashA, "string");
  assert.equal(hashA.length, 40); // 40 ký tự hexa

  // 4. Kiểm tra đối tượng trong Object Database sau khi 'git add'
  runGit("add file_a.txt file_b.txt");

  // Kiểm tra loại object: phải là 'blob'
  const objectType = runGit(`cat-file -t ${hashA}`);
  assert.equal(objectType, "blob");

  // Đọc nội dung giải nén từ object database
  const extractedContent = runGit(`cat-file -p ${hashA}`);
  assert.equal(extractedContent, "Hello Enterprise Git Internals");

  // 5. Kiểm tra đối tượng Commit và Tree sau khi 'git commit'
  runGit("commit -m \"feat: initialize core files\"");
  const commitHash = runGit("rev-parse HEAD");
  assert.equal(commitHash.length, 40);

  // Loại đối tượng commit
  assert.equal(runGit(`cat-file -t ${commitHash}`), "commit");

  // Lấy Tree hash từ commit
  const commitDetails = runGit(`cat-file -p ${commitHash}`);
  assert.match(commitDetails, /^tree [0-9a-f]{40}/m);
  assert.match(commitDetails, /author Dev Tester <tester@company\.com>/);

  // 6. Kiểm tra bản chất Branch pointer trong file system
  const branchPointerPath = path.join(tmpDir, ".git", "refs", "heads", "main");
  const branchHash = fs.readFileSync(branchPointerPath, "utf8").trim();
  assert.equal(branchHash, commitHash);

  console.log("-> 100% tests cho Kiến trúc nội tại Git đã pass thành công!");
} finally {
  // Dọn dẹp thư mục tạm
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {
    // Bỏ qua lỗi khóa file tạm thời trên Windows
  }
}
