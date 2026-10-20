# 01. Test ở ranh giới nào?

| Loại test | Ví dụ | Không tự chứng minh |
| --- | --- | --- |
| Unit | Domain từ chối hủy đơn đã ship | Mapping SQL, HTTP, transaction hoặc DI. |
| Repository integration | SQL param đúng, unique constraint và rollback thật | Endpoint có phân quyền hoặc serialize đúng. |
| API integration | Request đi qua routing, binding, service và DB | TLS, proxy, browser hoặc provider thật. |
| Contract | Payload/status/type giữ đúng giao diện đã công bố | Mọi invariant DB hoặc mọi client đều tương thích. |
| E2E | Người dùng hoàn tất một luồng qua hệ thống chạy thật | Toàn bộ nhánh lỗi và mọi lịch cạnh tranh. |

Tên file “integration” không quyết định loại test. Cần nhìn dependency nào thật, dependency nào thay thế và assertion đang quan sát điều gì.

## Chọn đường có rủi ro

Đừng chỉ test `200`. Với create/cancel order, ưu tiên dữ liệu có lưu thật, input sai không ghi gì, duplicate không tạo thêm hàng, trạng thái không hợp lệ không đổi và thao tác lặp có kết quả đã định nghĩa.

Assert theo hành vi: status, header, field công khai và trạng thái bền vững. Không assert tên method private hoặc số lần gọi repository nếu mục tiêu là dữ liệu cuối cùng. Một assertion chứa nhiều điều kiện liên quan có thể phù hợp; không chia test chỉ để đạt quy tắc máy móc “mỗi test một assert”.

## Fake và DB in-memory

Fake rất hữu ích cho unit test lỗi provider hoặc nhánh logic. Nó không có MVCC, lock, index, collation và constraint tương đương PostgreSQL. SQLite cũng là DB thật nhưng không đại diện cho mọi hành vi của PostgreSQL.

Coverage cao cho biết dòng/nhánh đã đi qua, không cho biết assertion đủ mạnh. Báo thêm hành vi được bảo đảm và các phần chưa chạy; không dùng phần trăm để thay cho kiểm tra dữ liệu thật.

## Bài tập

Test controller trả `201` nhưng repository là mock luôn thành công: có chứng minh đơn đã lưu không? Không. Test query trên PostgreSQL thật nhưng gọi thẳng repository: có chứng minh request sai trả Problem Details không? Không.
