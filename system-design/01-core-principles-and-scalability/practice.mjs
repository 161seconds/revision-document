// System Design & Distributed Systems - Module 01 Practice Verification Suite
import assert from 'node:assert/strict';
import {
  ConsistentHashRing,
  WeightedRoundRobinBalancer,
  AvailabilityMath,
} from './load_balancer_simulator.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 01: SCALABILITY & RELIABILITY TEST SUITE');
console.log('=============================================================\n');

// ======================================================================
// Challenge 1: Consistent Hashing Key Relocation Bounds
// ======================================================================
console.log('[Test 1] Testing Consistent Hashing Minimal Key Relocation vs Modulo...');

const ring = new ConsistentHashRing(150); // 150 vnodes per physical node
ring.addNode('node-us-east');
ring.addNode('node-us-west');
ring.addNode('node-eu-central');

const TOTAL_KEYS = 2000;
const initialKeyDistribution = new Map();

for (let i = 0; i < TOTAL_KEYS; i++) {
  const key = `user_session_token_${i}_payload`;
  const assignedNode = ring.getNode(key);
  assert.ok(assignedNode !== null, 'Key must be assigned to a valid node');
  initialKeyDistribution.set(key, assignedNode);
}

// Add 4th node: node-ap-southeast
ring.addNode('node-ap-southeast');

let relocatedKeys = 0;
for (let i = 0; i < TOTAL_KEYS; i++) {
  const key = `user_session_token_${i}_payload`;
  const newNode = ring.getNode(key);
  if (newNode !== initialKeyDistribution.get(key)) {
    relocatedKeys++;
  }
}

const relocationFraction = relocatedKeys / TOTAL_KEYS;
console.log(`  -> Initial nodes: 3, Final nodes: 4. Keys relocated: ${relocatedKeys}/${TOTAL_KEYS} (${(relocationFraction * 100).toFixed(1)}%)`);

// Theoretical optimal relocation is 1 / 4 = 25.0%.
// Modulo hashing would have relocated ~75% to 100% of keys.
assert.ok(
  relocationFraction >= 0.18 && relocationFraction <= 0.32,
  `Consistent hashing relocation fraction must be close to 25% (got ${(relocationFraction * 100).toFixed(1)}%)`
);
console.log('  -> [PASSED] Consistent hashing prevents catastrophic cache stampede on scale-out.\n');

// ======================================================================
// Challenge 2: High Availability Mathematics & Parallel Redundancy
// ======================================================================
console.log('[Test 2] Testing Series vs Parallel Availability & Downtime Math...');

// Series degradation: 3 tiers of 99.9% (0.999)
const seriesAvailability = AvailabilityMath.calculateSeries([0.999, 0.999, 0.999]);
const expectedSeries = 0.999 * 0.999 * 0.999;
assert.strictEqual(
  Math.abs(seriesAvailability - expectedSeries) < 1e-6,
  true,
  'Series availability must equal product of components'
);
assert.ok(seriesAvailability < 0.998, 'Series availability must degrade below 99.8%');

// Parallel improvement: 2 nodes of 99% (0.99)
const parallelAvailability = AvailabilityMath.calculateParallel([0.99, 0.99]);
assert.strictEqual(
  Math.abs(parallelAvailability - 0.9999) < 1e-6,
  true,
  'Parallel redundancy of two 99% nodes must elevate availability to 99.99% (Four Nines)'
);

// Annual downtime check for Four Nines (99.99%)
const downtimeMinutes = AvailabilityMath.calculateAnnualDowntimeMinutes(99.99);
console.log(`  -> Annual downtime for 99.99% (Four Nines): ${downtimeMinutes.toFixed(2)} minutes`);
assert.ok(
  downtimeMinutes >= 52.5 && downtimeMinutes <= 52.7,
  'Annual downtime for 99.99% must be approximately 52.6 minutes'
);
console.log('  -> [PASSED] High Availability series/parallel formulas and SLA budgets verified.\n');

// ======================================================================
// Challenge 3: Smooth Weighted Round-Robin Load Distribution
// ======================================================================
console.log('[Test 3] Testing Weighted Round-Robin Load Distribution...');

