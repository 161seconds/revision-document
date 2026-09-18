# Lifetimes & The Borrow Checker

Mục tiêu tối thượng của cơ chế **Lifetimes (Vòng đời)** trong Rust là ngăn chặn **Con trỏ lơ lửng (Dangling References)** — hiện tượng một tham chiếu trỏ vào một vùng nhớ đã bị giải phóng (Use-After-Free).

---

## 1. Vấn Đề Con Trỏ Lơ Lửng

Xem xét đoạn mã sau:
```rust
fn main() {
    let r;
    {
        let x = 5;
        r = &x; // ❌ LỖI BIÊN DỊCH: `x` does not live long enough
    } // x đi ra khỏi scope và bị drop khỏi Stack tại đây!
    
    println!("r: {}", r); // r trỏ vào vùng nhớ rác!
}
```

Borrow Checker so sánh vòng đời của hai biến:
- `r` có vòng đời dài hơn (tồn tại trong toàn bộ `main`).
- `x` có vòng đời ngắn hơn (chỉ sống trong scope `{}`).
- Vì tham chiếu `r` sống lâu hơn chủ sở hữu `x`, Rust từ chối biên dịch ngay lập tức!

---

## 2. Cú Pháp Chú Thích Vòng Đời (Lifetime Annotation)

Khi một hàm nhận vào hai tham chiếu và trả về một tham chiếu, Compiler không thể tự đoán biết tham chiếu trả về trỏ vào tham số nào:

```rust
// 'a biểu diễn một vòng đời chung (Generic Lifetime)
fn longest<'a>(x: &'a str, y: &'a str) -> &'a str {
    if x.len() > y.len() {
        x
    } else {
        y
    }
}
```

### Ý Nghĩa Của `'a`:
- Ký tự nháy đơn `'` biểu thị một tham số lifetime.
- Chữ ký trên thông báo cho Compiler biết: **Tham chiếu trả về sẽ có vòng đời hợp lệ bằng với vòng đời ngắn nhất (giao thoa) giữa `x` và `y`**.
- Bất kỳ ai sử dụng hàm `longest` sẽ bị compiler ép buộc không được sử dụng kết quả trả về lâu hơn vòng đời của đối số ngắn nhất.

---

## 3. Ba Quy Tắc Suy Luận Vòng Đời Tự Động (Lifetime Elision Rules)

Để tránh bắt lập trình viên phải gõ `'a` ở khắp mọi nơi, Rust Compiler cài sẵn 3 quy tắc tự động suy luận:

1. **Quy tắc 1 (Input Lifetimes)**:
   - Mỗi tham số đầu vào là một tham chiếu sẽ được gán một lifetime riêng biệt:
   - `fn foo(x: &i32)` $\rightarrow$ suy luận thành `fn foo<'a>(x: &'a i32)`.
   - `fn bar(x: &i32, y: &i32)` $\rightarrow$ suy luận thành `fn bar<'a, 'b>(x: &'a i32, y: &'b i32)`.
2. **Quy tắc 2 (Single Input Lifetime)**:
   - Nếu hàm chỉ có **duy nhất 1 tham chiếu đầu vào**, lifetime của tham chiếu đó sẽ tự động được gán cho tất cả các tham chiếu đầu ra:
   - `fn first_word(s: &str) -> &str` $\rightarrow$ tự động hiểu là `fn first_word<'a>(s: &'a str) -> &'a str`.
3. **Quy tắc 3 (Method `&self`)**:
   - Nếu hàm là một phương thức có tham số `&self` hoặc `&mut self`, lifetime của `self` sẽ được gán cho toàn bộ các tham chiếu đầu ra.

### Vòng Đời Tĩnh `'static`
- `'static` là vòng đời đặc biệt tồn tại suốt toàn bộ thời gian chạy của chương trình (ví dụ: chuỗi ký tự hằng số string literals `let s: &'static str = "hello";` được lưu trữ trực tiếp trong phân vùng nhị phân Data Segment của tệp thực thi).
