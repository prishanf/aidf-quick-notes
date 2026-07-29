# AIDF 5.1.0 (vendored)

**Do not edit anything in this directory.** It is a verbatim copy of the
[AI Development Framework](https://github.com/prishanf/ai-development-framework)
at version `5.1.0`, installed by `aidf-install.sh`. Local edits are silently
discarded on the next upgrade.

## The split this directory exists to make

| | |
|---|---|
| `.aidf/` | Framework **input**: the contracts, standards, and templates agents read |
| `docs/` | Project **output**: the specs, plans, designs, and records agents write |
| `project.yaml` | Where this project configures the framework |
| `AGENTS.md` | Where agents start |

Everything else in the repository root is the project's own code.

## What is here

| Path | Purpose |
|---|---|
| `guide/` | Read first: overview, tracks, workflow, roles, documents, decisions, commands |
| `standards/` | Configure once: gates, evidence, testing, UI, database, API, security |
| `commands/` | The agent prompt contracts |
| `templates/` | Copy-ready documents, each tagged with the track that needs it |
| `schemas/` | Machine-readable contracts for the manifest and evidence |
| `reference/` | Working CI workflows, gate scripts, and the design-mockup scaffold |
| `adapters/` | How to wire the contracts onto another agent surface |

Not vendored, because a project does not need them: `diagrams/`, `examples/`,
and the framework's own changelog. Read those in the framework repository.

## Upgrading

```bash
sh .aidf/reference/scripts/aidf-install.sh --target . --upgrade
```

This replaces the vendored tree and `.aidf/VERSION`, and touches nothing the
project owns -- not `project.yaml`, not `AGENTS.md`, not `.github/`. Read the
framework's CHANGELOG for what changed before you do it, then re-run the gates.

## Version

`5.1.0` -- also recorded as `framework.version` in `project.yaml`. If the two
disagree, the gates will say so.