const balancer = new WeightedRoundRobinBalancer([
  { id: 'app-node-high-spec', weight: 5 },
  { id: 'app-node-medium-1', weight: 1 },
  { id: 'app-node-medium-2', weight: 1 },
]);

const requestCounts = new Map([
  ['app-node-high-spec', 0],
  ['app-node-medium-1', 0],
  ['app-node-medium-2', 0],
]);

const TOTAL_REQUESTS = 70;
for (let i = 0; i < TOTAL_REQUESTS; i++) {
  const chosenServer = balancer.selectServer();
  requestCounts.set(chosenServer, requestCounts.get(chosenServer) + 1);
}

console.log('  -> Request distribution over 70 requests:', Object.fromEntries(requestCounts));
assert.strictEqual(
  requestCounts.get('app-node-high-spec'),
  50,
  'High-spec node with weight 5 must receive exactly 50 out of 70 requests'
);
assert.strictEqual(
  requestCounts.get('app-node-medium-1'),
  10,
  'Medium-1 node with weight 1 must receive exactly 10 requests'
);
assert.strictEqual(
  requestCounts.get('app-node-medium-2'),
  10,
  'Medium-2 node with weight 1 must receive exactly 10 requests'
);
console.log('  -> [PASSED] Weighted Round-Robin guarantees proportional load without starvation.\n');

// ======================================================================
// Challenge 4: Dynamo-Style Distinct Node Replication Quorum
// ======================================================================
console.log('[Test 4] Testing Dynamo-Style Distinct Node Replication Quorum...');

const clusterRing = new ConsistentHashRing(200);
clusterRing.addNode('dynamo-node-1');
clusterRing.addNode('dynamo-node-2');
clusterRing.addNode('dynamo-node-3');
clusterRing.addNode('dynamo-node-4');

const sampleKey = 'order_invoice_83729_checksum';
const replicationFactor = 3;
const replicas = clusterRing.getReplicationNodes(sampleKey, replicationFactor);

console.log(`  -> Key "${sampleKey}" replicas:`, replicas);
assert.strictEqual(replicas.length, 3, 'Must return exactly 3 replica nodes');

// Ensure all 3 replica nodes are distinct physical servers despite interleaved vnodes
const uniqueNodes = new Set(replicas);
assert.strictEqual(
  uniqueNodes.size,
  3,
  'Replication nodes must be physically distinct servers to satisfy fault tolerance'
);
console.log('  -> [PASSED] Multi-node replication filters out duplicate vnodes correctly.\n');

// ======================================================================
// Challenge 5: PACELC Architectural Classification Engine
// ======================================================================
console.log('[Test 5] Testing PACELC Architectural Classification Rules...');

function classifyPacelc(system) {
  const catalog = {
    postgresql: { type: 'PC/EC', partition: 'Consistency', normal: 'Consistency' },
    mongodb_default: { type: 'PC/EC', partition: 'Consistency', normal: 'Consistency' },
    cassandra: { type: 'PA/EL', partition: 'Availability', normal: 'Latency' },
    dynamodb_eventual: { type: 'PA/EL', partition: 'Availability', normal: 'Latency' },
    amazon_s3: { type: 'PA/EC', partition: 'Availability', normal: 'Consistency' },
  };

  const entry = catalog[system.toLowerCase()];
  if (!entry) throw new Error(`Unknown system: ${system}`);
  return entry;
}

const cassandraConfig = classifyPacelc('cassandra');
assert.strictEqual(cassandraConfig.type, 'PA/EL', 'Cassandra must be classified as PA/EL');
assert.strictEqual(cassandraConfig.partition, 'Availability', 'Cassandra prioritizes Availability during partition');
assert.strictEqual(cassandraConfig.normal, 'Latency', 'Cassandra prioritizes Low Latency during normal operations');

const pgConfig = classifyPacelc('postgresql');
assert.strictEqual(pgConfig.type, 'PC/EC', 'PostgreSQL must be classified as PC/EC');
assert.strictEqual(pgConfig.normal, 'Consistency', 'PostgreSQL enforces Consistency during normal operations');

const s3Config = classifyPacelc('amazon_s3');
assert.strictEqual(s3Config.type, 'PA/EC', 'Amazon S3 must be classified as PA/EC');

console.log('  -> [PASSED] PACELC classifications and trade-off invariants verified.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 01 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
