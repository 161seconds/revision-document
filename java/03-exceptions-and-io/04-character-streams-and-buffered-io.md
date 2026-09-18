# Bài 04: Luồng Ký Tự Character Streams, Bộ Đệm Buffered I/O & NIO.2

Phân tích sâu về cơ chế giải mã bảng mã (Charset Encoding), tối ưu hóa đọc/ghi văn bản bằng `BufferedReader`/`BufferedWriter` và thư viện hiện đại `java.nio.file.Files`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: Thao Tác File & Luồng Byte Streams](file:///d:/my-project/revision-document/java/03-exceptions-and-io/03-file-handling-and-byte-streams.md).
- **Trọng tâm hiện tại**:
  - `Reader` & `Writer`: Lớp trừu tượng gốc của Character Streams (đơn vị: 16-bit Unicode char).
  - Cầu nối chuyển đổi bảng mã: `InputStreamReader` và `OutputStreamWriter`.
  - Thao tác file văn bản: `FileReader` & `FileWriter`.
  - Bộ đệm tăng tốc: `BufferedReader` (đọc từng dòng `readLine()`), `BufferedWriter` (`newLine()`).
  - Hiện đại hóa với NIO.2: `java.nio.file.Files` và `java.nio.file.Path`.
- **Tiếp theo**: [Module 04: Java Collections Framework & Cấu Trúc Dữ Liệu](file:///d:/my-project/revision-document/java/04-collections-and-algorithms/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Cấu Trúc Bọc Decorator Trong Java I/O
Java I/O áp dụng mẫu thiết kế **Decorator Pattern** để gắn thêm các tính năng:
```
[File trên đĩa]
       │
       ▼
FileInputStream (Byte thô 8-bit)
       │
       ▼
InputStreamReader (Chuyển byte sang ký tự Unicode UTF-8)
       │
       ▼
BufferedReader (Tích hợp bộ đệm RAM 8KB, hỗ trợ đọc từng dòng readLine())
```

### 2.2. Hiện Đại Hóa Với NIO.2 (`java.nio.file.Files`)
Từ Java 7, gói NIO.2 cung cấp các hàm tĩnh cực kỳ tiện lợi cho các file văn bản có kích thước vừa phải:
```java
Path path = Path.of("notes.txt");

// Ghi toàn bộ nội dung trong 1 dòng lệnh (tự động mở, ghi UTF-8, đóng file an toàn)
Files.writeString(path, "Nội dung ghi nhanh");

// Đọc toàn bộ file thành String
String content = Files.readString(path);

// Đọc toàn bộ các dòng thành List<String>
List<String> lines = Files.readAllLines(path);
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Quên Gọi `flush()` Khi Dùng Buffered Streams
Khi ghi dữ liệu vào `BufferedWriter` hoặc `BufferedOutputStream`, dữ liệu tạm thời được giữ lại trong **bộ nhớ đệm RAM** và chưa được ghi thực tế xuống ổ đĩa cứng.
- Nếu chương trình bị treo hoặc bạn đóng luồng không đúng cách, dữ liệu trong bộ đệm sẽ bị **mất trắng**.
- **Khắc phục**: Dùng `try-with-resources` (tự động gọi `close()`, mà `close()` tự động gọi `flush()`), hoặc chủ động gọi `writer.flush()` khi cần dữ liệu xuất hiện ngay lập tức.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [ExceptionIoDemo.java](file:///d:/my-project/revision-document/java/03-exceptions-and-io/ExceptionIoDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Sự khác biệt cốt lõi giữa `java.io` cổ điển (BIO) và `java.nio` (NIO) là gì?**
   *Trả lời*:
   - `java.io`: Dựa trên **Luồng tuần tự (Stream-oriented)** và cơ chế **Chặn (Blocking I/O)**. Một thread bị chặn lại chờ đợi cho đến khi có dữ liệu đọc/ghi xong.
   - `java.nio`: Dựa trên **Khối bộ đệm (Buffer-oriented)**, kênh truyền dẫn **Channels** và cơ chế **Không chặn (Non-blocking I/O)** với bộ giám sát **Selectors**. Một thread duy nhất có thể quản lý hàng nghìn kết nối mạng/file cùng lúc, nền tảng của các server hiệu năng cao như Netty, Tomcat NIO.
2. **Phương thức `readLine()` của `BufferedReader` trả về gì khi đọc đến dòng trống, và trả về gì khi đến cuối file (EOF)?**
   *Trả lời*:
   - Khi gặp một dòng trống hoàn toàn (chỉ có ký tự xuống dòng `\n`): Phương thức trả về chuỗi rỗng `""` (độ dài bằng 0).
   - Khi đã đọc hết file (EOF - End of File): Phương thức trả về giá trị `null`. Do đó điều kiện vòng lặp đọc file luôn là: `while ((line = reader.readLine()) != null)`.
