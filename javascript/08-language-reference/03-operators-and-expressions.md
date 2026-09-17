# Toàn Cảnh Toán Tử & Biểu Thức (Operators & Expressions)

## 1. Bản Đồ Liên Kết (Knowledge Links)
- **Kiến thức tiên quyết**:
  - [01-fundamentals/03-operators-and-expressions.md](file:///d:/my-project/revision-document/javascript/01-fundamentals/03-operators-and-expressions.md) (Toán tử số học cơ bản & Ép kiểu ngầm định).
  - [02-reserved-words-and-identifiers.md](file:///d:/my-project/revision-document/javascript/08-language-reference/02-reserved-words-and-identifiers.md) (Toán tử dưới dạng từ khóa: `typeof`, `delete`, `void`, `in`, `instanceof`).
- **Khái niệm tương quan**:
  - **IEEE 754 64-bit Floating Point vs 32-bit Integer**: Tất cả các toán tử Bitwise đều ép toán hạng về dạng số nguyên 32-bit (`ToInt32`), gây cắt cụt các số vượt quá $2^{31}-1$.
  - **Short-circuit Evaluation (Đánh giá ngắn mạch)**: Trình biên dịch V8 dừng tính toán ngay khi nhánh điều kiện đầu tiên xác định được chân trị.
- **Điểm đến tiếp theo**:
  - [04-operator-precedence-and-associativity.md](file:///d:/my-project/revision-document/javascript/08-language-reference/04-operator-precedence-and-associativity.md) (Thứ Tự Ưu Tiên & Chiều Kết Hợp Của Toán Tử).

---

## 2. Bản Chất Hoạt Động (Mental Model / Under the Hood)

### 2.1. Phân Loại Toàn Diện Toán Tử Trong JavaScript

| Nhóm toán tử | Ký hiệu | Bản chất hoạt động nội tại của V8 |
| :--- | :--- | :--- |
| **Số học (Arithmetic)** | `+`, `-`, `*`, `/`, `%`, `**` | Ép kiểu về số nguyên thủy `ToNumeric()`. `+` ưu tiên nối chuỗi nếu có 1 vế là String. |
| **Dịch bit (Bitwise)** | `&`, `\|`, `^`, `~`, `<<`, `>>`, `>>>` | Ép số về 32-bit có dấu (`ToInt32`). Riêng `>>>` ép về 32-bit không dấu (`ToUint32`). |
| **So sánh (Comparison)** | `===`, `!==`, `==`, `!=`, `<`, `>`, `<=`, `>=` | So sánh trừu tượng (`Abstract Relational Comparison`). `===` không ép kiểu. |
| **Logic (Logical)** | `&&`, `\|\|`, `!`, `??` | Ngắn mạch (Short-circuit). Trả về chính xác đối tượng toán hạng chứ không ép về boolean. |
| **Gán logic (Logical Assignment)** | `&&=`, `\|=`, `??=` | Chỉ thực hiện gán khi điều kiện ngắn mạch thỏa mãn (`a ??= b` $\iff$ `a ?? (a = b)`). |
| **Quan hệ (Relational)** | `in`, `instanceof` | `in` duyệt toàn bộ chuỗi Prototype Chain. `instanceof` kiểm tra `Constructor.prototype`. |
| **Đơn vị & Khác (Unary / Other)** | `typeof`, `void`, `delete`, `,` | `void 0` luôn sinh ra `undefined`. Dấu phẩy `,` đánh giá từ trái qua phải và lấy vế cuối. |

### 2.2. So Sánh Bản Chất: `||` vs `??` (Falsy vs Nullish)

```
                       GIÁ TRỊ CẦN FALLBACK
                                 |
         +-----------------------+-----------------------+
         |                                               |
         v                                               v
     [FALSY VALUES]                              [NULLISH VALUES]
   false, 0, -0, 0n,                            null, undefined
   "", null, undefined, NaN                              |
         |                                               |
         v                                               v
Dùng toán tử: ||                              Dùng toán tử: ??
(Coi tất cả các giá trị trên                  (CHỈ fallback khi là null/undefined.
 là không hợp lệ và fallback)                  Giữ nguyên 0, false, "" hợp lệ!)
```

### 2.3. Cơ Chế Ép Kiểu Của Toán Tử Bitwise (32-bit Truncation)
Trong V8 Engine, toán tử `~` (Bitwise NOT) đảo ngược toàn bộ bit của số nguyên 32-bit:
$$\sim x = -(x + 1)$$
- Vì vậy: $\sim(-1) = -(-1 + 1) = 0$ (falsy trong JS).
- Kỹ thuật `~str.indexOf(sub)` đã từng là chuẩn mực tối ưu hiệu năng để kiểm tra chuỗi con trước khi có `str.includes(sub)`.
- Phép biến đổi hai lần `~~x` cắt bỏ hoàn toàn phần thập phân của số tương đương `Math.trunc(x)` với tốc độ cực nhanh trong các vòng lặp đồ họa Canvas/Game.

---

## 3. Bẫy & Lỗi Kinh Điển (Common Pitfalls)

### Bẫy 1: Dùng `||` Để Đặt Giá Trị Mặc Định Cho Biến Số (`0`) Hoặc Boolean (`false`)
```javascript
// ❌ SAI LẦM: Khi người dùng truyền 0 điểm hoặc timeout = 0
function setAnimationDuration(seconds) {
  const duration = seconds || 10; // Nếu seconds = 0, duration bị gán đè thành 10!
  return duration;
}
console.log(setAnimationDuration(0)); // 10 (BUG nghiêm trọng!)

// ✅ ĐÚNG: Dùng toán tử Nullish Coalescing ??
function setAnimationDuration(seconds) {
  const duration = seconds ?? 10; // Chỉ fallback nếu seconds là null hoặc undefined
  return duration;
}
console.log(setAnimationDuration(0)); // 0 (Chính xác tuyệt đối!)
```

### Bẫy 2: Toán Tử `in` Trả Về `true` Cho Các Phương Thức Prototype
```javascript
const user = { name: "Alice" };

// ❌ BẪY: "toString" không nằm trên user, nhưng nằm trong Object.prototype
console.log("toString" in user); // true! (Dễ gây bug kiểm tra quyền hoặc dữ liệu)

// ✅ ĐÚNG: Dùng Object.hasOwn() (ES2022) để chỉ kiểm tra thuộc tính riêng của object
console.log(Object.hasOwn(user, "toString")); // false
console.log(Object.hasOwn(user, "name"));     // true
```

### Bẫy 3: Phép Tính Trộn Giữa `BigInt` và `Number` Bị Ném Lỗi `TypeError`
```javascript
const totalBig = 100n;
const tax = 10;

// ❌ LỖI VĂNG EXCEPTION: Không tự động ép kiểu ngầm giữa BigInt và Number
const finalTotal = totalBig + tax; // TypeError: Cannot mix BigInt and other types

// ✅ ĐÚNG: Ép kiểu tường minh trước khi tính
const finalTotal = totalBig + BigInt(tax); // 110n
```

---

## 4. Code Thực Hành (Practical Examples)

Xem mã nguồn kiểm chứng toàn diện tại: [03-operators-demo.js](file:///d:/my-project/revision-document/javascript/08-language-reference/03-operators-demo.js)

### Mẫu Thiết Lập Cấu Hình Mặc Định Chuẩn Enterprise Với `??=` và `&&=`
```javascript
class ServerConfigManager {
  constructor(customConfig = {}) {
    this.config = { ...customConfig };
    this.initializeDefaults();
  }

  initializeDefaults() {
    // Chỉ gán giá trị mặc định nếu biến thực sự chưa được thiết lập (null hoặc undefined)
    this.config.port ??= 3000;            // Nếu customConfig.port = 0, port vẫn là 0!
    this.config.enableLogging ??= true;    // Nếu customConfig.enableLogging = false, vẫn giữ false!
    this.config.maxRetries ??= 5;

    // Che giấu dữ liệu nhạy cảm nếu apiKey tồn tại (Truthy)
    this.config.apiKey &&= this.maskSecret(this.config.apiKey);
  }

  maskSecret(key) {
    return key.slice(0, 4) + "****" + key.slice(-4);
  }
}

const srv = new ServerConfigManager({
  port: 0,                   // Cổng port ngẫu nhiên của hệ điều hành
  enableLogging: false,      // Tắt log
  apiKey: "PROD_SECRET_KEY_9999"
});

console.log(srv.config.port);          // 0 (Không bị đè thành 3000)
console.log(srv.config.enableLogging); // false (Không bị đè thành true)
console.log(srv.config.apiKey);        // PROD****9999 (Đã được mask)
```

---

## 5. Câu Hỏi Tự Kiểm Tra (Self-Test Quiz)

### Câu 1: Tại sao biểu thức `[] + {}` lại trả về chuỗi `"[object Object]"` trong khi `{} + []` lại có thể trả về số `0` trong Console trình duyệt?
<details>
<summary><b>Lời giải chi tiết</b></summary>

1. **Với `[] + {}`**: Cả hai toán hạng nằm trong biểu thức số học có toán tử `+`. Theo giải thuật `ToPrimitive`, `[]` chuyển thành chuỗi rỗng `""`, và `{}` chuyển thành `"[object Object]"`. Phép cộng chuỗi `"" + "[object Object]"` trả về `"[object Object]"`.
2. **Với `{} + []` (trong Console)**:
   - Khi đứng ở đầu dòng, trình phân tích cú pháp (Parser) của V8 coi `{}` là một **khối lệnh rỗng (Empty Block Statement)** chứ không phải một Object Literal.
   - Phần còn lại sau khối lệnh là `+[]`, tức toán tử cộng đơn vị (Unary Plus) áp dụng lên mảng rỗng `[]`.
   - Mảng rỗng chuyển đổi sang chuỗi là `""`, sau đó Unary Plus ép chuỗi rỗng sang kiểu Number: `+""` cho ra kết quả là **`0`**.
   - Nếu bọc trong ngoặc tròn `({} + [])`, nó bị ép thành biểu thức và trả về `"[object Object]"`.
</details>

### Câu 2: Toán tử dịch bit không dấu `>>> 0` thường được các thư viện JavaScript hiệu năng cao (Lodash, V8 Core) dùng để làm gì?
<details>
<summary><b>Lời giải chi tiết</b></summary>

- `>>> 0` thực hiện phép dịch bit phải không dấu (Unsigned Right Shift) 0 vị trí.
- **Tác dụng cốt tử**:
  1. Ép bất kỳ giá trị nào về một **số nguyên dương không dấu 32-bit (Uint32)** nằm trong khoảng từ `0` đến `4,294,967,295` ($2^{32}-1$).
  2. Biến các giá trị `NaN`, `null`, `undefined`, chuỗi rỗng thành số `0`.
  3. Biến số âm thành số nguyên dương lớn tương ứng theo biểu diễn bù 2 (ví dụ `-1 >>> 0 === 4294967295`).
  4. Chuẩn hóa độ dài mảng (`array.length >>> 0`) để đảm bảo chỉ mục luôn là số nguyên dương hợp lệ trước khi cấp phát bộ nhớ.
</details>
