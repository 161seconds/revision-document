"use client";

import { CopilotKitProvider, WildcardToolCallRender } from "@copilotkit/react-core/v2";
import type { ReactNode } from "react";

export function Providers({ children }: { children: ReactNode }) {
  return (
    <CopilotKitProvider
      runtimeUrl="/api/copilotkit"
      // Without this, a tool-call message (e.g. the researcher agent's Exa
      // search inside RESEARCH) renders as an empty bubble -- it's a real
      // assistant message with toolCalls but no text content, and with no
      // renderer registered CopilotKit shows nothing for it. This is
      // CopilotKit's own built-in tool-call card instead of a blank row.
      renderToolCalls={[WildcardToolCallRender]}
    >
      {children}
    </CopilotKitProvider>
  );
}
