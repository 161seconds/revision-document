# 01. Chọn skill và khóa phạm vi

## Một task tốt có gì?

Viết kết quả người dùng cần trước, sau đó mới chọn skill. Ví dụ: “Thông báo lỗi luôn là JSON hợp lệ khi ID chứa dấu nháy hoặc xuống dòng” có thể kiểm thử; “cải thiện toàn bộ tool” chưa có điểm dừng.

```text
Mục tiêu: ErrorMessageGenerator.generate trả JSON hợp lệ với Unicode,
dấu nháy, backslash và xuống dòng; thiếu placeholder vẫn báo lỗi.
Phạm vi: script description_generator.py và test tương ứng.
Giữ nguyên: tên class, method, template, key của JSON, hành vi fallback.
Nghiệm thu: test tái hiện lỗi, bản sửa tối thiểu, test hồi quy đạt.
Quyền: sửa và chạy test trong worktree lab; không commit/push/deploy.
```

Phần “Quyền” là ví dụ cho lab. Khi người dùng đã cấp quyền commit/push cho task thật, ghi đúng quyền đó; không hỏi lại một bước đã được cho phép.

## Bảng chọn nhanh

| Tình huống | Skill |
| --- | --- |
| Chưa biết vì sao test lỗi | `$systematic-debugging` |
| Sắp báo xong hoặc commit | `$verification-before-completion` |
| Phiên dài, cần chuyển người hoặc phiên | `$context-compression` |
| Tool khó chọn hoặc lỗi không chỉ cách sửa | `$tool-design` |
| Cần so sánh hai phiên bản agent | `$evaluation` |
| Cần thiết kế cả vòng lặp tự động | `$harness-engineering` |

Đường dẫn và trigger cụ thể nằm trong [HARNESS.md](../HARNESS.md). Dùng đúng tool name mà host cung cấp, không tự đổi namespace. `AGENTS.md` ghi cách định tuyến; việc đọc file không tự kích hoạt mọi skill hoặc tạo quyền hệ điều hành.

## Vùng được sửa và vùng kiểm tra

Đặt acceptance criteria, test quan trọng và dataset đánh giá vào vùng cần review riêng. Nếu agent có thể xóa test để “đạt”, điểm số không còn đo đúng mục tiêu. Khóa trong prompt chỉ là quy ước; muốn cưỡng chế phải dùng permission, sandbox hoặc CI do bên ngoài quản lý.

Không cần thêm subagent cho một lỗi ba dòng. Chỉ chia việc khi có các phần độc lập, đầu ra kiểm tra được và chi phí phối hợp hợp lý.

## Tự kiểm tra

Một agent được phép sửa code và chạy test có mặc nhiên được push không? Không. Quyền đến từ task và host, không từ tên skill. Một test đạt sau khi agent xóa assertion có đáp ứng nghiệm thu không? Không; phải review cả diff của test.
