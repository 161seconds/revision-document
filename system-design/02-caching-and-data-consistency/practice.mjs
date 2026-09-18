// System Design & Distributed Systems - Module 02 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  LRUCache,
  BloomFilter,
  CacheStampedeGuard,
  calculateJitteredTtl,
} from './caching_patterns.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 02: CACHING & CONSISTENCY TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: Strict O(1) LRU Eviction Invariant
// ======================================================================
console.log('[Test 1] Testing Strict O(1) LRU Eviction Invariant...');

const lru = new LRUCache(3);
lru.put('item-A', 100);
lru.put('item-B', 200);
lru.put('item-C', 300);

assert.strictEqual(lru.size, 3, 'LRU size must equal 3');

// Access item-A -> moves item-A to Head (MRU). Order becomes: A (MRU), C, B (LRU)
assert.strictEqual(lru.get('item-A'), 100);

// Insert item-D -> capacity exceeded! Item-B must be evicted.
lru.put('item-D', 400);

assert.strictEqual(lru.get('item-B'), undefined, 'Item-B must have been evicted as LRU');
assert.strictEqual(lru.get('item-A'), 100, 'Item-A must still exist');
assert.strictEqual(lru.get('item-C'), 300, 'Item-C must still exist');
assert.strictEqual(lru.get('item-D'), 400, 'Item-D must exist');
assert.strictEqual(lru.size, 3, 'Size must remain at capacity 3');

console.log('  -> [PASSED] LRU cache evicts the true least-recently-used node correctly.\n');

// ======================================================================
// Challenge 2: Bloom Filter Zero False-Negatives & False-Positive Bounds
// ======================================================================
console.log('[Test 2] Testing Bloom Filter Zero False-Negatives & False-Positive Bounds...');

const filter = new BloomFilter(1000, 0.01); // 1% acceptable false positive rate
const insertedKeys = [];

for (let i = 0; i < 500; i++) {
  const key = `user_identity_uuid_${i * 17}`;
  insertedKeys.push(key);
  filter.add(key);
}

// Invariant 1: Zero False Negatives. Every inserted key MUST return true.
for (const key of insertedKeys) {
  assert.strictEqual(
    filter.has(key),
    true,
    'Bloom filter must NEVER produce a false negative for an inserted element'
  );
}

// Invariant 2: Test false positives on 2,000 non-existent keys
let falsePositives = 0;
const TEST_NON_EXISTENT_COUNT = 2000;

for (let i = 0; i < TEST_NON_EXISTENT_COUNT; i++) {
  const nonExistentKey = `bogus_foreign_hacker_key_${i * 9999 + 7}`;
  if (filter.has(nonExistentKey)) {
    falsePositives++;
  }
}

const observedErrorRate = falsePositives / TEST_NON_EXISTENT_COUNT;
console.log(`  -> Non-existent tested: ${TEST_NON_EXISTENT_COUNT}, False positives: ${falsePositives} (${(observedErrorRate * 100).toFixed(2)}%)`);

assert.ok(
  observedErrorRate <= 0.025,
  `Observed false positive rate ${(observedErrorRate * 100).toFixed(2)}% must remain below 2.5% threshold`
);
console.log('  -> [PASSED] Bloom filter successfully prevents cache penetration with mathematical bounds.\n');

// ======================================================================
// Challenge 3: Thundering Herd Mutex Single-Flight Coalescing
// ======================================================================
console.log('[Test 3] Testing Cache Stampede / Thundering Herd Single-Flight Mutex...');

const stampedeGuard = new CacheStampedeGuard();
let databaseQueryExecutions = 0;

async function mockExpensiveDatabaseQuery() {
  databaseQueryExecutions++;
  // Simulate slow DB latency (50ms)
  await new Promise((resolve) => setTimeout(resolve, 50));
  return { liveScore: 'Team Alpha 3 - 2 Team Beta', timestamp: Date.now() };
}

// Fire 50 concurrent requests simultaneously for the same hot key
const CONCURRENT_REQUESTS = 50;
const requests = [];

