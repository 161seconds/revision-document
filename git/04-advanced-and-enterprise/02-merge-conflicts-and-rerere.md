# Xử Lý Xung Đột (Merge Conflicts) & Cơ Chế Tự Động Hóa `git rerere`

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/03-branching-and-merging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/03-branching-and-merging.md) (Thuật toán 3-way Merge và Common Ancestor).
  - [01-rebase-and-interactive-squash.md](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/01-rebase-and-interactive-squash.md) (Quy trình `rebase --continue` và `rebase --abort`).
- **Khái niệm tương quan**:
  - **Conflict Markers**: Ký hiệu phân vùng xung đột được Git tự động chèn trực tiếp vào file mã nguồn.
  - **Rerere Engine (Reuse Recorded Resolution)**: Cơ sở dữ liệu nội bộ của Git tự động lưu vết các cách giải quyết xung đột và tái áp dụng tự động.
- **Điểm đến tiếp theo**:
  - [03-cherry-pick-and-hooks.md](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/03-cherry-pick-and-hooks.md) (Trích lọc commit với Cherry-pick và tự động hóa với Git Hooks).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Tại Sao Xung Đột Xảy Ra?
Trong thuật toán 3-way merge, Git đối chiếu 3 bản chụp:
1. **Base (Tổ tiên chung gần nhất)**
2. **Ours (`HEAD` - Nhánh hiện tại của bạn)**
3. **Theirs (Nhánh đang được gộp vào)**

Xung đột (Conflict) **chỉ xảy ra** khi:
- Cả hai nhánh cùng sửa đổi vào **cùng một dòng code** (hoặc các dòng kề sát nhau) theo hai cách khác nhau so với `Base`.
- Một nhánh chỉnh sửa nội dung file, trong khi nhánh kia đã xóa hoàn toàn file đó.

### 2.2. Giải Phẫu Thẻ Phân Định Xung Đột (Conflict Markers)

```
<<<<<<< HEAD (Phiên bản của bạn trên nhánh hiện tại)
const API_URL = "https://api.prod.company.com";
=======
const API_URL = "https://api.staging.company.com";
>>>>>>> feature/update-api (Phiên bản của nhánh đang được gộp vào)
```

#### Tối Ưu Hóa Với Kiểu Hiển Thị `diff3`
Mặc định bạn không thể biết dòng code ban đầu trước khi hai nhánh sửa là gì. Bật cấu hình `diff3` sẽ hiển thị thêm phiên bản gốc của `Base`:
```bash
git config --global merge.conflictStyle diff3
```
Kết quả hiển thị trực quan 3 phần:
```
<<<<<<< HEAD
const API_URL = "https://api.prod.company.com";
||||||| merged common ancestors
const API_URL = "http://localhost:3000";
=======
const API_URL = "https://api.staging.company.com";
>>>>>>> feature/update-api
```
*(Bạn thấy ngay code gốc ban đầu là localhost:3000, bên bạn sửa thành prod, bên kia sửa thành staging!)*

### 2.3. Bí Mật Của `git rerere` (Reuse Recorded Resolution)
Nếu bạn thường xuyên rebase một nhánh dài hạn hoặc merge qua lại giữa `develop` và `release`, bạn sẽ phải **giải quyết đi giải quyết lại cùng một xung đột** hàng chục lần.
`git rerere` giải quyết triệt để sự lãng phí này:
- Bật tính năng:
  ```bash
  git config --global rerere.enabled true
  ```
