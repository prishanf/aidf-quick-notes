# Project Manifest

The project manifest is the adapter-neutral source of truth for a project's workflow. `reference/scripts/aidf-install.sh` places it at the target repository's root, from [templates/project.yaml](../templates/project.yaml); then fill in project-specific values.

It is machine-validated. [schemas/project.schema.json](../schemas/project.schema.json) defines the contract, and `reference/scripts/validate-manifest.sh` enforces it. A manifest that does not validate is a build failure, not a warning — a typo'd key silently disables a gate, which is the worst possible failure mode for a file whose job is to enable gates.

## Required sections

- `framework` — framework version, project identifier, and `root`: the directory the framework is vendored into (`.aidf` by default);
- `repository` — integration branch, production branch, optional QA branch, worktree policy;
- `commands` — verification commands, plus `mockup_serve` for `ui` work;
- `documents` — locations for specs, plans, designs, the data model, decisions, state, and releases;
- `gates` — approval requirements;
- `environments` — lifecycle, data policy, cleanup, and approval boundaries;
- `database` — migration, clone, seed, and credential policy;
- `evidence` — which runners may corroborate a gate;
- `ui` — CSS framework, the token layer both the app and the mockup read, the foundation document, and breakpoints;
- `api` and `mcp` — contract, NFR, authorization, and audit expectations, plus the route and test globs the endpoint-coverage gate needs;
- `adapters` — enabled agent surfaces and their instruction paths.

Two of these are load-bearing for gates that would otherwise be unevaluable:

- **`ui.tokens`** names the one file the application and its design mockup both read. Without it, the mockup has no way to be visually truthful and the design approval covers a palette the product does not have. See [ui-and-preview.md](ui-and-preview.md).
- **`api.route_globs`** and **`api.test_globs`** are what `check-api-coverage.sh` enumerates. Leave them unset and the `api` tag's endpoint gate **fails** — it does not skip, for the same reason an empty `test` command fails.

There is no `quality_profiles` section. Risk tags and their required evidence are defined once, in [quality-gates.md](quality-gates.md); the manifest may reference tag names but never redefine what they require. `check-consistency.sh` fails the build if a manifest names a tag the standard does not define.

## Empty means fail, not skip

If a required command is an empty string, the gate that depends on it **fails**. It does not silently pass, and it does not quietly skip.

```yaml
commands:
  test: ""      # -> the unit-test gate FAILS
```

This follows directly from the fail-closed rule. A project that genuinely has no test command declares that as a waiver with an expiry and a follow-up issue, which makes the gap visible. An empty string that meant "pass" would let a project satisfy every gate by configuring nothing.

## Configuration precedence

1. Explicit user instruction for the current task.
2. Project manifest.
3. Repository-local instructions.
4. Framework defaults.
5. Agent defaults.

If two sources conflict, the agent reports the conflict and follows the higher-precedence source. Never hide a material conflict.

Note the ordering carefully: an instruction in the current task outranks the manifest, but it never outranks a **gate**. A human can tell an agent to skip a step; only an authorized human can waive a gate, and only through a recorded waiver.

## Keeping the manifest healthy

Review it when the build system, deployment process, branch policy, document locations, or agent adapters change. Treat it as code: small diffs, review, and validation on every change.
