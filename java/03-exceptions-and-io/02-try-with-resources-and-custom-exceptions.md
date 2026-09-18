# Bài 02: `try-with-resources`, Giao Diện `AutoCloseable` & Ngoại Lệ Tùy Chỉnh

Khảo sát cơ chế quản lý tài nguyên tự động giới thiệu từ Java 7, giải quyết triệt để rò rỉ File descriptor/Socket và kỹ thuật xây dựng Custom Exceptions chuẩn kiến trúc doanh nghiệp.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Phân Cấp Ngoại Lệ & try-catch-finally](file:///d:/my-project/revision-document/java/03-exceptions-and-io/01-exception-hierarchy-and-handling.md).
- **Trọng tâm hiện tại**:
  - Hạn chế của việc đóng tài nguyên thủ công trong `finally`.
  - Cú pháp `try-with-resources` (ARM - Automatic Resource Management).
  - Giao diện `java.lang.AutoCloseable` và `java.io.Closeable`.
  - Cơ chế bắt và lưu vết ngoại lệ bị che khuất (Suppressed Exceptions).
  - Thiết kế Custom Checked vs Unchecked Exceptions.
- **Tiếp theo**: [Bài 03: Thao Tác File & Luồng Byte Streams](file:///d:/my-project/revision-document/java/03-exceptions-and-io/03-file-handling-and-byte-streams.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất `try-with-resources`
Bất kỳ class nào hiện thực giao diện `java.lang.AutoCloseable` (hoặc `java.io.Closeable`) đều có thể đặt bên trong dấu ngoặc tròn `try (...)`:
```java
try (FileInputStream fis = new FileInputStream("in.dat");
     FileOutputStream fos = new FileOutputStream("out.dat")) {
    // Thao tác với fis và fos
} // JVM tự động gọi fis.close() và fos.close() theo thứ tự NGƯỢC LẠI lúc mở!
```
- Compiler sẽ tự động phân rã cú pháp này thành một khối `try-catch-finally` phức tạp ở cấp độ Bytecode, đảm bảo phương thức `close()` luôn được gọi kể cả khi ném ra Exception.

### 2.2. Suppressed Exceptions (Ngoại Lệ Bị Kìm Nén)
- Trước Java 7: Nếu khối `try` ném ra ngoại lệ A, sau đó phương thức `close()` trong `finally` ném ra ngoại lệ B, ngoại lệ A sẽ bị **biến mất hoàn toàn** (Lost exception), gây ác mộng khi gỡ lỗi.
- Từ Java 7 với `try-with-resources`: Ngoại lệ A từ `try` được ném ra làm ngoại lệ chính, còn ngoại lệ B từ `close()` sẽ được đính kèm vào A dưới dạng **Suppressed Exception** (lấy ra qua `e.getSuppressed()`).

---

## 3. Xây Dựng Custom Exceptions Chuẩn

```java
// Ngoại lệ nghiệp vụ không kiểm tra (Unchecked) - Khuyên dùng cho hầu hết trường hợp
public class InsufficientBalanceException extends RuntimeException {
    private final double currentBalance;
    private final double withdrawAmount;

    public InsufficientBalanceException(String message, double currentBalance, double withdrawAmount) {
        super(message);
        this.currentBalance = currentBalance;
        this.withdrawAmount = withdrawAmount;
    }

    public double getCurrentBalance() { return currentBalance; }
    public double getWithdrawAmount() { return withdrawAmount; }
}
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [ExceptionIoDemo.java](file:///d:/my-project/revision-document/java/03-exceptions-and-io/ExceptionIoDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **`AutoCloseable` khác `Closeable` ở điểm cốt lõi nào?**
   *Trả lời*:
   - `Closeable` ra đời từ Java 5 trong package `java.io`, phương thức `void close() throws IOException;` giới hạn chỉ ném ra `IOException`.
   - `AutoCloseable` ra đời từ Java 7 trong package `java.lang` (là cha của `Closeable`), phương thức `void close() throws Exception;` tổng quát hơn, cho phép ném ra bất kỳ loại Exception nào.
2. **Khi nào nên tự định nghĩa một Custom Exception?**
   *Trả lời*: Chỉ khi các Exception chuẩn của Java (`IllegalArgumentException`, `IllegalStateException`, `NoSuchElementException`) không diễn tả đủ ngữ nghĩa nghiệp vụ chuyên biệt của ứng dụng, hoặc khi bạn cần đính kèm thêm các thông tin trạng thái kinh doanh (như mã lỗi error_code, ID khách hàng, số dư tài khoản) để lớp Controller trả về mã phản hồi HTTP chuẩn.
