# Changes to `misc/` skills

The skills under `skills/misc/` (`git-guardrails-claude-code`, `migrate-to-shoehorn`, `scaffold-exercises`, `setup-pre-commit`, and anything else that lands there) are frozen. Bug reports, feature requests and PRs against them are closed.

## Why this is out of scope

`misc/` is where skills go when I keep them around but rarely use them. They aren't promoted: they don't ship in the Claude Code plugin, they have no docs page, and I'm not running them day to day, so I can't tell whether a fix is right or notice when one breaks something else. Maintaining them at the same bar as the promoted skills would cost the same as a promoted skill for a fraction of the use.

They stay in the repo, unmaintained, because they still work for some people as-is. If one doesn't work for you, install it with skills.sh and fix your copy: the files are yours to edit.

If a `misc/` skill is promoted back into `engineering/` or `productivity/` later, it's back in scope from that point.

## Prior requests

- #14: "Potential typo in setup-pre-commit/SKILL.md"
- #301: "`block-dangerous-git.sh` is bypassed by any git global option (e.g. `git -C <dir> push`)"
- #465: "git-guardrails-claude-code documentation is missing benefits over built in Claude code deny rules"
- #898: "git-guardrails-claude-code: hook fails open without jq and misses common git spellings"
