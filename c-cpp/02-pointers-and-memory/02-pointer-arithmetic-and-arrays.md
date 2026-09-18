# Bài 02: Số Học Con Trỏ, Mối Quan Hệ Giữa Mảng & Con Trỏ Đa Cấp

Phân tích toán học đằng sau phép tịnh tiến con trỏ (Pointer Arithmetic), hiện tượng suy biến của mảng (Array Decay), quy tắc hoán đổi `arr[i] == *(arr + i)` và con trỏ trỏ con trỏ `**ptr`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Con Trỏ & Địa Chỉ Ô Nhớ RAM](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/01-pointers-and-memory-addresses.md).
- **Trọng tâm hiện tại**:
  - Phép cộng/trừ con trỏ với số nguyên: Công thức tịnh tiến theo `sizeof(*ptr)`.
  - Phép trừ giữa hai con trỏ cùng kiểu: Trả về khoảng cách số phần tử (`ptrdiff_t`).
  - Sự suy biến mảng (Array Decay): Tên mảng tự động biến thành con trỏ trỏ phần tử đầu tiên.
  - Con trỏ trỏ con trỏ (Double Pointers `**ptr`) và ứng dụng cấp phát mảng 2D động.
- **Tiếp theo**: [Bài 03: Cấp Phát Bộ Nhớ Động Heap](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/03-dynamic-memory-allocation.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Phép Toán Số Học Con Trỏ (Pointer Arithmetic)
Khi bạn viết `ptr + 1`, con trỏ **không tăng lên 1 byte**, mà nó nhảy sang phần tử tiếp theo:
$$\text{Địa chỉ mới} = \text{Địa chỉ hiện tại} + 1 \times \text{sizeof}(*ptr)$$
- Nếu `int *p` tại địa chỉ `0x1000` $\rightarrow$ `p + 1` sẽ có địa chỉ `0x1004` (vì `sizeof(int) = 4`).
- Nếu `double *d` tại địa chỉ `0x1000` $\rightarrow$ `d + 1` sẽ có địa chỉ `0x1008` (vì `sizeof(double) = 8`).

### 2.2. Sự Tương Đương Tuyệt Đối Giữa Mảng & Con Trỏ
Trong hầu hết biểu thức (trừ khi đứng trong `sizeof` hoặc toán tử `&`), tên của một mảng sẽ **tự động suy biến (decay)** thành một con trỏ trỏ tới phần tử đầu tiên `&arr[0]`:
```c
int arr[3] = {10, 20, 30};
int *p = arr; // p = &arr[0]

// 4 cách viết này cho kết quả Y HỆT NHAU:
arr[1]      // Cách viết mảng thông thường: 20
*(arr + 1)  // Tịnh tiến con trỏ rồi giải tham chiếu: 20
*(p + 1)    // Tịnh tiến qua con trỏ p: 20
1[arr]      // Hợp lệ trong C! Vì *(1 + arr) == *(arr + 1)
```

### 2.3. Con Trỏ Trỏ Con Trỏ (`**ptr`)
Dùng khi một hàm cần **thay đổi chính bản thân con trỏ** được truyền vào từ bên ngoài:
```c
void allocateMemory(int **ptr, int size) {
    *ptr = (int*) malloc(size * sizeof(int)); // Gán vùng nhớ mới cho con trỏ của hàm gọi
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Mất Kích Thước Mảng Khi Truyền Vào Hàm
Khi truyền mảng vào hàm `void func(int arr[])`, tham số `arr` **bị suy biến thành con trỏ `int *arr`**!
```c
void printSize(int arr[]) {
    printf("%zu\n", sizeof(arr)); // ❌ In ra 8 (kích thước của con trỏ), KHÔNG PHẢI kích thước mảng!
}
```
- **Quy tắc**: Luôn phải truyền thêm tham số kích thước mảng: `void func(int *arr, size_t n)`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [pointers_demo.c](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/pointers_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **`sizeof(arr)` và `sizeof(&arr)` khác nhau thế nào khi `arr` là `int arr[10]`?**
   *Trả lời*:
   - `sizeof(arr)`: Trả về $10 \times 4 = 40\text{ bytes}$ (kích thước toàn bộ mảng).
   - `sizeof(&arr)`: `&arr` là con trỏ trỏ tới toàn bộ mảng (kiểu `int (*)[10]`), do đó `sizeof(&arr)` trả về kích thước con trỏ (8 bytes trên 64-bit).
2. **Có thể thực hiện phép cộng giữa hai con trỏ (`ptr1 + ptr2`) không? Tại sao?**
   *Trả lời*: **Tuyệt đối không**. Phép cộng 2 địa chỉ ô nhớ trong RAM là vô nghĩa về mặt vật lý (tương tự như cộng 2 số nhà với nhau). Chuẩn C cấm phép toán này. Ngược lại, phép **trừ hai con trỏ (`ptr2 - ptr1`)** là hoàn toàn hợp lệ, trả về số lượng phần tử nằm giữa hai con trỏ đó.
