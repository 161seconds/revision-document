# Tra nhanh: DDD và modular monolith

| Khái niệm | Ý nghĩa |
| --- | --- |
| Bounded context | Ranh giới mô hình/ngôn ngữ, không mặc định process hay DB. |
| Aggregate | Bảo vệ invariant trong boundary đã chọn; không phải mọi FK thành một graph. |
| Value object | Identity theo giá trị; bất biến khi phù hợp. |
| Module contract | DTO/API/event công khai, tránh entity/repository xuyên module. |
| Ownership | Một nơi sở hữu rule và dữ liệu ghi; reporting có contract riêng. |
| Domain event | Fact nội bộ; không tự là integration contract bền vững. |
| Outbox | Ghi fact và nghiệp vụ cùng transaction; consumer vẫn cần chống trùng. |
| CRUD | Đủ cho phần ít rule; đừng áp tactical pattern để tăng số class. |
| Refactor | Một use case, giữ contract, thêm bằng chứng rồi mới xóa đường cũ. |

Kiến trúc logic và ranh giới triển khai là hai quyết định khác nhau. Lab một assembly không chứng minh compiler/DB isolation.
