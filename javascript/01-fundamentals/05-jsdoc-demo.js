/**
 * 05-jsdoc-demo.js
 * Minh họa cách viết JSDoc chuyên nghiệp để có gợi ý kiểu dữ liệu (Intellisense) trong JavaScript thuần
 * Chạy bằng: node 05-jsdoc-demo.js
 */

const assert = require("assert");

// 1. Chú thích một dòng thông thường
const API_URL = "https://api.example.com"; // Địa chỉ máy chủ

/* 
 2. Chú thích nhiều dòng
 Dùng để giải thích logic phức tạp hoặc mô tả tổng quan khối mã
*/

/**
 * 3. Chuẩn JSDoc: Định nghĩa kiểu dữ liệu User phức tạp
 * @typedef {Object} User
 * @property {number} id - Mã định danh duy nhất của người dùng
 * @property {string} name - Tên đầy đủ
 * @property {string} email - Hòm thư điện tử
 * @property {boolean} [isActive=true] - Trạng thái hoạt động (tùy chọn)
 */

/**
 * Hàm tính toán tổng tiền thanh toán sau khi áp dụng thuế VAT
 * (Di chuột qua tên hàm trong IDE để thấy bảng hướng dẫn và kiểu dữ liệu)
 * 
 * @param {number} amount - Số tiền gốc trước thuế
 * @param {number} [vatRate=0.1] - Tỉ lệ thuế VAT (mặc định là 10% tức 0.1)
 * @returns {number} Tổng tiền sau thuế đã được làm tròn
 * @throws {TypeError} Ném lỗi nếu số tiền gốc không phải là số hợp lệ
 */
function calculateTotalWithVAT(amount, vatRate = 0.1) {
  if (typeof amount !== "number" || isNaN(amount)) {
    throw new TypeError("Số tiền gốc phải là một số hợp lệ!");
  }
  return Math.round(amount * (1 + vatRate));
}

/**
 * Hàm cũ không còn được khuyến nghị sử dụng
 * @deprecated Dùng calculateTotalWithVAT thay thế để hỗ trợ VAT động
 */
function oldCalculate(amount) {
  return amount * 1.1;
}

// Kiểm thử các hàm đã có JSDoc
const total = calculateTotalWithVAT(100, 0.08); // Thuế 8%
assert.strictEqual(total, 108);
console.log("Tổng tiền sau thuế 8%:", total);

assert.throws(
  () => calculateTotalWithVAT("100"),
  /^TypeError: Số tiền gốc phải là một số hợp lệ!$/,
  "Bắt lỗi type check thành công"
);

console.log("✅ Đã kiểm chứng hàm có gắn JSDoc thành công!");
