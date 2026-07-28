---
type: api-contract
track: B
required_when: "the change carries the `api` tag"
status: draft
owner: ""
updated: YYYY-MM-DD
service: ""
---

# API contract: <service or endpoint>

## Purpose and consumers

<What problem this API solves and who calls it.>

## Interface

- Contract source: <OpenAPI, JSON Schema, or code path>
- Authentication: <mechanism>
- Authorization: <required permissions and object-level rule>
- Request schema: <link or summary>
- Response schema: <link or summary>
- Errors: <stable format and safe messages>

## Behavior

- Pagination/limits: <rule>
- Idempotency/retries: <rule>
- Rate limit: <rule>
- Versioning/deprecation: <rule>
- Audit/correlation: <fields>

## NFR profile

| Concern | Target or explicit pending decision | Owner / review date |
|---|---|---|
| Latency | <target or pending> | <owner> |
| Availability | <target or pending> | <owner> |
| Capacity | <target or pending> | <owner> |
| Recovery | <target or pending> | <owner> |
| Cost | <target or pending> | <owner> |

## Endpoint inventory

Every endpoint this change adds or alters. A route that exists in the code and not in this table is undocumented; a route in this table and not in the code is stale.

| Method | Path | Purpose | Auth required | Roles permitted | Object-level rule | Idempotent |
|---|---|---|---|---|---|---|
| `GET` | `<path>` | <what it returns> | <yes/no> | `<roles>` | <e.g. own tenant only> | yes |
| `POST` | `<path>` | <what it creates> | <yes/no> | `<roles>` | <rule> | <no — or the idempotency key> |

## Endpoint test matrix

One row per endpoint. This table is the `api` tag's evidence that endpoints are covered **at the HTTP boundary**, not that their helper functions have unit tests — see [../standards/testing.md](../standards/testing.md) for why that distinction is written down.

Mark each cell `✓` (covered), `n/a` (with a reason below), or leave it blank — and a blank is a gap, not a pass.

| Method + path | Test file | 2xx + body | Validation 4xx | 401 | 403 per object | 404 | Cross-tenant | Conflict | Unknown fields | Pagination | Replay | Error shape |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| `GET <path>` | `<path>` | | | | | | | | | | | |
| `POST <path>` | `<path>` | | | | | | | | | | | |

**`n/a` justifications**

| Endpoint + case | Why it does not apply |
|---|---|
| `<method path>` — <case> | <specific, checkable reason> |

**Not covered by automation**

| Endpoint + case | Why | How it is verified instead |
|---|---|---|
| `<method path>` — <case> | <genuine environmental limit> | <manual step, or accepted gap + follow-up issue> |

An honest gap recorded here is evidence. A `✓` against a test that asserts only `toBeDefined()` is not — see the anti-patterns in [../standards/testing.md](../standards/testing.md).

## Verification

- [ ] Every endpoint in the inventory appears in the test matrix
- [ ] Every matrix row names a test that goes through the real router
- [ ] Denied-path authorization tests exist per role **and** per object
- [ ] Cross-tenant access is tested and returns no data
- [ ] Input validation tested per validated field, with the documented error shape
- [ ] `reference/scripts/check-api-coverage.sh` passes
- [ ] Smoke test
