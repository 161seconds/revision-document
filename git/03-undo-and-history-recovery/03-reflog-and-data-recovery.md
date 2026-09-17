# Nhật Ký Tham Chiếu (Git Reflog) & Cứu Hộ Dữ Liệu Khẩn Cấp (Data Recovery)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đối tượng Commit DAG và bản chất con trỏ `HEAD`).
  - [02-reset-soft-mixed-hard.md](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/02-reset-soft-mixed-hard.md) (Rủi ro mất commit khi chạy `git reset --hard`).
- **Khái niệm tương quan**:
  - **Dangling / Orphan Commits**: Các commit không còn bất kỳ nhánh (branch) hay thẻ (tag) nào trỏ tới, bị cô lập khỏi đồ thị DAG chính.
  - **Garbage Collection (`git gc`)**: Cơ chế dọn rác tự động của Git gom nén các đối tượng và xóa vĩnh viễn các dangling objects sau thời hạn quy định.
- **Điểm đến tiếp theo**:
  - [practice.js](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/practice.js) (Thử thách kiểm thử tự động Module 03).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Của Git Reflog (Reference Logs)
`git log` chỉ duyệt cây đồ thị DAG bắt đầu từ commit hiện tại ngược về quá khứ qua con trỏ cha (`parent`). Nếu một nhánh bị xóa hoặc bị reset lùi, `git log` sẽ **không bao giờ** nhìn thấy các commit bị cắt đứt đó nữa.
- **Git Reflog** là một hệ thống ghi nhật ký hoàn toàn độc lập:
  - Nằm trong thư mục `.git/logs/HEAD` và `.git/logs/refs/heads/<branch>`.
  - Ghi lại **mọi thao tác di chuyển con trỏ** mà bạn từng thực hiện trên máy tính: `commit`, `checkout`, `switch`, `merge`, `rebase`, `reset`, `cherry-pick`.
  - Reflog là **thuần túy cục bộ (Local-only)**. Nó không bao giờ được truyền tải qua mạng khi bạn `push` hay `clone`.

```
[ THAO TÁC CỦA BẠN ]                   [ NHẬT KÝ REFLOG (.git/logs/HEAD) ]
git commit -m "C2"          --->        HEAD@{0}: commit: C2
git reset --hard HEAD~1     --->        HEAD@{0}: reset: moving to HEAD~1
                                        HEAD@{1}: commit: C2  <=== COMMIT C2 VẪN Ở ĐÂY!
```

### 2.2. Vòng Đời Của Các Đối Tượng Mồ Côi (Dangling Objects Lifetime)
Khi một commit bị tách khỏi nhánh:
- Nó **chưa hề bị xóa ngay lập tức** khỏi `.git/objects/`.
- Cấu hình mặc định của Git bảo vệ dữ liệu trong một khoảng thời gian:
  - `gc.reflogExpire`: **90 ngày** cho các bản ghi tham chiếu còn khả dụng (reachable).
  - `gc.reflogExpireUnreachable`: **30 ngày** cho các commit mồ côi (unreachable).
- Miễn là trong vòng 30 ngày, bạn hoàn toàn có thể cứu lại 100% mã nguồn bằng Reflog!

---

## 3. Các Kịch Bản Cứu Hộ Dữ Liệu Khẩn Cấp (Rescue Recipes)

### Kịch Bản 1: Cứu Commit Sau Khi Lỡ `git reset --hard`
1. Mở nhật ký tham chiếu:
   ```bash
   git reflog
   # Output mẫu:
   # a1b2c3d HEAD@{0}: reset: moving to HEAD~3
   # 8e9f0a1 HEAD@{1}: commit: feat: crucial payment logic  <=== ĐÂY LÀ COMMIT CẦN CỨU
   ```
2. Hồi sinh nhánh mới từ vị trí đó:
   ```bash
   git switch -c rescue-payment-branch 8e9f0a1
   ```
   Toàn bộ mã nguồn và lịch sử của commit đã được phục hồi nguyên vẹn trên nhánh mới!

