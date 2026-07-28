---
type: adr
track: C
required_when: "a decision is consequential, hard to reverse, or worth explaining later"
status: accepted
number: "0001"
date: 2026-07-28
decision-makers: [prishanf]
related:
  - docs/architecture/overview.md
  - docs/architecture/data-model.md
  - docs/releases/v0.1.0.md
---

# ADR 0001: Local SQLite persistence with no authentication

## Context

AIDF Quick Notes is an example app for exercising the AI Development Framework. Feature 1 needs durable notes across process restarts. Introducing auth, multi-tenancy, or a hosted database would force Track C security work and obscure the framework teaching goal.

## Decision

Persist notes in a single local SQLite file (Drizzle + better-sqlite3). Do not add authentication or object-level authorization for v0.1.0. Any local process that can reach the Nitro server may create, list, and delete all notes.

## Options considered

| Option | Benefits | Costs / risks | Why not / why chosen |
|---|---|---|---|
| Local SQLite, no auth | Simple Track C schema path; clear data model; matches example scope | No multi-user safety; local network exposure | **Chosen** for teaching + local-only use |
| Auth + per-user ownership | Real authorization tests | Out of product scope; delays Feature 1 | Deferred |
| Hosted Postgres / cloud DB | Production-like topology | Infra tag, secrets, environments | Deferred |

## Consequences

- Positive: Schema, migration, and API gates are exercisable without identity plumbing.
- Negative: Must never treat this deployment as multi-user or internet-exposed without revisiting auth.
- Follow-up: Document no-auth posture in data model, API contract, and operator wiki (done for v0.1.0).

## Revisit trigger

Any plan to expose the app beyond a single developer machine, store non-synthetic personal data, or support multiple users.
