# Giao Thức Lặp & Hàm Sinh (Iterators & Generators)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [02-functions-and-scope/01-declarations-vs-expressions.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/01-declarations-vs-expressions.md) (Hàm & Call Stack).
  - [02-functions-and-scope/04-closures-and-scope-chain.md](file:///d:/my-project/revision-document/javascript/02-functions-and-scope/04-closures-and-scope-chain.md) (Closures & Đóng băng trạng thái biến).
- **Khái niệm tương quan**:
  - **Coroutine & Pausable Execution**: Khác với hàm JavaScript thông thường (chạy từ đầu đến cuối không thể ngắt quãng - Run-to-Completion), Generator là một dạng **Coroutine**, cho phép tạm dừng (pause) tại `yield`, giải phóng Call Stack và khôi phục trạng thái bộ nhớ sau đó.
  - **Lazy Evaluation (Đánh giá lười biếng)**: Các phần tử chỉ được tính toán khi được gọi (`.next()`), giúp xử lý tập dữ liệu vô hạn (Infinite Streams) mà không sợ tràn RAM (Out of Memory).
- **Điểm đến tiếp theo**:
  - [14-regular-expressions.md](file:///d:/my-project/revision-document/javascript/03-data-structures/14-regular-expressions.md) (Biểu thức chính quy RegExp).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Cặp Đôi Giao Thức Lặp (The Iteration Protocols)

ECMAScript định nghĩa cơ chế lặp thông qua 2 giao thức trừu tượng:

```
[ITERABLE PROTOCOL]
Đối tượng phải có phương thức: [Symbol.iterator]()
                  |
                  v Trả về một Iterator
[ITERATOR PROTOCOL]
Đối tượng phải có phương thức: .next()
                  |
                  v Trả về Iterator Result
{ value: any, done: boolean }
```

- **Các cấu trúc Iterable có sẵn**: `Array`, `String`, `Map`, `Set`, `TypedArray`, `arguments`, DOM `NodeList`.
- **Đối tượng thường (`{}`) KHÔNG PHẢI là Iterable**: Vì không có phương thức `[Symbol.iterator]`. Nếu dùng `for (const x of {})` sẽ văng lỗi `TypeError: {} is not iterable`.

### 2.2. Vòng Đời Của Generator Function (`function*`)
Khi gọi một hàm generator:
```javascript
function* myGen() {
  console.log("Start");
  yield 1;
  console.log("Resume");
  yield 2;
}
const gen = myGen(); // CHƯA CHẠY BẤT KỲ DÒNG CODE NÀO TRONG THÂN HÀM!
```
1. **Khởi tạo**: V8 Engine cấp phát một Generator Context trên Heap để lưu giữ con trỏ chỉ mục bytecode hiện tại và biến cục bộ.
2. **`gen.next()` lần 1**: Hàm bắt đầu chạy đến lệnh `yield 1`. Trình duyệt đóng băng trạng thái (Suspended) và trả về `{ value: 1, done: false }`.
3. **`gen.next()` lần 2**: Hàm tiếp tục chạy từ vị trí đã dừng đến `yield 2`.
4. **Kết thúc**: Khi gặp lệnh `return` hoặc hết thân hàm, trạng thái chuyển sang Closed, trả về `{ value: undefined, done: true }`.

### 2.3. Giao Tiếp Hai Chiều (Two-Way Communication)
Toán tử `yield` trong JavaScript có tính chất đối xứng:
- **Chiều xuất**: Đẩy giá trị từ bên trong Generator ra bên ngoài cho Caller.
- **Chiều nhập**: Nhận tham số được truyền vào từ phương thức `gen.next(arg)` bên ngoài đưa ngược lại vào trong thân hàm.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Quên Rằng Generator Object Chỉ Duyệt Được Một Lần Duy Nhất
```javascript
function* getNums() {
  yield 1;
  yield 2;
}
const gen = getNums();

// Lần duyệt 1:
console.log([...gen]); // [1, 2]

// Lần duyệt 2:
console.log([...gen]); // [] (MẢNG RỖNG! Vì Generator đã ở trạng thái done: true)

// ✅ ĐÚNG: Muốn duyệt lại thì phải khởi tạo instance mới: getNums()
```

### Bẫy 2: Dùng `yield` Bên Trong Arrow Function Hoặc Callback Lồng Nhau
```javascript
function* badGenerator() {
  [1, 2, 3].forEach(item => {
    // ❌ SYNTAX ERROR: "yield" chỉ có giá trị trực tiếp bên trong hàm function*
    yield item; // SyntaxError: Unexpected identifier
  });
}

// ✅ ĐÚNG: Dùng vòng lặp for..of thông thường
function* goodGenerator() {
  for (const item of [1, 2, 3]) {
    yield item;
  }
}
```

### Bẫy 3: Quên Dọn Dẹp Tài Nguyên Trong Generator Vô Hạn
- Khi một Generator mở file, kết nối socket hoặc giữ bộ đệm vô hạn: Nếu bên ngoài `break` khỏi vòng lặp `for..of`, generator sẽ bị ngắt giữa chừng.
- **Bắt buộc**: Luôn bọc logic nhạy cảm trong khối `try { ... } finally { ... }`. Khi generator bị ngắt sớm bằng `break` hoặc `gen.return()`, khối `finally` được đảm bảo 100% sẽ luôn kích hoạt.

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [13-iterators-demo.js](file:///d:/my-project/revision-document/javascript/03-data-structures/13-iterators-demo.js)

### Mẫu Tạo Bộ Đệm Đọc Dữ Liệu Phân Trang (Paging Stream) Bằng Generator
```javascript
// Generator giả lập đọc dữ liệu từ máy chủ theo từng trang (Chunks)
function* paginateDatabase(totalRecords, pageSize = 2) {
  let offset = 0;
  while (offset < totalRecords) {
    const pageItems = [];
    for (let i = 0; i < pageSize && offset < totalRecords; i++) {
      pageItems.push(`Bản ghi ID: #${++offset}`);
    }
    yield pageItems; // Trả về từng trang nhỏ, giải phóng RAM sau mỗi lần xử lý
  }
}

