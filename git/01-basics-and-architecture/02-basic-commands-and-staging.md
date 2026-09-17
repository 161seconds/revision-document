# Lệnh Cơ Bản, Cấu Hình & Vùng Chuẩn Bị (Staging & Commits)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Kiến trúc 3 cây: Working Tree, Index, HEAD).
- **Khái niệm tương quan**:
  - **Commit Hygiene / Conventional Commits**: Quy chuẩn đặt tên commit (`feat:`, `fix:`, `docs:`, `chore:`) phục vụ tạo changelog tự động và Semantic Versioning.
  - **Atomic Commits**: Mỗi commit chỉ giải quyết đúng một nhiệm vụ duy nhất (Unit of work), có thể build và pass test độc lập.
- **Điểm đến tiếp theo**:
  - [03-branching-and-merging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/03-branching-and-merging.md) (Cơ chế phân nhánh, con trỏ nhánh và hợp nhất).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Cấu Hình Git (Git Configuration Hierarchy)
Git đọc cấu hình theo thứ tự từ phạm vi rộng đến hẹp (phạm vi sau sẽ ghi đè phạm vi trước):
1. **System (`--system`)**: Áp dụng cho toàn bộ người dùng trên hệ thống OS (`/etc/gitconfig` trên Linux, `C:\Program Files\Git\etc\gitconfig` trên Windows).
2. **Global (`--global`)**: Áp dụng cho tài khoản người dùng hiện tại (`~/.gitconfig` hoặc `C:\Users\<user>\.gitconfig`).
3. **Local (`--local` - mặc định)**: Chỉ áp dụng riêng cho repository hiện tại (`.git/config`).

```bash
# Thiết lập thông tin định danh tác giả (Bắt buộc)
git config --global user.name "Nguyen Van A"
git config --global user.email "vana@example.com"

# Thiết lập tên nhánh mặc định khi init (Khuyến nghị chuẩn hiện đại)
git config --global init.defaultBranch main

# Kiểm tra toàn bộ cấu hình kèm nguồn gốc file
git config --list --show-origin
```

### 2.2. Vòng Đời Trạng Thái Của Tập Tin (File Status Lifecycle)

```
                       [ UNTRACKED ] (File mới tạo chưa đưa vào Git)
                             |
                      git add <file>
                             v
+-------------------->[ STAGED ]<--------------------+
| (Đã tính hash & đưa vào .git/index)                |
|                            |                       |
|                       git commit                   |
|                            v                       |
|                     [ UNMODIFIED ]                 |
|                   (Đồng bộ với HEAD)               |
|                            |                       |
|                      Chỉnh sửa file                |
|                            v                       |
+---------------------[ MODIFIED ]-------------------+
                    (Khác biệt với Index)
```

### 2.3. Giải Mã Các Lệnh Kiểm Tra Sự Khác Biệt (`git diff`)
- `git diff`: So sánh sự khác nhau giữa **Working Tree** và **Index (Staging)** (Những gì bạn đã sửa nhưng chưa `git add`).
- `git diff --staged` (hoặc `git diff --cached`): So sánh giữa **Index (Staging)** và **HEAD** (Những gì bạn chuẩn bị commit vào lịch sử).
- `git diff HEAD`: So sánh toàn bộ sự thay đổi ở **Working Tree** đối chiếu với **HEAD** (Bao gồm cả staged và unstaged).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên Rằng `git add` Là Chụp Ảnh (Snapshot), Không Phải Đánh Dấu Tham Chiếu
```bash
echo "Phiên bản 1" > app.js
git add app.js                 # Staging lưu Snapshot "Phiên bản 1"
echo "Phiên bản 2" >> app.js   # Sửa tiếp trên Working Tree
git commit -m "update app"     # LƯU Ý: Commit chỉ ghi nhận "Phiên bản 1"!
```
- Khi gọi `git add`, Git lập tức tính toán SHA-1 và tạo một `blob` trong `.git/objects/`. Nếu bạn sửa tiếp sau đó, những thay đổi mới nằm ở Working Tree và chưa hề vào Staging.
- Muốn commit cả "Phiên bản 2", bạn phải `git add app.js` một lần nữa trước khi commit.

### Bẫy 2: Dùng `git add .` Bừa Bãi Dẫn Tới Rò Rỉ Bí Mật (Leaked Secrets)
Lệnh `git add .` đưa toàn bộ các file mới và thay đổi vào Staging mà không kiểm soát, rất dễ vô tình đưa file `.env`, file cấu hình chứa API keys, database passwords hoặc thư mục rác `node_modules` vào lịch sử Git.
- **Giải pháp**: Luôn kiểm tra `git status` trước, thiết lập `.gitignore` cẩn thận, hoặc dùng lệnh staging chọn lọc từng phần: `git add -p` (Interactive Patch Staging).

### Bẫy 3: Viết Thông Điệp Commit Vô Nghĩa
Các commit như `fixed bug`, `update`, `wip`, `test` phá hủy hoàn toàn khả năng truy vết lỗi (debugging qua `git bisect`) của đồng đội và hệ thống CI/CD.
- **Quy chuẩn**: Áp dụng Conventional Commits: `<type>(<scope>): <subject>` (ví dụ: `feat(auth): add jwt refresh token rotation`).

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [02-staging-demo.js](file:///d:/my-project/revision-document/git/01-basics-and-architecture/02-staging-demo.js).

Tóm tắt các lệnh hữu ích hàng ngày:
```bash
# Xem trạng thái ngắn gọn kèm mã ký tự (M: modified, A: added, ??: untracked)
git status -s

# Xem lịch sử dạng đồ thị rút gọn một dòng
git log --oneline --graph --decorate --all

# Xem thống kê số dòng thay đổi trên mỗi file của commit
git log --stat -n 3

# Xem chi tiết ai sửa dòng nào trong file (Annotation)
git blame -L 10,25 server.js
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Lệnh `git add -A`, `git add .`, và `git add -u` khác nhau như thế nào?
**Đáp án chi tiết**:
- `git add -u` (`--update`): Chỉ thêm các file **đã được theo dõi (Tracked files)** bị sửa đổi hoặc bị xóa. Hoàn toàn bỏ qua các file mới (Untracked files).
- `git add .`: Thêm tất cả file (mới, sửa đổi, xóa) bắt đầu từ thư mục hiện tại trở xuống các thư mục con.
- `git add -A` (`--all`): Thêm tất cả file (mới, sửa đổi, xóa) trên **toàn bộ repository** bất kể bạn đang đứng ở thư mục con nào.

### Câu 2: Làm thế nào để loại bỏ một file ra khỏi Staging Area mà không làm mất những gì bạn đã chỉnh sửa trong Working Tree?
**Đáp án chi tiết**:
- **Cách hiện đại (khuyến nghị từ Git 2.23+)**:
  ```bash
  git restore --staged <tên-file>
  ```
- **Cách truyền thống**:
  ```bash
  git reset HEAD <tên-file>
  ```
- Cả hai lệnh trên đều giữ nguyên nội dung chỉnh sửa của bạn trong Working Tree, chỉ hủy trạng thái chuẩn bị commit trong Index (chuyển file từ trạng thái Staged về Modified).
