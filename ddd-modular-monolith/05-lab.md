# 05. Lab Ordering–Billing

## Chạy

[Orders.cs](lab/Orders.cs) chạy bằng .NET SDK 10+, không có package:

```powershell
rtk proxy dotnet run --file ddd-modular-monolith/lab/Orders.cs --configuration Release
```

Lab có ba namespace: `Ordering` quản lý order; `Contracts` chứa snapshot; `Billing` tạo invoice draft từ snapshot. Namespace ở đây phục vụ bài học, không tạo enforce giữa assembly.

## Rule và đầu ra

- Order có ID hợp lệ, currency thuộc USD/VND của fixture.
- Dòng hàng có product ID, số lượng và đơn giá dương.
- Tổng dùng minor unit và checked arithmetic; thao tác bị từ chối không làm thay đổi một phần tổng.
- Order rỗng không confirm; order đã confirm không thêm dòng hoặc confirm lần nữa theo contract lab.
- Billing kiểm tra snapshot đầu vào, dùng amount/currency đã chốt, không truy cập internals của Order.

Fixture có hai dòng `2 × 1500` và `1 × 3000`, tổng `6000 USD minor units`. Giá là dữ liệu tin cậy của bài thử, không phải giá client tùy ý gửi vào API.

## Giới hạn có chủ đích

Aggregate chỉ giữ tổng, không lưu line item hoặc lịch sử thay đổi. Invoice chỉ là draft thuần dữ liệu, không persist hoặc gọi thanh toán. Có validation ở boundary nhưng không có auth/tenant, concurrency, transaction DB, outbox hoặc durable deduplication.

Muốn dùng trong sản phẩm, mô hình hóa line/price/tax và lưu trữ theo nghiệp vụ thật; tách assembly khi cần enforce dependency. Không coi việc thêm project tự nó làm kiến trúc tốt hơn.

## Bài tập và đáp án

Bằng chứng ngày 2026-10-20: baseline thiếu phép tính tổng bị RED tại `Confirmed snapshot must preserve total and identity`. Sau triển khai invariant, lệnh Release đạt **17 aggregate/module checks**, gồm overflow và snapshot không hợp lệ. Chưa đo coverage hoặc kiểm tra compiler isolation giữa assembly.

1. Billing có nên đọc `Order` mutable trực tiếp? Ưu tiên snapshot/contract nhỏ để không phụ thuộc mô hình thay đổi nội bộ.
2. Confirm lại nên trả lỗi hay trả snapshot cũ? Cả hai có thể hợp lý; lab chọn lỗi. API muốn retry idempotent cần contract và persistence phù hợp.
3. Một order có 100.000 dòng thì sao? Aggregate/load strategy phải xem lại; không chỉ đổi `List` thành `IEnumerable` rồi coi đã giải quyết.
4. Hai request confirm cùng một order có được lab bảo vệ không? Không; self-check chỉ chứng minh invariant một instance, cần concurrency control ở persistence.
