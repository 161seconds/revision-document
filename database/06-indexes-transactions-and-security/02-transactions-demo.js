/**
 * 02-transactions-demo.js
 * Minh họa kiểm chứng thực tế: ACID Transactions, COMMIT, ROLLBACK, SAVEPOINT và duy trì tính nhất quán
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: ACID TRANSACTIONS & SAVEPOINT ENGINE ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE bank_accounts (
        acc_id INTEGER PRIMARY KEY,
        owner TEXT NOT NULL,
        balance REAL NOT NULL CHECK (balance >= 0.0)
    );

    INSERT INTO bank_accounts VALUES (1, 'Alice', 1000.0), (2, 'Bob', 500.0);
`);

// Test 1: Giao dịch thành công (Atomicity & Consistency qua COMMIT)
// Chuyển 200.0 từ Alice sang Bob
db.exec('BEGIN TRANSACTION;');
db.exec('UPDATE bank_accounts SET balance = balance - 200.0 WHERE acc_id = 1;');
db.exec('UPDATE bank_accounts SET balance = balance + 200.0 WHERE acc_id = 2;');
db.exec('COMMIT;');

const accountsAfterTransfer = db.prepare('SELECT * FROM bank_accounts ORDER BY acc_id ASC').all();
console.log('-> Test 1: Chuyển khoản thành công:', clean(accountsAfterTransfer));
assert.deepStrictEqual(clean(accountsAfterTransfer), [
    { acc_id: 1, owner: 'Alice', balance: 800.0 },
    { acc_id: 2, owner: 'Bob', balance: 700.0 }
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Giao dịch thất bại và ROLLBACK toàn phần
// Cố gắng rút 5000.0 từ Alice (vi phạm CHECK balance >= 0)
db.exec('BEGIN TRANSACTION;');
let errorOccurred = false;
try {
    db.exec('UPDATE bank_accounts SET balance = balance - 5000.0 WHERE acc_id = 1;');
    db.exec('COMMIT;');
} catch (e) {
    errorOccurred = true;
    db.exec('ROLLBACK;'); // Phục hồi trạng thái cũ
}

assert.strictEqual(errorOccurred, true);
const accountsAfterRollback = db.prepare('SELECT * FROM bank_accounts ORDER BY acc_id ASC').all();
console.log('-> Test 2: Trạng thái sau ROLLBACK:', clean(accountsAfterRollback));
assert.deepStrictEqual(clean(accountsAfterRollback), [
    { acc_id: 1, owner: 'Alice', balance: 800.0 },
    { acc_id: 2, owner: 'Bob', balance: 700.0 }
]);
console.log('   ✓ Test 2 đạt chuẩn (Số dư Alice được bảo toàn 100% nhờ ROLLBACK)!');

// Test 3: SAVEPOINT & ROLLBACK Cục Bộ
db.exec('BEGIN TRANSACTION;');
// Bước 1: Alice nhận thêm thưởng 100.0
db.exec('UPDATE bank_accounts SET balance = balance + 100.0 WHERE acc_id = 1;');
db.exec('SAVEPOINT bonus_applied;');

// Bước 2: Thử trừ phí dịch vụ thất bại
let feeFailed = false;
try {
    db.exec('UPDATE bank_accounts SET balance = balance - 10000.0 WHERE acc_id = 1;');
} catch (e) {
    feeFailed = true;
    // Chỉ rollback về mốc sau khi đã cộng thưởng
    db.exec('ROLLBACK TO SAVEPOINT bonus_applied;');
}

assert.strictEqual(feeFailed, true);
db.exec('COMMIT;'); // Commit bước 1

const finalAlice = db.prepare('SELECT balance FROM bank_accounts WHERE acc_id = 1').get();
console.log('-> Test 3: Số dư Alice sau SAVEPOINT rollback:', { ...finalAlice });
assert.strictEqual(finalAlice.balance, 900.0); // 800 + 100
console.log('   ✓ Test 3 đạt chuẩn (SAVEPOINT phục hồi cục bộ chính xác)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ TRANSACTION HOÀN TẤT XUẤT SẮC! ===');
