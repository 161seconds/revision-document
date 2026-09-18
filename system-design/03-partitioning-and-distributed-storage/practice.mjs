// System Design & Distributed Systems - Module 03 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  DynamoQuorumCluster,
  SagaOrchestrator,
  FencingTokenStorage,
  HashShardingRouter,
} from './distributed_storage.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 03: DISTRIBUTED STORAGE & SAGA TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: Dynamo Quorum Invariant & Node Failure Tolerance
// ======================================================================
console.log('[Test 1] Testing Dynamo Quorum Invariant & Failure Tolerance...');

const cluster = new DynamoQuorumCluster(3, 2, 2); // N=3, W=2, R=2
assert.strictEqual(cluster.isStronglyConsistent(), true, 'R + W (2+2=4) > N (3) guarantees Strong Consistency');

// Initial write with all 3 nodes healthy
const w1 = cluster.write('user_profile:101', { name: 'Alice', balance: 100 }, 1000);
assert.strictEqual(w1.acks, 3, 'All 3 nodes should ACK initial write');

// Simulate 1 node failure (Node-0 crashes)
cluster.setNodeHealth(0, false);

// Write updated balance: Should still succeed with remaining 2 nodes (W=2)
const w2 = cluster.write('user_profile:101', { name: 'Alice', balance: 150 }, 1001);
assert.strictEqual(w2.acks, 2, '2 available nodes satisfy W=2 write quorum');

// Read should still satisfy R=2 and return newest version 1001
const r1 = cluster.read('user_profile:101');
assert.strictEqual(r1.responses, 2, '2 available nodes satisfy R=2 read quorum');
assert.strictEqual(r1.value.balance, 150, 'Must read newest balance (150)');

// Simulate catastrophic failure: Node-1 also crashes, leaving only 1 node alive
cluster.setNodeHealth(1, false);

assert.throws(
  () => cluster.write('user_profile:101', { name: 'Alice', balance: 200 }, 1002),
  /WriteQuorumFailed/,
  'Write must fail when healthy nodes (1) < Write Quorum (2)'
);

assert.throws(
  () => cluster.read('user_profile:101'),
  /ReadQuorumFailed/,
  'Read must fail when healthy nodes (1) < Read Quorum (2)'
);

console.log('  -> [PASSED] Dynamo Quorum mathematics enforces consistency and fails gracefully.\n');

// ======================================================================
// Challenge 2: Saga Pattern Happy Path
// ======================================================================
console.log('[Test 2] Testing Saga Pattern Happy Path Execution...');

const happySaga = new SagaOrchestrator();
const state = { orderId: null, paid: false, inventoryReserved: false };

happySaga
  .addStep(
    'CreateOrder',
    async (ctx) => {
      ctx.orderId = 'ORD-9821';
    },
    async (ctx) => {
      ctx.orderId = null;
    }
  )
  .addStep(
    'ProcessPayment',
    async (ctx) => {
      ctx.paid = true;
    },
    async (ctx) => {
      ctx.paid = false;
    }
  )
  .addStep(
    'ReserveInventory',
    async (ctx) => {
      ctx.inventoryReserved = true;
    },
    async (ctx) => {
      ctx.inventoryReserved = false;
    }
  );

const happyResult = await happySaga.execute(state);
assert.strictEqual(happyResult.status, 'SUCCESS');
assert.strictEqual(state.orderId, 'ORD-9821');
assert.strictEqual(state.paid, true);
assert.strictEqual(state.inventoryReserved, true);
assert.strictEqual(happyResult.log.length, 3);
assert.ok(happyResult.log.every((l) => l.action === 'EXECUTE'));

console.log('  -> [PASSED] Saga executes all steps cleanly on happy path.\n');

// ======================================================================
// Challenge 3: Saga Pattern Rollback & Compensating Transactions
// ======================================================================
console.log('[Test 3] Testing Saga Rollback with Compensating Transactions...');

const failureSaga = new SagaOrchestrator();
const failState = { orderCreated: false, chargedAmount: 0, stockAllocated: false };

