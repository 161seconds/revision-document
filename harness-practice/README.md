# Harness thực chiến cho coding agent

Harness là môi trường giúp agent làm việc có giới hạn: hướng dẫn, tool, vòng lặp thực hiện, kiểm tra, nhật ký và quyền hành động. Một tập `SKILL.md` là một phần của harness, không tự tạo ra sandbox, scheduler hoặc evaluator đáng tin cậy.

Bộ này hướng dẫn sử dụng [6 skill đã nhập](../HARNESS.md) trong một task sửa lỗi thực tế. Không cần đăng ký API, dựng server hoặc cài thêm package cho lab offline.

## Lộ trình

| Bài | Kết quả |
| --- | --- |
| [01. Chọn skill và khóa phạm vi](01-routing-and-scope.md) | Viết một task có đầu ra, vùng được sửa và quyền rõ ràng. |
| [02. Debug, test và xác minh](02-debug-test-verify.md) | Thu bằng chứng RED/GREEN, kiểm tra diff và báo đúng phần đã chạy. |
| [03. Tool và đánh giá](03-tools-and-evaluation.md) | Thiết kế tool dễ dùng; phân biệt heuristic với đánh giá kết quả thật. |
| [04. Context và bàn giao](04-context-and-handoff.md) | Tiếp tục phiên dài mà không mất quyết định hoặc trạng thái kiểm thử. |
| [05. Lab sửa JSON generator](05-lab.md) | Tái hiện một lỗi, sửa trong worktree riêng, chạy test rồi review. |

Tra nhanh: [summary.md](summary.md). Nguồn: [sources.md](sources.md).

## Bắt đầu trong 10 phút

Đọc bài 01, chạy baseline của bài 05, sau đó dùng prompt ở bài 02. Với task ngắn, thường chỉ cần `systematic-debugging` và `verification-before-completion`; thêm skill khi có vấn đề tương ứng.

Lab cần Git và Python 3.10+. Ví dụ lệnh dùng PowerShell và RTK; nếu không có RTK, bỏ tiền tố `rtk proxy` hoặc `rtk`.

## Giới hạn bằng chứng

Lab kiểm tra script Python bằng `unittest`. Nó không đo chất lượng một model, mức tiết kiệm token, khả năng chống prompt injection hoặc hiệu quả của agent chạy tự động. Host quyết định cách nhận diện skill; cú pháp `$skill-name` không bảo đảm mọi editor đều hỗ trợ.
