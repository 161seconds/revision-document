/**
 * practice.js - Module 05: DDL, Constraints & Schema Design
 * Bộ 5 thử thách kiểm thử tự động zero-dependency qua node:sqlite
 * Chạy bằng lệnh: node database/05-ddl-constraints-and-schema/practice.js
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 05 - DDL & CONSTRAINTS ===');

const db = new DatabaseSync(':memory:');
db.exec('PRAGMA foreign_keys = ON;');

// -------------------------------------------------------------
// Thử thách 1: Schema Migration Pipeline (CREATE TABLE & ALTER TABLE)
// -------------------------------------------------------------
console.log('-> Thử thách 1: Khởi tạo bảng và tiến hóa schema bằng ALTER TABLE...');
db.exec(`
    CREATE TABLE app_modules (
        module_id INTEGER PRIMARY KEY,
        module_name TEXT NOT NULL
    );

    INSERT INTO app_modules VALUES (1, 'Auth');

    ALTER TABLE app_modules ADD COLUMN is_enabled INTEGER NOT NULL DEFAULT 1;
    ALTER TABLE app_modules RENAME COLUMN module_name TO title;
`);

const moduleRow = db.prepare('SELECT * FROM app_modules WHERE module_id = 1').get();
assert.deepStrictEqual({ ...moduleRow }, {
    module_id: 1,
    title: 'Auth',
    is_enabled: 1
});
console.log('   ✓ Thử thách 1 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 2: Ràng buộc nghiệp vụ toàn vẹn miền (CHECK & UNIQUE)
// -------------------------------------------------------------
console.log('-> Thử thách 2: Thiết lập CHECK giá trị dương và UNIQUE mã code...');
db.exec(`
    CREATE TABLE pricing_plans (
        plan_id INTEGER PRIMARY KEY,
        plan_code TEXT NOT NULL UNIQUE,
        price_monthly REAL NOT NULL CHECK (price_monthly >= 0.0),
        discount_pct INTEGER NOT NULL CHECK (discount_pct BETWEEN 0 AND 100)
    );

    INSERT INTO pricing_plans VALUES (1, 'FREE', 0.0, 0);
`);

// Kiểm tra chặn vi phạm UNIQUE
assert.throws(() => {
    db.prepare("INSERT INTO pricing_plans VALUES (2, 'FREE', 10.0, 0)").run();
}, /UNIQUE constraint failed/i);

// Kiểm tra chặn vi phạm CHECK discount > 100
assert.throws(() => {
    db.prepare("INSERT INTO pricing_plans VALUES (3, 'PRO', 29.0, 150)").run();
}, /CHECK constraint failed/i);

console.log('   ✓ Thử thách 2 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 3: Khóa ngoại và hành vi CASCADE Dây Chuyền
// -------------------------------------------------------------
console.log('-> Thử thách 3: Toàn vẹn tham chiếu với ON DELETE CASCADE...');
db.exec(`
    CREATE TABLE authors (
        author_id INTEGER PRIMARY KEY,
        author_name TEXT NOT NULL
    );

    CREATE TABLE articles (
        article_id INTEGER PRIMARY KEY,
        title TEXT NOT NULL,
        author_id INTEGER NOT NULL,
        FOREIGN KEY (author_id) REFERENCES authors (author_id) ON DELETE CASCADE
    );

    INSERT INTO authors VALUES (10, 'Ernest Hemingway');
    INSERT INTO articles VALUES 
    (101, 'The Old Man and the Sea', 10),
    (102, 'For Whom the Bell Tolls', 10);
`);

// Xóa tác giả 10 -> 2 bài viết tự động bị xóa sạch
db.exec('DELETE FROM authors WHERE author_id = 10;');
const articlesLeft = db.prepare('SELECT COUNT(*) AS c FROM articles').get();
assert.strictEqual(articlesLeft.c, 0);
console.log('   ✓ Thử thách 3 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 4: Biến đếm AUTOINCREMENT và ngăn chặn tái sử dụng ID
// -------------------------------------------------------------
console.log('-> Thử thách 4: Xác thực cơ chế sinh mã khóa AUTOINCREMENT...');
db.exec(`
    CREATE TABLE invoice_numbers (
        inv_id INTEGER PRIMARY KEY AUTOINCREMENT,
        total REAL NOT NULL
    );

    INSERT INTO invoice_numbers (total) VALUES (100.0), (200.0);
`);

// Xóa hóa đơn 2
db.exec('DELETE FROM invoice_numbers WHERE inv_id = 2;');
// Chèn hóa đơn tiếp theo -> Bắt buộc inv_id = 3
db.exec('INSERT INTO invoice_numbers (total) VALUES (300.0);');

const lastInvoice = db.prepare('SELECT inv_id FROM invoice_numbers ORDER BY inv_id DESC LIMIT 1').get();
assert.strictEqual(lastInvoice.inv_id, 3);
console.log('   ✓ Thử thách 4 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 5: Khung nhìn bảo mật (Data Masking View)
// -------------------------------------------------------------
console.log('-> Thử thách 5: Tạo Khung nhìn trừu tượng hóa và che giấu dữ liệu...');
db.exec(`
    CREATE TABLE customer_records (
        id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        credit_card TEXT NOT NULL,
        loyalty_tier TEXT NOT NULL
    );

    INSERT INTO customer_records VALUES
    (1, 'John Smith', '4111-2222-3333-4444', 'VIP'),
    (2, 'Jane Doe', '5500-0000-0000-1234', 'Standard');

    CREATE VIEW v_safe_customers AS
    SELECT 
        id, 
        name, 
        'XXXX-XXXX-XXXX-' || SUBSTR(credit_card, -4) AS masked_card,
        loyalty_tier
    FROM customer_records;
`);

const safeList = db.prepare('SELECT * FROM v_safe_customers ORDER BY id ASC').all();
assert.deepStrictEqual(clean(safeList), [
    { id: 1, name: 'John Smith', masked_card: 'XXXX-XXXX-XXXX-4444', loyalty_tier: 'VIP' },
    { id: 2, name: 'Jane Doe', masked_card: 'XXXX-XXXX-XXXX-1234', loyalty_tier: 'Standard' }
]);
console.log('   ✓ Thử thách 5 hoàn thành xuất sắc!');

console.log('\n=======================================================');
console.log('-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 05 ĐÃ VƯỢT QUA 100%!');
console.log('=======================================================');