for (let i = 0; i < CONCURRENT_REQUESTS; i++) {
  requests.push(stampedeGuard.getOrFetch('hot_game_score', 1000, mockExpensiveDatabaseQuery));
}

const responses = await Promise.all(requests);

console.log(`  -> Dispatched ${CONCURRENT_REQUESTS} concurrent requests. Database queries performed: ${databaseQueryExecutions}`);

assert.strictEqual(
  databaseQueryExecutions,
  1,
  'Database query must execute EXACTLY ONCE for all 50 concurrent requests'
);

const sources = responses.map((r) => r.source);
const dbHits = sources.filter((s) => s === 'DATABASE_QUERY').length;
const coalesced = sources.filter((s) => s === 'MUTEX_COALESCED').length;

assert.strictEqual(dbHits, 1, 'Exactly one request should execute the database query');
assert.strictEqual(coalesced, CONCURRENT_REQUESTS - 1, 'All other concurrent requests must be coalesced');

console.log('  -> [PASSED] Single-flight mutex successfully neutralizes Thundering Herd.\n');

// ======================================================================
// Challenge 4: TTL Jitter Distribution for Avalanche Defense
// ======================================================================
console.log('[Test 4] Testing TTL Jitter Distribution for Avalanche Defense...');

const BASE_TTL = 3600; // 1 hour
const MAX_JITTER = 300; // 5 minutes
const sampleSize = 1000;
const ttlValues = [];

for (let i = 0; i < sampleSize; i++) {
  const ttl = calculateJitteredTtl(BASE_TTL, MAX_JITTER);
  assert.ok(ttl >= BASE_TTL, 'TTL must be >= BASE_TTL');
  assert.ok(ttl <= BASE_TTL + MAX_JITTER, 'TTL must be <= BASE_TTL + MAX_JITTER');
  ttlValues.push(ttl);
}

// Compute variance and standard deviation
const mean = ttlValues.reduce((a, b) => a + b, 0) / sampleSize;
const variance = ttlValues.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / sampleSize;
const stdDev = Math.sqrt(variance);

console.log(`  -> Base: ${BASE_TTL}s, Max: ${BASE_TTL + MAX_JITTER}s. Mean: ${mean.toFixed(1)}s, StdDev: ${stdDev.toFixed(1)}s`);
assert.ok(stdDev > 50, 'Standard deviation must be sufficiently high to avoid simultaneous expiry spikes');

console.log('  -> [PASSED] TTL jitter spreads cache expiration evenly over time.\n');

// ======================================================================
// Challenge 5: Cache-Aside Invalidation Logic Invariants
// ======================================================================
console.log('[Test 5] Testing Cache-Aside Invalidation Logic Invariants...');

class MockCacheAsideService {
  constructor() {
    this.database = new Map([['prod-1', { id: 'prod-1', price: 50 }]]);
    this.cache = new Map();
  }

  async read(id) {
    if (this.cache.has(id)) {
      return { data: this.cache.get(id), from: 'CACHE' };
    }
    const data = this.database.get(id);
    if (data) {
      this.cache.set(id, { ...data });
    }
    return { data, from: 'DATABASE' };
  }

  async update(id, newPrice) {
    // Correct Cache-Aside Rule: 1. Update Database -> 2. Invalidate (Delete) from Cache
    this.database.set(id, { id, price: newPrice });
    this.cache.delete(id); // Evict, do not set!
  }
}

const service = new MockCacheAsideService();

// Initial Read: Misses cache, loads from DB
const r1 = await service.read('prod-1');
assert.strictEqual(r1.from, 'DATABASE');
assert.strictEqual(r1.data.price, 50);

// Second Read: Hits cache
const r2 = await service.read('prod-1');
assert.strictEqual(r2.from, 'CACHE');
assert.strictEqual(r2.data.price, 50);

// Update price: DB updated, cache deleted
await service.update('prod-1', 99);

// Third Read: Must see new price 99 from DB, NOT stale 50 from cache!
const r3 = await service.read('prod-1');
assert.strictEqual(r3.from, 'DATABASE');
assert.strictEqual(r3.data.price, 99);

console.log('  -> [PASSED] Cache-Aside write-invalidation prevents stale data anomalies.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 02 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
