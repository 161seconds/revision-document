# Bài 01: Lớp, Đối Tượng, Hàm Khởi Tạo & Từ Khóa `this`

Phân tích sâu về vòng đời đối tượng trên Heap, cơ chế khởi tạo và chuỗi hàm khởi tạo (Constructor Chaining).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 01: Cú pháp nền tảng Java](file:///d:/my-project/revision-document/java/01-basics-and-syntax/README.md).
- **Trọng tâm hiện tại**:
  - Khái niệm Class (Khuôn mẫu) và Object (Thực thể cụ thể trên Heap).
  - Thuộc tính (Fields/State) và Phương thức (Methods/Behaviors).
  - Constructor mặc định (Default Constructor) vs Constructor có tham số.
  - Chuỗi Constructor (`this()` constructor chaining).
  - Phân biệt biến tham chiếu `this` và biến cục bộ bị trùng tên (Shadowing).
- **Tiếp theo**: [Bài 02: 4 Trụ Cột OOP & Bổ Từ Truy Cập](file:///d:/my-project/revision-document/java/02-core-oop/02-four-oop-pillars.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. 4 Bước Khởi Tạo Đối Tượng Với Toán Tử `new`
Khi câu lệnh `Car myCar = new Car("Tesla");` được thực thi:
1. **Cấp phát bộ nhớ**: JVM cấp phát một vùng nhớ vừa đủ trên **Heap** để chứa các thuộc tính của `Car`.
2. **Khởi tạo giá trị mặc định**: Toàn bộ biến instance được gán giá trị mặc định (`0`, `0.0`, `false`, `null`).
3. **Thực thi Constructor**: Gọi constructor tương ứng, chạy chuỗi `super()` và gán giá trị khởi tạo.
4. **Trả về tham chiếu**: Địa chỉ vùng nhớ vừa tạo trên Heap được trả về và gán cho biến con trỏ `myCar` trên Stack.

### 2.2. Constructor Chaining (`this()`)
```java
public class User {
    private String username;
    private String role;
    private int status;

    public User(String username) {
        this(username, "USER", 1); // Gọi constructor đầy đủ tham số
    }

    public User(String username, String role, int status) {
        this.username = username;
        this.role = role;
        this.status = status;
    }
}
```
> [!IMPORTANT]
> Lệnh gọi `this(...)` hoặc `super(...)` **bắt buộc phải nằm ở dòng lệnh đầu tiên** của constructor.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Mất Constructor Mặc Định Không Tham Số
- Nếu bạn **không viết** bất kỳ constructor nào, Java Compiler sẽ tự động sinh ra một `default constructor` không tham số rỗng `public MyClass() {}`.
- **Tuy nhiên**, ngay khi bạn tự định nghĩa **dù chỉ một constructor có tham số**, compiler sẽ **ngừng tạo constructor mặc định**. Code gọi `new MyClass()` lúc này sẽ lập tức báo lỗi biên dịch!
- **Khắc phục**: Luôn chủ động viết constructor không tham số nếu dự định dùng các framework như Jackson, Hibernate/JPA.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [OopDemo.java](file:///d:/my-project/revision-document/java/02-core-oop/OopDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Constructor có thể là `private` không? Ứng dụng thực tế là gì?**
   *Trả lời*: Có. Khi constructor là `private`, các class bên ngoài không thể khởi tạo đối tượng bằng `new`. Ứng dụng:
   - Hiện thực mẫu thiết kế **Singleton Pattern** (chỉ có duy nhất 1 instance trong toàn hệ thống).
   - Tạo **Utility Class** chứa các hàm tĩnh (như `java.lang.Math`, `java.util.Collections`) để ngăn chặn việc khởi tạo vô nghĩa.
2. **Khối khởi tạo tĩnh (`static initializer block`) chạy khi nào so với Constructor?**
   *Trả lời*: Khối `static { ... }` chạy **duy nhất 1 lần** khi ClassLoader nạp class vào Metaspace, trước khi bất kỳ đối tượng nào được tạo. Constructor chỉ chạy mỗi khi toán tử `new` được gọi để tạo đối tượng mới trên Heap.
