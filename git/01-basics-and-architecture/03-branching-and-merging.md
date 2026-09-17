# Bản Chất Phân Nhánh & Hợp Nhất Trong Git (Branching & Merging)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đối tượng Commit DAG và bản chất con trỏ `HEAD`).
  - [02-basic-commands-and-staging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/02-basic-commands-and-staging.md) (Lịch sử commit và trạng thái Working Tree).
- **Khái niệm tương quan**:
  - **Common Ancestor**: Commit tổ tiên chung gần nhất của hai nhánh được Git sử dụng làm gốc quy chiếu trong thuật toán 3-way merge.
  - **Detached HEAD**: Trạng thái con trỏ `HEAD` trỏ trực tiếp vào một mã hash commit cụ thể thay vì trỏ vào tên một nhánh.
- **Điểm đến tiếp theo**:
  - [04-stashing-and-tagging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/04-stashing-and-tagging.md) (Lưu tạm thay đổi Stash và đánh dấu phát hành Release Tags).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Cơ Chế Con Trỏ Nhánh (Branch Pointers)
Trong Git, phân nhánh **không hề sao chép thư mục**.
- Một nhánh chỉ là con trỏ di động (movable pointer) trỏ đến một commit cụ thể.
- Khi bạn thực hiện một commit mới, nhánh hiện tại sẽ tự động tiến lên phía trước trỏ vào commit mới đó.
- `HEAD` là con trỏ đặc biệt: nó trỏ vào **nhánh bạn đang đứng**.

```
[HEAD] ----> [main] ----> (Commit C2) ----> (Commit C1)
                            ^
[feature] ------------------+
```

### 2.2. Hai Chiến Lược Hợp Nhất Cơ Bản (Merge Strategies)

#### A. Fast-Forward Merge (Tua nhanh)
Xảy ra khi lịch sử của nhánh đích (`feature`) là một đường thẳng nối tiếp từ nhánh hiện tại (`main`), không có bất kỳ commit nào phát sinh trên `main` kể từ thời điểm phân nhánh.
- **Hành vi**: Git chỉ việc di chuyển con trỏ `main` trượt lên đỉnh của `feature`. **Không có commit hợp nhất nào được tạo ra**.

```
Trước merge:
  (C1) ---> (C2: main)
              \
               (C3) ---> (C4: feature)

Sau git merge feature (Fast-Forward):
  (C1) ---> (C2) ---> (C3) ---> (C4: main, feature)
```

#### B. 3-Way Merge Commit (Hợp nhất 3 chiều)
Xảy ra khi cả `main` và `feature` đều có những commit mới độc lập sau thời điểm rẽ nhánh.
- **Hành vi**: Git tìm commit tổ tiên chung (Base `C2`), sau đó hợp nhất 3 bản chụp: `Base (C2)`, `Mine (C3)`, `Theirs (C4)`.
- Git tạo ra một **Merge Commit đặc biệt (C5)** sở hữu **hai commit cha (Two Parents)**: Parent 1 trỏ về `C3` (nhánh hiện tại) và Parent 2 trỏ về `C4` (nhánh được gộp vào).

```
  (C1) ---> (C2: Base) ---> (C3: main) -------------\
                \                                    v
                 (C4: feature) -------------> (C5: Merge Commit [HEAD -> main])
```

### 2.3. Lệnh Điều Hướng Nhánh Hiện Đại (`git switch` vs `git checkout`)
Từ Git 2.23+, lệnh cồng kềnh `git checkout` đã được tách thành 2 lệnh chuyên biệt:
1. `git switch`: Chỉ phụ trách chuyển đổi và tạo nhánh.
   - `git switch feature`: Chuyển sang nhánh `feature`.
   - `git switch -c feature` (hoặc `-C` ép buộc): Tạo mới và chuyển ngay sang nhánh `feature`.
