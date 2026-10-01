# ECC - Everything Claude Code / Agent Harness Optimization

**Usage**: Disciplined engineering lifecycle orchestrator and skills framework for AI agents (Google Antigravity, Codex, Claude Code, Cursor).

## Core Lifecycle

```text
Plan -> Test (Red) -> Implement (Green) -> Review -> Verify -> Remember
```

Instead of chaotic prompt-and-pray generation, ECC forces agents into a structured engineering process:
1. **Plan**: Define requirements, acceptance criteria, and edge cases before coding.
2. **Test (TDD)**: Write a failing test first. Observe RED before writing implementation code.
3. **Implement**: Write minimal, clean code to turn the test GREEN (governed by [Ponytail](file:///d:/my-project/revision-document/PONYTAIL.md)).
4. **Review**: Fresh-context code review for security vulnerabilities, logic traps, and regressions.
5. **Verify**: Run full automated checks (typecheck, lint, test runner) wrapped with [RTK](file:///d:/my-project/revision-document/RTK.md).

## Installed Selective Skills

- **TDD Workflow** ([tdd-workflow/SKILL.md](file:///d:/my-project/revision-document/.agents/skills/tdd-workflow/SKILL.md)): Test runner detection, unit/integration/E2E coverage, git checkpoint commits.
- **Security Review** ([security-review/SKILL.md](file:///d:/my-project/revision-document/.agents/skills/security-review/SKILL.md)): OWASP prevention, secret hygiene, input schemas, parameterized SQL, auth guards.
- **Code Review** ([code-review/SKILL.md](file:///d:/my-project/revision-document/.agents/skills/code-review/SKILL.md)): Local diff & GitHub PR reviewer with confidence threshold (>80%) to eliminate false positives.

## Specialized Agents

- [code-reviewer.md](file:///d:/my-project/revision-document/.agents/agents/code-reviewer.md): Dedicated subagent for code reviews.
- [security-reviewer.md](file:///d:/my-project/revision-document/.agents/agents/security-reviewer.md): Specialized security analysis subagent.
- [tdd-guide.md](file:///d:/my-project/revision-document/.agents/agents/tdd-guide.md): Dedicated TDD coach subagent.

## Verification & Commands

```bash
# Codex marketplace installation
codex plugin marketplace add affaan-m/ECC
codex plugin add ecc@ecc

# Google Antigravity installation
npx ecc-universal@2.2.2 install --profile minimal --target antigravity
```
