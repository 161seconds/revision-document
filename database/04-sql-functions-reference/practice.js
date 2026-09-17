/**
 * practice.js - Module 04: Built-in SQL Functions & References
 * Bộ 5 thử thách kiểm thử tự động zero-dependency qua node:sqlite
 * Chạy bằng lệnh: node database/04-sql-functions-reference/practice.js
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 04 - SQL FUNCTIONS ===');

const db = new DatabaseSync(':memory:');

// Khởi tạo Schema môi trường kiểm thử
db.exec(`
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        raw_name TEXT NOT NULL,
        email TEXT NOT NULL,
        balance REAL NOT NULL,
        registered_at TEXT NOT NULL
    );

    CREATE TABLE department_payroll (
        emp_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        dept TEXT NOT NULL,
        salary REAL NOT NULL,
        hired_date TEXT NOT NULL
    );

    INSERT INTO users VALUES
    (1, '  alexander the great  ', 'alex.great@macedon.gov', 1450.854, '2026-01-10 08:30:00'),
    (2, 'julius caesar', 'julius.caesar@rome.senate.it', -320.40, '2026-02-15 14:00:00'),
    (3, '  cleopatra  ', 'cleo.queen@ptolemy.eg', 8900.559, '2026-03-01 09:15:00');

    INSERT INTO department_payroll VALUES
    (101, 'John', 'Tech', 90000.0, '2026-01-01'),
    (102, 'Sarah', 'Tech', 95000.0, '2026-02-01'),
    (103, 'Dave', 'Tech', 90000.0, '2026-03-01'),
    (104, 'Emma', 'HR', 65000.0, '2026-01-15'),
    (105, 'Liam', 'HR', 70000.0, '2026-02-20');
`);

// -------------------------------------------------------------
// Thử thách 1: Pipeline làm sạch và phân tích chuỗi
// -------------------------------------------------------------
console.log('-> Thử thách 1: Chuẩn hóa tên và bóc tách domain email...');
// Yêu cầu: TRIM và viết hoa tên, tách domain sau ký tự '@'
const stringReport = db.prepare(`
    SELECT 
        id,
        UPPER(TRIM(raw_name)) AS clean_name,
        SUBSTR(email, INSTR(email, '@') + 1) AS domain
    FROM users
    ORDER BY id ASC
`).all();

assert.deepStrictEqual(clean(stringReport), [
    { id: 1, clean_name: 'ALEXANDER THE GREAT', domain: 'macedon.gov' },
    { id: 2, clean_name: 'JULIUS CAESAR', domain: 'rome.senate.it' },
    { id: 3, clean_name: 'CLEOPATRA', domain: 'ptolemy.eg' }
]);
console.log('   ✓ Thử thách 1 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 2: Xử lý số học tài chính và làm tròn
// -------------------------------------------------------------
console.log('-> Thử thách 2: Tính toán làm tròn ROUND, CEIL, FLOOR, ABS...');
const mathReport = db.prepare(`
    SELECT 
        id,
        ROUND(balance, 2) AS rounded_bal,
        ABS(balance) AS abs_bal,
        CEIL(balance) AS ceil_bal,
        FLOOR(balance) AS floor_bal
    FROM users
    WHERE id = 2
`).get();

assert.deepStrictEqual({ ...mathReport }, {
    id: 2,
    rounded_bal: -320.4,
    abs_bal: 320.4,
    ceil_bal: -320,
    floor_bal: -321
});
console.log('   ✓ Thử thách 2 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 3: Tính toán khoảng cách ngày tháng (Temporal Math)
// -------------------------------------------------------------
console.log('-> Thử thách 3: Tính số ngày tài khoản đã hoạt động tới mốc 2026-04-01...');
const daysActive = db.prepare(`
    SELECT 
        id,
        CAST(julianday('2026-04-01') - julianday(date(registered_at)) AS INTEGER) AS active_days
    FROM users
    ORDER BY id ASC
`).all();

assert.deepStrictEqual(clean(daysActive), [
    { id: 1, active_days: 81 },  // Từ 2026-01-10 đến 2026-04-01 (21 + 28 + 31 + 1 = 81 ngày)
    { id: 2, active_days: 45 },  // Từ 2026-02-15 đến 2026-04-01 (13 + 31 + 1 = 45 ngày)
    { id: 3, active_days: 31 }   // Từ 2026-03-01 đến 2026-04-01 (31 ngày)
]);
console.log('   ✓ Thử thách 3 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 4: Xếp hạng phòng ban với DENSE_RANK()
// -------------------------------------------------------------
console.log('-> Thử thách 4: Xếp hạng lương nhân viên theo từng phòng ban bằng DENSE_RANK()...');
const rankedPayroll = db.prepare(`
    SELECT 
        dept, name, salary,
        DENSE_RANK() OVER (PARTITION BY dept ORDER BY salary DESC) AS rank_in_dept
    FROM department_payroll
    ORDER BY dept ASC, rank_in_dept ASC, name ASC
`).all();

assert.deepStrictEqual(clean(rankedPayroll), [
    { dept: 'HR', name: 'Liam', salary: 70000.0, rank_in_dept: 1 },
    { dept: 'HR', name: 'Emma', salary: 65000.0, rank_in_dept: 2 },
    { dept: 'Tech', name: 'Sarah', salary: 95000.0, rank_in_dept: 1 },
    { dept: 'Tech', name: 'Dave', salary: 90000.0, rank_in_dept: 2 },
    { dept: 'Tech', name: 'John', salary: 90000.0, rank_in_dept: 2 } // Đồng hạng nhì không bị nhảy cóc
]);
console.log('   ✓ Thử thách 4 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 5: Lũy kế Running Total & Phân tích chênh lệch LAG()
// -------------------------------------------------------------
console.log('-> Thử thách 5: Tính tổng quỹ lương lũy kế theo thời gian tuyển dụng...');
const runningPayroll = db.prepare(`
    SELECT 
        name, salary, hired_date,
        SUM(salary) OVER (ORDER BY hired_date ASC ROWS UNBOUNDED PRECEDING) AS cumulative_budget,
        salary - LAG(salary, 1, salary) OVER (ORDER BY hired_date ASC) AS salary_step
    FROM department_payroll
    ORDER BY hired_date ASC
`).all();

assert.deepStrictEqual(clean(runningPayroll), [
    { name: 'John', salary: 90000.0, hired_date: '2026-01-01', cumulative_budget: 90000.0, salary_step: 0.0 },
    { name: 'Emma', salary: 65000.0, hired_date: '2026-01-15', cumulative_budget: 155000.0, salary_step: -25000.0 },
    { name: 'Sarah', salary: 95000.0, hired_date: '2026-02-01', cumulative_budget: 250000.0, salary_step: 30000.0 },
    { name: 'Liam', salary: 70000.0, hired_date: '2026-02-20', cumulative_budget: 320000.0, salary_step: -25000.0 },
    { name: 'Dave', salary: 90000.0, hired_date: '2026-03-01', cumulative_budget: 410000.0, salary_step: 20000.0 }
]);
console.log('   ✓ Thử thách 5 hoàn thành xuất sắc!');

console.log('\n=======================================================');
console.log('-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 04 ĐÃ VƯỢT QUA 100%!');
console.log('=======================================================');
