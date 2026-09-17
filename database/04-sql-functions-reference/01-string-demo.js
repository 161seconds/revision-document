/**
 * 01-string-demo.js
 * Minh họa kiểm chứng thực tế: Các hàm xử lý chuỗi trong SQL (TRIM, UPPER, LOWER, SUBSTR, INSTR, REPLACE, LENGTH)
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: SQL STRING FUNCTIONS ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE contacts (
        id INTEGER PRIMARY KEY,
        raw_name TEXT NOT NULL,
        email TEXT NOT NULL
    );

    INSERT INTO contacts VALUES
    (1, '   nguyen van an   ', 'an.nguyen@company.vn'),
    (2, 'le thi binh', 'binh.le@gmail.com');
`);

// Test 1: TRIM, UPPER, LOWER
const cleanNames = db.prepare(`
    SELECT 
        raw_name,
        TRIM(raw_name) AS trimmed,
        UPPER(TRIM(raw_name)) AS upper_name,
        LOWER(TRIM(raw_name)) AS lower_name
    FROM contacts
    WHERE id = 1
`).get();

console.log('-> Test 1: TRIM & Case Conversion:', { ...cleanNames });
assert.strictEqual(cleanNames.trimmed, 'nguyen van an');
assert.strictEqual(cleanNames.upper_name, 'NGUYEN VAN AN');
assert.strictEqual(cleanNames.lower_name, 'nguyen van an');
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: SUBSTR & INSTR (Tách username và domain từ email)
const parsedEmails = db.prepare(`
    SELECT 
        email,
        SUBSTR(email, 1, INSTR(email, '@') - 1) AS username,
        SUBSTR(email, INSTR(email, '@') + 1) AS domain
    FROM contacts
    ORDER BY id ASC
`).all();

console.log('-> Test 2: Tách email bằng SUBSTR & INSTR:', clean(parsedEmails));
assert.deepStrictEqual(clean(parsedEmails), [
    { email: 'an.nguyen@company.vn', username: 'an.nguyen', domain: 'company.vn' },
    { email: 'binh.le@gmail.com', username: 'binh.le', domain: 'gmail.com' }
]);
console.log('   ✓ Test 2 đạt chuẩn (1-indexed string extraction chính xác)!');

// Test 3: REPLACE
const replacedEmails = db.prepare(`
    SELECT REPLACE(email, '@company.vn', '@enterprise.com') AS new_email
    FROM contacts
    WHERE id = 1
`).get();

console.log('-> Test 3: REPLACE chuỗi:', { ...replacedEmails });
assert.strictEqual(replacedEmails.new_email, 'an.nguyen@enterprise.com');
console.log('   ✓ Test 3 đạt chuẩn!');

// Test 4: LENGTH
const lengthCheck = db.prepare(`
    SELECT LENGTH('Database') AS len_eng, LENGTH('Việt Nam') AS len_vn
`).get();

console.log('-> Test 4: LENGTH:', { ...lengthCheck });
assert.strictEqual(lengthCheck.len_eng, 8);
console.log('   ✓ Test 4 đạt chuẩn!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ HÀM CHUỖI HOÀN TẤT XUẤT SẮC! ===');
