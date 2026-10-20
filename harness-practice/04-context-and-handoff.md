# 04. Context và bàn giao

## Giữ trạng thái, bỏ lời kể

Khi phiên dài, giữ mục tiêu, quyền, quyết định, file đã đổi, bằng chứng và bước tiếp theo. Không cần giữ toàn bộ output build lặp lại. Đường dẫn, symbol, mã lỗi, branch và SHA phải nguyên vẹn.

```text
$context-compression
Tạo handoff ngắn: mục tiêu; quyền đã cấp; branch/HEAD; file đã đổi;
quyết định và lý do; lệnh đã chạy, exit code; phần chưa kiểm tra;
lỗi đang chặn; một bước tiếp theo có thể thực hiện.
Không đưa secret vào handoff. Phân biệt sự thật, giả thuyết và đề xuất.
```

## Mẫu bàn giao

```text
Mục tiêu: JSON hợp lệ, giữ nguyên các trường và ký tự đầu vào.
Phạm vi/quyền: worktree lab; sửa script và test; không push.
Branch/HEAD: lấy từ git status và git rev-parse HEAD khi bàn giao.
Thay đổi: đường dẫn + mô tả ngắn; chưa có commit nếu chưa tạo.
Bằng chứng: lệnh thực chạy, exit code, số test, thời điểm.
Giới hạn: chưa benchmark agent/model; chưa kiểm tra host khác.
Việc tiếp theo: review diff rồi xử lý đúng quyền task.
```

Đây là mẫu, không phải log một lần chạy. Không chép số test hoặc SHA từ tài liệu vào báo cáo như bằng chứng mới.

## Tiếp tục sau handoff

Đọc `git status`, diff và output kiểm tra hiện tại. Nếu HEAD hoặc file đã thay đổi, chạy lại kiểm tra liên quan trước khi kết luận. Handoff cũ hữu ích để tìm đúng chỗ, nhưng không chứng minh trạng thái hiện tại.

Không để bước tiếp theo mặc định là “commit/push”. Nhiều task chỉ cho audit; task khác đã cho phép phát hành. Luôn giữ quyền chính xác trong bản tóm tắt.