failureSaga
  .addStep(
    'CreateOrder',
    async (ctx) => {
      ctx.orderCreated = true;
    },
    async (ctx) => {
      ctx.orderCreated = false;
    }
  )
  .addStep(
    'ChargeCard',
    async (ctx) => {
      ctx.chargedAmount = 250;
    },
    async (ctx) => {
      ctx.chargedAmount = 0; // Refund payment
    }
  )
  .addStep(
    'AllocateStock',
    async () => {
      throw new Error('OutOfStockError: Requested SKU is depleted');
    },
    async (ctx) => {
      ctx.stockAllocated = false;
    }
  );

const failureResult = await failureSaga.execute(failState);

assert.strictEqual(failureResult.status, 'COMPENSATED_FAILURE');
assert.strictEqual(failureResult.failedAt, 'AllocateStock');
assert.strictEqual(failState.stockAllocated, false);
assert.strictEqual(failState.chargedAmount, 0, 'Card charge must be refunded by compensating transaction');
assert.strictEqual(failState.orderCreated, false, 'Order creation must be compensated/canceled');

// Check compensation order: ChargeCard must be compensated before CreateOrder
const compActions = failureResult.log.filter((l) => l.action === 'COMPENSATE');
assert.strictEqual(compActions.length, 2);
assert.strictEqual(compActions[0].step, 'ChargeCard');
assert.strictEqual(compActions[1].step, 'CreateOrder');

console.log('  -> [PASSED] Saga properly unwinds distributed state in reverse order.\n');

// ======================================================================
// Challenge 4: Martin Kleppmann Fencing Token Monotonic Defense
// ======================================================================
console.log('[Test 4] Testing Monotonic Fencing Token Defense Against Stale Locks...');

const storage = new FencingTokenStorage();

// Client 1 acquires lock
const token1 = storage.acquireLockToken();
assert.strictEqual(token1, 1);

// Client 2 acquires lock (Client 1 suffered GC pause, lock timed out)
const token2 = storage.acquireLockToken();
assert.strictEqual(token2, 2);

// Client 2 writes to storage with Token 2
const write2 = storage.write(token2, 'shared_resource', 'Client-2 Valid Payload');
assert.strictEqual(write2.success, true);
assert.strictEqual(storage.read('shared_resource'), 'Client-2 Valid Payload');

// Client 1 awakes from GC pause and attempts to write with stale Token 1
assert.throws(
  () => storage.write(token1, 'shared_resource', 'Client-1 Corrupt Stale Payload'),
  /FencingTokenRejected/,
  'Storage must reject stale fencing token <= highest seen'
);

// Assert storage data was NOT overwritten
assert.strictEqual(
  storage.read('shared_resource'),
  'Client-2 Valid Payload',
  'Data must remain safe from stale client write'
);

console.log('  -> [PASSED] Fencing tokens eliminate GC pause / split-brain concurrency hazards.\n');

// ======================================================================
// Challenge 5: Hash Sharding Uniform Distribution
// ======================================================================
console.log('[Test 5] Testing Hash Sharding Uniform Distribution Across Nodes...');

const TOTAL_SHARDS = 4;
const router = new HashShardingRouter(TOTAL_SHARDS);
const shardCounts = new Array(TOTAL_SHARDS).fill(0);
const TOTAL_ENTITIES = 4000;

for (let i = 0; i < TOTAL_ENTITIES; i++) {
  const accountId = `user_acc_uuid_${i * 29 + 13}`;
  const shardIndex = router.getShard(accountId);
  assert.ok(shardIndex >= 0 && shardIndex < TOTAL_SHARDS);
  shardCounts[shardIndex]++;
}

console.log(`  -> Sharded ${TOTAL_ENTITIES} accounts across ${TOTAL_SHARDS} shards:`, shardCounts);

// Expected per shard is 1,000. Assert every shard is within 850 - 1150 (±15%)
for (let s = 0; s < TOTAL_SHARDS; s++) {
  assert.ok(
    shardCounts[s] >= 850 && shardCounts[s] <= 1150,
    `Shard ${s} count (${shardCounts[s]}) must be uniformly distributed around 1000`
  );
}

console.log('  -> [PASSED] Hash sharding router balances storage volume evenly.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 03 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
