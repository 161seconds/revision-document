# Bài 03: Lập Trình Đa Luồng (Multithreading) & Đồng Bộ Hóa Concurrency

Khảo sát toàn diện kiến trúc đa luồng trong Java, phân biệt `Thread` vs `Runnable`, mô hình 6 trạng thái vòng đời của luồng, từ khóa `synchronized`, từ khóa `volatile` và kỹ thuật bảo vệ vùng tranh chấp tài nguyên (Race Condition).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Tiên quyết**: [Module 01: Kiến Trúc Bộ Nhớ JVM](file:///d:/my-project/revision-document/java/01-basics-and-syntax/README.md).
- **Trọng tâm hiện tại**:
  - Luồng (Thread) là đơn vị thực thi nhỏ nhất được hệ điều hành lập lịch.
  - 2 cách tạo Thread: Kế thừa `Thread` vs Hiện thực `Runnable`.
  - Vòng đời 6 trạng thái của Thread theo chuẩn JVM (`Thread.State`).
  - Tranh chấp dữ liệu (Race Condition) và Vùng tranh chấp (Critical Section).
  - Đồng bộ hóa với từ khóa `synchronized` (Khóa Monitor Lock).
  - Từ khóa `volatile`: Tính hiển thị bộ nhớ (Memory Visibility) và chống tái sắp xếp lệnh (Instruction Reordering).
- **Tiếp theo**: [Bài 04: Lambdas, Functional Interfaces & Advanced Sorting](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/04-lambdas-and-functional-interfaces.md).

---

## 2. Bản Chất Hoạt Động & Kiến Trúc Bộ Nhớ

### 2.1. 6 Trạng Thái Vòng Đời Của Thread (`Thread.State`)

```
   [ NEW ] ──.start()──► [ RUNNABLE ] ◄─── Luân chuyển CPU (Running / Ready)
                              │
            ┌─────────────────┼─────────────────┐
            ▼                 ▼                 ▼
       [ BLOCKED ]       [ WAITING ]     [ TIMED_WAITING ]
    (Chờ Monitor Lock)  (.wait() / .join())  (.sleep() / .join(t))
            │                 │                 │
            └─────────────────┼─────────────────┘
                              ▼
                        [ TERMINATED ] (Kết thúc run())
```

1. **`NEW`**: Luồng vừa được tạo bằng `new Thread()`, chưa gọi `start()`.
2. **`RUNNABLE`**: Sẵn sàng chạy hoặc đang chạy trên CPU.
3. **`BLOCKED`**: Bị chặn lại khi cố gắng bước vào khối lệnh `synchronized` đã bị luồng khác chiếm giữ khóa.
4. **`WAITING`**: Chờ vô hạn định đến khi có luồng khác đánh thức (`Object.wait()`, `Thread.join()`).
5. **`TIMED_WAITING`**: Chờ trong một khoảng thời gian cố định (`Thread.sleep(ms)`, `join(ms)`).
6. **`TERMINATED`**: Đã hoàn thành xong phương thức `run()` hoặc ném ra ngoại lệ không được bắt.

### 2.2. Từ Khóa `volatile` vs `synchronized`

| Tiêu Chí | `volatile` | `synchronized` |
| :--- | :--- | :--- |
| **Bản chất cơ chế** | Cơ chế nhẹ (Lightweight), không dùng khóa (Lock-free) | Dùng khóa độc quyền (Pessimistic Lock / Monitor Lock) |
| **Đảm bảo tính hiển thị (Visibility)**| ✅ Có (Ghi/Đọc trực tiếp vào RAM chính) | ✅ Có |
| **Đảm bảo tính nguyên tử (Atomicity)** | ❌ **Không** (Các phép tính phức tạp như `count++` vẫn bị Race condition) | ✅ Có (Chỉ 1 luồng được chạy tại một thời điểm) |
| **Áp dụng cho** | Chỉ áp dụng cho các thuộc tính/trường dữ liệu | Áp dụng cho phương thức hoặc khối lệnh `{ ... }` |

---

## 3. Bẫy Kinh Điển (Common Gotchas)

### Bẫy 1: Gọi `run()` Thay Vì `start()`
```java
Thread t = new Thread(() -> System.out.println("Run in: " + Thread.currentThread().getName()));
t.run();   // ❌ SAI: Chỉ là một lời gọi hàm thông thường trên luồng hiện tại (main thread)!
t.start(); // ✅ ĐÚNG: Yêu cầu OS tạo luồng độc lập mới và thực thi hàm run()
```

### Bẫy 2: Phép toán `count++` Với Biến `volatile`
Phép toán `count++` gồm 3 bước riêng biệt ở cấp độ CPU: (1) Đọc `count`, (2) Tăng thêm 1, (3) Ghi lại `count`. `volatile` không đảm bảo tính nguyên tử giữa 3 bước này.
- **Khắc phục**: Dùng `synchronized` hoặc các lớp nguyên tử hiệu năng cao: `AtomicInteger` (sử dụng thuật toán so sánh và tráo đổi Compare-And-Swap - CAS).

---

## 4. Code Thực Hành

Xem mã nguồn thực nghiệm tại: [AdvancedDemo.java](file:///d:/my-project/revision-document/java/05-advanced-and-concurrency/AdvancedDemo.java).

---

## 5. Câu Hỏi Phỏng Vấn Tự Kiểm Tra

1. **Deadlock (Khoá chết) là gì? 4 điều kiện sinh ra Deadlock?**
   *Trả lời*: Deadlock là tình trạng hai hoặc nhiều luồng cùng bị treo vĩnh viễn vì luồng này đang giữ tài nguyên mà luồng kia cần và ngược lại. 4 điều kiện Coffman:
   - Loại trừ tương hỗ (Mutual Exclusion): Tài nguyên không thể chia sẻ.
   - Giữ và chờ (Hold and Wait): Luồng đang giữ tài nguyên và chờ tài nguyên khác.
   - Không thể cưỡng đoạt (No Preemption): Tài nguyên không thể bị tước đoạt giữa chừng.
   - Chờ đợi vòng tròn (Circular Wait): Tồn tại chu kỳ phụ thuộc đóng kín $T_1 \rightarrow T_2 \rightarrow \dots \rightarrow T_1$.
2. **Sự khác biệt giữa `Thread.sleep()` và `Object.wait()` là gì?**
   *Trả lời*:
   - `sleep()` là hàm tĩnh của `Thread`, cho luồng nghỉ tạm thời nhưng **KHÔNG giải phóng Monitor Lock** (vẫn nắm giữ khóa).
   - `wait()` là hàm của `Object`, phải được gọi bên trong khối `synchronized`, và nó **TỰ ĐỘNG GIẢI PHÓNG Monitor Lock** cho luồng khác vào sử dụng trong lúc nó chờ.
