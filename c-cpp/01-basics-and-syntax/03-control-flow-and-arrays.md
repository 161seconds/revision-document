# Bài 03: Cấu Trúc Điều Khiển & Kiến Trúc Bộ Nhớ Mảng (Row-Major)

Khảo sát chuyên sâu cấu trúc rẽ nhánh, vòng lặp, bẫy rơi nhánh (fall-through) trong `switch`, và cách mảng 1D, mảng 2D được bố trí liên tiếp trong bộ nhớ vật lý.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: Toán tử & Thao tác Bitwise](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/02-operators-and-bitwise.md).
- **Trọng tâm hiện tại**:
  - `if`, `else if`, `else` và toán tử 3 ngôi `?:`.
  - Cấu trúc `switch-case` và cơ chế fall-through.
  - Vòng lặp `for`, `while`, `do-while`, từ khóa `break` và `continue`.
  - Mảng 1 chiều: Khởi tạo, tính độ dài bằng `sizeof`.
  - Mảng 2 chiều: Kiến trúc Row-Major Order trong bộ nhớ RAM.
- **Tiếp theo**: [Bài 04: Chuỗi Ký Tự, string.h & Hàm](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/04-strings-and-functions.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Kiến Trúc Bộ Nhớ Mảng 2D (Row-Major Order)
Trong C, không có mảng đa chiều thực sự. Mảng 2D `int matrix[2][3]` thực chất là một dải ô nhớ liên tiếp gồm $2 \times 3 = 6$ phần tử `int`:

```
Bố trí trong RAM:
[ (0,0) | (0,1) | (0,2) | (1,0) | (1,1) | (1,2) ]
<------- Hàng 0 -------> <------- Hàng 1 ------->
```
Công thức tính địa chỉ phần tử:
$$\text{Address}(matrix[i][j]) = \text{BaseAddress} + (i \times 3 + j) \times \text{sizeof}(int)$$

### 2.2. Tối Ưu Hóa Bộ Đệm CPU (Cache Locality)
Do mảng được lưu theo hàng (Row-Major), việc duyệt mảng lồng nhau theo thứ tự:
```c
// ✅ TỐI ƯU CỰC ĐẠO: Truy cập tuần tự tận dụng CPU Cache Line (Spatial Locality)
for (int i = 0; i < ROWS; i++) {
    for (int j = 0; j < COLS; j++) {
        sum += matrix[i][j];
    }
}

// ❌ CHẬM GẤP NHIỀU LẦN: Nhảy cóc ô nhớ gây CPU Cache Miss liên tục!
for (int j = 0; j < COLS; j++) {
    for (int i = 0; i < ROWS; i++) {
        sum += matrix[i][j];
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Không Kiểm Tra Biên Mảng (Array Out-of-bounds)
C **hoàn toàn không có cơ chế kiểm tra giới hạn mảng** lúc chạy:
```c
int arr[5];
arr[10] = 99; // C vẫn cho phép biên dịch và chạy!
```
- Lệnh này sẽ ghi đè lên các biến khác trên Stack hoặc phá hỏng địa chỉ trả về của hàm, dẫn đến lỗi bảo mật hoặc crash bất thình lình.

### Bẫy 2: Quên `break` Trong Lệnh `switch`
Nếu quên `break;`, chương trình sẽ tiếp tục chạy tuồn tuột xuống các nhánh `case` bên dưới (Fall-through), bất kể điều kiện có khớp hay không.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [basics_demo.c](file:///d:/my-project/revision-document/c-cpp/01-basics-and-syntax/basics_demo.c).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao khi truyền mảng 2D vào hàm trong C, ta bắt buộc phải chỉ định số cột (ví dụ `void print(int arr[][3], int rows)`)?**
   *Trả lời*: Trình biên dịch C cần biết chính xác **số cột** để tính toán công thức dịch địa chỉ ô nhớ: $\text{Offset} = i \times \text{cols} + j$. Nếu không biết số cột, compiler không thể xác định điểm bắt đầu của hàng tiếp theo trong mảng bộ nhớ phẳng liên tiếp.
2. **`do-while` khác `while` ở điểm cốt lõi nào?**
   *Trả lời*: `while` kiểm tra điều kiện trước khi thực thi thân vòng lặp. `do-while` luôn thực thi khối lệnh ít nhất một lần trước khi kiểm tra điều kiện ở cuối vòng lặp.
