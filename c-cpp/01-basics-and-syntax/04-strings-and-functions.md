# Bài 04: Chuỗi Ký Tự Null-Terminated `\0`, Thư Viện `string.h` & Hàm

Khảo sát chuyên sâu bản chất chuỗi ký tự kết thúc bằng `\0` trong C, các hàm xử lý chuỗi chuẩn, nguy cơ bảo mật tràn bộ đệm (Buffer Overflow), bản chất truyền tham số Pass-by-value và đệ quy an toàn.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: Cấu Trúc Điều Khiển & Mảng](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/03-control-flow-and-arrays.md).
- **Trọng tâm hiện tại**:
  - Chuỗi trong C là mảng ký tự kết thúc bằng `\0` (ASCII 0).
  - Khác biệt giữa mảng chuỗi trên Stack `char str[]` và con trỏ hằng chuỗi trong Text Segment `char *str`.
  - Các hàm trong `<string.h>`: `strlen`, `strcpy`, `strncpy`, `strcat`, `strcmp`.
  - Hàm trong C: Khai báo nguyên mẫu (Function Prototype) vs Định nghĩa (Definition).
  - Bản chất Pass-by-value 100% trong C.
  - Hàm đệ quy và điều kiện dừng Base case.
- **Tiếp theo**: [Module 02: Con Trỏ & Quản Lý Bộ Nhớ Hệ Thống](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất Ký Tự Kết Thúc `\0`
- Mọi hàm trong thư viện `<string.h>` như `strlen()`, `printf("%s")` đều hoạt động bằng cách: **Bắt đầu từ địa chỉ đầu tiên, duyệt từng byte sang phải cho đến khi gặp byte có giá trị 0 (`\0`) thì dừng lại**.
- Nếu chuỗi của bạn bị mất ký tự `\0`, các hàm trên sẽ tiếp tục đọc tràn sang các ô nhớ bên cạnh cho đến khi gặp số 0 ngẫu nhiên nào đó trong RAM, gây rò rỉ dữ liệu hoặc Segmentation Fault!

### 2.2. Nhập Chuỗi An Toàn: `fgets()` Thay Thế Hoàn Toàn `gets()` và `scanf("%s")`
```c
char buffer[100];

// ❌ NGUY HIỂM: scanf("%s") không giới hạn độ dài nhập, gây Buffer Overflow
// scanf("%s", buffer);

// ✅ CHUẨN AN TOÀN: fgets chỉ đọc tối đa (sizeof(buffer) - 1) ký tự và luôn tự chèn '\0'
if (fgets(buffer, sizeof(buffer), stdin) != NULL) {
    // Xóa ký tự xuống dòng '\n' nếu có
    buffer[strcspn(buffer, "\n")] = '\0';
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Sửa Đổi Hằng Chuỗi Literal (Text Segment)
```c
char *s = "Hello";
s[0] = 'h'; // ❌ CRASH: Bus Error / Segmentation Fault!
// Vì "Hello" được đặt trong Text Segment (chỉ đọc) của file thực thi.

char s_stack[] = "Hello";
s_stack[0] = 'h'; // ✅ HỢP LỆ: Mảng này được sao chép lên Stack của hàm.
```

### Bẫy 2: Hàm `sizeof` vs `strlen` Trên Chuỗi
- `strlen(s)`: Đếm số ký tự thực tế cho đến trước `\0`.
- `sizeof(s)`: Trả về tổng dung lượng byte của cả mảng bộ nhớ (bao gồm cả `\0` và các byte chưa dùng).

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [basics_demo.c](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/basics_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao hàm `gets()` bị loại bỏ hoàn toàn khỏi chuẩn C11?**
   *Trả lời*: Hàm `gets()` đọc dữ liệu từ `stdin` cho đến khi gặp dòng mới mà không hề nhận tham số kích thước bộ đệm đích. Nếu người dùng nhập nhiều hơn kích thước mảng đã cấp phát, nó sẽ ghi đè lên bộ nhớ Stack (Stack Buffer Overflow). Đây là lỗ hổng bảo mật kinh điển nhất trong lịch sử máy tính (từng được dùng bởi sâu máy tính Morris Worm năm 1988).
2. **`strncpy` an toàn hơn `strcpy` nhưng vẫn có bẫy gì cần lưu ý?**
   *Trả lời*: Nếu độ dài chuỗi nguồn `src` lớn hơn hoặc bằng tham số $n$, hàm `strncpy` sẽ sao chép đúng $n$ ký tự và **KHÔNG tự động chèn ký tự `\0` vào cuối `dest`**! Chuỗi `dest` lúc này sẽ không có ký tự kết thúc. Do đó lập trình viên phải luôn gán thêm `dest[n - 1] = '\0'`.
