# 03. Problem Details và bảo mật

## Một lỗi có cấu trúc ổn định

RFC 9457 định nghĩa `application/problem+json`. Các field chuẩn gồm `type`, `title`, `status`, `detail`, `instance`; chúng không phải tất cả đều bắt buộc trong mọi payload. `type` xác định loại lỗi, mặc định `about:blank` khi vắng mặt. `status` trong body cần khớp HTTP status khi server phát sinh response.

```json
{
  "type": "urn:revision-document:problem:invalid-query",
  "title": "Invalid query",
  "status": 400,
  "detail": "limit must be 1..100; after must be non-negative; status must be known."
}
```

Client dựa vào HTTP status và `type` hoặc extension code đã công bố; không parse câu chữ của `detail`. Lỗi field có thể thêm extension như `errors`; phải mô tả schema của extension. `instance` dùng để chỉ lần xảy ra, không nên chứa token hoặc dữ liệu riêng tư.

Trong ASP.NET Core, `AddProblemDetails` hỗ trợ tạo response có cấu trúc và `UseExceptionHandler` xử lý lỗi chưa bắt. Vẫn cần kiểm tra response thực tế của validation, auth và lỗi routing: middleware không tự chuẩn hóa mọi đường đi trong mọi cấu hình.

## Lỗi không phải kênh debug công khai

Không trả stack trace, SQL, connection string hoặc toàn bộ request nhạy cảm cho client. Log phía server dùng correlation/trace ID và redaction. Error message ngắn không thay cho việc xử lý lỗi đúng; không biến lỗi ghi DB thành `200` để client tưởng đã lưu.

Authorization kiểm tra resource, ownership và tenant, không chỉ kiểm tra “đã login”. CORS không thay thế authentication. Với cookie auth, cần chính sách CSRF phù hợp cho request thay đổi trạng thái.

## Bài tập

Client nhận `400` và `detail` đã được dịch sang tiếng Việt. Có nên hỏng parser không? Không; parser phải dùng field máy đọc ổn định. Có nên trả lỗi `Order 42 belongs to customer X` cho người lạ không? Không; thông điệp đó làm lộ ownership.

Lab chỉ đọc dữ liệu giả không có auth. Muốn áp dụng vào sản phẩm phải thêm kiểm thử ở [tài liệu security](../security/README.md).
