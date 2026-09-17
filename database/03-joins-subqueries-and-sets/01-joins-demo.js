/**
 * 01-joins-demo.js
 * Minh họa kiểm chứng thực tế: INNER, LEFT, SELF JOIN và bẫy lọc WHERE trong LEFT JOIN
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SQL JOINS & JOIN PREDICATE PLACEMENT ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL
    );

    CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        emp_name TEXT NOT NULL,
        dept_id INTEGER,
        manager_id INTEGER
    );

    CREATE TABLE projects (
        project_id INTEGER PRIMARY KEY,
        emp_id INTEGER,
        status TEXT NOT NULL
    );

    INSERT INTO departments VALUES (10, 'IT'), (20, 'HR'), (30, 'Marketing');
    INSERT INTO employees VALUES
    (1, 'Alice', 10, NULL),     -- Sếp tổng IT
    (2, 'Bob', 10, 1),          -- Nhân viên báo cáo Alice
    (3, 'Charlie', NULL, 1);    -- Nhân viên chưa gán phòng ban

    INSERT INTO projects VALUES
    (101, 1, 'Completed'),
    (102, 2, 'Pending');
`);

// Test 1: INNER JOIN vs LEFT JOIN
const innerRes = db.prepare(`
    SELECT e.emp_name, d.dept_name
    FROM employees e
    INNER JOIN departments d ON e.dept_id = d.dept_id
    ORDER BY e.emp_id ASC
`).all();

console.log('-> Test 1a: INNER JOIN:', clean(innerRes));
assert.strictEqual(innerRes.length, 2); // Charlie bị loại vì dept_id là NULL

const leftRes = db.prepare(`
    SELECT e.emp_name, COALESCE(d.dept_name, 'Unassigned') AS dept_name
    FROM employees e
    LEFT JOIN departments d ON e.dept_id = d.dept_id
    ORDER BY e.emp_id ASC
`).all();

console.log('-> Test 1b: LEFT JOIN:', clean(leftRes));
assert.strictEqual(leftRes.length, 3); // Cả Charlie được giữ lại
assert.strictEqual(leftRes[2].dept_name, 'Unassigned');
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: SELF JOIN (Mô hình cây phân cấp nhân sự)
const selfRes = db.prepare(`
    SELECT 
        e.emp_name AS employee,
        COALESCE(m.emp_name, 'TOP_BOSS') AS manager
    FROM employees e
    LEFT JOIN employees m ON e.manager_id = m.emp_id
    ORDER BY e.emp_id ASC
`).all();

console.log('-> Test 2: SELF JOIN:', clean(selfRes));
assert.deepStrictEqual(clean(selfRes), [
    { employee: 'Alice', manager: 'TOP_BOSS' },
    { employee: 'Bob', manager: 'Alice' },
    { employee: 'Charlie', manager: 'Alice' }
]);
console.log('   ✓ Test 2 đạt chuẩn!');

// Test 3: Bẫy kinh điển - Điều kiện lọc đặt ở ON vs đặt ở WHERE trong LEFT JOIN
// Lọc ở ON: Bảo toàn toàn bộ nhân viên, ai không có project 'Completed' thì nhận null
const filterInOn = db.prepare(`
    SELECT e.emp_name, p.status
    FROM employees e
    LEFT JOIN projects p ON e.emp_id = p.emp_id AND p.status = 'Completed'
    ORDER BY e.emp_id ASC
`).all();

console.log('-> Test 3a: Lọc ở ON (Bảo toàn 3 nhân viên):', clean(filterInOn));
assert.strictEqual(filterInOn.length, 3);
assert.deepStrictEqual(clean(filterInOn), [
    { emp_name: 'Alice', status: 'Completed' },
    { emp_name: 'Bob', status: null },
    { emp_name: 'Charlie', status: null }
]);

// Lọc ở WHERE: Biến LEFT JOIN thành INNER JOIN, loại bỏ Bob và Charlie!
const filterInWhere = db.prepare(`
    SELECT e.emp_name, p.status
    FROM employees e
    LEFT JOIN projects p ON e.emp_id = p.emp_id
    WHERE p.status = 'Completed'
`).all();

console.log('-> Test 3b: Lọc ở WHERE (Bị ép thành INNER JOIN):', clean(filterInWhere));
assert.strictEqual(filterInWhere.length, 1);
assert.deepStrictEqual(clean(filterInWhere), [
    { emp_name: 'Alice', status: 'Completed' }
]);
console.log('   ✓ Test 3 đạt chuẩn (Chứng minh bẫy phá vỡ LEFT JOIN bởi mệnh đề WHERE)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ SQL JOINS HOÀN TẤT XUẤT SẮC! ===');
