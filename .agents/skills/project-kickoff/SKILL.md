---
name: project-kickoff
description: Start a new project or onboard an unfamiliar repository by inspecting its folder structure, system design, toolchain, and Git conventions, then prepare an evidence-based implementation starting point. Use for project kickoff, repository onboarding, or establishing project conventions; ordinary feature edits do not require a full kickoff.
---

# Project Kickoff

Understand the target before building. Use the bundled Pegaxus layout for new application structure; preserve an existing project's conventions unless the user requests a migration.

## 1. Discover the target

- Resolve the requested directory and applicable `AGENTS.md` instructions. Read the relevant README, contribution rules, coding conventions, architecture docs, and ADRs before proposing structure.
- Inspect a bounded file inventory, manifests, lockfiles, entrypoints, project references, tests, CI, formatter/linter settings, and `.gitignore`. Skip dependencies, generated output, Git internals, private keys, and secret configuration values. Inspect environment variable names through templates or config bindings only.
- Classify the target: empty project, application, multiple repositories, monorepo, library, or documentation collection. Imported examples are reference material, not the target application's architecture. Inspect only the relevant subproject in a large workspace.
- Identify the actual stack and versions from manifests, lockfiles, and CI. Distinguish declared version ranges from resolved versions. Consult version-matched official documentation when a framework decision depends on it; do not upgrade dependencies as part of discovery.
- For an existing application, trace one representative feature through its entrypoint, business logic, persistence or external integration, and test. Cite real paths; do not infer architecture from folder names alone. For a library or documentation project, trace its public entrypoint or publishing flow instead.
- Separate observed facts, user requirements, proposals, and unknowns. If docs conflict with code or CI, report the discrepancy and its impact instead of silently choosing a new convention.

## 2. Establish structure and system design

Read [the Pegaxus layout](references/pegaxus-layout.md) before designing application folders. It is bundled so the original Windows checkout is optional.

- For a new application, use Pegaxus as the folder baseline: separate backend, frontend, and project documents; organize backend responsibilities into API / Service / Repository / tests and frontend code into app / features / shared / lib. Rename the project and domain modules. Create only the parts needed by the requested first feature.
- For an existing project, describe its structure first. Use the reference to guide new modules where compatible; converting its repository topology, framework, layers, or public contracts requires that migration to be in scope.
- Identify the product's first useful flow, actors, module ownership, integration boundaries, deployment unit, and acceptance criteria. Establish only constraints that affect the requested work: persistence, concurrency, security, latency, scale, budget, or operating environment. Mark unstated targets as unknown rather than inventing numbers.
- Explain request/data flow and dependency direction separately. Identify the source of truth, transaction boundaries, authentication/authorization boundaries, and failure behavior for the chosen flow. Include a small diagram only when it clarifies these relationships.
- Prefer the smallest design that meets those constraints. Add distributed services, queues, caching, CQRS, extra layers, or new dependencies only for a concrete requirement. A folder called Repository does not imply a repository wrapper around an existing ORM.
- Reuse established API routes, response envelopes, error codes, identifiers, schema/migration practices, and configuration boundaries. Keep framework-required directories valid when adapting the Pegaxus layout to another stack.
- Ask only about missing decisions that materially change architecture or block the first slice. Continue independent inspection while waiting; label reversible assumptions.

## 3. Infer development and Git conventions

- Check Git availability, branch, working-tree state, and a bounded recent log, such as `git log -20 --format=%s`. A directory without Git or commits is a valid case; do not initialize it merely to inspect it.
- Use explicit target instructions first, enforced configuration second, consistent recent history third. Inspect contribution rules, branch/PR checks, commitlint or release configuration, hooks, `.editorconfig`, and `.gitattributes` when present. Record conflicts instead of replacing the project's rules.
- Capture naming, imports/aliases, module boundaries, validation/errors, test placement, package manager, branch base/prefix, commit type/scope/language, and PR expectations. Quote a real commit example when history supports it.
- If no convention exists, propose Conventional Commits (`feat(auth): add sign-in validation`) and focused commits as a fallback. Label it proposed; do not install hooks, create branches, add `dev`, or change release tooling just to enforce a preference.
- Identify exact run/build/lint/test commands and their working directories from the target's configuration. Review script effects before running them. Report checks as passed, failed, unavailable, or not run; a discovered command is not a passing check.

## 4. Compose relevant skills

Resolve optional skills through the host's available-skill catalog or the target's local/user skill directories. Load a skill only when its phase is needed. Archive snapshots elsewhere in a knowledge repository are not automatically installed skills.

| Need | Optional skills, when available |
| --- | --- |
| Clarify a large or ambiguous request | `spec-driven-development`, `planning-and-task-breakdown` |
| Verify version-sensitive APIs | `source-driven-development` |
| Implement a .NET backend within the chosen layers | `dotnet-backend-patterns` |
| Design PostgreSQL schema / investigate measured slow queries | `postgresql-table-design` / `sql-optimization-patterns` |
| Define a public API contract | `openapi-spec-generation` |
| Add or change meaningful application behavior | `tdd-workflow` |
| Handle authentication, user input, secrets, or payments | `security-review` |
| Add CI / document a consequential decision / organize authorized Git work | `github-actions-templates` / `documentation-and-adrs` / `git-workflow-and-versioning` |
| Investigate an actual failure | `systematic-debugging` |
| Review changes / substantiate completion | `code-review` / `verification-before-completion` |

Optional skills refine the task; they do not replace target conventions or expand its authorization. If one is missing, perform that part directly with the discovered stack: define acceptance checks, implement the smallest slice, validate input/security boundaries, review the diff, and run the relevant existing checks. Do not block kickoff or install entire collections to satisfy optional routing.

## 5. Deliver a usable starting point

Keep the kickoff proportional to the project. Return:

1. **Context:** target, project type, stack/versions, observed facts and remaining assumptions.
2. **Folder map:** relevant paths with their responsibilities; label proposed paths clearly.
3. **Design:** the first flow, component/data boundaries, important trade-offs, and preserved contracts.
4. **Conventions:** code/module/test rules plus evidence-backed branch and commit examples.
5. **Verification:** exact commands, working directories, prerequisites, and actual execution status.
6. **First slice:** the smallest useful implementation, its acceptance checks, optional skills selected, and any blocking decision.

For onboarding or planning only, deliver this in the response. When asked to persist project setup, update existing context/convention/architecture documents; add a short root `AGENTS.md` or decision record only where needed. Link canonical documents instead of duplicating their contents. Do not overwrite existing instructions with a template. When implementation is requested, continue into the first slice within the user's scope instead of stopping at the plan.

Preserve unrelated work. This skill itself grants no permission to commit, push, deploy, publish, send messages, change memory, or run background agents. Honor authorization already given; do not ask for it again without a new scope or risk.

For provenance or licensing, see [sources and adaptations](references/sources.md).
