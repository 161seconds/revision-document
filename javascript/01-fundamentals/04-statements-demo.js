/**
 * 04-statements-demo.js
 * Minh họa bản chất câu lệnh, khối lệnh {} và kiểm tra tính cô lập biến
 * Chạy bằng: node 04-statements-demo.js
 */

const assert = require("assert");

console.log("=== 1. NHIỀU CÂU LỆNH TRÊN CÙNG MỘT DÒNG (DÙNG DẤU ;) ===");
let a = 5; let b = 10; let result = a * b;
assert.strictEqual(result, 50);
console.log("Kết quả a * b trên 1 dòng:", result);

console.log("\n=== 2. KHỐI LỆNH ĐỘC LẬP (STANDALONE CODE BLOCKS) ===");
// Một khối lệnh {} có thể đứng độc lập để tạo phạm vi cục bộ
{
  var leakedVar = "Tôi dùng var - tôi sẽ bị rò rỉ ra ngoài khối";
  let protectedLet = "Tôi dùng let - tôi được bảo vệ trong khối này";
  const protectedConst = "Tôi dùng const - tôi cũng nằm trong khối này";

  console.log("Bên trong block: đọc được protectedLet ->", protectedLet);
}

// Kiểm tra var rò rỉ ra ngoài
assert.strictEqual(leakedVar, "Tôi dùng var - tôi sẽ bị rò rỉ ra ngoài khối");
console.log("Ngoài block: leakedVar vẫn tồn tại -> OK!");

// Kiểm tra let bị chặn lại không cho rò rỉ
assert.throws(
  () => {
    console.log(protectedLet);
  },
  /^ReferenceError: protectedLet is not defined$/,
  "Lỗi: let không được phép rò rỉ ra ngoài khối {}"
);
console.log("Ngoài block: protectedLet bị chặn chính xác với ReferenceError!");

console.log("\n=== 3. QUY TẮC NGẮT DÒNG AN TOÀN SAU TOÁN TỬ ===");
// Ngắt dòng an toàn sau toán tử nối chuỗi '+'
const longText = "Dòng 1: Khởi tạo tiến trình. " +
  "Dòng 2: Tải các module phụ thuộc. " +
  "Dòng 3: Hoàn tất kiểm thử.";

console.log("Nội dung sau khi nối chuỗi ngắt dòng:\n" + longText);
console.log("\n✅ Đã kiểm chứng toàn bộ quy tắc câu lệnh và khối lệnh thành công!");
