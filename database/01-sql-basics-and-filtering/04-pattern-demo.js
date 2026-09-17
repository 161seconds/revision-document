/**
 * 04-pattern-demo.js
 * Minh họa kiểm chứng thực tế: LIKE, Wildcards, ESCAPE, IN, Bẫy NOT IN với NULL, và BETWEEN
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: LIKE, WILDCARDS, ESCAPE, IN/NOT IN & BETWEEN ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE vouchers (
        id INTEGER PRIMARY KEY,
        code TEXT NOT NULL,
        discount_pct INTEGER NOT NULL
    );

    INSERT INTO vouchers VALUES
    (1, 'SUMMER_10', 10),
    (2, 'SUMMER_20', 20),
    (3, 'VIP_50%_OFF', 50),
    (4, 'FLASH_SALE', 15),
    (5, 'SUMMER_SEASON', 5);
`);

// Test 1: Mệnh đề ESCAPE để tìm ký tự đại diện thực tế (Dấu gạch dưới '_' và dấu '%')
// Cần tìm voucher có chứa ký tự '%' thực tế
const findPercent = db.prepare(`
    SELECT code FROM vouchers
    WHERE code LIKE '%!%%' ESCAPE '!'
`).all();

console.log('-> Test 1a: Tìm ký tự % thực tế bằng ESCAPE:', clean(findPercent));
assert.deepStrictEqual(clean(findPercent), [
    { code: 'VIP_50%_OFF' }
]);

// Cần tìm voucher bắt đầu bằng 'SUMMER_' thực tế (tránh nhầm _ là đại diện cho 1 ký tự bất kỳ)
const findSummerPrefix = db.prepare(`
    SELECT code FROM vouchers
    WHERE code LIKE 'SUMMER!_%' ESCAPE '!'
    ORDER BY code ASC
`).all();

console.log('-> Test 1b: Tìm tiền tố SUMMER_ thực tế:', clean(findSummerPrefix));
assert.deepStrictEqual(clean(findSummerPrefix), [
    { code: 'SUMMER_10' },
    { code: 'SUMMER_20' },
    { code: 'SUMMER_SEASON' }
]);
console.log('   ✓ Test 1 đạt chuẩn (ESCAPE hoạt động chính xác cho cả % và _)!');

// Test 2: Toán tử IN và BETWEEN (Tính chất bao đóng inclusive)
const betweenTest = db.prepare(`
    SELECT code, discount_pct FROM vouchers
    WHERE discount_pct BETWEEN 10 AND 20
    ORDER BY discount_pct ASC
`).all();

console.log('-> Test 2: BETWEEN 10 AND 20 (Inclusive cả 10 và 20):', clean(betweenTest));
assert.deepStrictEqual(clean(betweenTest), [
    { code: 'SUMMER_10', discount_pct: 10 },
    { code: 'FLASH_SALE', discount_pct: 15 },
    { code: 'SUMMER_20', discount_pct: 20 }
]);
console.log('   ✓ Test 2 đạt chuẩn (Bao gồm đầy đủ cả hai đầu mút)!');

// Test 3: Bẫy kinh điển NOT IN với tập hợp có chứa NULL
// Bình thường: NOT IN (10, 20) lấy được id 3, 4, 5
const notInNormal = db.prepare(`
    SELECT id FROM vouchers WHERE discount_pct NOT IN (10, 20)
`).all();
assert.strictEqual(notInNormal.length, 3);

// Bẫy: NOT IN (10, 20, NULL) -> Luôn trả về 0 dòng vì 3VL UNKNOWN!
const notInWithNull = db.prepare(`
    SELECT id FROM vouchers WHERE discount_pct NOT IN (10, 20, NULL)
`).all();

console.log('-> Test 3: NOT IN (10, 20, NULL) trả về số dòng:', notInWithNull.length);
assert.strictEqual(notInWithNull.length, 0);
console.log('   ✓ Test 3 đạt chuẩn (Chứng minh bẫy 3VL: NOT IN chứa NULL triệt tiêu toàn bộ kết quả)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ WILDCARDS & SET OPERATIONS HOÀN TẤT XUẤT SẮC! ===');
