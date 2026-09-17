/**
 * 03-sequence-demo.js
 * Minh họa kiểm chứng thực tế: Cơ chế AUTOINCREMENT, bảng sqlite_sequence và phòng tránh tái chế ID
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: AUTO-INCREMENT & SEQUENCE ENGINE ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE tickets (
        ticket_id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL
    );

    INSERT INTO tickets (title) VALUES ('Server Down'), ('Database Latency');
`);

// Test 1: Kiểm tra các ID được sinh ban đầu
const initialTickets = db.prepare('SELECT ticket_id, title FROM tickets ORDER BY ticket_id ASC').all();
console.log('-> Test 1: Vé ban đầu:', clean(initialTickets));
assert.deepStrictEqual(clean(initialTickets), [
    { ticket_id: 1, title: 'Server Down' },
    { ticket_id: 2, title: 'Database Latency' }
]);
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Xóa vé ticket_id = 2
db.exec('DELETE FROM tickets WHERE ticket_id = 2;');
const countAfterDelete = db.prepare('SELECT COUNT(*) AS c FROM tickets').get();
assert.strictEqual(countAfterDelete.c, 1);

// Test 3: Chèn vé mới - Cơ chế AUTOINCREMENT đảm bảo ID mới là 3, KHÔNG tái chế ID 2
db.exec("INSERT INTO tickets (title) VALUES ('Payment Gateway Error');");
const newTicket = db.prepare("SELECT ticket_id, title FROM tickets WHERE title = 'Payment Gateway Error'").get();
console.log('-> Test 3: Vé mới sau khi xóa ID 2:', { ...newTicket });
assert.strictEqual(newTicket.ticket_id, 3);
console.log('   ✓ Test 3 đạt chuẩn (Không tái sử dụng ID 2 đã xóa)!');

// Test 4: Truy vấn bảng hệ thống sqlite_sequence để xác thực giá trị seq lớn nhất
const seqCheck = db.prepare("SELECT name, seq FROM sqlite_sequence WHERE name = 'tickets'").get();
console.log('-> Test 4: Bảng hệ thống sqlite_sequence:', { ...seqCheck });
assert.strictEqual(seqCheck.name, 'tickets');
assert.strictEqual(seqCheck.seq, 3);
console.log('   ✓ Test 4 đạt chuẩn (Biến đếm sequence nội bộ ghi nhận seq = 3)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ AUTO-INCREMENT HOÀN TẤT XUẤT SẮC! ===');
