# Git Version Control Summary Cheat Sheet

Bảng tra cứu toàn diện các lệnh Git, kiến trúc 3 cây, quy trình phối hợp nhóm và kỹ thuật cứu hộ dữ liệu khẩn cấp.

---

## Mục Lục
1. [Kiến Trúc 3 Cây & Cấu Trúc Đối Tượng](#1-kiến-trúc-3-cây--cấu-trúc-đối-tượng)
2. [Cấu Hình Ban Đầu (Configuration)](#2-cấu-hình-ban-đầu-configuration)
3. [Quy Trình Làm Việc Hàng Ngày (Basic Workflow)](#3-quy-trình-làm-việc-hàng-ngày-basic-workflow)
4. [Phân Nhánh & Hợp Nhất (Branching & Merging)](#4-phân-nhánh--hợp-nhất-branching--merging)
5. [Đồng Bộ Máy Chủ Từ Xa (Remote & Collaboration)](#5-đồng-bộ-máy-chủ-từ-xa-remote--collaboration)
6. [Lưu Tạm (Stash) & Đánh Dấu (Tagging)](#6-lưu-tạm-stash--đánh-dấu-tagging)
7. [Hoàn Tác & Cứu Hộ Dữ Liệu (Undo & Recovery)](#7-hoàn-tác--cứu-hộ-dữ-liệu-undo--recovery)
8. [Git Nâng Cao: Rebase, Conflicts, Cherry-Pick & Hooks](#8-git-nâng-cao-rebase-conflicts-cherry-pick--hooks)
9. [Từ Điển Thuật Ngữ & Best Practices (Glossary & Hygiene)](#9-từ-điển-thuật-ngữ--best-practices-glossary--hygiene)

---

## 1. Kiến Trúc 3 Cây & Cấu Trúc Đối Tượng

```
+-------------------------------------------------------------------------------+
|                             KIẾN TRÚC 3 CÂY CỦA GIT                           |
|                                                                               |
|   1. WORKING TREE            2. INDEX (STAGING)         3. REPOSITORY (HEAD)  |
|  (File thực tế trên đĩa)    (.git/index - binary)       (.git/objects - DAG)  |
|                                                                               |
|   [ file.js ] === git add ===> [ Index Staged ] == git commit ==> [ Commit ]  |
|        ^                             |                                   |    |
|        |====== git restore ==========+===================================|    |
+-------------------------------------------------------------------------------+
```

### 4 Loại Đối Tượng Git trong `.git/objects/`
- **`blob`**: Lưu trữ nội dung nhị phân nén của file (không lưu tên hay quyền file).
- **`tree`**: Đại diện cho thư mục, chứa danh sách trỏ tới các `blob` và `tree` con kèm tên file và quyền chmod.
- **`commit`**: Snapshot của dự án tại một thời điểm, trỏ tới top-level `tree`, `parent` commit, tác giả và thông điệp.
- **`tag`**: Thẻ đánh dấu phát hành chính thức (Annotated Tag) có chữ ký số và ghi chú.

---

## 2. Cấu Hình Ban Đầu (Configuration)

```bash
# Thiết lập định danh cá nhân (Ghi vào ~/.gitconfig)
git config --global user.name "Nguyen Van A"
git config --global user.email "vana@company.com"

# Thiết lập nhánh mặc định khi khởi tạo là main
git config --global init.defaultBranch main

# Tự động chuyển đổi CRLF/LF trên Windows
git config --global core.autocrlf true   # Windows
git config --global core.autocrlf input  # macOS / Linux

# Tự động dọn dẹp các nhánh đã bị xóa trên remote mỗi khi fetch
git config --global fetch.prune true

# Bật ghi nhớ giải quyết xung đột tự động
git config --global rerere.enabled true

# Hiển thị tổ tiên chung khi gặp xung đột (diff3)
git config --global merge.conflictStyle diff3

# Kiểm tra toàn bộ cấu hình đang áp dụng
git config --list --show-origin
```

---

## 3. Quy Trình Làm Việc Hàng Ngày (Basic Workflow)

```bash
# Khởi tạo repository mới tại thư mục hiện tại
git init -b main

# Xem trạng thái ngắn gọn (M: modified, A: added, ??: untracked)
git status -s

# Đưa file vào vùng chuẩn bị commit (Staging Area)
git add app.js                 # Thêm 1 file cụ thể
git add .                      # Thêm toàn bộ thư mục hiện tại
git add -A                     # Thêm toàn bộ repository
git add -p                     # Chọn lọc từng đoạn code (Interactive Patch)

# So sánh sự khác biệt (Diff)
git diff                       # So sánh Working Tree vs Index (chưa staged)
git diff --staged              # So sánh Index vs HEAD (đã staged chuẩn bị commit)
git diff HEAD                  # So sánh toàn bộ thay đổi đối chiếu với HEAD

# Ghi lại lịch sử (Commit)
git commit -m "feat(auth): implement jwt token rotation"
git commit -v                  # Mở editor kèm diff chi tiết để review trước khi commit
git commit --amend --no-edit   # Bổ sung file quên vào commit gần nhất mà không đổi message

# Tra cứu lịch sử commit
git log --oneline --graph --decorate --all -n 10
git log --stat                 # Xem số dòng code thêm/xóa trên từng file
git blame -L 20,40 server.js   # Xem ai sửa dòng nào trong file
```

---

## 4. Phân Nhánh & Hợp Nhất (Branching & Merging)

```bash
# Liệt kê các nhánh (a: all, v: verbose)
git branch -av

# Tạo và chuyển nhánh hiện đại (Git 2.23+)
git switch -c feature/login    # Tạo mới và chuyển ngay sang nhánh feature/login
git switch main                # Chuyển về nhánh main

# Hợp nhất nhánh (Merge)
git merge feature/login        # Mặc định (Fast-forward nếu có thể)
git merge --no-ff feature/login # Bắt buộc tạo Merge Commit (Bảo lưu vết tích tính năng)
git merge --squash feature/fix # Gom toàn bộ commit của nhánh thành 1 commit duy nhất

# Xóa nhánh
git branch -d feature/login    # Xóa an toàn (từ chối xóa nếu chưa merge)
git branch -D feature/login    # Cưỡng chế xóa bất chấp
```

---

## 5. Đồng Bộ Máy Chủ Từ Xa (Remote & Collaboration)

```bash
# Quản lý Remote
git remote add origin git@github.com:org/app.git
git remote -v
git remote set-url origin git@github.com:org/new-app.git
git remote prune origin        # Xóa các con trỏ nhánh đã chết trên server

# Đẩy code và thiết lập tracking branch (-u)
git push -u origin main
git push                       # Các lần sau chỉ cần gõ git push

# Tải dữ liệu về an toàn
git fetch origin               # Chỉ tải đối tượng mới về origin/main, không đụng vào code đang viết
git log HEAD..origin/main --oneline # Xem trước code đồng đội vừa đẩy lên

# Kéo và tích hợp
git pull                       # fetch + merge (Dễ tạo merge commit rác)
git pull --rebase origin main  # fetch + rebase (Khuyến nghị: Giữ lịch sử thẳng tắp)

# Đẩy code an toàn sau khi rebase cục bộ
git push --force-with-lease origin feature/login

# Xóa một nhánh trên remote server
git push origin --delete feature/login

# Sao chép kho mã nguồn
git clone git@github.com:org/app.git
git clone --depth 1 git@github.com:org/app.git # Shallow clone siêu tốc cho CI/CD
```

---

## 6. Lưu Tạm (Stash) & Đánh Dấu (Tagging)

```bash
# Cất code dở dang vào ngăn xếp Stash
git stash push -u -m "WIP: checkout logic" # -u: bao gồm cả file mới untracked

# Xem danh sách các stash hiện có
git stash list

# Áp dụng lại code
git stash pop                  # Lấy ra và XÓA khỏi ngăn xếp
git stash apply stash@{0}      # Lấy ra nhưng VẪN GIỮ trong ngăn xếp để dùng lại

# Xóa stash
git stash drop stash@{0}
git stash clear                # Xóa sạch toàn bộ ngăn xếp

# Đánh dấu phiên bản phát hành (Tags)
git tag v1.0.0-light           # Lightweight tag (con trỏ thuần)
git tag -a v1.0.0 -m "Release v1.0.0 Production" # Annotated tag (đối tượng tag độc lập)

# Đẩy tag lên server (Mặc định git push không đẩy tag)
git push origin v1.0.0         # Đẩy 1 tag cụ thể
git push origin --tags         # Đẩy toàn bộ tags chưa có

# Xóa tag
git tag -d v1.0.0              # Xóa local
git push origin --delete v1.0.0 # Xóa trên remote
```

---

## 7. Hoàn Tác & Cứu Hộ Dữ Liệu (Undo & Recovery)

### Ma Trận Toán Tử Reset
| Lệnh | HEAD di chuyển? | Index (Staging)? | Working Tree? | Mức độ nguy hiểm |
| :--- | :---: | :---: | :---: | :--- |
| `git reset --soft HEAD~1` | **CÓ** | Giữ nguyên Staged | Giữ nguyên | 🟢 Cực kỳ an toàn (Squash commit) |
| `git reset --mixed HEAD~1` *(Mặc định)* | **CÓ** | Xóa Staged | Giữ nguyên Modified | 🟡 An toàn (Chia lại commit) |
| `git reset --hard HEAD~1` | **CÓ** | Xóa Staged | **Xóa sạch về HEAD** | 🔴 Nguy hiểm (Mất code chưa commit) |

```bash
# Hoàn tác an toàn trên nhánh dùng chung (Tạo commit nghịch đảo)
git revert HEAD                # Hoàn tác commit gần nhất
git revert -m 1 <merge-commit> # Hoàn tác một Merge Commit (giữ lại nhánh chính)

# Lệnh khôi phục hiện đại (Git 2.23+)
git restore app.js             # Hủy bỏ sửa đổi chưa staged ở Working Tree
git restore --staged app.js    # Bỏ file ra khỏi Staging (Unstage)
git restore --source=HEAD~2 app.js # Lấy lại file từ 2 commit trước

# Cứu dữ liệu khẩn cấp qua Git Reflog
git reflog                     # Mở nhật ký tham chiếu tìm mã SHA-1 đã mất
git switch -c rescue-branch <commit-hash> # Hồi sinh commit/branch đã mất
git stash apply <stash-hash>   # Cứu stash vừa bị drop
git fsck --lost-found          # Quét tìm các commit mồ côi
```

---

## 8. Git Nâng Cao: Rebase, Conflicts, Cherry-Pick & Hooks

```bash
# Tái cơ cấu lịch sử tuyến tính (Rebase)
git switch feature
git rebase main                # Đặt lại commit cơ sở lên đỉnh main
# The Golden Rule: TUYỆT ĐỐI KHÔNG rebase trên nhánh công khai đã push!

# Interactive Rebase (Biên tập commit)
git rebase -i HEAD~4
# Các lệnh: pick (giữ), reword (sửa tên), squash (gộp giữ tên), fixup (gộp bỏ tên), drop (xóa)

# Tự động gộp commit fixup không cần tương tác
git commit --fixup <commit-hash>
git rebase -i --autosquash HEAD~5

# Giải quyết xung đột (Conflict Resolution)
git status -s                  # Tìm file có mã UU (Both modified)
# Mở file xóa các thẻ <<<<<<< HEAD, =======, >>>>>>>
git add <resolved-file>
git rebase --continue          # Nếu đang rebase
git commit -m "merge: resolve conflict" # Nếu đang merge
git merge --abort              # Thoát hiểm hủy bỏ merge

# Trích lọc commit đơn lẻ (Cherry-Pick)
git cherry-pick -x <commit-hash> # -x: tự động thêm chú thích nguồn gốc

# Git Submodules (Quản lý repo lồng nhau)
git submodule add https://github.com/org/lib.git libs/lib
git submodule update --init --recursive
git submodule update --remote --merge

# Git LFS (Large File Storage)
git lfs track "*.psd" "*.onnx" "*.mp4"
git add .gitattributes
```

---

## 9. Từ Điển Thuật Ngữ & Best Practices (Glossary & Hygiene)

### Quy Chuẩn Đặt Tên Commit (Conventional Commits)
$$\text{<type>[(scope)]: <subject>}$$
- `feat`: Tính năng mới cho người dùng.
- `fix`: Sửa lỗi phần mềm.
- `docs`: Chỉnh sửa tài liệu.
- `style`: Định dạng code (khoảng trắng, dấu chấm phẩy, không đổi logic).
- `refactor`: Cơ cấu lại code (không thêm tính năng, không sửa bug).
- `perf`: Tối ưu hóa hiệu năng.
- `test`: Thêm hoặc sửa unit tests.
- `chore`: Cập nhật cấu hình build, dependencies, tooling.

### So Sánh 3 Mô Hình Nhánh Dự Án
1. **GitHub Flow**: Cực kỳ tinh gọn; duy nhất nhánh `main` luôn sẵn sàng deploy; tạo feature branch ngắn hạn, mở PR, review, merge và deploy ngay lập tức. Phù hợp SaaS/Web.
2. **Git Flow**: Chặt chẽ; gồm `main`, `develop`, `feature/*`, `release/*`, `hotfix/*`. Phù hợp phần mềm phát hành theo đợt cố định (Mobile Apps, Game).
3. **Trunk-Based Development**: Các kỹ sư commit liên tục vào nhánh `main` (hoặc nhánh con sống dưới 1 ngày), sử dụng **Feature Flags** để ẩn các tính năng chưa hoàn thiện trên Production.
