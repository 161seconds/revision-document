/**
 * 02-constraints-demo.js
 * Minh họa kiểm chứng thực tế: Hệ thống ràng buộc toàn vẹn (NOT NULL, UNIQUE, CHECK, FOREIGN KEY CASCADE & RESTRICT)
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: DATA INTEGRITY CONSTRAINTS ===');

const db = new DatabaseSync(':memory:');

// Bắt buộc bật foreign key enforcement trong SQLite
db.exec('PRAGMA foreign_keys = ON;');

db.exec(`
    CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL UNIQUE
    );

    CREATE TABLE employees (
        emp_id INTEGER PRIMARY KEY,
        name TEXT NOT NULL,
        salary REAL NOT NULL CHECK (salary > 0.0),
        dept_id INTEGER NOT NULL,
        FOREIGN KEY (dept_id) REFERENCES departments (dept_id) ON DELETE CASCADE
    );

    INSERT INTO departments VALUES (1, 'Engineering'), (2, 'Sales');
    INSERT INTO employees VALUES (101, 'Alice', 95000.0, 1), (102, 'Bob', 80000.0, 1);
`);

// Test 1: Vi phạm ràng buộc NOT NULL
assert.throws(() => {
    db.prepare('INSERT INTO departments (dept_id, dept_name) VALUES (3, NULL)').run();
}, /NOT NULL constraint failed/i);
console.log('   ✓ Test 1 đạt chuẩn (Chặn đứng vi phạm NOT NULL)!');

// Test 2: Vi phạm ràng buộc UNIQUE
assert.throws(() => {
    db.prepare("INSERT INTO departments (dept_id, dept_name) VALUES (3, 'Engineering')").run();
}, /UNIQUE constraint failed/i);
console.log('   ✓ Test 2 đạt chuẩn (Chặn đứng vi phạm UNIQUE tên phòng ban)!');

// Test 3: Vi phạm ràng buộc CHECK (salary <= 0)
assert.throws(() => {
    db.prepare("INSERT INTO employees VALUES (103, 'Negative Salary', -500.0, 1)").run();
}, /CHECK constraint failed/i);
console.log('   ✓ Test 3 đạt chuẩn (Chặn đứng vi phạm CHECK lương âm)!');

// Test 4: Ràng buộc FOREIGN KEY - Thêm con trỏ tới cha không tồn tại (dept_id = 999)
assert.throws(() => {
    db.prepare("INSERT INTO employees VALUES (104, 'Ghost Dept', 60000.0, 999)").run();
}, /FOREIGN KEY constraint failed/i);
console.log('   ✓ Test 4 đạt chuẩn (Chặn đứng thêm khóa ngoại mồ côi)!');

// Test 5: FOREIGN KEY ON DELETE CASCADE
// Xóa phòng ban 1 (Engineering) -> Tự động xóa sạch nhân viên Alice và Bob trong bảng employees
db.exec('DELETE FROM departments WHERE dept_id = 1;');

const remainingEmployees = db.prepare('SELECT * FROM employees').all();
console.log('-> Test 5: Nhân viên còn lại sau CASCADE delete:', clean(remainingEmployees));
assert.strictEqual(remainingEmployees.length, 0);
console.log('   ✓ Test 5 đạt chuẩn (ON DELETE CASCADE tự động dọn dẹp bảng con)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ RÀNG BUỘC TOÀN VẸN HOÀN TẤT XUẤT SẮC! ===');
