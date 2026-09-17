/**
 * JavaScript Conventions & ASI Demo
 * Thực nghiệm cơ chế Automatic Semicolon Insertion (ASI),
 * cạm bẫy return ngắt dòng, cạm bẫy dấu ngoặc vuông [, và quy chuẩn đặt tên.
 */

"use strict";

const assert = require("assert");

console.log("=== DEMO 1: CẠM BẪY ASI VỚI CÂU LỆNH RETURN XUỐNG DÒNG ===");

// 1. Hàm viết sai quy chuẩn: ngoặc { xuống dòng:
function getBadUser() {
  return
  {
    name: "Alice"
  };
}

// ASI tự chèn dấu chấm phẩy -> hàm trả về undefined:
assert.strictEqual(getBadUser(), undefined);
console.log("getBadUser() trả về:", getBadUser());

// 2. Hàm viết đúng quy chuẩn 1TBS:
function getGoodUser() {
  return {
    name: "Alice"
  };
}

assert.deepStrictEqual(getGoodUser(), { name: "Alice" });
console.log("getGoodUser() trả về đối tượng:", getGoodUser());
console.log("-> Kiểm chứng cạm bẫy ASI return: Hoàn toàn chính xác!\n");

console.log("=== DEMO 2: CẠM BẪY ASI KHI DÒNG MỚI BẮT ĐẦU BẰNG [ ===");
// Mô phỏng bẫy không có dấu chấm phẩy bằng new Function:
assert.throws(() => {
  new Function(`
    var a = 1
    [1, 2].forEach(function(x) {})
  `)();
}, TypeError);

console.log("Không có chấm phẩy trước [ khiến engine coi là a = 1[1, 2] -> Ném TypeError đúng chuẩn.");
console.log("-> Kiểm chứng ASI Bracket Trap: Hoàn toàn chính xác!\n");

console.log("=== DEMO 3: TRƯỜNG RIÊNG TƯ CLASS PRIVATE FIELDS (#) ===");
class SecureVault {
  #secretCode = "TOP_SECRET_999";

  getSecret(key) {
    if (key === "AUTHORIZED") {
      return this.#secretCode;
    }
    return null;
  }
}

const vault = new SecureVault();
assert.strictEqual(vault.getSecret("AUTHORIZED"), "TOP_SECRET_999");
// @ts-ignore
assert.strictEqual(vault.secretCode, undefined);
// @ts-ignore
assert.strictEqual(vault["#secretCode"], undefined);

console.log("-> Kiểm chứng Private Field (#) bảo mật cấp độ Engine: Hoàn toàn chính xác!\n");

console.log("==========================================");
console.log(" Tất cả các kiểm tra Conventions đã vượt qua thành công! ");
console.log("==========================================");