2. `git restore`: Chỉ phụ trách hoàn tác file ở Working Tree và Staging.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Rơi Vào Trạng Thái Detached HEAD (HEAD Bị Mất Gốc)
Khi bạn chạy `git checkout <commit-hash>` thay vì tên branch, `HEAD` sẽ trỏ trực tiếp vào commit đó.
- Nếu bạn tạo commit mới trong trạng thái này, commit mới sinh ra không thuộc về bất kỳ branch nào.
- Khi bạn chuyển sang branch khác (`git switch main`), các commit vừa tạo sẽ trở thành **commit mồ côi (dangling/unreachable commits)** và sẽ bị dọn rác tự động (`git gc`).
- **Khắc phục nếu lỡ commit trên Detached HEAD**: Lập tức gắn nhánh cho nó:
  ```bash
  git switch -c my-rescued-feature
  ```

### Bẫy 2: Xóa Nhầm Nhánh Chưa Merge Bằng `-D`
- `git branch -d <name>`: Xóa an toàn. Nếu nhánh có những commit chưa được hợp nhất vào nhánh hiện tại, Git sẽ từ chối xóa và cảnh báo lỗi.
- `git branch -D <name>` (tương đương `--delete --force`): Xóa bất chấp. Nếu lỡ tay xóa nhánh có code quan trọng, bạn phải dùng `git reflog` để cứu hộ lại mã SHA-1 của commit đỉnh.

### Bẫy 3: Đứng Sai Nhánh Khi Thực Hiện Merge
Lệnh `git merge <target>` luôn kéo các thay đổi của `<target>` ném vào **nhánh bạn đang đứng**.
- Luôn kiểm tra `git status` hoặc `git branch --show-current` để chắc chắn bạn đang đứng ở nhánh cần nhận dữ liệu (thường là `main` hoặc `develop`) trước khi merge.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [03-branching-demo.js](file:///d:/my-project/revision-document/git/01-basics-and-architecture/03-branching-demo.js).

Tóm tắt các lệnh quản lý nhánh cốt lõi:
```bash
# Liệt kê tất cả các nhánh local và remote kèm commit mới nhất
git branch -av

# Xem danh sách các nhánh đã được merge vào nhánh hiện tại
git branch --merged

# Xem danh sách các nhánh chưa được merge (chứa code chưa tích hợp)
git branch --no-merged

# Bắt buộc tạo Merge Commit dù có thể Fast-Forward (Bảo lưu vết tích lịch sử)
git merge --no-ff feature/login

# Gộp toàn bộ commit của nhánh thành 1 commit duy nhất không lưu lịch sử con
git merge --squash feature/quick-fix
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao cờ `--no-ff` (No Fast-Forward) lại được quy định bắt buộc trong quy trình làm việc Git Flow của nhiều doanh nghiệp?
**Đáp án chi tiết**:
- Khi hợp nhất dạng Fast-Forward, các commit của nhánh tính năng bị trộn lẫn hoàn toàn vào dòng thời gian của `main`. Nếu nhánh có 15 commit nhỏ, toàn bộ 15 commit này nằm phẳng trên `main`, làm mất dấu mốc: "15 commit này thuộc về một tính năng hoàn chỉnh đã được kiểm thử".
- Khi sử dụng `git merge --no-ff`, Git luôn tạo ra một **Merge Commit** đại diện. Lợi ích:
  1. Thể hiện ranh giới rõ ràng của tính năng trong đồ thị lịch sử `git log --graph`.
  2. Dễ dàng hoàn tác toàn bộ tính năng khi có sự cố trên Production chỉ bằng đúng một lệnh: `git revert -m 1 <merge-commit-hash>`.

### Câu 2: Làm cách nào để đổi tên nhánh hiện tại và đồng bộ lên Remote server?
**Đáp án chi tiết**:
1. Đổi tên nhánh local:
   ```bash
   git branch -m <tên-nhánh-mới>
   ```
2. Đẩy nhánh mới lên remote và thiết lập upstream:
   ```bash
   git push -u origin <tên-nhánh-mới>
   ```
3. Xóa nhánh có tên cũ trên remote:
   ```bash
   git push origin --delete <tên-nhánh-cũ>
   ```
