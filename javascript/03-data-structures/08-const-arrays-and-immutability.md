# Mảng Hằng Số & Tính Bất Biến (JavaScript const Arrays & Immutability)

Tài liệu ôn tập toàn diện về mảng khai báo với `const`: Ràng buộc tham chiếu bất biến (Immutable Binding) vs Giá trị bất biến (Immutable Value), cơ chế Block Scope & Shadowing, giải pháp đóng băng mảng `Object.freeze()`, và thuật toán `deepFreeze` đệ quy.

---

## 1. Bản Đồ Liên Kết (Knowledge Links)

- **Tiên quyết (Prerequisites):**
  - [01-fundamentals/08-const-and-immutability.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/08-const-and-immutability.md) (Từ khóa `const` & Memory Heap).
  - [01-arrays-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/01-arrays-fundamentals.md) (Bản chất đối tượng mảng).
- **Mở rộng tiếp theo (Next Steps):**
  - [09-objects-fundamentals.md](file:///d:/my-project/revision-document/javascript/03-data-structures/) (Đối tượng & Thuộc tính).
  - Quản lý trạng thái bất biến trong React (`useImmer`, `Redux Toolkit`, `Zustand`).
- **Khái niệm liên quan (Related):**
  - Property Descriptor (`writable: false`, `configurable: false`).
  - Shallow Freeze vs Deep Freeze.

---

## 2. Bản Chất Hoạt Động (Mental Model: Ràng Buộc Ô Nhớ)

### 1. Bản Chất Của `const`: Immutable Binding (Không Phải Immutable Value)
Từ khóa `const` trong JavaScript **không biến giá trị mảng thành hằng số bất biến**:
- `const` chỉ đảm bảo biến đó **luôn luôn trỏ vào duy nhất một địa chỉ ô nhớ trong Memory Heap**.
- Con trỏ này không thể bị gán lại sang một ô nhớ khác.
- Tuy nhiên, **nội dung bên trong ô nhớ đó hoàn toàn có thể bị biến đổi (Mutable)**!

```javascript
const cars = ["Saab", "Volvo", "BMW"];

// 1. NHỮNG THAO TÁC HOÀN TOÀN HỢP LỆ:
cars[0] = "Toyota";    // Thay đổi phần tử
cars.push("Audi");     // Thêm phần tử mới
cars.pop();            // Xóa phần tử
cars.length = 0;       // Dọn sạch mảng

// 2. THAO TÁC BỊ CẤM TUYỆT ĐỐI (Ném TypeError):
cars = ["Toyota"];     // TypeError: Assignment to constant variable
```

### 2. Block Scope & Variable Shadowing Của `const`
- Mảng khai báo với `const` có phạm vi **Block Scope** (giới hạn trong cặp ngoặc `{}`).
- Không thể tái khai báo trong cùng một scope.
- Nhưng có thể **Shadowing (che bóng)** ở scope con lồng nhau mà không ảnh hưởng tới mảng ngoài:
  ```javascript
  const fruits = ["Apple"];
  {
    const fruits = ["Orange"]; // Scope con độc lập!
    console.log(fruits); // ["Orange"]
  }
  console.log(fruits);   // ["Apple"] (Vẫn giữ nguyên!)
  ```

### 3. Đóng Băng Mảng Thực Sự: `Object.freeze()` vs `deepFreeze()`
Muốn ngăn chặn tuyệt đối việc thêm, sửa, xóa phần tử trong mảng:
- **`Object.freeze(arr)` (Shallow Freeze - Đóng băng nông):**
  - Biến các phần tử cấp 1 thành `read-only` (`writable: false`, `configurable: false`).
  - Trong Strict Mode: `arr.push()` hoặc `arr[0] = "X"` sẽ ném ngay lỗi **`TypeError`**.
  - **Hạn chế:** Các object/array lồng nhau bên trong mảng **vẫn bị sửa được**!
- **`deepFreeze(arr)` (Đóng băng sâu đệ quy):**
  - Đệ quy đóng băng toàn bộ mảng và mọi object con lồng nhau bên trong.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### 1. Nhầm tưởng `const` bảo vệ mảng khỏi bị Mutate
- Rất nhiều lập trình viên nghĩ rằng truyền `const arr` vào một hàm thì hàm đó không thể thay đổi dữ liệu:
  ```javascript
  const users = ["Alice", "Bob"];
  function deleteFirst(list) {
    list.shift(); // VẪN XÓA ĐƯỢC! users gốc bị mất "Alice"!
  }
  deleteFirst(users);
  ```
- ➔ **Giải pháp:** Nếu muốn hàm pure không mutate, hãy dùng TypeScript `readonly string[]` hoặc tạo bản sao `[...list]` trước khi thao tác.

### 2. Cạm bẫy Shallow Freeze lọt lưới Object lồng nhau
```javascript
const configs = Object.freeze([
  { theme: "dark" }
]);

configs[0].theme = "light"; // BẪY! Object bên trong VẪN BỊ SỬA THÀNH 'light'!
```

---

## 4. File Code Thực Hành

- [08-const-arrays-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/08-const-arrays-demo.js): Code thực nghiệm gán lại `const` ném `TypeError`, mutation nội dung, Block Scope Shadowing, cạm bẫy Shallow Freeze, và giải pháp `deepFreeze` đệ quy an toàn. Chạy bằng: `node 08-const-arrays-demo.js`.

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

1. **Tại sao có thể gọi `arr.push(4)` trên một mảng `const arr = [1, 2, 3]` mà không bị lỗi?**
   *Đáp án:* Vì từ khóa `const` chỉ bảo vệ liên kết biến (Variable Binding) trỏ vào ô nhớ mảng không bị gán lại, chứ không bảo vệ tính bất biến của dữ liệu bên trong ô nhớ đó. Việc thêm phần tử chỉ thay đổi nội dung của đối tượng trên Heap mà không làm thay đổi địa chỉ tham chiếu của biến `arr`.
2. **Làm thế nào để tạo một mảng hoàn toàn không thể bị chỉnh sửa, kể cả các đối tượng lồng nhau bên trong?**
   *Đáp án:* Sử dụng hàm `deepFreeze(arr)` duyệt đệ quy qua toàn bộ các phần tử và gọi `Object.freeze()` trên mảng cũng như từng object/array con bên trong.
