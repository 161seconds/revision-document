# Bài 04: Hiểm Họa Ô Nhớ: Segmentation Fault, Dangling Pointer & Memory Leak

Phân tích chuyên sâu 5 hiểm họa bộ nhớ kinh điển trong lập trình C/C++, nguyên nhân cơ chế phần cứng sinh ra tín hiệu `SIGSEGV` và các kỹ thuật phòng vệ bộ nhớ trong môi trường doanh nghiệp.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: Cấp Phát Bộ Nhớ Động Trên Heap](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/03-dynamic-memory-allocation.md).
- **Trọng tâm hiện tại**:
  - Bản chất của lỗi phân đoạn `Segmentation Fault` (`SIGSEGV`).
  - Con trỏ treo (Dangling Pointer) & Con trỏ hoang dã (Wild Pointer).
  - Rò rỉ bộ nhớ (Memory Leak) và hậu quả đối với máy chủ dài ngày.
  - Lỗi giải phóng hai lần (Double Free Vulnerability).
  - Trả về địa chỉ của biến cục bộ trên Stack (Returning Stack Pointer).
- **Tiếp theo**: [Module 03: Structs & Cấu Trúc Dữ Liệu](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất Phần Cứng Của `Segmentation Fault` (SIGSEGV)
- Mỗi tiến trình chạy trong một không gian địa chỉ ảo được giám sát chặt chẽ bởi **Bộ quản lý bộ nhớ phần cứng (MMU - Memory Management Unit)** của CPU kết hợp với Bảng phân trang (Page Table) của Hệ điều hành.
- Khi một câu lệnh cố tình:
  1. Đọc/Ghi vào trang bộ nhớ chưa được ánh xạ (ví dụ địa chỉ `0x0` khi dereference `NULL`).
  2. Ghi dữ liệu vào trang bộ nhớ chỉ đọc (Read-Only Page như Text Segment).
  3. Truy cập vào vùng nhớ của nhân hệ điều hành (Kernel Space).
- MMU sẽ phát hiện vi phạm quyền truy cập phần cứng (Page Fault vi phạm) và gửi một ngắt phần cứng (Hardware Interrupt) cho OS. Hệ điều hành lập tức phát tín hiệu **`SIGSEGV` (Signal 11)** để tiêu diệt tiến trình ngay tức khắc nhằm bảo vệ an toàn cho toàn bộ hệ thống.

---

## 3. Top 5 Bẫy Lỗi Bộ Nhớ Sống Còn & Cách Phòng Tránh

```c
// 1. Dangling Pointer (Con trỏ treo)
int *p = (int*) malloc(sizeof(int));
free(p);
// *p = 50;   // ❌ SAI: Vùng nhớ đã trả lại, p đang trỏ vào hư vô
p = NULL;     // ✅ PHÒNG NGỪA: Luôn gán NULL sau khi free

// 2. Double Free
int *p2 = (int*) malloc(sizeof(int));
free(p2);
// free(p2);  // ❌ SAI: Giải phóng 2 lần làm hỏng Heap metadata và crash
p2 = NULL;
free(p2);     // ✅ AN TOÀN: free(NULL) không làm gì cả

// 3. Trả về địa chỉ biến cục bộ Stack
int* badStackReturn(void) {
    int local = 100;
    return &local; // ❌ CỰC KỲ NGUY HIỂM: local sẽ biến mất khi hàm thoát!
}
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [pointers_demo.c](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/pointers_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Công cụ nào được dùng phổ biến nhất trên Linux để phát hiện Memory Leak và truy cập bộ nhớ bất hợp pháp trong chương trình C?**
   *Trả lời*:
   - **Valgrind** (Memcheck): Công cụ kiểm tra động kinh điển, chạy chương trình trên môi trường ảo hóa CPU để phát hiện mọi lỗi đọc ô nhớ chưa khởi tạo, truy cập ngoài biên mảng và rò rỉ bộ nhớ (lệnh: `valgrind --leak-check=full ./my_program`).
   - **AddressSanitizer (ASan)**: Bộ công cụ hiện đại tích hợp sẵn trong GCC và Clang (chạy kèm cờ biên dịch `-fsanitize=address -g`), tốc độ chạy nhanh hơn Valgrind rất nhiều, bắt lỗi tràn bộ đệm Stack/Heap ngay lập tức tại vị trí dòng code vi phạm.
2. **Tại sao bộ nhớ bị rò rỉ (Memory Leak) lại được tự động giải phóng khi tiến trình tắt đi? Nếu vậy tại sao ta vẫn phải quan tâm đến Memory Leak?**
   *Trả lời*: Khi tiến trình kết thúc, Hệ điều hành sẽ tự động thu hồi toàn bộ không gian địa chỉ ảo của tiến trình đó. Tuy nhiên, với các ứng dụng máy chủ (Web Server, Database, Backend Microservices) được thiết kế để **chạy liên tục 24/7/365**, rò rỉ chỉ vài megabyte mỗi giờ sẽ dần dần nuốt cạn hàng chục gigabyte RAM, làm máy chủ chậm dần, kích hoạt `Linux OOM-Killer` tiêu diệt service hoặc làm sập toàn bộ hệ thống của doanh nghiệp.
