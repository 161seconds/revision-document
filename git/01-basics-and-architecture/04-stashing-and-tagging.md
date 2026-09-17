# Lưu Tạm Thay Đổi (Git Stash) & Đánh Dấu Phiên Bản (Git Tag)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-git-architecture-and-internals.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/01-git-architecture-and-internals.md) (Đối tượng Tag và cơ chế lưu trữ đối tượng).
  - [02-basic-commands-and-staging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/02-basic-commands-and-staging.md) (Trạng thái Tracked vs Untracked).
- **Khái niệm tương quan**:
  - **Work in Progress (WIP)**: Trạng thái code dở dang chưa đủ hoàn thiện để tạo một Atomic Commit.
  - **Semantic Versioning (SemVer 2.0.0)**: Định dạng đánh số phiên bản `vMAJOR.MINOR.PATCH` gắn liền với Git Tags để kích hoạt Release Pipeline tự động trong CI/CD.
- **Điểm đến tiếp theo**:
  - [05-ignoring-and-attributes.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/05-ignoring-and-attributes.md) (Quy tắc bỏ qua file `.gitignore` và thiết lập `.gitattributes`).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Bản Chất Ngăn Xếp Git Stash (The Stash Stack)
Khi bạn đang viết dở code trên nhánh `feature` nhưng phải chuyển khẩn cấp sang `hotfix` để sửa lỗi Production, bạn không muốn tạo một commit rác `wip`. Lệnh `git stash` giải quyết bài toán này.
- **Bản chất dưới ổ đĩa**: `git stash` thực chất tạo ra **hai (hoặc ba) commit ngầm đặc biệt** trong `.git/objects/`:
  1. Một commit lưu trạng thái của Staging Area tại thời điểm stash.
  2. Một commit lưu trạng thái của Working Tree tại thời điểm stash.
  3. (Tùy chọn khi dùng `-u`): Một commit lưu các file Untracked.
- Con trỏ tham chiếu được lưu trong file `.git/refs/stash` và quản lý theo cấu trúc ngăn xếp LIFO (Last-In-First-Out) qua Reflog `stash@{0}`, `stash@{1}`.

```
       [ Working Tree dở dang ] === git stash push -m "wip login" ===> [ STASH STACK ]
                 |                                                      stash@{0}: "wip login"
                 v                                                      stash@{1}: "wip table"
[ Working Tree sạch sẽ trở về trạng thái HEAD ]
                 |
        (Chuyển nhánh sửa bug)
                 |
                 v
       [ Quay lại nhánh cũ ] <===== git stash pop ===================== [ STASH STACK ]
```

### 2.2. Hai Loại Git Tags: Lightweight vs Annotated Tags
Tag dùng để đóng băng một dấu mốc quan trọng trong lịch sử (thường là bản phát hành Production).

| Tiêu chí | Lightweight Tag | Annotated Tag (`-a`) |
| :--- | :--- | :--- |
| **Cú pháp tạo** | `git tag v1.0.0` | `git tag -a v1.0.0 -m "Release version 1.0.0"` |
| **Bản chất lưu trữ** | Chỉ là 1 file text trong `.git/refs/tags/` chứa 40 ký tự SHA-1 của commit | Là 1 **đối tượng `tag` độc lập** trong `.git/objects/` |
| **Dữ liệu kèm theo** | Không có gì ngoài mã commit | Tên Tagger, Email, Ngày tạo, Message, Chữ ký số GPG |
| **Mục đích sử dụng** | Đánh dấu tạm thời cục bộ cho cá nhân | Phát hành phần mềm chính thức (Official Releases) |

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: `git stash` Bỏ Rơi File Mới (Untracked Files Trap)
Mặc định, `git stash` **chỉ lưu các file đã được theo dõi (Tracked files)** bị sửa đổi. Các file mới tạo chưa từng `git add` sẽ bị bỏ rơi lại ở Working Tree!
- Khi bạn chuyển nhánh, các file mới này vẫn nằm nguyên đó và có thể gây xung đột hoặc nhầm lẫn sang nhánh khác.
- **Giải pháp bắt buộc**: Luôn dùng cờ `-u` (`--include-untracked`) hoặc `-a` (`--all` bao gồm cả file bị gitignore):
  ```bash
  git stash push -u -m "WIP: include new components"
  ```

