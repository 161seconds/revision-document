/**
 * practice.js - Module 06: Indexing, Transactions, Security & Enterprise
 * Bộ 5 thử thách kiểm thử tự động zero-dependency qua node:sqlite
 * Chạy bằng lệnh: node database/06-indexes-transactions-and-security/practice.js
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 06 - ADVANCED ENTERPRISE ===');

const db = new DatabaseSync(':memory:');

// Khởi tạo Schema môi trường kiểm thử
db.exec(`
    CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        department TEXT NOT NULL,
        job_title TEXT NOT NULL,
        salary REAL NOT NULL,
        status TEXT NOT NULL
    );

    CREATE TABLE accounts (
        acc_id INTEGER PRIMARY KEY,
        holder TEXT NOT NULL,
        balance REAL NOT NULL CHECK (balance >= 0.0)
    );

    CREATE TABLE credentials (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        secret_pin TEXT NOT NULL
    );

    CREATE TABLE "transaction" (
        "id" INTEGER PRIMARY KEY,
        "type" TEXT NOT NULL,
        "payload" TEXT NOT NULL
    );

    CREATE INDEX idx_emp_dept_job ON employees (department, job_title);

    INSERT INTO employees VALUES
    (1, 'Engineering', 'Backend', 90000.0, 'Active'),
    (2, 'Engineering', 'Frontend', 85000.0, 'Active'),
    (3, 'HR', 'Recruiter', 65000.0, 'Active');

    INSERT INTO accounts VALUES (1, 'Alice', 1000.0), (2, 'Bob', 500.0);
    INSERT INTO credentials VALUES (1, 'admin', 'pass9999');
`);

// -------------------------------------------------------------
// Thử thách 1: B-Tree Index Seek Verification
// -------------------------------------------------------------
console.log('-> Thử thách 1: Xác thực kế hoạch thực thi Index Seek bằng EXPLAIN QUERY PLAN...');
const planSeek = db.prepare(`
    EXPLAIN QUERY PLAN
    SELECT * FROM employees WHERE department = 'Engineering' AND job_title = 'Backend';
`).all();

assert.ok(planSeek.some(step => step.detail.includes('SEARCH employees USING INDEX idx_emp_dept_job')));
console.log('   ✓ Thử thách 1 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 2: Leftmost Prefix Rule Violation Detection
// -------------------------------------------------------------
console.log('-> Thử thách 2: Phát hiện Full Scan khi vi phạm quy tắc tiền tố B-Tree...');
const planScan = db.prepare(`
    EXPLAIN QUERY PLAN
    SELECT * FROM employees WHERE job_title = 'Backend';
`).all();

assert.ok(planScan.some(step => step.detail.includes('SCAN employees')));
console.log('   ✓ Thử thách 2 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 3: ACID Transaction Rollback
// -------------------------------------------------------------
console.log('-> Thử thách 3: Khôi phục trạng thái hoàn toàn khi giao dịch chuyển khoản thất bại...');
db.exec('BEGIN TRANSACTION;');
let transferFailed = false;
try {
    // Thử trừ 2000 từ Bob (balance chỉ có 500 -> vi phạm CHECK balance >= 0)
    db.exec('UPDATE accounts SET balance = balance - 2000.0 WHERE acc_id = 2;');
    db.exec('UPDATE accounts SET balance = balance + 2000.0 WHERE acc_id = 1;');
    db.exec('COMMIT;');
} catch (e) {
    transferFailed = true;
    db.exec('ROLLBACK;');
}

assert.strictEqual(transferFailed, true);
const bobBalance = db.prepare('SELECT balance FROM accounts WHERE acc_id = 2').get();
assert.strictEqual(bobBalance.balance, 500.0); // Không bị trừ tiền
console.log('   ✓ Thử thách 3 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 4: SQL Injection Neutralization
// -------------------------------------------------------------
console.log('-> Thử thách 4: Vô hiệu hóa mã độc SQL Injection qua Parameterized Query...');
const attackPayload = "' OR '1'='1";
const dummyPin = 'arbitrary';

const stmt = db.prepare('SELECT * FROM credentials WHERE username = ? AND secret_pin = ?');
const authCheck = stmt.all(attackPayload, dummyPin);

// Phải trả về mảng rỗng (0 bản ghi)
assert.strictEqual(authCheck.length, 0);
console.log('   ✓ Thử thách 4 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 5: Reserved Keywords Escaping & JSON Inspection
// -------------------------------------------------------------
console.log('-> Thử thách 5: Thoát tên bảng dành riêng và lọc dữ liệu JSON...');
db.exec(`
    INSERT INTO "transaction" ("id", "type", "payload") VALUES
    (101, 'TRANSFER', '{"amount":250.0,"currency":"USD","verified":true}'),
    (102, 'WITHDRAW', '{"amount":50.0,"currency":"VND","verified":false}');
`);

const highValueTxs = db.prepare(`
    SELECT 
        "id", "type",
        json_extract("payload", '$.amount') AS amount,
        json_extract("payload", '$.currency') AS currency
    FROM "transaction"
    WHERE json_extract("payload", '$.amount') >= 100.0
`).all();

assert.deepStrictEqual(clean(highValueTxs), [
    { id: 101, type: 'TRANSFER', amount: 250.0, currency: 'USD' }
]);
console.log('   ✓ Thử thách 5 hoàn thành xuất sắc!');

console.log('\n=======================================================');
console.log('-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 06 ĐÃ VƯỢT QUA 100%!');
console.log('=======================================================');
