# Bài 03: Từ Khóa `super`, Interface Hiện Đại vs Abstract Class

Phân tích sâu về cơ chế gọi cha `super`, annotation `@Override`, và so sánh kiến trúc giữa Abstract Class và Interface (kèm các tính năng default, static, private methods).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Bài 02: 4 Trụ Cột OOP & Bổ Từ Truy Cập](file:///d:/my-project/revision-document/java/02-core-oop/02-four-oop-pillars.md).
- **Trọng tâm hiện tại**:
  - `super()` gọi constructor cha và `super.method()` tái sử dụng logic.
  - Abstract Class: Lớp trừu tượng và phương thức trừu tượng.
  - Interface: Đa kế thừa giao diện, các phương thức `default`, `static` (Java 8) và `private` (Java 9).
  - So sánh chi tiết triết lý thiết kế: Quan hệ *"IS-A"* vs *"CAN-DO"*.
- **Tiếp theo**: [Bài 04: Lớp Nội Bộ & Enums](file:///d:/my-project/revision-document/java/02-core-oop/04-inner-classes-and-enums.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. So Sánh Kiến Trúc: Abstract Class vs Interface

| Đặc Điểm | Abstract Class | Interface |
| :--- | :--- | :--- |
| **Kế thừa** | Đơn kế thừa (`extends Parent`) | Đa hiện thực (`implements A, B, C`) |
| **Trường dữ liệu (Fields)** | Có thể chứa mọi loại biến: instance state, `private`, `protected` | Chỉ chứa `public static final` (Hằng số ngầm định) |
| **Constructor** | Có constructor (gọi qua `super()`) | Hoàn toàn không có constructor |
| **Mở rộng mã lệnh** | Thêm phương thức mới không bắt buộc class con phải sửa nếu có thân hàm | Trước Java 8 sẽ làm vỡ mọi class implements. Từ Java 8 giải quyết bằng `default method` |
| **Tốc độ gọi hàm** | Rất nhanh qua Virtual Method Table (vtable) | Chậm hơn đôi chút qua Interface Table (itable) |

### 2.2. Phương Thức `default` & Xung Đột Đa Kế Thừa Giao Diện (Diamond Problem)
Khi một class hiện thực 2 interfaces cùng chứa 1 phương thức `default` trùng tên:
```java
interface A { default void show() { System.out.println("A"); } }
interface B { default void show() { System.out.println("B"); } }

class C implements A, B {
    // ❌ LỖI BIÊN DỊCH: Bắt buộc class C phải tự override để chỉ định rõ ràng
    @Override
    public void show() {
        A.super.show(); // Chọn hiện thực của A hoặc tự viết logic mới
    }
}
```

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Quên gọi `super()` khi class cha không có Constructor mặc định
- Nếu class cha chỉ có constructor có tham số: `public Parent(int id)`, thì mọi constructor của class con **bắt buộc phải gọi tường minh `super(id);` ở dòng đầu tiên**.
- Nếu quên, compiler sẽ cố gắng chèn `super();` không tham số và báo lỗi biên dịch ngay lập tức.

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [OopDemo.java](file:///d:/my-project/revision-document/java/02-core-oop/OopDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Khi nào nên chọn Abstract Class, khi nào nên chọn Interface?**
   *Trả lời*:
   - Chọn **Abstract Class** khi các class có quan hệ máu mủ huyết thống chặt chẽ (*IS-A*), cần chia sẻ trạng thái chung (các biến instance non-static) hoặc cần kiểm soát chu trình sống thông qua constructor.
   - Chọn **Interface** khi muốn định nghĩa một hợp đồng năng lực (*CAN-DO* / Role-based) giữa các class hoàn toàn không liên quan (ví dụ: `Comparable`, `Serializable`, `AutoCloseable`).
2. **Annotation `@Override` có bắt buộc không? Tại sao luôn nên viết nó?**
   *Trả lời*: Không bắt buộc về mặt cú pháp nhưng **cực kỳ quan trọng về mặt kỹ thuật**. `@Override` yêu cầu compiler kiểm tra xem phương thức có thực sự ghi đè phương thức của cha hay không. Nếu lập trình viên gõ sai tên hàm hoặc sai tham số (biến thành overload vô ý), compiler sẽ báo lỗi ngay, tránh lỗi logic runtime khó truy vết.
