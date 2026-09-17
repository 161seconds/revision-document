/**
 * JavaScript Array Sort, TimSort & Fisher-Yates Demo
 * Thực nghiệm bẫy Unicode sort, so sánh sort vs toSorted (ES2023), kiểm chứng tính ổn định TimSort,
 * sắp xếp tiếng Việt bằng localeCompare, và thuật toán xáo trộn Fisher-Yates.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: CẠM BẪY SẮP XẾP CHUỖI MẶC ĐỊNH (UNICODE SORT) ===");
const rawNumbers = [25, 100, 4, 8];

// Gọi sort() không truyền comparator -> Bị ép kiểu sang String:
const stringSorted = [...rawNumbers].sort();
console.log("rawNumbers.sort() không comparator:", stringSorted); // [100, 25, 4, 8]!
assert.deepStrictEqual(stringSorted, [100, 25, 4, 8], "Mặc định sắp xếp theo mã Unicode của chuỗi!");

// Sắp xếp số tăng dần đúng chuẩn với comparator:
const numericAsc = [...rawNumbers].sort((a, b) => a - b);
console.log("Sắp xếp số tăng dần (a - b)       :", numericAsc);   // [4, 8, 25, 100]
assert.deepStrictEqual(numericAsc, [4, 8, 25, 100]);

// Sắp xếp số giảm dần:
const numericDesc = [...rawNumbers].sort((a, b) => b - a);
console.log("Sắp xếp số giảm dần (b - a)       :", numericDesc);  // [100, 25, 8, 4]
assert.deepStrictEqual(numericDesc, [100, 25, 8, 4]);
console.log("-> Kiểm chứng Unicode Sort Trap: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: MUTATING SORT() VS IMMUTABLE TOSORTED() (ES2023) ===");
const scoreList = [50, 10, 80, 30];

// 1. sort() làm biến đổi mảng gốc ngay tại chỗ:
const scoreListMutate = [...scoreList];
scoreListMutate.sort((a, b) => a - b);
assert.deepStrictEqual(scoreListMutate, [10, 30, 50, 80]);

// 2. toSorted() (ES2023) trả về mảng mới, mảng gốc được bảo toàn:
const immutableSorted = scoreList.toSorted((a, b) => a - b);
console.log("scoreList (bảo toàn)       :", scoreList);       // [50, 10, 80, 30]
console.log("immutableSorted (mảng mới) :", immutableSorted); // [10, 30, 50, 80]
assert.deepStrictEqual(scoreList, [50, 10, 80, 30], "scoreList gốc không bị thay đổi!");
assert.deepStrictEqual(immutableSorted, [10, 30, 50, 80]);

// 3. toReversed() (ES2023) đảo mảng không biến đổi:
const immutableReversed = scoreList.toReversed();
assert.deepStrictEqual(scoreList, [50, 10, 80, 30]);
assert.deepStrictEqual(immutableReversed, [30, 80, 10, 50]);
console.log("-> Kiểm chứng sort vs toSorted (ES2023): Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: KIỂM CHỨNG TÍNH ỔN ĐỊNH CỦA TIMSORT (SORT STABILITY) ===");
// Danh sách học sinh đã có thứ tự ban đầu, nhiều bạn cùng điểm:
const students = [
  { name: "An",   score: 85, initialIndex: 0 },
  { name: "Bình", score: 90, initialIndex: 1 },
  { name: "Cúc",  score: 85, initialIndex: 2 }, // Cùng 85 điểm với An, nhưng đứng sau
  { name: "Dũng", score: 95, initialIndex: 3 }
];

// Sắp xếp theo điểm tăng dần:
const stableSorted = students.toSorted((a, b) => a.score - b.score);
console.log("Kết quả sắp xếp ổn định:");
console.log(stableSorted.map(s => `${s.name} (${s.score}đ - ban đầu: ${s.initialIndex})`).join(" -> "));

// Kiểm chứng: An (initialIndex 0) PHẢI đứng trước Cúc (initialIndex 2) vì cùng 85 điểm:
const student85_1 = stableSorted[0];
const student85_2 = stableSorted[1];
assert.strictEqual(student85_1.name, "An");
assert.strictEqual(student85_2.name, "Cúc");
console.log("-> Kiểm chứng TimSort Stability: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: SẮP XẾP CHUỖI TIẾNG VIỆT CÓ DẤU VỚI LOCALECOMPARE() ===");
const cities = ["Hà Nội", "Đà Nẵng", "Cần Thơ", "An Giang"];

// Sắp xếp thông thường bị sai (chữ Đ bị đẩy ra cuối do mã Unicode):
const flawedSort = [...cities].sort();
console.log("Sắp xếp thông thường (sai dấu tiếng Việt):", flawedSort);

// Sắp xếp chuẩn văn hóa tiếng Việt bằng localeCompare:
const correctVietnameseSort = [...cities].sort((a, b) => a.localeCompare(b, "vi"));
console.log("Sắp xếp chuẩn tiếng Việt (localeCompare) :", correctVietnameseSort);
assert.deepStrictEqual(correctVietnameseSort, ["An Giang", "Cần Thơ", "Đà Nẵng", "Hà Nội"]);
console.log("-> Kiểm chứng localeCompare('vi'): Hoàn toàn chính xác!\n");

console.log("=== DEMO 5: THUẬT TOÁN XÁO TRỘN MẢNG CHUẨN FISHER-YATES SHUFFLE ===");
function fisherYatesShuffle(arr) {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    // Chọn chỉ số ngẫu nhiên từ 0 đến i:
    const j = Math.floor(Math.random() * (i + 1));
    // Hoán đổi vị trí:
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

const deck = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const shuffled = fisherYatesShuffle(deck);
console.log("Mảng gốc       :", deck);
console.log("Mảng đã xáo trộn:", shuffled);

assert.strictEqual(shuffled.length, 10);
// Đảm bảo tất cả phần tử gốc đều còn nguyên vẹn sau khi xáo trộn:
assert.deepStrictEqual(shuffled.toSorted((a, b) => a - b), deck);
console.log("-> Kiểm chứng Fisher-Yates Shuffle: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra sắp xếp mảng đã vượt qua thành công! ");
console.log("==========================================");
