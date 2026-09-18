# C / C++ Revision Guide

Lộ trình và kho tài liệu ôn tập ngôn ngữ C/C++ toàn diện từ cú pháp nền tảng, bản đồ bộ nhớ tiến trình (Process Memory Layout), thao tác con trỏ (Pointers), quản lý bộ nhớ động (`malloc`/`free`), cấu trúc dữ liệu tự định nghĩa, thao tác tập tin File I/O, đến C++ cốt lõi và phòng ngừa lỗi bộ nhớ hệ thống.

---

## Danh Mục Các Module Học Tập

| Thư mục / Tài liệu | Nội dung trọng tâm | Trạng thái |
| :--- | :--- | :--- |
| **[summary.md](file:///d:/my-project/revision-document/c-cpp/summary.md)** | **Bảng tóm tắt toàn diện (Master C/C++ Cheat Sheet)** bao quát toàn bộ cú pháp C, con trỏ, ô nhớ và C++ | Hoàn thành |
| **[01-basics-and-syntax/](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/README.md)** | Cú pháp C, Bảng mã định dạng `printf`/`scanf`, 8 kiểu dữ liệu, Thao tác Bitwise, Chuỗi `\0` & `string.h`, Mảng 1D/2D, Cấu trúc điều khiển, Hàm & Đệ quy | Sẵn sàng |
| **[02-pointers-and-memory/](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/README.md)** | Bản đồ bộ nhớ (Stack, Heap, Data, BSS, Text), Con trỏ (`&`, `*`), Phép toán con trỏ, Con trỏ và Mảng, Cấp phát động (`malloc`, `calloc`, `realloc`, `free`), Phòng chống Segfault & Rò rỉ ô nhớ | Sẵn sàng |
| **[03-structs-and-data-structures/](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/README.md)** | `struct`, `typedef`, Toán tử `.` vs `->`, Đệm bộ nhớ (Structure Padding), `union` chia sẻ ô nhớ, `enum`, Cài đặt Danh sách liên kết đơn (Singly Linked List), Stack & Queue bằng C thuần | Sẵn sàng |
| **[04-files-and-io/](file:///d:/my-project/revision-document/c-cpp/04-files-and-io/README.md)** | Con trỏ tệp `FILE*`, Chế độ đọc ghi (`"r"`, `"w"`, `"a"`, `"rb"`, `"wb"`), Đọc ghi văn bản (`fgets`, `fprintf`), Đọc ghi nhị phân (`fread`, `fwrite`), Kiểm tra lỗi tệp và dọn dẹp an toàn | Sẵn sàng |
| **[05-advanced-and-cpp/](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/README.md)** | Chỉ thị tiền xử lý (Macros & Include Guards), Con trỏ hàm (Function Pointers) & Callbacks trong `qsort`, Giới thiệu C++ Core (References `&`, `new`/`delete`, `std::vector`, OOP Class) | Sẵn sàng |

---

## Chuẩn Cấu Trúc Của Từng Thư Mục Con

Mỗi module trong hệ thống ôn tập bao gồm:
1. `README.md`: Lộ trình chi tiết + **Bản đồ liên kết bài học (Knowledge Links)** + Bẫy phỏng vấn.
2. Các bài học lý thuyết `.md`: Tuân thủ 5 mục chuẩn (Bản đồ liên kết, Bản chất hoạt động, Bẫy kinh điển, Code thực hành, Câu hỏi phỏng vấn tự kiểm tra).
3. Các file demo `.c`: Code mẫu thực nghiệm chuẩn xác, tuân thủ tiêu chuẩn ANSI C99 / C11.
4. `practice.c`: Bộ câu hỏi và thử thách tự động chấm điểm với 100% assertions sử dụng thư viện chuẩn `<assert.h>`.

---

## Bản Đồ Liên Kết
- **Ý nghĩa nền tảng:** Nền móng hiểu sâu cách máy tính, OS và các ngôn ngữ bậc cao (JS, Java, C#, Go, Rust) quản lý ô nhớ bên dưới.
- **Tiếp theo:** Kiến trúc máy tính, Hệ điều hành (Operating Systems), Lập trình nhúng (Embedded Systems), C++ hiện đại (C++17/C++20).
