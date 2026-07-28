---
type: migration-plan
track: C
required_when: "the change carries the `database` tag"
status: draft
owner: ""
created: YYYY-MM-DD
updated: YYYY-MM-DD
issue: ""
spec: ""
---

# Migration plan: <short name>

## Change summary

<Schema, data, query, retention, or permissions change.>

## Migration artifacts

| Order | Path | Type | Forward-compatible? |
|---|---|---|---|
| 1 | `<path>` | Drizzle / SQL | yes/no |

## Compatibility sequence

1. Expand: <additive or compatible preparation>
2. Deploy: <application behavior using old and new shape>
3. Backfill: <safe resumable action or none>
4. Contract: <later cleanup and release condition>

## Seed profile

The controlled data this migration is validated against. A database change and the data it is exercised with are one decision; they are planned together.

- Profile name: `<name>` (versioned, repeatable)
- Baseline: `synthetic | approved production clone | anonymized dataset`
- Data owner: <role> · Retention: <duration> · Access: <roles>
- Seed command: `<command>` · Idempotency: <how re-runs behave>
- Teardown/reset: `<command or procedure>`

| Persona / entity | Scenario | Identifiers / credentials | Reset behavior |
|---|---|---|---|
| <example user> | <scenario> | <clearly synthetic> | <idempotent action> |

Guardrails:

- [ ] No production credentials are seeded.
- [ ] Synthetic identities are visibly distinguishable from real ones.
- [ ] Production execution is blocked.

## Preview validation

- Baseline/state source: <approved source>
- Apply command: `<command>`
- Verification: <schema, query, authorization, and application checks>

## Production execution

- Recovery point: <method and owner>
- Migration role: <named role, not credential>
- Apply command: `<command>`
- Observation: <health and metric checks>
- Rollback / forward fix: <safe action>

## Approval

- [ ] Database reviewer approved
- [ ] Security/privacy review completed if data policy changed
- [ ] Production release approver approved
