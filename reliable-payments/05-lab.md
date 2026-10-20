# 05. Lab webhook, inbox và outbox trên PostgreSQL

## Chạy và môi trường

[Payments.cs](lab/Payments.cs) cần .NET SDK 10+, Npgsql 10.0.3 và DB từ [compose concurrency](../postgresql-concurrency/lab/compose.yaml):

```powershell
rtk proxy docker compose -f postgresql-concurrency/lab/compose.yaml up -d --wait
rtk proxy dotnet run --file reliable-payments/lab/Payments.cs --configuration Release
```

Script chỉ chấp nhận loopback, port `55432` và DB `revision_lab`. Nó tạo/xóa schema ngẫu nhiên, không dùng bảng của lab khác. Password compose là fixture công khai cho local; không có credential provider.

## Cấu trúc bài thử

| Thành phần | Vai trò |
| --- | --- |
| `orders`, `payments` | Số tiền/currency kỳ vọng và mapping provider reference do server tạo. |
| `inbox` | Deduplicate provider/event ID, phát hiện reuse với financial field khác. |
| `outbox` | Ghi `order.paid` atomic với chuyển trạng thái. |
| `consumed_messages`, `fulfilments` | Checkpoint consumer và side effect DB cùng transaction. |

Secret ngẫu nhiên chỉ tồn tại trong process. Lab ký `timestamp + '.' + raw body` bằng HMAC-SHA256, so sánh constant-time và chấp nhận timestamp trong ±300 giây quanh đồng hồ fixture. Đây là protocol giả để kiểm tra boundary, không phải triển khai Stripe signature header.

JSON dùng source generation để chạy trong file-based app .NET 10 mà không phụ thuộc reflection serializer. Fingerprint tính từ các field của `PaymentEvent` đã validate, nên whitespace khác không làm event hợp lệ thành conflict.

## Các nhóm kiểm tra

1. Body bị đổi, chữ ký sai kích thước, timestamp cũ/tương lai bị từ chối; body quá lớn và JSON hỏng không vào nghiệp vụ.
2. Event ID/type/currency không hỗ trợ, amount sai, reference lạ hoặc order không khớp không được ghi paid.
3. Failpoint trước commit rollback order, inbox và outbox cùng nhau.
4. Hai event ID khác nhau chạy cạnh tranh chỉ có một transition paid và một outbox.
5. Replay cùng ID được deduplicate; reuse cùng ID cho order khác bị từ chối.
6. Consumer commit xong nhưng publisher chưa checkpoint: retry cùng message không tạo fulfilment lần hai.
7. Consumer từ chối cùng message ID nhưng order khác và input ID rỗng.

Ngày **2026-10-20**: baseline chưa xác minh callback bị RED tại `Expected UnauthorizedAccessException`. Sau triển khai, lệnh Release đạt **28 payment/inbox/outbox checks**. Lỗi JSON reflection lúc chuẩn bị harness được xử lý riêng, không tính làm RED nghiệp vụ.

## Những điều lab chưa chứng minh

Không có HTTP endpoint, broker, provider thật, refund/dispute, multi-currency, nhiều payment attempt, lease nhiều publisher hoặc process kill thật. Producer và consumer dùng cùng DB engine/schema lab nhưng transaction/connection riêng; side effect consumer là hàng DB, không phải email/chuyển tiền bên ngoài.

Failpoint chỉ mô phỏng vị trí crash giữa các bước đã commit. Muốn chứng minh process recovery thật, thêm worker bền vững và test kill/restart với cùng DB, queue và operation identity.

## Bài tập

- Mark sent trước khi deliver rồi gây lỗi: chỉ ra vì sao pending queue có thể mất message.
- Gỡ unique inbox hoặc điều kiện transition: test nào phát hiện effect bị lặp?
- Thêm refund: viết state machine và test event đến trễ trước khi sửa handler.
- Thêm worker nhiều instance: thiết kế lease/claim và test stale worker, không chỉ thêm `SKIP LOCKED` vào một query.

Dọn DB lab theo [hướng dẫn concurrency](../postgresql-concurrency/05-lab.md); `down --volumes` làm mất toàn bộ dữ liệu của project compose lab.
