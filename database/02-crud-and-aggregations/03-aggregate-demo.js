/**
 * 03-aggregate-demo.js
 * Minh họa kiểm chứng thực tế: COUNT(*), COUNT(col), SUM, AVG, MIN, MAX và xử lý NULL
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: AGGREGATE FUNCTIONS & NULL BEHAVIOR ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE test_scores (
        student_id INTEGER PRIMARY KEY,
        subject TEXT NOT NULL,
        score REAL
    );

    INSERT INTO test_scores VALUES
    (1, 'Math', 10.0),
    (2, 'Math', 8.0),
    (3, 'Math', 8.0),
    (4, 'Math', NULL),
    (5, 'Math', NULL);

    CREATE TABLE empty_sales (
        id INTEGER PRIMARY KEY,
        amount REAL
    );
`);

// Test 1: Đếm số lượng COUNT(*), COUNT(col), COUNT(DISTINCT col)
const countQuery = db.prepare(`
    SELECT 
        COUNT(*) AS total_rows,
        COUNT(score) AS non_null_scores,
        COUNT(DISTINCT score) AS distinct_scores
    FROM test_scores
`).get();

console.log('-> Test 1: Biến thể COUNT:', { ...countQuery });
assert.deepStrictEqual({ ...countQuery }, {
    total_rows: 5,         // Tổng số dòng vật lý
    non_null_scores: 3,    // Chỉ 3 dòng có điểm khác null (10.0, 8.0, 8.0)
    distinct_scores: 2     // 2 mức điểm duy nhất (10.0 và 8.0)
});
console.log('   ✓ Test 1 đạt chuẩn!');

// Test 2: Bẫy tính trung bình cộng AVG(score) vs AVG(COALESCE(score, 0))
const avgQuery = db.prepare(`
    SELECT 
        AVG(score) AS avg_graded,
        AVG(COALESCE(score, 0.0)) AS avg_all
    FROM test_scores
`).get();

console.log('-> Test 2: So sánh AVG có và không có COALESCE:', { ...avgQuery });
// avg_graded = (10 + 8 + 8) / 3 = 26 / 3 = 8.666666666666666
// avg_all = (10 + 8 + 8 + 0 + 0) / 5 = 26 / 5 = 5.2
assert.strictEqual(Math.round(avgQuery.avg_graded * 100) / 100, 8.67);
assert.strictEqual(avgQuery.avg_all, 5.2);
console.log('   ✓ Test 2 đạt chuẩn (AVG bỏ qua NULL làm thay đổi mẫu số chia)!');

// Test 3: SUM, MIN, MAX bỏ qua giá trị NULL
const statsQuery = db.prepare(`
    SELECT 
        SUM(score) AS total_score,
        MIN(score) AS min_score,
        MAX(score) AS max_score
    FROM test_scores
`).get();

console.log('-> Test 3: SUM, MIN, MAX:', { ...statsQuery });
assert.deepStrictEqual({ ...statsQuery }, {
    total_score: 26.0,
    min_score: 8.0,
    max_score: 10.0
});
console.log('   ✓ Test 3 đạt chuẩn!');

// Test 4: Hành vi hàm tổng hợp trên bảng hoàn toàn rỗng
const emptyQuery = db.prepare(`
    SELECT 
        COUNT(*) AS c,
        SUM(amount) AS s,
        AVG(amount) AS a,
        MAX(amount) AS m
    FROM empty_sales
`).get();

console.log('-> Test 4: Bảng rỗng:', { ...emptyQuery });
assert.deepStrictEqual({ ...emptyQuery }, {
    c: 0,
    s: null,
    a: null,
    m: null
});
console.log('   ✓ Test 4 đạt chuẩn (COUNT trả về 0, còn SUM/AVG/MAX trả về NULL)!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ HÀM TỔNG HỢP HOÀN TẤT XUẤT SẮC! ===');
