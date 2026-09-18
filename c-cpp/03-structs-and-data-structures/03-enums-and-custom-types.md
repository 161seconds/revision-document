# Bài 03: Kiểu Liệt Kê Enums & Thiết Kế Máy Hữu Hạn Trạng Thái

Khảo sát kiểu dữ liệu liệt kê `enum` trong C, bản chất ánh xạ số nguyên ngầm định, và ứng dụng thiết kế máy hữu hạn trạng thái (Finite State Machine - FSM) trong hệ thống nhúng và mạng.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: Đệm Bộ Nhớ & Union](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/02-memory-alignment-and-unions.md).
- **Trọng tâm hiện tại**:
  - Khái niệm `enum`: Định nghĩa tập hợp các hằng số có tên định danh.
  - Quy tắc đánh số ngầm định (Bắt đầu từ 0 và tăng dần 1 đơn vị).
  - Gán giá trị tường minh cho các phần tử enum.
  - Sử dụng enum làm mã trạng thái (Status Codes, State Machine).
- **Tiếp theo**: [Bài 04: Cài Đặt Danh Sách Liên Kết Đơn](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/04-linked-list-and-abstract-types.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất Số Nguyên Của `enum` Trong C
- Trong ngôn ngữ C, **`enum` thực chất chỉ là một số nguyên kiểu `int`** được gán tên dễ đọc để code sáng sủa hơn:
  ```c
  enum Level {
      LOW,    // 0
      MEDIUM, // 1
      HIGH    // 2
  };
  ```
- Bạn có thể gán giá trị bất kỳ:
  ```c
  enum HttpStatus {
      HTTP_OK = 200,
      HTTP_NOT_FOUND = 404,
      HTTP_SERVER_ERROR = 500
  };
  ```

### 2.2. Thiết Kế Máy Hữu Hạn Trạng Thái (Finite State Machine)
```c
typedef enum {
    STATE_IDLE,
    STATE_CONNECTING,
    STATE_CONNECTED,
    STATE_DISCONNECTED
} ConnectionState;

void handleState(ConnectionState state) {
    switch (state) {
        case STATE_IDLE:        /* logic */ break;
        case STATE_CONNECTING:  /* logic */ break;
        case STATE_CONNECTED:   /* logic */ break;
        case STATE_DISCONNECTED:/* logic */ break;
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: C Thiếu Tính Năng Type-Safety Cho `enum`
Khác với C++ (với `enum class`) hoặc Java, trong C bạn có thể thoải mái gán một số nguyên bất kỳ hoặc gán chéo 2 enum khác nhau mà trình biên dịch C không hề cảnh báo:
```c
enum Color { RED, GREEN, BLUE };
enum Level { LOW, HIGH };

enum Color c = 999;     // C vẫn cho phép!
enum Color c2 = HIGH;   // C vẫn cho phép vì cả 2 đều là int!
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [structs_demo.c](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/structs_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Kích thước của một biến `enum` trong C là bao nhiêu bytes?**
   *Trả lời*: Kích thước của biến `enum` trong C bằng kích thước của kiểu `int` trên hệ thống đó (thường là 4 bytes).
2. **`enum` khác `#define` ở điểm cốt lõi nào?**
   *Trả lời*:
   - `#define`: Chỉ là sự thay thế chuỗi văn bản ở giai đoạn tiền xử lý (Preprocessor), không có mặt trong bảng ký hiệu (Symbol Table) của trình gỡ lỗi (Debugger).
   - `enum`: Được quản lý bởi trình biên dịch, xuất hiện đầy đủ trong debugger (gdb có thể hiển thị tên `STATE_CONNECTED` thay vì chỉ hiển thị số `2`), và có thể tự động tăng giá trị mà không cần gán thủ công.
