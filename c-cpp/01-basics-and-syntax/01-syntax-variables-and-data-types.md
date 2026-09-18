# Bài 01: Cú Pháp Nền Tảng, Kiểu Dữ Liệu & Mã Định Dạng Trong C

Khảo sát cấu trúc chương trình C, hàm `main`, bảng mã định dạng `printf`/`scanf`, toán tử `sizeof` và giới hạn các kiểu số nguyên trong `<limits.h>`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: Khái niệm về nhị phân và byte trong phần cứng máy tính.
- **Trọng tâm hiện tại**:
  - Cấu trúc file `.c`, tiền xử lý `#include <stdio.h>`, hàm `int main(int argc, char *argv[])`.
  - Các kiểu nguyên thủy: `char`, `short`, `int`, `long`, `float`, `double`.
  - Bảng mã định dạng `printf` và `scanf` (`%d`, `%f`, `%lf`, `%c`, `%s`, `%p`).
  - Toán tử `sizeof` đánh giá kích thước tại thời điểm biên dịch.
  - Hằng số: từ khóa `const` vs chỉ thị `#define`.
- **Tiếp theo**: [Bài 02: Toán tử & Thao tác Bitwise](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/02-operators-and-bitwise.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Cấu Trúc Khung & Hàm `main`
```c
#include <stdio.h>

int main(int argc, char *argv[]) {
    printf("C Core Revision\n");
    return 0; // Báo hiệu hệ điều hành: Tiến trình kết thúc bình thường không lỗi
}
```
- `argc` (Argument Count): Số lượng đối số truyền vào từ dòng lệnh CLI (luôn $\ge 1$, phần tử đầu tiên `argv[0]` là tên chương trình).
- `argv` (Argument Vector): Mảng con trỏ chứa các chuỗi đối số.

### 2.2. Kích Thước Kiểu Dữ Liệu & Toán Tử `sizeof`
- Toán tử `sizeof` là **toán tử lúc biên dịch (Compile-time operator)**, nó không thực sự chạy code bên trong ngoặc:
  `sizeof(int)` trả về giá trị kiểu `size_t` (thường là 4 bytes).
- Thư viện `<limits.h>` định nghĩa giá trị cực đại/cực tiểu: `INT_MIN`, `INT_MAX`, `UCHAR_MAX`.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Quên Dấu `&` Trong Lệnh `scanf`
```c
int x;
scanf("%d", x); // ❌ LỖI NGHIÊM TRỌNG: Truyền giá trị rác của x làm địa chỉ bộ nhớ!
// Gây Segmentation Fault ngay lập tức vì ghi vào địa chỉ ngẫu nhiên.
scanf("%d", &x); // ✅ ĐÚNG: Truyền địa chỉ ô nhớ của x qua toán tử &
```

### Bẫy 2: Sai Khác Format Specifier Giữa `float` và `double`
- Khi in bằng `printf`: Cả `float` và `double` đều dùng `%f` (do cơ chế Default Argument Promotion tự nới rộng float thành double).
- Khi nhập bằng `scanf`: `float` dùng `%f`, còn `double` **bắt buộc phải dùng `%lf`**! Dùng sai sẽ làm sai lệch dữ liệu 64-bit của double.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [basics_demo.c](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/basics_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Từ khóa `const` trong C khác gì với chỉ thị `#define`?**
   *Trả lời*:
   - `#define`: Do bộ tiền xử lý (Preprocessor) thay thế chuỗi văn bản thô trước khi biên dịch, không có kiểu dữ liệu, không chiếm ô nhớ, khó debug.
   - `const`: Do trình biên dịch quản lý, có kiểm tra kiểu dữ liệu an toàn (`Type Safety`), chiếm ô nhớ thực tế trong RAM (thường nằm ở Read-Only Data segment) và có thể lấy địa chỉ ô nhớ `&constant_var`.
2. **Giá trị trả về của hàm `main` có ý nghĩa gì đối với hệ điều hành?**
   *Trả lời*: Giá trị trả về từ `main` trở thành **Mã thoát (Exit Status Code)** của tiến trình. Theo chuẩn POSIX, trả về `0` (hoặc `EXIT_SUCCESS`) biểu thị tiến trình kết thúc thành công. Giá trị khác `0` (ví dụ `1`, `EXIT_FAILURE`) báo hiệu tiến trình gặp lỗi, giúp các kịch bản shell script (Bash, PowerShell) kiểm tra qua `$?` hoặc `$LASTEXITCODE`.
