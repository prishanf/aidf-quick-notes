# Evidence

AIDF's first principle is that agents produce evidence, not confidence. That principle is worthless unless evidence is distinguishable from assertion. A Markdown table reading `tests — pass` is indistinguishable from a fabrication, and an agent under pressure to finish will produce one either way.

This file defines what counts.

## Two classes

**Claimed evidence** is authored by an agent or a human describing what they believe happened. It is useful as narrative: what was attempted, what was reasoned, what remains uncertain. It never satisfies a gate.

**Corroborated evidence** is emitted by a runner that executed the thing being claimed. It carries the commit it ran against, the exact command, the process exit code, and a retrievable log. It is the only thing a gate accepts.

> **The rule:** a gate is satisfied by corroborated evidence or it is not satisfied. There is no third option, and no amount of confident prose substitutes.

This shifts the agent's job from *asserting outcomes* to *producing artifacts a runner can corroborate*. That is a smaller job, and a far more trustworthy one.

## The evidence artifact

Verification produces `evidence.json`, validated against [schemas/evidence.schema.json](../schemas/evidence.schema.json):

```json
{
  "schema_version": "1",
  "commit": "9f2c1ab3...",
  "runner": "ci",
  "generated_at": "2026-07-26T10:14:22Z",
  "classification": { "track": "B", "risk": "standard", "tags": ["ui"] },
  "checks": [
    { "name": "lint",  "command": "pnpm lint",  "exit_code": 0, "duration_ms": 4120, "log_url": "..." },
    { "name": "test",  "command": "pnpm test",  "exit_code": 1, "duration_ms": 88300, "log_url": "..." }
  ],
  "gates": [
    { "name": "unit-tests", "status": "fail", "source": "ci" },
    { "name": "pr-approval", "status": "pass", "source": "human" }
  ]
}
```

## The `runner` field is the whole mechanism

| Value | Meaning | Corroborates? |
|---|---|---|
| `ci` | Emitted by the project's CI system on a known commit | **Yes** |
| `local` | Emitted by `run-gates.sh` on a developer machine | Only where the manifest explicitly permits it |
| `agent` | Written by an agent | **No — claimed by definition** |

An agent may write `evidence.json`, and doing so is often useful for handoff. It writes `runner: agent`, and the gate check rejects it as uncorroborated. An agent that writes `runner: ci` into a file it authored is falsifying a record; this is the one place in AIDF where an agent can lie in a way that automation catches, which is exactly why the field exists.

## Consequences for the pull request

The PR body **links** evidence; it does not restate it.

- Link the CI run and the check identifiers. Do not paste a table of results.
- Where automation cannot cover something, say so plainly and describe what a human did instead — that is honest claimed evidence, correctly labelled.
- "Not tested" is an acceptable and useful entry. A silently omitted check is not.

A reviewer reading a PR should never have to trust the author's summary of whether the tests passed. They should be one click from the run.

## Exit codes, not adjectives

A check result is an integer. `0` is pass; anything else is fail. Not "mostly passing", not "passing except a known flake", not "passing locally". A flaky test is a defect to record, not a status to negotiate.

If a check cannot be run, its status is `not_run` with a reason. `not_run` never counts as `pass` — see the fail-closed rule in [quality-gates.md](quality-gates.md).

## Waivers

A waiver is the only sanctioned way past a failed or missing gate. It is corroborated by a human, not by CI:

```json
{ "name": "contract-tests", "status": "waived", "source": "waiver",
  "waiver": { "approver": "role-or-name", "reason": "...",
              "expires": "2026-08-30", "follow_up": "issue-link" } }
```

A waiver without an approver, an expiry, and a follow-up is invalid and the gate remains failed. Expired waivers fail the build — this is deliberate, and is what keeps a temporary exception from becoming permanent policy.

## What this does not solve

Corroboration proves a command ran and what it returned. It does not prove the command was *meaningful* — a test suite that asserts nothing exits `0` just as cheerfully as a good one. That gap is addressed by [testing.md](testing.md), which requires that a new test fail against the pre-change code. Evidence and test quality are two halves of one control; neither works alone.
