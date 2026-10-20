# 01. Domain, ngôn ngữ và bounded context

## Tách theo ý nghĩa, không chỉ theo bảng

Trong Ordering, “đơn hàng” là cam kết mua và các điều kiện thay đổi. Trong Fulfilment, nó có thể là công việc cần đóng gói/giao. Trong Billing, nó là nguồn tham chiếu để tính khoản phải thu. Ba mô hình không nhất thiết dùng cùng class hoặc cùng lifecycle.

Bounded context là ranh giới áp dụng một mô hình và ngôn ngữ nhất quán. Một context có thể chứa nhiều module; một module kỹ thuật không tự động là bounded context. Bounded context cũng không đồng nghĩa microservice hay database riêng.

## Bản đồ context nhỏ

| Context | Sở hữu | Cung cấp |
| --- | --- | --- |
| Catalog | Product, giá công bố, availability theo nghĩa catalog | Lookup/price quote có phiên bản hoặc hạn hiệu lực. |
| Ordering | Order, dòng hàng đã chốt, lifecycle đặt hàng | Snapshot đơn xác nhận, lệnh sửa/hủy hợp lệ. |
| Billing | Payment attempt, invoice, provider reference | Trạng thái thu tiền, dữ liệu đối soát. |
| Fulfilment | Shipment, kho xử lý, mốc giao hàng | Trạng thái thực hiện và điều kiện đã bắt đầu giao. |

Đây là giả thuyết thiết kế để trao đổi với người hiểu nghiệp vụ, không phải bản chia bắt buộc cho mọi sản phẩm. Khi cùng một thuật ngữ có nghĩa khác nhau, ghi glossary và ví dụ cụ thể.

## Quan hệ giữa context

Xác định ai là upstream, ai tiêu thụ contract, ai chịu trách nhiệm thay đổi và dữ liệu có thể trễ bao lâu. Anti-corruption layer có ích khi phải dịch mô hình provider sang ngôn ngữ của mình; nó không phải lý do tạo wrapper cho mọi lời gọi nội bộ.

Không dùng một `SharedKernel` chứa toàn bộ entity, enum và repository. Phần dùng chung lớn làm mọi module phải đổi cùng nhau. Chỉ chia sẻ khái niệm ổn định có ownership rõ; duplication của DTO nhỏ có thể rẻ hơn coupling dài hạn.

## Bài tập

Một bảng `Orders` dùng bởi bốn team có phải bốn context không? Chưa đủ thông tin. Hỏi ai sở hữu rule, lifecycle và contract. Một context có thể deploy chung với context khác không? Có; ranh giới mô hình không bắt buộc ranh giới process.
