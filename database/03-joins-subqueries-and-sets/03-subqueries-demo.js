/**
 * 03-subqueries-demo.js
 * Minh họa kiểm chứng thực tế: Scalar Subqueries, Correlated Subqueries và EXISTS/NOT EXISTS
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SUBQUERIES, CORRELATED QUERIES & EXISTS ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL
    );

    CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        dept_id INTEGER,
        salary REAL NOT NULL
    );

    INSERT INTO departments VALUES (1, 'Engineering'), (2, 'HR'), (3, 'Finance');

    INSERT INTO employees VALUES
    (101, 'Alice', 1, 95000.0),
    (102, 'Bob', 1, 80000.0),
    (103, 'Charlie', 2, 60000.0),
    (104, 'David', 2, 70000.0),
    (105, 'Eve', NULL, 120000.0);
`);

// Test 1: Scalar Subquery - Lấy nhân viên có lương cao hơn lương trung bình công ty
// Lương TB = (95000 + 80000 + 60000 + 70000 + 120000) / 5 = 425000 / 5 = 85000
const scalarRes = db.prepare(`
    SELECT name, salary FROM employees
    WHERE salary > (SELECT AVG(salary) FROM employees)
    ORDER BY salary ASC
`).all();

console.log('-> Test 1: Lương > AVG toàn công ty (85000):', clean(scalarRes));
assert.deepStrictEqual(clean(scalarRes), [
    { name: 'Alice', salary: 95000.0 },
    { name: 'Eve', salary: 120000.0 }
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Correlated Subquery - Lấy nhân viên có lương cao nhất trong phòng ban của họ
const correlatedRes = db.prepare(`
    SELECT e.name, e.dept_id, e.salary
    FROM employees e
    WHERE e.dept_id IS NOT NULL AND e.salary >= (
        SELECT MAX(e2.salary)
        FROM employees e2
        WHERE e2.dept_id = e.dept_id
    )
    ORDER BY e.dept_id ASC
`).all();

console.log('-> Test 2: Lương cao nhất theo từng phòng ban:', clean(correlatedRes));
assert.deepStrictEqual(clean(correlatedRes), [
    { name: 'Alice', dept_id: 1, salary: 95000.0 },  // Engineering max
    { name: 'David', dept_id: 2, salary: 70000.0 }   // HR max
]);
console.log('   ✓ Test 2 đạt chuẩn (Correlated subquery tính toán chính xác theo từng dòng ngoài)!');

// Test 3: EXISTS và NOT EXISTS
// Tìm các phòng ban KHÔNG có nhân viên nào (Phòng Finance dept_id = 3)
const notExistsRes = db.prepare(`
    SELECT d.dept_name
    FROM departments d
    WHERE NOT EXISTS (
        SELECT 1 FROM employees e
        WHERE e.dept_id = d.dept_id
    )
`).all();

console.log('-> Test 3: NOT EXISTS (Phòng ban không có nhân sự):', clean(notExistsRes));
assert.deepStrictEqual(clean(notExistsRes), [
    { dept_name: 'Finance' }
]);
console.log('   ✓ Test 3 đạt chuẩn (NOT EXISTS phát hiện chính xác phòng Finance rỗng)!');

// Test 4: Scalar Subquery trả về nhiều hơn 1 cột trong ngữ cảnh vô hướng sẽ bị chặn
assert.throws(() => {
    // Ngữ cảnh vô hướng (Scalar) bắt buộc chỉ trả về đúng 1 cột
    db.prepare('SELECT (SELECT name, salary FROM employees LIMIT 1)').all();
}, /sub-select returns 2 columns/i);
console.log('   ✓ Test 4 đạt chuẩn (Chặn đứng lỗi khi Scalar subquery trả về nhiều cột)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ SUBQUERIES HOÀN TẤT XUẤT SẮC! ===');
