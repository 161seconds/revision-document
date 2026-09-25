# Chapter 8: Bộ Câu Hỏi Phỏng Vấn Tuyển Dụng C# / .NET Thực Chiến

> **Tổng hợp từ kinh nghiệm Mock Interviews của tác giả Almantas Karpavicius** cùng bộ câu hỏi tuyển dụng kỹ thuật thường gặp nhất tại các công ty công nghệ cho vị trí C# / .NET Developer (Junior -> Senior).

---

## 🎯 Phần 1: Các Câu Hỏi Bẫy Nền Tảng Cốt Tử (Core C# Traps)

### 1. Phân biệt `struct` (Value Type) và `class` (Reference Type)? Khi nào nên dùng struct?
- **Bản chất bộ nhớ:**
  - `struct` được cấp phát trực tiếp tại nơi nó được khai báo (trên Stack nếu là biến cục bộ, hoặc nằm trực tiếp trong lòng object nếu là trường của class). Không tạo gánh nặng cho Garbage Collector.
  - `class` luôn được cấp phát trên Managed Heap, và biến chỉ lưu trữ con trỏ tham chiếu 4 hoặc 8 bytes.
- **Quy tắc sử dụng struct:** Chỉ dùng struct khi đối tượng:
  1. Đại diện cho một giá trị đơn lẻ (như `Point`, `ComplexNumber`, `Money`).
  2. Kích thước nhỏ (thường $\le 16$ bytes).
  3. Bất biến (Immutable - nên dùng `readonly struct`).
  4. Không cần kế thừa.

### 2. Boxing và Unboxing là gì? Tại sao phải tránh?
- **Boxing:** Quá trình chuyển đổi ngầm định một kiểu giá trị (`struct`, `int`) thành kiểu tham chiếu `object`. CLR phải cấp phát một đối tượng mới trên Heap và sao chép dữ liệu từ Stack sang Heap.
- **Unboxing:** Quá trình ép kiểu tường minh từ `object` trở lại kiểu giá trị trên Stack.
- **Tác hại:** Gây sụt giảm hiệu năng nặng nề và làm tràn ngập bộ nhớ thế hệ Gen 0 của Garbage Collector. Giải quyết triệt để bằng **Generics** (`List<int>` thay vì `ArrayList`).

### 3. Phân biệt `Dispose()` (`IDisposable`) và `Finalize()` (Destructor `~ClassName()`)?
- **`Dispose()`:** Được gọi chủ động bởi lập trình viên (hoặc thông qua khối lệnh `using`). Dùng để giải phóng **tài nguyên không được quản lý (Unmanaged Resources)** như File Handles, Database Connections, Socket Streams ngay lập tức.
- **`Finalize()`:** Được gọi thụ động bởi Garbage Collector trước khi thu hồi bộ nhớ của đối tượng. Chạy bất định (Non-deterministic), không biết trước thời điểm và làm chậm chu trình dọn rác (khiến object bị sống sót qua Gen 1/Gen 2).

### 4. String Interning là gì?
CLR duy trì một bảng băm nội bộ gọi là **String Intern Pool**. Khi gặp các chuỗi ký tự cố định (String Literals) giống hệt nhau trong mã nguồn (ví dụ: `"hello"`), CLR chỉ lưu một thể hiện duy nhất trên Heap và cho tất cả các biến cùng trỏ về địa chỉ đó nhằm tiết kiệm bộ nhớ:
```csharp
string s1 = "hello";
string s2 = "hello";
bool sameReference = object.ReferenceEquals(s1, s2); // true! (Do String Interning)
```

---

## 🎯 Phần 2: Câu Hỏi Về Thiết Kế & Kiến Trúc (Architecture & Patterns)

### 5. Sự khác biệt giữa Dependency Injection (DI) và Service Locator? Tại sao Service Locator bị coi là Antipattern?
- **DI:** Phụ thuộc được khai báo tường minh qua Constructor (Constructor Injection). Nhìn vào hàm tạo là biết ngay lớp cần những linh kiện gì để hoạt động.
- **Service Locator:** Lớp nhận vào một container và tự gọi `locator.GetService<ILogger>()` bên trong thân hàm. Điều này che giấu các phụ thuộc (Hidden Dependencies), khiến lớp nói dối về các yêu cầu của nó và gây khó khăn khi viết Unit Test.

### 6. Tại sao không bao giờ nên dùng `async void` trừ Event Handler?
Vì `async void` không trả về `Task`, phía người gọi không có cách nào `await` được nó, không biết khi nào nó hoàn thành, và **không thể bắt được ngoại lệ (Unhandled Exception)** bằng khối `try-catch`. Một ngoại lệ văng ra từ hàm `async void` sẽ làm sập (Crash) toàn bộ tiến trình ứng dụng ngay lập tức!

### 7. Nguyên tắc OCP được áp dụng như thế nào để thay thế câu lệnh `switch`?
Sử dụng **Strategy Pattern** hoặc **Polymorphism**. Thay vì dùng `switch (paymentMethod)` để gọi các hàm tương ứng, ta định nghĩa interface `IPaymentStrategy` với phương thức `Pay(decimal amount)`. Mỗi phương thức thanh toán (`VnPay`, `Momo`, `CreditCard`) là một class riêng biệt. Khi có cổng thanh toán mới, ta chỉ cần viết class mới mà không cần chạm vào code cũ.

---

## 🎥 Video Phỏng Vấn Kỹ Thuật Thực Tế Của Tác Giả
- Xem lại video phỏng vấn mẫu 1-1 giữa giảng viên Almantas Karpavicius và học viên: [Xem video Mock Interview #1](https://youtu.be/xzHKHen4u1Q).
