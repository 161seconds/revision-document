/**
 * 02-numeric-demo.js
 * Minh họa kiểm chứng thực tế: Các hàm số học và toán học trong SQL (ROUND, ABS, SIGN, CEIL, FLOOR, MOD)
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SQL NUMERIC & MATH FUNCTIONS ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE measurements (
        id INTEGER PRIMARY KEY,
        val REAL NOT NULL
    );

    INSERT INTO measurements VALUES
    (1, 125.678),
    (2, -45.2),
    (3, -4.8),
    (4, 4.2),
    (5, 0.0);
`);

// Test 1: ROUND, ABS, SIGN
const basicMath = db.prepare(`
    SELECT 
        val,
        ROUND(val, 2) AS r2,
        ABS(val) AS abs_val,
        SIGN(val) AS sgn
    FROM measurements
    WHERE id = 2
`).get();

console.log('-> Test 1: ROUND, ABS, SIGN:', { ...basicMath });
assert.strictEqual(basicMath.r2, -45.2);
assert.strictEqual(basicMath.abs_val, 45.2);
assert.strictEqual(basicMath.sgn, -1);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: CEIL vs FLOOR trên số dương và số âm
const ceilFloor = db.prepare(`
    SELECT 
        id, val,
        CEIL(val) AS ceil_val,
        FLOOR(val) AS floor_val
    FROM measurements
    WHERE id IN (3, 4)
    ORDER BY id ASC
`).all();

console.log('-> Test 2: CEIL & FLOOR (Số âm và số dương):', clean(ceilFloor));
// id=3 (val = -4.8): CEIL = -4, FLOOR = -5
// id=4 (val = 4.2): CEIL = 5, FLOOR = 4
assert.deepStrictEqual(clean(ceilFloor), [
    { id: 3, val: -4.8, ceil_val: -4, floor_val: -5 },
    { id: 4, val: 4.2, ceil_val: 5, floor_val: 4 }
]);
console.log('   ✓ Test 2 đạt chuẩn (Làm tròn số âm và dương chính xác)!');

// Test 3: Phép chia lấy dư MOD (%)
const modTest = db.prepare(`
    SELECT 10 % 3 AS rem1, 14 % 5 AS rem2, 100 % 10 AS rem3
`).get();

console.log('-> Test 3: Phép MOD (%):', { ...modTest });
assert.deepStrictEqual({ ...modTest }, { rem1: 1, rem2: 4, rem3: 0 });
console.log('   ✓ Test 3 đạt chuẩn!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ HÀM SỐ HỌC HOÀN TẤT XUẤT SẮC! ===');
