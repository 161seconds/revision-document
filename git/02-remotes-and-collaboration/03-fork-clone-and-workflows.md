# Quy Trình Fork, Clone & Các Mô Hình Phối Hợp Dự Án (Git Workflows)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-remote-repositories-and-protocols.md](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/01-remote-repositories-and-protocols.md) (Khái niệm Remote `origin` và `upstream`).
  - [02-fetch-pull-push-and-tracking.md](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/02-fetch-pull-push-and-tracking.md) (Quy trình Pull Rebase và Push Upstream).
- **Khái niệm tương quan**:
  - **Pull Request (PR) / Merge Request (MR)**: Cơ chế kiểm duyệt code (Code Review), chạy kiểm thử tự động (CI/CD) và thảo luận trước khi tích hợp vào nhánh chính.
  - **Monorepo vs Polyrepo**: Quản lý nhiều dự án trong một repo lớn (Monorepo) đòi hỏi kỹ thuật Clone chọn lọc (Sparse Checkout).
- **Điểm đến tiếp theo**:
  - [practice.js](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/practice.js) (Thử thách kiểm thử tự động Module 02).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Kỹ Thuật Sao Chép Kho Mã Nguồn (`git clone`)

```bash
# 1. Clone đầy đủ (Full Clone): Tải toàn bộ mọi commit, branch và tag từ ngày đầu thành lập
git clone https://github.com/torvalds/linux.git

# 2. Shallow Clone (--depth 1): Tối ưu hóa siêu tốc cho CI/CD
# Chỉ tải đúng 1 commit mới nhất, bỏ qua hàng chục GB lịch sử cũ
git clone --depth 1 https://github.com/torvalds/linux.git

# 3. Bare Clone (--bare): Tạo kho chứa không có Working Tree (Dùng làm backup hoặc mirror server)
git clone --bare https://github.com/org/app.git app.git

# 4. Sparse Checkout: Chỉ tải về 1 thư mục con chỉ định trong dự án Monorepo khổng lồ
git clone --filter=blob:none --no-checkout https://github.com/org/monorepo.git
cd monorepo
git sparse-checkout set packages/frontend-app
git checkout main
```

### 2.2. Mô Hình Fork & Upstream Trong Dự Án Mã Nguồn Mở

```
     [ Kho lưu trữ gốc của Tổ Chức / Core Team ] (upstream)
                           |
                     (Fork trên Web)
                           v
     [ Kho lưu trữ trên tài khoản của Bạn ] (origin)
                           |
                      (git clone)
                           v
     [ Máy tính làm việc của Bạn ] (Local Client)
       - origin   : git@github.com:my-account/repo.git
       - upstream : git@github.com:core-org/repo.git
```

**Quy trình đóng góp (Contribution Pipeline)**:
1. `git fetch upstream`: Lấy commit mới nhất từ tổ chức.
2. `git rebase upstream/main`: Cập nhật nhánh của bạn đuổi kịp tiến độ gốc.
3. `git push origin feature/my-fix`: Đẩy code lên repo cá nhân của bạn.
4. Mở **Pull Request** từ `my-account:feature/my-fix` gửi về `core-org:main`.

### 2.3. Ma Trận So Sánh Các Mô Hình Quy Trình Git (Git Workflows)

| Tiêu chí | GitHub Flow | Git Flow | Trunk-Based Development |
| :--- | :--- | :--- | :--- |
| **Nhánh chính** | Duy nhất `main` | `main` (Production) + `develop` | Duy nhất `main` / `trunk` |
| **Nhánh hỗ trợ** | Các nhánh tính năng ngắn hạn | `feature/*`, `release/*`, `hotfix/*` | Nhánh cực ngắn (< 1 ngày) hoặc commit thẳng |
| **Chiến lược Deploy** | Deploy liên tục (CD) mỗi khi PR merge | Deploy theo đợt phát hành định kỳ (Releases) | Deploy liên tục nhiều lần mỗi ngày kết hợp Feature Flags |
| **Độ phức tạp** | Rất thấp, trực quan | Rất cao, dễ gặp merge hell khi gộp nhánh | Trung bình, đòi hỏi văn hóa Test tự động cực mạnh |
| **Phù hợp nhất** | Ứng dụng Web, SaaS, Microservices | Ứng dụng Mobile, Game, Phần mềm đóng gói bán license | Các công ty công nghệ lớn (Google, Meta, Netflix) |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên Đồng Bộ Nhánh Cũ Trước Khi Mở PR (Stale PR)
Bạn tạo nhánh `feature` từ 2 tuần trước. Trong 2 tuần đó, `main` đã có 50 commit mới từ các đồng nghiệp khác. Nếu bạn mở PR mà không rebase với `upstream/main`:
- PR sẽ bị cảnh báo xung đột (Conflicts) hoặc ghi đè ngầm logic của đồng đội.
- **Quy tắc vàng**: Luôn rebase với nhánh đích mới nhất trước khi gạt cờ Ready for Review trên PR.

