/**
 * practice.js - Module 01: SQL Querying Fundamentals & Filtering
 * Bộ 5 thử thách kiểm thử tự động zero-dependency qua node:sqlite
 * Chạy bằng lệnh: node database/01-sql-basics-and-filtering/practice.js
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 01 - SQL BASICS & FILTERING ===');

const db = new DatabaseSync(':memory:');

// Khởi tạo Schema môi trường kiểm thử
db.exec(`
    CREATE TABLE inventory (
        sku TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price REAL NOT NULL,
        discount_code TEXT,
        stock_qty INTEGER,
        supplier_rating INTEGER
    );

    INSERT INTO inventory VALUES
    ('SKU-001', 'Ergo Keyboard', 'Peripherals', 120.0, 'PROMO_10%', 25, 5),
    ('SKU-002', 'Gaming Mouse', 'Peripherals', 60.0, 'SUMMER_SALE', 0, 4),
    ('SKU-003', 'Office Chair', 'Furniture', 250.0, NULL, 10, 5),
    ('SKU-004', 'Standing Desk', 'Furniture', 450.0, 'PROMO_20%', 5, 5),
    ('SKU-005', 'USB-C Cable', 'Peripherals', 15.0, 'CLEARANCE', NULL, 3),
    ('SKU-006', 'Monitor Arm', 'Peripherals', 80.0, NULL, 15, 4),
    ('SKU-007', 'Desk Lamp', 'Furniture', 45.0, 'SUMMER_SALE', 30, NULL);
`);

// -------------------------------------------------------------
// Thử thách 1: Selective Projection & Multi-column Deduplication
// -------------------------------------------------------------
console.log('-> Thử thách 1: Khử trùng lặp tổ hợp đa cột có chứa giá trị NULL...');
// Lấy danh sách các cặp duy nhất (category, supplier_rating) sắp xếp theo category ASC, supplier_rating DESC NULLS LAST
const distinctPairs = db.prepare(`
    SELECT DISTINCT category, supplier_rating
    FROM inventory
    ORDER BY category ASC, supplier_rating DESC NULLS LAST
`).all();

const expectedPairs = [
    { category: 'Furniture', supplier_rating: 5 },
    { category: 'Furniture', supplier_rating: null },
    { category: 'Peripherals', supplier_rating: 5 },
    { category: 'Peripherals', supplier_rating: 4 },
    { category: 'Peripherals', supplier_rating: 3 }
];
assert.deepStrictEqual(clean(distinctPairs), expectedPairs);
console.log('   ✓ Thử thách 1 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 2: Operator Precedence & Defensive Parentheses
// -------------------------------------------------------------
console.log('-> Thử thách 2: Lọc logic kết hợp AND và OR có đóng mở ngoặc đơn bảo vệ...');
// Yêu cầu: Lấy sản phẩm thuộc 'Peripherals' HOẶC 'Furniture', VÀ phải có giá từ 100 trở lên
const filteredProducts = db.prepare(`
    SELECT sku, price
    FROM inventory
    WHERE (category = 'Peripherals' OR category = 'Furniture')
      AND price >= 100.0
    ORDER BY sku ASC
`).all();

assert.deepStrictEqual(clean(filteredProducts), [
    { sku: 'SKU-001', price: 120.0 },
    { sku: 'SKU-003', price: 250.0 },
    { sku: 'SKU-004', price: 450.0 }
]);
console.log('   ✓ Thử thách 2 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 3: Three-Valued Logic (3VL) & Xử lý NULL
// -------------------------------------------------------------
console.log('-> Thử thách 3: Xử lý logic tam trị và phát hiện giá trị NULL...');
// Yêu cầu: Lấy sản phẩm không có mã giảm giá (discount_code IS NULL) hoặc tồn kho chưa xác định (stock_qty IS NULL)
const nullCheck = db.prepare(`
    SELECT sku FROM inventory
    WHERE discount_code IS NULL OR stock_qty IS NULL
    ORDER BY sku ASC
`).all();

assert.deepStrictEqual(clean(nullCheck), [
    { sku: 'SKU-003' },
    { sku: 'SKU-005' },
    { sku: 'SKU-006' }
]);
console.log('   ✓ Thử thách 3 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 4: Sắp Xếp Đa Cột & Phân Trang Keyset Cursor
// -------------------------------------------------------------
console.log('-> Thử thách 4: Phân trang con trỏ (Keyset Seek) thay thế OFFSET...');
// Lấy trang 1 (2 sản phẩm giá cao nhất)
const page1 = db.prepare(`
    SELECT sku, price FROM inventory
    ORDER BY price DESC, sku ASC
    LIMIT 2
`).all();
assert.strictEqual(page1[0].sku, 'SKU-004'); // 450.0
assert.strictEqual(page1[1].sku, 'SKU-003'); // 250.0

// Dùng con trỏ của bản ghi cuối cùng (price = 250.0, sku = 'SKU-003') để lấy trang 2 mà không dùng OFFSET
const lastPrice = page1[1].price;
const lastSku = page1[1].sku;

const page2Keyset = db.prepare(`
    SELECT sku, price FROM inventory
    WHERE (price < ?) OR (price = ? AND sku > ?)
    ORDER BY price DESC, sku ASC
    LIMIT 2
`).all(lastPrice, lastPrice, lastSku);

assert.deepStrictEqual(clean(page2Keyset), [
    { sku: 'SKU-001', price: 120.0 },
    { sku: 'SKU-006', price: 80.0 }
]);
console.log('   ✓ Thử thách 4 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 5: Pattern Matching với ESCAPE & Safe Set Membership
// -------------------------------------------------------------
console.log('-> Thử thách 5: Khớp ký tự % bằng ESCAPE và lọc danh sách an toàn...');
// Yêu cầu: Tìm các sản phẩm có discount_code chứa ký tự '%' thực tế
const promoPercent = db.prepare(`
    SELECT sku, discount_code FROM inventory
    WHERE discount_code LIKE '%!%%' ESCAPE '!'
    ORDER BY sku ASC
`).all();

assert.deepStrictEqual(clean(promoPercent), [
    { sku: 'SKU-001', discount_code: 'PROMO_10%' },
    { sku: 'SKU-004', discount_code: 'PROMO_20%' }
]);
console.log('   ✓ Thử thách 5 hoàn thành xuất sắc!');

console.log('\n=======================================================');
console.log('-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 01 ĐÃ VƯỢT QUA 100%!');
console.log('=======================================================');
