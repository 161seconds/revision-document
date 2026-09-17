/**
 * 02-null-demo.js
 * Minh họa kiểm chứng thực tế: Giá trị NULL, Logic Tam Trị 3VL, COALESCE, IFNULL và NULLIF
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: NULL, 3VL, COALESCE, IFNULL & NULLIF ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        base_salary REAL NOT NULL,
        bonus REAL,
        commission REAL
    );

    INSERT INTO employees VALUES
    (1, 'Alice', 5000.0, 1000.0, 500.0),
    (2, 'Bob', 4000.0, NULL, 300.0),
    (3, 'Charlie', 3500.0, NULL, NULL);
`);

// Test 1: COALESCE - Tìm giá trị đầu tiên khác NULL từ trái sang phải
const compQuery = db.prepare(`
    SELECT name, base_salary + COALESCE(bonus, commission, 0.0) AS total_comp
    FROM employees
    ORDER BY id ASC
`).all();

console.log('-> Test 1: COALESCE(bonus, commission, 0.0):', clean(compQuery));
assert.deepStrictEqual(clean(compQuery), [
    { name: 'Alice', total_comp: 6000.0 },     // 5000 + 1000
    { name: 'Bob', total_comp: 4300.0 },       // 5000 + 300 (bonus là null -> lấy commission)
    { name: 'Charlie', total_comp: 3500.0 }    // 3500 + 0 (cả 2 đều null -> lấy 0)
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: IFNULL - Thay thế giá trị mặc định 2 tham số
const ifnullQuery = db.prepare(`
    SELECT name, IFNULL(bonus, -1.0) AS bonus_val
    FROM employees
    ORDER BY id ASC
`).all();

console.log('-> Test 2: IFNULL(bonus, -1.0):', clean(ifnullQuery));
assert.deepStrictEqual(clean(ifnullQuery), [
    { name: 'Alice', bonus_val: 1000.0 },
    { name: 'Bob', bonus_val: -1.0 },
    { name: 'Charlie', bonus_val: -1.0 }
]);
console.log('   ✓ Test 2 đạt chuẩn!');

// Test 3: NULLIF - Triệt tiêu lỗi chia cho 0 (Division by Zero)
// Cho Charlie có bonus=0, thực hiện phép chia base_salary / NULLIF(bonus, 0)
const safeDivQuery = db.prepare(`
    SELECT 
        name,
        5000.0 / NULLIF(IFNULL(bonus, 0), 0) AS ratio
    FROM employees
    ORDER BY id ASC
`).all();

console.log('-> Test 3: Phòng vệ chia cho 0 bằng NULLIF:', clean(safeDivQuery));
assert.strictEqual(safeDivQuery[0].ratio, 5.0); // 5000 / 1000
assert.strictEqual(safeDivQuery[1].ratio, null); // 5000 / NULLIF(0, 0) = 5000 / NULL = NULL (không sập!)
assert.strictEqual(safeDivQuery[2].ratio, null);
console.log('   ✓ Test 3 đạt chuẩn (NULLIF ngăn chặn hoàn toàn lỗi Divide by Zero)!');

// Test 4: Logic tam trị 3VL trong CASE WHEN
const threeVLQuery = db.prepare(`
    SELECT CASE 
        WHEN NULL = NULL THEN 'EQUAL'
        WHEN NULL <> NULL THEN 'NOT EQUAL'
        ELSE 'UNKNOWN'
    END AS logic_result
`).get();

console.log('-> Test 4: 3VL CASE WHEN (NULL = NULL):', { ...threeVLQuery });
assert.strictEqual(threeVLQuery.logic_result, 'UNKNOWN');
console.log('   ✓ Test 4 đạt chuẩn (NULL = NULL đánh giá thành UNKNOWN rơi vào ELSE)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ NULL & COALESCE HOÀN TẤT XUẤT SẮC! ===');