### Kịch Bản 2: Hồi Sinh Nhánh Bị Xóa Nhầm Bằng `git branch -D`
Khi bạn lỡ gõ `git branch -D feature/analytics`:
1. Chạy `git reflog`: Tìm dòng cuối cùng bạn tương tác trên nhánh đó, ví dụ: `commit: feat: analytics chart`.
2. Lấy mã SHA-1 của commit đỉnh (ví dụ: `4f5e6d7`).
3. Tái tạo lại nhánh ngay tại commit đó:
   ```bash
   git branch feature/analytics 4f5e6d7
   ```

### Kịch Bản 3: Cứu Lại Git Stash Bị `git stash drop` Hoặc `git stash clear`
Khi bạn drop một stash, terminal sẽ in ra một dòng thông báo ngắn:
```
Dropped refs/stash@{0} (7a8b9c0d1e2f...)
```
Nếu bạn muốn cứu lại nội dung của stash này:
```bash
git stash apply 7a8b9c0d1e2f
```

---

## 4. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Chạy Lệnh `git gc --prune=now` Khi Đang Muốn Cứu Dữ Liệu
Lệnh `git gc --prune=now` cưỡng chế Git dọn dẹp toàn bộ các commit mồ côi ngay lập tức mà không chờ thời hạn 30 ngày. Một khi lệnh này đã chạy xong, các commit chưa có nhánh trỏ tới sẽ bị xóa vĩnh viễn khỏi ổ cứng và không công cụ nào có thể phục hồi.

### Bẫy 2: Lầm Tưởng Đồng Đội Có Thể Cứu Bạn Qua Remote
Vì Reflog là nhật ký riêng trên máy cá nhân, đồng đội không thể nhìn thấy reflog của bạn. Nếu bạn xóa nhầm một commit cục bộ mà chưa từng push lên server, chỉ có duy nhất chiếc máy tính của bạn mới có thể cứu lại được commit đó qua `git reflog` cục bộ.

---

## 5. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [03-reflog-demo.js](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/03-reflog-demo.js).

Tóm tắt các lệnh cứu hộ khẩn cấp:
```bash
# Xem reflog của con trỏ HEAD
git reflog

# Xem reflog riêng của một nhánh cụ thể
git reflog show main

# Xem reflog định dạng theo ngày giờ thực tế
git log -g --abbrev-commit --pretty=oneline

# Quét toàn bộ kho lưu trữ tìm kiếm các đối tượng mồ côi
git fsck --lost-found
```

---

## 6. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Lệnh `git fsck --lost-found` hoạt động như thế nào khi bạn không nhớ mã commit trong `git reflog`?
**Đáp án chi tiết**:
- `git fsck` (File System Consistency Check) duyệt toàn bộ các file trong `.git/objects/` và kiểm tra tính toàn vẹn của đồ thị DAG.
- Khi thêm cờ `--lost-found`, Git sẽ tìm tất cả các commit và blob hợp lệ nhưng không được tham chiếu bởi bất kỳ branch/tag/reflog nào.
- Git tự động ghi lại các đối tượng này vào thư mục `.git/lost-found/commit/` và `.git/lost-found/other/`.
- Bạn có thể duyệt qua các commit trong thư mục đó bằng lệnh `git log <commit-hash>` hoặc `git show <commit-hash>` để tìm lại chính xác đoạn mã đã mất.

### Câu 2: Sự khác nhau về mặt bản chất giữa `git log` và `git reflog` là gì?
**Đáp án chi tiết**:
- `git log`: Thể hiện **lịch sử commit của dự án** dựa trên mối quan hệ cha con (`parent pointer`) trong đồ thị DAG. Lịch sử này mang tính vĩnh viễn, được đồng bộ qua remote và giống nhau trên mọi máy trạm.
- `git reflog`: Thể hiện **nhật ký hành động cục bộ của người dùng** trên máy tính cá nhân. Nó ghi lại mọi thao tác nhảy con trỏ `HEAD` theo dòng thời gian thực. Nhật ký này có hạn sử dụng (mặc định 30-90 ngày), mang tính riêng tư và không bao giờ được chia sẻ qua mạng.
