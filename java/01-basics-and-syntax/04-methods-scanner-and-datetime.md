# Bài 04: Phương Thức, Truyền Tham Số, Scanner & Thư Viện Thời Gian

Khảo sát chuyên sâu bản chất truyền tham số Pass-by-value, nạp chồng phương thức (Overloading), đệ quy an toàn, bẫy trôi lệnh của `Scanner` và thư viện thời gian hiện đại `java.time`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: Điều khiển luồng & Mảng](file:///d:/my-project/revision-document/java/01-basics-and-syntax/03-control-flow-and-arrays.md).
- **Trọng tâm hiện tại**:
  - Chữ ký phương thức (Method signature) & Nạp chồng phương thức (Overloading).
  - Bản chất 100% Pass-By-Value của Java (Primitive vs Object Reference).
  - Đệ quy (Recursion) và điều kiện dừng (Base case).
  - Nhập liệu bàn phím với `java.util.Scanner` và cách khắc phục lỗi trôi dòng.
  - Xử lý ngày giờ hiện đại bằng `java.time.LocalDate`, `LocalDateTime`, `DateTimeFormatter`.
- **Tiếp theo**: [Module 02: Lập trình hướng đối tượng OOP](file:///d:/my-project/revision-document/java/02-core-oop/README.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất 100% Pass-By-Value
Trong Java, không có khái niệm Pass-By-Reference như con trỏ trong C++:
- **Kiểu nguyên thủy**: Sao chép giá trị (Bit value). Thay đổi giá trị biến trong hàm không ảnh hưởng biến gốc.
- **Kiểu đối tượng**: Sao chép **địa chỉ tham chiếu (Reference handle)**.
  - Nếu thay đổi thuộc tính của đối tượng thông qua tham chiếu đó: Đối tượng gốc trên Heap **bị thay đổi**.
  - Nếu gán tham chiếu đó sang một đối tượng mới bằng `new`: Tham chiếu gốc ở hàm ngoài **không hề bị thay đổi**.

```
Hàm main(): personPtr = 0x1000
Gọi modify(personPtr):
  Stack Frame modify: p = 0x1000 (Bản sao con trỏ)
  p.setName("New") -> Sửa đối tượng tại 0x1000 trên Heap (Thành công!)
  p = 0x2000 -> Chỉ thay đổi con trỏ p trong stack frame modify (personPtr ngoài main vẫn là 0x1000)
```

### 2.2. Thư Viện Thời Gian `java.time` (Java 8+)
- Các class cũ (`java.util.Date`, `Calendar`) bị lỗi thiết kế nghiêm trọng: Tháng bắt đầu từ 0, Năm bắt đầu từ 1900, và **không an toàn đa luồng** (Mutable).
- `java.time` API thiết kế theo chuẩn Joda-Time:
  - **Bất biến (Immutable)**: Mọi phép biến đổi thời gian (`plusDays`, `minusHours`) đều trả về một đối tượng mới.
  - **Thread-safe**: An toàn tuyệt đối khi dùng trong môi trường đa luồng.
  - Tách biệt rõ ràng: `LocalDate` (ngày), `LocalTime` (giờ), `LocalDateTime` (ngày giờ), `ZonedDateTime` (kèm múi giờ).

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Trôi lệnh khi dùng `sc.nextLine()` sau `sc.nextInt()`
```java
Scanner sc = new Scanner(System.in);
System.out.print("Nhập tuổi: ");
int age = sc.nextInt(); // Nhập 20 rồi gõ Enter -> \n vẫn còn trong buffer!

System.out.print("Nhập tên: ");
String name = sc.nextLine(); // Bị trôi! Hàm đọc ngay ký tự \n còn sót và gán name = ""
```
- **Giải pháp**: Luôn gọi `sc.nextLine();` ngay sau `sc.nextInt()` hoặc `sc.nextDouble()` để làm rỗng bộ đệm.

### Bẫy 2: Nạp chồng hàm chỉ khác mỗi kiểu trả về (Return Type)
```java
// ❌ LỖI BIÊN DỊCH: Trình biên dịch không thể phân biệt hàm dựa vào return type
public int calculate(int x) { return x * 2; }
public double calculate(int x) { return x * 2.0; } 
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [BasicsDemo.java](file:///d:/my-project/revision-document/java/01-basics-and-syntax/BasicsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Java là Pass-by-value hay Pass-by-reference? Giải thích ví dụ hoán đổi 2 số `swap(a, b)`.**
   *Trả lời*: Java là 100% Pass-by-value. Nếu bạn viết phương thức `swap(int a, int b) { int temp = a; a = b; b = temp; }`, hai biến nguyên thủy ban đầu ngoài hàm `main` sẽ không bao giờ bị tráo đổi, vì hàm chỉ thao tác trên bản sao giá trị trong Stack Frame của `swap`. Kể cả với `Integer`, do tính chất bất biến (immutable) của Integer, ta cũng không thể tráo đổi được.
2. **Làm thế nào để tránh tràn ngăn xếp `StackOverflowError` khi viết hàm đệ quy?**
   *Trả lời*: Đảm bảo luôn có **Base Case (Điều kiện dừng)** chắc chắn đạt được sau một số bước hữu hạn. Nếu bài toán có chiều sâu đệ quy lớn (hàng chục nghìn bước), nên chuyển đổi đệ quy sang **vòng lặp lặp lại (Iterative)** hoặc kỹ thuật đệ quy đuôi kết hợp cấu trúc dữ liệu Stack ngoài Heap.