### Bẫy 2: Dùng `git stash clear` Xóa Sạch Không Thể Phục Hồi Dễ Dàng
Lệnh `git stash clear` xóa toàn bộ danh sách stash mà không hỏi xác nhận. Nếu bạn có code quan trọng bị stash từ tuần trước, con trỏ tham chiếu sẽ bị xóa. Bạn phải dùng `git fsck --lost-found` để đào bới lại các commit mồ côi trong database.

### Bẫy 3: Nghĩ Rằng `git push` Sẽ Đẩy Cả Tags Lên Remote
Lệnh `git push` thông thường **không bao giờ** đẩy các thẻ Tags lên remote server.
- Để đẩy một tag cụ thể: `git push origin v1.0.0`.
- Để đẩy toàn bộ tags chưa có trên server: `git push origin --tags`.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [04-stashing-tagging-demo.js](file:///d:/my-project/revision-document/git/01-basics-and-architecture/04-stashing-tagging-demo.js).

Tóm tắt các lệnh thao tác Stash & Tag chuẩn:
```bash
# Lưu stash kèm ghi chú rõ ràng
git stash push -m "WIP: checkout integration"

# Xem danh sách các stash hiện có kèm độ lệch
git stash list

# Áp dụng stash mới nhất và XÓA khỏi ngăn xếp
git stash pop

# Áp dụng stash nhưng VẪN GIỮ lại trong ngăn xếp để tái sử dụng
git stash apply stash@{0}

# Tạo nhánh mới từ một stash (Cực kỳ hữu ích khi code dở dang gây xung đột nếu pop)
git stash branch feature/from-stash stash@{0}

# Tạo Annotated Tag có chữ ký và message
git tag -a v2.1.0 -m "Release v2.1.0: Support OAuth2 login"

# Xem thông tin chi tiết của Tag (Tagger, Ngày, Commit trỏ tới)
git show v2.1.0
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Sự khác biệt cơ bản giữa `git stash pop` và `git stash apply` là gì? Khi nào bạn NÊN dùng `apply` thay vì `pop`?
**Đáp án chi tiết**:
- `git stash pop`: Áp dụng những thay đổi từ đỉnh stash vào Working Tree, và **tự động xóa bản ghi stash đó** khỏi ngăn xếp nếu không có xung đột.
- `git stash apply`: Áp dụng những thay đổi vào Working Tree nhưng **giữ nguyên bản ghi stash** trong ngăn xếp.
- **Khi nào nên dùng `apply`?**:
  1. Khi bạn muốn áp dụng cùng một bộ cấu hình hoặc mock data tạm thời lên nhiều nhánh khác nhau để test.
  2. Khi bạn nghi ngờ việc áp dụng stash có thể gây xung đột phức tạp: Dùng `apply` giúp bảo toàn bản sao trong stash để nếu giải quyết xung đột thất bại, bạn có thể `git reset --hard` và lấy lại stash nguyên vẹn bất cứ lúc nào.

### Câu 2: Làm sao để xóa một Tag đã lỡ đẩy (push) lên GitHub/GitLab?
**Đáp án chi tiết**:
Thực hiện 2 bước độc lập:
1. Xóa Tag ở máy cục bộ (Local):
   ```bash
   git tag -d v1.0.0
   ```
2. Xóa Tag trên máy chủ từ xa (Remote):
   ```bash
   git push origin --delete v1.0.0
   # hoặc cú pháp cổ điển tương đương:
   git push origin :refs/tags/v1.0.0
   ```
