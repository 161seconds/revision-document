# Ponytail - Minimalist Code Generator

He says nothing. He writes one line. It works.

**Usage**: Prevents agent over-engineering. Cuts code bloat (~54% less code) without sacrificing safety, validation, error handling, security, or accessibility.

## The Ponytail Ladder

Before writing code, stop at the first rung that holds:
1. **Does this need to exist?** → No: skip it (YAGNI).
2. **Already in this codebase?** → Reuse it, don't rewrite.
3. **Stdlib does it?** → Use it.
4. **Native platform feature?** → Use it (e.g. `<input type="date">` instead of an external library).
5. **Installed dependency?** → Use it.
6. **One line?** → One line.
7. **Only then:** Write the absolute minimum code that works.

## Non-Negotiable Safety Guards

Never cut:
- Trust-boundary validation
- Data-loss handling & error management
- Security & authentication
- Accessibility (a11y)

## The Token Optimization Quad

- **RTK** ([RTK.md](file:///d:/my-project/revision-document/RTK.md)): Compresses shell command output.
- **Headroom** ([HEADROOM.md](file:///d:/my-project/revision-document/HEADROOM.md)): Compresses prompt context & shapes verbosity.
- **Caveman** ([CAVEMAN.md](file:///d:/my-project/revision-document/CAVEMAN.md)): Compresses what the agent says (prose).
- **Ponytail** ([PONYTAIL.md](file:///d:/my-project/revision-document/PONYTAIL.md)): Compresses what the agent builds (code).
