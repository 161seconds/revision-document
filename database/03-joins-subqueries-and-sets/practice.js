/**
 * practice.js - Module 03: Joins, Set Operations & Subqueries
 * Bộ 5 thử thách kiểm thử tự động zero-dependency qua node:sqlite
 * Chạy bằng lệnh: node database/03-joins-subqueries-and-sets/practice.js
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 03 - JOINS, SETS & SUBQUERIES ===');

const db = new DatabaseSync(':memory:');

// Khởi tạo Schema môi trường kiểm thử
db.exec(`
    CREATE TABLE categories (
        cat_id INTEGER PRIMARY KEY,
        cat_name TEXT NOT NULL
    );

    CREATE TABLE products (
        prod_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        cat_id INTEGER,
        price REAL NOT NULL
    );

    CREATE TABLE staff (
        staff_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT NOT NULL,
        supervisor_id INTEGER
    );

    CREATE TABLE warehouse_hanoi (
        sku TEXT PRIMARY KEY,
        qty INTEGER NOT NULL
    );

    CREATE TABLE warehouse_danang (
        sku TEXT PRIMARY KEY,
        qty INTEGER NOT NULL
    );

    INSERT INTO categories VALUES (1, 'Computers'), (2, 'Audio'), (3, 'Accessories');

    INSERT INTO products VALUES
    (101, 'MacBook Pro', 1, 2000.0),
    (102, 'Dell XPS', 1, 1500.0),
    (103, 'AirPods Max', 2, 500.0),
    (104, 'Sony XM5', 2, 400.0),
    (105, 'Vintage Walkman', NULL, 150.0); -- Sản phẩm chưa gán danh mục

    INSERT INTO staff VALUES
    (1, 'Director John', 'Director', NULL),
    (2, 'Manager Sarah', 'Manager', 1),
    (3, 'Lead Dave', 'TeamLead', 2),
    (4, 'Dev Emma', 'Engineer', 3);

    INSERT INTO warehouse_hanoi VALUES
    ('SKU-A', 50), ('SKU-B', 100), ('SKU-C', 200);

    INSERT INTO warehouse_danang VALUES
    ('SKU-B', 100), ('SKU-C', 200), ('SKU-D', 80);
`);

// -------------------------------------------------------------
// Thử thách 1: Multi-Table Relational Join với bảo toàn dữ liệu rỗng
// -------------------------------------------------------------
console.log('-> Thử thách 1: Nối bảng quan hệ (LEFT JOIN) bảo toàn sản phẩm chưa gán danh mục...');
// Yêu cầu: Lấy tên sản phẩm, giá và tên danh mục (nếu chưa gán thì hiển thị 'Uncategorized'), sắp xếp theo prod_id ASC
const productList = db.prepare(`
    SELECT p.name, p.price, COALESCE(c.cat_name, 'Uncategorized') AS category
    FROM products p
    LEFT JOIN categories c ON p.cat_id = c.cat_id
    ORDER BY p.prod_id ASC
`).all();

assert.deepStrictEqual(clean(productList), [
    { name: 'MacBook Pro', price: 2000.0, category: 'Computers' },
    { name: 'Dell XPS', price: 1500.0, category: 'Computers' },
    { name: 'AirPods Max', price: 500.0, category: 'Audio' },
    { name: 'Sony XM5', price: 400.0, category: 'Audio' },
    { name: 'Vintage Walkman', price: 150.0, category: 'Uncategorized' }
]);
console.log('   ✓ Thử thách 1 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 2: Cây phân cấp nhân sự bằng SELF JOIN
// -------------------------------------------------------------
console.log('-> Thử thách 2: Xây dựng báo cáo nhân sự theo cấp bậc (SELF JOIN)...');
const hierarchy = db.prepare(`
    SELECT 
        s.name AS employee,
        s.role,
        COALESCE(sup.name, 'BOARD_OF_DIRECTORS') AS supervisor
    FROM staff s
    LEFT JOIN staff sup ON s.supervisor_id = sup.staff_id
    ORDER BY s.staff_id ASC
`).all();

assert.deepStrictEqual(clean(hierarchy), [
    { employee: 'Director John', role: 'Director', supervisor: 'BOARD_OF_DIRECTORS' },
    { employee: 'Manager Sarah', role: 'Manager', supervisor: 'Director John' },
    { employee: 'Lead Dave', role: 'TeamLead', supervisor: 'Manager Sarah' },
    { employee: 'Dev Emma', role: 'Engineer', supervisor: 'Lead Dave' }
]);
console.log('   ✓ Thử thách 2 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 3: Đại Số Tập Hợp (UNION ALL, INTERSECT, EXCEPT)
// -------------------------------------------------------------
console.log('-> Thử thách 3: Phân tích tồn kho liên kho với INTERSECT và EXCEPT...');
// 1. Tìm các SKU có mặt ở cả kho Hà Nội và kho Đà Nẵng (INTERSECT)
const commonSkus = db.prepare(`
    SELECT sku FROM warehouse_hanoi
    INTERSECT
    SELECT sku FROM warehouse_danang
    ORDER BY sku ASC
`).all();
assert.deepStrictEqual(clean(commonSkus), [{ sku: 'SKU-B' }, { sku: 'SKU-C' }]);

// 2. Tìm các SKU chỉ có độc quyền ở kho Hà Nội mà không có ở Đà Nẵng (EXCEPT)
const hanoiExclusive = db.prepare(`
    SELECT sku FROM warehouse_hanoi
    EXCEPT
    SELECT sku FROM warehouse_danang
`).all();
assert.deepStrictEqual(clean(hanoiExclusive), [{ sku: 'SKU-A' }]);
console.log('   ✓ Thử thách 3 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 4: Correlated Subquery & Ngắt Sớm EXISTS
// -------------------------------------------------------------
console.log('-> Thử thách 4: Tìm sản phẩm có giá cao hơn giá trung bình của danh mục...');
// Tính giá trung bình theo từng danh mục và chỉ lấy các sản phẩm vượt trội
const aboveAvgProducts = db.prepare(`
    SELECT p.name, p.price, p.cat_id
    FROM products p
    WHERE p.cat_id IS NOT NULL AND p.price > (
        SELECT AVG(p2.price)
        FROM products p2
        WHERE p2.cat_id = p.cat_id
    )
    ORDER BY p.price DESC
`).all();

// Computers AVG = (2000 + 1500) / 2 = 1750 -> MacBook Pro (2000) > 1750
// Audio AVG = (500 + 400) / 2 = 450 -> AirPods Max (500) > 450
assert.deepStrictEqual(clean(aboveAvgProducts), [
    { name: 'MacBook Pro', price: 2000.0, cat_id: 1 },
    { name: 'AirPods Max', price: 500.0, cat_id: 2 }
]);
console.log('   ✓ Thử thách 4 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 5: Dynamic Pivoting & CTAS Snapshot
// -------------------------------------------------------------
console.log('-> Thử thách 5: Xoay trục dữ liệu bằng CASE WHEN và tạo snapshot bằng CTAS...');
// Tạo bảng báo cáo doanh số danh mục theo các khoảng giá (Tier)
db.exec(`
    CREATE TABLE category_summary AS
    SELECT 
        c.cat_name,
        COUNT(p.prod_id) AS total_products,
        COUNT(CASE WHEN p.price >= 1000.0 THEN 1 END) AS high_end_count,
        COUNT(CASE WHEN p.price < 1000.0 THEN 1 END) AS mid_range_count
    FROM categories c
    LEFT JOIN products p ON c.cat_id = p.cat_id
    GROUP BY c.cat_id, c.cat_name;
`);

const summaryRows = db.prepare('SELECT * FROM category_summary ORDER BY total_products DESC, cat_name ASC').all();
assert.deepStrictEqual(clean(summaryRows), [
    { cat_name: 'Audio', total_products: 2, high_end_count: 0, mid_range_count: 2 },
    { cat_name: 'Computers', total_products: 2, high_end_count: 2, mid_range_count: 0 },
    { cat_name: 'Accessories', total_products: 0, high_end_count: 0, mid_range_count: 0 }
]);
console.log('   ✓ Thử thách 5 hoàn thành xuất sắc!');

console.log('\n=======================================================');
console.log('-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 03 ĐÃ VƯỢT QUA 100%!');
console.log('=======================================================');
