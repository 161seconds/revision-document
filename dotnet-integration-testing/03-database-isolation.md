# 03. Database thật và dữ liệu cách ly

## Một container không có nghĩa một test

Khởi động một container cho cả class giúp giảm thời gian. Dữ liệu vẫn cần reset trước từng test. Lab chỉ có một class xUnit, các test trong cùng collection chạy tuần tự theo mặc định, và `InitializeAsync` truncate bảng trước mỗi test.

Nếu thêm class hoặc bật parallelism, giả định này có thể không còn đúng. Chọn một trong các cách: DB/schema riêng cho mỗi test, collection chung không chạy song song, hoặc reset mechanism phối hợp rõ ràng. Không truncate trong khi test khác đang ghi.

DB/container chỉ thuộc fixture; không lấy connection string từ `.env` của ứng dụng đang chạy. Testcontainers cấp port ngẫu nhiên để tránh tranh cổng với DB khác.

## Schema của lab và migration thật

Fixture tạo một bảng tối thiểu bằng SQL để nhìn rõ constraint. Trong sản phẩm, chạy migration thật mà production dùng, rồi kiểm tra migration trên dữ liệu đại diện và đường nâng cấp. Một bảng CREATE thủ công trong test không chứng minh toàn bộ migration production hoạt động.

Seed dữ liệu theo nhu cầu của từng test, dùng ID mới và không phụ thuộc test tạo dữ liệu trước đó. Thời gian, timezone và random seed phải kiểm soát khi ảnh hưởng expected output.

## Xác nhận lưu trữ độc lập

Sau request create, test mở connection khác để SELECT. Nó không chỉ đọc một dictionary hoặc entity còn tracked trong request. Điều này kiểm tra dữ liệu đã commit và nhìn thấy được từ phiên khác trong kịch bản đó.

Test rollback của lab mở transaction SQL, INSERT rồi rollback, sau đó gọi GET và đếm hàng. Nó chứng minh rollback transaction SQL của test; chưa chứng minh application unit of work rollback audit/outbox khi một bước nghiệp vụ giữa chừng lỗi.

## Transaction bao quanh test

Một transaction mở từ test không tự bao trùm các connection mà HTTP request mở riêng. Muốn dùng rollback để reset phải hiểu connection/transaction ownership; đừng mặc định mọi request đã enlist vào transaction của test.

Schema dùng riêng hoặc reset dữ liệu rõ ràng thường dễ giải thích hơn một ambient transaction vượt qua nhiều connection.
