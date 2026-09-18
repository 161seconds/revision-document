# Bài 02: Con Trỏ Hàm (Function Pointers), Callbacks & Bảng Hàm Dispatch Table

Khảo sát cách lưu trữ địa chỉ của mã máy thực thi (Text Segment), cú pháp khai báo con trỏ hàm, kỹ thuật lập trình hướng sự kiện Callbacks và hàm sắp xếp kinh điển `qsort()` trong thư viện chuẩn `<stdlib.h>`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Con Trỏ & Ô Nhớ](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/README.md).
- **Trọng tâm hiện tại**:
  - Tên hàm bản chất là địa chỉ bắt đầu của khối mã thực thi trong **TEXT segment**.
  - Cú pháp khai báo con trỏ hàm: `return_type (*ptr_name)(param_types);`.
  - Khởi tạo và gọi hàm qua con trỏ.
  - Sử dụng `typedef` để đơn giản hóa cú pháp con trỏ hàm.
  - Hàm gọi lại (Callback Functions) và Bảng hàm điều phối (Dispatch Table).
  - Sử dụng hàm thư viện chuẩn `qsort()` với con trỏ hàm so sánh `int (*compar)(const void*, const void*)`.
- **Tiếp theo**: [Bài 03: C++ Nền Tảng: Tham Chiếu, new/delete & Namespaces](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/03-cpp-fundamentals-and-memory.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Cú Pháp Khai Báo Con Trỏ Hàm
```c
// Khai báo một hàm thông thường
int add(int a, int b) { return a + b; }

// Khai báo con trỏ hàm trỏ tới hàm nhận 2 int và trả về int:
int (*operation)(int, int) = add;

// Gọi hàm qua con trỏ (Cả 2 cách đều hợp lệ):
int res1 = (*operation)(10, 20); // Cách truyền thống
int res2 = operation(10, 20);   // Cách hiện đại ngắn gọn
```

### 2.2. Dùng `typedef` Để Làm Sạch Cú Pháp
```c
// Định nghĩa kiểu 'BinaryOp' là con trỏ hàm nhận 2 int và trả về int
typedef int (*BinaryOp)(int, int);

// Hàm nhận Callback
int execute(BinaryOp op, int a, int b) {
    return op(a, b);
}
```

### 2.3. Sắp Xếp Đa Năng Với `qsort()` Của `<stdlib.h>`
```c
// Hàm so sánh cho qsort: Trả về <0 nếu a < b, 0 nếu a == b, >0 nếu a > b
int compareAscending(const void *a, const void *b) {
    int val_a = *(const int*)a;
    int val_b = *(const int*)b;
    return val_a - val_b;
}

int arr[5] = {40, 10, 50, 20, 30};
qsort(arr, 5, sizeof(int), compareAscending);
// arr trở thành: {10, 20, 30, 40, 50}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Quên Dấu Ngoặc Đơn Quanh Tên Con Trỏ Hàm
- `int (*func)(int)`: Là một **con trỏ hàm** nhận `int` và trả về `int`.
- `int *func(int)`: Là một **hàm bình thường** nhận `int` và trả về một **con trỏ số nguyên `int*`**!
- Sự khác biệt duy nhất là cặp dấu ngoặc đơn `(*func)`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [advanced_demo.c](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/advanced_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Bảng điều phối hàm (Dispatch Table) là gì? Ứng dụng trong lập trình nhúng/hệ điều hành?**
   *Trả lời*: Dispatch Table là một mảng chứa các con trỏ hàm. Thay vì dùng một chuỗi `switch-case` dài hàng chục nhánh gây chậm hiệu năng, chương trình chỉ cần dùng mã lệnh (Opcode) làm chỉ số mảng để nhảy trực tiếp tới hàm xử lý tương ứng trong $O(1)$. Ứng dụng kinh điển: Bảng xử lý ngắt phần cứng (Interrupt Vector Table - IVT) trong OS và hệ điều hành nhúng.
2. **Tại sao hàm so sánh của `qsort` lại nhận tham số là `const void*`?**
   *Trả lời*: Để đảm bảo tính tổng quát hóa (Generic). `qsort` có thể sắp xếp bất kỳ kiểu dữ liệu nào (từ số nguyên, chuỗi, đến các struct phức tạp). Việc dùng `const void*` cho phép truyền địa chỉ của mọi kiểu dữ liệu vào mà không sợ bị sửa đổi nội dung trong quá trình so sánh.
