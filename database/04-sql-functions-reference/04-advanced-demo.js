/**
 * 04-advanced-demo.js
 * Minh họa kiểm chứng thực tế: Window Functions (ROW_NUMBER, RANK, DENSE_RANK, LAG, LEAD, Running Total) và CAST
 * Chạy trực tiếp bằng Node.js v22 với built-in node:sqlite
 */

const { DatabaseSync } = require('node:sqlite');
const assert = require('node:assert/strict');

// Helper chuẩn hóa prototype từ node:sqlite
const clean = rows => rows.map(r => ({ ...r }));

console.log('=== KIỂM CHỨNG: ADVANCED FUNCTIONS & WINDOW FUNCTIONS ===');

const db = new DatabaseSync(':memory:');

db.exec(`
    CREATE TABLE scores (
        id INTEGER PRIMARY KEY,
        player TEXT NOT NULL,
        points INTEGER NOT NULL
    );

    INSERT INTO scores VALUES
    (1, 'Alice', 100),
    (2, 'Bob', 90),
    (3, 'Charlie', 90),
    (4, 'David', 80);

    CREATE TABLE monthly_sales (
        month INTEGER PRIMARY KEY,
        revenue REAL NOT NULL
    );

    INSERT INTO monthly_sales VALUES
    (1, 10000.0),
    (2, 12000.0),
    (3, 15000.0),
    (4, 11000.0);
`);

// Test 1: So sánh bộ ba Xếp hạng: ROW_NUMBER vs RANK vs DENSE_RANK
// Bob và Charlie đều có 90 điểm:
// ROW_NUMBER: 1, 2, 3, 4
// RANK: 1, 2, 2, 4 (nhảy cóc qua 3)
// DENSE_RANK: 1, 2, 2, 3 (liền mạch)
const rankComparison = db.prepare(`
    SELECT 
        player, points,
        ROW_NUMBER() OVER (ORDER BY points DESC, id ASC) AS row_num,
        RANK() OVER (ORDER BY points DESC) AS rank_val,
        DENSE_RANK() OVER (ORDER BY points DESC) AS dense_rank_val
    FROM scores
    ORDER BY points DESC, id ASC
`).all();

console.log('-> Test 1: So sánh ROW_NUMBER, RANK, DENSE_RANK:', clean(rankComparison));
assert.deepStrictEqual(clean(rankComparison), [
    { player: 'Alice', points: 100, row_num: 1, rank_val: 1, dense_rank_val: 1 },
    { player: 'Bob', points: 90, row_num: 2, rank_val: 2, dense_rank_val: 2 },
    { player: 'Charlie', points: 90, row_num: 3, rank_val: 2, dense_rank_val: 2 },
    { player: 'David', points: 80, row_num: 4, rank_val: 4, dense_rank_val: 3 }
]);
console.log('   ✓ Test 1 đạt chuẩn (Xếp hạng phân định khoảng trống chuẩn xác)!');

// Test 2: LAG và LEAD (Lấy giá trị tháng trước và tháng sau)
const lagLead = db.prepare(`
    SELECT 
        month, revenue,
        LAG(revenue, 1, 0.0) OVER (ORDER BY month ASC) AS prev_rev,
        LEAD(revenue, 1, 0.0) OVER (ORDER BY month ASC) AS next_rev
    FROM monthly_sales
    ORDER BY month ASC
`).all();

console.log('-> Test 2: LAG và LEAD:', clean(lagLead));
assert.deepStrictEqual(clean(lagLead), [
    { month: 1, revenue: 10000.0, prev_rev: 0.0, next_rev: 12000.0 },
    { month: 2, revenue: 12000.0, prev_rev: 10000.0, next_rev: 15000.0 },
    { month: 3, revenue: 15000.0, prev_rev: 12000.0, next_rev: 11000.0 },
    { month: 4, revenue: 11000.0, prev_rev: 15000.0, next_rev: 0.0 }
]);
console.log('   ✓ Test 2 đạt chuẩn!');

// Test 3: Doanh thu tích lũy cộng dồn (Running Total)
const runningTotal = db.prepare(`
    SELECT 
        month, revenue,
        SUM(revenue) OVER (ORDER BY month ASC ROWS UNBOUNDED PRECEDING) AS cumulative_revenue
    FROM monthly_sales
    ORDER BY month ASC
`).all();

console.log('-> Test 3: Running Total:', clean(runningTotal));
assert.deepStrictEqual(clean(runningTotal), [
    { month: 1, revenue: 10000.0, cumulative_revenue: 10000.0 },
    { month: 2, revenue: 12000.0, cumulative_revenue: 22000.0 },
    { month: 3, revenue: 15000.0, cumulative_revenue: 37000.0 },
    { month: 4, revenue: 11000.0, cumulative_revenue: 48000.0 }
]);
console.log('   ✓ Test 3 đạt chuẩn (Cộng dồn Running Total chính xác)!');

// Test 4: Ép kiểu CAST
const castRes = db.prepare(`
    SELECT CAST('42' AS INTEGER) AS num, CAST(123.456 AS TEXT) AS str
`).get();

console.log('-> Test 4: CAST:', { ...castRes });
assert.strictEqual(castRes.num, 42);
assert.strictEqual(castRes.str, '123.456');
console.log('   ✓ Test 4 đạt chuẩn!');

console.log('\n=== TẤT CẢ CÁC KIỂM THỬ WINDOW FUNCTIONS HOÀN TẤT XUẤT SẮC! ===');
