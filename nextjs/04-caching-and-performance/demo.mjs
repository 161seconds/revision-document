// Module 04: Next.js 4-Tier Caching Engine Simulation Demo
// Mô phỏng Request Memoization, Data Cache và Tag-Based Revalidation

export class NextCacheEngine {
  constructor() {
    this.requestMemo = new Map(); // Tầng 1: Trong chu kỳ render đơn
    this.dataCache = new Map();   // Tầng 2: Bền vững giữa các request
    this.originFetchCount = 0;    // Đếm số lần thực sự gọi ra ngoài
  }

  resetRequestMemo() {
    this.requestMemo.clear();
  }

  async fetch(url, options = {}) {
    const cacheMode = options.cache || "force-cache";
    const revalidateTtl = options.next?.revalidate;
    const tags = options.next?.tags || [];

    // 1. Kiểm tra Request Memoization (Cùng render pass)
    const memoKey = `${url}:${JSON.stringify(options)}`;
    if (this.requestMemo.has(memoKey)) {
      console.log(`[Cache Hit: Request Memo] "${url}"`);
      return this.requestMemo.get(memoKey);
    }

    // 2. Nếu { cache: 'no-store' } -> Bỏ qua Data Cache, gọi thẳng Origin
    if (cacheMode === "no-store") {
      console.log(`[Cache Bypass: no-store] Gọi Origin cho "${url}"`);
      this.originFetchCount++;
      const res = { data: `Fresh data for ${url} at ${Date.now()}` };
      this.requestMemo.set(memoKey, res);
      return res;
    }

    // 3. Kiểm tra Data Cache bền vững
    const now = Date.now();
    if (this.dataCache.has(url)) {
      const entry = this.dataCache.get(url);
      const isExpired = entry.expiresAt !== null && now > entry.expiresAt;

      if (!isExpired) {
        console.log(`[Cache Hit: Data Cache] "${url}" (Tags: ${entry.tags.join(", ")})`);
        this.requestMemo.set(memoKey, entry.data);
        return entry.data;
      }
      console.log(`[Cache Expired: TTL Timeout] "${url}" đã quá hạn, tái tạo lại...`);
    }

    // 4. Cache Miss hoặc Expired -> Gọi Origin Server
    console.log(`[Cache Miss: Calling Origin] Lần gọi #${++this.originFetchCount} cho "${url}"`);
    const freshData = { data: `Payload of ${url}`, fetchedAt: now };

    const expiresAt = typeof revalidateTtl === "number" ? now + revalidateTtl * 1000 : null;

    this.dataCache.set(url, {
      data: freshData,
      expiresAt,
      tags
    });

    this.requestMemo.set(memoKey, freshData);
    return freshData;
  }

  revalidateTag(targetTag) {
    let purgedCount = 0;
    for (const [url, entry] of this.dataCache.entries()) {
      if (entry.tags.includes(targetTag)) {
        this.dataCache.delete(url);
        purgedCount++;
      }
    }
    console.log(`[RevalidateTag Action] Đã xóa ${purgedCount} entries có tag "${targetTag}"`);
  }
}

// Chạy demo
console.log("=== NEXT.JS 4-TIER CACHE DEMO ===");
(async () => {
  const engine = new NextCacheEngine();

  console.log("\n--- CHU KỲ RENDER 1 (User A ghé thăm trang) ---");
  // Component A gọi fetch
  await engine.fetch("https://api/products", { next: { tags: ["products"], revalidate: 60 } });
  // Component B ở một nhánh khác của cây component gọi cùng fetch -> Request Memoization bắt được!
  await engine.fetch("https://api/products", { next: { tags: ["products"], revalidate: 60 } });

  console.log(`Tổng số lần gọi Origin Server trong chu kỳ 1: ${engine.originFetchCount} (Lẽ ra là 2 nếu không có Memoization)`);

  console.log("\n--- CHU KỲ RENDER 2 (User B ghé thăm trang sau đó) ---");
  engine.resetRequestMemo(); // Render pass mới
  // Lấy thẳng từ Data Cache!
  await engine.fetch("https://api/products", { next: { tags: ["products"], revalidate: 60 } });
  console.log(`Tổng số lần gọi Origin Server: ${engine.originFetchCount} (Vẫn là 1!)`);

  console.log("\n--- THỰC HIỆN SERVER ACTION: REVALIDATE TAG ---");
  engine.revalidateTag("products");

  console.log("\n--- CHU KỲ RENDER 3 (Sau khi Revalidate) ---");
  engine.resetRequestMemo();
  await engine.fetch("https://api/products", { next: { tags: ["products"], revalidate: 60 } });
  console.log(`Tổng số lần gọi Origin Server sau khi xóa cache: ${engine.originFetchCount} (Đã gọi lại Origin!)`);
})();
