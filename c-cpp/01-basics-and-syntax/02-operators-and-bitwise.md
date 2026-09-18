# Bài 02: Toán Tử, Độ Ưu Tiên & Kỹ Thuật Thao Tác Bitwise Trong C

Khảo sát chuyên sâu bộ 6 toán tử thao tác bit (`&`, `|`, `^`, `~`, `<<`, `>>`) và các kỹ thuật mặt nạ bit (Bitmasking) ứng dụng trong lập trình nhúng, hệ điều hành và tối ưu hóa hiệu năng.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Cú Pháp Nền Tảng & Kiểu Dữ Liệu](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/01-syntax-variables-and-data-types.md).
- **Trọng tâm hiện tại**:
  - Toán tử số học, so sánh, logic (`&&`, `||`, `!`).
  - Phép toán bit: AND `&`, OR `|`, XOR `^`, NOT `~`.
  - Dịch bit trái `<<` và dịch bit phải `>>`.
  - Bộ 4 thao tác bit kinh điển: Bật bit (Set), Tắt bit (Clear), Đảo bit (Toggle), Kiểm tra bit (Test).
  - Độ ưu tiên toán tử trong C.
- **Tiếp theo**: [Bài 03: Cấu Trúc Điều Khiển & Mảng](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/03-control-flow-and-arrays.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. 4 Kỹ Thuật Thao Tác Bit Cốt Lõi (The Bitmasking Quad)
Cho biến cờ trạng thái `flags` và cần can thiệp vào bit thứ $k$ (tính từ 0 từ phải qua trái):

```c
// 1. Bật bit thứ k lên 1 (Set bit)
flags |= (1 << k);

// 2. Tắt bit thứ k về 0 (Clear bit)
flags &= ~(1 << k);

// 3. Đảo bit thứ k (Toggle bit: 0 -> 1, 1 -> 0)
flags ^= (1 << k);

// 4. Kiểm tra bit thứ k có đang bật (== 1) không (Test bit)
int is_set = (flags & (1 << k)) != 0;
```

### 2.2. Kiểm Tra Lũy Thừa Của 2 Bằng Phép Bit Siêu Tốc
Một số nguyên dương $N$ là lũy thừa của 2 ($2, 4, 8, 16\dots$) khi và chỉ khi nó chỉ có đúng duy nhất 1 bit `1` trong biểu diễn nhị phân. Công thức kiểm tra trong $O(1)$:
```c
int is_power_of_two = (n > 0) && ((n & (n - 1)) == 0);
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Độ Ưu Tiên Của Toán Tử Bit Thấp Hơn Toán Tử So Sánh
- Trong C, toán tử so sánh `==`, `!=` có **độ ưu tiên cao hơn** toán tử bit `&`, `|`!
```c
// ❌ SAI: (flags & mask == 0) sẽ bị hiểu là: flags & (mask == 0)
if (flags & 1 == 0) { ... }

// ✅ ĐÚNG: Luôn luôn bọc phép toán bit trong ngoặc đơn
if ((flags & 1) == 0) { ... }
```

### Bẫy 2: Dịch Bit Quá Giới Hạn Hoặc Dịch Số Âm (Undefined Behavior)
Dịch bit trái hoặc phải vượt quá kích thước kiểu (ví dụ: `int x = 1 << 35` trên hệ thống 32-bit) hoặc dịch bit trên số âm có dấu là hành vi bất định (Undefined Behavior) theo chuẩn C.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [basics_demo.c](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/basics_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Làm thế nào để hoán đổi 2 số nguyên mà không dùng biến tạm trong C? Nêu nhược điểm.**
   *Trả lời*:
   - Dùng toán tử XOR: `a ^= b; b ^= a; a ^= b;`.
   - Nhược điểm: Nếu `a` và `b` cùng trỏ tới cùng 1 ô nhớ (ví dụ trong thuật toán sắp xếp khi hoán đổi phần tử với chính nó: `swap(&arr[i], &arr[i])`), kết quả sẽ biến ô nhớ đó thành `0`! Ngoài ra, các trình biên dịch hiện đại tối ưu biến tạm qua thanh ghi CPU nhanh hơn dùng XOR.
2. **Toán tử `&&` và `||` trong C có cơ chế ngắt sớm (Short-circuit) không?**
   *Trả lời*: **Có**. `a && b`: Nếu `a` bằng 0 thì `b` hoàn toàn không được chạy. `a || b`: Nếu `a` khác 0 thì `b` hoàn toàn không được chạy.
