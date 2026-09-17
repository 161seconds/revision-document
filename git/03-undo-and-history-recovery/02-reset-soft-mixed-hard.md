# Bản Chất Toán Tử Reset (--soft, --mixed, --hard) & Lệnh Restore Hiện Đại

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Kiến trúc 3 cây: Working Tree, Index, Repository/HEAD).
  - [01-amend-and-revert.md](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/01-amend-and-revert.md) (So sánh hoàn tác Forward `revert` vs Hoàn tác Rewind `reset`).
- **Khái niệm tương quan**:
  - **Commit Squashing**: Gom nhiều commit nhỏ thành một commit duy nhất thông qua `git reset --soft`.
  - **Data Destruction Risk**: Mức độ nguy hiểm của các lệnh ghi đè Working Tree khi các file chưa từng được commit.
- **Điểm đến tiếp theo**:
  - [03-reflog-and-data-recovery.md](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/03-reflog-and-data-recovery.md) (Cứu hộ dữ liệu bị mất sau reset --hard qua Git Reflog).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất 3 Bước Thực Thi Của `git reset`
Toán tử `git reset <commit>` vận hành theo cơ chế 3 bậc thang tương ứng với Kiến trúc 3 Cây:

```
[ LỆNH RESET ]
     |
     v
[ BƯỚC 1 ]: Di chuyển HEAD & con trỏ nhánh hiện tại về <commit> chỉ định.
            ---> Nếu dùng cờ --soft: DỪNG LẠI TẠI ĐÂY!
     |
     v
[ BƯỚC 2 ]: Cập nhật Index (Staging Area) sao chép khớp với HEAD mới.
            ---> Nếu dùng cờ --mixed (mặc định): DỪNG LẠI TẠI ĐÂY!
     |
     v
[ BƯỚC 3 ]: Ghi đè Working Tree sao chép khớp với Index và HEAD mới.
            ---> Chỉ chạy khi dùng cờ --hard!
```

### 2.2. Ma Trận So Sánh 3 Cờ Reset Cốt Lõi

| Cờ lệnh (Flag) | HEAD di chuyển? | Index (Staging) bị đổi? | Working Tree bị ghi đè? | Mức độ an toàn | Mục đích sử dụng điển hình |
| :--- | :---: | :---: | :---: | :--- | :--- |
| **`--soft`** | **CÓ** | **KHÔNG** | **KHÔNG** | 🟢 Cực kỳ an toàn | Gom 3-5 commit vụn vặt gần nhất lại thành 1 commit duy nhất trước khi mở PR. |
| **`--mixed`** *(Mặc định)* | **CÓ** | **CÓ** | **KHÔNG** | 🟡 An toàn | Hủy bỏ các commit cũ nhưng giữ lại toàn bộ code ở dạng chưa Staged để chia lại commit nhỏ hơn. |
| **`--hard`** | **CÓ** | **CÓ** | **CÓ (Xóa sạch)** | 🔴 Cực kỳ nguy hiểm | Vứt bỏ hoàn toàn toàn bộ code thử nghiệm thất bại và đưa dự án về trạng thái sạch sẽ của commit cũ. |

> [!CAUTION]
> Bất kỳ sửa đổi nào trong Working Tree **chưa từng được commit** sẽ bị `git reset --hard` xóa sổ vĩnh viễn và Git **không thể cứu lại** (vì Git chưa từng tạo `blob` cho dữ liệu đó)!

### 2.3. Lệnh Hiện Đại `git restore` (Tách biệt khỏi Reset)
Từ Git 2.23+, để tránh gây nhầm lẫn giữa việc "xóa commit" và "hoàn tác file", Git đã giới thiệu lệnh `git restore`:

```bash
# 1. Hủy bỏ thay đổi của một file ở Working Tree (về lại trạng thái của Index/HEAD)
git restore file.js

# 2. Bỏ một file ra khỏi Staging (Unstage) mà không đụng tới Working Tree
git restore --staged file.js

# 3. Lấy lại nội dung của một file từ 2 commit trước đó
git restore --source=HEAD~2 file.js
```

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Gõ Nhầm `git reset --hard` Khi Đang Có Code Chưa Commit
Nếu bạn đang viết dở 2 tiếng đồng hồ nhưng chưa chạy `git add` hay `git commit`, sau đó bạn chạy `git reset --hard HEAD`:
- Toàn bộ 2 tiếng viết code của bạn sẽ bốc hơi ngay lập tức không để lại dấu vết.
- **Phòng vệ**: Trước khi thực hiện bất kỳ lệnh reset nguy hiểm nào, luôn chạy:
  ```bash
  git stash push -u -m "backup before hard reset"
  ```

### Bẫy 2: Dùng `git reset` Trên Nhánh `main` Đã Push
Nếu bạn kéo lùi `main` về 3 commit trên máy local, lệnh `git push` sẽ bị server từ chối. Nếu bạn ép bằng `git push -f`:
- Toàn bộ các nhánh con của đồng đội phân nhánh từ 3 commit đó sẽ bị gãy và phát sinh lỗi merge nghiêm trọng.
- **Quy tắc**: Nhánh đã push chỉ được dùng `git revert`!

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [02-reset-demo.js](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/02-reset-demo.js).

Kỹ thuật Squash nhanh 3 commit bằng `--soft`:
```bash
# Giả sử bạn có 3 commit nhỏ: "wip 1", "wip 2", "fix typo"
# Đưa HEAD lùi về 3 commit trước nhưng giữ nguyên toàn bộ code đã staged:
git reset --soft HEAD~3

# Kiểm tra status: Toàn bộ code của 3 commit trên vẫn nằm nguyên trong Staging Area
git status

# Giờ chỉ cần tạo đúng 1 commit chất lượng cao:
git commit -m "feat(auth): complete user registration pipeline"
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Làm thế nào để phân biệt giữa cú pháp `HEAD~` và `HEAD^` khi chỉ định vị trí commit trong Git reset?
**Đáp án chi tiết**:
- `HEAD~n` (Tilde `~`): Đi lùi **theo số thế hệ cha mẹ** trên cùng một nhánh tuyến tính.
  - `HEAD~1`: Commit cha trực tiếp.
  - `HEAD~3`: Commit ông cố (lùi 3 bước về quá khứ theo nhánh chính).
- `HEAD^n` (Caret `^`): Chọn **commit cha thứ mấy** tại một điểm hợp nhất (Merge Commit).
  - Một merge commit có 2 cha: `HEAD^1` là commit cha thuộc nhánh nhận merge (Parent 1), `HEAD^2` là commit cha thuộc nhánh được gộp vào (Parent 2).
  - Có thể kết hợp: `HEAD~2^2` nghĩa là lùi 2 thế hệ, sau đó rẽ sang commit cha thứ hai.

### Câu 2: Giả sử bạn vừa lỡ tay chạy lệnh `git reset --hard HEAD~1` và làm mất commit quan trọng. Làm sao để lấy lại commit đó ngay lập tức?
**Đáp án chi tiết**:
1. Lập tức chạy lệnh `git reflog`: Git sẽ hiển thị nhật ký di chuyển của con trỏ `HEAD`. Tìm dòng trước khi reset, ví dụ: `HEAD@{1}: commit: feat: my important code`.
2. Khôi phục lại trạng thái đỉnh bằng 1 trong 2 cách:
   - Cách 1: Reset thẳng tới vị trí trong reflog:
     ```bash
     git reset --hard HEAD@{1}
     ```
   - Cách 2: Tạo một nhánh mới từ commit đã mất để bảo toàn an toàn:
     ```bash
     git switch -c rescued-branch HEAD@{1}
     ```
