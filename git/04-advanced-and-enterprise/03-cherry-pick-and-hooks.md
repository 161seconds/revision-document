# Trích Lọc Commit (Git Cherry-Pick) & Tự Động Hóa Với Git Hooks

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đối tượng Commit và cơ chế lưu trữ thư mục `.git/`).
  - [01-basics-and-architecture/03-branching-and-merging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/03-branching-and-merging.md) (Chiến lược phân nhánh).
- **Khái niệm tương quan**:
  - **Patch Application**: Áp dụng một bản vá cụ thể vào codebase mà không cần kéo theo toàn bộ lịch sử nhánh.
  - **Quality Gatekeeper**: Chốt chặn bảo đảm chất lượng mã nguồn tự động ở máy trạm lập trình viên trước khi code kịp rời khỏi máy.
- **Điểm đến tiếp theo**:
  - [04-submodules-lfs-and-signing.md](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/04-submodules-lfs-and-signing.md) (Quản lý Submodules, Git LFS và Chữ ký số GPG).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Kỹ Thuật Của `git cherry-pick`
Lệnh `git cherry-pick <commit-hash>` lấy đúng **một commit đơn lẻ** từ bất kỳ nhánh nào trong repository và áp dụng (replay) lên đỉnh của nhánh bạn đang đứng:
- Git trích xuất nội dung thay đổi (diff) mà commit đó tạo ra.
- Git áp dụng diff đó lên commit hiện tại và tạo ra một **Commit MỚI** với mã SHA-1 mới, tác giả ban đầu được bảo toàn nhưng Committer và thời gian commit được cập nhật lại.
- **Cờ `-x` (Chuẩn Enterprise)**: Tự động bổ sung dòng chú thích nguồn gốc:
  ```
  (cherry picked from commit 7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c)
  ```
  Giúp các thành viên trong dự án dễ dàng truy vết bản vá này được lấy từ đâu.

```
Nhánh Develop:
  (C1) ---> (C2: Hotfix quan trọng) ---> (C3: Tính năng dở dang)

Nhánh Main (Production):
  (C1) -------------------------------> (C2': git cherry-pick C2)
  [Chỉ lấy riêng Hotfix C2 mà không kéo theo C3 dở dang!]
```

### 2.2. Kiến Trúc Git Hooks (Client-side vs Server-side)
Git Hooks là các tập lệnh (Scripts) được Git tự động kích hoạt tại các mốc sự kiện quan trọng trong vòng đời phát triển.
- Nằm tại thư mục `.git/hooks/`. Mặc định Git tạo sẵn các file `.sample`. Chỉ cần bỏ đuôi `.sample` và cấp quyền thực thi (`chmod +x`) là hook sẽ hoạt động.
- Nếu tập lệnh hook trả về mã lỗi khác 0 (`exit 1`), tiến trình của Git sẽ **lập tức bị hủy bỏ**.

