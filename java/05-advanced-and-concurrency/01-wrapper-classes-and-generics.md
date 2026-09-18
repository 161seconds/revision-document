# Bài 01: Lớp Bao Đóng (Wrapper Classes) & Generics Chuyên Sâu (PECS)

Phân tích cơ chế Autoboxing/Unboxing, cơ chế Integer Cache Pool và hệ thống tham số hóa kiểu dữ liệu Generics, kỹ thuật xóa kiểu (Type Erasure) và nguyên tắc thiết kế bất biến PECS.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 04: Collections Framework](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/README.md).
- **Trọng tâm hiện tại**:
  - 8 Lớp Wrapper tương ứng với 8 kiểu nguyên thủy (`Integer`, `Double`, `Boolean`, v.v.).
  - Cơ chế Autoboxing & Unboxing.
  - Vùng nhớ đệm `IntegerCache` (từ $-128$ đến $127$).
  - Generic Class, Generic Method, Bounded Type Parameters (`<T extends Number>`).
  - Ký tự đại diện Wildcards (`<?>`, `<? extends T>`, `<? super T>`).
  - Nguyên tắc PECS (Producer Extends, Consumer Super).
  - Bản chất xóa kiểu (Type Erasure) của trình biên dịch javac.
- **Tiếp theo**: [Bài 02: Annotations & Biểu Thức Chính Quy](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/02-annotations-and-regex.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Vùng Đệm Integer Cache Pool
- Trong Java, khi thực hiện autoboxing một số `int` thành `Integer` (thông qua `Integer.valueOf(int)`), JVM sử dụng một mảng tĩnh lưu sẵn các đối tượng từ $-128$ đến $127$:
  ```java
  Integer a = 100;
  Integer b = 100;
  System.out.println(a == b); // TRUE (Trỏ chung 1 đối tượng trong IntegerCache)

  Integer c = 200;
  Integer d = 200;
  System.out.println(c == d); // FALSE (Vượt khỏi vùng đệm, tạo 2 đối tượng mới trên Heap!)
  ```

### 2.2. Nguyên Tắc Thiết Kế PECS (Producer Extends, Consumer Super)
Theo quy tắc của Joshua Bloch:
- **Producer Extends (`<? extends T>`)**: Nếu tập hợp đóng vai trò **Cung cấp (Sản xuất - Read-only)** phần tử kiểu `T` cho bạn đọc ra $\rightarrow$ Dùng `extends`. Bạn chỉ có thể lấy dữ liệu ra kiểu `T`, **không thể thêm bất kỳ phần tử nào** vào tập hợp (trừ `null`).
- **Consumer Super (`<? super T>`)**: Nếu tập hợp đóng vai trò **Tiêu thụ (Ghi vào - Write-only)** phần tử kiểu `T` $\rightarrow$ Dùng `super`. Bạn có thể an toàn thêm các đối tượng kiểu `T` (hoặc con của `T`) vào tập hợp.

```java
// Đọc từ src (Producer) và ghi vào dest (Consumer)
public static <T> void copy(List<? super T> dest, List<? extends T> src) {
    for (T item : src) {
        dest.add(item); // Hoàn toàn hợp lệ
    }
}
```

### 2.3. Cơ Chế Xóa Kiểu (Type Erasure)
- Generics trong Java chỉ tồn tại ở thời điểm biên dịch (Compile-time) để kiểm tra an toàn kiểu (`Type-safety`).
- Khi biên dịch sang bytecode `.class`, trình biên dịch `javac` sẽ **xóa bỏ toàn bộ thông tin Generic**:
  - `List<String>` hay `List<Integer>` đều trở thành danh sách thô `List` (chứa `Object`).
  - `<T extends Number>` sẽ bị thay thế bằng `Number`.
  - Compiler tự động chèn các lệnh ép kiểu tường minh `(String)` tại các vị trí đọc dữ liệu ra.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: So Sánh Đối Tượng Wrapper Bằng `==`
- Tuyệt đối không dùng `==` để so sánh giá trị logic của hai Wrapper Objects (`Integer`, `Long`).
- **Khắc phục**: Luôn dùng `.equals()` hoặc unbox về kiểu nguyên thủy trước khi so sánh.

### Bẫy 2: Lỗi NullPointerException Khi Tự Động Mở Bao (Unboxing)
```java
Integer count = null;
int primitiveCount = count; // ❌ Ném NullPointerException lúc runtime vì JVM gọi count.intValue()!
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [AdvancedDemo.java](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/AdvancedDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao ta không thể khởi tạo mảng Generic như `new T[10]` hoặc `new ArrayList<String>[10]`?**
   *Trả lời*: Do cơ chế **Type Erasure**. Tại thời điểm runtime, JVM không còn biết kiểu thực sự của `T` là gì. Hơn nữa, mảng trong Java là Reifiable và covariant (`String[]` là con của `Object[]`), còn Generics là invariant và non-reifiable. Sự xung đột này khiến compiler cấm tạo mảng Generic để bảo đảm an toàn kiểu (Type Safety).
2. **Ký tự đại diện `<?>` khác gì với kiểu `Object` trong `List<?>` vs `List<Object>`?**
   *Trả lời*:
   - `List<Object>` chỉ chấp nhận chính xác một danh sách kiểu `List<Object>`, bạn không thể gán một `List<String>` vào `List<Object>` (do Generics có tính invariant).
   - `List<?>` là ký tự đại diện không ràng buộc (Unbounded Wildcard), nó là cha của **mọi** loại danh sách (`List<String>`, `List<Integer>`, `List<Object>`), cho phép viết các hàm tiện ích tổng quát.
