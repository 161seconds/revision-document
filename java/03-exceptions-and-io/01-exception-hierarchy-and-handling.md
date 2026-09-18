# Bài 01: Phân Cấp Ngoại Lệ, Checked vs Unchecked & try-catch-finally

Phân tích sâu về kiến trúc xử lý lỗi trong Java, cây phân cấp `Throwable`, sự khác nhau giữa Checked và Unchecked Exceptions, và trật tự thực thi của các khối `try-catch-finally`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Lập trình hướng đối tượng OOP](file:///d:/my-project/revision-document/java/02-core-oop/README.md).
- **Trọng tâm hiện tại**:
  - Cây phân cấp: `Throwable` $\rightarrow$ `Error` & `Exception`.
  - Phân biệt `Error` vs `Exception`.
  - Phân biệt Checked Exceptions vs Unchecked Exceptions (`RuntimeException`).
  - Cú pháp `try`, `catch`, `finally` và Multi-catch block.
  - Từ khóa `throw` (ném ra ngoại lệ) vs `throws` (khai báo trên chữ ký hàm).
- **Tiếp theo**: [Bài 02: try-with-resources & Ngoại Lệ Tùy Chỉnh](file:///d:/my-project/revision-document/java/03-exceptions-and-io/02-try-with-resources-and-custom-exceptions.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Cây Phân Cấp `Throwable`
- **`Error`**: Đại diện cho các lỗi hệ thống phần cứng, máy ảo JVM hoặc cạn kiệt tài nguyên (ví dụ: `OutOfMemoryError`, `StackOverflowError`). Ứng dụng **không bao giờ nên cố gắng `catch` Error** vì trạng thái JVM đã mất ổn định.
- **`Exception`**: Các điều kiện bất thường mà ứng dụng có thể dự đoán và lập trình để bắt lại và phục hồi:
  - **Checked Exceptions**: Trực tiếp kế thừa từ `Exception` (ngoại trừ `RuntimeException`). Compiler **bắt buộc** phải xử lý bằng `try-catch` hoặc khai báo `throws` ở signature (ví dụ: `IOException`, `SQLException`, `ClassNotFoundException`).
  - **Unchecked Exceptions**: Kế thừa từ `RuntimeException`. Là các lỗi lập trình logic cẩu thả (ví dụ: `NullPointerException`, `ArrayIndexOutOfBoundsException`, `IllegalArgumentException`). Compiler không bắt buộc phải khai báo.

### 2.2. Trật Tự Khối `finally`
Khối `finally` được bảo đảm **luôn luôn thực thi** trong mọi trường hợp:
- Khi khối `try` chạy thành công bình thường.
- Khi xảy ra ngoại lệ và được khối `catch` xử lý.
- Khi xảy ra ngoại lệ không được `catch`.
- Ngay cả khi trong `try` hoặc `catch` có lệnh `return`.
- **Trường hợp DUY NHẤT `finally` không chạy**: Khi tiến trình JVM bị tiêu diệt cưỡng chế bằng `System.exit(0)` hoặc máy chủ bị mất điện đột ngột.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Sai Thứ Tự Khối `catch` (Unreachable Catch Block)
Khi bắt nhiều ngoại lệ có quan hệ kế thừa, **ngoại lệ con (cụ thể hơn) bắt buộc phải đứng trước ngoại lệ cha**:
```java
// ❌ LỖI BIÊN DỊCH: FileNotFoundException không bao giờ chạm tới được
try {
    new FileReader("data.txt");
} catch (IOException e) { // IOException là class cha của FileNotFoundException
    // ...
} catch (FileNotFoundException e) {
    // Compile error: Unreachable catch block
}
```

### Bẫy 2: Nuốt Ngoại Lệ (Swallowing Exceptions)
```java
try {
    processCriticalData();
} catch (Exception e) {
    // ❌ Cực kỳ nguy hiểm: Để trống catch block khiến lỗi biến mất không dấu vết
}
```
- **Khắc phục**: Ít nhất phải log lỗi qua Logger chuyên dụng (`log.error("Failed...", e)`) hoặc bọc lại thành Unchecked Exception để ném ra ngoài.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [ExceptionIoDemo.java](file:///d:/my-project/revision-document/java/03-exceptions-and-io/ExceptionIoDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Điều gì xảy ra nếu cả khối `try` và khối `finally` đều chứa lệnh `return`?**
   *Trả lời*: Lệnh `return` trong khối `finally` sẽ **ghi đè hoàn toàn** lệnh `return` (hoặc ngoại lệ được ném ra) trong khối `try`! Điều này rất nguy hiểm và được coi là Anti-pattern. Tuyệt đối không đặt `return` trong `finally`.
2. **Tại sao Java lại phân chia Checked và Unchecked Exceptions? Các ngôn ngữ hiện đại như Kotlin, C# có Checked Exceptions không?**
   *Trả lời*: Java thiết kế Checked Exceptions để ép buộc lập trình viên phải nghĩ đến các tình huống lỗi có thể xảy ra từ môi trường ngoài (I/O, mạng). Tuy nhiên, trong thực tế việc này thường dẫn đến code rườm rà (boilerplate) và thói quen "nuốt ngoại lệ" cẩu thả. Do đó, C#, Kotlin, Python, Go đều loại bỏ hoàn toàn Checked Exceptions, chỉ giữ lại Unchecked Exceptions.
