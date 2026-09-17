# Sửa Đổi (Git Amend) & Hoàn Tác An Toàn (Git Revert)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đối tượng Commit DAG bất biến).
  - [02-remotes-and-collaboration/02-fetch-pull-push-and-tracking.md](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/02-fetch-pull-push-and-tracking.md) (Quy tắc an toàn trên nhánh dùng chung).
- **Khái niệm tương quan**:
  - **Immutability of Commits**: Một commit khi đã sinh ra thì mã hash SHA-1 của nó là vĩnh viễn không thể thay đổi. Lệnh `amend` thực chất là tạo ra một commit hoàn toàn mới và thay thế con trỏ.
  - **Forward-Only History (Lịch sử chỉ tiến về phía trước)**: Quy chuẩn hoàn tác mã nguồn trên nhánh công khai (Public/Shared Branch) không bao giờ xóa lịch sử cũ mà chỉ tạo commit nghịch đảo.
- **Điểm đến tiếp theo**:
  - [02-reset-soft-mixed-hard.md](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/02-reset-soft-mixed-hard.md) (Bản chất 3 cờ của toán tử Reset và so sánh với Modern Restore).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Của `git commit --amend`
Lệnh `git commit --amend` cho phép bạn sửa đổi commit mới nhất (đỉnh `HEAD`):
- Sửa lại nội dung thông điệp commit (commit message).
- Bổ sung thêm các file bạn lỡ quên chưa `git add`.
- **Bản chất dưới V8 của Git**:
  - Git **không hề sửa trực tiếp** vào commit cũ (vì commit là đối tượng bất biến).
  - Git tạo ra một **Commit Object mới hoàn toàn** với mã SHA-1 mới, trỏ vào cùng commit cha (parent) với commit cũ, và di chuyển con trỏ nhánh hiện tại trỏ vào commit mới này.
  - Commit cũ trở thành commit mồ côi (dangling commit) và chỉ còn được nhìn thấy qua `git reflog`.

```
Trước amend:
  (C1) ---> (C2: HEAD)

Sau git commit --amend:
  (C1) ---> (C2) [Mồ côi, chờ dọn rác gc]
    \
     +----> (C3: HEAD [Commit mới thay thế])
```

> [!CAUTION]
> **Quy tắc vàng**: Tuyệt đối **KHÔNG BAO GIỜ** amend một commit đã được đẩy (push) lên Remote server dùng chung! Nếu amend, mã hash của bạn sẽ lệch với server, gây xung đột nghiêm trọng cho toàn bộ đồng đội.

### 2.2. Bản Chất Của `git revert` (Hoàn Tác An Toàn Nhất)
Khác với `git reset` (xóa lùi commit khỏi dòng thời gian), `git revert` là cơ chế **hoàn tác tiến về phía trước (Forward Undo)**.
- **Hành vi**: Git tính toán hiệu số ngược lại (Inverse Diff) của commit bạn muốn hủy, và tự động tạo ra một **Commit MỚI** để đảo ngược chính xác những thay đổi đó.
- Lịch sử commit hoàn toàn nguyên vẹn, không có bất kỳ commit cũ nào bị sửa đổi hay xóa bỏ.
- Đây là giải pháp tiêu chuẩn và an toàn tuyệt đối 100% để sửa sai trên các nhánh công khai (`main`, `develop`, `production`).

```
Lịch sử ban đầu:
  (C1) ---> (C2: Thêm tính năng lỗi) ---> (C3: Commit khác)

Sau git revert C2:
  (C1) ---> (C2) ---> (C3) ---> (C4: Revert "Thêm tính năng lỗi")
```
*(Tại commit C4, toàn bộ code do C2 sinh ra đều bị gỡ bỏ, nhưng C2 vẫn lưu lại trong lịch sử để phục vụ điều tra nguyên nhân sự cố).*

### 2.3. Hoàn Tác Merge Commit (`git revert -m 1`)
Khi revert một commit thông thường, Git biết commit cha là ai. Nhưng một **Merge Commit** có tới 2 commit cha (`parent 1` và `parent 2`). Git không biết bạn muốn giữ lại trạng thái của nhánh nào nếu không có tham số `-m`:
- `git revert -m 1 <merge-commit-hash>`:
  - `-m 1`: Giữ lại lịch sử của nhánh chính (Parent 1: nhánh nhận merge, ví dụ `main`).
  - Toàn bộ code được gộp từ nhánh tính năng (Parent 2) sẽ bị đảo ngược.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Bẫy Re-merge Sau Khi Đã Revert Merge Commit
