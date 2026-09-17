/**
 * 02-where-demo.js
 * Minh họa kiểm chứng thực tế: Mệnh đề WHERE, AND, OR, NOT, Độ ưu tiên toán tử và logic Tam Trị
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: WHERE, AND, OR, NOT & OPERATOR PRECEDENCE ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        role TEXT NOT NULL,
        status TEXT NOT NULL,
        discount INTEGER
    );

    INSERT INTO users VALUES
    (1, 'super_admin', 'Admin', 'Banned', 20),
    (2, 'tech_lead', 'Manager', 'Active', 10),
    (3, 'dev_john', 'Developer', 'Active', 0),
    (4, 'guest_bob', 'Guest', 'Active', NULL);
`);

// Test 1: Lỗi kinh điển thiếu ngoặc () khi kết hợp AND và OR
// Biểu thức: role = 'Admin' OR role = 'Manager' AND status = 'Active'
// Tương đương: role = 'Admin' OR (role = 'Manager' AND status = 'Active')
const queryWithoutParens = db.prepare(`
    SELECT id, username, status FROM users
    WHERE role = 'Admin' OR role = 'Manager' AND status = 'Active'
    ORDER BY id ASC
`).all();

console.log('-> Test 1a: Không có ngoặc đơn (lấy cả Banned admin):', clean(queryWithoutParens));
assert.deepStrictEqual(clean(queryWithoutParens), [
    { id: 1, username: 'super_admin', status: 'Banned' },
    { id: 2, username: 'tech_lead', status: 'Active' }
]);

// Có ngoặc đơn: (role = 'Admin' OR role = 'Manager') AND status = 'Active'
const queryWithParens = db.prepare(`
    SELECT id, username, status FROM users
    WHERE (role = 'Admin' OR role = 'Manager') AND status = 'Active'
`).all();

console.log('-> Test 1b: Có ngoặc đơn (chỉ lấy Active):', clean(queryWithParens));
assert.deepStrictEqual(clean(queryWithParens), [
    { id: 2, username: 'tech_lead', status: 'Active' }
]);
console.log('   ✓ Test 1 đạt chuẩn (Chứng minh độ ưu tiên AND > OR)!');

// Test 2: Bẫy so sánh với NULL: '=' trả về rỗng, 'IS NULL' trả về đúng dòng
const queryEqNull = db.prepare(`SELECT * FROM users WHERE discount = NULL`).all();
assert.strictEqual(queryEqNull.length, 0); // Luôn rỗng vì trả về UNKNOWN

const queryIsNull = db.prepare(`SELECT username FROM users WHERE discount IS NULL`).all();
console.log('-> Test 2: WHERE discount IS NULL:', clean(queryIsNull));
assert.deepStrictEqual(clean(queryIsNull), [
    { username: 'guest_bob' }
]);
console.log('   ✓ Test 2 đạt chuẩn (So sánh NULL phải dùng IS NULL)!');

// Test 3: Logic tam trị với toán tử NOT: NOT (discount > 5)
// id=1: 20 > 5 (T) -> NOT -> F
// id=2: 10 > 5 (T) -> NOT -> F
// id=3: 0 > 5 (F) -> NOT -> T (ĐƯỢC CHỌN)
// id=4: NULL > 5 (UNKNOWN) -> NOT -> UNKNOWN (BỊ LOẠI)
const queryNot = db.prepare(`
    SELECT id, username, discount FROM users
    WHERE NOT (discount > 5)
`).all();

console.log('-> Test 3: NOT (discount > 5) loại trừ cả giá trị NULL:', clean(queryNot));
assert.deepStrictEqual(clean(queryNot), [
    { id: 3, username: 'dev_john', discount: 0 }
]);
console.log('   ✓ Test 3 đạt chuẩn (Chứng minh 3VL: NOT(UNKNOWN) = UNKNOWN)!');

// Test 4: Toán tử so sánh khác biệt: <> vs !=
const queryDiff = db.prepare(`
    SELECT username FROM users
    WHERE role <> 'Developer' AND status = 'Active'
    ORDER BY username ASC
`).all();

console.log('-> Test 4: Toán tử ANSI <>:', clean(queryDiff));
assert.deepStrictEqual(clean(queryDiff), [
    { username: 'guest_bob' },
    { username: 'tech_lead' }
]);
console.log('   ✓ Test 4 đạt chuẩn!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ WHERE & LOGICAL OPERATORS HOÀN TẤT XUẤT SẮC! ===');
