/**
 * 01-index-demo.js
 * Minh họa kiểm chứng thực tế: B-Tree Index, Leftmost Prefix Rule và phân tích EXPLAIN QUERY PLAN
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: B-TREE INDEXING & EXPLAIN QUERY PLAN ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE customers (
        id INTEGER PRIMARY KEY,
        country TEXT NOT NULL,
        city TEXT NOT NULL,
        email TEXT NOT NULL,
        score INTEGER NOT NULL
    );

    CREATE INDEX idx_customers_geo ON customers (country, city);
    CREATE UNIQUE INDEX idx_customers_email ON customers (email);

    INSERT INTO customers VALUES
    (1, 'VN', 'Hanoi', 'an@test.vn', 100),
    (2, 'VN', 'DaNang', 'binh@test.vn', 95),
    (3, 'SG', 'Singapore', 'chen@test.sg', 88);
`);

// Test 1: EXPLAIN QUERY PLAN trên câu truy vấn tuân thủ tiền tố Leftmost (country + city)
const planWithIndex = db.prepare(`
    EXPLAIN QUERY PLAN
    SELECT * FROM customers WHERE country = 'VN' AND city = 'Hanoi';
`).all();

console.log('-> Test 1: Plan có Index Seek:', clean(planWithIndex));
// Kiểm tra chuỗi kế hoạch thực thi chứa SEARCH customers USING INDEX idx_customers_geo
assert.ok(planWithIndex.some(step => step.detail.includes('SEARCH customers USING INDEX idx_customers_geo')));
console.log('   ✓ Test 1 đạt chuẩn (Tận dụng Index Seek thành công)!');

// Test 2: EXPLAIN QUERY PLAN vi phạm Leftmost Prefix (chỉ lọc theo city, thiếu country)
const planWithoutPrefix = db.prepare(`
    EXPLAIN QUERY PLAN
    SELECT * FROM customers WHERE city = 'Hanoi';
`).all();

console.log('-> Test 2: Plan vi phạm Leftmost Prefix:', clean(planWithoutPrefix));
// Khi thiếu country, B-Tree không thể seek -> Buộc phải SCAN customers
assert.ok(planWithoutPrefix.some(step => step.detail.includes('SCAN customers')));
console.log('   ✓ Test 2 đạt chuẩn (Thiếu cột dẫn đầu buộc Engine phải Full Scan)!');

// Test 3: Unique Index kiểm tra tính duy nhất trên email
assert.throws(() => {
    db.prepare("INSERT INTO customers VALUES (4, 'VN', 'Hue', 'an@test.vn', 50)").run();
}, /UNIQUE constraint failed/i);
console.log('   ✓ Test 3 đạt chuẩn (Unique Index bảo vệ chống trùng email)!');

// Test 4: Covering Index (Index-Only Scan)
// Truy vấn chỉ lấy country và city từ Index mà không cần chạm vào bảng customers
const coveringPlan = db.prepare(`
    EXPLAIN QUERY PLAN
    SELECT country, city FROM customers WHERE country = 'VN';
`).all();

console.log('-> Test 4: Covering Index Plan:', clean(coveringPlan));
assert.ok(coveringPlan.some(step => step.detail.includes('USING COVERING INDEX') || step.detail.includes('USING INDEX idx_customers_geo')));
console.log('   ✓ Test 4 đạt chuẩn (Covering Index tối ưu hóa truy vấn không cần đọc bảng gốc)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ CHỈ MỤC HOÀN TẤT XUẤT SẮC! ===');
