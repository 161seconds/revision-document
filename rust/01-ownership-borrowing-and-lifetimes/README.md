# Module 01: Ownership, Borrowing & Lifetimes

Chào mừng bạn đến với **Module 01: Ownership, Borrowing & Lifetimes**. Đây là module nền tảng quan trọng nhất của ngôn ngữ Rust. Việc làm chủ quyền sở hữu (Ownership), cơ chế mượn (Borrowing) và vòng đời (Lifetimes) sẽ giúp bạn vượt qua "cuộc chiến với Borrow Checker" và mở khóa khả năng viết code an toàn bộ nhớ tuyệt đối mà không cần Garbage Collector.

---

## 📚 Danh Mục Bài Học

1. **[01-ownership-and-raii.md](file:///d:/my-project/revision-document/rust/01-ownership-borrowing-and-lifetimes/01-ownership-and-raii.md)**:
   - Bộ nhớ Stack vs Heap trong Rust.
   - Ba nguyên tắc sở hữu vàng (The Three Golden Rules of Ownership).
   - Mô hình giải phóng tài nguyên RAII (Resource Acquisition Is Initialization) qua trait `Drop`.
   - Chấm dứt hoàn toàn các lỗi bộ nhớ kinh điển: Memory Leaks, Double Free, Use-After-Free.

2. **[02-move-semantics-vs-copy-trait.md](file:///d:/my-project/revision-document/rust/01-ownership-borrowing-and-lifetimes/02-move-semantics-vs-copy-trait.md)**:
   - Bản chất của Move Semantics: Chuyển quyền sở hữu và vô hiệu hóa biến cũ ở thời điểm biên dịch.
   - Trait `Copy`: Kiểu dữ liệu nằm hoàn toàn trên Stack (`i32`, `f64`, `bool`, `[T; N]`).
   - Trait `Clone`: Nhân bản sâu dữ liệu trên Heap một cách tường minh (`s.clone()`).

3. **[03-borrowing-and-aliasing-xor-mutability.md](file:///d:/my-project/revision-document/rust/01-ownership-borrowing-and-lifetimes/03-borrowing-and-aliasing-xor-mutability.md)**:
   - Tham chiếu bất biến (`&T`) vs Tham chiếu khả biến (`&mut T`).
   - Định lý bất biến tối thượng: **Aliasing XOR Mutability** (Nhiều người đọc HOẶC chỉ 1 người viết).
   - Tại sao nguyên tắc này triệt tiêu hoàn toàn $100\%$ lỗi Data Race trong lập trình đa luồng?
   - Non-Lexical Lifetimes (NLL): Phạm vi mượn kết thúc tại lần sử dụng cuối cùng.

4. **[04-lifetimes-and-borrow-checker.md](file:///d:/my-project/revision-document/rust/01-ownership-borrowing-and-lifetimes/04-lifetimes-and-borrow-checker.md)**:
   - Bản chất của Lifetimes: Ngăn chặn con trỏ lơ lửng (Dangling References).
   - Cú pháp chú thích vòng đời (`'a`, `'b`, `'static`).
   - Ba quy tắc suy luận vòng đời tự động của Compiler (Lifetime Elision Rules).
   - Cơ chế phân tích luồng dữ liệu của Borrow Checker.

---

## 🛠️ Thực Hành & Đánh Giá

- **Ví dụ mã nguồn Rust chuẩn**: [ownership_demo.rs](file:///d:/my-project/revision-document/rust/01-ownership-borrowing-and-lifetimes/ownership_demo.rs)
- **Bộ kiểm thử tự động**: [practice.mjs](file:///d:/my-project/revision-document/rust/01-ownership-borrowing-and-lifetimes/practice.mjs)

Chạy lệnh kiểm thử:
```bash
rtk node rust/01-ownership-borrowing-and-lifetimes/practice.mjs
```
