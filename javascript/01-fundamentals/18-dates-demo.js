/**
 * JavaScript Date & Time Operations Demo
 * Thực nghiệm Unix Epoch ms, cạm bẫy tháng 0-indexed, Date mutability, và Intl.DateTimeFormat.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: UNIX EPOCH & CONVERT TIMESTAMP ===");
const fixedTimestamp = 1789655400000; // Một mốc thời gian cố định
const dateFromMs = new Date(fixedTimestamp);

console.log("date.getTime() :", dateFromMs.getTime());
console.log("+date          :", +dateFromMs);
console.log("Date.now()     :", typeof Date.now(), "ms");

assert.strictEqual(dateFromMs.getTime(), fixedTimestamp);
assert.strictEqual(+dateFromMs, fixedTimestamp);
console.log("-> Kiểm chứng Epoch ms: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY THÁNG ĐÁNH SỐ TỪ 0 (0-INDEXED MONTHS) ===");
// Tháng 9 là số 8! (0 = Tháng 1 ... 8 = Tháng 9)
const sepDate = new Date(Date.UTC(2026, 8, 17, 14, 30, 0));

console.log("Năm  (UTC):", sepDate.getUTCFullYear());
console.log("Tháng (UTC):", sepDate.getUTCMonth(), "(Tháng 9 là số 8)");
console.log("Ngày  (UTC):", sepDate.getUTCDate());

assert.strictEqual(sepDate.getUTCFullYear(), 2026);
assert.strictEqual(sepDate.getUTCMonth(), 8); // Tháng 9!
assert.strictEqual(sepDate.getUTCDate(), 17);
console.log("-> Kiểm chứng 0-Indexed Month: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: CẠM BẪY ĐỘT BIẾN (DATE MUTABILITY) & CLONE AN TOÀN ===");
const originalDate = new Date(Date.UTC(2026, 0, 1)); // 01/01/2026

// Gán tham chiếu nguy hiểm:
const mutatedRef = originalDate;
mutatedRef.setUTCMonth(1); // Đổi sang tháng 2

console.log("Sau khi gọi setUTCMonth(1) trên mutatedRef:");
console.log("originalDate month:", originalDate.getUTCMonth(), "(BỊ ĐỔI THEO!)");
assert.strictEqual(originalDate.getUTCMonth(), 1, "Cả hai cùng trỏ tới 1 ô nhớ Date!");

// Cách clone an toàn:
const safeClone = new Date(originalDate.getTime());
safeClone.setUTCMonth(5); // Đổi clone sang tháng 6

assert.strictEqual(originalDate.getUTCMonth(), 1, "originalDate được bảo toàn!");
assert.strictEqual(safeClone.getUTCMonth(), 5);
console.log("-> Kiểm chứng Date Mutability & Safe Clone: Hoàn toàn chính xác!\n");

console.log("=== DEMO 4: ĐỊNH DẠNG QUỐC TẾ HÓA HIỆN ĐẠI (INTL.DATETIMEFORMAT) ===");
const eventDate = new Date(Date.UTC(2026, 8, 17, 7, 30, 0)); // 14:30 giờ VN (+7)

const vnFormatter = new Intl.DateTimeFormat("vi-VN", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "Asia/Ho_Chi_Minh"
});

const formattedVN = vnFormatter.format(eventDate);
console.log("Định dạng vi-VN (Asia/Ho_Chi_Minh):", formattedVN);
assert.strictEqual(formattedVN, "17/09/2026");

const usFormatter = new Intl.DateTimeFormat("en-US", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: "America/New_York"
});

const formattedUS = usFormatter.format(eventDate);
console.log("Định dạng en-US (America/New_York) :", formattedUS);
assert.strictEqual(formattedUS, "09/17/2026");
console.log("-> Kiểm chứng Intl.DateTimeFormat: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Date & Time đã vượt qua thành công! ");
console.log("==========================================");
