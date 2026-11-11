/**
 * CopilotKit runtime: bridges the browser (via @copilotkit/react-core) to
 * the Python AG-UI endpoint (server.py, SupportFlow.stream_turn()).
 *
 * CrewAIAgent (from @ag-ui/crewai) is a plain AG-UI HttpAgent pointed at our
 * FastAPI /conversation endpoint -- CopilotKit's SSE runtime just forwards
 * each browser thread's messages to it and streams the AG-UI events back.
 */
import { CrewAIAgent } from "@ag-ui/crewai";
import { CopilotSseRuntime, createCopilotRuntimeHandler } from "@copilotkit/runtime/v2";

const CREWAI_BACKEND_URL =
  process.env.CREWAI_BACKEND_URL ?? "http://127.0.0.1:8000/conversation";

const runtime = new CopilotSseRuntime({
  agents: {
    // @ag-ui/crewai and @copilotkit/runtime each ship their own copy of
    // @ag-ui/client (confirmed via node_modules), so TS sees two
    // structurally-different AbstractAgent classes for what's the same
    // runtime shape -- harmless duplicate-dependency artifact, not a real
    // incompatibility (verified live: this endpoint streams correctly).
    support: new CrewAIAgent({ url: CREWAI_BACKEND_URL }) as any,
  },
});

// The CopilotKitProvider client defaults to a single-endpoint transport
// (one POST envelope: { method, params, body }) rather than the handler's
// own multi-route default (/agent/:id/run, /info, ...) -- match it here
// instead of touching the client.
const handler = createCopilotRuntimeHandler({ runtime, mode: "single-route" });

export const POST = handler;
export const GET = handler;