### Bẫy 2: Một PR Ôm Đồm Quá Nhiều Tính Năng (Mega-PR / Giant Diffs)
Một PR sửa đổi 50 files và 2,000 dòng code sẽ:
- Khiến đồng nghiệp ngần ngại review (hoặc review sơ sài dẫn đến lọt bug).
- Bế tắc hoàn toàn nếu có 1 chức năng nhỏ trong đó bị từ chối.
- **Tiêu chuẩn công nghiệp**: Giữ PR dưới 300 dòng diff. Chia nhỏ các tính năng lớn thành nhiều PR nhỏ độc lập (Stacked PRs).

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [03-workflows-demo.js](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/03-workflows-demo.js).

Tóm tắt các lệnh đồng bộ Fork chuẩn:
```bash
# Thêm remote upstream trỏ về nguồn gốc
git remote add upstream git@github.com:facebook/react.git

# Kiểm tra 2 luồng remote
git remote -v
# origin   git@github.com:my-user/react.git (fetch & push)
# upstream git@github.com:facebook/react.git (fetch & push)

# Kéo dữ liệu mới nhất từ tổ chức gốc
git fetch upstream

# Cập nhật nhánh main cá nhân thẳng hàng với tổ chức
git switch main
git merge --ff-only upstream/main

# Đẩy cập nhật lên repo cá nhân trên GitHub
git push origin main
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: So sánh 3 chiến lược Merge khi đóng Pull Request trên GitHub: Create a merge commit, Squash and merge, và Rebase and merge?
**Đáp án chi tiết**:
1. **Create a merge commit**:
   - Giữ nguyên từng commit nhỏ trong nhánh tính năng và tạo thêm 1 commit merge nối vào `main`.
   - *Ưu điểm*: Bảo tồn 100% lịch sử chi tiết.
   - *Nhược điểm*: Làm bẩn cây lịch sử nếu nhánh có các commit vụn vặt như *"fix typo"*, *"wip"*.
2. **Squash and merge (Rất phổ biến)**:
   - Gom toàn bộ 20 commit trong nhánh tính năng thành **đúng 1 commit duy nhất** trên `main`.
   - *Ưu điểm*: Cực kỳ sạch sẽ, mỗi commit trên `main` tương ứng với 1 tính năng hoặc 1 bugfix hoàn chỉnh.
   - *Nhược điểm*: Mất đi dòng thời gian chi tiết ban đầu của từng bước code.
3. **Rebase and merge**:
   - Đặt các commit của PR nối tiếp tuyến tính lên đỉnh `main` mà không tạo merge commit.
   - *Ưu điểm*: Lịch sử dạng đường thẳng hoàn hảo.

### Câu 2: Shallow Clone (`git clone --depth 1`) tiết kiệm băng thông như thế nào và cạm bẫy lớn nhất của nó là gì?
**Đáp án chi tiết**:
- `git clone --depth 1` chỉ tải về snapshot của commit ở đỉnh nhánh mà không tải toàn bộ cây đồ thị DAG từ quá khứ. Với các repository lớn như Linux Kernel hay Chromium, điều này giảm thời gian clone từ 1 tiếng xuống còn 10 giây.
- **Cạm bẫy**:
  - Không thể thực hiện `git log` để tra cứu lịch sử quá khứ.
  - Không thể chạy `git blame` sâu vào các dòng code cũ.
  - Có thể thất bại khi cố gắng merge hoặc rebase nếu commit cơ sở (Common Ancestor) nằm ngoài phạm vi depth đã clone.
  - Muốn chuyển thành repo đầy đủ phải chạy: `git fetch --unshallow`.
