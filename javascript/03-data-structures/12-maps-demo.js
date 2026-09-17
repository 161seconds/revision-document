/**
 * 12-maps-demo.js
 * Chạy độc lập: node 12-maps-demo.js
 * Kiểm chứng toàn diện Map & WeakMap trong JavaScript:
 * 1. Map vs Object: Khóa là đối tượng, hàm, NaN (SameValueZero)
 * 2. Thứ tự duyệt phần tử (Insertion Order) & Hiệu năng tra cứu O(1)
 * 3. Chuyển đổi Map <-> Object <-> JSON
 * 4. WeakMap: Khóa chỉ là Object, Garbage Collection (GC) tự động thu hồi
 * 5. Private Data Pattern & DOM Metadata Caching bằng WeakMap
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 12: MAPS & WEAKMAPS ===");

// -------------------------------------------------------------
// 1. MAP VS OBJECT: KHÓA BẤT KỲ VÀ THUẬT TOÁN SAMEVALUEZERO
// -------------------------------------------------------------
const map = new Map();

const keyObj = { id: 1 };
const keyFn = function () {};
const keySymbol = Symbol("sym");

map.set(keyObj, "Object Value");
map.set(keyFn, "Function Value");
map.set(keySymbol, "Symbol Value");
map.set(NaN, "NaN Value"); // Trong Map, NaN === NaN (SameValueZero)

assert.equal(map.get(keyObj), "Object Value");
assert.equal(map.get(keyFn), "Function Value");
assert.equal(map.get(keySymbol), "Symbol Value");
assert.equal(map.get(NaN), "NaN Value");
assert.equal(map.get(Number("invalid")), "NaN Value", "NaN truy xuất được bằng bất kỳ biểu thức NaN nào");

// Object thường sẽ ép tất cả key về string "[object Object]":
const plainObj = {};
plainObj[keyObj] = "Overwritten 1";
plainObj[{ id: 2 }] = "Overwritten 2";
assert.equal(plainObj["[object Object]"], "Overwritten 2", "Object bị đè key chuỗi");
assert.equal(map.size, 4, "Map giữ riêng từng tham chiếu object");

// -------------------------------------------------------------
// 2. THỨ TỰ DUYỆT BẢO TOÀN (INSERTION ORDER) & ITERATION
// -------------------------------------------------------------
const orderMap = new Map();
orderMap.set("z", 100);
orderMap.set("a", 200);
orderMap.set("m", 300);

const keys = Array.from(orderMap.keys());
assert.deepEqual(keys, ["z", "a", "m"], "Map bảo toàn 100% thứ tự chèn, không tự động sắp xếp");

// Destructuring entries trong vòng lặp for..of:
let sum = 0;
for (const [k, v] of orderMap) {
  sum += v;
}
assert.equal(sum, 600);

// -------------------------------------------------------------
// 3. CHUYỂN ĐỔI MAP <-> OBJECT / JSON
// -------------------------------------------------------------
const sampleMap = new Map([
  ["user", "alex"],
  ["role", "developer"],
]);

// Map sang Object
const convertedObj = Object.fromEntries(sampleMap);
assert.deepEqual(convertedObj, { user: "alex", role: "developer" });

// Object sang Map
const reconstructedMap = new Map(Object.entries(convertedObj));
assert.equal(reconstructedMap.get("role"), "developer");

// -------------------------------------------------------------
// 4. WEAKMAP: BẢN CHẤT THAM CHIẾU YẾU & PHÒNG CHỐNG MEMORY LEAK
// -------------------------------------------------------------
// - Key của WeakMap BẮT BUỘC phải là Object (hoặc non-registered Symbol trong ES2023)
// - Key là tham chiếu yếu (Weak Reference): Khi object bên ngoài bị hủy,
//   entry trong WeakMap tự động bị Garbage Collector thu hồi!
// - WeakMap KHÔNG có thuộc tính .size và KHÔNG THỂ duyệt (non-iterable).

const weakMap = new WeakMap();
let activeUser = { name: "David" };

weakMap.set(activeUser, { loginCount: 15 });
assert.equal(weakMap.get(activeUser).loginCount, 15);
assert.equal(weakMap.has(activeUser), true);

// Thử set primitive key -> Văng TypeError
assert.throws(
  () => weakMap.set("string_key", "val"),
  TypeError,
  "Invalid value used as weak map key"
);

// Khi activeUser = null -> Vùng nhớ loginCount sẽ tự động được thu gom rác mà không gây rò rỉ bộ nhớ.

// -------------------------------------------------------------
// 5. ENTERPRISE PATTERN: PRIVATE DATA BẰNG WEAKMAP
// -------------------------------------------------------------
// Trước khi có #privateFields của ES2022, WeakMap là chuẩn mực tạo biến Private tuyệt đối:
const privateStore = new WeakMap();

class BankAccount {
  constructor(owner, initialBalance) {
    this.owner = owner;
    // Lưu balance vào WeakMap gắn liền với instance (this)
    privateStore.set(this, { balance: initialBalance });
  }

  getBalance() {
    return privateStore.get(this).balance;
  }

  deposit(amount) {
    if (amount <= 0) throw new Error("Số tiền không hợp lệ");
    const data = privateStore.get(this);
    data.balance += amount;
  }
}

const account = new BankAccount("Alice", 1000);
assert.equal(account.getBalance(), 1000);
account.deposit(500);
assert.equal(account.getBalance(), 1500);

// Thuộc tính balance hoàn toàn vô hình từ bên ngoài instance:
assert.equal(account.balance, undefined);
assert.deepEqual(Object.keys(account), ["owner"], "Chỉ lộ thuộc tính owner public");

console.log("-> 100% tests cho Maps & WeakMaps đã pass thành công!");
