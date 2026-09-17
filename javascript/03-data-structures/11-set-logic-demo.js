/**
 * JavaScript Set Logic & Mathematical Operations Demo (ES2024)
 * Thực nghiệm 7 phép toán tập hợp chuẩn ES2024, tính bất biến (immutability),
 * tính chất giao hoán, bẫy đối số Array vs Set-like, và ứng dụng RBAC.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: BỘ 7 PHÉP TOÁN ĐẠI SỐ TẬP HỢP ES2024 ===");
const setA = new Set([1, 2, 3]);
const setB = new Set([3, 4, 5]);

// 1. Phép Hợp (Union: A ∪ B)
const union = setA.union(setB);
assert.deepStrictEqual([...union], [1, 2, 3, 4, 5]);

// 2. Phép Giao (Intersection: A ∩ B)
const intersection = setA.intersection(setB);
assert.deepStrictEqual([...intersection], [3]);

// 3. Phép Hiệu (Difference: A \ B)
const diff = setA.difference(setB);
assert.deepStrictEqual([...diff], [1, 2]);

// 4. Phép Hiệu Đối Xứng (Symmetric Difference: A △ B)
const symDiff = setA.symmetricDifference(setB);
assert.deepStrictEqual([...symDiff], [1, 2, 4, 5]);

// 5. Tập con & Tập mẹ (Subset & Superset)
const sub = new Set([1, 2]);
assert.strictEqual(sub.isSubsetOf(setA), true);
assert.strictEqual(setA.isSupersetOf(sub), true);
assert.strictEqual(setA.isSubsetOf(sub), false);

// 6. Tập rời nhau (Disjoint)
const disjointSet = new Set([9, 10]);
assert.strictEqual(setA.isDisjointFrom(disjointSet), true);
assert.strictEqual(setA.isDisjointFrom(setB), false); // Có chung 3

console.log("-> 7 phép toán tập hợp ES2024: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: TÍNH BẤT BIẾN CỦA TẬP HỢP GỐC (IMMUTABILITY) ===");
// Xác nhận setA và setB KHÔNG HỀ BỊ THAY ĐỔI sau các phép toán:
assert.deepStrictEqual([...setA], [1, 2, 3]);
assert.deepStrictEqual([...setB], [3, 4, 5]);
console.log("setA gốc được bảo toàn:", [...setA]);
console.log("setB gốc được bảo toàn:", [...setB]);
console.log("-> Kiểm chứng Immutability: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: TÍNH CHẤT GIAO HOÁN (COMMUTATIVE) VS BẤT ĐỐI XỨNG ===");
// 1. Phép Giao (Intersection) - Chỉ chứa phần tử chung:
assert.deepStrictEqual([...setA.intersection(setB)], [...setB.intersection(setA)]);

// 2. Phép Hợp và Hiệu đối xứng tương đương toán học, nhưng thứ tự chèn (Insertion Order)
// sẽ phản ánh thứ tự của tập hợp đứng trước:
const unionAB = setA.union(setB); // [1, 2, 3, 4, 5]
const unionBA = setB.union(setA); // [3, 4, 5, 1, 2]

// Khác nhau về thứ tự duyệt mảng do Insertion Order của Set:
assert.notDeepStrictEqual([...unionAB], [...unionBA]);

// Nhưng tương đương tuyệt đối về mặt toán học (Hiệu đối xứng bằng rỗng & tập con lẫn nhau):
assert.strictEqual(unionAB.symmetricDifference(unionBA).size, 0);
assert.strictEqual(unionAB.isSubsetOf(unionBA), true);
assert.strictEqual(unionBA.isSubsetOf(unionAB), true);

// 3. Phép Hiệu (Difference) BẤT ĐỐI XỨNG cả về mặt toán học lẫn thứ tự:
const diffAB = setA.difference(setB); // { 1, 2 }
const diffBA = setB.difference(setA); // { 4, 5 }
assert.notDeepStrictEqual([...diffAB], [...diffBA]);
assert.strictEqual(diffAB.symmetricDifference(diffBA).size, 4);
console.log("A \\ B:", [...diffAB]);
console.log("B \\ A:", [...diffBA]);
console.log("-> Kiểm chứng tính chất đại số tập hợp & thứ tự chèn: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: CHÂN LÝ RỖNG VỚI TẬP HỢP RỖNG (EMPTY SET) ===");
const emptySet = new Set();

// Tập rỗng luôn là con của mọi tập hợp:
assert.strictEqual(emptySet.isSubsetOf(setA), true);
assert.strictEqual(emptySet.isSubsetOf(emptySet), true);

// Tập rỗng luôn rời nhau với mọi tập hợp:
assert.strictEqual(emptySet.isDisjointFrom(setA), true);
console.log("-> Kiểm chứng chân lý tập rỗng: Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: BẪY TRUYỀN ARRAY THAY VÌ SET-LIKE OBJECT ===");
// Truyền Array thuần túy ném TypeError vì không thỏa mãn Set-like interface:
assert.throws(() => {
  // @ts-ignore
  setA.union([4, 5, 6]);
}, TypeError);
console.log("Truyền Array thông thường vào set.union() ném TypeError đúng chuẩn.");
console.log("-> Kiểm chứng Set-like Object Constraint: Hoàn toàn chính xác!\n");

console.log("=== DEMO 6: ỨNG DỤNG THỰC TẾ: PHÂN QUYỀN RBAC (ROLE-BASED ACCESS CONTROL) ===");
// Quyền hạn của user hiện tại:
const userPermissions = new Set(["READ", "WRITE"]);

// Danh sách quyền tối thiểu để chỉnh sửa tài liệu:
const requiredEditPermissions = new Set(["READ", "WRITE"]);

// Danh sách quyền để xóa tài liệu:
const requiredDeletePermissions = new Set(["READ", "WRITE", "DELETE"]);

function canPerformAction(userPerms, requiredPerms) {
  // Kiểm tra user có sở hữu tập mẹ chứa toàn bộ quyền đòi hỏi hay không:
  return userPerms.isSupersetOf(requiredPerms);
}

assert.strictEqual(canPerformAction(userPermissions, requiredEditPermissions), true);
assert.strictEqual(canPerformAction(userPermissions, requiredDeletePermissions), false);

// Tìm các quyền còn thiếu:
const missingPerms = requiredDeletePermissions.difference(userPermissions);
assert.deepStrictEqual([...missingPerms], ["DELETE"]);
console.log("Quyền còn thiếu để thực hiện hành động DELETE:", [...missingPerms]);
console.log("-> Kiểm chứng ứng dụng RBAC: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Set Logic đã vượt qua thành công! ");
console.log("==========================================");
