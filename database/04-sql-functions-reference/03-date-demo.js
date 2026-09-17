/**
 * 03-date-demo.js
 * Minh họa kiểm chứng thực tế: Các hàm ngày tháng và thời gian trong SQL (CURRENT_DATE, Date Arithmetic, Date Formatting)
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SQL DATE & TIME FUNCTIONS ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE subscriptions (
        id INTEGER PRIMARY KEY,
        user_name TEXT NOT NULL,
        start_date TEXT NOT NULL,
        days_valid INTEGER NOT NULL
    );

    INSERT INTO subscriptions VALUES
    (1, 'Alice', '2026-01-01', 30),
    (2, 'Bob', '2026-06-15', 90);
`);

// Test 1: Lấy ngày giờ hiện tại chuẩn ANSI (CURRENT_DATE, CURRENT_TIME, CURRENT_TIMESTAMP)
const curTime = db.prepare(`
    SELECT 
        CURRENT_DATE AS today,
        CURRENT_TIME AS cur_time,
        CURRENT_TIMESTAMP AS now_ts
`).get();

console.log('-> Test 1: Thời gian hệ thống hiện tại:', { ...curTime });
assert.ok(curTime.today.match(/^\d{4}-\d{2}-\d{2}$/));
assert.ok(curTime.now_ts.match(/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/));
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Cộng trừ ngày tháng (Date Arithmetic: DATE_ADD tương đương)
const subExpiry = db.prepare(`
    SELECT 
        user_name,
        start_date,
        date(start_date, '+' || days_valid || ' days') AS expiry_date
    FROM subscriptions
    ORDER BY id ASC
`).all();

console.log('-> Test 2: Tính ngày hết hạn (Date Arithmetic):', clean(subExpiry));
assert.deepStrictEqual(clean(subExpiry), [
    { user_name: 'Alice', start_date: '2026-01-01', expiry_date: '2026-01-31' },
    { user_name: 'Bob', start_date: '2026-06-15', expiry_date: '2026-09-13' }
]);
console.log('   ✓ Test 2 đạt chuẩn (Cộng 30 ngày và 90 ngày chính xác)!');

// Test 3: Tính số ngày chênh lệch (DATEDIFF tương đương qua Julianday)
const diffQuery = db.prepare(`
    SELECT 
        CAST(julianday('2026-01-31') - julianday('2026-01-01') AS INTEGER) AS diff_alice,
        CAST(julianday('2026-09-13') - julianday('2026-06-15') AS INTEGER) AS diff_bob
`).get();

console.log('-> Test 3: Tính khoảng cách ngày DATEDIFF:', { ...diffQuery });
assert.strictEqual(diffQuery.diff_alice, 30);
assert.strictEqual(diffQuery.diff_bob, 90);
console.log('   ✓ Test 3 đạt chuẩn!');

// Test 4: Trích xuất thành phần và định dạng ngày (EXTRACT / DATE_FORMAT tương đương)
const extractQuery = db.prepare(`
    SELECT 
        strftime('%Y', '2026-09-18') AS year_val,
        strftime('%m', '2026-09-18') AS month_val,
        strftime('%d', '2026-09-18') AS day_val,
        strftime('%d/%m/%Y', '2026-09-18') AS formatted_date
`).get();

console.log('-> Test 4: Trích xuất thành phần & Định dạng:', { ...extractQuery });
assert.deepStrictEqual({ ...extractQuery }, {
    year_val: '2026',
    month_val: '09',
    day_val: '18',
    formatted_date: '18/09/2026'
});
console.log('   ✓ Test 4 đạt chuẩn!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ HÀM THỜI GIAN HOÀN TẤT XUẤT SẮC! ===');
