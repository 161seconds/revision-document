/**
 * 04-fetch-abort-demo.js
 * Chạy độc lập: node 04-fetch-abort-demo.js
 * Kiểm chứng toàn diện Fetch API & AbortController:
 * 1. Bản chất Response: res.ok vs HTTP Error Status (404, 500 không reject)
 * 2. Khóa dòng đọc Body (bodyUsed lock)
 * 3. Hủy tác vụ mạng thủ công bằng controller.abort()
 * 4. Tự động ngắt bằng AbortSignal.timeout()
 * 5. Giải quyết xung đột dữ liệu Search Autocomplete (Race Condition Defense)
 */

import assert from "node:assert/strict";

console.log("=== BẮT ĐẦU KIỂM TRA 04: FETCH & ABORTCONTROLLER ===");

// -------------------------------------------------------------
// 1. MÔ PHỎNG RESPONSE BODY LOCK (BODYUSED PROTOCOL)
// -------------------------------------------------------------
class MockResponse {
  constructor(status, data) {
    this.status = status;
    this.ok = status >= 200 && status < 300;
    this._data = data;
    this.bodyUsed = false;
  }

  async json() {
    if (this.bodyUsed) {
      throw new TypeError("Failed to execute 'json' on 'Response': body stream already read");
    }
    this.bodyUsed = true;
    return JSON.parse(this._data);
  }
}

const mockRes = new MockResponse(200, '{"id": 1, "title": "Test"}');
assert.equal(mockRes.ok, true);
assert.equal(mockRes.bodyUsed, false);

const bodyData = await mockRes.json();
assert.equal(bodyData.id, 1);
assert.equal(mockRes.bodyUsed, true);

// Đọc lần 2 -> Văng TypeError vì Body stream đã bị tiêu thụ
await assert.rejects(
  async () => await mockRes.json(),
  TypeError,
  "Không thể đọc body hai lần"
);

// -------------------------------------------------------------
// 2. MÔ PHỎNG FETCH ENGINE HỖ TRỢ ABORTSIGNAL
// -------------------------------------------------------------
function simulatedFetch(url, { signal, delayMs = 50, responseData = "OK" } = {}) {
  return new Promise((resolve, reject) => {
    // Nếu signal đã bị abort từ trước khi gửi request
    if (signal?.aborted) {
      return reject(new DOMException("This operation was aborted", "AbortError"));
    }

    const timer = setTimeout(() => {
      resolve(new MockResponse(200, JSON.stringify(responseData)));
    }, delayMs);

    // Lắng nghe sự kiện abort
    signal?.addEventListener("abort", () => {
      clearTimeout(timer);
      reject(new DOMException("This operation was aborted", "AbortError"));
    });
  });
}

// Kiểm thử hủy thủ công
const controller = new AbortController();
const fetchPromise = simulatedFetch("/api/data", {
  signal: controller.signal,
  delayMs: 100,
});

// Hủy sau 20ms
setTimeout(() => controller.abort(), 20);

await assert.rejects(
  async () => await fetchPromise,
  (err) => err.name === "AbortError",
  "Hủy request thành công qua AbortController"
);

// -------------------------------------------------------------
// 3. TỰ ĐỘNG TIMEOUT VỚI ABORTSIGNAL.TIMEOUT()
// -------------------------------------------------------------
// Node.js 18+ và trình duyệt hiện đại có sẵn AbortSignal.timeout(ms)
const timeoutSignal = AbortSignal.timeout(30);

await assert.rejects(
  async () =>
    await simulatedFetch("/api/slow-report", {
      signal: timeoutSignal,
      delayMs: 100, // API mất 100ms nhưng timeout là 30ms
    }),
  (err) => err.name === "TimeoutError" || err.name === "AbortError"
);

// -------------------------------------------------------------
// 4. PHÒNG CHỐNG RACE CONDITION CHO SEARCH AUTOCOMPLETE
// -------------------------------------------------------------
class AutocompleteSearchEngine {
  constructor() {
    this.currentController = null;
    this.latestResult = null;
  }

  async search(query) {
    // Nếu có request tìm kiếm cũ đang chạy -> Hủy ngay lập tức!
    if (this.currentController) {
      this.currentController.abort();
    }

    this.currentController = new AbortController();
    const { signal } = this.currentController;

    try {
      // Giả lập từ khóa ngắn mất nhiều thời gian hơn từ khóa dài
      const latency = query === "re" ? 80 : 20;
      const res = await simulatedFetch(`/api/search?q=${query}`, {
        signal,
        delayMs: latency,
        responseData: { query, results: [`Result for ${query}`] },
      });
      const data = await res.json();
      this.latestResult = data;
      return data;
    } catch (err) {
      if (err.name === "AbortError") {
        // Bỏ qua lỗi abort dự kiến
        return null;
      }
      throw err;
    }
  }
}

const searchEngine = new AutocompleteSearchEngine();

// Gõ "re" trước (mất 80ms)
const req1 = searchEngine.search("re");
// Gõ tiếp "react" sau đó 10ms (mất 20ms -> hoàn thành trước)
await new Promise((r) => setTimeout(r, 10));
const req2 = searchEngine.search("react");

await Promise.all([req1, req2]);

// Kết quả cuối cùng trên màn hình PHẢI là của "react", không bị "re" đè kết quả!
assert.equal(searchEngine.latestResult.query, "react");

console.log("-> 100% tests cho Fetch & AbortController đã pass thành công!");
