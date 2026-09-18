# Bài 03: Quản Lý Bộ Nhớ Động Trên Heap (`malloc`, `calloc`, `realloc`, `free`)

Khảo sát chuyên sâu kiến trúc bộ nhớ Heap trong C, chi tiết hoạt động của các hàm cấp phát `<stdlib.h>`, kỹ thuật kiểm tra cạn kiệt RAM và cơ chế giải phóng tài nguyên hệ thống.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: Số Học Con Trỏ & Con Trỏ Mảng](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/02-pointer-arithmetic-and-arrays.md).
- **Trọng tâm hiện tại**:
  - Khác biệt bản chất giữa bộ nhớ tĩnh trên Stack và bộ nhớ động trên Heap.
  - `malloc(size)`: Cấp phát ô nhớ thô, không khởi tạo dữ liệu.
  - `calloc(num, size)`: Cấp phát mảng và tự động xóa sạch dữ liệu về 0.
  - `realloc(ptr, new_size)`: Mở rộng hoặc thu hẹp vùng nhớ an toàn.
  - `free(ptr)`: Giải phóng vùng nhớ và bàn giao lại cho OS.
- **Tiếp theo**: [Bài 04: Hiểm Họa Ô Nhớ: Segfault & Memory Leak](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/04-memory-leaks-and-segfaults.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bộ Nhớ Heap Dưới Sự Điều Phối Của Hệ Điều Hành
- Khi gọi `malloc(N)`, thư viện C Runtime (thông qua các system call như `brk()` hoặc `mmap()` trên Linux, `HeapAlloc()` trên Windows) sẽ tìm kiếm một khối ô nhớ liên tiếp đủ $N$ bytes trong Heap.
- Ở đầu mỗi khối ô nhớ được cấp phát, hệ thống luôn chèn một **Metadata Header** nhỏ (8-16 bytes) để ghi nhớ kích thước của khối ô nhớ đó. Nhờ vậy khi bạn gọi `free(ptr)`, hệ thống tự biết chính xác cần phải giải phóng bao nhiêu bytes mà không cần bạn truyền tham số kích thước!

### 2.2. So Sánh `malloc` vs `calloc`

| Tiêu Chí | `malloc(size)` | `calloc(num, size)` |
| :--- | :--- | :--- |
| **Khởi tạo dữ liệu** | Giữ nguyên dữ liệu rác (Uninitialized / Garbage values) | **Tự động điền 0 vào toàn bộ byte** |
| **Tham số** | 1 tham số (tổng số byte) | 2 tham số (số phần tử, kích thước 1 phần tử) |
| **Bảo vệ tràn số nguyên**| Không (nếu viết `malloc(n * size)` có thể bị tràn `size_t`) | Tự động kiểm tra tràn số tích `num * size` |
| **Tốc độ** | Nhanh hơn một chút (không tốn công zero-fill) | Chậm hơn đôi chút do thao tác memset về 0 |

### 2.3. Quy Tắc Dùng `realloc` An Toàn
> [!CAUTION]
> Tuyệt đối không bao giờ viết: `ptr = realloc(ptr, new_size);`.
> Nếu hệ thống hết RAM, `realloc()` trả về `NULL`. Khi đó, con trỏ `ptr` ban đầu của bạn sẽ bị gán thành `NULL`, và vùng nhớ cũ vẫn nằm lại trên Heap mà không có cách nào giải phóng được $\rightarrow$ Gây rò rỉ bộ nhớ (Memory Leak)!

```c
// ✅ MẪU CODE REALLOC CHUẨN:
void *temp = realloc(ptr, new_size);
if (temp == NULL) {
    // Xử lý lỗi: Vùng nhớ cũ 'ptr' vẫn còn nguyên vẹn, giải phóng an toàn
    free(ptr);
    perror("Realloc that bai!");
    exit(EXIT_FAILURE);
}
ptr = temp; // Thành công mới gán lại con trỏ
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Không Kiểm Tra Giá Trị `NULL` Sau Khi Cấp Phát
Hệ điều hành có thể hết bộ nhớ ảo bất kỳ lúc nào. Nếu không kiểm tra `if (ptr == NULL)`, câu lệnh ghi đầu tiên `ptr[0] = 10;` sẽ kích hoạt `Segmentation Fault` làm sập toàn bộ ứng dụng trên môi trường sản xuất.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [pointers_demo.c](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/pointers_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **`free(ptr)` có thực sự xóa dữ liệu trong ô nhớ hoặc đổi con trỏ `ptr` thành `NULL` không?**
   *Trả lời*: **Không**. `free()` chỉ đánh dấu khối ô nhớ đó trong danh sách quản lý Heap của hệ điều hành là "đã rảnh rỗi và có thể tái sử dụng cho lần `malloc` sau". Dữ liệu cũ trong RAM vẫn có thể còn nguyên, và biến con trỏ `ptr` vẫn trỏ tới địa chỉ cũ (trở thành Dangling Pointer). Lập trình viên **bắt buộc phải tự tay gán `ptr = NULL;`** ngay sau lệnh `free()`.
2. **Nếu gọi `free(NULL)` thì chuyện gì sẽ xảy ra?**
   *Trả lời*: Theo chuẩn ANSI C, `free(NULL)` là một thao tác **hoàn toàn an toàn (No-op)**. Hàm sẽ âm thầm trả về mà không thực hiện bất kỳ hành động nào và không gây lỗi crash chương trình.
