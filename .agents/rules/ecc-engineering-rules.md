# ECC Engineering Rules (Google Antigravity & Codex)

**Purpose**: Enforce the ECC engineering lifecycle (`Plan -> Test -> Implement -> Review -> Verify`) with zero token bloat.

## 1. The Engineering Loop

Always adhere to the standard ECC delivery sequence:
```text
Plan -> Test (Red) -> Implement (Green) -> Review -> Verify
```

1. **Plan First**: Understand scope and edge cases before generating code.
2. **Test First (TDD)**: Write a failing test first. Validate that it fails for the expected reason (RED) before writing production logic.
3. **Minimal Implementation**: Implement only the minimum code necessary to make tests pass (GREEN), respecting [Ponytail](file:///d:/my-project/revision-document/PONYTAIL.md).
4. **Proactive Review**: Run [code-review](file:///d:/my-project/revision-document/.agents/skills/code-review/SKILL.md) and [security-review](file:///d:/my-project/revision-document/.agents/skills/security-review/SKILL.md) on uncommitted diffs.
5. **Verify**: Ensure all automated checks (typecheck, lint, test suite) pass cleanly before marking tasks complete.

## 2. Security Invariants

- **Zero Secrets in Code**: Never hardcode tokens, API keys, private passwords, or connection strings.
- **SQL / Query Injection**: Always use parameterized queries or trusted ORM methods.
- **Boundary Validation**: Sanitize and validate all external inputs (Zod/Pydantic/types).
- **Safe Authentication**: Use secure, HttpOnly cookie storage for sensitive credentials rather than client-accessible storage.

## 3. Synergy with Token Optimization Quad

- **Terminal**: Run test and validation commands via `rtk` (e.g. `rtk npm test`, `rtk cargo test`).
- **Code Generation**: Stop at the lowest necessary rung of the [Ponytail](file:///d:/my-project/revision-document/PONYTAIL.md) ladder.
- **Agent Responses**: Adhere to [Caveman](file:///d:/my-project/revision-document/CAVEMAN.md) compression; keep review and verification reports high-density and actionable.
