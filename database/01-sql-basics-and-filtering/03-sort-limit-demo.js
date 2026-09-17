/**
 * 03-sort-limit-demo.js
 * Minh họa kiểm chứng thực tế: ORDER BY đa cột, Xử lý NULL, LIMIT/OFFSET và Keyset Pagination
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: ORDER BY, LIMIT, OFFSET & KEYSET PAGINATION ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE products (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        category TEXT NOT NULL,
        price INTEGER,
        stock INTEGER NOT NULL
    );

    INSERT INTO products VALUES
    (1, 'Laptop Pro', 'Tech', 1500, 10),
    (2, 'Gaming Mouse', 'Tech', 80, 50),
    (3, 'Mechanical Keyboard', 'Tech', 150, 30),
    (4, 'Budget Monitor', 'Tech', 150, 15),
    (5, 'Ergonomic Chair', 'Furniture', 300, 20),
    (6, 'Standing Desk', 'Furniture', 600, 5),
    (7, 'Clearance Cable', 'Tech', NULL, 100);
`);

// Test 1: Sắp xếp đa cột (Category ASC, sau đó Price DESC)
const multiSort = db.prepare(`
    SELECT name, category, price
    FROM products
    WHERE price IS NOT NULL
    ORDER BY category ASC, price DESC, id ASC
`).all();

console.log('-> Test 1: Sắp xếp đa cột:', clean(multiSort));
// Furniture: Standing Desk (600), Ergonomic Chair (300)
// Tech: Laptop Pro (1500), Keyboard & Monitor (cùng 150 -> tie breaker id 3 trước id 4), Mouse (80)
assert.strictEqual(multiSort[0].name, 'Standing Desk');
assert.strictEqual(multiSort[1].name, 'Ergonomic Chair');
assert.strictEqual(multiSort[2].name, 'Laptop Pro');
assert.strictEqual(multiSort[3].name, 'Mechanical Keyboard');
assert.strictEqual(multiSort[4].name, 'Budget Monitor');
assert.strictEqual(multiSort[5].name, 'Gaming Mouse');
console.log('   ✓ Test 1 đạt chuẩn (Định thứ tự đa cột chính xác)!');

// Test 2: Vị trí của NULL trong ORDER BY (NULLS LAST vs NULLS FIRST)
const nullsLast = db.prepare(`
    SELECT name, price
    FROM products
    WHERE category = 'Tech'
    ORDER BY price ASC NULLS LAST
`).all();

console.log('-> Test 2: Sắp xếp price ASC với NULLS LAST:', clean(nullsLast));
assert.strictEqual(nullsLast[nullsLast.length - 1].price, null);
assert.strictEqual(nullsLast[0].price, 80);
console.log('   ✓ Test 2 đạt chuẩn (Cú pháp NULLS LAST đưa NULL về cuối)!');

// Test 3: Phân trang OFFSET kinh điển
// Trang 1: LIMIT 2 OFFSET 0 -> Lấy 2 dòng đầu
const page1 = db.prepare(`
    SELECT id, name FROM products ORDER BY id ASC LIMIT 2 OFFSET 0
`).all();
// Trang 2: LIMIT 2 OFFSET 2 -> Bỏ qua 2 dòng, lấy 2 dòng tiếp theo
const page2 = db.prepare(`
    SELECT id, name FROM products ORDER BY id ASC LIMIT 2 OFFSET 2
`).all();

console.log('-> Test 3: Phân trang Page 1:', clean(page1));
console.log('           Phân trang Page 2:', clean(page2));
assert.deepStrictEqual(clean(page1).map(r => r.id), [1, 2]);
assert.deepStrictEqual(clean(page2).map(r => r.id), [3, 4]);
console.log('   ✓ Test 3 đạt chuẩn (Phân trang LIMIT/OFFSET chính xác)!');

// Test 4: Keyset Pagination (Cursor Seek) thay thế OFFSET
// Lấy trang tiếp theo sau phần tử cuối của Page 1 (last_seen_id = 2)
const lastSeenId = page1[page1.length - 1].id;
const keysetPage2 = db.prepare(`
    SELECT id, name
    FROM products
    WHERE id > ?
    ORDER BY id ASC
    LIMIT 2
`).all(lastSeenId);

console.log('-> Test 4: Keyset Pagination:', clean(keysetPage2));
assert.deepStrictEqual(clean(keysetPage2), clean(page2));
console.log('   ✓ Test 4 đạt chuẩn (Keyset Pagination trả về kết quả đồng nhất với OFFSET)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ SẮP XẾP & PHÂN TRANG HOÀN TẤT XUẤT SẮC! ===');
