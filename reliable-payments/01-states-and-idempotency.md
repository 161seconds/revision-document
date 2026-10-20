# 01. Trạng thái payment và idempotency

## Tách ý nghĩa nghiệp vụ

Order là cam kết mua; payment attempt là một lần thử thu; authorization, capture, refund và dispute là các fact khác nhau. Một order có thể có nhiều attempt thất bại trước lần thành công. Đừng dùng một boolean `isPaid` để thay toàn bộ lịch sử tài chính.

Vẽ transition cùng người hiểu nghiệp vụ: trạng thái nào được xem là đã thu, số tiền/currency nào được chấp nhận, có partial capture không, refund tác động thế nào và fulfillment được phép bắt đầu khi nào. Không dựa vào thứ tự webhook để tự suy ra state machine.

## Request idempotency

Một operation thay đổi tiền cần ID ổn định qua retry. Phạm vi khóa thường gồm tenant/account, loại thao tác và idempotency key. Lưu fingerprint các field có ý nghĩa nghiệp vụ để cùng key nhưng số tiền khác không bị coi là retry hợp lệ.

| Tình huống | Hành vi cần định nghĩa |
| --- | --- |
| Key mới | Tạo operation và bắt đầu xử lý theo policy. |
| Cùng key, cùng fingerprint, đã hoàn tất | Trả lại kết quả đã lưu hoặc trạng thái hiện tại theo contract. |
| Cùng key, payload khác | Trả conflict; không tạo thao tác tiền mới. |
| Cùng key đang xử lý | Trả pending/conflict hoặc chờ có giới hạn; không chạy provider call lần hai tùy ý. |
| Timeout quanh provider call | Ghi nhận chưa biết, retry cùng provider key hoặc truy vấn/đối soát. |

Fingerprint theo dữ liệu đã chuẩn hóa, không theo raw JSON có thể khác whitespace/thứ tự field. Signature webhook thì ngược lại: phải kiểm tra raw bytes theo đúng provider protocol.

## Key không đủ nếu thiếu persistence

Một dictionary trong process mất khi restart và không phối hợp nhiều instance. Dùng unique constraint cho operation key, trạng thái bền vững và lifecycle rõ. Không giữ transaction DB dài xuyên qua HTTP call chỉ để “khóa key”; thiết kế claim/lease và recovery phù hợp.

Provider có thời hạn và ngữ nghĩa lưu key riêng. Không áp dụng chính sách của Stripe cho provider khác hoặc xóa inbox chỉ vì provider request key hết hạn.

## Bài tập

Provider đã thành công nhưng response bị mất. Có nên tạo key mới rồi gọi lại không? Không tùy tiện; phải giữ key/operation hoặc đối soát để tránh thu lần hai. Hai event ID khác nhau cùng báo một payment thành công có thể xảy ra không? Cần bảo vệ cả event deduplication và transition nghiệp vụ, không chỉ một unique event ID.
