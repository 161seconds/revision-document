# Caveman - Ultra-Compressed Agent Communication

**Usage**: Cuts model response tokens (by dropping filler, articles, and pleasantries) while maintaining technical accuracy and code integrity.

## Modes & Levels

| Level | Description |
| :--- | :--- |
| `lite` | Drop filler/hedging. Sentences stay full. Professional and tight. |
| `full` | **(Default)** Drop articles, fragments OK, short synonyms. Classic caveman. |
| `ultra` | Bare fragments. Technical symbols and error strings preserved exact. |
| `wenyan-*` | Classical Chinese variants (`wenyan-lite`, `wenyan-full`, `wenyan-ultra`). |
| `off` / `stop caveman` | Revert to normal prose. |

## Quick Invocations

```text
/caveman              # Enable full mode (default)
/caveman lite         # Light compression
/caveman ultra        # Extreme compression
/caveman wenyan       # Classical Chinese
stop caveman          # Revert to normal mode
```

## Special Slash Commands

- `/caveman-commit`: Generate single-line Conventional Commit messages.
- `/caveman-review`: Produce one-line, actionable code review findings.
- `/caveman-compress <file>`: Shrink Markdown docs/memory files without losing structure.

## Rules

- **Code, commands, error messages, and file paths are NEVER mangled.**
- Auto-clarity fallback: Drops to normal prose for security warnings or irreversible operations.
- Reference skill file: [SKILL.md](file:///d:/my-project/revision-document/.agents/skills/caveman/SKILL.md)
