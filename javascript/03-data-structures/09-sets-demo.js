/**
 * JavaScript Set & WeakSet Demo
 * Thực nghiệm cấu trúc dữ liệu Set, thuật toán SameValueZero, các phép toán tập hợp ES2024,
 * cạm bẫy tham chiếu, và cơ chế tham chiếu yếu của WeakSet.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: KHỞI TẠO, THAO TÁC CƠ BẢN VÀ THUỘC TÍNH SIZE ===");
const set = new Set(["Apple", "Banana"]);

// 1. Thêm phần tử (.add) - Trả về chính Set đó (cho phép method chaining):
set.add("Orange").add("Apple"); // Thêm lại Apple bị bỏ qua do trùng lặp

assert.strictEqual(set.size, 3);
assert.strictEqual(set.has("Banana"), true);
assert.strictEqual(set.has("Grape"), false);

// 2. Không truy cập được qua index:
// @ts-ignore
assert.strictEqual(set[0], undefined);
assert.strictEqual(set.length, undefined);

// 3. Xóa phần tử (.delete):
const deleted = set.delete("Banana");
assert.strictEqual(deleted, true);
assert.strictEqual(set.has("Banana"), false);
assert.strictEqual(set.size, 2);

console.log("Set sau khi thêm/xóa:", [...set]);
console.log("-> Thao tác cơ bản: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: THUẬT TOÁN SO KHỚP SAMEVALUEZERO ===");
const zeroSet = new Set();
zeroSet.add(NaN);
zeroSet.add(NaN); // Không thêm lần 2!

zeroSet.add(+0);
zeroSet.add(-0);  // +0 và -0 được coi là như nhau trong Set!

assert.strictEqual(zeroSet.size, 2); // Chỉ có NaN và 0
assert.strictEqual(zeroSet.has(NaN), true);
assert.strictEqual(zeroSet.has(0), true);
assert.strictEqual(zeroSet.has(-0), true);

console.log("-> Kiểm chứng SameValueZero (NaN và +/-0): Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: DUYỆT SET VÀ DUY TRÌ THỨ TỰ CHÈN (INSERTION ORDER) ===");
const ordered = new Set();
ordered.add("first").add("second").add("third");

const collected = [];
for (const item of ordered) {
  collected.push(item);
}
assert.deepStrictEqual(collected, ["first", "second", "third"]);

// keys() và values() trong Set là bí danh của nhau:
assert.deepStrictEqual([...ordered.keys()], [...ordered.values()]);

// entries() trả về các cặp [value, value]:
assert.deepStrictEqual([...ordered.entries()], [
  ["first", "first"],
  ["second", "second"],
  ["third", "third"]
]);

console.log("-> Kiểm chứng duyệt thứ tự chèn & Iterators: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CÁC PHÉP TOÁN TẬP HỢP CHUẨN ES2024 ===");
const setA = new Set([1, 2, 3]);
const setB = new Set([2, 3, 4]);

// 1. Phép hợp (Union: A ∪ B):
const union = setA.union(setB);
assert.deepStrictEqual([...union], [1, 2, 3, 4]);

// 2. Phép giao (Intersection: A ∩ B):
const intersection = setA.intersection(setB);
assert.deepStrictEqual([...intersection], [2, 3]);

// 3. Phép hiệu (Difference: A \ B):
const diff = setA.difference(setB);
assert.deepStrictEqual([...diff], [1]);

// 4. Phép hiệu đối xứng (Symmetric Difference: A △ B):
const symDiff = setA.symmetricDifference(setB);
assert.deepStrictEqual([...symDiff], [1, 4]);

// 5. Kiểm tra quan hệ tập hợp:
const subset = new Set([2, 3]);
assert.strictEqual(subset.isSubsetOf(setA), true);
assert.strictEqual(setA.isSupersetOf(subset), true);
assert.strictEqual(setA.isDisjointFrom(new Set([5, 6])), true);
assert.strictEqual(setA.isDisjointFrom(setB), false);

console.log("Union:", [...union]);
console.log("Intersection:", [...intersection]);
console.log("Difference:", [...diff]);
console.log("Symmetric Difference:", [...symDiff]);
console.log("-> Kiểm chứng ES2024 Set Methods: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: BẪY THAM CHIẾU ĐỐI TƯỢNG (REFERENCE TRAP) ===");
const objSet = new Set();
objSet.add({ id: 1 });

// Cạm bẫy: Literal object mới có địa chỉ Heap khác!
assert.strictEqual(objSet.has({ id: 1 }), false);

// Giải pháp: Giữ lại biến tham chiếu:
const userAlice = { id: 2, name: "Alice" };
objSet.add(userAlice);
assert.strictEqual(objSet.has(userAlice), true);

console.log("-> Kiểm chứng bẫy tham chiếu đối tượng: Hoàn toàn chính xác!\n");

console.log("=== DEMO 6: WEAKSET VÀ BRAND CHECKING ===");
const weakSet = new WeakSet();

// 1. Không thể thêm primitive vào WeakSet:
assert.throws(() => {
  // @ts-ignore
  weakSet.add("primitive_string");
}, TypeError);

// 2. Thêm object tham chiếu:
const session = { token: "abc-123" };
weakSet.add(session);
assert.strictEqual(weakSet.has(session), true);

weakSet.delete(session);
assert.strictEqual(weakSet.has(session), false);

// 3. Ứng dụng Brand Checking với WeakSet:
const validInstances = new WeakSet();

class SecurePlugin {
  constructor() {
    validInstances.add(this);
  }

  execute() {
    if (!validInstances.has(this)) {
      throw new TypeError("Hành vi gọi không an toàn: Instance chưa được cấp phép!");
    }
    return "SUCCESS";
  }
}

const plugin = new SecurePlugin();
assert.strictEqual(plugin.execute(), "SUCCESS");

// Giả mạo đối tượng không qua constructor:
const fakePlugin = Object.create(SecurePlugin.prototype);
assert.throws(() => {
  fakePlugin.execute();
}, TypeError);

console.log("-> Kiểm chứng WeakSet & Brand Checking: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Set & WeakSet đã vượt qua thành công! ");
console.log("==========================================");
