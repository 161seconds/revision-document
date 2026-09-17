/**
 * 04-group-having-demo.js
 * Minh họa kiểm chứng thực tế: GROUP BY, HAVING, WHERE vs HAVING và Trật tự thực thi truy vấn
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: GROUP BY, HAVING & EXECUTION ORDER ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE orders (
        order_id INTEGER PRIMARY KEY,
        customer_id INTEGER NOT NULL,
        category TEXT NOT NULL,
        amount REAL NOT NULL,
        status TEXT NOT NULL
    );

    INSERT INTO orders VALUES
    (1, 101, 'Electronics', 1200.0, 'Completed'),
    (2, 101, 'Books', 50.0, 'Completed'),
    (3, 101, 'Electronics', 800.0, 'Completed'),
    (4, 102, 'Books', 30.0, 'Completed'),
    (5, 102, 'Electronics', 400.0, 'Cancelled'),
    (6, 103, 'Electronics', 2500.0, 'Completed'),
    (7, 103, 'Books', 150.0, 'Completed');
`);

// Test 1: Gom nhóm đa cột (customer_id, category)
const multiGroup = db.prepare(`
    SELECT 
        customer_id,
        category,
        COUNT(*) AS order_count,
        SUM(amount) AS total_amount
    FROM orders
    WHERE status = 'Completed'
    GROUP BY customer_id, category
    ORDER BY customer_id ASC, category ASC
`).all();

console.log('-> Test 1: GROUP BY customer_id, category:', clean(multiGroup));
assert.deepStrictEqual(clean(multiGroup), [
    { customer_id: 101, category: 'Books', order_count: 1, total_amount: 50.0 },
    { customer_id: 101, category: 'Electronics', order_count: 2, total_amount: 2000.0 },
    { customer_id: 102, category: 'Books', order_count: 1, total_amount: 30.0 },
    { customer_id: 103, category: 'Books', order_count: 1, total_amount: 150.0 },
    { customer_id: 103, category: 'Electronics', order_count: 1, total_amount: 2500.0 }
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Kết hợp WHERE (lọc dòng thô) và HAVING (lọc nhóm sau tính toán)
// Lấy các khách hàng có tổng chi tiêu Completed trên 1000$
const spendingQuery = db.prepare(`
    SELECT 
        customer_id,
        COUNT(*) AS completed_orders,
        SUM(amount) AS total_spent
    FROM orders
    WHERE status = 'Completed'
    GROUP BY customer_id
    HAVING SUM(amount) >= 1000.0
    ORDER BY total_spent DESC
`).all();

console.log('-> Test 2: WHERE status=Completed + HAVING SUM >= 1000:', clean(spendingQuery));
// Khách 103: 2500 + 150 = 2650$
// Khách 101: 1200 + 50 + 800 = 2050$
// Khách 102: Chỉ có 30$ Completed (đơn 400$ bị Cancelled đã bị WHERE loại bỏ) -> Không qua được HAVING
assert.deepStrictEqual(clean(spendingQuery), [
    { customer_id: 103, completed_orders: 2, total_spent: 2650.0 },
    { customer_id: 101, completed_orders: 3, total_spent: 2050.0 }
]);
console.log('   ✓ Test 2 đạt chuẩn (WHERE lọc trước, HAVING lọc sau chuẩn xác)!');

// Test 3: Chứng minh việc dùng hàm tổng hợp trong WHERE gây lỗi cú pháp
assert.throws(() => {
    db.prepare('SELECT customer_id FROM orders WHERE SUM(amount) > 1000 GROUP BY customer_id').all();
}, /misuse of aggregate/i);
console.log('   ✓ Test 3 đạt chuẩn (Database chặn đúng lỗi aggregate trong WHERE)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ GROUP BY & HAVING HOÀN TẤT XUẤT SẮC! ===');
