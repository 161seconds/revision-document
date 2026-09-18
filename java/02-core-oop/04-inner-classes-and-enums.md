# Bài 04: Lớp Nội Bộ (Inner Classes) & Kiểu Liệt Kê Enums Nâng Cao

Khảo sát chuyên sâu 4 loại lớp nội bộ (Member, Static Nested, Local, Anonymous) và kiểu dữ liệu liệt kê Enums với constructor, thuộc tính và phương thức nghiệp vụ.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: super, Interface & Abstract Class](file:///d:/my-project/revision-document/java/02-core-oop/03-super-interfaces-and-abstract-classes.md).
- **Trọng tâm hiện tại**:
  - Member Inner Class (Non-static inner class) & Tham chiếu ẩn `Outer.this`.
  - Static Nested Class (Class tĩnh lồng nhau).
  - Anonymous Inner Class (Lớp ẩn danh) và tiền đề cho Lambdas.
  - Enums: Constructor private, trường dữ liệu, phương thức tùy biến.
- **Tiếp theo**: [Module 03: Xử Lý Ngoại Lệ & File I/O](file:///d:/my-project/revision-document/java/03-exceptions-and-io/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. 4 Loại Lớp Nội Bộ (Inner Classes)
1. **Member Inner Class**: Nằm trong class khác, gắn liền với thực thể đối tượng ngoài. Tự động giữ một tham chiếu ngầm định đến `Outer.this`. Khởi tạo: `outerObj.new Inner()`.
2. **Static Nested Class**: Đánh dấu `static`, không giữ tham chiếu ngầm đến instance của outer class. Khởi tạo độc lập: `new Outer.StaticNested()`.
3. **Local Inner Class**: Nằm gọn bên trong thân của một phương thức. Chỉ truy cập được các biến cục bộ là `final` hoặc *effectively final*.
4. **Anonymous Inner Class**: Lớp không tên, định nghĩa và khởi tạo trực tiếp tại chỗ bằng toán tử `new`:
   ```java
   Comparator<String> comp = new Comparator<String>() {
       @Override
       public int compare(String o1, String o2) {
           return o1.length() - o2.length();
       }
   };
   ```

### 2.2. Bản Chất Của `enum` Trong Java
- Mọi enum trong Java đều ngầm định kế thừa từ `java.lang.Enum<E>`. Do đó, **enum không thể kế thừa bất kỳ class nào khác** (vì Java chỉ hỗ trợ đơn kế thừa class), nhưng vẫn có thể hiện thực nhiều Interfaces.
- Các hằng số enum (ví dụ: `ACTIVE`, `INACTIVE`) thực chất là các đối tượng `public static final` được khởi tạo duy nhất trong bộ nhớ Metaspace.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Rò rỉ bộ nhớ với Member Inner Class (Memory Leak)
Do Member Inner Class luôn giữ một con trỏ ngầm định tới thực thể `Outer`, nếu một đối tượng inner class tồn tại lâu dài (ví dụ: làm listener, callback) sẽ khiến đối tượng `Outer` **không bao giờ được Garbage Collector thu hồi**, gây rò rỉ bộ nhớ.
- **Khắc phục**: Luôn ưu tiên khai báo `static class` nếu inner class không cần truy cập trực tiếp các biến instance của `Outer`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [OopDemo.java](file:///d:/my-project/revision-document/java/02-core-oop/OopDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao `enum` là cách tốt nhất để hiện thực mẫu thiết kế Singleton trong Java?**
   *Trả lời*: Theo Joshua Bloch (tác giả Effective Java), `enum` đảm bảo 100% chỉ có 1 instance duy nhất được tạo ra bởi JVM, an toàn tuyệt đối trước các cuộc tấn công qua **Java Reflection** (JVM cấm gọi constructor của Enum bằng reflection) và tự động xử lý an toàn khi **Tuần tự hóa (Serialization)**.
2. **Biến cục bộ trong phương thức phải thỏa mãn điều kiện gì để Anonymous Inner Class có thể đọc được?**
   *Trả lời*: Biến đó phải là `final` hoặc *effectively final* (không bị gán lại giá trị sau khi khởi tạo). Lý do: Anonymous inner class tạo ra một bản sao giá trị của biến trên Heap. Nếu biến trên Stack thay đổi mà bản sao không đổi, dữ liệu sẽ bất đồng bộ.
