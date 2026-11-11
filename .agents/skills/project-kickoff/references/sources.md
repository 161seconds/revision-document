# Sources and adaptations

`project-kickoff` combines repository discovery, a user-selected folder baseline, architecture decisions, and conditional skill routing. It does not bundle entire upstream skill collections.

## User-selected structural reference

Local source: `C:\Users\acer\pegaxus`, inspected on **2026-11-11**. The folder contains three repositories, not one application repository:

| Repository | Observed HEAD | Material used |
| --- | --- | --- |
| `pegaxus-be` | `1a72339e7ff563ad26d6f6e8680023da688124fb` | `CODING_CONVENTIONS.md`, README, project references, service modules, test organization |
| `pegaxus-fe` | `9ff12cc23cc5c0684e3834710767adf3d240a2fe` | README, `CONTRIBUTING.md`, `RULESET.md`, manifest, app/feature/shared/lib/test directories |
| `pegaxus-document` | `23cabc793f86966f9dff1ed8e4a2b6fd968a54c8` | Top-level documentation categories |

Tracked working trees were clean at inspection. The bundled [Pegaxus layout](pegaxus-layout.md) records structure and responsibility; it does not copy application implementations. Refresh against the live source only when requested or when the reference no longer fits. Keep this reference portable rather than requiring that absolute path on another machine.

## Engineering guidance

Addy Osmani's [agent-skills](https://github.com/addyosmani/agent-skills/tree/301b02b12bff98e4688e6984af6556802322bbde) is pinned locally at `301b02b12bff98e4688e6984af6556802322bbde`:

| Source at that commit | Adaptation |
| --- | --- |
| [source-driven-development](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/source-driven-development/SKILL.md) | Detect actual dependency versions; consult relevant official documentation for version-sensitive decisions. |
| [git-workflow-and-versioning](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/git-workflow-and-versioning/SKILL.md) | Focused commits and verification; target conventions and existing user authorization govern Git actions. |
| [documentation-and-adrs](https://github.com/addyosmani/agent-skills/blob/301b02b12bff98e4688e6984af6556802322bbde/skills/documentation-and-adrs/SKILL.md) | Reuse existing documentation/ADR conventions; record consequential decisions without duplicating obvious code. |

Architecture selection also uses this repository's [architecture comparison](https://github.com/161seconds/revision-document/blob/2203a717d0cfb015023cec49ce7be3e3541ca2e1/clean-architecture/03-comparing-architectures.md) and [system design guide](https://github.com/161seconds/revision-document/blob/2203a717d0cfb015023cec49ce7be3e3541ca2e1/system-design/README.md): module boundaries, dependency direction, and deployment topology are distinct decisions; complexity needs an actual requirement.

The parent repository's `HARNESS.md` provides the available skill routing. Optional skill names in the entrypoint refer to separately available integrations; their instructions and licenses remain with those skills. Missing integrations do not prevent the core workflow.

## License

The skill's [MIT license](../LICENSE) retains Addy Osmani's copyright notice for adapted guidance and the repository author's notice for the synthesis. Upstream snapshots remain unchanged. Their individual licenses continue to apply to their original contents.
