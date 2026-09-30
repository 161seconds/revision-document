// Automated Verification Test Suite for Module 07: Distributed Reliability, Resilience & Observability
import assert from 'node:assert';
import {
  CircuitBreaker,
  BackoffPolicy,
  W3CTraceContext,
  PNCounterCRDT,
  SWIMClusterSimulator
} from './resilience_simulators.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 07: RELIABILITY & RESILIENCE TEST SUITE');
console.log('=============================================================\n');

// Test 1: Circuit Breaker State Transitions & Fallbacks
console.log('[Test 1] Testing Circuit Breaker State Transitions & Fast-Fail Fallback...');
const cb = new CircuitBreaker({ failureThreshold: 0.5, recoveryTimeMs: 100, windowSize: 6 });

// Initial state: CLOSED
assert.strictEqual(cb.state, 'CLOSED');

// Trigger failures to trip the circuit
for (let i = 0; i < 4; i++) {
  try {
    await cb.execute(() => { throw new Error('DB connection timeout'); });
  } catch (e) {
    // expected failure
  }
}
assert.strictEqual(cb.state, 'OPEN', 'Circuit breaker must trip to OPEN after exceeding threshold');

// In OPEN state, calls should immediately trigger fallback without running downstream action
let actionCalled = false;
const fallbackResult = await cb.execute(
  () => { actionCalled = true; return 'live_data'; },
  () => 'cached_fallback_data'
);
assert.strictEqual(actionCalled, false, 'Downstream action must NOT be executed when OPEN');
assert.strictEqual(fallbackResult, 'cached_fallback_data');

// Wait for recovery timeout to transition to HALF_OPEN
await new Promise(r => setTimeout(r, 120));

// Successful trial run should reset state back to CLOSED
const trialResult = await cb.execute(() => 'recovered_data');
assert.strictEqual(trialResult, 'recovered_data');
assert.strictEqual(cb.state, 'CLOSED', 'Circuit breaker must close after successful trial');
console.log('  -> [PASSED] Circuit breaker properly transitions across Closed -> Open -> HalfOpen -> Closed.\n');

// Test 2: Exponential Backoff & Full Jitter Range
console.log('[Test 2] Testing Exponential Backoff with Full Jitter...');
for (let attempt = 0; attempt < 5; attempt++) {
  const delay = BackoffPolicy.getFullJitterDelay(attempt, 50, 1000);
  const maxPossible = Math.min(1000, 50 * Math.pow(2, attempt));
  assert.ok(delay >= 0 && delay <= maxPossible, `Delay ${delay} must be within [0, ${maxPossible}]`);
}
console.log('  -> [PASSED] Full jitter distribution stays strictly within calculated exponential bounds.\n');

// Test 3: W3C Distributed Trace Context Header Propagation
console.log('[Test 3] Testing W3C Trace Context Generation & Span Tree Creation...');
const rootHeader = W3CTraceContext.createRootHeader(true);
console.log(`  -> Root traceparent:  ${rootHeader}`);

const parsed = W3CTraceContext.parse(rootHeader);
assert.strictEqual(parsed.version, '00');
assert.strictEqual(parsed.traceId.length, 32);
assert.strictEqual(parsed.parentSpanId.length, 16);
assert.strictEqual(parsed.sampled, true);

// Child span creation
const childSpan = W3CTraceContext.createChildSpan(rootHeader);
console.log(`  -> Child traceparent: ${childSpan.header}`);

assert.strictEqual(childSpan.traceId, parsed.traceId, 'Trace ID must be globally preserved across services');
assert.notStrictEqual(childSpan.spanId, parsed.parentSpanId, 'Child must have unique span ID');
console.log('  -> [PASSED] W3C traceparent headers correctly propagate across service boundaries.\n');

// Test 4: Conflict-Free Multi-Region CRDT Synchronization
console.log('[Test 4] Testing Conflict-Free Replicated Data Types (PN-Counter CRDT)...');
const counterSingapore = new PNCounterCRDT('region_singapore');
const counterVirginia = new PNCounterCRDT('region_virginia');

// Singapore operations
counterSingapore.increment(10);
counterSingapore.decrement(3); // Singapore net = +7

// Virginia operations
counterVirginia.increment(25);
counterVirginia.decrement(5); // Virginia net = +20

// Cross-Region Replication (CRR) sync
const synced1 = counterSingapore.merge(counterVirginia);
const synced2 = counterVirginia.merge(counterSingapore);

console.log(`  -> Singapore counter value before merge: ${counterSingapore.value()}`);
console.log(`  -> Virginia counter value before merge:  ${counterVirginia.value()}`);
console.log(`  -> Merged global counter value:         ${synced1.value()}`);

assert.strictEqual(synced1.value(), 27, 'Net value must be (10 - 3) + (25 - 5) = 27');
assert.strictEqual(synced1.value(), synced2.value(), 'Merge must be commutative: A.merge(B) == B.merge(A)');
console.log('  -> [PASSED] PN-Counter achieves mathematical eventual consistency without locks or collisions.\n');

// Test 5: SWIM Gossip Protocol Failure Detection
console.log('[Test 5] Testing SWIM Indirect Ping-Req & Suspicion States...');
const cluster = new SWIMClusterSimulator();
cluster.addNode('node_alpha', true);
cluster.addNode('node_beta', true);
cluster.addNode('node_gamma', true);
cluster.addNode('node_delta', false); // node_delta is dead / down

// Ping healthy node
const healthBeta = cluster.evaluateNodeHealth('node_alpha', 'node_beta', ['node_gamma']);
assert.strictEqual(healthBeta, 'ALIVE');

// Ping dead node
const healthDelta = cluster.evaluateNodeHealth('node_alpha', 'node_delta', ['node_beta', 'node_gamma']);
assert.strictEqual(healthDelta, 'SUSPECT');
console.log('  -> [PASSED] SWIM protocol accurately differentiates path failure from true node failure.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 07 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
