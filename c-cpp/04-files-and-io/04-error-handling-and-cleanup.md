# Bài 04: Kiểm Tra Lỗi Tập Tin, Xả Bộ Đệm RAM & Dọn Dẹp An Toàn

Khảo sát cơ chế phát hiện và xử lý lỗi trong C I/O, kiểm tra mã lỗi hệ thống toàn cục `errno`, hàm `perror()` và `strerror()`, cơ chế xả bộ đệm `fflush()`, đóng file `fclose()` và xóa tệp bằng `remove()`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: Thao Tác Tệp Nhị Phân & Điều Hướng](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/03-binary-file-operations.md).
- **Trọng tâm hiện tại**:
  - Biến toàn cục `errno` trong `<errno.h>`.
  - In thông điệp lỗi hệ điều hành: `perror(prefix)` và `strerror(errno)`.
  - Phân biệt giữa chạm đuôi file (`feof()`) và lỗi đọc phần cứng (`ferror()`).
  - Xóa cờ báo lỗi bằng `clearerr(fp)`.
  - Cơ chế xả bộ đệm `fflush(fp)` xuống ổ đĩa.
  - Tầm quan trọng của việc gọi `fclose()` và xóa tệp bằng `remove(path)`.
- **Tiếp theo**: [Module 05: C Nâng Cao, Tiền Xử Lý & Nền Tảng C++](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Biến Mã Lỗi Toàn Cục `errno` & Hàm `perror()`
- Khi một hàm hệ thống (như `fopen`, `fread`) thất bại, nó không chỉ trả về `NULL` hay `-1`, mà còn tự động gán một mã số lỗi nguyên thủy vào biến toàn cục **`errno`** (ví dụ `ENOENT`: File không tồn tại, `EACCES`: Không có quyền truy cập).
- `perror(msg)`: Tự động tra cứu mã `errno` hiện tại và in ra `stderr` chuỗi thông báo lỗi chi tiết bằng ngôn ngữ của hệ điều hành.

```c
FILE *fp = fopen("/root/secret.txt", "r");
if (fp == NULL) {
    perror("Loi fopen"); // In ra: "Loi fopen: Permission denied"
}
```

### 2.2. Cơ Chế Bộ Đệm RAM Của Thư Viện C & Hàm `fflush()`
- Để bảo vệ tuổi thọ ổ đĩa và tăng tốc độ, thư viện C duy trì một **khối đệm RAM 4KB - 8KB**.
- Khi bạn gọi `fprintf()`, dữ liệu **chưa được ghi ngay xuống ổ cứng** mà tạm thời nằm lại trong RAM.
- Dữ liệu chỉ thực sự được ghi xuống ổ đĩa vật lý khi:
  1. Bộ đệm RAM bị đầy (Buffer Full).
  2. Bạn chủ động gọi `fflush(fp);`.
  3. Bạn gọi `fclose(fp);` (hàm này tự động gọi `fflush` trước khi đóng).
  4. Chương trình kết thúc bình thường qua lệnh `exit(0)` hoặc `return 0` trong `main`.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Gọi `fflush(stdin)` (Hành Vi Bất Định)
Nhiều giáo trình cũ khuyên dùng `fflush(stdin);` để xóa bộ đệm bàn phím.
- **SỰ THẬT THEO CHUẨN C**: `fflush()` chỉ được chuẩn hóa cho luồng đầu ra (**Output Streams**). Gọi `fflush` trên luồng đầu vào (`stdin`) là **hành vi bất định (Undefined Behavior)** và hoàn toàn không hoạt động trên Linux/macOS.
- **Cách xóa bộ đệm chuẩn 100%**:
  ```c
  int c;
  while ((c = getchar()) != '\n' && c != EOF);
  ```

### Bẫy 2: Cạn Kiệt File Descriptors Do Quên `fclose()`
Mỗi tiến trình chỉ được hệ điều hành cấp phép mở tối đa một số lượng file nhất định (thường là 1024 tệp). Nếu mở file trong vòng lặp mà quên `fclose(fp)`, hệ điều hành sẽ từ chối mở thêm tệp mới, làm tê liệt toàn bộ ứng dụng.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [files_demo.c](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/files_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Hàm `remove(filename)` trả về giá trị gì khi thành công và thất bại?**
   *Trả lời*: `remove()` trả về `0` nếu xóa tệp thành công, và trả về giá trị khác 0 (thường là `-1`) nếu thất bại (ví dụ tệp không tồn tại hoặc đang bị một tiến trình khác khóa quyền ghi).
2. **Sự khác biệt giữa `feof(fp)` và `ferror(fp)` là gì?**
   *Trả lời*:
   - `feof(fp)`: Trả về khác 0 khi luồng đọc chạm đến **điểm kết thúc tự nhiên của tệp (End-of-file)** một cách bình thường.
   - `ferror(fp)`: Trả về khác 0 khi xảy ra **lỗi phần cứng hoặc gián đoạn hệ thống** trong quá trình đọc/ghi (ví dụ: ổ đĩa bị rút đột ngột, lỗi bad sector, lỗi quyền truy cập).
