# Bài 02: Siêu Dữ Liệu Annotations & Biểu Thức Chính Quy (RegEx)

Khảo sát cơ chế chú thích siêu dữ liệu Annotations, cách tạo Custom Annotation, đọc siêu dữ liệu qua Java Reflection và xử lý tìm kiếm/khớp mẫu chuỗi qua Regular Expressions (`java.util.regex`).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Wrapper Classes & Generics](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/01-wrapper-classes-and-generics.md).
- **Trọng tâm hiện tại**:
  - Annotations tích hợp sẵn: `@Override`, `@Deprecated`, `@SuppressWarnings`, `@FunctionalInterface`.
  - Meta-Annotations: `@Target`, `@Retention` (`SOURCE`, `CLASS`, `RUNTIME`).
  - Định nghĩa Custom Annotation và đọc giá trị lúc Runtime bằng Reflection.
  - Regular Expressions trong Java: Lớp `java.util.regex.Pattern` và `Matcher`.
  - Các hàm tiện ích: `Pattern.compile()`, `matcher.find()`, `matcher.group()`, `String.matches()`.
- **Tiếp theo**: [Bài 03: Đa Luồng & Đồng Bộ Hóa](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/03-multithreading-and-concurrency.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Vòng Đời Của Annotation (`RetentionPolicy`)
Annotation không tự thực thi mã lệnh, nó chỉ là **siêu dữ liệu (Metadata)** được gắn vào code:
- **`RetentionPolicy.SOURCE`**: Bị loại bỏ hoàn toàn trong quá trình biên dịch (ví dụ: `@Override`, `@SuppressWarnings`), chỉ có tác dụng hỗ trợ compiler và IDE.
- **`RetentionPolicy.CLASS`** (Mặc định): Được ghi vào file nhị phân `.class` nhưng bị JVM bỏ qua lúc nạp vào bộ nhớ, không thể đọc qua Reflection.
- **`RetentionPolicy.RUNTIME`**: Được JVM nạp vào **Metaspace** cùng class metadata. Có thể đọc và xử lý tại thời điểm runtime thông qua cơ chế **Java Reflection** (được Spring Boot, Jackson, Hibernate sử dụng để cấu hình tự động).

```java
// Khai báo Custom Annotation lưu trữ lúc Runtime
@Target(ElementType.METHOD)
@Retention(RetentionPolicy.RUNTIME)
public @interface AuditLog {
    String action();
    int severity() default 1;
}
```

### 2.2. Xử Lý Biểu Thức Chính Quy Với `Pattern` & `Matcher`
```java
// Tối ưu hóa: Compile regex pattern 1 lần duy nhất thành đối tượng tĩnh
private static final Pattern EMAIL_PATTERN = 
    Pattern.compile("^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+$");

public static boolean isValidEmail(String email) {
    if (email == null) return false;
    return EMAIL_PATTERN.matcher(email).matches();
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Quên `@Retention(RetentionPolicy.RUNTIME)` Khi Viết Annotation Cho Reflection
- Nếu quên khai báo `@Retention(RetentionPolicy.RUNTIME)`, annotation sẽ nhận chính sách mặc định là `CLASS`.
- Khi bạn gọi `method.getAnnotation(MyAnnotation.class)` lúc chạy chương trình, kết quả sẽ luôn trả về **`null`**, gây khó hiểu cho lập trình viên mới.

### Bẫy 2: Gọi `String.matches(regex)` Trong Vòng Lặp Lớn
- Phương thức tiện ích `str.matches(regex)` bên trong sẽ gọi `Pattern.compile(regex)` mỗi khi chạy.
- Nếu đặt trong vòng lặp duyệt hàng triệu dòng, CPU sẽ bị tiêu tốn lãng phí vào việc dịch đi dịch lại cùng một chuỗi regex!
- **Khắc phục**: Khai báo `private static final Pattern PATTERN = Pattern.compile(...)` tái sử dụng.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [AdvancedDemo.java](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/AdvancedDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Meta-annotation `@Target` dùng để làm gì? Nêu 3 vị trí target phổ biến.**
   *Trả lời*: `@Target` giới hạn vị trí mà Annotation đó có thể được áp dụng trong mã nguồn. Các giá trị phổ biến trong `ElementType`:
   - `ElementType.TYPE`: Áp dụng cho Lớp, Giao diện, Enum, Record.
   - `ElementType.FIELD`: Áp dụng cho các thuộc tính/trường dữ liệu của lớp.
   - `ElementType.METHOD`: Áp dụng cho các phương thức.
   - `ElementType.PARAMETER`: Áp dụng cho tham số đầu vào của phương thức.
2. **Sự khác biệt giữa `matcher.find()` và `matcher.matches()` là gì?**
   *Trả lời*:
   - `matcher.matches()`: Kiểm tra xem **toàn bộ chuỗi đầu vào** có khớp chính xác 100% với mẫu regex hay không.
   - `matcher.find()`: Quét và tìm kiếm **chuỗi con tiếp theo** bên trong văn bản có khớp với mẫu regex hay không (thường dùng trong vòng lặp `while (matcher.find())` để trích xuất dữ liệu).
