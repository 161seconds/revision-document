// System Design & Distributed Systems - Module 04 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  KafkaPartitionSimulator,
  CircuitBreaker,
  TokenBucketRateLimiter,
} from './event_stream_simulator.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 04: MESSAGING & EVENT-DRIVEN TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: Kafka Partition Ordering & Key Hashing Invariant
// ======================================================================
console.log('[Test 1] Testing Kafka Partition Key Routing & Monotonic Offsets...');

const kafka = new KafkaPartitionSimulator(4);
const orderKey = 'order_tx_uuid_881726';
const publishedResults = [];

for (let i = 0; i < 10; i++) {
  const meta = kafka.publish(orderKey, { step: `EVENT_STAGE_${i}`, count: i });
  publishedResults.push(meta);
}

const targetPartition = publishedResults[0].partition;
console.log(`  -> Key "${orderKey}" routed to partition: ${targetPartition}`);

for (let i = 0; i < publishedResults.length; i++) {
  const meta = publishedResults[i];
  assert.strictEqual(
    meta.partition,
    targetPartition,
    'All messages with identical key MUST route to the exact same partition'
  );
  assert.strictEqual(
    meta.offset,
    i,
    `Offset for message ${i} must be monotonically sequential (expected ${i}, got ${meta.offset})`
  );
}

console.log('  -> [PASSED] Kafka key-partition mapping guarantees strict message ordering.\n');

// ======================================================================
// Challenge 2: Consumer Group Rebalance & Idle Consumer Bound
// ======================================================================
console.log('[Test 2] Testing Consumer Group Partition Rebalance Invariants...');

const cluster = new KafkaPartitionSimulator(4);

// Scenario A: 2 Consumers for 4 Partitions
const mapA = cluster.rebalance(['Consumer-A', 'Consumer-B']);
assert.strictEqual(mapA.get('Consumer-A').length, 2, 'Consumer-A must be assigned 2 partitions');
assert.strictEqual(mapA.get('Consumer-B').length, 2, 'Consumer-B must be assigned 2 partitions');

// Scenario B: 6 Consumers for 4 Partitions (More consumers than partitions)
const consumers6 = ['C1', 'C2', 'C3', 'C4', 'C5', 'C6'];
const mapB = cluster.rebalance(consumers6);

let activeConsumerCount = 0;
let idleConsumerCount = 0;

for (const [consumerId, partitions] of mapB.entries()) {
  if (partitions.length > 0) {
    activeConsumerCount++;
    assert.strictEqual(partitions.length, 1, 'Active consumer in 6-consumer pool can hold max 1 partition');
  } else {
    idleConsumerCount++;
  }
}

console.log(`  -> 4 Partitions across 6 Consumers: ${activeConsumerCount} active, ${idleConsumerCount} idle`);
assert.strictEqual(activeConsumerCount, 4, 'Exactly 4 consumers should be assigned partitions');
assert.strictEqual(idleConsumerCount, 2, 'Exactly 2 consumers must be idle since partitions cannot be shared');

console.log('  -> [PASSED] Consumer group rebalance enforces single-consumer-per-partition invariant.\n');

// ======================================================================
// Challenge 3: Circuit Breaker State Transition Cycle
// ======================================================================
console.log('[Test 3] Testing Circuit Breaker State Transitions (Closed -> Open -> Half-Open -> Closed)...');

const cb = new CircuitBreaker({ failureThreshold: 3, recoveryTimeoutMs: 100 });
assert.strictEqual(cb.state, 'CLOSED');

const failingAction = async () => {
  throw new Error('DatabaseTimeoutException');
};
const successAction = async () => 'UPSTREAM_DATA_OK';
const fallbackHandler = () => 'FALLBACK_CACHED_PAYLOAD';

// 1. Trigger 3 consecutive failures
for (let i = 0; i < 3; i++) {
  const res = await cb.execute(failingAction, fallbackHandler);
  assert.strictEqual(res, 'FALLBACK_CACHED_PAYLOAD');
}

assert.strictEqual(cb.state, 'OPEN', 'Circuit breaker must trip to OPEN after 3 failures');

