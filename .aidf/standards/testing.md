# Testing

AIDF requires tests as evidence in a dozen places. Requiring tests without defining a good one produces a suite that satisfies gates and catches nothing — and an agent optimizing for a green check will produce exactly that suite, quickly and in volume.

Corroborated evidence proves a command ran and what it returned. It cannot prove the command was meaningful. This file closes that half of the gap; [evidence.md](evidence.md) closes the other. Neither works alone.

## The rule that does the most work

> **A new test must fail against the pre-change code.**

If a test passes before the fix, it is not testing the fix. This single rule eliminates most worthless tests, and it is mechanically checkable: stash the source change, run the new test, confirm it fails, restore.

For a bug fix, this is non-negotiable — the failing test *is* the reproduction, and writing it first is the only way to know you found the actual bug rather than a plausible neighbour of it.

## Anti-patterns

These are the specific ways AI-written test suites go wrong. They are common enough to check for by name.

**Asserting current behavior.** A test written by observing what the code does and encoding that. It passes forever, including after a regression, because it was derived from the implementation rather than the requirement. Symptom: the test was written after the code and never failed.

**Mocking the system under test.** Enough mocking that the assertions only exercise the mocks. Symptom: the test passes when you delete the implementation body.

**Tautologies.** `expect(result).toBeDefined()`, `expect(true).toBe(true)`, `assert response is not None`, snapshot tests regenerated until green. Symptom: no assertion references an expected *value*.

**Happy path only.** Agents implement the success case first and test what they implemented. The error, permission-denied, empty, concurrent, and malformed-input cases are where defects live and where coverage is thinnest.

**Testing the framework.** Verifying that the ORM saves a record or the router routes. Someone else already tests that.

**Coverage as the objective.** Coverage measures which lines executed, not which behaviors are protected. A suite can reach 90% and assert nothing meaningful. Use it to find untested areas, never as a gate target — the moment it becomes a target, agents will hit it the cheap way.

**Skips and loosened assertions to get green.** Widening a tolerance, adding `.skip`, catching the exception the test existed to detect. This is a stop condition, not a fix: see [guide/03-workflow.md](../guide/03-workflow.md).

## What to test

Test **behavior at a boundary**, not implementation detail. A test that must change whenever the code is refactored is testing the wrong thing.

For a typical change:

| Layer | What it protects | Notes |
|---|---|---|
| Unit | A pure function's contract, including edge inputs | Fast, no I/O |
| Integration | The seams — real database, real HTTP boundary | Where most real defects hide |
| Contract | The promise an API makes to its consumers | Required for the `api` tag |
| Authorization | **Denied** paths, per object and per role | Required for `api` and `security`; test refusal as deliberately as permission |
| Smoke | The system starts and serves | Post-deploy |

Deliberately included in that table: authorization tests of the *denied* path. Broken access control is the most common serious vulnerability in real applications, and it is invisible to a suite that only ever tests authorized users.

## API endpoint coverage

The `api` tag has always required "contract and authorization tests", and that phrasing turned out to be satisfiable by tests that never touch an endpoint. The observed failure mode: a change adds fourteen routes, the agent writes three unit tests against the pure helper functions those routes call, every gate goes green, and not one HTTP request is made in the entire suite. The helpers were tested. The API was not.

So the rule is stated mechanically:

> **An endpoint added or changed without a test that exercises it through the real router — request in, response out — is not covered.** A unit test of a handler's helpers, validators, or aggregation functions is valuable and is *not* endpoint coverage.

What "through the real router" means in practice: the request goes through the project's actual routing, middleware, authentication, serialization, and error handling, and the test asserts on the status code and the response body. Whether that is an in-process test harness, a running server on an ephemeral port, or the framework's own test client is a project choice — the manifest's `test` command runs it either way.

### Required cases per endpoint

Every changed endpoint needs each applicable row. "Not applicable" is a legitimate answer with a reason; silence is not.

| Case | Asserts | Applies to |
|---|---|---|
| Success | The documented 2xx status **and specific values in the body** — not merely that a body exists | every endpoint |
| Validation failure | 4xx per validated field, with the documented error shape | every endpoint accepting input |
| Unauthenticated | 401 (not 200, not 500) with no data leaked | every authenticated endpoint |
| Authenticated but forbidden | 403 **per role and per object** — the caller who is logged in but owns a different row | every endpoint touching owned data |
| Not found | 404, and 404 rather than 403 only where that is the deliberate policy | every endpoint addressing a resource |
| Cross-tenant / horizontal access | Another tenant's identifier returns 404/403, never that tenant's data | every multi-tenant endpoint |
| Conflict / duplicate | The documented 409/422 on unique or state-conflict violations | writes with uniqueness or state rules |
| Unknown fields | The documented behaviour — rejected or ignored, whichever the contract says | every endpoint accepting a body |
| Pagination and limits | First page, last page, past the end, over the maximum page size | every list endpoint |
| Idempotency / replay | Replaying the same write produces the documented result, not a duplicate row | every non-idempotent write |
| Empty collection | An empty list, not null and not an error | every list endpoint |
| Error shape | Errors match the contract's format and leak no internals or stack traces | every endpoint |

The cross-tenant row is the one worth writing first. It is the test most often missing and the failure most expensive in production.

### Where these are recorded

[templates/api-contract.md](../templates/api-contract.md) carries an endpoint inventory and test matrix: one row per endpoint, naming the test file that covers it. That table is the artifact a reviewer checks against the route list, and `reference/scripts/check-api-coverage.sh` checks the same thing mechanically — it enumerates endpoint files from the manifest's `api.route_globs` and fails when a route has no test referencing its path.

The script catches the absent test. It cannot judge whether the test asserts anything, which is what the matrix, the reviewer, and the anti-patterns above are for. Neither half works alone.

## Flaky tests

A flaky test is a defect, not a status. It has two honest resolutions: fix it, or delete it and record the coverage gap. Retrying until green teaches everyone — human and agent — that a red check is negotiable, which quietly disables every gate that depends on it.

## Agent instructions

When the build agent writes tests:

- Write the test for a bug **before** the fix, and confirm it fails.
- Name what the test protects, not what it calls: `rejects a saved search whose filters exceed the caller's permissions`, not `test saved search 3`.
- Mirror the existing test style in the file you are nearest to; see [templates/conventions.md](../templates/conventions.md).
- When a test cannot be written — genuine environmental limits — say so in the PR under "not covered by automation". An honest gap is evidence. A tautology dressed as coverage is not.
- Never modify an existing test to make a change pass without saying so explicitly and prominently. Silently editing an assertion is the single most dangerous edit an agent can make, because it removes a control while appearing to add work.
