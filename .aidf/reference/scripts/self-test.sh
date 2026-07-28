#!/bin/sh
# AIDF's own test suite. Proves the gates work in both directions -- a control
# that only ever passes is not a control.
#
# Usage:  reference/scripts/self-test.sh
# Exit:   0 all assertions held · 1 a test failed

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
PASS=0
FAIL=0

ok()   { PASS=$((PASS+1)); printf '  ok   %s\n' "$1"; }
bad()  { FAIL=$((FAIL+1)); printf '  FAIL %s\n' "$1"; }

expect_pass() { # description, command...
  desc=$1; shift
  if "$@" >"$TMP/out" 2>&1; then ok "$desc"; else bad "$desc"; sed 's/^/       /' "$TMP/out"; fi
}
expect_fail() { # description, command...
  desc=$1; shift
  if "$@" >"$TMP/out" 2>&1; then bad "$desc (expected failure, got success)"; else ok "$desc"; fi
}

echo "manifest validation"
expect_pass "valid manifest is accepted" \
  sh "$ROOT/reference/scripts/validate-manifest.sh" "$ROOT/project.yaml"

sed 's/^  test: .*/  test: ""/' "$ROOT/project.yaml" > "$TMP/empty-command.yaml"
expect_fail "empty required command fails (not skipped)" \
  sh "$ROOT/reference/scripts/validate-manifest.sh" "$TMP/empty-command.yaml"

sed 's/^  integration_branch:/  integraton_branch:/' "$ROOT/project.yaml" > "$TMP/typo.yaml"
expect_fail "typo'd key fails instead of silently disabling a gate" \
  sh "$ROOT/reference/scripts/validate-manifest.sh" "$TMP/typo.yaml"

sed 's/^  enabled: \[ui,/  enabled: [made-up-tag, ui,/' "$ROOT/project.yaml" > "$TMP/badtag.yaml"
expect_fail "undefined risk tag is rejected" \
  sh "$ROOT/reference/scripts/validate-manifest.sh" "$TMP/badtag.yaml"

echo "evidence contract"
cat > "$TMP/ci.json" <<'JSON'
{ "schema_version": "1", "commit": "abc1234", "runner": "ci",
  "generated_at": "2026-07-26T00:00:00Z",
  "classification": { "track": "B", "risk": "standard", "tags": [] },
  "checks": [ { "name": "test", "command": "true", "exit_code": 0 } ],
  "gates":  [ { "name": "test", "status": "pass", "source": "ci" } ] }
JSON
expect_pass "corroborated evidence is accepted" \
  sh "$ROOT/reference/scripts/validate-evidence.sh" "$TMP/ci.json" "$ROOT/project.yaml"

sed 's/"runner": "ci"/"runner": "agent"/' "$TMP/ci.json" > "$TMP/agent.json"
expect_fail "agent-authored evidence CANNOT satisfy a gate" \
  sh "$ROOT/reference/scripts/validate-evidence.sh" "$TMP/agent.json" "$ROOT/project.yaml"

sed 's/"status": "pass"/"status": "not_run"/' "$TMP/ci.json" > "$TMP/notrun.json"
expect_fail "not_run on a CI gate does not count as pass (fail closed)" \
  sh "$ROOT/reference/scripts/validate-evidence.sh" "$TMP/notrun.json" "$ROOT/project.yaml"

cat > "$TMP/human-pending.json" <<'JSON'
{ "schema_version": "1", "commit": "abc1234", "runner": "ci",
  "generated_at": "2026-07-26T00:00:00Z",
  "classification": { "track": "B", "risk": "standard", "tags": [] },
  "checks": [ { "name": "test", "command": "true", "exit_code": 0 } ],
  "gates": [
    { "name": "test", "status": "pass", "source": "ci" },
    { "name": "pr-approval", "status": "not_run", "source": "human" }
  ] }
JSON
expect_pass "human not_run gates are pending, not a CI rejection" \
  sh "$ROOT/reference/scripts/validate-evidence.sh" "$TMP/human-pending.json" "$ROOT/project.yaml"

cat > "$TMP/expired.json" <<'JSON'
{ "schema_version": "1", "commit": "abc1234", "runner": "ci",
  "generated_at": "2026-07-26T00:00:00Z",
  "classification": { "track": "B", "risk": "standard", "tags": [] },
  "checks": [],
  "gates": [ { "name": "test", "status": "waived", "source": "waiver",
    "waiver": { "approver": "lead", "reason": "flaky", "expires": "2020-01-01",
                "follow_up": "issue-1" } } ] }
