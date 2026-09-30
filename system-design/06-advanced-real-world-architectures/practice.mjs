// Automated Verification Test Suite for Module 06: Advanced Real-World Architectures
import assert from 'node:assert';
import {
  GeohashService,
  DoubleEntryLedger,
  HashedTimingWheel,
  CountMinSketch,
  InvertedIndex
} from './advanced_architectures.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 06: ADVANCED ARCHITECTURES TEST SUITE');
console.log('=============================================================\n');

// Test 1: Geohash Spatial Proximity & Prefix Property
console.log('[Test 1] Testing Geohash Encoding & Prefix Proximity Property...');
// Ben Thanh Market (10.7725, 106.6980) & Saigon Notre-Dame Basilica (10.7797, 106.6990) -> approx 800m
const hashBenThanh = GeohashService.encode(10.7725, 106.6980, 7);
const hashCathedral = GeohashService.encode(10.7797, 106.6990, 7);
// Hanoi Opera House (21.0245, 105.8574) -> far away
const hashHanoi = GeohashService.encode(21.0245, 105.8574, 7);

console.log(`  -> Ben Thanh Geohash: ${hashBenThanh}`);
console.log(`  -> Cathedral Geohash: ${hashCathedral}`);
console.log(`  -> Hanoi Geohash:     ${hashHanoi}`);

// Saigon locations should share at least 4 characters prefix
assert.strictEqual(
  GeohashService.isPrefixMatch(hashBenThanh, hashCathedral, 4),
  true,
  'Nearby locations in HCMC must share geohash prefix'
);
assert.strictEqual(
  GeohashService.isPrefixMatch(hashBenThanh, hashHanoi, 2),
  false,
  'Distant locations must not share geohash prefix'
);
console.log('  -> [PASSED] Geohash encoding and hierarchical prefix property verified.\n');

// Test 2: Double-Entry Ledger with Idempotency Key
console.log('[Test 2] Testing Double-Entry Ledger, Balance Invariants & Idempotency...');
const ledger = new DoubleEntryLedger();
ledger.createAccount('user_alice', 1000);
ledger.createAccount('user_bob', 200);

// Normal transfer
const res1 = ledger.transfer({
  idempotencyKey: 'idem_tx_001',
  sourceAccountId: 'user_alice',
  targetAccountId: 'user_bob',
  amount: 300
});
assert.strictEqual(res1.replayed, false);
assert.strictEqual(ledger.getBalance('user_alice'), 700);
assert.strictEqual(ledger.getBalance('user_bob'), 500);

// Duplicate request with same idempotency key (simulating network retry)
const res2 = ledger.transfer({
  idempotencyKey: 'idem_tx_001',
  sourceAccountId: 'user_alice',
  targetAccountId: 'user_bob',
  amount: 300
});
assert.strictEqual(res2.replayed, true);
assert.strictEqual(ledger.getBalance('user_alice'), 700, 'Balance must NOT change on duplicate request');
assert.strictEqual(ledger.getBalance('user_bob'), 500);

// Overdraft protection
assert.throws(() => {
  ledger.transfer({
    idempotencyKey: 'idem_tx_002',
    sourceAccountId: 'user_alice',
    targetAccountId: 'user_bob',
    amount: 10000
  });
}, /Insufficient funds/);
console.log('  -> [PASSED] Ledger guarantees non-negative balances, zero-sum invariant and idempotent replay.\n');

// Test 3: Hashed Timing Wheel Delayed Scheduling
console.log('[Test 3] Testing Hashed Timing Wheel Delayed Execution...');
const wheel = new HashedTimingWheel(4, 50); // 4 slots, 50ms per tick (total cycle = 200ms)

wheel.addTask('task_immediate', 0, 'Run now');
wheel.addTask('task_one_cycle', 250, 'Run after 5 ticks (1 round + 1 slot)');

const tick0 = wheel.advanceTick();
assert.strictEqual(tick0.length, 1);
assert.strictEqual(tick0[0].taskId, 'task_immediate');

// Advance ticks 1, 2, 3, 4
wheel.advanceTick();
wheel.advanceTick();
wheel.advanceTick();
wheel.advanceTick();
// Tick 5: task_one_cycle should now expire
const tick5 = wheel.advanceTick();
assert.strictEqual(tick5.length, 1);
assert.strictEqual(tick5[0].taskId, 'task_one_cycle');
console.log('  -> [PASSED] Timing wheel correctly schedules and triggers multi-round delayed tasks in O(1).\n');

// Test 4: Count-Min Sketch Probabilistic Frequency Estimation
console.log('[Test 4] Testing Count-Min Sketch Heavy-Hitter Frequency Estimation...');
const cms = new CountMinSketch(200, 4);

// Simulate streaming events: 'popular_ad' clicked 500 times, 'rare_ad' clicked 3 times
for (let i = 0; i < 500; i++) cms.increment('ad_123_super_deal');
for (let i = 0; i < 3; i++) cms.increment('ad_999_obscure_book');

const estPopular = cms.estimate('ad_123_super_deal');
const estRare = cms.estimate('ad_999_obscure_book');

console.log(`  -> Estimated popular ad clicks: ${estPopular} (actual 500)`);
console.log(`  -> Estimated rare ad clicks:    ${estRare} (actual 3)`);

assert.ok(estPopular >= 500, 'Count-Min Sketch never underestimates');
assert.ok(estPopular < 520, 'Error margin within acceptable bound');
assert.ok(estRare >= 3 && estRare < 10);
console.log('  -> [PASSED] Count-Min Sketch provides bounded frequency estimates in sublinear space.\n');

// Test 5: Inverted Index with BM25 Relevance Ranking
console.log('[Test 5] Testing Inverted Index & BM25 Scoring...');
const index = new InvertedIndex();
index.addDocument('doc1', 'Distributed systems design requires understanding replication and partitioning');
index.addDocument('doc2', 'High scale caching with Redis and Memcached');
index.addDocument('doc3', 'Advanced distributed systems with Raft consensus and distributed storage');

const searchResults = index.search('distributed systems');
console.log('  -> Search query: "distributed systems"');
searchResults.forEach((r, idx) => console.log(`     ${idx + 1}. [${r.docId}] Score: ${r.score.toFixed(3)} - "${r.text}"`));

assert.ok(searchResults.length >= 2);
assert.strictEqual(searchResults[0].docId, 'doc3', 'doc3 contains multiple matching terms and should rank top');
console.log('  -> [PASSED] Inverted index correctly tokenizes, indexes, and ranks documents with BM25.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 06 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
