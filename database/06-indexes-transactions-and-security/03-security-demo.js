/**
 * 03-security-demo.js
 * Minh họa kiểm chứng thực tế: Tấn công SQL Injection và phòng thủ tuyệt đối bằng Parameterized Queries
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SQL INJECTION VULNERABILITY & PREPARED STATEMENTS ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE users (
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL,
        password_hash TEXT NOT NULL,
        is_admin INTEGER NOT NULL
    );

    INSERT INTO users VALUES
    (1, 'admin', 'vault_hash_pass_999', 1),
    (2, 'guest_user', 'simple_pass', 0);
`);

// Kịch bản tấn công: Hacker nhập payload vượt quyền
const maliciousInput = "admin' OR '1'='1";
const dummyPassword = 'wrong_password';

// Test 1: Mô phỏng lỗ hổng nối chuỗi trực tiếp (Vulnerable Code)
// Câu lệnh bị bẻ gãy: SELECT * FROM users WHERE username = 'admin' OR '1'='1' AND password_hash = 'wrong_password'
// Vì AND ưu tiên trước OR: username = 'admin' OR ('1'='1' AND password_hash = 'wrong_password')
// -> Trả về tài khoản admin ngay lập tức!
const vulnerableQuery = `SELECT * FROM users WHERE username = '${maliciousInput}' AND password_hash = '${dummyPassword}'`;
console.log('-> Test 1a: Câu lệnh bị tiêm mã độc:', vulnerableQuery);

const breachedUsers = db.prepare(vulnerableQuery).all();
console.log('-> Test 1b: Dữ liệu bị rò rỉ (Auth Bypass):', clean(breachedUsers));
assert.strictEqual(breachedUsers.length, 1);
assert.strictEqual(breachedUsers[0].username, 'admin');
console.log('   ⚠️ Test 1 xác nhận: Nối chuỗi bị hack thành công!');

// Test 2: Phòng thủ bằng Prepared Statement / Parameterized Query
const safeStatement = db.prepare(`
    SELECT * FROM users
    WHERE username = ? AND password_hash = ?
`);

// Nạp cùng một payload độc hại qua tham số ràng buộc (Binding Parameters)
const safeResult = safeStatement.all(maliciousInput, dummyPassword);
console.log('-> Test 2: Kết quả khi dùng Parameterized Query:', clean(safeResult));
assert.strictEqual(safeResult.length, 0);
console.log('   ✓ Test 2 đạt chuẩn: Miễn nhiễm 100% trước SQL Injection (0 bản ghi rò rỉ)!');

// Test 3: Phòng thủ sắp xếp động an toàn bằng Danh sách trắng (Whitelist Validation)
function safeSortQuery(userSortCol) {
    const allowedCols = new Set(['id', 'username']);
    const safeCol = allowedCols.has(userSortCol) ? userSortCol : 'id';
    return db.prepare(`SELECT id, username FROM users ORDER BY ${safeCol} ASC`).all();
}

// Thử truyền payload vào tham số sắp xếp: "username; DROP TABLE users;"
const maliciousSortInput = "username; DROP TABLE users;";
const sanitizedResult = safeSortQuery(maliciousSortInput);
console.log('-> Test 3: Kết quả sắp xếp Whitelist an toàn:', clean(sanitizedResult));
assert.strictEqual(sanitizedResult.length, 2);
console.log('   ✓ Test 3 đạt chuẩn (Bảo vệ thành công trước injection ở ORDER BY)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ BẢO MẬT SQL HOÀN TẤT XUẤT SẮC! ===');
