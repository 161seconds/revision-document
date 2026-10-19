// Module 01: App Router & File-System Routing Simulation Demo
// Mô phỏng thuật toán matching route và nested layouts composition trong Next.js App Router

/**
 * Phân tích và so khớp URL pattern của Next.js
 */
export function matchRoutePattern(pattern, pathname) {
  const patternSegments = pattern.split("/").filter(Boolean);
  const pathSegments = pathname.split("/").filter(Boolean);

  const params = {};
  let pIdx = 0;
  let pathIdx = 0;

  while (pIdx < patternSegments.length) {
    const pSeg = patternSegments[pIdx];

    // 1. Optional Catch-all: [[...slug]]
    if (pSeg.startsWith("[[...") && pSeg.endsWith("]]")) {
      const paramName = pSeg.slice(5, -2);
      const remaining = pathSegments.slice(pathIdx);
      params[paramName] = remaining.length > 0 ? remaining : undefined;
      return { matched: true, params };
    }

    // 2. Catch-all: [...slug]
    if (pSeg.startsWith("[...") && pSeg.endsWith("]")) {
      const paramName = pSeg.slice(4, -1);
      const remaining = pathSegments.slice(pathIdx);
      if (remaining.length === 0) return { matched: false, params: {} };
      params[paramName] = remaining;
      return { matched: true, params };
    }

    // Nếu hết pathSegments mà pattern chưa hết
    if (pathIdx >= pathSegments.length) {
      return { matched: false, params: {} };
    }

    const currentPath = pathSegments[pathIdx];

    // 3. Dynamic segment: [id]
    if (pSeg.startsWith("[") && pSeg.endsWith("]")) {
      const paramName = pSeg.slice(1, -1);
      params[paramName] = currentPath;
    } else if (pSeg !== currentPath) {
      // 4. Static segment không khớp
      return { matched: false, params: {} };
    }

    pIdx++;
    pathIdx++;
  }

  // Nếu cả hai đều duyệt hết
  if (pathIdx === pathSegments.length) {
    return { matched: true, params };
  }

  return { matched: false, params: {} };
}

/**
 * Mô phỏng việc lồng Layouts phân cấp (Nested Layouts Composition)
 */
export function composeLayoutHierarchy(layouts, pageContent) {
  // layouts duyệt từ trong ra ngoài (root layout là ngoài cùng)
  return layouts.reduceRight((child, layoutFn) => {
    return layoutFn(child);
  }, pageContent);
}

// Chạy demo minh họa
console.log("=== NEXT.JS APP ROUTER MATCHING DEMO ===");

const routes = [
  "/",
  "/blog/[slug]",
  "/shop/[...categories]",
  "/docs/[[...section]]"
];

const testPaths = [
  "/blog/mastering-nextjs-15",
  "/shop/electronics/phones/pixel-9",
  "/docs",
  "/docs/api/v1/endpoints"
];

for (const path of testPaths) {
  console.log(`\nTesting URL: "${path}"`);
  for (const route of routes) {
    const res = matchRoutePattern(route, path);
    if (res.matched) {
      console.log(`  -> Matched pattern: "${route}" with params:`, res.params);
    }
  }
}

console.log("\n=== NESTED LAYOUT COMPOSITION DEMO ===");
const rootLayout = (children) => `<html><body><Navbar />${children}<Footer /></body></html>`;
const dashboardLayout = (children) => `<Sidebar>${children}</Sidebar>`;
const profilePage = "<ProfileContent user='Admin' />";

const finalHTML = composeLayoutHierarchy([rootLayout, dashboardLayout], profilePage);
console.log("Final Composed Tree:\n", finalHTML);
