/**
 * 04-views-demo.js
 * Minh họa kiểm chứng thực tế: Khung nhìn dữ liệu (CREATE VIEW, Data Masking, Nối bảng ảo và DROP VIEW)
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SQL VIEWS & DATA MASKING ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE raw_users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL,
        is_active INTEGER NOT NULL
    );

    CREATE TABLE departments (
        dept_id INTEGER PRIMARY KEY,
        dept_name TEXT NOT NULL
    );

    CREATE TABLE employee_departments (
        user_id INTEGER PRIMARY KEY,
        dept_id INTEGER NOT NULL
    );

    INSERT INTO raw_users VALUES
    (1, 'john_doe', 'john@test.com', '$2b$12$securehash1', 'Engineer', 1),
    (2, 'sarah_connor', 'sarah@test.com', '$2b$12$securehash2', 'Manager', 1),
    (3, 'spammer_bot', 'spam@bad.net', '$2b$12$badhash3', 'Guest', 0);

    INSERT INTO departments VALUES (10, 'DevOps'), (20, 'Security');
    INSERT INTO employee_departments VALUES (1, 10), (2, 20);
`);

// Test 1: Tạo View che giấu cột nhạy cảm (Data Masking View)
db.exec(`
    CREATE VIEW v_active_users AS
    SELECT id, username, email, role
    FROM raw_users
    WHERE is_active = 1;
`);

const publicUsers = db.prepare('SELECT * FROM v_active_users ORDER BY id ASC').all();
console.log('-> Test 1: Public View (Không có password_hash):', clean(publicUsers));
assert.strictEqual(publicUsers.length, 2); // spammer_bot bị loại bỏ
assert.ok(!('password_hash' in publicUsers[0]));
assert.ok('username' in publicUsers[0]);
console.log('   ✓ Test 1 đạt chuẩn (Che giấu dữ liệu nhạy cảm thành công)!');

// Test 2: Tạo View đóng gói phép JOIN phức tạp
db.exec(`
    CREATE VIEW v_staff_details AS
    SELECT 
        u.id, u.username, u.role, d.dept_name
    FROM v_active_users u
    INNER JOIN employee_departments ed ON u.id = ed.user_id
    INNER JOIN departments d ON ed.dept_id = d.dept_id;
`);

const staffDetails = db.prepare('SELECT username, dept_name FROM v_staff_details WHERE dept_name = ?').all('DevOps');
console.log('-> Test 2: Truy vấn qua View đóng gói JOIN:', clean(staffDetails));
assert.deepStrictEqual(clean(staffDetails), [
    { username: 'john_doe', dept_name: 'DevOps' }
]);
console.log('   ✓ Test 2 đạt chuẩn (Đóng gói quan hệ phức tạp thành công)!');

// Test 3: DROP VIEW
db.exec('DROP VIEW IF EXISTS v_staff_details;');
assert.throws(() => {
    db.prepare('SELECT * FROM v_staff_details').all();
}, /no such table/i);
console.log('   ✓ Test 3 đạt chuẩn (Xóa View thành công)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ KHUNG NHÌN HOÀN TẤT XUẤT SẮC! ===');
