# Bảng Tra Cứu Toàn Diện C / C++ & Quản Lý Bộ Nhớ Hệ Thống (Master C/C++ Cheat Sheet)

Bảng tổng hợp toàn diện hơn 60+ chủ đề lập trình C và nền tảng C++ theo chuẩn W3Schools và kiến trúc hệ thống cấp thấp: Cú pháp nền tảng, Bản đồ bộ nhớ tiến trình (Process Memory Layout), Thao tác Bitwise, Chuỗi ký tự null-terminated `\0`, Con trỏ (Pointers) & Con trỏ mảng, Cấp phát bộ nhớ động (`malloc`/`calloc`/`realloc`/`free`), Cấu trúc `struct`, `union`, `enum`, File I/O, Macro tiền xử lý, Con trỏ hàm, C++ Core và Top 10 Bẫy lỗi bộ nhớ sống còn (Segmentation Fault, Memory Leak).

---

## Mục Lục

1. [Kiến Trúc Bản Đồ Bộ Nhớ Tiến Trình (Process Memory Layout)](#1-kiến-trúc-bản-đồ-bộ-nhớ-tiến-trình-process-memory-layout)
2. [Cú Pháp Cốt Lõi, Biến & Bảng Mã Định Dạng (Format Specifiers)](#2-cú-pháp-cốt-lõi-biến--bảng-mã-định-dạng-format-specifiers)
3. [Toán Tử, Độ Ưu Tiên & Thao Tác Bitwise](#3-toán-tử-độ-ưu-tiên--thao-tác-bitwise)
4. [Chuỗi Ký Tự Trong C (`\0`) & Thư Viện `string.h`](#4-chuỗi-ký-tự-trong-c-0--thư-viện-stringh)
5. [Mảng & Cấu Trúc Điều Khiển](#5-mảng--cấu-trúc-điều-khiển)
6. [Hàm, Phạm Vi Biến & Cơ Chế Truyền Tham Số](#6-hàm-phạm-vi-biến--cơ-chế-truyền-tham-số)
7. [Con Trỏ (Pointers Deep Dive) & Phép Toán Con Trỏ](#7-con-trỏ-pointers-deep-dive--phép-toán-con-trỏ)
8. [Quản Lý Bộ Nhớ Động (`malloc`, `calloc`, `realloc`, `free`)](#8-quản-lý-bộ-nhớ-động-malloc-calloc-realloc-free)
9. [Cấu Trúc Tự Định Nghĩa: `struct`, `typedef`, `union`, `enum`](#9-cấu-trúc-tự-định-nghĩa-struct-typedef-union-enum)
10. [Xử Lý Tập Tin (File I/O Streams)](#10-xử-lý-tập-tin-file-io-streams)
11. [Chỉ Thị Tiền Xử Lý (C Preprocessor & Macros)](#11-chỉ-thị-tiền-xử-lý-c-preprocessor--macros)
12. [Con Trỏ Hàm (Function Pointers) & Callbacks](#12-con-trỏ-hàm-function-pointers--callbacks)
13. [C++ Cốt Lõi So Với C (References, `new`/`delete`, OOP)](#13-c-cốt-lõi-so-với-c-references-newdelete-oop)
14. [Top 10 Bẫy Lỗi Bộ Nhớ Sống Còn (Memory Pitfalls & Gotchas)](#14-top-10-bẫy-lỗi-bộ-nhớ-sống-còn-memory-pitfalls--gotchas)

---

## 1. Kiến Trúc Bản Đồ Bộ Nhớ Tiến Trình (Process Memory Layout)

Khi một chương trình C được hệ điều hành (OS) nạp vào RAM để thực thi thành một tiến trình (Process), không gian địa chỉ ảo (Virtual Address Space) được chia thành 5 phân vùng cố định:

```
Địa chỉ cao (High Address: 0xFFFFFFFF trên 32-bit)
+-------------------------------------------------------------+
|    Environment Variables & Command-Line Arguments (argv)    |
+-------------------------------------------------------------+
|    STACK (Ngăn xếp - Phát triển xuống địa chỉ THẤP  ↓)      |
|    - Biến cục bộ (local variables)                          |
|    - Địa chỉ trả về hàm (Return address), Frame pointers    |
+-------------------------------------------------------------+
|                              ↓                              |
|                                                             |
|                              ↑                              |
+-------------------------------------------------------------+
|    HEAP (Bộ nhớ động - Phát triển lên địa chỉ CAO   ↑)      |
|    - Cấp phát thủ công bởi malloc(), calloc(), realloc()    |
|    - Tồn tại cho đến khi gọi free()                         |
+-------------------------------------------------------------+
|    BSS Segment (Uninitialized Data)                         |
|    - Biến toàn cục & biến static CHƯA khởi tạo (hoặc = 0)   |
|    - Hệ điều hành tự động điền 0 khi khởi chạy             |
+-------------------------------------------------------------+
|    DATA Segment (Initialized Data)                          |
|    - Biến toàn cục & biến static ĐÃ khởi tạo giá trị khác 0 |
+-------------------------------------------------------------+
|    TEXT Segment (Code Segment - Chỉ đọc / Read-Only)        |
|    - Chứa mã máy thực thi nhị phân của chương trình         |
|    - Chứa các hằng chuỗi ký tự (String Literals)            |
+-------------------------------------------------------------+
Địa chỉ thấp (Low Address: 0x00000000)
```

| Phân Vùng | Tốc Độ | Cơ Chế Thu Hồi | Rủi Ro Lỗi Thường Gặp |
| :--- | :---: | :--- | :--- |
| **Stack** | Cực nhanh (CPU chỉ dịch con trỏ SP) | Tự động khi hàm trả về (LIFO) | `Stack Overflow` (do đệ quy sâu hoặc mảng cục bộ quá lớn) |
| **Heap** | Chậm hơn (OS phải tìm khoảng trống) | Lập trình viên phải tự giải phóng bằng `free()` | `Memory Leak`, `Fragmentation`, `Dangling Pointer` |
| **Text/Data** | N/A | Tồn tại suốt vòng đời tiến trình | Ghi đè vào Text $\rightarrow$ `Segmentation Fault` ngay lập tức |

---

## 2. Cú Pháp Cốt Lõi, Biến & Bảng Mã Định Dạng (Format Specifiers)

### 2.1. Cấu Trúc Khung Một Chương Trình C
```c
#include <stdio.h>  // Thư viện Standard Input/Output chuẩn

int main(int argc, char *argv[]) {
    printf("Xin chao C Programming!\n");
    return 0; // Trả về 0 báo hiệu cho OS biết chương trình chạy thành công
}
```

### 2.2. Bảng Kiểu Dữ Liệu Chuẩn ANSI C (Kích thước trên hệ 64-bit)
| Kiểu Dữ Liệu | Kích Thước | Miền Giá Trị | Mã Định Dạng `printf`/`scanf` |
| :--- | :---: | :--- | :---: |
| `char` | 1 byte | $-128 \dots 127$ (ASCII) | `%c` |
| `unsigned char` | 1 byte | $0 \dots 255$ | `%c` / `%u` |
| `short` | 2 bytes | $-32,768 \dots 32,767$ | `%hd` |
| `int` | 4 bytes | $-2,147,483,648 \dots 2,147,483,647$ | `%d` hoặc `%i` |
| `unsigned int` | 4 bytes | $0 \dots 4,294,967,295$ | `%u` |
| `long` | 4 hoặc 8 bytes | Phụ thuộc hệ điều hành (Windows 4, Linux 8) | `%ld` |
| `long long` | 8 bytes | $-2^{63} \dots 2^{63}-1$ | `%lld` |
| `float` | 4 bytes | IEEE 754 đơn chính xác (~6 chữ số) | `%f` |
| `double` | 8 bytes | IEEE 754 kép chính xác (~15 chữ số) | `%f` (printf) / `%lf` (scanf) |
| `void*` / Con trỏ | 8 bytes (64-bit) | Địa chỉ vùng nhớ RAM | `%p` |
| Hệ 16 (Hex) | Theo kiểu | Biểu diễn cơ số 16 (`0x...`) | `%x` (thường) / `%X` (hoa) |
| `size_t` | 8 bytes (64-bit) | Kiểu số nguyên không âm đo kích thước | `%zu` |

> [!IMPORTANT]
> Với `scanf()`, bạn **bắt buộc phải truyền địa chỉ ô nhớ (toán tử `&`)** của biến:
> `int age; scanf("%d", &age);` (Quên `&` sẽ gây ghi đè địa chỉ ngẫu nhiên $\rightarrow$ Crash chương trình).

---

## 3. Toán Tử, Độ Ưu Tiên & Thao Tác Bitwise

### 3.1. Các Phép Toán Thao Tác Bit (Bitwise Operations)

| Phép Toán | Ký Hiệu | Mô Tả | Ví Dụ Thực Tiễn |
| :--- | :---: | :--- | :--- |
| **AND** | `&` | Chỉ bằng 1 khi cả 2 bit đều bằng 1 | **Kiểm tra số chẵn/lẻ**: `(n & 1) == 0` (Chẵn) |
| **OR** | `\|` | Bằng 1 khi ít nhất 1 bit bằng 1 | **Bật (Set) bit thứ $k$**: `flags |= (1 << k)` |
| **XOR** | `^` | Bằng 1 khi 2 bit KHÁC nhau | **Đảo (Toggle) bit thứ $k$**: `flags ^= (1 << k)` |
| **NOT** | `~` | Đảo ngược toàn bộ các bit | `~0` tạo ra dãy bit toàn 1 |
| **Dịch trái** | `<<` | Dịch bit sang trái, điền 0 vào bên phải | **Nhân với $2^k$**: `x << k` |
| **Dịch phải** | `>>` | Dịch bit sang phải | **Chia nguyên cho $2^k$**: `x >> k` |
| **Tắt bit** | `& ~` | Xóa bit thứ $k$ về 0 | **Tắt (Clear) bit thứ $k$**: `flags &= ~(1 << k)` |

---

## 4. Chuỗi Ký Tự Trong C (`\0`) & Thư Viện `string.h`

### 4.1. Bản Chất Chuỗi Trong C: Mảng Ký Tự Kết Thúc Bằng Ký Tự Rỗng `\0`
Trong C **không có kiểu dữ liệu `string` nguyên bản**. Chuỗi thực chất là một mảng kiểu `char` với phần tử kết thúc bắt buộc là ký tự null `\0` (ASCII code 0):

```
Chuỗi "HELLO" trong RAM:
Index:   [0]   [1]   [2]   [3]   [4]   [5]
Ký tự:  'H'   'E'   'L'   'L'   'O'  '\0'  <- Ký tự chốt đuôi!
Bytes:   5 ký tự + 1 ký tự null = 6 bytes!
```

```c
char str1[] = "Hello";        // Mảng 6 phần tử trên STACK (có thể sửa đổi từng ký tự)
char *str2 = "Hello";         // Con trỏ trỏ tới hằng chuỗi trong TEXT segment (SỬA LÀ BỊ CRASH!)
str1[0] = 'h';                // ✅ Hợp lệ
// str2[0] = 'h';             // ❌ Segmentation Fault! Không thể ghi vào Text Segment
```

### 4.2. Bảng Hàm Xử Lý Chuỗi Trong `<string.h>`
- `strlen(s)`: Đếm độ dài chuỗi (**không bao gồm** ký tự `\0`).
- `strcpy(dest, src)`: Sao chép chuỗi `src` vào `dest` (Nguy cơ tràn bộ đệm Buffer Overflow).
- `strncpy(dest, src, n)`: Bản sao chép an toàn, giới hạn tối đa $n$ ký tự.
- `strcat(dest, src)`: Nối chuỗi `src` vào sau đuôi `dest`.
- `strcmp(s1, s2)`: So sánh từ điển ($0$: bằng nhau, $<0$: $s1 < s2$, $>0$: $s1 > s2$).
- `strchr(s, c)`: Tìm vị trí xuất hiện đầu tiên của ký tự `c` trong chuỗi.
- `strstr(haystack, needle)`: Tìm chuỗi con `needle` trong chuỗi `haystack`.

---

## 5. Mảng & Cấu Trúc Điều Khiển

### 5.1. Mảng 1D và Mảng 2D Trong Bộ Nhớ
- Trong C, toàn bộ các phần tử của mảng được xếp **liên tiếp nhau trên một khối ô nhớ vật lý duy nhất**.
- Mảng 2D `int matrix[2][3]` được xếp theo thứ tự **Row-Major Order** (Hàng 0 xếp trước, nối tiếp ngay sau là Hàng 1).
- Địa chỉ phần tử `matrix[i][j]` được tính bằng công thức phần cứng:
  $$\text{Address}(i, j) = \text{BaseAddress} + (i \times \text{cols} + j) \times \text{sizeof}(\text{element})$$

```c
int arr[5] = {10, 20, 30, 40, 50};
size_t len = sizeof(arr) / sizeof(arr[0]); // Tính số phần tử của mảng tĩnh
```

### 5.2. Cấu Trúc Điều Khiển
- `if`, `else if`, `else`: Điều kiện không nhất thiết là boolean, mọi giá trị **khác 0** đều được coi là `true`, giá trị `0` được coi là `false`.
- `switch(expr)`: Biểu thức bắt buộc phải là kiểu số nguyên hoặc ký tự (`int`, `char`, `enum`). Nhớ luôn có `break` để tránh rơi nhánh (fall-through).
- Vòng lặp: `for (init; cond; step)`, `while (cond)`, `do { ... } while (cond);`.

---

## 6. Hàm, Phạm Vi Biến & Cơ Chế Truyền Tham Số

### 6.1. Bản Chất Pass-by-value 100% Trong C
Trong C, **mọi tham số truyền vào hàm đều là Pass-by-value (sao chép giá trị)**:
- Muốn hàm thay đổi được giá trị của biến ngoài hàm gọi $\rightarrow$ Bắt buộc phải **truyền con trỏ (địa chỉ của biến)**:

```c
// Hàm hoán đổi 2 số nguyên
void swap(int *a, int *b) {
    int temp = *a;
    *a = *b;
    *b = temp;
}
// Cách gọi:
int x = 5, y = 10;
swap(&x, &y); // Truyền địa chỉ qua toán tử &
```

### 6.2. Từ Khóa `static` Trong Hàm
- Biến `static` đặt bên trong hàm sẽ **được cấp phát trên BSS hoặc DATA segment** thay vì Stack.
- Nó **giữ nguyên giá trị** qua các lần gọi hàm khác nhau trong suốt thời gian chương trình chạy, nhưng phạm vi truy cập vẫn chỉ bị giới hạn bên trong hàm đó.

---

## 7. Con Trỏ (Pointers Deep Dive) & Phép Toán Con Trỏ

### 7.1. Định Nghĩa & Phép Toán Giải Tham Chiếu (Dereference)
- Con trỏ là một biến lưu trữ **địa chỉ ô nhớ RAM** của một biến khác.
- Kích thước của mọi con trỏ luôn luôn là $4\text{ bytes}$ trên hệ điều hành 32-bit và $8\text{ bytes}$ trên hệ điều hành 64-bit.

```c
int val = 42;
int *ptr = &val;  // ptr lưu địa chỉ vùng nhớ của val

printf("Dia chi: %p\n", (void*)ptr);
printf("Gia tri: %d\n", *ptr); // Toan tu * giai tham chieu: doc gia tri 42

*ptr = 100; // Thay doi truc tiep gia tri tai o nho -> val bien thanh 100!
```

### 7.2. Phép Toán Số Học Con Trỏ (Pointer Arithmetic)
Khi cộng hoặc trừ một số nguyên $k$ với một con trỏ:
$$\text{New Address} = \text{Current Address} + k \times \text{sizeof}(*ptr)$$
```c
int arr[3] = {10, 20, 30};
int *p = arr; // arr suy bien thanh con tro toi phan tu dau tien arr[0]

printf("%d\n", *p);       // 10
printf("%d\n", *(p + 1)); // 20 (Dich chuyen sang phai dung sizeof(int) = 4 bytes)
printf("%d\n", *(p + 2)); // 30
```

> [!CAUTION]
> Quy tắc tương đương kinh điển trong C: `arr[i]` hoàn toàn tương đương với `*(arr + i)`. Thậm chí trong C, viết `i[arr]` cũng hợp lệ vì `*(i + arr) == *(arr + i)`!

---

## 8. Quản Lý Bộ Nhớ Động (`malloc`, `calloc`, `realloc`, `free`)

Các hàm trong thư viện `<stdlib.h>` dùng để xin cấp phát vùng nhớ trên **Heap**:

| Hàm | Cú Pháp Khai Báo | Đặc Điểm Cốt Lõi |
| :--- | :--- | :--- |
| **`malloc`** | `void* malloc(size_t size)` | Cấp phát khối ô nhớ `size` byte. **Dữ liệu rác (Uninitialized)**. |
| **`calloc`** | `void* calloc(size_t num, size_t size)` | Cấp phát mảng gồm `num` phần tử, tự động **xóa sạch toàn bộ byte về 0**. |
| **`realloc`**| `void* realloc(void *ptr, size_t new_size)` | Thay đổi kích thước khối ô nhớ đã cấp phát. Tự động sao chép dữ liệu cũ sang vùng nhớ mới nếu cần. |
| **`free`**   | `void free(void *ptr)` | Trả lại quyền quản lý vùng nhớ cho hệ điều hành. |

### 8.1. Mẫu Code Cấp Phát Chuẩn Phòng Chống Lỗi (Standard Idiom)
```c
int n = 100;
int *arr = (int*) malloc(n * sizeof(int));
if (arr == NULL) {
    perror("Cap phat bo nho that bai!");
    exit(EXIT_FAILURE);
}

// Su dung bo nho...
arr[0] = 123;

// Giai phong va gan NULL tranh Dangling Pointer
free(arr);
arr = NULL; // BẮT BUỘC: Ngăn chặn dùng nhầm ô nhớ đã trả lại!
```

---

## 9. Cấu Trúc Tự Định Nghĩa: `struct`, `typedef`, `union`, `enum`

### 9.1. `struct` & Toán Tử Truy Cập (`.` vs `->`)
- Truy cập qua biến thông thường: Dùng toán tử dấu chấm `.`.
- Truy cập qua biến con trỏ trỏ tới struct: Dùng toán tử mũi tên `->` (viết tắt của `(*ptr).member`).

```c
typedef struct {
    int id;
    char name[50];
    float gpa;
} Student;

Student s1 = {1, "Alice", 3.8f};
Student *ptr = &s1;

printf("Ten: %s, GPA: %.2f\n", ptr->name, ptr->gpa);
```

### 9.2. Hiện Tượng Đệm Bộ Nhớ Cấu Trúc (Structure Padding & Memory Alignment)
CPU 64-bit truy xuất bộ nhớ hiệu quả nhất theo các khối $4$ hoặc $8$ bytes:
```c
struct BadStruct {
    char a;    // 1 byte + 3 bytes padding (khoảng đệm trống)
    int b;     // 4 bytes
    char c;    // 1 byte + 3 bytes padding
}; // sizeof(struct BadStruct) = 12 bytes!

struct GoodStruct {
    int b;     // 4 bytes
    char a;    // 1 byte
    char c;    // 1 byte + 2 bytes padding
}; // sizeof(struct GoodStruct) = 8 bytes! (Tiết kiệm 33% RAM!)
```

### 9.3. `union` (Vùng Nhớ Chia Sẻ)
- Khác với `struct` (mỗi thành viên có ô nhớ riêng), mọi thành viên trong `union` **dùng chung một vùng nhớ duy nhất** (kích thước bằng kích thước thành viên lớn nhất).
- Thay đổi giá trị của thành viên này sẽ ghi đè lên giá trị của thành viên khác.

---

## 10. Xử Lý Tập Tin (File I/O Streams)

### 10.1. Bảng Chế Độ Mở File (`fopen`)
| Chế Độ | Ý Nghĩa | Con Trỏ Tập Tin | Nếu File Chưa Có |
| :---: | :--- | :---: | :--- |
| `"r"` | Đọc văn bản (Read) | Đầu file | **Lỗi (Trả về `NULL`)** |
| `"w"` | Ghi văn bản (Write) | Đầu file | Tạo file mới, nếu có sẵn sẽ **xóa sạch nội dung cũ** |
| `"a"` | Ghi nối tiếp (Append) | Cuối file | Tạo file mới |
| `"rb"`, `"wb"` | Chế độ đọc / ghi nhị phân (Binary) | | Giữ nguyên nguyên vẹn byte không đổi ký tự `\r\n` |

### 10.2. Mẫu Đọc File Văn Bản Từng Dòng An Toàn
```c
FILE *fp = fopen("data.txt", "r");
if (fp == NULL) {
    perror("Khong the mo file");
    return -1;
}

char buffer[256];
while (fgets(buffer, sizeof(buffer), fp) != NULL) {
    printf("Line: %s", buffer);
}

fclose(fp); // BẮT BUỘC: Đóng file để xả bộ đệm và giải phóng file descriptor
```

---

## 11. Chỉ Thị Tiền Xử Lý (C Preprocessor & Macros)

Bộ tiền xử lý chạy trước khi trình biên dịch `gcc` dịch mã sang assembly:
- `#define PI 3.14159`: Thay thế hằng số dạng văn bản thô.
- **Bẫy Macro có tham số**: Luôn luôn bọc mọi tham số và toàn bộ biểu thức trong dấu ngoặc đơn:
  ```c
  #define SQUARE(x) ((x) * (x))  // ✅ ĐÚNG
  // #define SQUARE(x) x * x     // ❌ SAI: SQUARE(2 + 3) -> 2 + 3 * 2 + 3 = 11 (thay vì 25)!
  ```
- **Include Guards**: Chống định nghĩa lại struct/class nhiều lần trong file header:
  ```c
  #ifndef MY_HEADER_H
  #define MY_HEADER_H
  // Các khai báo nguyên mẫu hàm, struct...
  #endif
  ```

---

## 12. Con Trỏ Hàm (Function Pointers) & Callbacks

Con trỏ hàm lưu trữ địa chỉ của mã máy của hàm trong **TEXT segment**, cho phép truyền hàm vào làm đối số của hàm khác (Callback):

```c
// Cú pháp: return_type (*func_ptr_name)(param_types);
int add(int a, int b) { return a + b; }
int subtract(int a, int b) { return a - b; }

// Hàm nhận Callback
int compute(int (*operation)(int, int), int x, int y) {
    return operation(x, y);
}

// Sử dụng:
int res = compute(add, 10, 5); // res = 15
```

---

## 13. C++ Cốt Lõi So Với C (References, `new`/`delete`, OOP)

| Tính Năng | Ngôn Ngữ C | Ngôn Ngữ C++ |
| :--- | :--- | :--- |
| **Cấp phát bộ nhớ động** | `malloc()` & `free()` (không gọi constructor/destructor) | Toán tử `new` & `delete` (tự động gọi Constructor & Destructor) |
| **Cơ chế truyền tham chiếu**| Dùng con trỏ con trỏ thô: `void func(int *x)` | Hỗ trợ tham chiếu trực tiếp: `void func(int &x)` |
| **Nạp chồng hàm (Overloading)** | Không hỗ trợ (Tên hàm phải là duy nhất) | Hỗ trợ đầy đủ Function Overloading & Operator Overloading |
| **Xử lý chuỗi** | Mảng ký tự `char[]` kết thúc bằng `\0` | Lớp trừu tượng `std::string` an toàn, tự co giãn dung lượng |
| **Mảng động an toàn** | Tự quản lý bằng `malloc()` & `realloc()` | Lớp mẫu `std::vector<T>` tự động giải phóng bộ nhớ (RAII) |
| **Lập trình hướng đối tượng** | Không có (Mô phỏng qua Struct + Function Pointers) | Đầy đủ Class, 4 trụ cột OOP, Kế thừa, Đa hình ảo `virtual` |

---

## 14. Top 10 Bẫy Lỗi Bộ Nhớ Sống Còn (Memory Pitfalls & Gotchas)

1. **Segmentation Fault (`SIGSEGV`)**: Xảy ra khi chương trình truy cập vào vùng nhớ mà nó không có quyền đọc/ghi (ví dụ: dereference con trỏ `NULL`, ghi vào hằng chuỗi literal, hoặc đọc con trỏ rác chưa khởi tạo).
2. **Dangling Pointer (Con trỏ treo)**: Con trỏ vẫn trỏ tới địa chỉ ô nhớ cũ sau khi đã gọi `free()`. Nếu cố truy cập sẽ gây hành vi bất định (Undefined Behavior). *Khắc phục: Gán `ptr = NULL` ngay sau khi free*.
3. **Memory Leak (Rò rỉ ô nhớ)**: Cấp phát bộ nhớ Heap bằng `malloc()` nhưng quên gọi `free()`. Theo thời gian, bộ nhớ RAM bị cạn kiệt khiến hệ điều hành tiêu diệt tiến trình (`OOM Killer`).
4. **Double Free**: Gọi lệnh `free(ptr)` hai lần trên cùng một địa chỉ ô nhớ. Làm hỏng cấu trúc danh sách quản lý bộ nhớ của Heap và gây crash ngay lập tức.
5. **Buffer Overflow (Tràn bộ đệm)**: Ghi dữ liệu vượt quá kích thước mảng đã cấp phát. Kẻ tấn công có thể khai thác để ghi đè địa chỉ trả về của hàm trên Stack (Stack smashing) để chiếm quyền điều khiển hệ thống.
6. **Off-by-one Error**: Duyệt vòng lặp quá chỉ số: `for (int i = 0; i <= size; i++)`. Truy cập `arr[size]` là truy cập ngoài giới hạn mảng!
7. **Trả Về Con Trỏ Của Biến Cục Bộ Trên Stack**:
   ```c
   int* badFunction() {
       int x = 10;
       return &x; // ❌ CỰC KỲ NGUY HIỂM: Biến x bị hủy ngay khi hàm thoát, con trỏ trỏ vào vùng nhớ rác!
   }
   ```
8. **Quên Chừa 1 Byte Cho Ký Tự Null `\0`**: Khai báo `char s[5] = "Hello";` là sai! Cần tối thiểu `char s[6]` để chứa đủ 5 chữ cái và ký tự `\0`.
9. **Format String Vulnerability**: Viết `printf(user_input);` thay vì `printf("%s", user_input);`. Kẻ tấn công có thể chèn các chuỗi định dạng `%x`, `%n` để đọc trộm hoặc ghi đè bộ nhớ Stack!
10. **Không Kiểm Tra Giá Trị Trả Về Của `malloc()`**: Khi hệ thống hết RAM, `malloc()` sẽ trả về `NULL`. Nếu lập trình viên dereference trực tiếp mà không kiểm tra `if (ptr == NULL)` thì chương trình sẽ crash ngay tức khắc.
