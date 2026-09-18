# Bài 03: Điều Khiển Luồng, Switch Expressions, Vòng Lặp & Mảng

Khảo sát chuyên sâu cấu trúc rẽ nhánh hiện đại (Switch Expression & Yield), kỹ thuật thoát vòng lặp lồng nhau với nhãn (Label), và kiến trúc bộ nhớ mảng 1D, mảng đa chiều răng cưa.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: Toán tử, Chuỗi & Math](file:///d:/my-project/revision-document/java/01-basics-and-syntax/02-operators-strings-and-math.md).
- **Trọng tâm hiện tại**:
  - `if`, `else if`, `else` và toán tử 3 ngôi (Ternary operator).
  - Cú pháp `switch` truyền thống và `switch expression` (Java 14+).
  - Vòng lặp: `while`, `do-while`, `for`, enhanced `for-each`.
  - Điều khiển nhảy: `break`, `continue`, Labeled Loops.
  - Mảng 1 chiều, Mảng 2 chiều không đồng đều (Ragged/Jagged Arrays).
- **Tiếp theo**: [Bài 04: Phương thức, Scanner & java.time](file:///d:/my-project/revision-document/java/01-basics-and-syntax/04-methods-scanner-and-datetime.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Switch Expression (Java 14+)
Khác với câu lệnh `switch` cổ điển dễ bị lỗi bỏ quên `break` dẫn đến rơi nhánh (fall-through), Switch Expression dùng mũi tên `->`:
- Không cần từ khóa `break`.
- Có thể trả về giá trị trực tiếp như một biểu thức.
- Nếu dùng khối lệnh `{ ... }`, từ khóa `yield` được dùng để trả về giá trị:
```java
String season = switch (month) {
    case 12, 1, 2 -> "Winter";
    case 3, 4, 5 -> "Spring";
    case 6, 7, 8 -> "Summer";
    case 9, 10, 11 -> "Autumn";
    default -> {
        System.out.println("Invalid month");
        yield "Unknown";
    }
};
```

### 2.2. Kiến Trúc Bộ Nhớ Mảng (Array Memory Model)
- Trong Java, **mảng luôn là một Object** được cấp phát trên **Heap**.
- Mảng đa chiều trong Java thực chất là **Mảng chứa các tham chiếu trỏ đến các mảng khác** (Array of Arrays), do đó các hàng có thể có độ dài hoàn toàn khác nhau (Ragged Arrays):

```
       Stack                   Heap
   +-----------+          +---------------+
   |  matrix   | =======> | [0] | [1] |   | (Mảng chính)
   +-----------+            |     |
                            v     v
                         [x, y]  [a, b, c, d] (Các hàng độc lập)
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Sửa đổi mảng trong vòng lặp `for-each`
Vòng lặp enhanced `for-each` chỉ đọc giá trị bản sao của biến lặp khi duyệt kiểu nguyên thủy:
```java
int[] nums = {1, 2, 3};
for (int n : nums) {
    n = n * 10; // ❌ Không làm thay đổi giá trị của mảng gốc!
}
// nums vẫn là [1, 2, 3]
```

### Bẫy 2: Thoát khỏi vòng lặp lồng nhau
Nếu chỉ dùng `break;` thông thường trong vòng lặp con, chương trình chỉ thoát khỏi vòng lặp con gần nhất, vòng lặp cha vẫn tiếp tục chạy.
- **Giải pháp**: Dùng nhãn (Labeled loop):
  ```java
  findTarget:
  for (int i = 0; i < rows; i++) {
      for (int j = 0; j < cols; j++) {
          if (grid[i][j] == target) {
              break findTarget; // Thoát ra ngoài cả 2 vòng lặp
          }
      }
  }
  ```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [BasicsDemo.java](file:///d:/my-project/revision-document/java/01-basics-and-syntax/BasicsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao chỉ số mảng trong Java (và hầu hết ngôn ngữ) lại bắt đầu từ 0 thay vì 1?**
   *Trả lời*: Chỉ số mảng (Index) thực chất là khoảng cách bù (Offset) tính từ địa chỉ bắt đầu của mảng trong bộ nhớ. Công thức tính địa chỉ phần tử thứ $i$: $\text{Address}(i) = \text{BaseAddress} + i \times \text{SizeOfElement}$. Nếu bắt đầu từ 0, phần tử đầu tiên có $\text{Offset} = 0$, giúp CPU tính toán địa chỉ nhanh hơn mà không cần tốn thêm phép trừ $(- 1)$.
2. **`do-while` khác `while` ở điểm nào? Cho ví dụ ứng dụng thực tế.**
   *Trả lời*: `while` kiểm tra điều kiện trước khi thực thi thân vòng lặp (có thể không chạy lần nào nếu điều kiện ban đầu sai). `do-while` thực thi thân vòng lặp ít nhất 1 lần trước khi kiểm tra điều kiện. Thực tế thường dùng cho: Hiển thị menu người dùng và yêu cầu nhập lại nếu đầu vào không hợp lệ.
