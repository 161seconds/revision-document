# Bài 02: Căn Lề Bộ Nhớ (Structure Padding) & Kiểu Hợp Nhất `union`

Phân tích hiện tượng đệm bộ nhớ phần cứng (Memory Alignment & Structure Padding), cách sắp xếp biến để tiết kiệm RAM, chỉ thị `#pragma pack`, và cơ chế chia sẻ ô nhớ của `union`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Kiểu Cấu Trúc Struct & Typedef](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/01-structures-and-typedef.md).
- **Trọng tâm hiện tại**:
  - Tại sao CPU yêu cầu căn lề bộ nhớ (Memory Alignment)?
  - Hiện tượng chèn byte rác (Structure Padding).
  - Tối ưu hóa thứ tự khai báo trường để thu nhỏ kích thước struct.
  - Chỉ thị ép đóng gói `#pragma pack(1)`.
  - Khái niệm `union`: Dùng chung một vùng ô nhớ duy nhất.
- **Tiếp theo**: [Bài 03: Kiểu Liệt Kê Enums](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/03-enums-and-custom-types.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Tại Sao CPU Đòi Hỏi Căn Lề Bộ Nhớ?
- CPU hiện đại đọc dữ liệu từ bus bộ nhớ theo từng khối **4 bytes** (trên 32-bit) hoặc **8 bytes** (trên 64-bit) gọi là Memory Words.
- Nếu một biến `int` 4-byte nằm vắt ngang qua 2 word (ví dụ từ địa chỉ `0x1003` đến `0x1006`), CPU sẽ phải tốn **2 chu kỳ đọc bộ nhớ** và thực hiện phép dịch bit để ghép số lại, làm tụt giảm hiệu năng nghiêm trọng.
- Do đó, trình biên dịch tự động chèn các **byte đệm (Padding bytes)** để đưa địa chỉ biến về bội số kích thước của nó.

```c
// Trường hợp lãng phí RAM:
struct Waste {
    char a;      // 1 byte
    // [3 bytes padding]
    int b;       // 4 bytes
    char c;      // 1 byte
    // [3 bytes padding]
}; // Tổng: 12 bytes!

// Trường hợp tối ưu (Sắp xếp từ lớn đến bé):
struct Optimized {
    int b;       // 4 bytes
    char a;      // 1 byte
    char c;      // 1 byte
    // [2 bytes padding]
}; // Tổng: 8 bytes! (Tiết kiệm 33% dung lượng RAM)
```

### 2.2. Kiểu Hợp Nhất `union`
- Trong `struct`, mỗi thành viên có một ô nhớ riêng biệt. Kích thước struct $\ge$ tổng kích thước các thành viên.
- Trong `union`, tất cả thành viên **cùng bắt đầu tại một địa chỉ ô nhớ duy nhất**. Kích thước của union chỉ bằng kích thước của thành viên lớn nhất:

```c
union Data {
    int i;
    float f;
    char str[20];
}; // sizeof(union Data) = 20 bytes (kích thước của str[20])
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Dùng `#pragma pack(1)` Bừa Bãi
Chỉ thị `#pragma pack(1)` ép trình biên dịch loại bỏ 100% byte đệm (kích thước struct sẽ bằng đúng tổng kích thước các trường).
- **Hệ quả**: Tiết kiệm RAM nhưng làm tốc độ truy xuất dữ liệu của CPU chậm đi đáng kể trên một số kiến trúc ARM/x86, thậm chí có thể gây lỗi phần cứng `Alignment Fault` trên một số chip nhúng cũ.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [structs_demo.c](file:///d:/my-project/revision-document/c-cpp/03-structs-and-data-structures/structs_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Khi nào nên sử dụng `union` trong thực tế?**
   *Trả lời*:
   - Khi mô hình hóa dữ liệu biến đổi (Tagged Union / Variant): Một trường dữ liệu có thể là số nguyên, số thực hoặc chuỗi tùy thuộc vào một cờ loại dữ liệu.
   - Trong lập trình nhúng và trình điều khiển thiết bị (Device Drivers): Đọc dữ liệu thô từ thanh ghi phần cứng (ví dụ: một thanh ghi 32-bit vừa có thể đọc thành 1 số `uint32_t`, vừa có thể đọc thành mảng 4 bytes riêng lẻ `uint8_t bytes[4]`).
2. **Quy tắc vàng để tối ưu hóa kích thước struct mà không cần dùng `#pragma pack` là gì?**
   *Trả lời*: Khai báo các thành viên theo **thứ tự giảm dần của kích thước** (`double` 8B $\rightarrow$ con trỏ 8B $\rightarrow$ `int` 4B $\rightarrow$ `short` 2B $\rightarrow$ `char` 1B). Cách sắp xếp này giúp triệt tiêu hầu như toàn bộ các byte đệm không cần thiết giữa các trường.
