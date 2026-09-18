# Bài 01: Kiểu Cấu Trúc `struct`, `typedef` & Toán Tử Mũi Tên '->'

Khảo sát cách gom nhóm các biến thuộc các kiểu dữ liệu khác nhau thành một bản ghi thực thể (Record), cú pháp đặt bí danh kiểu `typedef`, và sự khác biệt giữa toán tử `.` và `->`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 02: Con Trỏ & Quản Lý Bộ Nhớ](file:///d:/my-project/revision-document/c-cpp/02-pointers-and-memory/README.md).
- **Trọng tâm hiện tại**:
  - Định nghĩa kiểu cấu trúc `struct`.
  - Từ khóa `typedef` để tránh phải lặp lại `struct TagName`.
  - Khởi tạo giá trị: Khởi tạo tuần tự vs Khởi tạo theo tên (Designated Initializer - C99).
  - Truy cập thành viên: Toán tử dấu chấm `.` vs Toán tử mũi tên `->`.
  - Truyền struct vào hàm: Pass-by-value (sao chép toàn bộ struct) vs Pass-by-pointer (`const Struct*`).
- **Tiếp theo**: [Bài 02: Đệm Bộ Nhớ & Union](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/02-memory-alignment-and-unions.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất Toán Tử Mũi Tên `->`
- Khi bạn có một con trỏ trỏ tới struct: `Student *ptr = &s1;`
- Muốn truy cập trường `name`: Bạn phải giải tham chiếu con trỏ trước rồi mới chấm: `(*ptr).name`.
- Do toán tử dấu chấm `.` có độ ưu tiên cao hơn toán tử `*`, dấu ngoặc đơn `(*ptr)` là bắt buộc.
- C cung cấp toán tử mũi tên **`->` làm cú pháp viết tắt (Syntactic Sugar)** cho thao tác này:
  $$\text{ptr->name} \iff (*\text{ptr}).\text{name}$$

### 2.2. Tối Ưu Hiệu Năng Khi Truyền Struct Vào Hàm
```c
typedef struct {
    int id;
    char name[100];
    double matrix[10][10]; // Chiếm hàng trăm bytes!
} BigData;

// ❌ CHẬM & LÃNG PHÍ STACK: Sao chép toàn bộ hàng trăm bytes mỗi lần gọi hàm
void processBad(BigData data);

// ✅ TỐI ƯU HIỆU NĂNG CAO: Chỉ truyền con trỏ 8 bytes, dùng 'const' để chống sửa đổi dữ liệu
void processGood(const BigData *data);
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: So Sánh 2 Struct Bằng Toán Tử `==`
Trong C, **bạn không thể so sánh hai struct bằng `==`** (`if (s1 == s2)` $\rightarrow$ Lỗi biên dịch!).
- Lý do: Do hiện tượng đệm bộ nhớ (Padding bytes) chứa các giá trị rác ngẫu nhiên, việc so sánh từng byte (như `memcmp`) cũng không an toàn.
- **Khắc phục**: Bạn phải tự viết một hàm so sánh từng trường dữ liệu logic:
  `bool areEqual(const Student *a, const Student *b) { return a->id == b->id && ...; }`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [structs_demo.c](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/structs_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Khởi tạo theo tên (Designated Initializer) trong chuẩn C99 có ưu điểm gì?**
   *Trả lời*: Cho phép khởi tạo các trường theo tên mà không phụ thuộc vào thứ tự khai báo trong struct, và các trường không được nhắc tới sẽ tự động được điền giá trị 0/NULL mặc định. Ví dụ: `Point p = {.y = 20, .x = 10};`.
2. **Tại sao `typedef struct Node Node;` lại hữu ích khi định nghĩa danh sách liên kết tự trỏ (Self-referential struct)?**
   *Trả lời*: Cho phép khai báo con trỏ tiếp theo `struct Node *next;` bên trong struct mà không bị lỗi compiler chưa nhận diện kiểu dữ liệu, đồng thời giúp code bên ngoài chỉ cần viết `Node *head;` thay vì `struct Node *head;`.
