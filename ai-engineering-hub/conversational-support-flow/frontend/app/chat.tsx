"use client";

import { useAgent } from "@copilotkit/react-core/v2";
import { useEffect, useRef, useState } from "react";

type AgentMessage = ReturnType<typeof useAgent>["agent"]["messages"][number];

/**
 * Why this doesn't just render agent.messages directly -- two compounding
 * server-side issues, both confirmed by direct investigation, neither
 * fixable from this file's data flow alone:
 *
 * 1. @ag-ui/client's snapshot-merge (in defaultApplyEvents) treats every
 *    MESSAGES_SNAPSHOT as the full authoritative history: it DROPS any
 *    message whose id isn't in the latest snapshot, then re-appends it to
 *    the end if a later snapshot mentions it again. A controlled 2-turn curl
 *    test against our own /conversation endpoint showed the server's
 *    messages were correctly ordered every time -- the reordering happens
 *    client-side, in that merge.
 *
 * 2. crewai's own ConversationMessage model (flow.state.messages) has NO id
 *    field at all (checked its model_fields directly: role, content, name,
 *    tool_call_id, tool_calls, files, metadata -- no id). So whatever id the
 *    AG-UI bridge puts on a message in one snapshot is NOT the same id it'll
 *    use for that same message in the next snapshot -- there's no stable
 *    identity to preserve across turns. An id-keyed merge (including a
 *    naive fix for #1) sees a "new" id for old content and duplicates it.
 *
 * The fix: never trust agent.messages' wholesale replacement, and don't key
 * on id at all. Keep our own append-only history keyed by a content
 * signature (role + text + tool-call summary) -- a message whose content we
 * already have updates in place; genuinely new content appends at the end.
 */
function messageSignature(m: AgentMessage): string {
  const content =
    typeof m.content === "string" ? m.content : JSON.stringify(m.content ?? "");
  const toolCalls =
    m.role === "assistant" && m.toolCalls?.length
      ? JSON.stringify(
          m.toolCalls.map((tc) => [tc.function?.name, tc.function?.arguments])
        )
      : "";
  return `${m.role}::${content}::${toolCalls}`;
}

function mergeMessages(
  prev: AgentMessage[],
  incoming: readonly AgentMessage[]
): AgentMessage[] {
  const next = [...prev];
  const indexBySignature = new Map(next.map((m, i) => [messageSignature(m), i]));
  for (const msg of incoming) {
    const sig = messageSignature(msg);
    const idx = indexBySignature.get(sig);
    if (idx === undefined) {
      indexBySignature.set(sig, next.length);
      next.push(msg);
    } else {
      next[idx] = msg;
    }
  }
  return next;
}

export function SupportChat() {
  const { agent } = useAgent({ agentId: "support" });
  const [history, setHistory] = useState<AgentMessage[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [draft, setDraft] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { unsubscribe } = agent.subscribe({
      onMessagesChanged: ({ messages }) => {
        setHistory((prev) => mergeMessages(prev, messages));
      },
      onRunStartedEvent: () => setIsRunning(true),
      onRunFinishedEvent: () => setIsRunning(false),
      onRunFailed: () => setIsRunning(false),
    });
    return unsubscribe;
  }, [agent]);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [history.length, isRunning]);

  async function send() {
    const text = draft.trim();
    if (!text || isRunning) return;
    setDraft("");
    const userMessage: AgentMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: text,
    };
    agent.addMessage(userMessage);
    setHistory((prev) => mergeMessages(prev, [userMessage]));
    try {
      await agent.runAgent();
    } catch (err) {
      console.error("runAgent failed:", err);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
        {history.length === 0 && !isRunning && (
          <p className="mt-16 text-center text-lg font-medium text-neutral-800">
            How can I help with your order today?
          </p>
        )}

        {history.map((m) => {
          // Keyed on signature, not m.id -- crewai's ConversationMessage has
          // no id field, so the bridge mints a fresh one per snapshot; two
          // different messages can end up sharing a React key if id is used
          // (confirmed: "two children with the same key" in dev). Signature
          // is what mergeMessages actually treats as this message's identity.
          const key = messageSignature(m);
          if (m.role === "user") {
            // content is either a plain string or a multimodal array (text
            // /image/audio/... parts) -- this demo only ever sends text, so
            // just join any text parts for display.
            const text =
              typeof m.content === "string"
                ? m.content
                : (m.content ?? [])
                    .filter(
                      (part): part is { type: "text"; text: string } =>
                        part.type === "text"
                    )
                    .map((part) => part.text)
                    .join("\n");
            return (
              <div key={key} className="flex justify-end">
                <div className="max-w-[80%] rounded-2xl rounded-br-md bg-neutral-100 px-4 py-2 text-sm text-neutral-900">
                  {text}
                </div>
              </div>
            );
          }

          if (m.role === "assistant") {
            const text = typeof m.content === "string" ? m.content.trim() : "";
            const toolCalls = m.toolCalls ?? [];

            // A tool-call-only message (no text yet) -- e.g. the researcher
            // agent's Exa search inside RESEARCH. Show what it's doing
            // instead of an empty bubble.
            if (!text && toolCalls.length > 0) {
              return (
                <div key={key} className="flex justify-start">
                  <div className="flex items-center gap-2 rounded-xl border border-indigo-100 bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700">
                    <span>🔍</span>
                    {toolCalls[0]?.function?.name ?? "Using a tool"}
                  </div>
                </div>
              );
            }

            if (!text) return null;

            return (
              <div key={key} className="flex justify-start">
                <div className="max-w-[85%] whitespace-pre-wrap text-sm text-neutral-900">
                  {text}
                </div>
              </div>
            );
          }

          return null;
        })}

        {isRunning && (
          <div className="flex justify-start">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-neutral-400" />
          </div>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex items-center gap-2 border-t border-neutral-100 p-3"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Ask about an order, returns, or shipping delays…"
          className="flex-1 rounded-full border border-neutral-200 bg-neutral-50 px-4 py-2 text-sm text-neutral-900 outline-none focus:border-indigo-300"
        />
        <button
          type="submit"
          disabled={!draft.trim() || isRunning}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-indigo-600 text-white transition-opacity disabled:opacity-40"
          aria-label="Send"
        >
          ↑
        </button>
      </form>
    </div>
  );
}
