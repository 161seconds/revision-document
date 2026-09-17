# Chuyên Sâu Về Const & Tính Bất Biến (JavaScript Const & Immutability Patterns)

Tài liệu ôn tập chuyên sâu về từ khóa `const`, bản chất "Tham Chiếu Bất Biến" (Constant Reference) thay vì "Giá Trị Bất Biến", và kỹ thuật đóng băng đối tượng (`Object.freeze`).

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):** [07-let-and-block-scope.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/07-let-and-block-scope.md) (Hiểu Block Scope và TDZ).
- **Mở rộng tiếp theo (Next Steps):** [02-data-types.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/02-data-types.js) và các toán tử tính toán (`js_operators.asp`).
- **Khái niệm liên quan (Related):**
  - Quản lý ô nhớ Call Stack vs Memory Heap.
  - Lập trình hàm (Functional Programming) và nguyên tắc Immutability trong React State.

---

## 2. Bản Chất Hoạt Động (Mental Model: Constant Reference)

### 1. Khác Biệt Giữa Kiểu Nguyên Thủy & Tham Chiếu Khi Dùng `const`
- **Với Primitive Types (Number, String, Boolean...):** Giá trị được lưu trực tiếp trong Call Stack. Khóa ô nhớ đồng nghĩa với việc **giá trị đó không thể thay đổi**.
- **Với Reference Types (Object, Array):** Ô nhớ trong Call Stack chỉ lưu trữ **địa chỉ con trỏ (Pointer)** trỏ tới vùng nhớ trên Heap. `const` chỉ bảo đảm **con trỏ đó không được trỏ sang ô nhớ khác**, nhưng dữ liệu thực tế trên Heap vẫn có thể bị thêm, sửa, xóa (Mutate) thoải mái.

### 2. Hai Quy Tắc Bắt Buộc Của `const`
1. **Phải khởi tạo giá trị ngay lập tức:**
   ```javascript
   const x = 10; // HỢP LỆ
   const y; // SyntaxError: Missing initializer in const declaration
   ```
2. **Không thể gán lại (Cannot be Reassigned):**
   ```javascript
   const PI = 3.14;
   PI = 3.14159; // TypeError: Assignment to constant variable.
   ```

### 3. Làm Thế Nào Để Đóng Băng Dữ Liệu Hoàn Toàn (True Immutability)?
- `const` **không làm cho Object bất biến**. Để ngăn sửa thuộc tính, JavaScript cung cấp `Object.freeze(obj)`:
  - `Object.freeze()` chỉ đóng băng tầng nông (Shallow Freeze). Nếu object có thuộc tính lồng nhau (nested object), tầng con vẫn bị sửa được.
  - Cần viết hàm `deepFreeze(obj)` đệ quy để đóng băng triệt để mọi cấp độ.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

1. **Ngộ nhận về tính bất biến của mảng `const`:**
   ```javascript
   const numbers = [1, 2, 3];
   numbers.push(4);    // HOÀN TOÀN HỢP LỆ (mảng trở thành [1, 2, 3, 4])
   numbers[0] = 99;    // HOÀN TOÀN HỢP LỆ (mảng trở thành [99, 2, 3, 4])
   // numbers = [10]; // LỖI: TypeError vì cố gán lại con trỏ mảng mới
   ```

2. **Lỗ hổng Shallow Freeze của `Object.freeze`:**
   ```javascript
   const config = Object.freeze({
     theme: "dark",
     db: { port: 5432 } // Object con nằm ở ô nhớ khác!
   });
   config.theme = "light";   // Bị chặn (không đổi)
   config.db.port = 3306;    // VẪN BỊ ĐỔI! (Do freeze chỉ tác dụng ở cấp 1)
   ```

---

## 4. File Code Thực Hành

- [08-const-immutability-demo.js](file:///d:/my-project/revision-document/javascript/01-fundamentals/08-const-immutability-demo.js): Minh họa sự khác biệt giữa Reassign vs Mutate, cạm bẫy shallow freeze và hàm `deepFreeze()` hoàn chỉnh. Chạy bằng: `node 08-const-immutability-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Đoạn code sau có ném lỗi không?**
   ```javascript
   const user = { name: "Alice" };
   user.name = "Bob";
   ```
   *Đáp án:* Không hề ném lỗi. Vì thuộc tính của object bị thay đổi chứ con trỏ `user` không bị gán sang một object mới.
2. **Làm sao để một Object trong JavaScript hoàn toàn không thể bị thêm/sửa/xóa thuộc tính ở bất kỳ cấp độ nào?**
   *Đáp án:* Áp dụng đệ quy `Object.freeze()` duyệt qua tất cả các thuộc tính lồng nhau (kỹ thuật Deep Freeze).
