/**
 * 04-stashing-tagging-demo.js
 * Thực nghiệm và kiểm chứng Git Stash (WIP, Untracked) & Git Tags (Lightweight vs Annotated)
 * Chạy trực tiếp: node git/01-basics-and-architecture/04-stashing-tagging-demo.js
 */

const assert = require("node:assert/strict");
const { execSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

console.log("=== BẮT ĐẦU KIỂM TRA 04: GIT STASH & TAGGING ===");

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "git-stash-demo-"));

function runGit(cmd) {
  return execSync(`git ${cmd}`, {
    cwd: tmpDir,
    encoding: "utf8",
    env: {
      ...process.env,
      GIT_AUTHOR_NAME: "Tag Tester",
      GIT_AUTHOR_EMAIL: "tag@company.com",
      GIT_COMMITTER_NAME: "Tag Tester",
      GIT_COMMITTER_EMAIL: "tag@company.com",
    },
  }).trim();
}

try {
  runGit("init -b main");

  // Commit cơ sở
  fs.writeFileSync(path.join(tmpDir, "index.js"), "console.log('App v1');\n", "utf8");
  runGit("add index.js");
  runGit("commit -m \"feat: base application\"");
  const baseCommitHash = runGit("rev-parse HEAD");

  // -------------------------------------------------------------
  // 1. Kiểm tra Git Stash (với Tracked và Untracked Files)
  // -------------------------------------------------------------
  // Sửa file tracked
  fs.appendFileSync(path.join(tmpDir, "index.js"), "console.log('WIP logic');\n", "utf8");

  // Tạo file mới hoàn toàn (Untracked)
  fs.writeFileSync(path.join(tmpDir, "new_feature.js"), "// New file\n", "utf8");

  // Stash với cờ -u (include-untracked)
  runGit("stash push -u -m \"WIP: new feature & app update\"");

  // Working tree phải sạch sẽ 100%
  assert.equal(runGit("status -s"), "");
  assert.equal(fs.existsSync(path.join(tmpDir, "new_feature.js")), false); // File mới đã được cất vào stash!

  // Kiểm tra danh sách stash
  const stashList = runGit("stash list");
  assert.match(stashList, /WIP: new feature & app update/);

  // Khôi phục bằng stash pop
  runGit("stash pop");
  assert.equal(fs.existsSync(path.join(tmpDir, "new_feature.js")), true); // File mới đã trở lại!
  const restoredIndexContent = fs.readFileSync(path.join(tmpDir, "index.js"), "utf8");
  assert.match(restoredIndexContent, /WIP logic/);

  // Dọn dẹp để chuẩn bị test Tag
  runGit("add .");
  runGit("commit -m \"feat: complete release v1.0\"");
  const releaseCommitHash = runGit("rev-parse HEAD");

  // -------------------------------------------------------------
  // 2. Kiểm tra Bản Chất Lightweight Tag vs Annotated Tag
  // -------------------------------------------------------------
  // Tạo Lightweight Tag (chỉ là pointer tới commit)
  runGit("tag v1.0-light");

  // Tạo Annotated Tag (đối tượng tag hoàn chỉnh trong object database)
  runGit("tag -a v1.0.0 -m \"Release version 1.0.0 for Production\"");

  // Kiểm chứng qua Plumbing Command: cat-file -t
  // Lightweight tag trỏ thẳng tới commit nên type là 'commit'
  const lightType = runGit("cat-file -t v1.0-light");
  assert.equal(lightType, "commit");

  // Annotated tag là đối tượng độc lập nên type là 'tag'
  const annotatedType = runGit("cat-file -t v1.0.0");
  assert.equal(annotatedType, "tag");

  // Đọc nội dung Annotated tag: phải chứa tagger, email, message và commit trỏ tới
  const tagDetails = runGit("cat-file -p v1.0.0");
  assert.match(tagDetails, new RegExp(`object ${releaseCommitHash}`));
  assert.match(tagDetails, /type commit/);
  assert.match(tagDetails, /tagger Tag Tester <tag@company\.com>/);
  assert.match(tagDetails, /Release version 1\.0\.0 for Production/);

  // 3. Xóa Tag cục bộ
  runGit("tag -d v1.0-light");
  const allTags = runGit("tag -l");
  assert.equal(allTags, "v1.0.0"); // v1.0-light đã bị xóa

  console.log("-> 100% tests cho Git Stash & Tagging đã pass thành công!");
} finally {
  try {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  } catch {}
}