Đây là một trong những bẫy hóc búa nhất của Git (Linus Torvalds từng có bài viết giải thích nổi tiếng):
- Bạn merge `feature` vào `main`. Phát hiện bug, bạn chạy `git revert -m 1 <merge-hash>`.
- Bạn quay lại nhánh `feature`, fix xong bug và merge lại vào `main`.
- **KẾT QUẢ BẤT NGỜ**: Toàn bộ code ban đầu của nhánh `feature` **hoàn toàn biến mất**, chỉ còn lại dòng code bạn vừa fix!
- **Nguyên nhân**: Trong đồ thị DAG của Git, các commit ban đầu của `feature` đã nằm trong lịch sử của `main` rồi, và commit revert đã triệt tiêu chúng. Git coi rằng bạn cố tình bỏ những file đó.
- **Cách xử lý đúng**: Bạn phải **revert lại chính commit revert** trước khi merge lại:
  ```bash
  git revert <commit-revert-hash>  # Hồi sinh lại code của feature ban đầu
  git merge feature                # Sau đó mới merge code mới
  ```

### Bẫy 2: Revert Nhiều Commit Nhưng Để Rác Lịch Sử
Nếu bạn muốn hủy liên tiếp 4 commit gần nhất mà không muốn tạo ra 4 commit revert rác:
- Dùng cờ `-n` (`--no-commit`):
  ```bash
  git revert -n HEAD~3..HEAD
  git commit -m "revert: rollback bad release v2.0"
  ```
  Git sẽ đưa toàn bộ các thay đổi đảo ngược vào Staging Area để bạn gộp thành đúng 1 commit revert duy nhất.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [01-revert-demo.js](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/01-revert-demo.js).

Tóm tắt các lệnh hoàn tác cốt lõi:
```bash
# Sửa commit gần nhất mà không đổi commit message
git add forgotten-file.js
git commit --amend --no-edit

# Đổi lại thông điệp của commit gần nhất
git commit --amend -m "feat(core): proper commit title"

# Hoàn tác an toàn commit gần nhất
git revert HEAD

# Hoàn tác commit chỉ định mà không tự động commit (để review trước)
git revert -n <commit-hash>

# Hoàn tác một Merge Commit quay về trạng thái nhánh chính
git revert -m 1 <merge-commit-hash>
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao `git revert` được coi là an toàn tuyệt đối cho nhánh dùng chung (Shared Branch), trong khi `git reset` lại là đại kỵ?
**Đáp án chi tiết**:
- `git reset` trực tiếp cắt ngắn lịch sử commit bằng cách kéo giật lùi con trỏ nhánh về quá khứ. Nếu nhánh này đã được các đồng nghiệp khác pull về, lịch sử local của họ sẽ chứa các commit mà bạn đã xóa. Khi họ push lên lại, các commit đó sẽ tái xuất hiện, hoặc nếu bạn dùng `push --force` thì bạn sẽ phá hủy môi trường làm việc của đồng đội.
- `git revert` không hề xóa bất kỳ commit nào. Nó tạo một commit mới ở đỉnh nhánh mang nội dung đảo ngược. Khi bạn push commit này lên server, tất cả đồng đội chỉ việc chạy `git pull` bình thường (Fast-forward) mà không gặp bất kỳ xung đột lịch sử nào.

### Câu 2: Làm thế nào để sửa thông điệp của một commit nằm sâu trong lịch sử (cách đây 4 commit)?
**Đáp án chi tiết**:
- Lệnh `git commit --amend` chỉ có thể tác động lên commit mới nhất ở đỉnh (`HEAD`).
- Để sửa một commit nằm sâu ở quá khứ, bạn phải sử dụng **Interactive Rebase**:
  1. Chạy `git rebase -i HEAD~5`
  2. Trong trình soạn thảo mở ra, tìm dòng chứa commit cần sửa và đổi chữ `pick` thành `reword` (hoặc `r`).
  3. Lưu và đóng file. Git sẽ dừng lại tại commit đó và mở cửa sổ cho bạn nhập lại thông điệp mới.
  4. Sau khi nhập xong, Git sẽ tự động tính toán lại mã băm của commit đó và tất cả các commit nối tiếp phía sau.
