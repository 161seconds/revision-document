// Module 02: React Server Components (RSC) Serialization & Streaming Demo
// Mô phỏng giao thức truyền tải RSC Payload và cơ chế Streaming qua HTTP chunks

/**
 * Mô phỏng quá trình Serialize cây Server Component thành RSC Wire Format
 */
export function serializeRscTree(node, slotId = 0) {
  if (typeof node === "string" || typeof node === "number" || typeof node === "boolean") {
    return JSON.stringify(node);
  }

  if (Array.isArray(node)) {
    return JSON.stringify(node.map((child) => serializeRscTree(child, slotId)));
  }

  if (node && typeof node === "object") {
    const serializedProps = {};
    for (const [key, val] of Object.entries(node.props || {})) {
      if (typeof val === "function") {
        throw new TypeError(`Cannot serialize function in prop "${key}" across server-client boundary.`);
      }
      serializedProps[key] = val;
    }

    return {
      $$typeof: "Symbol(react.element)",
      type: node.type,
      key: node.key || null,
      props: serializedProps
    };
  }

  return JSON.stringify(node);
}

/**
 * Mô phỏng cơ chế Streaming SSR với Async Generator
 */
export async function* simulateStreamingSSR() {
  // Chunk 1: Shell HTML & Layout gửi ngay lập tức (Fast TTFB)
  yield {
    chunkId: "shell",
    html: "<div class='layout'><header>Next.js App</header><main id='root'>",
    delayMs: 10
  };

  // Chunk 2: Dữ liệu tải nhanh (User profile)
  yield {
    chunkId: "profile",
    html: "<section class='user-card'>Welcome, Alex!</section>",
    delayMs: 50
  };

  // Chunk 3: Dữ liệu chậm bọc trong Suspense (Product recommendations)
  yield {
    chunkId: "recommendations-stream",
    html: "<section class='recommendations'><h3>Gợi ý cho bạn</h3><ul><li>Sản phẩm A</li><li>Sản phẩm B</li></ul></section>",
    delayMs: 100
  };

  // Chunk 4: Đóng thẻ HTML
  yield {
    chunkId: "footer",
    html: "</main><footer>© 2026 Next.js Revision</footer></div>",
    delayMs: 10
  };
}

// Chạy demo
console.log("=== RSC SERIALIZATION DEMO ===");
const serverVirtualNode = {
  type: "ClientProductCard",
  props: {
    id: 101,
    title: "Bàn phím cơ không dây",
    price: 1500000,
    tags: ["tech", "gadget"]
  }
};

const payload = serializeRscTree(serverVirtualNode);
console.log("Serialized RSC Payload Object:\n", JSON.stringify(payload, null, 2));

console.log("\n=== STREAMING SSR PROGRESSION DEMO ===");
(async () => {
  for await (const chunk of simulateStreamingSSR()) {
    console.log(`[Stream Chunk ${chunk.chunkId}] (+${chunk.delayMs}ms): ${chunk.html}`);
  }
  console.log("Streaming completed!");
})();
