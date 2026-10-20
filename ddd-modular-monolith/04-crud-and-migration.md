# 04. Khi CRUD đủ và cách refactor dần

## Đừng áp cả bộ cho mọi màn hình

CRUD phù hợp với dữ liệu tham chiếu ít rule, chi phí thay đổi thấp và workflow đơn giản. Một application service, query rõ ràng và constraint DB có thể đủ. DDD hữu ích hơn ở phần nhiều invariant, lifecycle và ngôn ngữ nghiệp vụ cần phối hợp.

CQRS chỉ là tách trách nhiệm đọc/ghi theo mô hình phù hợp. Không mặc định cần hai DB, event sourcing, MediatR hoặc nhiều process. Vertical Slice có thể tổ chức code theo use case bên trong các ranh giới đã chọn.

## Refactor một feature

1. Chọn một use case có lỗi/cost rõ, chẳng hạn cancel order.
2. Ghi route, payload, auth, status và dữ liệu phải giữ; thêm characterization test.
3. Vẽ context và transaction boundary hiện tại; đánh dấu writer khác có thể tranh chấp.
4. Đưa rule vào một điểm quản lý phù hợp, thay một đường gọi trước.
5. Chạy contract/integration test, đo hành vi và migrate writer còn lại.
6. Chỉ xóa compatibility path sau khi đã chứng minh caller không dùng hoặc hết thời hạn hỗ trợ.

Không vừa đổi kiến trúc, endpoint, database và cơ chế auth nếu không cần cho mục tiêu. “Code sạch hơn” không bù được việc client đang hoạt động bị hỏng.

## ADR ngắn

```text
Bối cảnh: hủy và ship cùng sửa Order, từng xảy ra stale write.
Quyết định: Ordering sở hữu lifecycle; mọi writer dùng conditional update.
Contract: API hiện tại giữ nguyên; Billing nhận snapshot/version rõ ràng.
Trade-off: chưa tách process; reporting cần read contract được công bố.
Kiểm chứng: test transition, HTTP contract, race trên PostgreSQL.
Xem lại khi: module có team/lifecycle độc lập hoặc có yêu cầu scale riêng.
```

ADR ghi cả chi phí và điều kiện xem lại, không chỉ tên pattern. Microservice chỉ nên xuất hiện khi có lý do triển khai/vận hành đủ mạnh để trả chi phí phân tán.
