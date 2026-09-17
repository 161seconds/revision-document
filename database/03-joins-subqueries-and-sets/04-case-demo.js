/**
 * 04-case-demo.js
 * Minh họa kiểm chứng thực tế: CASE WHEN, Conditional Aggregation và CREATE TABLE AS SELECT (CTAS)
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: CASE WHEN, PIVOTING & CTAS ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL
    );

    INSERT INTO orders VALUES
    (1, 101, 250.0, 'Completed'),
    (2, 101, 50.0, 'Pending'),
    (3, 102, 1200.0, 'Completed'),
    (4, 102, 300.0, 'Cancelled'),
    (5, 101, 1500.0, 'Completed');
`);

// Test 1: Searched CASE phân loại mức chi tiêu (Tiers)
const tierQuery = db.prepare(`
    SELECT order_id, amount,
        CASE 
            WHEN amount >= 1000.0 THEN 'Platinum'
            WHEN amount >= 200.0 THEN 'Gold'
            ELSE 'Silver'
        END AS tier
    FROM orders
    ORDER BY order_id ASC
`).all();

console.log('-> Test 1: Phân loại Tier bằng CASE:', clean(tierQuery));
assert.deepStrictEqual(clean(tierQuery), [
    { order_id: 1, amount: 250.0, tier: 'Gold' },
    { order_id: 2, amount: 50.0, tier: 'Silver' },
    { order_id: 3, amount: 1200.0, tier: 'Platinum' },
    { order_id: 4, amount: 300.0, tier: 'Gold' },
    { order_id: 5, amount: 1500.0, tier: 'Platinum' }
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Khuyết ELSE sẽ tự động trả về NULL
const noElseQuery = db.prepare(`
    SELECT order_id,
        CASE WHEN status = 'Pending' THEN 'ACTION_REQUIRED' END AS alert
    FROM orders
    ORDER BY order_id ASC
`).all();

console.log('-> Test 2: CASE không có ELSE (trả về NULL):', clean(noElseQuery));
assert.strictEqual(noElseQuery[1].alert, 'ACTION_REQUIRED'); // order_id = 2 là Pending
assert.strictEqual(noElseQuery[0].alert, null);
console.log('   ✓ Test 2 đạt chuẩn (Khuyết ELSE trả về NULL chính xác)!');

// Test 3: Conditional Aggregation (Xoay dòng thành cột - Pivoting)
const pivotReport = db.prepare(`
    SELECT 
        customer_id,
        COUNT(CASE WHEN status = 'Completed' THEN 1 END) AS completed_count,
        COUNT(CASE WHEN status = 'Pending' THEN 1 END) AS pending_count,
        COUNT(CASE WHEN status = 'Cancelled' THEN 1 END) AS cancelled_count,
        SUM(CASE WHEN status = 'Completed' THEN amount ELSE 0.0 END) AS completed_revenue
    FROM orders
    GROUP BY customer_id
    ORDER BY customer_id ASC
`).all();

console.log('-> Test 3: Conditional Aggregation (Pivot):', clean(pivotReport));
assert.deepStrictEqual(clean(pivotReport), [
    { customer_id: 101, completed_count: 2, pending_count: 1, cancelled_count: 0, completed_revenue: 1750.0 },
    { customer_id: 102, completed_count: 1, pending_count: 0, cancelled_count: 1, completed_revenue: 1200.0 }
]);
console.log('   ✓ Test 3 đạt chuẩn (Xoay trục dữ liệu Pivoting chính xác 100%)!');

// Test 4: CREATE TABLE AS SELECT (CTAS)
db.exec(`
    CREATE TABLE high_value_orders AS
    SELECT order_id, customer_id, amount
    FROM orders
    WHERE amount >= 1000.0;
`);

const ctasRows = db.prepare('SELECT * FROM high_value_orders ORDER BY order_id ASC').all();
console.log('-> Test 4: Bảng mới từ CTAS:', clean(ctasRows));
assert.strictEqual(ctasRows.length, 2);
assert.deepStrictEqual(clean(ctasRows), [
    { order_id: 3, customer_id: 102, amount: 1200.0 },
    { order_id: 5, customer_id: 101, amount: 1500.0 }
]);
console.log('   ✓ Test 4 đạt chuẩn (CTAS nhân bản cấu trúc và dữ liệu thành công)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ CASE WHEN & CTAS HOÀN TẤT XUẤT SẮC! ===');
