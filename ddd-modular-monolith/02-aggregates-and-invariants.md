# 02. Aggregate, entity và invariant

## Ghi invariant bằng câu cụ thể

Ví dụ: “Đơn đã xác nhận không được thêm dòng”; “tổng tiền không âm và không bị tràn số”; “đơn rỗng không thể xác nhận”. Aggregate quản lý thay đổi để các điều kiện đó giữ đúng tại ranh giới thao tác.

Entity có identity xuyên thời gian. Value object được phân biệt theo giá trị và nên bất biến khi phù hợp: địa chỉ, khoảng ngày hoặc tiền có currency. Đừng tạo ID cho mọi kiểu dữ liệu chỉ vì ORM dễ map hơn.

Aggregate root là điểm truy cập thay đổi của aggregate. Nếu caller có thể chỉnh list/setter trực tiếp để bỏ qua rule, phương thức `Confirm()` không đủ bảo vệ invariant.

## Transaction boundary

Aggregate thường là ranh giới cần nhất quán ngay trong một transaction. Không nhét Customer, Catalog, Payment và Shipment thành object graph khổng lồ vì chúng có FK với nhau. Tham chiếu aggregate khác bằng identity và dùng contract để lấy thông tin cần thiết.

“Mỗi transaction đúng một aggregate” là một hướng dẫn thiết kế phổ biến, không phải luật cấm tuyệt đối. Khi nghiệp vụ cần atomicity nhiều phần trong cùng DB, phải quyết định rõ chi phí coupling, transaction ownership và lock. Nếu khác DB/provider, không giả định rollback cục bộ hoàn tác được tác động bên ngoài.

Invariant trong object không chống stale write của hai request. Vẫn cần concurrency token, conditional UPDATE hoặc lock đúng chỗ khi persist; xem [bộ PostgreSQL](../postgresql-concurrency/README.md).

## Tiền và giá

Không nhận đơn giá từ client rồi coi đó là nguồn chuẩn. Server cần kiểm tra quote/catalog, currency, rounding, tax và thời hạn giá theo nghiệp vụ. Dùng kiểu số chính xác; nếu lưu minor unit, quy định exponent theo currency và dùng arithmetic có kiểm soát overflow.

Lab chỉ nhận giá từ fixture tin cậy, hỗ trợ USD/VND, tích lũy tổng và khóa thay đổi sau xác nhận. Nó chưa mô hình hóa tax, discount, hoàn tiền hoặc lịch sử line item. Không thêm những rule này chỉ để ví dụ trông “đúng DDD”; thêm khi requirement thực tế yêu cầu.

## Bài tập

Domain service cần thiết khi rule liên quan nhiều object mà không thuộc tự nhiên về một entity/value object. Nó không phải tên mới cho mọi application service. Hãy đặt một rule thực vào aggregate trước khi tạo thêm lớp dịch vụ.
