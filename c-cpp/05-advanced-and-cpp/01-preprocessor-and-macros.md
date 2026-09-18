# Bài 01: Bộ Tiền Xử Lý (C Preprocessor), Macros & Include Guards

Khảo sát giai đoạn đầu tiên của quá trình biên dịch trong C: Cơ chế hoạt động của bộ tiền xử lý (Preprocessor), cách định nghĩa Macro an toàn, bẫy dấu ngoặc đơn, toán tử chuỗi hóa `#`, toán tử ghép token `##`, và cấu trúc bảo vệ Include Guards.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 01: Cú pháp nền tảng C](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/README.md).
- **Trọng tâm hiện tại**:
  - Các chỉ thị tiền xử lý bắt đầu bằng dấu thăng `#` (`#include`, `#define`, `#undef`).
  - Biên dịch có điều kiện: `#ifdef`, `#ifndef`, `#else`, `#endif`.
  - Include Guards (`#ifndef HEADER_H` $\dots$ `#endif`) và chỉ thị `#pragma once`.
  - Macro giống hàm (Function-like Macros) và bẫy mở rộng biểu thức.
  - Toán tử chuỗi hóa (Stringification `#`) và Ghép mã (Token-pasting `##`).
- **Tiếp theo**: [Bài 02: Con Trỏ Hàm & Callbacks](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/02-function-pointers-and-callbacks.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. 4 Giai Đoạn Biên Dịch Chương Trình C
1. **Giai đoạn Tiền xử lý (Preprocessing)**: Mở rộng các macro, gộp mã từ các file `#include`, loại bỏ chú thích (Comments), sinh ra file văn bản `.i`.
2. **Giai đoạn Biên dịch (Compilation)**: Dịch mã C sang mã Hợp ngữ (Assembly code `.s`).
3. **Giai đoạn Hợp dịch (Assembly)**: Dịch mã assembly sang mã máy nhị phân Object File `.o`.
4. **Giai đoạn Liên kết (Linking)**: Trình liên kết (`ld`) kết nối các file `.o` với thư viện chuẩn để sinh ra file thực thi cuối cùng (Executable `.exe` hoặc ELF binary).

### 2.2. Bẫy Dấu Ngoặc Đơn Trong Function-Like Macros
Bộ tiền xử lý chỉ thực hiện **thay thế chuỗi văn bản thô (Textual substitution)**:

```c
// ❌ SAI: Thiếu dấu ngoặc đơn quanh tham số và toàn bộ biểu thức
#define MULTIPLY(a, b) a * b
int res = MULTIPLY(2 + 3, 4); // Bị mở rộng thành: 2 + 3 * 4 = 14 (thay vì 20)!

// ❌ VẪN SAI: Có ngoặc tham số nhưng thiếu ngoặc toàn biểu thức
#define SQUARE(x) ((x) * (x))
int val = 100 / SQUARE(5);   // Bị mở rộng thành: 100 / ((5) * (5)) = 100 / 5 * 5 = 100 (thay vì 4)!

// ✅ ĐÚNG CHUẨN 100%: Luôn bọc từng tham số VÀ toàn bộ macro trong ngoặc đơn
#define SAFE_SQUARE(x) (((x) * (x)))
```

### 2.3. Include Guards Chống Định Nghĩa Trùng Lặp
Khi file A và file B cùng `#include "struct.h"`, file `main.c` include cả A và B sẽ gặp lỗi `Redefinition of struct`. Include Guards ngăn chặn điều này:
```c
#ifndef MY_TYPES_H
#define MY_TYPES_H

typedef struct {
    int id;
} MyType;

#endif // MY_TYPES_H
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Tác Dụng Phụ Khi Dùng Toán Tử `++` Trong Macro
```c
#define MAX(a, b) (((a) > (b)) ? (a) : (b))

int x = 5, y = 10;
int m = MAX(x++, y++); // Biến y sẽ bị tăng HAI LẦN do xuất hiện 2 lần trong macro!
// Sau lệnh này: y trở thành 12!
```
- **Khắc phục**: Với các hàm phức tạp, luôn ưu tiên viết hàm tĩnh `static inline` thay vì macro.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [advanced_demo.c](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/advanced_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Toán tử `#` và `##` trong C Preprocessor dùng để làm gì?**
   *Trả lời*:
   - Toán tử `#` (Stringification): Biến tham số macro thành một chuỗi ký tự trong dấu ngoặc kép. Ví dụ `#define TO_STR(x) #x` $\rightarrow$ `TO_STR(123)` trở thành `"123"`.
   - Toán tử `##` (Token Pasting): Ghép nối hai từ tố (tokens) rời rạc thành một token duy nhất. Ví dụ `#define CONCAT(a, b) a##b` $\rightarrow$ `CONCAT(var, 1)` trở thành biến `var1`.
2. **`#pragma once` khác gì với Include Guards truyền thống?**
   *Trả lời*:
   - `#pragma once` là chỉ thị phi chuẩn nhưng được hầu hết compiler hiện đại hỗ trợ, viết ngắn gọn ở đầu file, giúp compiler bỏ qua file mà không cần mở ra đọc lại.
   - Include Guards truyền thống (`#ifndef ... #define ... #endif`) tuân thủ 100% chuẩn ANSI C, chạy được trên mọi compiler dù cổ điển nhất, nhưng compiler vẫn phải mở file ra để kiểm tra `#ifndef`.
