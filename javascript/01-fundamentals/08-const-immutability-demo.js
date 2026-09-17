/**
 * 08-const-immutability-demo.js
 * Minh họa bản chất tham chiếu của const, giới hạn của Object.freeze và giải pháp deepFreeze
 * Chạy bằng: node 08-const-immutability-demo.js
 */

"use strict"; // Chế độ nghiêm ngặt để việc cố tình sửa object bị freeze sẽ ném TypeError

const assert = require("assert");

console.log("=== 1. CONST VỚI PRIMITIVE VS REFERENCE ===");
const MAX_USERS = 50;
assert.throws(
  () => {
    // @ts-ignore
    MAX_USERS = 100;
  },
  /^TypeError: Assignment to constant variable.$/,
  "Không thể gán lại hằng số nguyên thủy"
);

const appConfig = { env: "development", ports: [3000, 8080] };
// 1. Thay đổi nội dung thuộc tính bên trong -> HOÀN TOÀN HỢP LỆ
appConfig.env = "production";
appConfig.ports.push(443);
assert.strictEqual(appConfig.env, "production");
assert.strictEqual(appConfig.ports.length, 3);
console.log("appConfig sau khi mutate nội dung:", appConfig);

console.log("\n=== 2. CẠM BẪY SHALLOW FREEZE CỦA OBJECT.FREEZE() ===");
const shallowFrozen = Object.freeze({
  theme: "dark",
  database: {
    host: "localhost",
    port: 5432
  }
});

// Cố tình sửa thuộc tính cấp 1 -> Bị Strict Mode ném TypeError!
assert.throws(
  () => {
    shallowFrozen.theme = "light";
  },
  /^TypeError: Cannot assign to read only property 'theme' of object/,
  "Thuộc tính cấp 1 đã bị khóa"
);

// NHƯNG thuộc tính lồng cấp 2 VẪN BỊ THAY ĐỔI:
shallowFrozen.database.port = 3306;
assert.strictEqual(shallowFrozen.database.port, 3306);
console.log("Lỗ hổng: shallowFrozen.database.port vẫn bị đổi thành:", shallowFrozen.database.port);

console.log("\n=== 3. GIẢI PHÁP BẤT BIẾN TUYỆT ĐỐI: DEEP FREEZE ===");
function deepFreeze(object) {
  // Lấy toàn bộ danh sách thuộc tính của object
  const propNames = Object.getOwnPropertyNames(object);

  // Đóng băng các thuộc tính con trước
  for (const name of propNames) {
    const value = object[name];
    if (value && typeof value === "object") {
      deepFreeze(value); // Đệ quy đóng băng các object/array con
    }
  }

  // Đóng băng chính object hiện tại
  return Object.freeze(object);
}

const trulyImmutable = deepFreeze({
  api: "v1",
  security: {
    cors: true,
    jwt: { expiresIn: "1h" }
  }
});

// Kiểm chứng mọi cấp độ đều bị khóa chặt
assert.throws(
  () => {
    trulyImmutable.security.jwt.expiresIn = "24h";
  },
  /^TypeError: Cannot assign to read only property 'expiresIn' of object/,
  "Thuộc tính lồng sâu cấp 3 cũng đã được đóng băng an toàn!"
);

console.log("✅ Đã kiểm chứng: deepFreeze ngăn chặn thành công mọi hành vi thay đổi thuộc tính lồng nhau!");
