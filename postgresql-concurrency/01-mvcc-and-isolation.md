# 01. MVCC và isolation

## Snapshot trả lời câu hỏi nào?

MVCC cho phép reader thấy một phiên bản dữ liệu phù hợp snapshot mà không phải chờ mọi writer. Một truy vấn `SELECT` thông thường không khóa hàng như `SELECT ... FOR UPDATE`. Nó vẫn lấy các lock ở cấp relation và có thể bị một số DDL chặn.

| Isolation trong PostgreSQL | Điều cần nhớ |
| --- | --- |
| Read Uncommitted | Thực tế xử lý như Read Committed. |
| Read Committed | Mỗi statement lấy snapshot mới; hai SELECT cùng transaction có thể thấy dữ liệu khác. |
| Repeatable Read | Snapshot transaction được thiết lập ở statement thích hợp đầu tiên; có thể gặp serialization failure khi cập nhật hàng đã đổi. |
| Serializable | Thêm kiểm tra phụ thuộc để các transaction thành công tương đương một thứ tự tuần tự; ứng dụng phải xử lý abort/retry. |

`BEGIN` một mình chưa chắc đã lấy snapshot đọc. Khi viết test cạnh tranh, cho cả hai transaction thực sự đọc trước khi cho bên thắng commit.

## Lost update và invariant nghiệp vụ

Hai request cùng thấy đơn `pending`. Request A ghi `cancelled`; B dùng trạng thái đọc cũ rồi ghi `shipped` bằng UPDATE không có điều kiện. Giá trị sau cùng hợp constraint nhưng thao tác của A đã bị ghi đè về mặt nghiệp vụ.

Một phép tăng tại DB như `SET count = count + 1` khác với đọc count vào app rồi ghi `SET count = @oldPlusOne`. Đừng gom cả hai thành một kiểu race.

Write skew xảy ra khi các transaction cập nhật các hàng khác nhau dựa trên một invariant chung. Ví dụ hai bác sĩ cùng kiểm tra còn người trực rồi mỗi người tự nghỉ. Chỉ thêm version cho từng hàng không bảo vệ invariant “ít nhất một người trực”.

## Chọn theo invariant

Ghi câu cần luôn đúng, xác định tập dữ liệu liên quan và đường ghi có thể phá nó. Sau đó chọn conditional write, constraint, khóa một điểm phối hợp, hoặc Serializable. “Mọi thứ Serializable” có chi phí retry; “chỉ dùng Read Committed” có thể không đủ.

Bài tập: hai transaction không sửa cùng hàng có chắc an toàn không? Không; invariant liên hàng vẫn có thể bị phá. Một SELECT đọc được dữ liệu có bảo đảm UPDATE sau đó vẫn hợp lệ không? Không, trừ khi cơ chế phối hợp bảo vệ điều kiện đó.
