// System Design & Distributed Systems - Module 05 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  SnowflakeIdGenerator,
  base62Encode,
  base62Decode,
  SlidingWindowCounterRateLimiter,
  AdaptiveBitrateSelector,
  WebSocketFanoutHub,
} from './enterprise_designs.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 05: REAL-WORLD ARCHITECTURES TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: Snowflake 64-bit ID & Base62 Round-Trip Encoding
// ======================================================================
console.log('[Test 1] Testing Snowflake 64-bit ID Uniqueness & Base62 Round-Trip...');

const generator = new SnowflakeIdGenerator(42); // workerId = 42
const generatedIds = [];
const base62Keys = new Set();
const SAMPLE_COUNT = 1000;

for (let i = 0; i < SAMPLE_COUNT; i++) {
  const id = generator.nextId();
  generatedIds.push(id);

  if (i > 0) {
    assert.ok(
      id > generatedIds[i - 1],
      'Snowflake IDs must be strictly monotonically increasing'
    );
  }

  // Base62 Round-trip test
  const shortUrlKey = base62Encode(id);
  base62Keys.add(shortUrlKey);
  const decodedId = base62Decode(shortUrlKey);

  assert.strictEqual(
    decodedId,
    id,
    'Base62 decoded ID must strictly match original BigInt Snowflake ID'
  );
}

assert.strictEqual(
  base62Keys.size,
  SAMPLE_COUNT,
  'Every single generated Short URL key must be 100% unique'
);

console.log(`  -> Sample Snowflake ID: ${generatedIds[0]} -> Base62 Key: "${base62Encode(generatedIds[0])}"`);
console.log('  -> [PASSED] Snowflake ID generation & Base62 bidirectional encoding verified.\n');

// ======================================================================
// Challenge 2: Base62 Space Complexity Mathematics
// ======================================================================
console.log('[Test 2] Testing 7-Character Base62 Address Space Capacity...');

const BASE62_RADIX = 62n;
const KEY_LENGTH = 7n;
const totalCombinations = BASE62_RADIX ** KEY_LENGTH;

console.log(`  -> 62^7 Total URL Combinations: ${totalCombinations.toString()}`);

// 62^7 = 3,521,614,606,208 (> 3.52 Trillion)
assert.ok(
  totalCombinations > 3500000000000n,
  'Base62 with 7 characters must provide capacity for over 3.5 Trillion unique URLs'
);

// At 100 Million new URLs per month:
const urlsPerYear = 100_000_000n * 12n;
const yearsSustained = totalCombinations / urlsPerYear;
console.log(`  -> At 100M URLs/month, 7-char namespace sustains system for: ${yearsSustained.toString()} years`);
assert.ok(yearsSustained > 2900n, 'Namespace must sustain 100M URLs/month for over 2,900 years');

console.log('  -> [PASSED] Address space scale estimation satisfies multi-century requirements.\n');

// ======================================================================
// Challenge 3: Sliding Window Counter Rate Limiter Boundary Smoothness
// ======================================================================
console.log('[Test 3] Testing Sliding Window Counter Rate Limiter...');

const limiter = new SlidingWindowCounterRateLimiter(60000); // 1-minute window
const clientId = 'tenant-stripe-api-key-99';
const LIMIT = 10;
const t0 = 600000; // Window 1: [600000, 660000)

// Send 8 requests in Window 1 (t0 + 10s = 610000)
for (let i = 0; i < 8; i++) {
  const res = limiter.isAllowed(clientId, LIMIT, t0 + 10000);
  assert.strictEqual(res.allowed, true, `Request ${i + 1} must be allowed`);
}

// Advance time into Window 2: Window 2 is [660000, 720000).
// 15 seconds into Window 2 is tNext = 660000 + 15000 = 675000.
// Time fraction into current window = 15s / 60s = 0.25
// Remaining weight from prev window = 1 - 0.25 = 0.75
// Weighted estimate from prev window = 8 * 0.75 = 6.0 requests
const tNext = 660000 + 15000;

// Since estimate already counts ~6 requests from prev window, client can only send 4 more before hitting limit 10
let allowedInWindow2 = 0;
for (let i = 0; i < 10; i++) {
  const res = limiter.isAllowed(clientId, LIMIT, tNext);
  if (res.allowed) {
    allowedInWindow2++;
  }
}

console.log(`  -> In Window 2 (15s in): allowed ${allowedInWindow2} requests out of 10 attempts (due to 6 carried over)`);
assert.strictEqual(
  allowedInWindow2,
  4,
  'Sliding window must carry over previous window load and allow exactly 4 requests before blocking'
);

console.log('  -> [PASSED] Sliding window counter prevents boundary bursting with mathematical smoothing.\n');

// ======================================================================
// Challenge 4: Adaptive Bitrate (ABR) Stream Selector
// ======================================================================
console.log('[Test 4] Testing Adaptive Bitrate (ABR) Stream Selection Logic...');

const abr = new AdaptiveBitrateSelector([
  { resolution: '360p', bandwidthBps: 800_000 },
  { resolution: '720p', bandwidthBps: 2_500_000 },
  { resolution: '1080p', bandwidthBps: 5_000_000 },
  { resolution: '4K', bandwidthBps: 15_000_000 },
]);

// 1. Measured 10 Mbps -> Safe 8 Mbps -> Should choose 1080p (5 Mbps)
const s1 = abr.selectStream(10_000_000);
assert.strictEqual(s1.resolution, '1080p');

// 2. Network degrades to 2 Mbps -> Safe 1.6 Mbps -> Should downgrade to 360p (800 kbps)
const s2 = abr.selectStream(2_000_000);
assert.strictEqual(s2.resolution, '360p');

// 3. High-speed 5G 30 Mbps -> Safe 24 Mbps -> Should upgrade to 4K (15 Mbps)
const s3 = abr.selectStream(30_000_000);
assert.strictEqual(s3.resolution, '4K');

console.log('  -> [PASSED] Adaptive Bitrate selector dynamically shifts video resolution to prevent buffering.\n');

// ======================================================================
// Challenge 5: WebSocket Room Broadcast & Sender Exclusion
// ======================================================================
console.log('[Test 5] Testing WebSocket Pub/Sub Fanout & Presence Hub...');

const hub = new WebSocketFanoutHub();
const ROOM_ID = 'crypto-live-feed';

hub.joinRoom(ROOM_ID, 'trader-alice');
hub.joinRoom(ROOM_ID, 'trader-bob');
hub.joinRoom(ROOM_ID, 'trader-charlie');

// Alice broadcasts a price update
const deliveries1 = hub.broadcast(ROOM_ID, { ticker: 'BTC-USD', price: 92450 }, 'trader-alice');

assert.strictEqual(deliveries1.length, 2, 'Must broadcast to exactly 2 other clients');
const recipients1 = deliveries1.map((d) => d.clientId);
assert.ok(recipients1.includes('trader-bob'), 'Bob must receive message');
assert.ok(recipients1.includes('trader-charlie'), 'Charlie must receive message');
assert.ok(!recipients1.includes('trader-alice'), 'Sender Alice must be excluded from echo');

// Bob leaves the room
hub.leaveRoom(ROOM_ID, 'trader-bob');

// Charlie broadcasts
const deliveries2 = hub.broadcast(ROOM_ID, { ticker: 'ETH-USD', price: 3450 }, 'trader-charlie');
assert.strictEqual(deliveries2.length, 1, 'After Bob left, only 1 client remains');
assert.strictEqual(deliveries2[0].clientId, 'trader-alice');

console.log('  -> [PASSED] Real-time fanout hub enforces accurate group membership and echo-free delivery.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 05 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
