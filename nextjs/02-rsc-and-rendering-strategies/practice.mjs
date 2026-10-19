// Module 02 Practice: RSC & Rendering Strategies
// Yêu cầu: Hoàn thành các hàm phân tích ranh giới Client-Server và chiến lược Rendering.

import assert from "node:assert/strict";

/**
 * Bài 1: Kiểm tra tính tuần tự hóa của Props qua ranh giới Client Boundary
 * - Kiểm tra xem object `props` truyền vào Client Component có hợp lệ không.
 * - Hợp lệ: string, number, boolean, null, undefined, plain object, array.
 * - Không hợp lệ: function (trừ khi là Server Action đánh dấu $$typeof), symbol, class instance không phải plain object.
 * - Trả về: { valid: true } hoặc { valid: false, reason: string }
 */
export function validateClientBoundaryProps(props) {
  if (props === null || props === undefined) return { valid: true };

  const seen = new WeakSet();

  function check(val, path = "props") {
    if (val === null || val === undefined) return true;
    const type = typeof val;

    if (type === "string" || type === "number" || type === "boolean") {
      return true;
    }

    if (type === "function") {
      // Cho phép nếu có cờ Server Action
      if (val.$$typeof === "Symbol(server.action)") return true;
      throw new Error(`Invalid function at ${path}`);
    }

    if (type === "symbol") {
      throw new Error(`Invalid symbol at ${path}`);
    }

    if (type === "object") {
      if (seen.has(val)) {
        throw new Error(`Circular reference detected at ${path}`);
      }
      seen.add(val);

      if (Array.isArray(val)) {
        for (let i = 0; i < val.length; i++) {
          check(val[i], `${path}[${i}]`);
        }
        return true;
      }

      // Kiểm tra Plain Object (không phải instance của class tự tạo)
      const proto = Object.getPrototypeOf(val);
      if (proto !== Object.prototype && proto !== null) {
        throw new Error(`Non-plain object/class instance at ${path}`);
      }

      for (const [k, v] of Object.entries(val)) {
        check(v, `${path}.${k}`);
      }
      return true;
    }

    return true;
  }

  try {
    check(props);
    return { valid: true };
  } catch (err) {
    return { valid: false, reason: err.message };
  }
}

/**
 * Bài 2: Xác định chiến lược Rendering (Rendering Strategy Decision Engine)
 * - 'STATIC' (SSG): Build-time rendering, không dùng dynamic function, không revalidate
 * - 'DYNAMIC' (SSR): Request-time rendering, sử dụng cookies, headers, searchParams hoặc force-dynamic
 * - 'ISR': Dùng revalidate dạng số (ví dụ 60s) mà không có dynamic function
 */
export function determineRenderingStrategy(config = {}) {
  const {
    dynamic = "auto",
    usesCookies = false,
    usesHeaders = false,
    usesSearchParams = false,
    revalidate = false
  } = config;

  // 1. Cưỡng chế force-static
  if (dynamic === "force-static") {
    return "STATIC";
  }

  // 2. Cưỡng chế force-dynamic hoặc dùng dynamic functions
  if (
    dynamic === "force-dynamic" ||
    usesCookies ||
    usesHeaders ||
    usesSearchParams
  ) {
    return "DYNAMIC";
  }

  // 3. Có chu kỳ revalidate số
  if (typeof revalidate === "number" && revalidate > 0) {
    return "ISR";
  }

  // 4. Mặc định là Static
  return "STATIC";
}

/**
 * Bài 3: Tính toán mức tiết kiệm kích thước Client Bundle nhờ RSC
 * - Duyệt danh sách component: { name, isClient: boolean, libWeightKb: number }
 * - Client Bundle = tổng libWeightKb của các components có `isClient: true`
 * - Saved Bundle = tổng libWeightKb của các components có `isClient: false`
 */
export function calculateBundleSavings(components = []) {
  let clientBundleKb = 0;
  let savedServerBundleKb = 0;

  for (const comp of components) {
    if (comp.isClient) {
      clientBundleKb += comp.libWeightKb || 0;
    } else {
      savedServerBundleKb += comp.libWeightKb || 0;
    }
  }

  const total = clientBundleKb + savedServerBundleKb;
  const savingsPercent = total > 0 ? (savedServerBundleKb / total) * 100 : 0;

  return {
    clientBundleKb,
    savedServerBundleKb,
    savingsPercent: Number(savingsPercent.toFixed(1))
  };
}

// ==========================================
// BỘ KIỂM THỬ TỰ ĐỘNG (AUTOMATED TEST SUITE)
// ==========================================
console.log("-> Running Next.js Module 02 Practice Tests...");

// Test 1: validateClientBoundaryProps
const validProps = {
  title: "Next.js Revision",
  count: 42,
  tags: ["rsc", "nextjs"],
  nested: { ok: true }
};
assert.equal(validateClientBoundaryProps(validProps).valid, true);

const invalidFuncProps = {
  title: "Post",
  onClick: () => console.log("clicked")
};
const resFunc = validateClientBoundaryProps(invalidFuncProps);
assert.equal(resFunc.valid, false);
assert.match(resFunc.reason, /Invalid function/);

class CustomEntity {
  constructor(name) {
    this.name = name;
  }
}
const invalidClassProps = { entity: new CustomEntity("admin") };
const resClass = validateClientBoundaryProps(invalidClassProps);
assert.equal(resClass.valid, false);
assert.match(resClass.reason, /Non-plain object/);

// Test 2: determineRenderingStrategy
assert.equal(determineRenderingStrategy({}), "STATIC");
assert.equal(determineRenderingStrategy({ revalidate: 60 }), "ISR");
assert.equal(determineRenderingStrategy({ usesCookies: true }), "DYNAMIC");
assert.equal(determineRenderingStrategy({ usesHeaders: true, revalidate: 60 }), "DYNAMIC");
assert.equal(determineRenderingStrategy({ dynamic: "force-dynamic" }), "DYNAMIC");
assert.equal(determineRenderingStrategy({ dynamic: "force-static", usesCookies: true }), "STATIC");

// Test 3: calculateBundleSavings
const testComponents = [
  { name: "PostDetail", isClient: false, libWeightKb: 150 }, // Dùng thư viện markdown nặng trên server
  { name: "SyntaxHighlighter", isClient: false, libWeightKb: 300 }, // Highlight code trên server
  { name: "LikeButton", isClient: true, libWeightKb: 10 }, // Client UI tương tác
  { name: "CommentBox", isClient: true, libWeightKb: 40 }
];

const savings = calculateBundleSavings(testComponents);
assert.equal(savings.clientBundleKb, 50);
assert.equal(savings.savedServerBundleKb, 450);
assert.equal(savings.savingsPercent, 90.0);

console.log("✅ All Next.js Module 02 practice tests passed successfully!");