const dbStream = paginateDatabase(5, 2);

console.log(dbStream.next().value); // ['Bản ghi ID: #1', 'Bản ghi ID: #2']
console.log(dbStream.next().value); // ['Bản ghi ID: #3', 'Bản ghi ID: #4']
console.log(dbStream.next().value); // ['Bản ghi ID: #5']
console.log(dbStream.next().done);  // true
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Làm thế nào để biến một Plain Object thông thường `{ a: 1, b: 2 }` có thể lặp được bằng vòng lặp `for..of`?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- Thêm phương thức có khóa là Symbol chuẩn `[Symbol.iterator]` vào object đó (hoặc vào prototype của nó). Phương thức này có thể là một hàm thông thường trả về object có `.next()`, hoặc đơn giản nhất là một Generator Function:
```javascript
const user = {
  name: "Alice",
  age: 25,
  *[Symbol.iterator]() {
    for (const key of Object.keys(this)) {
      yield [key, this[key]];
    }
  }
};

for (const [k, v] of user) {
  console.log(`${k}: ${v}`); // name: Alice, age: 25
}
```
</details>

### Câu 2: Từ khóa `yield*` (Generator Delegation) khác biệt như thế nào so với `yield` thông thường?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `yield item`: Chỉ phát ra duy nhất giá trị của biến `item`. Nếu `item` là một mảng hoặc một generator khác, nó trả về nguyên vẹn mảng/generator đó.
- `yield* iterable`: Thực hiện **Ủy thác duyệt lặp (Delegation)**. Nó tự động gọi `[Symbol.iterator]()` trên đối tượng `iterable` được cung cấp và ủy quyền toàn bộ việc phát ra từng phần tử con bên trong đối tượng đó cho generator hiện tại cho đến khi iterable con hoàn tất.
</details>
