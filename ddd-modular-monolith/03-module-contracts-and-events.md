# 03. Contract, event và ownership dữ liệu

## Public contract nhỏ

Module khác chỉ gọi API công khai hoặc nhận DTO/event được công bố. Billing nhận snapshot `{orderId, amountMinor, currency}`, không nhận EF entity có navigation property và không sửa bảng của Ordering.

Namespace giúp tổ chức, không cưỡng chế toàn bộ dependency. Có thể dùng assembly riêng, `internal`, architecture test hoặc DB role để enforce ở lớp tương ứng. “Schema riêng” với cùng DB user có toàn quyền chưa tạo security isolation.

Query xuyên module cần quyết định: gọi API chủ sở hữu, dùng read model/projection, hoặc dùng reporting view có contract riêng. Không lén JOIN bảng private rồi tuyên bố hai module độc lập.

## Gọi đồng bộ hay event?

| Nhu cầu | Hướng thường hợp lý |
| --- | --- |
| Cần câu trả lời tức thì trong cùng process | Lời gọi contract đồng bộ, lifecycle rõ. |
| Cần thông báo một fact đã commit | Integration event với outbox nếu phải bền vững. |
| Cần model đọc phục vụ màn hình | Projection, chấp nhận/định nghĩa độ trễ. |
| Cần atomicity cùng DB | Coordinator/unit of work rõ ownership, không giả atomic qua HTTP. |

Không dùng broker để thay một lời gọi hàm đơn giản khi chưa có yêu cầu bền vững hoặc tách biệt. Ngược lại, event trong memory không thay thế outbox khi process có thể chết.

## Domain event và integration event

Domain event diễn đạt sự kiện trong mô hình nội bộ. Integration event là contract cho bên khác, cần payload và version ổn định hơn. Không serialize nguyên entity nội bộ rồi công bố thành event.

Nếu handler chạy trước commit và cùng transaction DB, thay đổi của nó có thể atomic với use case. Gửi email hoặc gọi provider trong handler vẫn là tác động bên ngoài không rollback được. Chỉ publish sau commit trong memory cũng có cửa sổ process chết làm mất sự kiện; outbox giải quyết cửa sổ ghi DB/publish, không tự tạo exactly-once delivery.

## Lab đặt ranh giới ở đâu?

`Ordering.Order.Confirm` xuất `Contracts.OrderConfirmed`; `BillingModule.CreateDraft` đọc contract đó và tạo draft thuần dữ liệu. Cả hai ở cùng assembly để chạy một file, nên code không chứng minh module isolation ở mức compiler. Draft chưa được lưu hoặc gửi cho provider.
