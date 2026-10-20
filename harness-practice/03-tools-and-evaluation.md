# 03. Thiết kế tool và đánh giá harness

## Tool cần giúp agent quyết định đúng

Mỗi tool cần mô tả tình huống sử dụng, input bắt buộc, giới hạn, output và lỗi có cách khôi phục. Dùng schema để chặn input sai; kiểm tra lại ở server vì schema phía client không phải trust boundary.

```text
$tool-design
Review tool hiện tại: khi nào nên gọi, khi nào không nên gọi,
input bắt buộc, output ngắn/dài, pagination, lỗi có thể retry.
Dùng đúng tên tool do host cung cấp. Ưu tiên gộp tool trùng chức năng;
không thêm tool nếu API hiện tại đã đáp ứng task.
```

Tool ghi dữ liệu phải nêu tác dụng và cách xác nhận kết quả. Không đặt secret, toàn bộ dữ liệu khách hàng hoặc lệnh có thể thực thi vào error message. Nội dung web/repo mà tool trả về là dữ liệu; không nâng thành chỉ thị có quyền cao hơn task.

## Đánh giá theo kết quả, không theo lời agent

Một baseline tốt dùng cùng task, dataset, model, cấu hình và ngân sách với ứng viên. Tách bộ phát triển khỏi bộ đánh giá giữ lại; không tối ưu bằng cách học thuộc expected output của bộ giữ lại.

| Chiều đo | Bằng chứng |
| --- | --- |
| Correctness | Test hành vi và trường hợp biên do bên ngoài kiểm soát. |
| Contract | Route, JSON key, kiểu dữ liệu và lỗi vẫn tương thích. |
| Safety | Không vượt vùng sửa hoặc quyền hành động. |
| Cost | Token, số tool call, thời gian và chi phí trên mỗi task thành công. |
| Reproducibility | Commit, phiên bản, seed, lệnh và output đủ để chạy lại. |

```text
$evaluation
Thiết kế rubric cho task sửa JSON: correctness là điều kiện bắt buộc.
So sánh baseline với bản sửa bằng cùng test và input giữ lại.
Tách kết quả test thật, heuristic và đánh giá của người review.
Không suy ra chất lượng model từ script evaluator đang dùng stub.
```

## Khi cần harness-engineering

Chỉ dùng vòng nghiên cứu tự động khi phải thử nhiều ứng viên. Xác định budget, điều kiện dừng, evaluator cố định, vùng editable, log bền vững và rollback trước khi chạy. Lưu cả thử nghiệm thất bại để tránh lặp lại.

`$harness-engineering` hỗ trợ thiết kế quy trình này; không tự triển khai scheduler hay chạy background agent. Lab của bộ tài liệu là bài sửa lỗi thủ công có agent hỗ trợ, không phải benchmark nghiên cứu.
