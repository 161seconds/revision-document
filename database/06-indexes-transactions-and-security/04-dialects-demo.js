/**
 * 04-dialects-demo.js
 * Minh họa kiểm chứng thực tế: Thoát từ khóa dành riêng, kiểu dữ liệu JSON và trích xuất trường JSON
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: RESERVED KEYWORDS & JSON OPERATIONS ===');

const db = new DatabaseSync(':memory:');

// Test 1: Tạo bảng và cột sử dụng từ khóa dành riêng được thoát bằng dấu nháy kép ANSI
db.exec(`
    CREATE TABLE "order" (
        "id" INTEGER PRIMARY KEY,
        "user" TEXT NOT NULL,
        "desc" TEXT NOT NULL,
        "attributes" TEXT NOT NULL
    );

    INSERT INTO "order" ("id", "user", "desc", "attributes") VALUES
    (1, 'alice', 'MacBook Pro', '{"brand":"Apple","ram_gb":16,"in_stock":true}'),
    (2, 'bob', 'ThinkPad P1', '{"brand":"Lenovo","ram_gb":32,"in_stock":false}');
`);

const reservedCheck = db.prepare('SELECT "user", "desc" FROM "order" WHERE "id" = 1').get();
console.log('-> Test 1: Thoát từ khóa dành riêng "order" và "desc":', { ...reservedCheck });
assert.deepStrictEqual({ ...reservedCheck }, {
    user: 'alice',
    desc: 'MacBook Pro'
});
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Truy vấn trường JSON qua json_extract()
const jsonResults = db.prepare(`
    SELECT 
        "user",
        json_extract("attributes", '$.brand') AS brand,
        json_extract("attributes", '$.ram_gb') AS ram,
        json_extract("attributes", '$.in_stock') AS stock
    FROM "order"
    ORDER BY "id" ASC
`).all();

console.log('-> Test 2: Trích xuất trường JSON:', clean(jsonResults));
assert.deepStrictEqual(clean(jsonResults), [
    { user: 'alice', brand: 'Apple', ram: 16, stock: 1 },
    { user: 'bob', brand: 'Lenovo', ram: 32, stock: 0 }
]);
console.log('   ✓ Test 2 đạt chuẩn (Trích xuất thuộc tính JSON chính xác)!');

// Test 3: Lọc dữ liệu dựa trên thuộc tính bên trong JSON
const filteredJson = db.prepare(`
    SELECT "user"
    FROM "order"
    WHERE json_extract("attributes", '$.ram_gb') >= 32
`).all();

console.log('-> Test 3: Lọc điều kiện JSON ram_gb >= 32:', clean(filteredJson));
assert.deepStrictEqual(clean(filteredJson), [
    { user: 'bob' }
]);
console.log('   ✓ Test 3 đạt chuẩn (Lọc theo trường JSON thành công)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ DIALECTS & JSON HOÀN TẤT XUẤT SẮC! ===');
