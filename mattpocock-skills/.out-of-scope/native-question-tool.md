# Grilling through the harness's native question tool

Grilling sessions (`/grilling`, `/grill-me`, `/grill-with-docs`, and grilling inside other skills) ask their questions as plain chat text. Requests to route them through a harness's built-in question UI (Claude Code's `AskUserQuestion`, a host "question tool", a structured or batched questionnaire mode) are out of scope.

## Why this is out of scope

The skills are harness-neutral text. They run in Claude Code, Codex, Copilot, Cursor and anything else skills.sh installs into, and each harness has a different question tool, or none. Naming one harness's tool in the skill means either a harness-specific branch in every grilling skill, or a skill that only works properly in one place.

The question UI also changes the grilling itself. Structured pickers push the model towards multiple-choice questions with pre-baked answers, which is the opposite of what grilling is for: open questions you answer in your own words, one branch of the decision tree at a time. I've tried the `AskUserQuestion` UI and don't want it in these skills.

If you prefer your harness's question tool, say so in your own `CLAUDE.md` / `AGENTS.md` ("when grilling, ask via AskUserQuestion"). That's a one-line, per-user preference, and it doesn't need the shared skill to know about it.

## Prior requests

- #19: "grill-me: not always using the question tool"
- #643: "Proposal: Use AskQuestion for structured input during grilling sessions"
- #840: "Use host's question tool for grilling sessions"
- #1107: "Grilling doesn't use Agent's native QA tool OOTB"
- #1152: "Proposal: experimental HTML questionnaire mode for batch grilling"
