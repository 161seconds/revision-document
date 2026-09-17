# Headroom - Local Context & Output Compressor

**Usage**: Compresses tool outputs, logs, RAG chunks, files, and conversation history before reaching the LLM.

## Key Concept

Headroom runs locally and intercepts context before sending to the LLM (and optionally shapes output to reduce verbose answers), cutting up to 50-90% of token consumption.

## Common Commands

```bash
# Agent Wrapping
headroom wrap codex --code-memory none   # Wrap Codex agent session
headroom wrap claude                     # Wrap Claude Code session
headroom unwrap <agent>                  # Remove agent wrapping

# Proxy Mode
headroom proxy --port 8787               # Drop-in local proxy
headroom dashboard                       # Live savings dashboard (proxy must be running)

# Analytics & Maintenance
headroom doctor                          # Health check & route verification
headroom output-savings                  # View estimated output token savings
headroom learn --verbosity --apply       # Auto-tune terseness from past sessions
```

## Wrapper Script

Launch Codex with disabled telemetry beacon using:
```powershell
.\codex-headroom.ps1
```
(Defined in [codex-headroom.ps1](file:///d:/my-project/revision-document/codex-headroom.ps1))

## Verification

```bash
headroom --version
headroom doctor
```
