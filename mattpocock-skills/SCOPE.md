# Scope

This repo is the set of skills I use every day. It is curated: ideas are welcome, and each one is judged against the bar below. Issues are for tracking changes to the skills. Questions and discussion go to [GitHub Discussions](https://github.com/mattpocock/skills/discussions).

## The bar

An idea or feedback issue stays open only if it clears **both** parts:

1. **Observed failure.** It describes something that went wrong in a real session: what you ran, what the skill did, what you expected. A hypothetical improvement ("it would be better if...") does not clear this part.
2. **Fits the philosophy.** It does not match anything in [`.out-of-scope/`](./.out-of-scope/) or a past rejection, and it is not a config option, a harness-specific branch, or a tweak to suit one person's workflow. Those belong in your own `CLAUDE.md` / `AGENTS.md`, or in a fork (skills.sh gives you an editable copy).

Size is irrelevant: a one-word fix and a rewrite face the same bar. Reactions and +1 comments do not count towards it.

## By bucket

- **`engineering/`, `productivity/`, `in-progress/`**: the bar above.
- **`misc/`**: frozen and unmaintained. Every issue is closed. See [`frozen-misc-skills.md`](./.out-of-scope/frozen-misc-skills.md).
- **New skills**: proposals and contributions are closed. If the behaviour composes from existing skills, it does not get a new one. See [`new-skills.md`](./.out-of-scope/new-skills.md).

## Already decided

Each file in [`.out-of-scope/`](./.out-of-scope/) records one rejected concept and why. Read them before filing:

- [`frozen-misc-skills.md`](./.out-of-scope/frozen-misc-skills.md)
- [`harness-name-collisions.md`](./.out-of-scope/harness-name-collisions.md)
- [`mainstream-issue-trackers-only.md`](./.out-of-scope/mainstream-issue-trackers-only.md)
- [`native-question-tool.md`](./.out-of-scope/native-question-tool.md)
- [`new-skills.md`](./.out-of-scope/new-skills.md)
- [`question-limits.md`](./.out-of-scope/question-limits.md)
- [`setup-skill-verify-mode.md`](./.out-of-scope/setup-skill-verify-mode.md)
- [`subagent-recursion.md`](./.out-of-scope/subagent-recursion.md)

## Unclear issues

An issue that can't be judged against the bar gets one round of questions and the `needs-info` label. With no reply from the reporter in 14 days, it is closed. Rejections close as "not planned".
