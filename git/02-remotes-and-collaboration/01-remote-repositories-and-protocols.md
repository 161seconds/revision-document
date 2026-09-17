# Máy Chủ Từ Xa (Git Remote) & Giao Thức Xác Thực (SSH vs HTTPS)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Cấu trúc file `.git/config` và thư mục `.git/refs/remotes/`).
  - [01-basics-and-architecture/03-branching-and-merging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/03-branching-and-merging.md) (Cơ chế con trỏ nhánh).
- **Khái niệm tương quan**:
  - **Distributed Version Control System (DVCS)**: Git là hệ thống phi tập trung; mọi máy trạm local đều là một kho chứa đầy đủ (full repository) với trọn vẹn lịch sử commit.
  - **Asymmetric Cryptography (Mật mã bất đối xứng)**: Cặp khóa công khai/bí mật (Public/Private Key pair: Ed25519, RSA) trong giao thức SSH.
- **Điểm đến tiếp theo**:
  - [02-fetch-pull-push-and-tracking.md](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/02-fetch-pull-push-and-tracking.md) (Quy trình đồng bộ Fetch, Pull, Push và Tracking Branches).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Git Remote Thực Chất Là Gì?
Một `remote` trong Git chỉ đơn giản là một **biệt danh (alias)** đại diện cho một đường dẫn URL dẫn tới kho chứa khác (trên GitHub, GitLab, server nội bộ hoặc thậm chí là một thư mục khác trên máy tính).
- Mặc định, Git đặt tên remote đầu tiên là `origin`.
- Toàn bộ thông tin cấu hình remote được ghi trực tiếp vào file `.git/config`:

```ini
[remote "origin"]
    url = git@github.com:company/project.git
    fetch = +refs/heads/*:refs/remotes/origin/*
```

### 2.2. So Sánh Giao Thức Xác Thực: SSH vs HTTPS

| Tiêu chí | HTTPS (Hypertext Transfer Protocol Secure) | SSH (Secure Shell Protocol) |
| :--- | :--- | :--- |
| **Định dạng URL** | `https://github.com/user/repo.git` | `git@github.com:user/repo.git` |
| **Cơ chế xác thực** | Personal Access Token (PAT) hoặc OAuth | Cặp khóa công khai/bí mật (Public/Private Key) |
| **Mật khẩu tài khoản** | GitHub/GitLab **đã cấm hoàn toàn** mật khẩu thường từ 2021 | Không bao giờ gửi mật khẩu qua mạng |
| **Cổng mạng (Port)** | Port `443` (Ít khi bị tường lửa mạng công ty chặn) | Port `22` (Có thể bị proxy/firewall công ty giới hạn) |
| **Tiện lợi hàng ngày** | Phải cấu hình Credential Helper lưu token | Thiết lập 1 lần duy nhất, dùng vĩnh viễn không cần nhập lại token |

### 2.3. Quy Trình Thiết Lập Khóa SSH Chuẩn Enterprise (Ed25519)
Thuật toán `Ed25519` hiện là tiêu chuẩn vàng của ngành (nhẹ hơn, an toàn hơn và chống tấn công tốt hơn RSA):

```bash
# 1. Tạo cặp khóa SSH mới bằng thuật toán Ed25519
ssh-keygen -t ed25519 -C "your_email@company.com"

# 2. Khởi động SSH Agent ngầm định
eval "$(ssh-agent -s)"

# 3. Thêm khóa riêng tư vào SSH Agent
ssh-add ~/.ssh/id_ed25519

# 4. Sao chép khóa công khai (Public Key) để dán vào GitHub Settings -> SSH Keys
cat ~/.ssh/id_ed25519.pub

# 5. Kiểm tra kết nối xác thực với GitHub server
ssh -T git@github.com
# Hiển thị: Hi username! You've successfully authenticated...
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng Mật Khẩu Đăng Nhập Để Clone/Push Qua HTTPS
Nhiều lập trình viên mới vẫn nhập username và password của tài khoản GitHub/GitLab khi terminal yêu cầu qua HTTPS.
- Kết quả: `fatal: Authentication failed for ... (Support for password authentication was removed)`.
- **Khắc phục**: Phải tạo **Personal Access Token (PAT)** trong Developer Settings trên GitHub và dùng token đó làm password, hoặc chuyển sang dùng SSH.

### Bẫy 2: Lộ Khóa Bí Mật Private Key (`id_ed25519`)
Tuyệt đối chỉ copy và dán file có đuôi `.pub` (`id_ed25519.pub`) lên GitHub. Nếu lỡ tay commit hoặc gửi file khóa bí mật (`id_ed25519` không có `.pub`), toàn bộ quyền truy cập vào các server của bạn có thể bị tin tặc chiếm đoạt.

### Bẫy 3: Không Dọn Dẹp Nhánh Rác Bị Xóa Trên Remote (`git remote prune`)
Khi đồng đội xóa một nhánh trên GitHub sau khi merge PR, máy local của bạn vẫn giữ con trỏ tracking branch `origin/feature-xyz`.
- Để đồng bộ và xóa sạch các con trỏ trỏ tới nhánh không còn tồn tại trên server:
  ```bash
  git remote prune origin
  # hoặc tự động dọn rác mỗi khi fetch:
  git fetch --prune
  ```

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [01-remotes-demo.js](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/01-remotes-demo.js).

Tóm tắt các lệnh quản lý Remote hàng ngày:
```bash
# Liệt kê danh sách các remote hiện có kèm URL đọc và ghi
git remote -v

# Thêm một remote mới
git remote add origin git@github.com:org/app.git

# Đổi URL của remote (ví dụ chuyển từ HTTPS sang SSH)
git remote set-url origin git@github.com:org/app.git

# Đổi tên một remote (ví dụ đổi origin thành upstream)
git remote rename origin upstream

# Xóa bỏ một remote không còn dùng
git remote remove staging
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Sự khác biệt cơ bản giữa remote `origin` và remote `upstream` trong quy trình làm việc Open-Source (Fork Workflow) là gì?
**Đáp án chi tiết**:
- `origin`: Thường là remote trỏ về **kho lưu trữ cá nhân mà bạn đã Fork về** (ví dụ: `github.com/my-user/project`). Bạn có toàn quyền đọc và ghi (push) vào remote này.
- `upstream`: Là remote trỏ về **kho lưu trữ gốc của tổ chức/dự án chính** (ví dụ: `github.com/facebook/react`). Bạn thường chỉ có quyền đọc (fetch/pull) để đồng bộ những commit mới nhất của dự án vào máy local trước khi tạo Pull Request gửi về `upstream`.

### Câu 2: Lệnh `git remote prune origin` giải quyết vấn đề gì và tại sao nên bật `fetch.prune = true` trong cấu hình toàn cục?
**Đáp án chi tiết**:
- Khi một nhánh bị xóa trên Remote server (sau khi đóng PR), Git local mặc định không tự động xóa con trỏ nhánh từ xa tương ứng trong thư mục `.git/refs/remotes/origin/`. Lâu ngày, lệnh `git branch -a` sẽ chứa đầy các nhánh rác đã chết.
- `git remote prune origin` quét đối chiếu và xóa sạch các con trỏ nhánh rác này khỏi máy local.
- Bật cấu hình `git config --global fetch.prune true` giúp Git tự động dọn dẹp các nhánh đã chết mỗi lần bạn chạy `git fetch` hoặc `git pull`, đảm bảo danh sách branch luôn đồng bộ và gọn gàng.
