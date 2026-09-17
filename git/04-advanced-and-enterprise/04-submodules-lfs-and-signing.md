# Git Submodules, Quản Lý Tệp Lớn (Git LFS) & Ký Xác Thực (GPG/SSH Signing)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đối tượng Commit, Tree và Blob).
  - [01-basics-and-architecture/05-ignoring-and-attributes.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/05-ignoring-and-attributes.md) (Cấu hình thuộc tính `.gitattributes`).
- **Khái niệm tương quan**:
  - **Monorepo / Multi-Repo Architecture**: Quản lý các thư viện dùng chung xuyên suốt nhiều repository.
  - **Supply Chain Security**: Chống giả mạo danh tính tác giả (Author Spoofing) trong chuỗi cung ứng phần mềm doanh nghiệp thông qua chữ ký số mã hóa.
- **Điểm đến tiếp theo**:
  - [practice.js](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/practice.js) (Thử thách kiểm thử tự động Module 04).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Của Git Submodules
Git Submodule cho phép bạn nhúng một Git repository độc lập vào bên trong một thư mục của repository khác (thường dùng cho shared libraries, UI component libraries, C++ dependencies):
- **Cơ chế lưu trữ**: Repo cha **không hề theo dõi nội dung** các file bên trong submodule.
- Thay vào đó, repo cha chỉ lưu **duy nhất một con trỏ SHA-1** trỏ vào commit cụ thể của repo con, kèm theo file cấu hình `.gitmodules`:

```ini
[submodule "libs/shared-utils"]
    path = libs/shared-utils
    url = https://github.com/company/shared-utils.git
```

#### Quy Trình Đồng Bộ Submodule Khi Clone:
Khi bạn `git clone` một dự án có chứa submodule, mặc định thư mục submodule sẽ **trống rỗng**. Bạn phải kích hoạt:
```bash
# Cách 1: Tự động khởi tạo ngay khi clone
git clone --recurse-submodules https://github.com/company/main-app.git

# Cách 2: Khởi tạo trên repo đã clone sẵn
git submodule update --init --recursive
```

---

### 2.2. Git Large File Storage (Git LFS)
Mặc định, khi bạn thêm một file video 500MB vào Git và sửa đổi nó 4 lần, dung lượng `.git/objects` sẽ tăng thêm 2GB (do Git lưu toàn bộ snapshot). Lâu dần, `git clone` sẽ mất hàng tiếng đồng hồ.
- **Giải pháp Git LFS**:
  - Thay thế file 500MB bằng một **con trỏ văn bản nhỏ xíu (Text Pointer ~130 bytes)** trong `.git/objects`.
  - File 500MB thực tế được tải lên một Server lưu trữ đám mây riêng biệt (LFS Store).
  - Khi clone/checkout, Git LFS client sẽ tự động tải file thực tế về thay thế cho file con trỏ.

```
Nội dung file con trỏ LFS lưu trong Git:
version https://git-lfs.github.com/spec/v1
oid sha256:4cac19ec8ef4f53580f4f9f... (Mã băm SHA-256 của file)
size 524288000                        (Kích thước byte thật)
```

Cấu hình theo dõi tệp lớn qua `.gitattributes`:
```bash
git lfs install
git lfs track "*.psd" "*.mp4" "*.onnx"
git add .gitattributes
```

---

### 2.3. Ký Xác Thực Commit Bằng Chữ Ký Số (GPG / SSH Signing)
Bất kỳ ai cũng có thể giả mạo tên và email của người khác trong Git bằng lệnh:
```bash
git commit --author="Linus Torvalds <torvalds@linux-foundation.org>"
```
Để chứng minh bạn chính là chủ sở hữu thực sự của commit, các tập đoàn lớn và dự án nguồn mở bắt buộc phải **ký chữ ký số mật mã học**:
- **Cơ chế**: Dùng khóa bí mật (Private Key) để ký lên nội dung commit.
- Khi đẩy lên GitHub/GitLab, máy chủ dùng Public Key đã đăng ký để kiểm tra và gắn nhãn **"Verified"** màu xanh lục.
- Từ Git 2.34+, bạn có thể dùng ngay **khóa SSH cá nhân** để ký thay vì cài đặt GPG phức tạp:
  ```bash
  # Cấu hình dùng SSH để ký commit
  git config --global gpg.format ssh
  git config --global user.signingkey ~/.ssh/id_ed25519.pub
  git config --global commit.gpgsign true
  ```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên Đẩy Commit Ở Submodule Trước Khi Đẩy Repo Cha
