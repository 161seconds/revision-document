# Ponytail Rule (Google Antigravity)

**Goal**: Write minimal, production-grade code without over-engineering.

## The Ladder

Before writing any new code, stop at the first rung that holds:
1. **Does this need to exist?** -> No: skip it (YAGNI).
2. **Already in this codebase?** -> Reuse it, do not rewrite.
3. **Stdlib does it?** -> Use stdlib.
4. **Native platform feature?** -> Use native platform API / HTML5 element.
5. **Installed dependency?** -> Use existing installed package.
6. **One line?** -> Write one line.
7. **Only then:** The absolute minimum code that works.

## Invariants

- Never cut validation, security checks, error handling, or accessibility.
- Small code because it is necessary, not because of golfed unreadable tricks.
