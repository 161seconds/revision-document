---
name: code-review
description: "Comprehensive code quality and security review for local uncommitted changes or GitHub pull requests. Inspects logic errors, types, security vulnerabilities, edge cases, and test completeness. Use when asked to review code, check diff, or evaluate a PR."
metadata:
  origin: ECC
---

# Code Review Skill

Proactive review for quality, security, and maintainability across uncommitted changes and pull requests.

## When to Activate

- Immediately after writing or modifying code
- Before staging and committing changes
- When reviewing a GitHub Pull Request (`gh pr diff` or PR URL/number)
- When evaluating architectural changes or major refactorings

---

## 1. Review Process

### Phase 1 — Context & Diff Gathering
1. For local changes: Run `git diff --staged` and `git diff` (prefixed with `rtk`).
2. If no working tree diff, inspect recent commits: `git log -n 5 --oneline`.
3. For PRs: Fetch PR metadata via `gh pr view <NUMBER>` and diff via `gh pr diff <NUMBER>`.
4. Read surrounding code: Do not review isolated hunks. Examine callers, imports, and interface definitions.

### Phase 2 — Confidence Gate (Eliminate False Positives)
Only report an issue if you are **>80% confident** it is a real problem.
Before recording any finding, verify:
1. **Can I cite the exact file and line?** Vague complaints are forbidden.
2. **Can I describe the concrete failure mode?** Name the input, runtime state, and bad outcome.
3. **Have I checked the surrounding context?** (Callers, types, higher-level try/catch, validation layers).
4. **Is the severity defensible?** Do not inflate style preferences into CRITICAL or HIGH.

> [!NOTE]
> It is completely acceptable and expected to return **zero findings** (`APPROVE`) if the code is clean, well-tested, and adheres to patterns. Never manufacture filler nits.

---

## 2. Review Checklist

| Category | What to Check |
| :--- | :--- |
| **Security (CRITICAL)** | Hardcoded secrets/keys, SQL injection, XSS, SSRF, missing authentication/authorization, path traversal. |
| **Correctness (HIGH)** | Logic bugs, race conditions, unhandled null/undefined, off-by-one errors, resource leaks, broken error paths. |
| **Type Safety (HIGH)** | Unsafe type casting, excessive `any`, missing generic constraints, untyped API contracts. |
| **Completeness (MEDIUM)** | Missing unit/integration tests for new branches, missing validation on boundaries, unhandled edge cases. |
| **Performance (MEDIUM)** | N+1 database queries, unbounded collection growth, blocking operations on main thread. |
| **Maintainability (LOW)** | Dead code, confusing variable names, functions exceeding single responsibility, deep nesting (>4 levels). |

---

## 3. False Positives to Skip

Do **NOT** flag the following unless specific evidence exists in the codebase:
- "Missing error handling" when caller or top-level framework middleware already catches it.
- "Missing input validation" for internal helper functions whose public caller already validated.
- "Magic numbers" for standard constants (`200`, `404`, `1000` ms, `60`, `0`, `-1`).
- "Function too long" for exhaustive switches, config maps, or test tables.
- Stylistic differences that comply with the existing project conventions.

---

## 4. Output Report Format

```markdown
### Review Summary: [APPROVE | REQUEST CHANGES | BLOCK]

- **Files Reviewed**: `<count>` files (`<list of files>`)
- **Key Verdict**: `<1-2 sentences summarizing findings>`

#### Findings

| Severity | File:Line | Issue Description | Suggested Action / Fix |
| :--- | :--- | :--- | :--- |
| 🔴 CRITICAL | `src/auth.ts:42` | Plaintext token stored in localStorage | Move to HttpOnly secure cookie |
| 🟡 HIGH | `src/api.ts:108` | Missing null check on user profile query | Add optional chaining or null guard |
| 🔵 MEDIUM | `src/calc.ts:25` | Branch lacks unit test coverage | Add test case for negative inputs |
```
