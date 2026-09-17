/**
 * 01-crud-demo.js
 * Minh họa kiểm chứng thực tế: INSERT, INSERT INTO SELECT, UPDATE, DELETE và cơ chế đếm tự tăng
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: INSERT, UPDATE, DELETE & AUTO-INCREMENT BEHAVIOR ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE accounts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        balance REAL NOT NULL,
        status TEXT NOT NULL DEFAULT 'Active'
    );

    CREATE TABLE accounts_archive (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        balance REAL NOT NULL
    );
`);

// Test 1: Bulk INSERT INTO
db.exec(`
    INSERT INTO accounts (username, balance) VALUES
    ('alice', 1000.0),
    ('bob', 2500.0),
    ('charlie', 50.0);
`);

const inserted = db.prepare('SELECT id, username, balance FROM accounts ORDER BY id ASC').all();
console.log('-> Test 1: Bulk Insert:', clean(inserted));
assert.strictEqual(inserted.length, 3);
assert.strictEqual(inserted[2].id, 3);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: UPDATE có điều kiện WHERE
db.exec(`
    UPDATE accounts
    SET balance = balance + 500.0, status = 'VIP'
    WHERE balance >= 2000.0;
`);

const updatedBob = db.prepare("SELECT username, balance, status FROM accounts WHERE username = 'bob'").get();
console.log('-> Test 2: UPDATE có WHERE:', { ...updatedBob });
assert.deepStrictEqual({ ...updatedBob }, {
    username: 'bob',
    balance: 3000.0,
    status: 'VIP'
});
console.log('   ✓ Test 2 đạt chuẩn!');

// Test 3: INSERT INTO ... SELECT (Sao chép dữ liệu sang bảng lưu trữ)
db.exec(`
    INSERT INTO accounts_archive (id, username, balance)
    SELECT id, username, balance FROM accounts WHERE balance < 100.0;
`);

const archived = db.prepare('SELECT * FROM accounts_archive').all();
console.log('-> Test 3: INSERT INTO ... SELECT:', clean(archived));
assert.deepStrictEqual(clean(archived), [
    { id: 3, username: 'charlie', balance: 50.0 }
]);
console.log('   ✓ Test 3 đạt chuẩn!');

// Test 4: DELETE có WHERE
db.exec("DELETE FROM accounts WHERE username = 'charlie';");
const remaining = db.prepare('SELECT id, username FROM accounts ORDER BY id ASC').all();
console.log('-> Test 4: DELETE có điều kiện:', clean(remaining));
assert.strictEqual(remaining.length, 2);
console.log('   ✓ Test 4 đạt chuẩn!');

// Test 5: Xác thực cơ chế Auto-Increment sau khi xóa bản ghi
// Bản ghi Charlie có id=3 đã bị xóa. Khi chèn bản ghi mới 'david', ID phải là 4 (không tái sử dụng id=3)
db.exec("INSERT INTO accounts (username, balance) VALUES ('david', 1500.0);");
const david = db.prepare("SELECT id, username FROM accounts WHERE username = 'david'").get();
console.log('-> Test 5: Auto-Increment sau DELETE:', { ...david });
assert.strictEqual(david.id, 4);
console.log('   ✓ Test 5 đạt chuẩn (ID tiếp tục tăng lên 4, không tái chế id đã xóa)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ DML HOÀN TẤT XUẤT SẮC! ===');
