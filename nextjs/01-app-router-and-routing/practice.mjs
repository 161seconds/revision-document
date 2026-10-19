// Module 01 Practice: App Router & File-System Routing
// Yêu cầu: Hoàn thành các hàm xử lý routing bên dưới để vượt qua 100% assertions tự động.

import assert from "node:assert/strict";

/**
 * Bài 1: Chuẩn hóa đường dẫn URL (Normalize Pathname)
 * - Loại bỏ trailing slash ở cuối (ngoại trừ root '/')
 * - Xóa các ký tự '/' liên tiếp bị thừa (vd: '//blog///post' -> '/blog/post')
 * - Luôn đảm bảo bắt đầu bằng '/'
 */
export function normalizeRoutePath(pathname) {
  if (!pathname || pathname === "/") return "/";
  const cleaned = pathname.replace(/\/+/g, "/").replace(/\/+$/, "");
  return cleaned.startsWith("/") ? cleaned : "/" + cleaned;
}

/**
 * Bài 2: Chuyển đổi đường dẫn file App Router thành URL công khai
 * - Loại bỏ tiền tố 'app' hoặc '/app'
 * - Bỏ qua các thư mục Route Group có ngoặc đơn, ví dụ: '(marketing)', '(auth)', '(dashboard)'
 * - Loại bỏ tên file đặc biệt ở cuối: 'page.tsx', 'page.jsx', 'page.js'
 * - Ví dụ: 'app/(marketing)/about/page.tsx' -> '/about'
 * - Ví dụ: 'app/(auth)/(admin)/settings/page.tsx' -> '/settings'
 * - Ví dụ: 'app/page.tsx' -> '/'
 */
export function fileRouteToPublicUrl(filePath) {
  // Chuẩn hóa dấu phân cách
  const segments = filePath.replace(/\\/g, "/").split("/").filter(Boolean);
  
  const publicSegments = [];
  for (const seg of segments) {
    if (seg === "app") continue;
    if (seg.startsWith("(") && seg.endsWith(")")) continue; // Bỏ qua Route Group
    if (seg.startsWith("page.")) continue; // Bỏ qua tên file page
    publicSegments.push(seg);
  }

  return publicSegments.length === 0 ? "/" : "/" + publicSegments.join("/");
}

/**
 * Bài 3: So khớp và trích xuất tham số động (Dynamic Parameters Matcher)
 * - Hỗ trợ static segment: 'posts'
 * - Hỗ trợ dynamic segment: '[id]' -> params.id = '123'
 * - Hỗ trợ catch-all segment: '[...slug]' -> params.slug = ['a', 'b']
 * - Hỗ trợ optional catch-all: '[[...slug]]' -> params.slug = undefined hoặc ['a', 'b']
 * - Trả về object params nếu khớp, hoặc null nếu không khớp
 */
export function extractRouteParams(pattern, pathname) {
  const normPattern = normalizeRoutePath(pattern);
  const normPath = normalizeRoutePath(pathname);

  const pSegments = normPattern.split("/").filter(Boolean);
  const uSegments = normPath.split("/").filter(Boolean);

  const params = {};
  let uIdx = 0;

  for (let pIdx = 0; pIdx < pSegments.length; pIdx++) {
    const pSeg = pSegments[pIdx];

    // Optional catch-all: [[...slug]]
    if (pSeg.startsWith("[[...") && pSeg.endsWith("]]")) {
      const key = pSeg.slice(5, -2);
      const rest = uSegments.slice(uIdx);
      params[key] = rest.length > 0 ? rest : undefined;
      return params;
    }

    // Catch-all: [...slug]
    if (pSeg.startsWith("[...") && pSeg.endsWith("]")) {
      const key = pSeg.slice(4, -1);
      const rest = uSegments.slice(uIdx);
      if (rest.length === 0) return null; // Catch-all bắt buộc ít nhất 1 segment
      params[key] = rest;
      return params;
    }

    if (uIdx >= uSegments.length) {
      return null;
    }

    const uSeg = uSegments[uIdx];

    // Dynamic segment: [id]
    if (pSeg.startsWith("[") && pSeg.endsWith("]")) {
      const key = pSeg.slice(1, -1);
      params[key] = uSeg;
    } else if (pSeg !== uSeg) {
      return null;
    }

    uIdx++;
  }

  if (uIdx === uSegments.length) {
    return params;
  }

  return null;
}

// ==========================================
// BỘ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)
// ==========================================
console.log("-> Running Next.js Module 01 Practice Tests...");

// Test 1: normalizeRoutePath
assert.equal(normalizeRoutePath(""), "/");
assert.equal(normalizeRoutePath("/"), "/");
assert.equal(normalizeRoutePath("//blog///post//"), "/blog/post");
assert.equal(normalizeRoutePath("products/electronics/"), "/products/electronics");

// Test 2: fileRouteToPublicUrl
assert.equal(fileRouteToPublicUrl("app/page.tsx"), "/");
assert.equal(fileRouteToPublicUrl("app/(marketing)/about/page.tsx"), "/about");
assert.equal(fileRouteToPublicUrl("app/(auth)/(admin)/users/page.tsx"), "/users");
assert.equal(fileRouteToPublicUrl("app/shop/[category]/page.tsx"), "/shop/[category]");

// Test 3: extractRouteParams
const p1 = extractRouteParams("/blog/[slug]", "/blog/hello-nextjs");
assert.deepEqual(p1, { slug: "hello-nextjs" });

const p2 = extractRouteParams("/users/[id]/posts/[postId]", "/users/42/posts/99");
assert.deepEqual(p2, { id: "42", postId: "99" });

const p3 = extractRouteParams("/docs/[...path]", "/docs/api/v1/users");
assert.deepEqual(p3, { path: ["api", "v1", "users"] });

const pFail = extractRouteParams("/docs/[...path]", "/docs");
assert.equal(pFail, null);

const pOptionalEmpty = extractRouteParams("/shop/[[...slug]]", "/shop");
assert.deepEqual(pOptionalEmpty, { slug: undefined });

const pOptionalFilled = extractRouteParams("/shop/[[...slug]]", "/shop/shoes/nike");
assert.deepEqual(pOptionalFilled, { slug: ["shoes", "nike"] });

const pMismatch = extractRouteParams("/posts/[id]", "/products/123");
assert.equal(pMismatch, null);

console.log("✅ All Next.js Module 01 practice tests passed successfully!");
