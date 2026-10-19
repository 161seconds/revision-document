// Module 04 Practice: Caching & Web Performance Optimization
// Yêu cầu: Hoàn thành các hàm đánh giá Cache Decision, Xóa Cache theo Tag và Chấm điểm Web Vitals.

import assert from "node:assert/strict";

/**
 * Bài 1: Đánh giá quyết định Cache cho lời gọi fetch (Cache Decision Engine)
 * - options: { cache?: string, next?: { revalidate?: number | false, tags?: string[] } }
 * - existingEntry: { data: any, cachedAt: number, ttlSeconds: number | null, tags: string[] } | null
 * - currentTimeMs: number (thời gian hiện tại tính bằng milliseconds)
 * 
 * Logic:
 * 1. Nếu options.cache === 'no-store' -> { source: 'NETWORK', reason: 'NO_STORE' }
 * 2. Nếu không có existingEntry -> { source: 'NETWORK', reason: 'CACHE_MISS' }
 * 3. Nếu existingEntry có ttlSeconds và currentTimeMs > cachedAt + ttlSeconds * 1000
 *    -> { source: 'STALE_REVALIDATE', reason: 'TTL_EXPIRED' }
 * 4. Ngược lại -> { source: 'CACHE_HIT', data: existingEntry.data }
 */
export function evaluateFetchCacheDecision(options = {}, existingEntry = null, currentTimeMs = Date.now()) {
  const cacheMode = options.cache || "force-cache";

  if (cacheMode === "no-store") {
    return { source: "NETWORK", reason: "NO_STORE" };
  }

  if (!existingEntry) {
    return { source: "NETWORK", reason: "CACHE_MISS" };
  }

  if (typeof existingEntry.ttlSeconds === "number" && existingEntry.ttlSeconds > 0) {
    const expiresAt = existingEntry.cachedAt + existingEntry.ttlSeconds * 1000;
    if (currentTimeMs > expiresAt) {
      return { source: "STALE_REVALIDATE", reason: "TTL_EXPIRED" };
    }
  }

  return { source: "CACHE_HIT", data: existingEntry.data };
}

/**
 * Bài 2: Hủy bỏ Cache theo Tag (Tag-based Cache Invalidation)
 * - cacheMap: Map<string, { data: any, tags: string[] }>
 * - targetTag: string (tag cần xóa)
 * - Xóa tất cả các entry mà tags chứa targetTag.
 * - Trả về mảng chứa danh sách các key bị xóa.
 */
export function purgeCacheByTags(cacheMap, targetTag) {
  const deletedKeys = [];

  for (const [key, entry] of cacheMap.entries()) {
    if (Array.isArray(entry.tags) && entry.tags.includes(targetTag)) {
      cacheMap.delete(key);
      deletedKeys.push(key);
    }
  }

  return deletedKeys;
}

/**
 * Bài 3: Chấm điểm và xếp hạng Core Web Vitals theo tiêu chuẩn Google
 * - metrics: { lcpMs: number, inpMs: number, cls: number }
 * 
 * Barem Google:
 * - LCP (Largest Contentful Paint):
 *     Good: <= 2500ms | Needs Improvement: <= 4000ms | Poor: > 4000ms
 * - INP (Interaction to Next Paint):
 *     Good: <= 200ms  | Needs Improvement: <= 500ms  | Poor: > 500ms
 * - CLS (Cumulative Layout Shift):
 *     Good: <= 0.1    | Needs Improvement: <= 0.25   | Poor: > 0.25
 * 
 * Overall:
 * - 'GOOD': Khi cả 3 chỉ số đều 'GOOD'
 * - 'POOR': Khi có ít nhất 1 chỉ số 'POOR'
 * - 'NEEDS_IMPROVEMENT': Các trường hợp còn lại
 */
export function scoreCoreWebVitals(metrics) {
  function score(val, goodThreshold, needsThreshold) {
    if (val <= goodThreshold) return "GOOD";
    if (val <= needsThreshold) return "NEEDS_IMPROVEMENT";
    return "POOR";
  }

  const lcpGrade = score(metrics.lcpMs, 2500, 4000);
  const inpGrade = score(metrics.inpMs, 200, 500);
  const clsGrade = score(metrics.cls, 0.1, 0.25);

  const grades = [lcpGrade, inpGrade, clsGrade];

  let overall = "NEEDS_IMPROVEMENT";
  if (grades.every((g) => g === "GOOD")) {
    overall = "GOOD";
  } else if (grades.some((g) => g === "POOR")) {
    overall = "POOR";
  }

  return {
    lcp: lcpGrade,
    inp: inpGrade,
    cls: clsGrade,
    overall
  };
}

// ==========================================
// BỘ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)
// ==========================================
console.log("-> Running Next.js Module 04 Practice Tests...");

const now = 1700000000000;

// Test 1: evaluateFetchCacheDecision
const decNoStore = evaluateFetchCacheDecision({ cache: "no-store" }, { data: "old" }, now);
assert.equal(decNoStore.source, "NETWORK");
assert.equal(decNoStore.reason, "NO_STORE");

const decMiss = evaluateFetchCacheDecision({}, null, now);
assert.equal(decMiss.source, "NETWORK");
assert.equal(decMiss.reason, "CACHE_MISS");

const decHit = evaluateFetchCacheDecision(
  {},
  { data: "cached-posts", cachedAt: now - 10000, ttlSeconds: 60, tags: [] },
  now
);
assert.equal(decHit.source, "CACHE_HIT");
assert.equal(decHit.data, "cached-posts");

const decExpired = evaluateFetchCacheDecision(
  {},
  { data: "old-news", cachedAt: now - 70000, ttlSeconds: 60, tags: [] },
  now
);
assert.equal(decExpired.source, "STALE_REVALIDATE");
assert.equal(decExpired.reason, "TTL_EXPIRED");

// Test 2: purgeCacheByTags
const mockCache = new Map();
mockCache.set("/products/1", { data: "p1", tags: ["products", "item-1"] });
mockCache.set("/products/2", { data: "p2", tags: ["products", "item-2"] });
mockCache.set("/blog/1", { data: "b1", tags: ["posts"] });

const purged = purgeCacheByTags(mockCache, "products");
assert.deepEqual(purged.sort(), ["/products/1", "/products/2"].sort());
assert.equal(mockCache.size, 1);
assert.ok(mockCache.has("/blog/1"));

// Test 3: scoreCoreWebVitals
const perfectMetrics = { lcpMs: 1800, inpMs: 120, cls: 0.04 };
const resPerfect = scoreCoreWebVitals(perfectMetrics);
assert.equal(resPerfect.overall, "GOOD");
assert.equal(resPerfect.lcp, "GOOD");
assert.equal(resPerfect.inp, "GOOD");
assert.equal(resPerfect.cls, "GOOD");

const poorMetrics = { lcpMs: 4500, inpMs: 150, cls: 0.05 };
const resPoor = scoreCoreWebVitals(poorMetrics);
assert.equal(resPoor.overall, "POOR");
assert.equal(resPoor.lcp, "POOR");

const midMetrics = { lcpMs: 2800, inpMs: 250, cls: 0.08 };
const resMid = scoreCoreWebVitals(midMetrics);
assert.equal(resMid.overall, "NEEDS_IMPROVEMENT");

console.log("✅ All Next.js Module 04 practice tests passed successfully!");
