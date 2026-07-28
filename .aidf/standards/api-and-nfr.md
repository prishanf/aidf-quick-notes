# API and NFR Standard

Every application API must have a durable contract and a declared non-functional requirement profile. The framework intentionally does not impose universal latency or availability numbers; each project chooses targets appropriate to its users and risk.

## API contract baseline

For each public, partner, internal, or agent-facing API, document:

- purpose, owner, and consumer type;
- authentication and authorization model;
- request and response schemas, including unknown-field behavior;
- error format and safe error messages;
- pagination, filtering, ordering, and response-size limits;
- idempotency and retry behavior for writes;
- rate limits and abuse controls;
- versioning and deprecation policy;
- audit, logging, tracing, and correlation fields;
- data classification and retention rules.

## NFR profile

The project manifest should set targets or explicitly mark a target as not yet established with an owner and review date.

| Concern | Required declaration |
|---|---|
| Reliability | Availability target, error budget, health behavior |
| Performance | Latency and throughput target by critical operation |
| Capacity | Expected concurrency, data volume, and response ceilings |
| Security | Authentication, authorization, validation, audit expectations |
| Privacy | Data classes, retention, access, and deletion behavior |
| Operability | Logs, metrics, traces, alerts, dashboard owner |
| Recovery | Recovery-time and recovery-point objectives, rollback approach |
| Cost | Known expensive operations and budget/guardrail |

## Verification

Contract tests, authorization tests, input validation tests, and safe smoke tests are required for every changed API. Performance, load, accessibility, or resilience testing is activated when the change's classification (in the spec front matter) or the NFR profile requires it.
