# 07. Refactor từng use case, ghi lại quyết định

## Bản đồ liên kết

Áp dụng [ranh giới .NET](02-dotnet-boundaries.md), [kiểm thử](06-testing-and-enforcement.md) và [quản lý lịch sử Git](../git/03-undo-and-history-recovery/README.md).

## Bắt đầu từ một thay đổi có giá trị

Không cần chuyển toàn bộ codebase sang bốn project trong một lần. Chọn một use case khó thay đổi hoặc dễ gây lỗi, xác định contract hiện tại rồi tách một ranh giới có thể kiểm thử.

Ví dụ: logic hủy đơn đang nằm trong controller, worker cũng cần dùng lại và hai nơi xử lý trạng thái khác nhau. Giá trị cần đạt là dùng chung invariant và giữ nguyên hành vi công khai.

## Trình tự thực hiện

1. Ghi nhận route, request/response, mã lỗi, quyền truy cập, side effect và transaction của use case hiện tại.
2. Viết hoặc bổ sung test cho hành vi đang cần giữ; nêu rõ bug nào sẽ được sửa có chủ đích.
3. Tách quy tắc trạng thái vào domain object/hàm nghiệp vụ, kiểm thử trực tiếp.
4. Tạo use case điều phối và port I/O nhỏ nếu ranh giới đó cần thiết; adapter có thể gọi implementation cũ trong giai đoạn chuyển tiếp.
5. Nối driver hiện tại sang use case, giữ nguyên contract trừ thay đổi đã được chấp thuận.
6. Chạy lại test nghiệp vụ, endpoint và persistence liên quan; kiểm tra dependency mới.
7. Chỉ bỏ đường cũ khi xác nhận caller đã chuyển; giữ cách rollback phù hợp với dữ liệu và triển khai.

Strangler Fig mô tả cách thay thế dần hệ thống qua những điểm phân tách, giúp nhận giá trị và học từ từng bước. Không phải mọi lần extract method đều cần gọi là migration kiến trúc.

## Những contract dễ bỏ sót

| Contract | Ví dụ regression |
| --- | --- |
| HTTP | Đổi status, tên trường JSON hoặc cách serialize enum. |
| Authentication | Cookie hoặc token vẫn tồn tại nhưng policy mới bỏ sót một role. |
| Persistence | Đổi mapping timestamp, decimal hoặc nullability làm sai dữ liệu. |
| Transaction | Adapter mới tự commit sớm, audit/outbox không rollback cùng nghiệp vụ. |
| Integration | Đổi event payload hoặc tạo message ID mới mỗi lần retry. |
| Hiệu năng | Port mới tải toàn bộ aggregate cho một query chỉ cần vài trường. |

Với schema database, cân nhắc expand-and-contract: thêm cấu trúc tương thích, chuyển caller/dữ liệu, xác minh rồi mới loại bỏ cấu trúc cũ. Rollback code không khôi phục được cột dữ liệu đã xóa.

## ADR: một quyết định, lý do và hệ quả

ADR giúp người đọc hiểu tại sao chọn cách này thay vì phải suy đoán từ thư mục. Ví dụ dưới đây là **đề xuất cho case study**, không phải quyết định áp dụng cho mọi dự án:

```markdown
# ADR-001: Cô lập nghiệp vụ Order trong cùng một deployable

Trạng thái: Đề xuất

Bối cảnh:
Một team sở hữu sản phẩm. HTTP endpoint và worker cùng cần hủy đơn.
Quy tắc trạng thái đang bị lặp. Chưa có nhu cầu deploy Order độc lập.

Quyết định:
Giữ monolith. Đặt invariant trong Domain, orchestration trong use case.
Thêm port persistence cho use case; giữ public API hiện tại.

Phương án đã cân nhắc:
Giữ logic trong hai driver; tách microservice; dùng generic service chung.

Hệ quả:
Kiểm thử nghiệp vụ không cần web server; phải duy trì adapter và contract.
Chưa có isolation vận hành giữa Order và các phần còn lại.

Điều kiện xem xét lại:
Có nhu cầu scale/release độc lập được đo và team đủ khả năng vận hành.

Kiểm chứng:
Test trạng thái, API contract, rollback và conflict trên database thực tế.
```

## C4: sơ đồ đúng cấp độ

| Cấp độ | Câu hỏi | Ví dụ |
| --- | --- | --- |
| System Context | Ai dùng hệ thống, hệ thống tương tác với ai? | Khách hàng, Shop, payment provider. |
| Container | Ứng dụng và nơi lưu dữ liệu nào phối hợp? | Web app, API, worker, database. |
| Component | Bên trong một container có những trách nhiệm lớn nào? | Endpoint adapter, use case, persistence adapter. |
| Code | Thành phần cụ thể được triển khai ra sao? | Type và quan hệ code khi cần giải thích chi tiết. |

Container trong C4 không đồng nghĩa Docker container. Một class library Domain không tự trở thành một service có thể deploy riêng. Chỉ vẽ cấp độ giúp quyết định hiện tại, không cần đủ bốn sơ đồ cho mọi feature.

Nguồn: [CA-03](sources.md#ca-03), [CA-11](sources.md#ca-11), [CA-12](sources.md#ca-12), [CA-13](sources.md#ca-13).
