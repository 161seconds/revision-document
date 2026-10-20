# 01. HTTP, tài nguyên và DTO

## Bắt đầu bằng hành vi

Ví dụ contract: `GET /api/v1/orders` trả danh sách theo `id` tăng dần. Không có đơn là `200` với `items: []`; một resource cụ thể không tồn tại thường là `404`. Không dùng `404` cho collection rỗng nếu contract đã quy định như ví dụ này.

GET là safe theo nghĩa client không yêu cầu thay đổi trạng thái nghiệp vụ; server vẫn có thể ghi log. PUT và DELETE có ngữ nghĩa idempotent về tác động dự định, không có nghĩa mọi lần gọi trả cùng status. POST không được HTTP bảo đảm idempotent; cần contract riêng khi dùng idempotency key.

| Tình huống | Lựa chọn thường dùng |
| --- | --- |
| Tạo resource xong | `201 Created`, `Location` chỉ resource mới. |
| Chấp nhận xử lý nền | `202 Accepted`, có cách theo dõi kết quả. |
| Thành công không có body | `204 No Content`; không gửi JSON giả kèm theo. |
| Input sai | `400` hoặc `422` theo contract đã thống nhất. |
| Chưa có credential hợp lệ | `401`, challenge phù hợp scheme. |
| Không có quyền | `403`; có thể dùng `404` theo chính sách tránh tiết lộ tồn tại. |
| Xung đột trạng thái hiện tại | `409`; precondition không đạt dùng `412`. |

Đây là lựa chọn theo ngữ nghĩa, không phải bảng thay thế mọi quy tắc RFC 9110.

## DTO là giao diện công khai

Không trả thẳng entity ORM. Chọn rõ các field được công khai, định dạng ngày giờ, enum, số tiền và nullable. ID là chuỗi opaque khi client không cần tính toán; lab dùng integer để dễ nhìn keyset.

Tiền nên có currency và biểu diễn đã thống nhất, chẳng hạn số nguyên minor unit với quy tắc theo từng currency. Không giả định mọi currency có hai chữ số thập phân. Ngày giờ là instant có offset hay ngày địa phương phải ghi rõ; tránh một `string` không nêu format.

Contract còn gồm lỗi và độ nhất quán: một GET ngay sau POST có nhìn thấy dữ liệu mới không? Nếu đọc replica có độ trễ, ghi rõ mô hình và cách client kiểm tra trạng thái.

## Bài tập

Một DELETE lần đầu trả `204`, lần sau `404`: có tự động vi phạm idempotency không? Không; tác động dự định vẫn là resource không còn tồn tại. Một POST trả `202` có chứng minh thanh toán thành công không? Không; nó mới chấp nhận xử lý.
