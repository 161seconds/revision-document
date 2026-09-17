# Đồng Bộ Mã Nguồn: Fetch, Pull, Push & Tracking Branches

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-remote-repositories-and-protocols.md](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/01-remote-repositories-and-protocols.md) (Cấu hình Remote và giao thức kết nối).
  - [01-basics-and-architecture/03-branching-and-merging.md](file:///d:/my-project/revision-document/git/01-basics-and-architecture/03-branching-and-merging.md) (Chiến lược Fast-Forward và 3-way Merge).
- **Khái niệm tương quan**:
  - **Remote-Tracking Branches**: Các con trỏ chỉ đọc trong `.git/refs/remotes/origin/` phản ánh chính xác trạng thái của remote server tại lần fetch gần nhất.
  - **Fast-Forward Protection**: Git mặc định từ chối lệnh `push` nếu commit của bạn không phải là con cháu trực tiếp (linear descendant) của commit trên server.
- **Điểm đến tiếp theo**:
  - [03-fork-clone-and-workflows.md](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/03-fork-clone-and-workflows.md) (Quy trình làm việc Clone, Fork và GitHub Flow).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Nhánh Theo Dõi Từ Xa (Remote-Tracking Branches)
Khi làm việc với remote, Git duy trì 3 con trỏ khác nhau:
1. `main` (Local Branch): Con trỏ local của bạn, di chuyển mỗi khi bạn `git commit`.
2. `origin/main` (Remote-Tracking Branch): Bản chụp tại local ghi lại vị trí của `main` trên server tại lần đồng bộ gần nhất. Bạn **không thể commit trực tiếp** lên con trỏ này.
3. `main` trên Server (Remote Branch): Vị trí thực tế trên GitHub.

```
Local Client:
  [HEAD -> main] ----> (Commit C3: Bạn vừa commit local)
                           ^
  [origin/main] ---------> (Commit C2: Lần fetch gần nhất)
                           ^
GitHub Server:
  [main] ----------------> (Commit C2: Hoặc C4 nếu đồng đội vừa push)
```

### 2.2. Sự Khác Biệt Giữa `git fetch` và `git pull`

#### A. `git fetch` (An toàn tuyệt đối)
- Tải về toàn bộ các đối tượng (`blobs`, `trees`, `commits`) mới từ remote server và cập nhật con trỏ `origin/main`.
- **Hoàn toàn không chạm vào Working Tree hay nhánh local của bạn**. Bạn có thể dùng `git log origin/main` hoặc `git diff origin/main` để soi xét kỹ lưỡng code của đồng đội trước khi quyết định tích hợp.

#### B. `git pull` (Thao tác kép)
- Thực chất là chạy 2 lệnh liên tiếp:
  $$\text{git pull} = \text{git fetch} + \text{git merge origin/<branch>}$$
- Tải về và lập tức tự động kích hoạt tiến trình merge vào nhánh bạn đang đứng. Nếu có code xung đột, Working Tree sẽ rơi vào trạng thái Conflict.
- **Khuyến nghị hiện đại**: Sử dụng `git pull --rebase` để kéo commit của bạn lên trên đầu những thay đổi mới của server, giữ cho lịch sử commit luôn thẳng hàng và sạch sẽ.

### 2.3. Thiết Lập Upstream Tracking (`git push -u`)
Cờ `-u` (hoặc `--set-upstream`) thiết lập mối liên kết giữa nhánh local và remote tracking branch trong `.git/config`:
```bash
git push -u origin feature/auth
```
Sau khi thiết lập, các lần sau bạn chỉ cần gõ `git push` hoặc `git pull` mà không cần chỉ định `origin` và tên nhánh. Git cũng sẽ hiển thị thông báo hữu ích như: *"Your branch is ahead of 'origin/main' by 2 commits"*.

### 2.4. Đẩy Mã Nguồn An Toàn: `--force-with-lease` vs `--force`
- `git push --force` (`-f`): Ghi đè mù quáng lịch sử trên remote server bằng lịch sử của máy bạn. Nếu trong lúc bạn đang rebase mà đồng đội vừa push 3 commit mới lên server, lệnh này sẽ **xóa vĩnh viễn 3 commit của đồng đội**!
- `git push --force-with-lease`: **Chuẩn bảo vệ bắt buộc của Senior**. Git chỉ cho phép ghi đè nếu con trỏ `origin/main` trên máy bạn khớp chính xác với con trỏ `main` trên server (tức là chưa có ai khác đẩy code mới kể từ lần fetch gần nhất của bạn).

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Gặp Lỗi `[rejected - non-fast-forward]` Vội Vàng Dùng `-f`
Khi bị từ chối push vì server đã có commit mới của đồng đội:
- Lập trình viên thiếu kinh nghiệm thường dùng `git push -f` để ép đẩy mã, làm mất toàn bộ code mới của đồng đội trên nhánh chung.
- **Quy trình chuẩn**:
  1. `git fetch origin`
  2. `git rebase origin/main` (hoặc `git merge origin/main`)
  3. Giải quyết xung đột nếu có, chạy test.
  4. `git push origin main` (bình thường, không cần force).

### Bẫy 2: Xóa Nhầm Nhánh Trên Remote
Lệnh xóa remote branch:
```bash
git push origin --delete feature-branch
```
Cần hết sức cẩn thận, đặc biệt khi dùng các quy tắc wildcard hoặc gõ nhầm tên các nhánh môi trường chung như `staging` hay `develop`.

---

## 4. Code Thực Hành (Practical Examples)

Xem file kiểm chứng tự động tại [02-pull-push-demo.js](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/02-pull-push-demo.js).

Tóm tắt các lệnh đồng bộ cốt lõi:
```bash
# Đẩy nhánh lần đầu và thiết lập tracking
git push -u origin main

# Tải dữ liệu mới mà không merge vào code đang viết
git fetch origin

# Xem sự khác biệt giữa code local của bạn và code mới trên remote
git log HEAD..origin/main --oneline

# Kéo code mới và rebase commit local lên trên
git pull --rebase origin main

# Đẩy code an toàn sau khi rebase cục bộ
git push --force-with-lease origin feature/login

# Xóa một nhánh đã hoàn thành trên server
git push origin --delete feature/login
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao `git pull --rebase` lại được nhiều nhóm công nghệ ưa chuộng hơn lệnh `git pull` mặc định?
**Đáp án chi tiết**:
- Lệnh `git pull` mặc định sử dụng chiến lược merge, tạo ra vô số các commit rác dạng: *"Merge branch 'main' of https://github.com/..."* mỗi khi bạn kéo code mới về. Khi có 10 người cùng làm việc, cây lịch sử `git log` sẽ trở thành một mạng lưới đan chéo rối rắm (diamond merges).
- Lệnh `git pull --rebase` tạm thời nhấc các commit cục bộ của bạn ra, cập nhật nhánh local trượt lên đỉnh commit mới nhất của remote, rồi tuần tự áp dụng lại các commit của bạn lên trên cùng.
- **Lợi ích**: Lịch sử commit luôn là một **đường thẳng duy nhất (linear history)**, cực kỳ dễ đọc, dễ cherry-pick và thuận tiện khi dùng `git bisect` để tìm bug.

### Câu 2: Trong trường hợp nào thì `git push --force-with-lease` vẫn có thể vô tình ghi đè commit của đồng đội?
**Đáp án chi tiết**:
- `git push --force-with-lease` hoạt động bằng cách kiểm tra: "Vị trí của `origin/main` tại local có khớp với vị trí thực tế trên remote server hay không".
- Nếu bạn (hoặc tiện ích ngầm của IDE như auto-fetch) vừa chạy lệnh `git fetch` mà bạn không hề kiểm tra lại, con trỏ `origin/main` tại local sẽ được cập nhật trỏ tới commit mới nhất của đồng đội.
- Khi đó, điều kiện kiểm tra của `force-with-lease` thỏa mãn, và Git vẫn sẽ ghi đè lịch sử!
- **Bài học**: Luôn kiểm tra kỹ trạng thái log trước khi thực hiện bất kỳ lệnh force push nào.
