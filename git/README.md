# Git Revision Guide

Lộ trình và tài liệu ôn tập Git Version Control toàn diện từ kiến trúc nội tại, quy trình làm việc nhóm đến kỹ thuật phục hồi dữ liệu chuyên sâu.

## Danh Mục Chủ Đề

| Thư mục | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| [summary.md](file:///d:/my-project/revision-document/git/summary.md) | Bảng tóm tắt toàn diện (Cheat Sheet) một file bao quát 46 chủ đề W3Schools | Hoàn thành |
| [01-basics-and-architecture/](file:///d:/my-project/revision-document/git/01-basics-and-architecture/README.md) | Kiến trúc 3 cây (Working Tree, Index, HEAD), 4 Objects (`blob`, `tree`, `commit`, `tag`), Lệnh cơ bản, Staging, Phân nhánh, Stash, Tagging, `.gitignore`, `.gitattributes` | Hoàn thành |
| [02-remotes-and-collaboration/](file:///d:/my-project/revision-document/git/02-remotes-and-collaboration/README.md) | Máy chủ từ xa, SSH Ed25519 vs HTTPS PAT, Tracking branch (`-u`), `fetch` vs `pull`, `pull --rebase`, `push --force-with-lease`, Fork & Upstream, Shallow Clone (`--depth 1`), GitHub Flow | Hoàn thành |
| [03-undo-and-history-recovery/](file:///d:/my-project/revision-document/git/03-undo-and-history-recovery/README.md) | Hoàn tác an toàn `commit --amend`, Forward undo `git revert`, Hoàn tác merge commit (`revert -m 1`), Ma trận Reset (`--soft`, `--mixed`, `--hard`), `git restore`, Cứu hộ dữ liệu khẩn cấp qua `git reflog` | Hoàn thành |
| [04-advanced-and-enterprise/](file:///d:/my-project/revision-document/git/04-advanced-and-enterprise/README.md) | Tuyến tính hóa lịch sử `git rebase`, Interactive Rebase & `--autosquash`, Giải quyết xung đột 3-way, `git merge --abort`, Tự động hóa `git rerere`, `git cherry-pick -x`, Client/Server Git Hooks, Submodules, Git LFS, Ký số GPG/SSH | Hoàn thành |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con
Mỗi thư mục con đều bao gồm:
1. `README.md`: Lý thuyết cô đọng + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn.
2. File code thực hành: Các file `.js` minh họa kiểm chứng thực tế qua `child_process`.
3. `practice.js`: Bài tập thử thách tự chạy bằng `node practice.js` để kiểm tra kết quả trên repository tạm cô lập.
