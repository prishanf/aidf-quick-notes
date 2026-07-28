<!--
AIDF pull request template. Copy to .github/PULL_REQUEST_TEMPLATE.md.

Note what this template does NOT ask for: a table of check results. Results
come from the CI run, linked below. A summary of your own test outcomes is
unverifiable, and asking for one invites fabrication. See standards/evidence.md.
-->

## Summary

<!-- What changed and why. -->

## Classification

Apply the matching labels: `track-a` / `track-c` (omit for Track B) and any of
`ui` `api` `database` `security` `mcp-write` `infra` `dependency` `release` `docs`.

- Spec: <!-- link, or "Track A — no spec required" -->
- Issue: <!-- link -->

## Evidence

- Evidence artifact: <!-- link the `aidf-evidence` artifact from the CI run -->
- Preview: <!-- URL + revision, or "not required — no ui/api/database tag" -->

Not covered by automation:

- <!-- what a human checked, and how -->
- <!-- what nobody checked — say so plainly; a known gap beats a silent one -->

## Risks and rollout

- Risk:
- Rollback:
- Migration / feature flag:

## Documentation

- [ ] Architecture updated
- [ ] ADR added or linked
- [ ] Wiki updated
- [ ] Release notes prepared
- [ ] None needed, because:

## Reviewer guidance

<!-- Where should a reviewer spend their attention? If this PR is over the size
     budget, either split it or justify the size here. -->

<!-- Human review begins after AI review posts the ready-for-human comment.
     AI review does not replace required human approval. -->
