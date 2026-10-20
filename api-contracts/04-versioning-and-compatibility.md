# 04. Versioning, OpenAPI và compatibility

## Breaking change rộng hơn xóa field

| Thay đổi | Rủi ro |
| --- | --- |
| `id` từ number sang string | Client deserialize có thể lỗi. |
| Request optional thành required | Client cũ không gửi field sẽ bị từ chối. |
| Response nullable thành không nullable | Cần xét cả dữ liệu thực và schema; chiều compatibility của request khác response. |
| Thêm giá trị enum response | Client có switch exhaustive hoặc enum đóng có thể hỏng. |
| Đổi default sort/page size | JSON vẫn hợp schema nhưng hành vi client thay đổi. |
| Thêm field response | Thường tương thích với reader linh hoạt, nhưng client/schema strict có thể từ chối. |

Không kết luận “additive luôn an toàn”. Ghi rõ loại client đang hỗ trợ và chính sách với unknown field/enum.

## Quản lý schema

OpenAPI mô tả operations, parameter, request/response và security scheme. OpenAPI 3.1 dùng JSON Schema cho schema objects; cần chọn công cụ hỗ trợ đúng phiên bản. Khai báo security trong tài liệu không tự thực thi authorization trên server.

Quy trình tối thiểu:

1. Giữ một baseline spec của phiên bản đã phát hành.
2. Xuất spec từ bản build mới hoặc cập nhật spec-first cùng implementation.
3. So sánh thay đổi schema và review thay đổi ngữ nghĩa.
4. Chạy contract test trên payload thực, bao gồm lỗi và giá trị biên.
5. Rollout với client cũ còn hoạt động; quan sát trước khi xóa compatibility path.

Spec diff không thấy được việc `total` đổi từ tổng toàn bộ sang tổng trang. Contract test cũng chỉ kiểm tra các case đã viết. Cần cả schema review và các ví dụ hành vi mà client phụ thuộc.

## Version và ngừng hỗ trợ

Lab dùng `/api/v1` để dễ thử. URL, header hay media type đều có trade-off; không đổi chiến lược chỉ vì template khác. Có lịch hỗ trợ, đo client còn dùng, thông báo deprecation và thời điểm sunset trước khi gỡ phiên bản.

Một deployment backend mới không nhất thiết cần `v2`. Thay đổi tương thích có thể ở cùng version; thay đổi không tương thích cần migration plan hoặc version mới. Không ép frontend cập nhật tức thì nếu hệ thống còn mobile/offline client.
