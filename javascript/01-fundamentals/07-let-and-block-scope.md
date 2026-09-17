# Chuyên Sâu Về Let & Block Scope (JavaScript Let, TDZ & Loop Scope)

Tài liệu ôn tập chuyên sâu về từ khóa `let`, cơ chế Temporal Dead Zone (TDZ), Variable Shadowing, và bản chất giải quyết bài toán Closure kinh điển trong vòng lặp.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [06-variables-declaration-rules.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/06-variables-declaration-rules.md) (4 cách khai báo biến).
- **Mở rộng tiếp theo (Next Steps):** [08-const-and-immutability.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/) và [02-functions-and-scope/](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/) (Closures và Lexical Scope).
- **Khái niệm liên quan (Related):**
  - Môi trường từ vựng (Lexical Environment Records).
  - Vòng lặp sự kiện (Event Loop) và Timer (`setTimeout`).

---

## 2. Bản Chất Hoạt Động (Mental Model: Sự Khác Biệt Cốt Lõi)

### 1. Cơ Chế Block Scope Của `let`
Mỗi khi gặp một cặp ngoặc nhọn `{ ... }` (dù là `if`, `for`, `while` hay block độc lập), JavaScript Engine tạo ra một **Lexical Environment con**:
- Biến khai báo bằng `let` được đăng ký vào môi trường con này và bị hủy khi thực thi xong khối lệnh.
- `var` hoàn toàn phớt lờ block scope `{}` và nhảy thẳng lên Function Scope hoặc Global Scope gần nhất.

### 2. Temporal Dead Zone (TDZ - Vùng Chết Tạm Thời)
- `let` **vẫn được hoisted** (được trình biên dịch quét và cấp phát vị trí trong bảng biến từ giai đoạn Creation Phase).
- **Điểm khác biệt chí mạng với `var`:**
  - `var` được khởi tạo ngay giá trị `undefined`.
  - `let` **chưa được khởi tạo**. Vùng từ đầu block cho đến đúng dòng khai báo `let` được gọi là **TDZ**.
  - Nếu đọc/ghi biến trong TDZ ➔ Báo lỗi `ReferenceError: Cannot access variable before initialization`.

### 3. Bí Mật Vòng Lặp: Tại Sao `let` Khắc Phục Được Bẫy Closure?

Xét bài toán kinh điển:
```javascript
// DÙNG VAR: In ra 3, 3, 3
for (var i = 0; i < 3; i++) {
  setTimeout(() => console.log(i), 100);
}

// DÙNG LET: In ra 0, 1, 2
for (let j = 0; j < 3; j++) {
  setTimeout(() => console.log(j), 100);
}
```

**Bản chất cơ chế ngầm:**
- Với `var i`: Chỉ có **duy nhất một ô nhớ `i`** dùng chung cho toàn bộ vòng lặp. Khi hàm callback của `setTimeout` chạy sau 100ms, vòng lặp đã chạy xong và giá trị cuối cùng của ô nhớ là `3`.
- Với `let j`: Chuẩn ECMAScript 2015 quy định rằng ở mỗi lần lặp (iteration), JavaScript Engine sẽ **tự động tạo ra một bản ghi môi trường mới (new lexical scope binding)** và copy giá trị hiện tại của `j` vào đó. Callback closure của mỗi lần lặp giữ riêng bản sao `j` của chính vòng lặp đó.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Biến che khuất (Variable Shadowing):**
   ```javascript
   let count = 10;
   {
     let count = 20; // HỢP LỆ: Che khuất count ngoài, nhưng không ghi đè
     console.log(count); // 20
   }
   console.log(count); // 10 (Vẫn giữ nguyên giá trị bên ngoài)
   ```
2. **Cấm tái khai báo trong cùng một Scope:**
   ```javascript
   let x = 1;
   let x = 2; // SyntaxError: Identifier 'x' has already been declared
   ```

---

## 4. File Code Thực Hành

- [07-let-loop-closure-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-let-loop-closure-demo.js): Code thực nghiệm chứng minh bẫy closure `var` vs `let`, kiểm chứng TDZ và Variable Shadowing. Chạy bằng: `node 07-let-loop-closure-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **`let` có bị Hoisting trong JavaScript không?**
   *Đáp án:* **Có.** `let` được hoisted lên đầu block, nhưng không được khởi tạo giá trị (nằm trong TDZ), dẫn đến lỗi `ReferenceError` nếu truy cập trước dòng khai báo (khác với `var` được gán sẵn `undefined`).
2. **Tại sao `let` trong vòng lặp `for` lại giải quyết được vấn đề `setTimeout` in ra cùng một giá trị?**
   *Đáp án:* Vì ở mỗi vòng lặp, JS Engine tự động sinh ra một Lexical Scope Binding mới độc lập cho biến `let`, giúp closure của `setTimeout` giữ lại đúng giá trị của vòng lặp đó.