- **Cách thức hoạt động**:
  1. Khi gặp xung đột, Git chụp ảnh trạng thái xung đột và lưu vào `.git/rr-cache/`.
  2. Khi bạn sửa xong và commit, Git ghi nhận lại cách bạn đã giải quyết.
  3. Lần sau, bất cứ khi nào Git gặp lại đoạn xung đột y hệt, Git sẽ **tự động giải quyết xung đột đó** thay bạn mà không cần người dùng can thiệp!

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên Xóa Các Dòng Marker `<<<<<<<` và Commit Thẳng Lên Production
Nhiều lập trình viên sửa code vội vàng nhưng để sót lại dòng `=======` hoặc `>>>>>>>`.
- Hậu quả: Gây ra lỗi cú pháp runtime (SyntaxError) làm sập toàn bộ ứng dụng khi build trên CI/CD.
- **Phòng vệ**: Trước khi commit, luôn chạy:
  ```bash
  git diff --check
  # Git sẽ báo lỗi ngay nếu còn sót bất kỳ conflict marker nào trong file!
  ```

### Bẫy 2: Lúng Túng Không Biết Thoát Ra Khỏi Trạng Thái Conflict
Khi đang merge hoặc rebase dở dang mà xung đột quá phức tạp và bạn muốn quay về trạng thái an toàn ban đầu:
- Nếu đang Merge: `git merge --abort`
- Nếu đang Rebase: `git rebase --abort`
- Nếu đang Cherry-pick: `git cherry-pick --abort`
Working Tree sẽ lập tức được trả về trạng thái nguyên vẹn trước khi bạn gõ lệnh.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [02-conflicts-demo.js](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/02-conflicts-demo.js).

Quy trình giải quyết xung đột 4 bước chuẩn:
```bash
# Bước 1: Xem danh sách các file đang bị xung đột (Both modified: UU)
git status -s

# Bước 2: Dùng lệnh kiểm tra diff chuyên biệt
git diff

# Bước 3: Mở editor sửa file, xóa các ký hiệu <<<< ==== >>>>
# Sau khi sửa chuẩn, đánh dấu hoàn tất bằng git add:
git add src/config.js

# Bước 4: Hoàn thành tiến trình merge (hoặc rebase)
git commit -m "merge: resolve API_URL conflict between staging and prod"
# (Hoặc 'git rebase --continue' nếu đang rebase)
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Sự khác nhau giữa việc giải quyết xung đột trong `git merge` và `git rebase` là gì?
**Đáp án chi tiết**:
- **Trong `git merge`**: Toàn bộ các xung đột giữa 2 nhánh được tập hợp và bạn chỉ cần **giải quyết đúng 1 lần duy nhất**. Sau khi giải quyết xong, bạn chạy `git commit` để tạo Merge Commit kết thúc quá trình.
- **Trong `git rebase`**: Git áp dụng lại tuần tự từng commit của nhánh tính năng lên nhánh đích. Nếu có 3 commit cùng đụng vào đoạn code bị sửa, bạn sẽ phải **giải quyết xung đột 3 lần liên tiếp** tại từng commit. Sau mỗi lần sửa, bạn chạy `git add` và `git rebase --continue` (tuyệt đối không dùng `git commit`).

### Câu 2: Trong tình huống xung đột file cấu hình hoặc binary (như file ảnh hay file lock), làm sao để chọn nhanh 100% phiên bản của mình (Ours) hoặc 100% phiên bản của đồng đội (Theirs) mà không cần mở file sửa thủ công?
**Đáp án chi tiết**:
Git cung cấp cờ `--ours` và `--theirs` trên lệnh checkout/restore:
- Lấy toàn bộ phiên bản của bạn (nhánh hiện tại):
  ```bash
  git checkout --ours package-lock.json
  # hoặc: git restore --ours package-lock.json
  git add package-lock.json
  ```
- Lấy toàn bộ phiên bản của đồng đội (nhánh được gộp):
  ```bash
  git checkout --theirs package-lock.json
  # hoặc: git restore --theirs package-lock.json
  git add package-lock.json
  ```
*(Lưu ý: Trong lúc Rebase, ý nghĩa của Ours và Theirs bị đảo ngược: Ours là nhánh đích nhận rebase, Theirs là nhánh tính năng của bạn).*
