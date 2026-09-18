# Bài 03: Nền Tảng C++ Cốt Lõi: Tham Chiếu `&`, Toán Tử `new`/`delete` & Namespaces

Khảo sát bước chuyển tiếp từ C sang C++: Bản chất của biến tham chiếu (References), cách cấp phát động an toàn kiểu với `new` và `delete`, giải quyết xung đột định danh với không gian tên `namespace` và cơ chế nạp chồng hàm (Function Overloading).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Con Trỏ & Ô Nhớ C](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/README.md).
- **Trọng tâm hiện tại**:
  - Biến tham chiếu trong C++: Cú pháp `int &ref = x;`, bí danh ô nhớ.
  - So sánh chi tiết giữa Tham chiếu (References) và Con trỏ (Pointers).
  - Cấp phát bộ nhớ C++: `new` và `delete` / `delete[]` vs `malloc()` và `free()`.
  - Không gian tên `namespace` và câu lệnh `using namespace std;`.
  - Cơ chế nạp chồng hàm (Function Overloading) và Name Mangling.
- **Tiếp theo**: [Bài 04: C++ OOP: Class, RAII Destructor & std::vector](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/04-cpp-oop-and-stl-vector.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. So Sánh Bản Chất: Tham Chiếu (Reference) vs Con Trỏ (Pointer)

| Tiêu Chí | Con Trỏ (`int *ptr`) | Tham Chiếu (`int &ref`) |
| :--- | :--- | :--- |
| **Bản chất ô nhớ** | Là một biến độc lập lưu địa chỉ RAM (8 bytes) | Là **một bí danh (Alias)** đặt cho một ô nhớ đã có sẵn |
| **Giá trị `NULL`** | Có thể nhận giá trị `NULL` | **Không bao giờ được là `NULL`** |
| **Khởi tạo** | Có thể không cần gán giá trị ngay | **Bắt buộc phải gán cho biến khác ngay khi khai báo** |
| **Gán lại địa chỉ** | Có thể trỏ sang biến khác bất kỳ lúc nào | **Cố định vĩnh viễn**, không thể trỏ sang biến khác |
| **Cú pháp sử dụng** | Phải dùng toán tử `*` để giải tham chiếu | Dùng trực tiếp tự nhiên như một biến bình thường |

### 2.2. So Sánh `new` / `delete` vs `malloc()` / `free()`
- `malloc()` và `free()` chỉ là các hàm thư viện thuần túy: Chúng chỉ xin cấp phát số bytes thô trên Heap, **hoàn toàn không gọi hàm khởi tạo (Constructor)** hay hàm hủy (Destructor).
- Toán tử `new` và `delete` là các từ khóa cốt lõi của ngôn ngữ C++:
  1. `new Type`: Tự động tính toán kích thước theo `sizeof(Type)`, cấp phát ô nhớ trên Heap, và **tự động gọi Constructor** để khởi tạo đối tượng.
  2. `delete ptr`: **Tự động gọi Destructor** để dọn dẹp tài nguyên nội bộ trước khi trả vùng nhớ Heap lại cho hệ điều hành.
  3. Với mảng động: Bắt buộc dùng `delete[] arr;` để hủy toàn bộ các phần tử!

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Dùng Lẫn Lộn Giữa `malloc` và `delete` hoặc `new` và `free`
Trộn lẫn giữa C-style (`malloc`/`free`) và C++-style (`new`/`delete`) là hành vi bất định (Undefined Behavior). Destructor sẽ không được gọi, dẫn đến rò rỉ tài nguyên ngầm.

### Bẫy 2: Dùng `delete` Thay Vì `delete[]` Cho Mảng
Nếu cấp phát `int *arr = new int[100];`, bạn **bắt buộc phải giải phóng bằng `delete[] arr;`**. Dùng `delete arr;` chỉ hủy phần tử đầu tiên và gây hỏng bộ nhớ Heap!

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [advanced_demo.c](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/advanced_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Name Mangling trong trình biên dịch C++ là gì? Tại sao cần từ khóa `extern "C"`?**
   *Trả lời*: Để hỗ trợ tính năng nạp chồng hàm (Function Overloading - các hàm cùng tên nhưng khác tham số), compiler C++ tự động mã hóa thêm thông tin kiểu tham số vào tên hàm trong mã máy (gọi là Name Mangling, ví dụ `add(int, int)` biến thành `_Z3addii`). Từ khóa `extern "C"` yêu cầu compiler C++ tắt cơ chế Name Mangling, giữ nguyên tên gốc theo chuẩn C để code C++ có thể liên kết mượt mà với các thư viện viết bằng C.
2. **Tại sao nên truyền tham số đối tượng lớn bằng `const Type &ref` thay vì `Type obj` trong C++?**
   *Trả lời*: Truyền theo giá trị `Type obj` sẽ kích hoạt **Hàm khởi tạo sao chép (Copy Constructor)**, sao chép toàn bộ dữ liệu của đối tượng gây tốn CPU và RAM. Truyền qua tham chiếu `const Type &ref` có tốc độ tức thời bằng con trỏ (chỉ truyền 8 bytes địa chỉ) nhưng cú pháp sáng sủa hơn và từ khóa `const` đảm bảo an toàn tuyệt đối không bị hàm sửa đổi dữ liệu.
