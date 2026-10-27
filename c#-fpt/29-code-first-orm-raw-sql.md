# CODE FIRST - ORM - RAW SQL

> Tác giả: Ben Trần · Nhóm: DATABASE
> Nguồn: [CODE FIRST - ORM - RAW SQL](https://bentran1vn.notion.site/CODE-FIRST-ORM-RAW-SQL-6a58951016094fd78236aa841396e10c) · Bản lưu: 27/10/2026

[Mục lục](README.md)

## Code Fisrt

- Thông thường trước đây khi xây dựng 1 Ứng dụng chúng ta thường có xu hướng là:
    Xây dựng Database → Xây dựng Các Class → Liên kết 2 thằng này lại với nhau
    
    Xây dựng Database thường làm là
    
    Create các table, Tạo thuộc tính, Set Khóa Chính, Khóa Phụ
    
    Bỏ dữ liệu vào bên trong các table
    
    ….

- Code First sẽ khác 1 chút
    - Xây dựng các Class tương ứng với các thực tể đã định nghĩa trong Ứng dụng của chúng ta
    
    - Sau đó sử dụng 1 ORM để tương tác với Database

## ORM là gì ( Object-relational mapping )

- Object-relational mapping (ORM, O/RM, and O/R mapping tool) in computer science is a programming technique for converting data between incompatible type systems using object-oriented programming languages.

- This creates, in effect, a "virtual object database" that can be used from within the programming language. There are both free and commercial packages available that perform object-relational mapping, although some programmers opt to construct their own ORM tools.

Đơn giản hơn:

- ORM là 1 `kỹ thuật lập trình` giúp `ánh xạ` các record dữ liệu trong `hệ quản trị cơ sở dữ liệu` sang dạng `đối tượng` đang định nghĩa trong các `class` - một khái niệm phổ biến được sử dụng trong tất cả các ngôn ngữ hiện đại ngày nay như: `Java`, `PHP`, `Ruby`. Bạn có thể áp dụng kĩ thật này với bất cứ dự án nào bạn thích.

#### Ưu Điểm

- Đơn giản, nhanh. Bình thường phải where + câu lệnh → Đống này đã biến thành 1 Method

- Vì đã che phủ đi phần nguyên thủy. Nên tránh được SQL Injection

#### Nhược Điểm

- Vì là 1 thư viện nên nó sẽ nặng → Nhưng đây không phải là 1 vấn đề chính, quá lớn lao

- Vì không truy vấn trực tiếp mà phải thông qua bên thứ 3 → Chắc chắn chậm hơn. Performance Kém !!!

#### Kết Luận

- Muốn nhẹ nhàng, làm việc an toàn → ORM

- Dự án nặng, hàng tỷ người dùng muốn Truy Xuất nhanh chóng, quan tâm Performance → SQL RAW

Coi so sánh giữa ORM và RawSQL

[Object Relational Mapping](<https://viblo.asia/p/object-relational-mapping-djeZ1PQ3KWz>)

Trong cách phát triển ứng dụng web hiện nay chắc hẳn các bạn đã quen với với từ khóa ORM(Object Relational Mapping). Khi mà thời đại của các framework ứng với các ngôn ngữ đang lên ngôi một cách mạnh...

Entity Framwork. Một ORM nổi tiếng bên C#

[What is Code-First?](<https://www.entityframeworktutorial.net/code-first/what-is-code-first.aspx>)

Learn Entity Framework 6 Code-First approach using step-by-step and easy tutorials.

#### Bonus:

- Bên Java thì có Hibernate

- Bên NodeJS thì có Sequelize

- Ngoài ORM thì có ODM → Giống y chang ORM nhưng chơi với Document Database
