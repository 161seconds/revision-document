# Bài 04: Biểu Thức Lambda, Functional Interfaces & Sắp Xếp Nâng Cao

Khảo sát cuộc cách mạng lập trình hàm trong Java 8+: Cú pháp Lambda, Tham chiếu phương thức (Method References `::`), Bộ tứ giao diện hàm cốt lõi (`Predicate`, `Consumer`, `Function`, `Supplier`), và So sánh nâng cao bằng `Comparable` vs `Comparator`.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 03: Đa Luồng & Concurrency](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/03-multithreading-and-concurrency.md).
- **Trọng tâm hiện tại**:
  - Giao diện hàm (Functional Interface) và Annotation `@FunctionalInterface`.
  - Cú pháp Biểu thức Lambda: `(params) -> { body }`.
  - 4 loại Tham chiếu phương thức (Method References `::`).
  - Bộ tứ cốt lõi trong package `java.util.function`: `Predicate<T>`, `Consumer<T>`, `Function<T, R>`, `Supplier<T>`.
  - Sắp xếp tự nhiên với `Comparable<T>` (`compareTo()`).
  - Sắp xếp tùy biến đa tiêu chí với `Comparator<T>` (`comparing()`, `thenComparing()`, `reversed()`).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Bản Chất Bytecode Của Lambda: `invokedynamic`
- Trước Java 8, việc dùng Anonymous Inner Class sẽ sinh ra một file `.class` độc lập (ví dụ: `Main$1.class`), làm phình to kích thước ứng dụng và tốn bộ nhớ nạp class lúc khởi động.
- Từ Java 8, Lambda sử dụng lệnh mã máy bytecode **`invokedynamic` (JSR 292)** và `LambdaMetafactory`. JVM chỉ liên kết và sinh mã thực thi trực tiếp tại runtime mà không cần tạo class ẩn, đem lại hiệu năng vượt trội và tiết kiệm RAM.

### 2.2. Bộ Tứ Giao Diện Hàm Tiêu Chuẩn

| Interface | Phương thức trừu tượng | Mục đích nghiệp vụ | Ví dụ Lambda |
| :--- | :--- | :--- | :--- |
| **`Predicate<T>`** | `boolean test(T t)` | Kiểm tra điều kiện (Lọc danh sách) | `s -> s.startsWith("A")` |
| **`Function<T, R>`** | `R apply(T t)` | Biến đổi kiểu dữ liệu T thành kiểu R | `String::length` |
| **`Consumer<T>`** | `void accept(T t)` | Tiêu thụ giá trị, thực hiện tác vụ phụ | `System.out::println` |
| **`Supplier<T>`** | `T get()` | Tạo mới/Cung cấp đối tượng kiểu T | `() -> UUID.randomUUID()` |

### 2.3. Sắp Xếp Chuyên Sâu: `Comparable` vs `Comparator`

```java
// Sắp xếp danh sách học sinh theo điểm GPA giảm dần, nếu bằng điểm thì xếp theo Tên tăng dần
List<Student> list = getStudents();
list.sort(Comparator.comparingDouble(Student::getGpa).reversed()
                    .thenComparing(Student::getName));
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Biến Trong Lambda Phải Là Effectively Final
Mọi biến cục bộ khai báo bên ngoài mà được truy cập bên trong thân Lambda **bắt buộc không được phép gán lại giá trị** sau khi khởi tạo (Effectively Final).
```java
int factor = 2;
// factor = 3; // ❌ Nếu mở comment dòng này, câu lệnh lambda bên dưới sẽ báo lỗi biên dịch!
Function<Integer, Integer> multiply = x -> x * factor;
```

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [AdvancedDemo.java](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/AdvancedDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Functional Interface có thể chứa nhiều hơn một phương thức không?**
   *Trả lời*: Có thể. Một Functional Interface chỉ bị giới hạn có **duy nhất 1 phương thức trừu tượng (Single Abstract Method - SAM)**. Ngoài ra, nó hoàn toàn có thể chứa thêm không giới hạn các phương thức `default`, `static`, hoặc các phương thức `public` được kế thừa từ lớp `java.lang.Object` (như `equals()`).
2. **Nêu 4 loại tham chiếu phương thức (Method References `::`) trong Java?**
   *Trả lời*:
   - Tham chiếu đến phương thức tĩnh (Static method): `Math::max` (tương đương `(a, b) -> Math.max(a, b)`).
   - Tham chiếu đến phương thức của đối tượng cụ thể: `System.out::println` (tương đương `x -> System.out.println(x)`).
   - Tham chiếu đến phương thức của đối tượng tùy ý của một kiểu: `String::toUpperCase` (tương đương `s -> s.toUpperCase()`).
   - Tham chiếu đến Constructor: `ArrayList::new` (tương đương `() -> new ArrayList<>()`).
