# 02 — Tracks

Process should be proportional to risk. AIDF defines three tracks. Every change runs on exactly one.

A track is chosen once, when the change is classified, and it determines three things: which documents exist, which gates run, and who must approve. Choosing a track is not optional — an unclassified change defaults to Track B.

## The three tracks

| | **Track A — Trivial** | **Track B — Standard** | **Track C — High risk** |
|---|---|---|---|
| **Risk level** | `low` | `standard` | `high` |
| **When** | No behavior change: docs, comments, formatting, isolated non-functional edits | The default. Any user-visible or behavioral change | Any `database`, `security`, `mcp-write`, `release`, or `infra` tag |
| **Spec** | Not required | Required and approved before planning | Required, plus explicit risk review |
| **Documents** | PR only | Spec → plan → PR → AI review → human review → release note (**5**) — plus a design and, by default, a mockup, if tagged `ui` | Track B plus the artifacts its tags demand |
| **Preview env** | No | Only if tagged `ui`, `api`, or `database` | Per tags; always for `database` |
| **Gates** | Format, lint, typecheck, test, build + AI review + 1 human approval | Track A gates + PR approval against the spec | Track B gates + specialist review + production approval + rollback record |
| **Merge** | Any authorized reviewer | Authorized reviewer | Authorized reviewer + named specialist |

## Choosing the track

Work top-down and stop at the first match.

1. Does the change carry a `database`, `security`, `mcp-write`, `release`, or `infra` tag? → **Track C**.
2. Does it change behavior a user, operator, or API consumer can observe? → **Track B**.
3. Is it genuinely non-behavioral — documentation, comments, formatting, a test-only addition, a rename with no semantic effect? → **Track A**.

If the choice is unclear, it is Track B. If a Track A or B change turns out mid-flight to touch schema, authorization, secrets, or production configuration, **stop and re-classify upward**. Tracks may be escalated at any time; they may only be lowered by re-classifying before implementation begins.

## Risk tags

Tags are defined once, in [standards/quality-gates.md](../standards/quality-gates.md). That file is the only place the taxonomy lives; the manifest and schema reference the names, they do not redefine them. A change may carry several tags.

Tags never *lower* a track. They add required evidence on top of it.

## Track A is a real track, not a loophole

Track A exists so that people do not route around the framework. A typo fix that would require a spec, a plan, a classification document, and a deployed preview environment does not get those things — it gets abandoned, and the next change after it skips the process too.

Track A still requires: a pull request, AI review with a ready-for-human comment, passing automated checks, and one human approval. What it does not require is paperwork about a change whose entire content is visible in the diff.

**Spikes and throwaway work** run on Track A with one added rule: the branch is marked as an experiment, it is never merged to the integration branch, and anything worth keeping is re-implemented on Track B. An explicit escape hatch is safer than an implicit one.

## Where a track is recorded

The track and its tags live in the front matter of the feature spec (Track B and C), or in the pull request body (Track A):

```yaml
classification:
  track: B
  risk: standard
  tags: [ui, api]
```

There is no separate classification document. The classification is a property of the change, recorded where the change is already described. Automated gates read this block; see [standards/evidence.md](../standards/evidence.md).

## Escalation is normal

Escalating a track mid-change is a healthy outcome, not a process failure. It means classification did its job. Record the reason in the spec or PR, and pick up the additional gates from the point of escalation — do not retroactively reconstruct evidence for work already done. Redo the work if the new track requires evidence the original work cannot supply.
