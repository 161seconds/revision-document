# Bài 03: Thao Tác Tập Tin `File` & Luồng Byte Streams

Khảo sát toàn diện về lớp đại diện siêu dữ liệu tập tin `java.io.File`, cơ chế đọc/ghi file nhị phân (hình ảnh, video, âm thanh, dữ liệu nén) thông qua luồng byte `FileInputStream` và `FileOutputStream`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: try-with-resources & Ngoại Lệ Tùy Chỉnh](file:///d:/my-project/revision-document/java/03-exceptions-and-io/02-try-with-resources-and-custom-exceptions.md).
- **Trọng tâm hiện tại**:
  - Lớp `java.io.File`: Kiểm tra tồn tại, tạo mới, lấy kích thước, xóa file, duyệt thư mục.
  - Khái niệm Luồng I/O (Input/Output Streams) theo cơ chế tuần tự.
  - `InputStream` & `OutputStream`: Lớp trừu tượng gốc của Byte Streams (đơn vị: 8-bit byte).
  - `FileInputStream` và `FileOutputStream`: Thao tác dữ liệu nhị phân.
  - Kỹ thuật dùng bộ đệm mảng byte `byte[] buffer = new byte[4096]` để tăng tốc độ I/O.
- **Tiếp theo**: [Bài 04: Character Streams & Buffered I/O](file:///d:/my-project/revision-document/java/03-exceptions-and-io/04-character-streams-and-buffered-io.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất Lớp `java.io.File`
- `File` không trực tiếp chứa dữ liệu bên trong tập tin. Nó chỉ là một đối tượng trừu tượng đại diện cho **Đường dẫn (Pathname)** của tập tin hoặc thư mục trên hệ điều hành.
- Các phương thức cốt lõi:
  - `file.exists()`: Kiểm tra đường dẫn có tồn tại hay không.
  - `file.createNewFile()`: Tạo file rỗng mới trên đĩa (trả về true/false).
  - `file.length()`: Trả về kích thước file tính theo đơn vị byte.
  - `file.delete()`: Xóa file hoặc thư mục rỗng.
  - `file.listFiles()`: Liệt kê danh sách các file con trong thư mục.

### 2.2. Luồng Byte Streams (Byte-Oriented I/O)
- Byte Streams đọc/ghi dữ liệu ở dạng **nhị phân thô (Raw binary data)**, mỗi lần 1 byte (giá trị từ 0 đến 255).
- Do không can thiệp vào bảng mã ký tự (Character Encoding), Byte Streams là lựa chọn duy nhất cho các file định dạng nhị phân như `.png`, `.jpg`, `.mp4`, `.zip`, `.pdf`.

```java
// Sao chép file nhị phân với bộ đệm mảng byte 4KB
try (FileInputStream fis = new FileInputStream("source.jpg");
     FileOutputStream fos = new FileOutputStream("dest.jpg")) {
    byte[] buffer = new byte[4096];
    int bytesRead;
    while ((bytesRead = fis.read(buffer)) != -1) {
        fos.write(buffer, 0, bytesRead);
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Đọc/Ghi Từng Byte Đơn Lẻ Không Dùng Buffer
- Gọi `fis.read()` hoặc `fos.write(b)` trong vòng lặp mà không dùng mảng đệm (`byte[]`) sẽ kích hoạt hàng trăm nghìn lời gọi hệ thống (System Calls) xuống kernel của ổ đĩa, làm tốc độ sao chép file chậm hơn hàng trăm lần!
- **Khắc phục**: Luôn đọc theo chunk kích thước $4\text{KB}$ đến $16\text{KB}$ hoặc bọc trong `BufferedInputStream`.

### Bẫy 2: Dùng Byte Stream Đọc File Văn Bản UTF-8 Đa Byte
- Một ký tự tiếng Việt (như `ế`, `ạ`) trong UTF-8 chiếm 2 đến 3 bytes. Nếu đọc từng byte lẻ qua Byte Stream rồi ép sang `(char) b`, ký tự sẽ bị vỡ thành rác hiển thị (Mojibake).
- **Khắc phục**: Với văn bản, bắt buộc dùng **Character Streams** (`Reader`/`Writer`).

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [ExceptionIoDemo.java](file:///d:/my-project/revision-document/java/03-exceptions-and-io/ExceptionIoDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Phương thức `read()` của `InputStream` trả về kiểu `int` chứ không phải `byte`. Tại sao?**
   *Trả lời*: Kiểu `byte` trong Java có giá trị có dấu từ $-128$ đến $127$. Để biểu diễn tín hiệu **kết thúc luồng (End Of Stream - EOF)**, phương thức cần trả về giá trị `-1`. Do đó, `read()` dùng kiểu `int` 32-bit: Trả về các giá trị từ $0$ đến $255$ nếu đọc thành công 1 byte, và trả về `-1` khi đã chạm đến cuối file.
2. **Phương thức `file.delete()` có xóa được thư mục chứa file bên trong không?**
   *Trả lời*: **Không**. `delete()` chỉ xóa được file hoặc một **thư mục hoàn toàn rỗng**. Nếu thư mục có chứa file con, phương thức sẽ trả về `false`. Muốn xóa toàn bộ cây thư mục, phải viết hàm duyệt đệ quy xóa hết file con trước, hoặc dùng tiện ích `Files.walkFileTree()` của gói `java.nio.file`.
