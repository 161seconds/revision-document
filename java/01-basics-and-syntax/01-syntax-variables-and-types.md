# Bài 01: Cú Pháp Nền Tảng, Biến, 8 Kiểu Nguyên Thủy & Từ Khóa `var`

Tài liệu chuyên sâu về cấu trúc chương trình Java, phân bổ bộ nhớ biến, hệ thống kiểu nguyên thủy và cơ chế suy luận kiểu biến cục bộ.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: Khái niệm biến và kiểu dữ liệu trong khoa học máy tính.
- **Trọng tâm hiện tại**:
  - Cấu trúc `class`, hàm `public static void main(String[] args)`.
  - 8 kiểu dữ liệu nguyên thủy (Primitive Types) và kích thước bit/byte.
  - Từ khóa `final` định nghĩa hằng số.
  - Kiểu suy luận `var` (Local Variable Type Inference - Java 10+).
  - Ép kiểu ngầm định (Widening) và tường minh (Narrowing).
- **Tiếp theo**: [Bài 02: Toán tử, Chuỗi & Math](file:///d:/my-project/revision-document/java/01-basics-and-syntax/02-operators-strings-and-math.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Cấu Trúc Khung & Hàm `main`
```java
public class HelloJava {
    public static void main(String[] args) {
        System.out.println("Java Core Revision");
    }
}
```
- `public`: Cho phép JVM có thể truy cập và gọi hàm `main` từ bên ngoài package.
- `static`: JVM không cần khởi tạo đối tượng `new HelloJava()` vẫn có thể gọi trực tiếp hàm này.
- `void`: Hàm không trả về bất kỳ giá trị nào cho tiến trình cha của hệ điều hành.
- `String[] args`: Mảng chuỗi nhận các đối số truyền vào từ dòng lệnh CLI (Command Line Arguments).

### 2.2. Phân Bổ 8 Kiểu Nguyên Thủy Trên Stack
Các biến nguyên thủy khai báo trong thân hàm sẽ được cấp phát trực tiếp trên **Stack Frame** của hàm đó:

| Kiểu | Kích thước | Miền giá trị | Giá trị mặc định |
| :--- | :---: | :--- | :---: |
| `byte` | 1 byte (8 bit) | $-128 \dots 127$ | `0` |
| `short` | 2 bytes (16 bit) | $-32,768 \dots 32,767$ | `0` |
| `int` | 4 bytes (32 bit) | $-2^{31} \dots 2^{31}-1$ | `0` |
| `long` | 8 bytes (64 bit) | $-2^{63} \dots 2^{63}-1$ (Ký tự `L`) | `0L` |
| `float` | 4 bytes (32 bit) | IEEE 754 đơn chính xác (Ký tự `f`) | `0.0f` |
| `double` | 8 bytes (64 bit) | IEEE 754 kép chính xác (Mặc định số thực) | `0.0d` |
| `boolean`| JVM quy định | `true` hoặc `false` | `false` |
| `char` | 2 bytes (16 bit) | Unicode $0 \dots 65,535$ (`'\u0000'`) | `'\u0000'` |

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Ép kiểu thu hẹp gây tràn số âm (Integer Overflow)
```java
int largeNumber = 130;
byte smallByte = (byte) largeNumber; // Kết quả: -126
```
*Giải thích*: `130` trong hệ nhị phân 32-bit là `00000000 00000000 00000000 10000010`. Khi ép kiểu về 8-bit `byte`, chỉ 8 bit cuối `10000010` được giữ lại. Bit đầu là `1` (bit dấu âm), biểu diễn bù hai của $-126$.

### Bẫy 2: Dùng `var` sai vị trí
- `var` **chỉ được dùng cho biến cục bộ** được gán giá trị ngay khi khai báo.
- `var` **không** được dùng cho: biến toàn cục (field) của class, tham số phương thức, kiểu trả về của hàm, hoặc gán giá trị `null` (`var x = null;` $\rightarrow$ Lỗi biên dịch).

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [BasicsDemo.java](file:///d:/my-project/revision-document/java/01-basics-and-syntax/BasicsDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Tại sao Java không hỗ trợ `unsigned int` nguyên bản như C++?**
   *Trả lời*: Nhà sáng lập Java (James Gosling) muốn đơn giản hóa hệ thống kiểu và loại bỏ lỗi logic tràn số thường gặp khi so sánh signed và unsigned trong C/C++. Từ Java 8+, class `Integer` hỗ trợ các hàm tĩnh xử lý số không dấu như `Integer.divideUnsigned()`, `Integer.toUnsignedString()`.
2. **Sự khác biệt giữa `float` và `double` là gì? Khi nào nên dùng loại nào?**
   *Trả lời*: `float` dùng 32-bit (6-7 chữ số có nghĩa), `double` dùng 64-bit (15-16 chữ số có nghĩa). Hầu hết phép tính khoa học dùng `double`. Với tiền tệ tài chính, tuyệt đối không dùng cả hai mà phải dùng `BigDecimal`.