// 2. While OPEN: verify fail-fast without executing action
let actionCalled = false;
const resWhileOpen = await cb.execute(
  async () => {
    actionCalled = true;
  },
  fallbackHandler
);
assert.strictEqual(actionCalled, false, 'Action must NOT be called when Circuit Breaker is OPEN');
assert.strictEqual(resWhileOpen, 'FALLBACK_CACHED_PAYLOAD');

// 3. Wait for recovery timeout (110ms)
await new Promise((resolve) => setTimeout(resolve, 110));

// 4. First request after timeout should probe in HALF_OPEN
const probe1 = await cb.execute(successAction, fallbackHandler);
assert.strictEqual(probe1, 'UPSTREAM_DATA_OK');
assert.strictEqual(cb.state, 'HALF_OPEN');

// 5. Second successful probe restores breaker to CLOSED
const probe2 = await cb.execute(successAction, fallbackHandler);
assert.strictEqual(probe2, 'UPSTREAM_DATA_OK');
assert.strictEqual(cb.state, 'CLOSED', 'Circuit breaker must recover to CLOSED after consecutive successes');

console.log('  -> [PASSED] Circuit Breaker state machine successfully prevents cascading collapse.\n');

// ======================================================================
// Challenge 4: Token Bucket Burst Allowance & Refill Rate
// ======================================================================
console.log('[Test 4] Testing Token Bucket Rate Limiter Burst & Refill Flow...');

// Capacity 5 tokens, refills 10 tokens per second (1 token every 100ms)
const limiter = new TokenBucketRateLimiter(5, 10);

// Burst test: Consume 5 tokens immediately
for (let i = 0; i < 5; i++) {
  assert.strictEqual(limiter.tryConsume(1), true, `Token ${i + 1} of burst must be allowed`);
}

// 6th token should be rejected (empty bucket)
assert.strictEqual(limiter.tryConsume(1), false, 'Immediate request exceeding capacity must be rejected');

// Wait 220ms (refills ~2.2 tokens)
await new Promise((resolve) => setTimeout(resolve, 220));

// Should now permit 2 requests
assert.strictEqual(limiter.tryConsume(1), true, 'Refilled token 1 must be permitted');
assert.strictEqual(limiter.tryConsume(1), true, 'Refilled token 2 must be permitted');
assert.strictEqual(limiter.tryConsume(1), false, 'Third request must be rejected');

console.log('  -> [PASSED] Token bucket handles bursts and enforces continuous refill rates.\n');

// ======================================================================
// Challenge 5: Transactional Outbox Idempotency Invariant
// ======================================================================
console.log('[Test 5] Testing Transactional Outbox Idempotency Defense...');

class IdempotentPaymentConsumer {
  constructor() {
    this.processedEventIds = new Set();
    this.accountBalances = new Map([['acc-401', 1000]]);
  }

  handleEvent(event) {
    // Deduplication check
    if (this.processedEventIds.has(event.eventId)) {
      return { status: 'DUPLICATE_IGNORED', currentBalance: this.accountBalances.get(event.accountId) };
    }

    // Process local business transaction
    const balance = this.accountBalances.get(event.accountId);
    this.accountBalances.set(event.accountId, balance - event.amount);
    this.processedEventIds.add(event.eventId);

    return { status: 'PROCESSED', currentBalance: this.accountBalances.get(event.accountId) };
  }
}

const consumer = new IdempotentPaymentConsumer();
const sampleEvent = {
  eventId: 'evt_outbox_unique_hash_992182',
  accountId: 'acc-401',
  amount: 200,
};

// First delivery
const r1 = consumer.handleEvent(sampleEvent);
assert.strictEqual(r1.status, 'PROCESSED');
assert.strictEqual(r1.currentBalance, 800);

// Network retry / Duplicate delivery of same event
const r2 = consumer.handleEvent(sampleEvent);
assert.strictEqual(r2.status, 'DUPLICATE_IGNORED');
assert.strictEqual(r2.currentBalance, 800, 'Duplicate event must NOT deduct balance twice');

// Third delivery attempt
const r3 = consumer.handleEvent(sampleEvent);
assert.strictEqual(r3.status, 'DUPLICATE_IGNORED');
assert.strictEqual(r3.currentBalance, 800);

console.log('  -> [PASSED] Idempotency key safeguards against double-processing in at-least-once streams.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 04 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
