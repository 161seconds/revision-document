/**
 * 01-select-demo.js
 * Minh họa kiểm chứng thực tế: SELECT, DISTINCT, Aliasing và xử lý NULL trong DISTINCT
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite (Object: null prototype -> Plain Object)
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SELECT, DISTINCT & ALIASING ENGINE ===');

const db = new DatabaseSync(':memory:');

// 1. Tạo bảng và chèn dữ liệu kiểm thử
db.exec(`
    CREATE TABLE employees (
        id INTEGER PRIMARY KEY,
        first_name TEXT NOT NULL,
        department TEXT NOT NULL,
        salary INTEGER NOT NULL,
        manager_id INTEGER
    );

    INSERT INTO employees (id, first_name, department, salary, manager_id) VALUES
    (1, 'Alice', 'Engineering', 90000, NULL),
    (2, 'Bob', 'Marketing', 75000, 1),
    (3, 'Charlie', 'Engineering', 95000, 1),
    (4, 'David', 'Engineering', 90000, 1),
    (5, 'Eve', 'Marketing', 75000, 2),
    (6, 'Frank', 'HR', 60000, NULL);
`);

// Test 1: SELECT với bí danh cột (Column Aliasing)
const queryAliases = db.prepare(`
    SELECT first_name AS emp_name, salary * 12 AS annual_comp
    FROM employees
    WHERE department = 'HR'
`).all();

console.log('-> Test 1: Column Aliasing:', queryAliases);
assert.deepStrictEqual(clean(queryAliases), [
    { emp_name: 'Frank', annual_comp: 720000 }
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: SELECT DISTINCT trên 1 cột duy nhất
const distinctDepts = db.prepare(`
    SELECT DISTINCT department
    FROM employees
    ORDER BY department ASC
`).all();

console.log('-> Test 2: DISTINCT trên 1 cột:', distinctDepts);
assert.deepStrictEqual(clean(distinctDepts), [
    { department: 'Engineering' },
    { department: 'HR' },
    { department: 'Marketing' }
]);
console.log('   ✓ Test 2 đạt chuẩn (3 phòng ban duy nhất)!');

// Test 3: SELECT DISTINCT trên tổ hợp đa cột (department + salary)
// (Engineering, 90000) xuất hiện ở cả Alice và David -> chỉ trả về 1 dòng
const distinctPairs = db.prepare(`
    SELECT DISTINCT department, salary
    FROM employees
    WHERE department = 'Engineering'
    ORDER BY salary ASC
`).all();

console.log('-> Test 3: DISTINCT trên đa cột (department, salary):', distinctPairs);
assert.deepStrictEqual(clean(distinctPairs), [
    { department: 'Engineering', salary: 90000 },
    { department: 'Engineering', salary: 95000 }
]);
console.log('   ✓ Test 3 đạt chuẩn (Khử trùng lặp tổ hợp chính xác)!');

// Test 4: Cơ chế gộp nhiều giá trị NULL thành 1 giá trị đại diện duy nhất trong DISTINCT
const distinctManagers = db.prepare(`
    SELECT DISTINCT manager_id
    FROM employees
    ORDER BY manager_id ASC
`).all();

console.log('-> Test 4: DISTINCT với giá trị NULL:', distinctManagers);
// Trong 6 nhân viên, có 2 người có manager_id là NULL -> DISTINCT chỉ trả về 1 dòng { manager_id: null }
assert.strictEqual(distinctManagers.filter(r => r.manager_id === null).length, 1);
assert.strictEqual(distinctManagers.length, 3); // null, 1, 2
console.log('   ✓ Test 4 đạt chuẩn (Nhiều giá trị NULL được gộp thành 1 dòng duy nhất)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ SELECT & DISTINCT HOÀN TẤT XUẤT SẮC! ===');
