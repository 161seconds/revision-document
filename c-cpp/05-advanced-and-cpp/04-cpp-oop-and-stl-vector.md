# Bài 04: C++ Lập Trình Hướng Đối Tượng: `class`, Khái Niệm RAII & `std::vector`

Khảo sát kiến trúc hướng đối tượng của C++: Sự khác nhau giữa `struct` và `class`, hàm khởi tạo (Constructor), hàm hủy (Destructor), triết lý giải phóng tài nguyên tự động RAII, và mảng động an toàn hiện đại `std::vector`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: C++ Nền Tảng & Bộ Nhớ](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/03-cpp-fundamentals-and-memory.md).
- **Trọng tâm hiện tại**:
  - `class` vs `struct` trong C++: Phạm vi truy cập mặc định (`private` vs `public`).
  - Đóng gói với `private`, `protected`, `public`.
  - Hàm khởi tạo (Constructor) & Hàm hủy (Destructor `~ClassName()`).
  - Triết lý cốt lõi của C++: **RAII (Resource Acquisition Is Initialization)**.
  - Thư viện mảng động chuẩn `std::vector` (tự động mở rộng và giải phóng bộ nhớ khi ra khỏi phạm vi scope).
- **Tổng kết**: Hoàn thành toàn bộ lộ trình 5 Module ôn tập C / C++.

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Triết Lý Cốt Lõi RAII (Resource Acquisition Is Initialization)
Trong C, bạn phải nhớ gọi `free()` hoặc `fclose()` ở mọi ngóc ngách của hàm (kể cả khi gặp lỗi). Nếu quên hoặc hàm `return` sớm, bạn sẽ bị rò rỉ tài nguyên.
- **RAII trong C++ giải quyết dứt điểm điều này**:
  1. **Tài nguyên được cấp phát trong Constructor** khi đối tượng được sinh ra trên Stack.
  2. **Tài nguyên được tự động giải phóng trong Destructor** ngay khi đối tượng đi ra khỏi phạm vi khối lệnh `{ ... }` (kể cả khi có lệnh `return` sớm hoặc xảy ra Exception).

```cpp
class FileHandler {
    FILE *fp;
public:
    FileHandler(const char *path, const char *mode) {
        fp = fopen(path, mode);
    }
    ~FileHandler() {
        if (fp) {
            fclose(fp); // Tự động đóng file 100% không sợ rò rỉ!
        }
    }
};
```

### 2.2. Mảng Động An Toàn `std::vector` Thay Thế Hoàn Toàn `malloc`/`free`
```cpp
#include <vector>

void processVector() {
    std::vector<int> numbers; // Cấp phát động bên dưới nhưng được quản lý theo RAII
    numbers.push_back(10);
    numbers.push_back(20);
    numbers.push_back(30);

    // Kích thước tự co giãn, truy xuất an toàn numbers.at(i)
    // TỰ ĐỘNG GIẢI PHÓNG TOÀN BỘ VÙNG NHỚ HEAP KHI RA KHỎI HÀM NÀY!
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Sự Khác Biệt Giữa `struct` và `class` Trong C++
Trong C++, `struct` và `class` hầu như giống nhau 99% (đều có thể chứa hàm, constructor, kế thừa).
- **Điểm khác biệt duy nhất**:
  - `class`: Mọi thành viên và kế thừa mặc định là **`private`**.
  - `struct`: Mọi thành viên và kế thừa mặc định là **`public`**.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [advanced_demo.c](file:///d:/my-project/revision-document/c-cpp/05-advanced-and-cpp/advanced_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Destructor ảo (Virtual Destructor) là gì? Khi nào bắt buộc phải dùng?**
   *Trả lời*: Khi một class đóng vai trò làm class cha (Base class) có các class con kế thừa, Destructor của class cha **bắt buộc phải được khai báo là `virtual ~Base()`**. Nếu không có `virtual`, khi bạn giải phóng đối tượng con thông qua một con trỏ kiểu cha (`Base *p = new Derived(); delete p;`), chỉ có destructor của `Base` được gọi, còn destructor của `Derived` bị bỏ qua, dẫn đến rò rỉ bộ nhớ nghiêm trọng trong class con!
2. **Tại sao lập trình viên C++ hiện đại hầu như không bao giờ tự tay viết `malloc`/`free` hay `new`/`delete`?**
   *Trả lời*: Vì C++ hiện đại (Modern C++ từ C++11 trở đi) tuân thủ triết lý RAII thông qua **Con trỏ thông minh (Smart Pointers: `std::unique_ptr`, `std::shared_ptr`)** và các vùng chứa chuẩn (**STL Containers: `std::vector`, `std::string`**). Bộ nhớ được tự động quản lý và giải phóng 100% an toàn theo chu trình sống của biến, loại bỏ hoàn toàn nguy cơ rò rỉ ô nhớ hoặc con trỏ treo.
