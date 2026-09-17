/**
 * 02-set-ops-demo.js
 * Minh họa kiểm chứng thực tế: UNION, UNION ALL, INTERSECT, EXCEPT và quy tắc kế thừa tên cột
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: UNION, UNION ALL, INTERSECT & EXCEPT ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE domestic_clients (
        client_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL
    );

    CREATE TABLE foreign_clients (
        client_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        city TEXT NOT NULL
    );

    INSERT INTO domestic_clients VALUES
    (1, 'Acme Corp', 'Hanoi'),
    (2, 'VinaTech', 'Da Nang'),
    (3, 'GlobalLogistics', 'Ho Chi Minh');

    INSERT INTO foreign_clients VALUES
    (10, 'Alpha Co', 'Singapore'),
    (11, 'GlobalLogistics', 'Ho Chi Minh'); -- Dòng trùng lặp chính xác name và city
`);

// Test 1: UNION (Khử trùng lặp bản ghi GlobalLogistics)
const unionRes = db.prepare(`
    SELECT name, city FROM domestic_clients
    UNION
    SELECT name, city FROM foreign_clients
    ORDER BY name ASC
`).all();

console.log('-> Test 1: UNION (Khử trùng lặp):', clean(unionRes));
assert.strictEqual(unionRes.length, 4); // 3 + 2 - 1 = 4
assert.deepStrictEqual(clean(unionRes), [
    { name: 'Acme Corp', city: 'Hanoi' },
    { name: 'Alpha Co', city: 'Singapore' },
    { name: 'GlobalLogistics', city: 'Ho Chi Minh' },
    { name: 'VinaTech', city: 'Da Nang' }
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: UNION ALL (Giữ nguyên toàn bộ các dòng)
const unionAllRes = db.prepare(`
    SELECT name, city FROM domestic_clients
    UNION ALL
    SELECT name, city FROM foreign_clients
`).all();

console.log('-> Test 2: UNION ALL (Số lượng dòng):', unionAllRes.length);
assert.strictEqual(unionAllRes.length, 5); // 3 + 2 = 5
console.log('   ✓ Test 2 đạt chuẩn (UNION ALL giữ nguyên vẹn 5 dòng)!');

// Test 3: INTERSECT (Giao điểm chung giữa 2 tập hợp)
const intersectRes = db.prepare(`
    SELECT name, city FROM domestic_clients
    INTERSECT
    SELECT name, city FROM foreign_clients
`).all();

console.log('-> Test 3: INTERSECT (Phần tử chung):', clean(intersectRes));
assert.deepStrictEqual(clean(intersectRes), [
    { name: 'GlobalLogistics', city: 'Ho Chi Minh' }
]);
console.log('   ✓ Test 3 đạt chuẩn!');

// Test 4: EXCEPT (Phần tử chỉ có ở domestic_clients mà không có ở foreign_clients)
const exceptRes = db.prepare(`
    SELECT name, city FROM domestic_clients
    EXCEPT
    SELECT name, city FROM foreign_clients
    ORDER BY name ASC
`).all();

console.log('-> Test 4: EXCEPT (Chỉ có ở domestic):', clean(exceptRes));
assert.deepStrictEqual(clean(exceptRes), [
    { name: 'Acme Corp', city: 'Hanoi' },
    { name: 'VinaTech', city: 'Da Nang' }
]);
console.log('   ✓ Test 4 đạt chuẩn!');

// Test 5: Tên cột được quyết định bởi câu lệnh SELECT đầu tiên
const aliasInheritance = db.prepare(`
    SELECT name AS ten_doi_tac FROM domestic_clients
    UNION ALL
    SELECT name AS company_name FROM foreign_clients
    LIMIT 1
`).get();

console.log('-> Test 5: Kế thừa bí danh từ SELECT đầu tiên:', { ...aliasInheritance });
assert.ok('ten_doi_tac' in aliasInheritance);
assert.ok(!('company_name' in aliasInheritance));
console.log('   ✓ Test 5 đạt chuẩn (Tên cột lấy từ SELECT 1)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ TOÁN TỬ TẬP HỢP HOÀN TẤT XUẤT SẮC! ===');
