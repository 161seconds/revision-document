# Bỏ Qua Tập Tin (.gitignore) & Cấu Hình Thuộc Tính (.gitattributes)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đối tượng Blob và cơ chế theo dõi Index).
  - [02-basic-commands-and-staging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/02-basic-commands-and-staging.md) (Trạng thái Untracked vs Tracked).
- **Khái niệm tương quan**:
  - **Line Ending Normalization (CRLF vs LF)**: Xung đột ký tự kết thúc dòng giữa Windows (`\r\n`) và Linux/macOS (`\n`).
  - **Binary Diffing**: Nhận diện các tệp nhị phân (ảnh, file nén, database SQLite) để ngăn Git cố gắng tính toán diff văn bản.
- **Điểm đến tiếp theo**:
  - [practice.js](file:///d:/my-project/revision-document/git/01-basics-and-architecture/practice.js) (Thử thách tổng hợp Module 01).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Quy Tắc Của `.gitignore`
File `.gitignore` hướng dẫn Git **bỏ qua các file Untracked**, không hiển thị chúng trong `git status` và không đưa chúng vào Staging khi chạy `git add .`.
- **Cú pháp khớp mẫu (Globbing Pattern)**:
  - `node_modules/`: Khớp chính xác thư mục có tên `node_modules`.
  - `*.log`: Khớp mọi file có đuôi `.log`.
  - `temp/`: Bỏ qua toàn bộ nội dung bên trong thư mục `temp`.
  - `**/logs`: Khớp thư mục `logs` ở bất kỳ cấp độ nào.
  - `!important.log`: Phủ định quy tắc (giữ lại file `important.log` dù đã có `*.log`).

### 2.2. Bản Chất Của `.gitattributes`
File `.gitattributes` gắn các thuộc tính đặc biệt cho từng đường dẫn hoặc phần mở rộng tệp.
- **Giải quyết triệt để lỗi CRLF/LF xuyên hệ điều hành**:
  Khi lập trình viên dùng Windows commit file kết thúc bằng CRLF (`\r\n`), đồng đội dùng Mac/Linux pull về sẽ thấy Git báo toàn bộ file bị sửa đổi do sai lệch ký tự xuống dòng.
  ```gitattributes
  # Tự động chuẩn hóa: chuyển về LF khi lưu vào Git, chuyển về OS native khi checkout
  * text=auto

  # Bắt buộc luôn dùng LF (cho shell scripts, source code)
  *.sh text eol=lf
  *.js text eol=lf

  # Bắt buộc giữ nguyên CRLF (cho Windows batch script)
  *.bat text eol=crlf

  # Đánh dấu tệp nhị phân (không bao giờ merge text)
  *.png binary
  *.jpg binary
  ```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Thêm File Vào `.gitignore` Sau Khi Đã Lỡ Commit
Nếu một file đã được Git theo dõi (đã từng commit vào lịch sử), việc bạn thêm tên file đó vào `.gitignore` **hoàn toàn không có tác dụng**! Git sẽ tiếp tục theo dõi mọi thay đổi của file đó.
- **Cách khắc phục chuẩn**: Gỡ bỏ file khỏi Index nhưng vẫn giữ nguyên file trên đĩa cứng:
  ```bash
  git rm --cached <tên-file>
  # hoặc gỡ bỏ cả thư mục:
  git rm -r --cached build/
  git commit -m "chore: stop tracking ignored files"
  ```

### Bẫy 2: Bẫy Phủ Định Khi Thư Mục Cha Bị Ignore
```gitignore
logs/
!logs/important.log
```
- **LỖI NGHIÊM TRỌNG**: File `important.log` **vẫn bị bỏ qua**!
- **Nguyên nhân**: Theo đặc tả của Git, một khi Git đã bỏ qua một thư mục (`logs/`), Git sẽ **không quét (traversal)** vào bên trong thư mục đó nữa, vì vậy quy tắc phủ định `!logs/important.log` không bao giờ được chạm tới.
- **Cách khắc phục đúng**:
  ```gitignore
  logs/*
  !logs/important.log
  ```

### Bẫy 3: Không Biết File Bị Ignore Bởi Quy Tắc Nào
Trong dự án lớn với nhiều file `.gitignore` ở các thư mục con và global gitignore, bạn rất khó biết dòng nào đang chặn file của mình.
- **Lệnh cứu trợ**:
  ```bash
  git check-ignore -v path/to/file.log
  # Output: .gitignore:15:*.log    path/to/file.log (Chỉ rõ dòng 15 của .gitignore)
  ```

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [05-ignoring-demo.js](file:///d:/my-project/revision-document/git/01-basics-and-architecture/05-ignoring-demo.js).

Mẫu `.gitignore` chuẩn Enterprise cho dự án Fullstack:
```gitignore
# Dependencies
node_modules/
vendor/

# Environment Secrets
.env
.env.local
.env.*.local
*.pem
*.key

# Build outputs & caches
dist/
build/
.next/
.cache/
*.tsbuildinfo

# OS Junk
.DS_Store
Thumbs.db
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Làm thế nào để bỏ qua file trên máy cá nhân của riêng bạn mà KHÔNG làm thay đổi file `.gitignore` của dự án (tránh làm bẩn git diff của team)?
**Đáp án chi tiết**:
Có 2 cách chuyên nghiệp:
1. **Dùng `.git/info/exclude` (Phạm vi dự án hiện tại)**:
   - Sửa file `.git/info/exclude`. Cú pháp giống hệt `.gitignore` nhưng file này nằm trong thư mục nội bộ `.git/`, hoàn toàn không bị commit hay đẩy lên remote.
2. **Dùng Global Gitignore (Phạm vi toàn máy tính)**:
   - Tạo file `~/.gitignore_global` (chứa các file rác của OS và Editor như `.DS_Store`, `.idea/`, `.vscode/`).
   - Cấu hình qua lệnh:
     ```bash
     git config --global core.excludesFile ~/.gitignore_global
     ```

### Câu 2: Lệnh `git rm --cached file.txt` khác gì với `git rm file.txt`?
**Đáp án chi tiết**:
- `git rm file.txt`: Xóa file `file.txt` khỏi cả **Index (Staging)** và **Working Tree (xóa hẳn file trên đĩa cứng)**.
- `git rm --cached file.txt`: Chỉ xóa file khỏi **Index (ngừng theo dõi trong Git)**, nhưng **giữ nguyên vẹn file vật lý trên đĩa cứng**. Rất hữu ích khi bạn lỡ commit nhầm file `.env` hoặc cấu hình cá nhân và muốn giữ lại file đó để chạy local.