```
[ LẬP TRÌNH VIÊN ]
       |
       |--- 1. git commit
       v
+------------------+
| pre-commit hook  | ===(Fail)====> HỦY COMMIT (Linting / Formatter báo lỗi!)
+------------------+
       | (Pass)
       v
+------------------+
| commit-msg hook  | ===(Fail)====> HỦY COMMIT (Sai chuẩn Conventional Commits!)
+------------------+
       | (Pass)
       |--- 2. Tạo commit thành công!
       |
       |--- 3. git push
       v
+------------------+
| pre-push hook    | ===(Fail)====> HỦY PUSH (Unit tests local thất bại!)
+------------------+
       | (Pass)
       v
[ REMOTE SERVER (GitHub/GitLab) ]
       |
+------------------+
| pre-receive hook | ===(Fail)====> TỪ CHỐI NHẬN (Phát hiện rò rỉ AWS Key / Secret!)
+------------------+
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên Rằng `.git/hooks/` Không Được Đẩy Lên Remote
Thư mục `.git/hooks/` nằm trong `.git/`, là tài nguyên cục bộ của riêng từng máy trạm và **không bao giờ được clone hoặc push**.
- Nếu bạn tạo hook thủ công trong `.git/hooks/`, đồng đội của bạn sẽ không có hook đó!
- **Giải pháp chuẩn ngành**:
  1. Sử dụng công cụ quản lý hook như **Husky** (cho Node.js) lưu hook trong thư mục dự án `.husky/`.
  2. Hoặc cấu hình đường dẫn hooks dùng chung qua Git config:
     ```bash
     git config core.hooksPath .githooks
     ```

### Bẫy 2: Dùng Cờ `--no-verify` Để Lách Hook Bừa Bãi
Khi gặp lỗi linting hoặc unit test trong `pre-commit`, lập trình viên thiếu kỷ luật thường dùng:
```bash
git commit --no-verify -m "quick fix"  # hoặc -n
```
Lệnh này bỏ qua toàn bộ client-side hooks, dẫn tới việc đẩy mã lỗi hoặc code không đúng chuẩn format lên server và làm sập pipeline CI/CD.

### Bẫy 3: Trùng Lặp Code Khi Cherry-Pick Thay Vì Merge
Nếu bạn liên tục cherry-pick 10 commit từ nhánh `feature` sang `main`, sau đó lại chạy `git merge feature`:
- Git có thể sẽ báo xung đột hàng loạt vì cùng một đoạn code đã tồn tại dưới hai mã SHA-1 khác nhau ở cả hai nhánh!
- **Quy tắc**: Chỉ dùng cherry-pick cho các bản vá lỗi khẩn cấp (Hotfixes) hoặc các commit cứu hộ cá biệt.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [03-hooks-demo.js](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/03-hooks-demo.js).

Mẫu Hook `commit-msg` bắt buộc tuân thủ chuẩn Conventional Commits bằng Bash:
```bash
#!/usr/bin/env bash
# File: .git/hooks/commit-msg

commit_regex='^(feat|fix|docs|style|refactor|perf|test|build|ci|chore|revert)(\([a-z0-9_-]+\))?: .+'

if ! grep -iqE "$commit_regex" "$1"; then
    echo "❌ [LỖI COMMIT-MSG]: Định dạng thông điệp commit không hợp lệ!"
    echo "Chuẩn đúng: feat(scope): message hoặc fix: message"
    echo "Ví dụ: feat(auth): add google oauth2 login"
    exit 1
fi
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Làm thế nào để Cherry-Pick một chuỗi liên tiếp nhiều commit từ quá khứ?
**Đáp án chi tiết**:
Git hỗ trợ toán tử dải commit `..` và `...`:
```bash
# Nhặt các commit từ C2 đến C5 (Bỏ qua C1, bao gồm C2, C3, C4, C5):
git cherry-pick C1..C5

# Nhặt bao gồm cả commit bắt đầu C1:
git cherry-pick C1^..C5
```
Git sẽ tuần tự áp dụng từng commit một vào nhánh hiện tại theo đúng thứ tự thời gian.

### Câu 2: Sự khác biệt về vai trò giữa Client-side Hook (`pre-commit`) và Server-side Hook (`pre-receive`) là gì? Tại sao doanh nghiệp bắt buộc phải có Server-side Hook dù local đã có Husky?
**Đáp án chi tiết**:
- **Client-side Hook (`pre-commit`)**:
  - Chạy trên máy cá nhân của lập trình viên.
  - Mang tính chất phản hồi nhanh (Fast feedback), giúp developer sửa ngay lỗi chính tả, format code trước khi commit.
  - *Điểm yếu*: Lập trình viên có thể dễ dàng vô hiệu hóa bằng cờ `--no-verify`.
- **Server-side Hook (`pre-receive`)**:
  - Chạy tập trung trên máy chủ Git (GitHub Enterprise, GitLab Server).
  - Đóng vai trò là **ngưỡng bảo mật tối cao (Enforced Security Gate)**.
  - Không ai có thể bỏ qua được (kể cả có dùng `--no-verify` ở local). Server sẽ từ chối nhận toàn bộ lệnh push nếu phát hiện vi phạm bảo mật (như rò rỉ khóa RSA, vi phạm quy chuẩn chữ ký số, commit sai định dạng).
