// Automated Verification Test Suite for Module 08: Interview Framework & Estimation
import assert from 'node:assert';
import { SystemDesignEstimator } from './estimation_calculator.mjs';

console.log('=============================================================');
console.log('SYSTEM DESIGN MODULE 08: INTERVIEW ESTIMATION TEST SUITE');
console.log('=============================================================\n');

// Test 1: Twitter-Scale QPS and Peak QPS
console.log('[Test 1] Testing QPS & Traffic Spike Estimation (300M DAU)...');
const qpsResult = SystemDesignEstimator.calculateQps({
  dau: 300_000_000,
  requestsPerUser: 10,
  spikeMultiplier: 2.5
});
console.log(`  -> Daily requests: ${qpsResult.totalDailyRequests.toLocaleString()}`);
console.log(`  -> Average QPS:    ${qpsResult.averageQps.toLocaleString()} QPS`);
console.log(`  -> Peak QPS (2.5x): ${qpsResult.peakQps.toLocaleString()} QPS`);

assert.strictEqual(qpsResult.totalDailyRequests, 3_000_000_000);
assert.strictEqual(qpsResult.averageQps, 34722);
assert.strictEqual(qpsResult.peakQps, 86805);
console.log('  -> [PASSED] QPS and traffic spike multipliers correctly computed.\n');

// Test 2: 5-Year Storage Capacity Forecast with 3x Replication & 30% Headroom
console.log('[Test 2] Testing 5-Year Multi-Petabyte Storage Forecast...');
const storage = SystemDesignEstimator.estimateStorage({
  dailyWrites: 100_000_000, // 100M new posts/day
  avgPayloadBytes: 2048,    // 2 KB per post metadata
  years: 5,
  replicationFactor: 3,
  headroom: 1.3
});
console.log(`  -> Daily Ingestion:     ${storage.humanDaily}`);
console.log(`  -> 5-Year Raw Data:     ${storage.humanTotalRaw}`);
console.log(`  -> 5-Year Needed Disk:  ${storage.humanStorageNeeded}`);

assert.strictEqual(storage.humanDaily, '190.73 GB');
assert.strictEqual(storage.humanTotalRaw, '339.93 TB');
assert.strictEqual(storage.humanStorageNeeded, '1.29 PB');
console.log('  -> [PASSED] Storage estimation properly incorporates multi-year duration, replication, and safety buffers.\n');

// Test 3: Network Bandwidth Ingress and Egress
console.log('[Test 3] Testing Network Throughput & Gbps Bandwidth Conversion...');
const egress = SystemDesignEstimator.estimateBandwidth({
  qps: 50_000,
  avgPayloadBytes: 50_000 // 50 KB JSON payload
});
console.log(`  -> Egress Throughput: ${egress.throughputMBps} MB/s`);
console.log(`  -> Network Bandwidth: ${egress.bandwidthGbps} Gbps`);

assert.strictEqual(egress.throughputMBps, 2384.19);
assert.strictEqual(egress.bandwidthGbps, 19.07);
console.log('  -> [PASSED] High-throughput network bandwidth matches byte-to-bit conversion standards.\n');

// Test 4: 80/20 Pareto Cache RAM Sizing
console.log('[Test 4] Testing 80/20 Pareto Cache Sizing...');
const dailyReadBytes = 50 * 1024 * 1024 * 1024 * 1024; // 50 TB daily read data
const cache = SystemDesignEstimator.estimateCacheRam({
  dailyReadBytes,
  hotRatio: 0.2
});
console.log(`  -> Daily Read Volume: 50 TB`);
console.log(`  -> 20% Hot Cache RAM: ${cache.humanCacheRam}`);

assert.strictEqual(cache.humanCacheRam, '10 TB');
console.log('  -> [PASSED] Cache memory correctly sized according to Pareto distribution.\n');

// Test 5: Human-Readable Byte Formatting Edge Cases
console.log('[Test 5] Testing Byte Scale Formatting Utilities...');
assert.strictEqual(SystemDesignEstimator.formatBytes(0), '0 B');
assert.strictEqual(SystemDesignEstimator.formatBytes(1024), '1 KB');
assert.strictEqual(SystemDesignEstimator.formatBytes(1024 * 1024 * 1024), '1 GB');
assert.strictEqual(SystemDesignEstimator.formatBytes(1024 * 1024 * 1024 * 1024 * 1024 * 2.5), '2.5 PB');
console.log('  -> [PASSED] Unit conversions accurately scale from Bytes to Petabytes.\n');

console.log('=============================================================');
console.log('ALL 5 SYSTEM DESIGN MODULE 08 TESTS PASSED SUCCESSFULLY! (5/5)');
console.log('=============================================================');
