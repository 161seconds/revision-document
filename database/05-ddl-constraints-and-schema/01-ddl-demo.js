/**
 * 01-ddl-demo.js
 * Minh họa kiểm chứng thực tế: Quản trị bảng và cấu trúc DDL (CREATE TABLE, ALTER TABLE, RENAME, DROP)
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: DDL & SCHEMA MIGRATION ENGINE ===');

const db = new DatabaseSync(':memory:');

// Test 1: CREATE TABLE IF NOT EXISTS
db.exec(`
    CREATE TABLE IF NOT EXISTS audit_logs (
        id INTEGER PRIMARY KEY,
        action TEXT NOT NULL,
        created_at TEXT NOT NULL
    );

    INSERT INTO audit_logs VALUES (1, 'LOGIN', '2026-09-18 01:00:00');
`);

const initialRow = db.prepare('SELECT * FROM audit_logs').get();
console.log('-> Test 1: Khởi tạo bảng ban đầu:', { ...initialRow });
assert.strictEqual(initialRow.id, 1);
assert.strictEqual(initialRow.action, 'LOGIN');
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: ALTER TABLE ADD COLUMN với DEFAULT value
db.exec(`
    ALTER TABLE audit_logs ADD COLUMN ip_address TEXT DEFAULT '127.0.0.1';
    ALTER TABLE audit_logs ADD COLUMN severity INTEGER DEFAULT 1;
`);

const rowAfterAddCol = db.prepare('SELECT * FROM audit_logs WHERE id = 1').get();
console.log('-> Test 2: Thêm cột mới kèm DEFAULT:', { ...rowAfterAddCol });
assert.strictEqual(rowAfterAddCol.ip_address, '127.0.0.1');
assert.strictEqual(rowAfterAddCol.severity, 1);
console.log('   ✓ Test 2 đạt chuẩn (Cột mới tự động nhận giá trị DEFAULT)!');

// Test 3: ALTER TABLE RENAME COLUMN (Đổi tên cột action -> event_type)
db.exec('ALTER TABLE audit_logs RENAME COLUMN action TO event_type;');
const rowAfterRenameCol = db.prepare('SELECT event_type, ip_address FROM audit_logs WHERE id = 1').get();
console.log('-> Test 3: Đổi tên cột action -> event_type:', { ...rowAfterRenameCol });
assert.strictEqual(rowAfterRenameCol.event_type, 'LOGIN');
console.log('   ✓ Test 3 đạt chuẩn!');

// Test 4: ALTER TABLE RENAME TO (Đổi tên bảng audit_logs -> system_events)
db.exec('ALTER TABLE audit_logs RENAME TO system_events;');
const renamedTableCheck = db.prepare('SELECT event_type FROM system_events WHERE id = 1').get();
console.log('-> Test 4: Đổi tên bảng -> system_events:', { ...renamedTableCheck });
assert.strictEqual(renamedTableCheck.event_type, 'LOGIN');

// Truy cập bảng cũ audit_logs phải ném lỗi no such table
assert.throws(() => {
    db.prepare('SELECT * FROM audit_logs').all();
}, /no such table: audit_logs/i);
console.log('   ✓ Test 4 đạt chuẩn (Bảng cũ không còn tồn tại)!');

// Test 5: DROP TABLE IF EXISTS
db.exec('DROP TABLE IF EXISTS system_events;');
assert.throws(() => {
    db.prepare('SELECT * FROM system_events').all();
}, /no such table: system_events/i);
console.log('   ✓ Test 5 đạt chuẩn (DROP TABLE thành công)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ DDL HOÀN TẤT XUẤT SẮC! ===');
