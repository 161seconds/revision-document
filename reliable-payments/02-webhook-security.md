# 02. Nhận webhook đúng cách

## Trình tự xử lý

1. Giới hạn kích thước request, chọn đúng endpoint/provider/account và lấy raw body.
2. Dùng SDK hoặc quy trình xác minh chính thức của provider: header format, thuật toán, timestamp và tolerance theo policy.
3. Chỉ sau xác minh mới parse/validate schema và loại event cần xử lý.
4. Đối chiếu provider reference với payment attempt do server tạo; kiểm tra environment/account, amount, currency và trạng thái hợp lệ.
5. Lưu durable acceptance hoặc hoàn thành transaction cục bộ trước khi trả acknowledgement thành công.

Không parse rồi serialize lại body để tính chữ ký. Whitespace, encoding hoặc thứ tự field có thể đổi signature dù JSON mang cùng ý nghĩa. So sánh MAC bằng primitive constant-time do platform/SDK cung cấp; không dùng so sánh string tự viết cho secret.

## Chữ ký hợp lệ chưa đủ

Một event được ký vẫn có thể là retry, event cũ, event của test mode/account khác hoặc có reference không thuộc hệ thống này. Đối chiếu dữ liệu server-side và không lấy giá từ redirect/browser làm nguồn chuẩn.

Return URL chỉ là tín hiệu để hiển thị/kiểm tra trạng thái. Không đánh dấu paid vì client gửi `success=true`. Với yêu cầu độ chắc chắn cao hoặc event không đủ thông tin, truy vấn API provider bằng credential server và đối soát theo reference.

Secret nằm ở server, log có redaction, rotation theo quy trình provider. Chỉ lưu field cần cho kiểm toán/recovery, có retention và kiểm soát truy cập; không log toàn payload nhạy cảm để tiện debug.

## Ack và xử lý nền

Một handler đồng bộ có thể validate và commit order/inbox/outbox trước `2xx`. Một receiver bất đồng bộ có thể lưu event đã xác thực vào inbox bền vững rồi ack; worker xử lý rule sau đó. Trong mô hình thứ hai, cần processing status, retry và dead-letter để event đã ack không bị mất âm thầm.

Không ack ngay rồi chỉ xếp việc vào memory. Không trả `500` mãi cho một lỗi nghiệp vụ cố định mà không có policy quarantine/điều tra. Mã phản hồi và retry behavior phải theo contract provider.

## Replay nội bộ

Replay event đã lưu là hành động có quyền, audit và giữ event/operation ID. Timestamp/signature cũ có thể hết hạn; dùng đường reprocess nội bộ có kiểm soát, không tắt signature check trên public endpoint để replay cho tiện.

Lab sử dụng HMAC fixture và đồng hồ cố định cho bài kiểm tra, không thay thế SDK xác minh của Stripe hoặc provider thật.
