# Bài 01: Con Trỏ, Địa Chỉ Ô Nhớ RAM & Toán Tử '*' / '&'

Khảo sát nền tảng cốt lõi của con trỏ trong C: Khái niệm địa chỉ bộ nhớ, toán tử lấy địa chỉ `&`, toán tử giải tham chiếu `*`, con trỏ `NULL` và con trỏ tổng quát `void*`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 01: Cú pháp nền tảng C](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/README.md).
- **Trọng tâm hiện tại**:
  - Địa chỉ ô nhớ RAM là gì? Kích thước con trỏ (4 bytes trên 32-bit, 8 bytes trên 64-bit).
  - Toán tử lấy địa chỉ `&` (Address-of operator).
  - Toán tử giải tham chiếu `*` (Dereference operator).
  - Con trỏ `NULL` (Đại diện cho địa chỉ không trỏ vào đâu).
  - Con trỏ tổng quát `void*` (Generic pointer) và quy tắc ép kiểu.
- **Tiếp theo**: [Bài 02: Số Học Con Trỏ & Con Trỏ Mảng](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/02-pointer-arithmetic-and-arrays.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Con Trỏ Dưới Góc Nhìn Phần Cứng
Bộ nhớ RAM có thể được coi là một mảng khổng lồ gồm hàng tỷ ô nhớ, mỗi ô nhớ chứa 1 byte dữ liệu và có một số thứ tự duy nhất gọi là **Địa chỉ ô nhớ (Memory Address)**:

```
Địa chỉ ô nhớ:  0x1000   0x1004   0x1008
Giá trị lưu:   [  42  ] [0x1000] [ ...  ]
Biến:            val      ptr
```
- Khi viết `int val = 42;`: Biến `val` nằm tại địa chỉ `0x1000`, giá trị bên trong là `42`.
- Khi viết `int *ptr = &val;`: Biến `ptr` nằm tại địa chỉ `0x1004`, nhưng **giá trị nó lưu trữ lại chính là địa chỉ `0x1000`**.
- Khi viết `*ptr = 99;`: CPU đọc giá trị bên trong `ptr` (`0x1000`), nhảy tới ô nhớ `0x1000` và ghi đè số `99` vào đó $\rightarrow$ `val` bị đổi thành `99`!

### 2.2. Con Trỏ Tổng Quát `void*`
- `void*` có thể trỏ tới bất kỳ kiểu dữ liệu nào (`int`, `double`, `struct`).
- **Quy tắc**: Bạn **không thể giải tham chiếu trực tiếp `*void_ptr`** hoặc thực hiện phép toán con trỏ trên `void*` vì compiler không biết nó chiếm bao nhiêu byte. Phải ép kiểu sang kiểu cụ thể trước: `*(int*)void_ptr`.

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Con Trỏ Chưa Khởi Tạo (Wild Pointer / Uninitialized Pointer)
```c
int *p; // Biến cục bộ trên Stack chứa giá trị rác ngẫu nhiên (ví dụ 0x7FFF1234)
*p = 100; // ❌ CỰC KỲ NGUY HIỂM: Ghi số 100 vào một ô nhớ bất kỳ của hệ điều hành!
```
- **Quy tắc**: Luôn khởi tạo con trỏ bằng `NULL` hoặc địa chỉ biến hợp lệ ngay khi khai báo: `int *p = NULL;`.

### Bẫy 2: Giải Tham Chiếu Con Trỏ `NULL` (Null Pointer Dereference)
Cố tình đọc hoặc ghi vào con trỏ đang mang giá trị `NULL` (`*NULL`) sẽ làm tiến trình bị hệ điều hành tiêu diệt ngay lập tức với tín hiệu `SIGSEGV` (Segmentation Fault).

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [pointers_demo.c](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/pointers_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Kích thước của một con trỏ kiểu `char*` và kiểu `double*` có khác nhau không?**
   *Trả lời*: **Hoàn toàn bằng nhau**. Mọi con trỏ đều chỉ lưu địa chỉ ô nhớ RAM. Trên kiến trúc 64-bit, tất cả con trỏ (`char*`, `int*`, `double*`, `void*`, `struct*`) đều có kích thước chính xác là **8 bytes**. Kiểu đứng trước con trỏ (`int`, `double`) chỉ dùng để báo cho trình biên dịch biết nó cần đọc/ghi bao nhiêu byte khi thực hiện toán tử giải tham chiếu `*ptr`.
2. **Hằng con trỏ (`int * const ptr`) khác con trỏ trỏ hằng (`const int *ptr`) ở điểm nào?**
   *Trả lời*:
   - `const int *ptr`: Giá trị dữ liệu tại ô nhớ không thể bị sửa đổi qua `ptr` (`*ptr = 10` là lỗi), nhưng con trỏ `ptr` có thể trỏ sang địa chỉ khác.
   - `int * const ptr`: Địa chỉ mà con trỏ lưu trữ là cố định không thể đổi (`ptr = &other` là lỗi), nhưng dữ liệu tại ô nhớ đó có thể sửa đổi thoải mái (`*ptr = 10` hợp lệ).
