# Tra nhanh: Harness thực chiến

| Cần làm | Điểm bắt đầu |
| --- | --- |
| Sửa bug chưa rõ nguyên nhân | `$systematic-debugging`: tái hiện, giả thuyết, phép kiểm tra, sửa gốc. |
| Báo xong/commit | `$verification-before-completion`: chạy mới, đọc output, so với nghiệm thu. |
| Bàn giao phiên | `$context-compression`: trạng thái, quyền, quyết định, bằng chứng, bước tiếp theo. |
| Review tool | `$tool-design`: trigger, schema, output, lỗi, tên tool đúng host. |
| So sánh agent | `$evaluation`: baseline, held-out cases, chi phí trên task thành công. |
| Thiết kế vòng lặp tự động | `$harness-engineering`: vùng sửa, evaluator cố định, budget, log, rollback. |

Một task cần mục tiêu đo được, contract phải giữ, vùng được sửa và quyền hành động. Skill không tự tạo quyền, sandbox hoặc bằng chứng. Test của code không phải benchmark model. Đọc [lab](05-lab.md) để thực hành toàn quy trình.