Nếu bạn vào thư mục submodule, tạo commit mới C2, sau đó ra repo cha commit việc cập nhật SHA-1 lên C2 và `git push`:
- **THẢM HỌA**: Bạn quên chưa `git push` ở bên trong submodule!
- Khi đồng nghiệp pull repo cha về, máy của họ sẽ trỏ tới commit C2 nhưng server của submodule chưa hề có commit này, dẫn tới lỗi: `fatal: reference is not a tree`.
- **Phòng vệ**: Cấu hình Git kiểm tra submodule trước khi push:
  ```bash
  git config --global push.recurseSubmodules check
  ```

### Bẫy 2: Git LFS Không Hoạt Động Do Thiếu Lệnh `git lfs install`
Nếu lập trình viên mới clone một repo dùng LFS nhưng trên máy chưa cài Git LFS hoặc chưa chạy `git lfs install`:
- Các file ảnh hoặc mô hình nặng chỉ xuất hiện dưới dạng các file văn bản 130 bytes chứa `version https://...`.
- Ứng dụng sẽ bị sập vì không đọc được file nhị phân thực tế.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [04-submodules-demo.js](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/04-submodules-demo.js).

Tóm tắt các lệnh quản lý Submodules & LFS:
```bash
# Thêm một submodule mới vào thư mục vendor/logger
git submodule add https://github.com/org/logger.git vendor/logger

# Cập nhật submodule lên commit mới nhất của nhánh remote
git submodule update --remote --merge

# Kiểm tra chữ ký số của commit đỉnh
git verify-commit HEAD

# Xem log hiển thị chữ ký xác thực
git log --show-signature -n 1
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Làm thế nào để loại bỏ hoàn toàn một Submodule khỏi Git repository mà không để lại rác cấu hình?
**Đáp án chi tiết**:
Quy trình 3 bước chuẩn xác:
1. Gỡ bỏ submodule khỏi Index và Working Tree:
   ```bash
   git rm -f path/to/submodule
   ```
2. Xóa sạch thư mục cấu hình nội bộ của submodule nằm trong `.git`:
   ```bash
   rm -rf .git/modules/path/to/submodule
   ```
3. Commit sự thay đổi (Git sẽ tự động cập nhật file `.gitmodules` và gỡ bỏ con trỏ):
   ```bash
   git commit -m "chore: remove submodule path/to/submodule"
   ```

### Câu 2: Tại sao các công ty Fintech và Enterprise bắt buộc phải kích hoạt tính năng "Require signed commits" trên Protected Branches?
**Đáp án chi tiết**:
- Trong các cuộc tấn công chuỗi cung ứng phần mềm (Software Supply Chain Attacks), tin tặc có thể xâm nhập tài khoản hoặc mạo danh email của các kỹ sư trưởng để chèn mã độc vào codebase.
- Kích hoạt quy tắc bắt buộc chữ ký số (Signed Commits) đảm bảo:
  1. **Tính xác thực (Authenticity)**: 100% commit được ký bởi khóa phần cứng (YubiKey/SSH/GPG) của chính kỹ sư đó.
  2. **Tính toàn vẹn (Integrity)**: Mã nguồn không hề bị chỉnh sửa hay can thiệp trên đường truyền (bất kỳ thay đổi nào vào nội dung commit sẽ làm hỏng chữ ký số ngay lập tức).
  3. **Tính chống chối bỏ (Non-repudiation)**: Tác giả không thể phủ nhận commit do chính khóa cá nhân của mình tạo ra.
