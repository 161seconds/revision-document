/**
 * 14-regexp-demo.js
 * Chạy độc lập: node 14-regexp-demo.js
 * Kiểm chứng toàn diện Biểu thức Chính quy (Regular Expressions) trong JavaScript:
 * 1. Các cờ nâng cao (Flags: g, i, m, s, u, y - Sticky flag)
 * 2. Cạm bẫy trạng thái lastIndex với cờ /g khi dùng regex.test()
 * 3. Nhóm bắt có đặt tên (Named Capture Groups: (?<name>...))
 * 4. Kỹ thuật Lookahead & Lookbehind ((?=), (?!), (?<=), (?<!))
 * 5. Phương thức chuỗi hiện đại: matchAll() & replace() với hàm callback
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 14: REGULAR EXPRESSIONS (REGEXP) ===");

// -------------------------------------------------------------
// 1. CẠM BẪY STATEFUL LASTINDEX VỚI CỜ /G TRONG REGEX.TEST()
// -------------------------------------------------------------
// Khi dùng cờ 'g', RegExp instance lưu lại chỉ mục vị trí vừa tìm thấy trong .lastIndex.
// Lần test() tiếp theo sẽ tìm kiếm BẮT ĐẦU TỪ VỊ TRÍ ĐÓ thay vì từ đầu chuỗi!
const globalRegex = /foo/g;
const testStr = "foo";

// Lần 1: Tìm thấy tại index 0 -> trả về true, lastIndex cập nhật lên 3
assert.equal(globalRegex.test(testStr), true);
assert.equal(globalRegex.lastIndex, 3);

// Lần 2: Tìm từ index 3 đến hết chuỗi -> KHÔNG THẤY! -> trả về FALSE (Bẫy kinh điển!)
assert.equal(globalRegex.test(testStr), false);
assert.equal(globalRegex.lastIndex, 0, "Sau khi false, lastIndex tự reset về 0");

// Lần 3: Lại trả về TRUE!
assert.equal(globalRegex.test(testStr), true);

// GIẢI PHÁP: Nếu chỉ muốn kiểm tra boolean tồn tại, TUYỆT ĐỐI KHÔNG dùng cờ 'g':
const safeRegex = /foo/;
assert.equal(safeRegex.test(testStr), true);
assert.equal(safeRegex.test(testStr), true); // Luôn luôn trả về true nhất quán

// -------------------------------------------------------------
// 2. NAMED CAPTURE GROUPS (NHÓM BẮT CÓ ĐẶT TÊN - ES2018)
// -------------------------------------------------------------
const dateRegex = /(?<year>\d{4})-(?<month>\d{2})-(?<day>\d{2})/;
const matchResult = dateRegex.exec("2026-09-17");

assert.equal(matchResult.groups.year, "2026");
assert.equal(matchResult.groups.month, "09");
assert.equal(matchResult.groups.day, "17");

// Thay thế trực tiếp bằng cú pháp $<name>
const formattedDate = "2026-09-17".replace(dateRegex, "$<day>/$<month>/$<year>");
assert.equal(formattedDate, "17/09/2026");

// -------------------------------------------------------------
// 3. LOOKAHEAD & LOOKBEHIND (TIỀN KIỂM & HẬU KIỂM)
// -------------------------------------------------------------
// A. Positive Lookahead (?=...): Khớp nếu theo sau bởi ... (nhưng không nuốt ký tự)
// Tìm số tiền có đơn vị USD đứng sau:
const pricePattern = /\d+(?=\s*USD)/;
assert.equal(pricePattern.exec("Tổng chi phí: 150 USD")[0], "150");
assert.equal(pricePattern.exec("Tổng chi phí: 150 EUR"), null);

// B. Positive Lookbehind (?<=...): Khớp nếu phía trước là ... (ES2018)
// Tìm giá trị số theo sau ký hiệu $:
const currencyPattern = /(?<=\$)\d+/;
assert.equal(currencyPattern.exec("Giá: $250")[0], "250");
assert.equal(currencyPattern.exec("Giá: €250"), null);

// C. Negative Lookahead (?!...): Mật khẩu KHÔNG chứa khoảng trắng
const noSpacePattern = /^(?!.*\s).{6,}$/;
assert.equal(noSpacePattern.test("pass123"), true);
assert.equal(noSpacePattern.test("pass 123"), false);

// -------------------------------------------------------------
// 4. STICKY FLAG /Y (KHỚP CHÍNH XÁC TẠI VỊ TRÍ LASTINDEX)
// -------------------------------------------------------------
// Khác với 'g' (sẽ tìm kiếm từ lastIndex trở đi), 'y' BẮT BUỘC phải khớp chính xác
// tại vị trí lastIndex, nếu không khớp sẽ dừng ngay (dùng cho Lexer/Parser):
const codeRegex = /\w+/y;
const codeStr = "let x = 10";

codeRegex.lastIndex = 0;
assert.equal(codeRegex.exec(codeStr)[0], "let");
assert.equal(codeRegex.lastIndex, 3);

// Tại vị trí 3 là dấu cách ' ' -> codeRegex bắt đầu bằng \w sẽ thất bại ngay lập tức:
assert.equal(codeRegex.exec(codeStr), null);

// -------------------------------------------------------------
// 5. PHƯƠNG THỨC STRING.MATCHALL() (ES2020)
// -------------------------------------------------------------
const tagRegex = /<(?<tag>\w+)>(.*?)<\/\k<tag>>/g;
const htmlText = "<h1>Tiêu đề</h1><p>Nội dung</p>";

// matchAll trả về một Iterator chứa toàn bộ groups và index
const matches = Array.from(htmlText.matchAll(tagRegex));
assert.equal(matches.length, 2);
assert.equal(matches[0].groups.tag, "h1");
assert.equal(matches[0][2], "Tiêu đề");
assert.equal(matches[1].groups.tag, "p");
assert.equal(matches[1][2], "Nội dung");

console.log("-> 100% tests cho Regular Expressions đã pass thành công!");
