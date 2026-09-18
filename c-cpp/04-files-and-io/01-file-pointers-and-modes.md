# Bài 01: Con Trỏ Tệp `FILE*` & Ma Trận Các Chế Độ Mở Tập Tin

Khảo sát khái niệm Luồng nhập xuất (Streams) trong C, cấu trúc đại diện tệp `FILE*` và ma trận các chế độ mở tệp với hàm `fopen()`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Con Trỏ & Quản Lý Bộ Nhớ](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/README.md).
- **Trọng tâm hiện tại**:
  - Khái niệm Stream trong C: Luồng dữ liệu tuần tự nối giữa chương trình và thiết bị ngoại vi.
  - 3 luồng tiêu chuẩn luôn mở sẵn: `stdin` (Bàn phím), `stdout` (Màn hình), `stderr` (Màn hình lỗi).
  - Kiểu cấu trúc `FILE`: Quản lý bộ đệm, vị trí con trỏ đọc/ghi, cờ báo lỗi.
  - Ma trận các chế độ mở file: `"r"`, `"w"`, `"a"`, `"r+"`, `"w+"`, `"a+"`.
  - Hậu tố `"b"` cho chế độ nhị phân (Binary): `"rb"`, `"wb"`, `"ab"`.
- **Tiếp theo**: [Bài 02: Thao Tác Tệp Văn Bản Text I/O](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/02-text-file-operations.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Ma Trận Các Chế Độ Mở Tệp (`fopen`)

| Chế Độ | Mục Đích | Nếu File ĐÃ Tồn Tại | Nếu File CHƯA Tồn Tại | Vị Trí Ban Đầu Của Con Trỏ File |
| :---: | :--- | :--- | :--- | :---: |
| **`"r"`** | Chỉ đọc (Read) | Giữ nguyên dữ liệu | **Trả về `NULL` (Lỗi)** | Đầu file |
| **`"w"`** | Chỉ ghi (Write) | **Xóa sạch nội dung cũ (Truncate 0 byte)** | Tạo file mới | Đầu file |
| **`"a"`** | Ghi nối tiếp (Append)| Giữ nguyên nội dung cũ | Tạo file mới | **Cuối file** |
| **`"r+"`**| Đọc và Ghi (Update) | Giữ nguyên dữ liệu | **Trả về `NULL` (Lỗi)** | Đầu file |
| **`"w+"`**| Đọc và Ghi (Update) | **Xóa sạch nội dung cũ** | Tạo file mới | Đầu file |
| **`"a+"`**| Đọc và Ghi nối tiếp | Giữ nguyên dữ liệu | Tạo file mới | Đọc ở đầu, ghi ở cuối |

### 2.2. Chế Độ Văn Bản (Text) vs Nhị Phân (Binary)
- **Trên Windows**:
  - Chế độ Text: Tự động chuyển đổi cặp byte `\r\n` (CRLF) trên đĩa thành ký tự đơn `\n` (LF) khi đọc vào RAM, và ngược lại khi ghi ra đĩa.
  - Chế độ Binary (`"rb"`, `"wb"`): **Không thực hiện bất kỳ sự chuyển đổi byte nào**, giữ nguyên 100% dữ liệu gốc (ảnh PNG, video MP4, file nén ZIP).
- **Trên Linux/macOS**: Không có sự khác biệt giữa text và binary (do đều dùng LF `\n`), nhưng luôn nên thêm `"b"` để code tương thích đa nền tảng (Cross-platform).

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Mở File Bằng Chế Độ `"w"` Làm Mất Dữ Liệu Vĩnh Viễn
Mở một file quan trọng bằng mode `"w"` sẽ lập tức **xóa trắng (Truncate)** toàn bộ nội dung file về 0 byte ngay cả khi bạn chưa hề gọi bất kỳ lệnh ghi nào!
- Nếu chỉ muốn ghi nối thêm vào cuối file, luôn dùng chế độ `"a"`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [files_demo.c](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/files_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **`FILE*` thực chất là gì? Có phải con trỏ trỏ trực tiếp vào ổ cứng không?**
   *Trả lời*: Không. `FILE*` là con trỏ trỏ tới một cấu trúc `struct _IO_FILE` (trong thư viện C runtime) nằm trên bộ nhớ **RAM**. Cấu trúc này lưu trữ File Descriptor của hệ điều hành, con trỏ quản lý bộ đệm RAM (Buffer), chỉ số vị trí byte hiện tại trong file và các cờ trạng thái lỗi (`EOF`, `error`).
2. **Tại sao hàm `fopen()` lại trả về `NULL`? Khi nào nó xảy ra?**
   *Trả lời*: `fopen()` trả về `NULL` khi hệ điều hành không thể mở tệp. Nguyên nhân phổ biến: File không tồn tại (khi mở mode `"r"`), tiến trình không có quyền đọc/ghi trên thư mục (Permission Denied), đường dẫn file không hợp lệ, hoặc tiến trình đã mở chạm tới giới hạn số file tối đa của hệ điều hành (Too many open files).
