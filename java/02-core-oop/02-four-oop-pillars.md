# Bài 02: 4 Trụ Cột OOP & Bổ Từ Phân Quyền Truy Cập

Khảo sát toàn diện 4 tính chất cốt lõi của Lập trình hướng đối tượng (Đóng gói, Kế thừa, Đa hình, Trừu tượng), hệ thống bổ từ truy cập và bổ từ phi truy cập.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 01: Lớp, Đối tượng & Constructor](file:///d:/my-project/revision-document/java/02-core-oop/01-classes-objects-and-constructors.md).
- **Trọng tâm hiện tại**:
  - Tính đóng gói (Encapsulation) & Data hiding.
  - Tính kế thừa (Inheritance) qua `extends`.
  - Tính đa hình (Polymorphism): Compile-time (Overloading) vs Runtime (Overriding & Virtual Method Invocation).
  - Tính trừu tượng (Abstraction).
  - Ma trận 4 mức Access Modifiers (`private`, package-private, `protected`, `public`).
  - Từ khóa phi truy cập: `static`, `final`.
- **Tiếp theo**: [Bài 03: super, Interface vs Abstract Class](file:///d:/my-project/revision-document/java/02-core-oop/03-super-interfaces-and-abstract-classes.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. Đa Hình Khi Thực Thi (Runtime Polymorphism / Dynamic Method Dispatch)
- Khi gọi phương thức qua con trỏ cha trỏ tới đối tượng con: `Animal a = new Dog(); a.makeSound();`
- JVM sử dụng **Virtual Method Table (vtable)** để tra cứu địa chỉ hàm ghi đè của đối tượng thực tế trên Heap lúc runtime. Do đó phương thức `makeSound()` của `Dog` sẽ được gọi thay vì của `Animal`.

### 2.2. Ma Trận Quyền Truy Cập (Access Modifiers Matrix)

| Modifier | Cùng Class | Cùng Package | Class con (Khác Package) | Toàn thế giới |
| :--- | :---: | :---: | :---: | :---: |
| **`private`** | ✅ | ❌ | ❌ | ❌ |
| **Default (Không ghi)** | ✅ | ✅ | ❌ | ❌ |
| **`protected`** | ✅ | ✅ | ✅ | ❌ |
| **`public`** | ✅ | ✅ | ✅ | ✅ |

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Thu Hẹp Quyền Truy Cập Khi Ghi Đè (@Override)
- Quy tắc: Phương thức ghi đè ở class con **không được phép thu hẹp quyền truy cập** so với phương thức ở class cha.
- Ví dụ: Nếu class cha khai báo `protected void process()`, thì class con chỉ có thể khai báo là `protected` hoặc nới rộng lên `public`, tuyệt đối không được hạ xuống `private` hay `default`.

### Bẫy 2: Biến `static` bị hiểu lầm là thuộc về đối tượng
```java
Counter c1 = new Counter();
Counter c2 = new Counter();
c1.count = 10;
System.out.println(c2.count); // Vẫn in ra 10!
```
- Biến `static` chỉ có 1 bản sao duy nhất trong Metaspace, được chia sẻ giữa mọi thực thể. Luôn truy cập qua tên lớp: `Counter.count`.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [OopDemo.java](file:///d:/my-project/revision-document/java/02-core-oop/OopDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Ghi đè phương thức (Overriding) có áp dụng được cho phương thức `static` không?**
   *Trả lời*: **Không**. Phương thức `static` thuộc về class và được liên kết tại thời điểm biên dịch (Compile-time / Early Binding). Nếu class con viết một phương thức `static` trùng tên và tham số với cha, đây là cơ chế **Method Hiding (Ẩn phương thức)** chứ không phải Đa hình ghi đè.
2. **Khi nào nên dùng `final` cho một Class? Cho ví dụ trong Java Standard Library.**
   *Trả lời*: Dùng `final` khi muốn đảm bảo tính bất biến (Immutability), ngăn chặn class con phá vỡ kiến trúc hoặc bảo vệ logic bảo mật. Ví dụ kinh điển: `java.lang.String`, `java.lang.Integer`, `java.lang.Math` đều là final classes.
