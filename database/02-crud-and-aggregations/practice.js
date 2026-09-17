/**
 * practice.js - Module 02: DML, CRUD, NULL Handling & Aggregations
 * Bộ 5 thử thách kiểm thử tự động zero-dependency qua node:sqlite
 * Chạy bằng lệnh: node database/02-crud-and-aggregations/practice.js
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== BẮT ĐẦU BÀI THỰC HÀNH TỔNG HỢP: MODULE 02 - CRUD & AGGREGATIONS ===');

const db = new DatabaseSync(':memory:');

// Khởi tạo Schema môi trường kiểm thử
db.exec(`
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        dept TEXT NOT NULL,
        salary REAL NOT NULL,
        bonus REAL,
        status TEXT NOT NULL DEFAULT 'Active'
    );

    INSERT INTO employees (name, dept, salary, bonus, status) VALUES
    ('Alice', 'IT', 90000.0, 10000.0, 'Active'),
    ('Bob', 'IT', 85000.0, NULL, 'Active'),
    ('Charlie', 'Sales', 60000.0, 15000.0, 'Active'),
    ('David', 'Sales', 55000.0, NULL, 'Suspended'),
    ('Eve', 'HR', 70000.0, 5000.0, 'Active'),
    ('Frank', 'HR', 65000.0, NULL, 'Active'),
    ('Grace', 'IT', 95000.0, 12000.0, 'Active');
`);

// -------------------------------------------------------------
// Thử thách 1: Data Mutation Pipeline (INSERT, UPDATE, DELETE)
// -------------------------------------------------------------
console.log('-> Thử thách 1: Thao tác DML (Chèn, Cập nhật có điều kiện, Xóa)...');
// 1. Chèn nhân viên mới
db.exec("INSERT INTO employees (name, dept, salary, bonus) VALUES ('Hank', 'IT', 80000.0, 4000.0);");
// 2. Tăng 10% lương cho nhân viên Active thuộc phòng IT có salary < 90000
db.exec("UPDATE employees SET salary = ROUND(salary * 1.10, 2) WHERE dept = 'IT' AND status = 'Active' AND salary < 90000.0;");
// 3. Xóa nhân viên bị Suspended
db.exec("DELETE FROM employees WHERE status = 'Suspended';");

const bobUpdated = db.prepare("SELECT salary FROM employees WHERE name = 'Bob'").get();
assert.strictEqual(Math.round(bobUpdated.salary), 93500);

const suspendedCount = db.prepare("SELECT COUNT(*) AS c FROM employees WHERE status = 'Suspended'").get();
assert.strictEqual(suspendedCount.c, 0);
console.log('   ✓ Thử thách 1 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 2: Safe NULL Compensation & Zero-Division Defense
// -------------------------------------------------------------
console.log('-> Thử thách 2: Xử lý an toàn giá trị NULL với COALESCE và NULLIF...');
// Tính tổng thu nhập (salary + bonus hoặc 0 nếu bonus là null) và tỷ lệ bonus / salary (nếu bonus là null hoặc 0 thì trả về null)
const incomeReport = db.prepare(`
    SELECT 
        name,
        salary + COALESCE(bonus, 0.0) AS total_income,
        ROUND((COALESCE(bonus, 0.0) / NULLIF(salary, 0.0)) * 100.0, 2) AS bonus_pct
    FROM employees
    WHERE name IN ('Alice', 'Bob')
    ORDER BY name ASC
`).all();

assert.deepStrictEqual(clean(incomeReport), [
    { name: 'Alice', total_income: 100000.0, bonus_pct: 11.11 }, // 10000 / 90000 = 11.11%
    { name: 'Bob', total_income: 93500.0, bonus_pct: 0.0 }       // bonus null -> 0 -> 0%
]);
console.log('   ✓ Thử thách 2 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 3: Granular Count & Aggregate Matrix
// -------------------------------------------------------------
console.log('-> Thử thách 3: Ma trận so sánh COUNT(*), COUNT(col), COUNT(DISTINCT)...');
const matrix = db.prepare(`
    SELECT 
        COUNT(*) AS total_emps,
        COUNT(bonus) AS emps_with_bonus,
        COUNT(DISTINCT dept) AS distinct_depts,
        SUM(salary) AS total_payroll
    FROM employees
`).get();

assert.deepStrictEqual({ ...matrix }, {
    total_emps: 7,         // Alice, Bob, Charlie, Eve, Frank, Grace, Hank
    emps_with_bonus: 5,    // Alice, Charlie, Eve, Grace, Hank
    distinct_depts: 3,     // IT, Sales, HR
    total_payroll: 561500.0
});
console.log('   ✓ Thử thách 3 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 4: Multi-Column Aggregation Pipeline
// -------------------------------------------------------------
console.log('-> Thử thách 4: Gom nhóm đa chiều và tính toán thống kê...');
const deptStats = db.prepare(`
    SELECT 
        dept,
        COUNT(*) AS head_count,
        ROUND(AVG(salary), 2) AS avg_salary,
        MAX(salary) AS max_salary,
        MIN(salary) AS min_salary
    FROM employees
    GROUP BY dept
    ORDER BY dept ASC
`).all();

assert.deepStrictEqual(clean(deptStats), [
    { dept: 'HR', head_count: 2, avg_salary: 67500.0, max_salary: 70000.0, min_salary: 65000.0 },
    { dept: 'IT', head_count: 4, avg_salary: 91625.0, max_salary: 95000.0, min_salary: 88000.0 },
    { dept: 'Sales', head_count: 1, avg_salary: 60000.0, max_salary: 60000.0, min_salary: 60000.0 }
]);
console.log('   ✓ Thử thách 4 hoàn thành xuất sắc!');

// -------------------------------------------------------------
// Thử thách 5: Dual-Stage Filtering (WHERE row-filter + HAVING group-filter)
// -------------------------------------------------------------
console.log('-> Thử thách 5: Lọc 2 tầng kết hợp WHERE và HAVING...');
// Yêu cầu: Tìm các phòng ban có từ 2 nhân viên Active trở lên VÀ quỹ lương (SUM salary) vượt quá 130.000
const largeDepts = db.prepare(`
    SELECT 
        dept,
        COUNT(*) AS active_count,
        SUM(salary) AS dept_payroll
    FROM employees
    WHERE status = 'Active'
    GROUP BY dept
    HAVING COUNT(*) >= 2 AND SUM(salary) > 130000.0
    ORDER BY dept_payroll DESC
`).all();

assert.deepStrictEqual(clean(largeDepts), [
    { dept: 'IT', active_count: 4, dept_payroll: 366500.0 },
    { dept: 'HR', active_count: 2, dept_payroll: 135000.0 }
]);
console.log('   ✓ Thử thách 5 hoàn thành xuất sắc!');

console.log('\n=======================================================');
console.log('-> KẾT QUẢ: 5/5 THỬ THÁCH MODULE 02 ĐÃ VƯỢT QUA 100%!');
console.log('=======================================================');