JSON
expect_fail "expired waiver fails the build" \
  sh "$ROOT/reference/scripts/validate-evidence.sh" "$TMP/expired.json" "$ROOT/project.yaml"

cat > "$TMP/nowaiver.json" <<'JSON'
{ "schema_version": "1", "commit": "abc1234", "runner": "ci",
  "generated_at": "2026-07-26T00:00:00Z",
  "classification": { "track": "B", "risk": "standard", "tags": [] },
  "checks": [],
  "gates": [ { "name": "test", "status": "waived", "source": "waiver" } ] }
JSON
expect_fail "waiver without approver/expiry/follow-up is invalid" \
  sh "$ROOT/reference/scripts/validate-evidence.sh" "$TMP/nowaiver.json" "$ROOT/project.yaml"

# --------------------------------------------------- api endpoint coverage
# The gap this closes was real: fourteen routes shipped with three unit tests
# of their helper functions and every gate green. These cases prove the check
# distinguishes an HTTP-level test from a helper unit test -- if they ever stop
# proving it, the `api` tag is decorative again.
echo
echo "api endpoint coverage"

API="$TMP/api"
mkdir -p "$API/server/api/widgets" "$API/tests"
: > "$API/server/api/widgets/index.get.ts"
cat > "$API/project.yaml" <<'YAML'
api:
  route_root: server/api
  route_url_prefix: /api
  route_globs: ["server/api/**/*.ts"]
  test_globs: ["tests/**/*.test.ts"]
YAML

expect_fail "an endpoint with no test at all fails the api gate" \
  sh "$ROOT/reference/scripts/check-api-coverage.sh" --manifest "$API/project.yaml"

cat > "$API/tests/helpers.test.ts" <<'TS'
import { normalise } from "../server/utils/widgets";
// exercises the logic behind GET /api/widgets
it("normalises", () => { expect(normalise({})).toEqual({}); });
TS
expect_fail "a helper unit test naming the endpoint is NOT endpoint coverage" \
  sh "$ROOT/reference/scripts/check-api-coverage.sh" --manifest "$API/project.yaml"

cat > "$API/tests/http.test.ts" <<'TS'
it("lists widgets", async () => {
  const res = await fetch("/api/widgets");
  expect(res.status).toBe(200);
});
TS
expect_pass "a test that requests the endpoint over HTTP satisfies it" \
  sh "$ROOT/reference/scripts/check-api-coverage.sh" --manifest "$API/project.yaml"

cat > "$API/unconfigured.yaml" <<'YAML'
api:
  contract_required_for_changed_apis: true
YAML
expect_fail "an unconfigured api block fails closed, not open" \
  sh "$ROOT/reference/scripts/check-api-coverage.sh" --manifest "$API/unconfigured.yaml"

# --------------------------------------------------------------- changelog
# Mirrors the api-coverage gap: a project could ship Track B/C changes with
# every other gate green and no record of what changed anywhere but git log.
echo
echo "changelog"

CL="$TMP/changelog"
mkdir -p "$CL"
git -C "$CL" init -q
printf 'root: .\n' > "$CL/project.yaml"
printf '# Changelog\n\n## [Unreleased]\n' > "$CL/CHANGELOG.md"
git -C "$CL" add -A && git -C "$CL" -c user.email=t@t -c user.name=t commit -q -m seed
git -C "$CL" branch -q base

echo "hello" >> "$CL/app.js"
git -C "$CL" add app.js
git -C "$CL" -c user.email=t@t -c user.name=t commit -q -m "add feature"

expect_fail "track B change with no changelog entry fails" \
  sh "$ROOT/reference/scripts/check-changelog.sh" --track B --manifest "$CL/project.yaml" --base base

expect_pass "track A change is optional, not enforced" \
  sh "$ROOT/reference/scripts/check-changelog.sh" --track A --manifest "$CL/project.yaml" --base base

printf '# Changelog\n\n## [Unreleased]\n- Added the widgets feature.\n' > "$CL/CHANGELOG.md"
git -C "$CL" add CHANGELOG.md
git -C "$CL" -c user.email=t@t -c user.name=t commit -q -m "changelog: widgets"

expect_pass "track B change with a changelog entry passes" \
  sh "$ROOT/reference/scripts/check-changelog.sh" --track B --manifest "$CL/project.yaml" --base base

echo
printf 'aidf self-test: %d passed, %d failed\n' "$PASS" "$FAIL"
[ "$FAIL" -eq 0 ]
