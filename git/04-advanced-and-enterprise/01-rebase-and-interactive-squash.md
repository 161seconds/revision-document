# Tái Cơ Cấu Lịch Sử (Git Rebase) & Interactive Squash

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-basics-and-architecture/01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đồ thị DAG và tính bất biến của Commit).
  - [01-basics-and-architecture/03-branching-and-merging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/03-branching-and-merging.md) (So sánh Fast-Forward và 3-Way Merge).
- **Khái niệm tương quan**:
  - **Linear History**: Giữ cho toàn bộ lịch sử commit của nhánh chính là một đường thẳng duy nhất, không có các vòng merge đan chéo.
  - **Commit Hygiene**: Nghệ thuật tinh chỉnh và dọn dẹp các commit thô trước khi đưa vào codebase chính thức của công ty.
- **Điểm đến tiếp theo**:
  - [02-merge-conflicts-and-rerere.md](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/02-merge-conflicts-and-rerere.md) (Giải quyết xung đột hợp nhất & cơ chế tự động tái sử dụng `git rerere`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Kỹ Thuật Của `git rebase`
Thay vì tạo ra một Merge Commit để nối 2 nhánh lại với nhau, `git rebase` **thay đổi commit cơ sở (Base Commit)** của nhánh hiện tại:
1. Git tìm commit tổ tiên chung (Common Ancestor) của 2 nhánh.
2. Git tạm thời trích xuất các commit riêng của nhánh hiện tại và lưu chúng thành các bản vá (patches) trong thư mục tạm `.git/rebase-apply/`.
3. Git di chuyển con trỏ nhánh hiện tại trượt tới đỉnh của nhánh đích.
4. Git tuần tự áp dụng (replay) từng bản vá lên đỉnh mới, tạo ra các **commit hoàn toàn mới với mã SHA-1 mới**.

```
Trước khi Rebase:
          (C3) ---> (C4: feature)
         /
  (C1) ---> (C2: main)

Sau khi git switch feature && git rebase main:
  (C1) ---> (C2: main) ---> (C3') ---> (C4': feature)
  [Lịch sử thẳng tắp, C3 và C4 cũ biến mất, thay bằng C3' và C4']
```

### 2.2. Quy Tắc Vàng Của Rebase (The Golden Rule of Rebase)

> [!CAUTION]
> **QUY TẮC BẤT DI BẤT DỊCH**: Tuyệt đối **KHÔNG BAO GIỜ** rebase một nhánh **CÔNG KHAI (Public / Shared Branch)** mà các thành viên khác đang cùng làm việc!
> Chỉ rebase trên các nhánh tính năng cá nhân (Private Feature Branch) của riêng bạn trước khi mở Pull Request.

Nếu bạn rebase một nhánh đã push lên server, bạn sẽ ghi đè lịch sử và bắt buộc phải dùng `push --force`. Khi đồng đội của bạn pull về, lịch sử của họ sẽ bị gãy vụn và phát sinh xung đột lặp đi lặp lại.

### 2.3. Sức Mạnh Của Interactive Rebase (`git rebase -i`)
Lệnh `git rebase -i HEAD~N` mở ra một danh sách các commit để bạn biên tập trực tiếp trước khi gộp vào `main`:

| Lệnh trong bảng điều khiển | Ý nghĩa thực thi | Ứng dụng thực tế |
| :--- | :--- | :--- |
| **`pick`** (`p`) | Giữ nguyên commit này | Dùng cho các commit hoàn chỉnh đã test đạt |
| **`reword`** (`r`) | Giữ nguyên code, nhưng cho phép sửa lại commit message | Sửa lỗi chính tả, chuẩn hóa theo Conventional Commits |
| **`edit`** (`e`) | Tạm dừng tại commit này để sửa code, chia nhỏ commit | Bổ sung file còn thiếu hoặc chỉnh sửa code cũ |
| **`squash`** (`s`) | Gộp commit này vào commit ngay phía trước, giữ lại cả 2 message | Gom các commit liên quan lại thành một tính năng lớn |
| **`fixup`** (`f`) | Gộp commit này vào commit phía trước nhưng **bỏ đi message** của nó | Xóa bỏ các commit vặt vãnh như *"fix typo"*, *"lint fix"* |
| **`drop`** (`d`) | Xóa sổ hoàn toàn commit này khỏi lịch sử | Loại bỏ code thử nghiệm hoặc code nhầm lẫn |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Xung Đột Từng Bước Khi Rebase (Multi-Step Conflicts)
Khác với merge (chỉ giải quyết conflict 1 lần duy nhất), rebase áp dụng lại từng commit một. Nếu bạn có 10 commit cùng sửa vào 1 hàm, bạn có thể phải giải quyết xung đột tới 10 lần!
- **Cách xử lý chuẩn**:
  - Khi gặp xung đột: Sửa file, chạy `git add <file>`, sau đó chạy:
    ```bash
    git rebase --continue
    ```
  - Tuyệt đối **KHÔNG** chạy `git commit` trong lúc rebase!
  - Nếu cảm thấy quá rối ren muốn hủy bỏ hoàn toàn trạng thái:
    ```bash
    git rebase --abort
    ```

### Bẫy 2: Quên Sử Dụng `--autostash` Khi Đang Có Code Dở Dang
Nếu bạn đang có code chưa commit ở Working Tree, lệnh `git rebase` sẽ từ chối chạy.
- Thay vì phải thủ công `stash -> rebase -> stash pop`:
  ```bash
  git rebase --autostash origin/main
  # Git tự động cất code dở dang vào stash, chạy rebase xong tự động pop ra lại!
  ```

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [01-rebase-demo.js](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/01-rebase-demo.js).

Kỹ thuật Fixup tự động không cần mở editor tương tác:
```bash
# Sửa lỗi phát hiện trong commit trước
git add fix.js

# Tạo commit fixup trỏ thẳng vào commit cần sửa
git commit --fixup <commit-hash-can-sua>

# Tự động gộp và dọn dẹp sạch sẽ
git rebase -i --autosquash HEAD~4
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: So sánh ưu và nhược điểm giữa `git merge` và `git rebase` trong quy trình tích hợp nhánh tính năng vào `main`?
**Đáp án chi tiết**:
- **`git merge`**:
  - *Ưu điểm*: Trung thực tuyệt đối với lịch sử; không bao giờ thay đổi các commit đã tạo; giữ nguyên dòng thời gian thực tế; xử lý xung đột 1 lần duy nhất.
  - *Nhược điểm*: Tạo nhiều merge commit thừa thãi; cây lịch sử đan chéo phức tạp (mạng nhện).
- **`git rebase`**:
  - *Ưu điểm*: Cực kỳ sạch sẽ; lịch sử là một đường thẳng tuyến tính ($O(1)$ khi đọc `git log`); rất thuận tiện cho CI/CD và `git bisect`.
  - *Nhược điểm*: Viết lại lịch sử (nguy hiểm nếu làm trên nhánh chung); có thể phải giải quyết conflict nhiều lần qua từng commit.

### Câu 2: Trong file todo của `git rebase -i`, thứ tự thực thi của các commit từ trên xuống dưới là như thế nào? (Khác gì so với `git log`?)
**Đáp án chi tiết**:
- Trong `git log`: Commit mới nhất (mới tạo) nằm ở **trên cùng**, commit cũ hơn nằm ở dưới.
- Trong `git rebase -i`: Git đảo ngược lại hoàn toàn! Commit cũ nhất nằm ở **dòng đầu tiên**, commit mới nhất nằm ở **dòng cuối cùng**.
- **Lý do kỹ thuật**: Git phải áp dụng các bản vá theo thứ tự thời gian từ quá khứ đến hiện tại để đảm bảo tính nhất quán của code.
