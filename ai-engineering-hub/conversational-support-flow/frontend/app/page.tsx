"use client";

import { SupportChat } from "./chat";

const CAPABILITIES = [
  { emoji: "📦", label: "Order tracking" },
  { emoji: "↩️", label: "Returns & policy" },
  { emoji: "🌐", label: "Live research" },
];

export default function Home() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#f5f5ff] p-6">
      {/* Soft brand-colored glow behind the card -- purely decorative */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-40 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-gradient-to-br from-indigo-300/40 via-violet-300/30 to-transparent blur-3xl"
      />

      <div className="entrance z-10 flex w-full max-w-2xl flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 text-2xl shadow-lg shadow-indigo-500/30">
            🛍️
          </div>
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-neutral-900">
              E-commerce Support
            </h1>
            <p className="text-sm text-neutral-500">
              A CrewAI conversational flow, served live over AG-UI
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-2">
          {CAPABILITIES.map((c) => (
            <span
              key={c.label}
              className="flex items-center gap-1.5 rounded-full border border-indigo-100 bg-white/80 px-3 py-1 text-xs font-medium text-indigo-700 shadow-sm backdrop-blur-sm"
            >
              <span>{c.emoji}</span>
              {c.label}
            </span>
          ))}
        </div>

        <div className="flex h-[70vh] w-full flex-col overflow-hidden rounded-2xl border border-indigo-100 bg-white shadow-xl shadow-indigo-950/5">
          <SupportChat />
        </div>

        <p className="text-xs text-neutral-400">
          Order 4471 · Bluedart · in transit — try asking where it is
        </p>
      </div>
    </div>
  );
}
