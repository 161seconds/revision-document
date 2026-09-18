# Bài 02: Toán Tử, Độ Ưu Tiên, Xử Lý Chuỗi (String Pool) & Math

Phân tích sâu về độ ưu tiên toán tử, cơ chế ngắt sớm (Short-circuiting), tính chất bất biến của String, String Constant Pool và thư viện toán học `Math`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Cú pháp, Biến & Kiểu dữ liệu](file:///d:/my-project/revision-document/java/01-basics-and-syntax/01-syntax-variables-and-types.md).
- **Trọng tâm hiện tại**:
  - Độ ưu tiên 16 cấp độ toán tử và logic ngắt sớm `&&`, `||`.
  - String Immutability và cơ chế String Constant Pool trong Heap.
  - So sánh `String` vs `StringBuilder` vs `StringBuffer`.
  - Các hàm tiện ích trong `java.lang.Math`.
- **Tiếp theo**: [Bài 03: Điều khiển luồng & Mảng](file:///d:/my-project/revision-document/java/01-basics-and-syntax/03-control-flow-and-arrays.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. String Constant Pool (SCP)
- Từ Java 7, String Constant Pool nằm trong vùng nhớ **Heap**.
- Khi khai báo `String s = "abc";`, JVM kiểm tra trong SCP xem có chuỗi `"abc"` chưa:
  - Nếu có: Tái sử dụng tham chiếu đến đối tượng đó.
  - Nếu chưa: Khởi tạo đối tượng mới trong SCP và trả về tham chiếu.
- Khi khai báo `String s = new String("abc");`:
  - JVM **bắt buộc tạo một đối tượng mới trên Heap** thông thường, không trỏ trực tiếp vào SCP.
  - Gọi `.intern()` sẽ đưa chuỗi vào SCP hoặc lấy chuỗi tương đương từ SCP.

### 2.2. Toán Tử Ngắt Sớm (Short-Circuit Logic)
- `a && b`: Nếu `a == false`, biểu thức `b` hoàn toàn không được đánh giá.
- `a || b`: Nếu `a == true`, biểu thức `b` hoàn toàn không được đánh giá.
- Áp dụng kiểm tra null an toàn:
  ```java
  if (user != null && user.isActive()) {
      // An toàn tuyệt đối khỏi NullPointerException
  }
  ```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: So sánh chuỗi bằng `==` thay vì `.equals()`
```java
String str1 = new String("Java");
String str2 = new String("Java");
System.out.println(str1 == str2);      // FALSE: So sánh địa chỉ vùng nhớ
System.out.println(str1.equals(str2));  // TRUE: So sánh nội dung logic
```

### Bẫy 2: Nối chuỗi bằng `+` trong vòng lặp lớn
- Mỗi lần `+` chuỗi trong vòng lặp, Java sẽ tạo mới 1 đối tượng `StringBuilder` rồi gọi `toString()`, tạo ra vô số rác trên Heap và kéo tụt hiệu năng xuống $O(N^2)$.
- **Khắc phục**: Luôn khởi tạo trước `StringBuilder sb = new StringBuilder();` và dùng `sb.append(...)`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [BasicsDemo.java](file:///d:/my-project/revision-document/java/01-basics-and-syntax/BasicsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao `String` trong Java lại được thiết kế là bất biến (immutable)?**
   *Trả lời*:
   - *An toàn luồng (Thread-safety)*: Đối tượng bất biến có thể được chia sẻ an toàn giữa nhiều luồng mà không cần đồng bộ.
   - *Bảo mật*: Các thông số nhạy cảm như username, password mạng, đường dẫn file thường dùng String. Nếu chuỗi bị biến đổi, hacker có thể can thiệp sau khi hệ thống đã kiểm tra quyền.
   - *Cơ chế Caching*: Cho phép hoạt động của String Constant Pool và tối ưu hóa bộ nhớ RAM.
   - *Tính nhất quán khi làm Key trong `HashMap`*: HashCode của String chỉ cần tính 1 lần duy nhất và lưu lại (cache hash), không sợ bị thay đổi giá trị làm hỏng cấu trúc bucket.
2. **`StringBuffer` khác `StringBuilder` ở điểm cốt lõi nào?**
   *Trả lời*: `StringBuffer` có các phương thức được đánh dấu `synchronized` để bảo đảm an toàn đa luồng (Thread-safe) nhưng tốc độ chậm hơn. `StringBuilder` (ra đời từ Java 5) không đồng bộ, tốc độ cao hơn nhiều, thích hợp cho 95% trường hợp xử lý đơn luồng.
