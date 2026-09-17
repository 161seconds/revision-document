/**
 * 02-console-tools.js
 * Các kỹ thuật console chuyên nghiệp ngoài console.log thông thường
 * Chạy bằng: node 02-console-tools.js
 */

console.log("=== 1. CONSOLE.TABLE: HIỂN THỊ DẠNG BẢNG ===");
const users = [
  { id: 1, name: "Alice", role: "Frontend Developer", active: true },
  { id: 2, name: "Bob", role: "Backend Developer", active: false },
  { id: 3, name: "Charlie", role: "DevOps Engineer", active: true },
];
console.table(users);

console.log("\n=== 2. CONSOLE.TIME & CONSOLE.TIMEEND: ĐO HIỆU NĂNG ===");
console.time("Thời gian tính toán 1 triệu phép cộng");
let sum = 0;
for (let i = 0; i < 1_000_000; i++) {
  sum += i;
}
console.timeEnd("Thời gian tính toán 1 triệu phép cộng");

console.log("\n=== 3. CONSOLE.COUNT: ĐẾM SỐ LẦN HÀM ĐƯỢC GỌI ===");
function handleLoginAttempt(username) {
  console.count(`Đăng nhập bởi ${username}`);
}
handleLoginAttempt("user1");
handleLoginAttempt("user2");
handleLoginAttempt("user1");
handleLoginAttempt("user1");

console.log("\n=== 4. PHÂN BIỆT LOG, WARN VÀ ERROR ===");
console.log("Thông tin thông thường (Log)");
console.warn("Cảnh báo: Hàm này có thể bị deprecated trong tương lai! (Warn)");
console.error("Lỗi nghiêm trọng: Kết nối cơ sở dữ liệu thất bại! (Error)");
