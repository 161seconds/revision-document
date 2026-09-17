@RTK.md
@HEADROOM.md
@CAVEMAN.md
@PONYTAIL.md

@.agents/skills/caveman/SKILL.md

# AGENTS.md

**Usage**: Context routing for Codex-powered AI agents.

## File Structure

- `AGENTS.md`: Global routing rules
- `<agent>.md`: Agent-specific instructions
- `skills/<skill>/SKILL.md`: Reusable skill instructions

## Routing Rules

| Prefix | Behavior |
|--------|----------|
| `@`    | Load file as context |
| `!`    | Load file as executable prompt |
| `##`   | Load file as tool definition |

### File Location

Files are searched in this order:

1. Current directory
2. `.agents/`
3. `.agents/skills/<skill>/`

## Example

```markdown
# AGENTS.md

@RTK.md
@knowledge-base.md

## Code Agent

@.agents/skills/caveman/SKILL.md
```