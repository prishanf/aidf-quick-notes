#!/bin/sh
# Validate an evidence artifact and enforce the corroboration rule.
#
# Usage:  reference/scripts/validate-evidence.sh <evidence.json> [manifest]
# Exit:   0 all required gates satisfied by corroborated evidence
#         1 invalid, uncorroborated, or a gate is not satisfied
#         2 could not run
#
# This is the control that makes "agents produce evidence, not confidence"
# real. An agent may write an evidence file; it writes runner=agent, and this
# script refuses to let that satisfy a gate. See standards/evidence.md.

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
EVIDENCE=${1:-evidence.json}
# Same reasoning as run-gates.sh: when vendored under .aidf/, ROOT is not the
# project root, and the manifest is where the runner started.
if [ -n "${2:-}" ]; then
  MANIFEST=$2
elif [ -f "./project.yaml" ]; then
  MANIFEST="./project.yaml"
else
  MANIFEST="$ROOT/project.yaml"
fi

command -v python3 >/dev/null 2>&1 || { echo "aidf: python3 is required" >&2; exit 2; }
[ -f "$EVIDENCE" ] || { echo "aidf: evidence file not found: $EVIDENCE" >&2; exit 2; }

EVIDENCE="$EVIDENCE" MANIFEST="$MANIFEST" \
SCHEMA="$ROOT/schemas/evidence.schema.json" LIB="$ROOT/reference/scripts/lib" python3 - <<'PY'
import datetime, json, os, sys
sys.path.insert(0, os.environ["LIB"])
import minischema

with open(os.environ["EVIDENCE"]) as fh:
    try:
        evidence = json.load(fh)
    except ValueError as exc:
        print("aidf: evidence is not valid JSON: %s" % exc); sys.exit(2)

with open(os.environ["SCHEMA"]) as fh:
    schema = json.load(fh)

problems = minischema.validate(evidence, schema)

allowed = ["ci"]
try:
    manifest = minischema.load_yaml(os.environ["MANIFEST"])
    allowed = (manifest.get("evidence") or {}).get("corroborating_runners") or ["ci"]
except Exception:
    pass

runner = evidence.get("runner")
corroborated = runner in allowed

if not corroborated:
    problems.append(
        "runner is '%s'; only %s corroborate in this project. "
        "Claimed evidence cannot satisfy a gate -- re-run the checks in CI."
        % (runner, "/".join(allowed))
    )

# Exit codes, not adjectives: any non-zero check is a failure.
for check in evidence.get("checks", []):
    if check.get("exit_code", 1) != 0:
        problems.append("check '%s' failed (exit %s)" % (check.get("name"), check.get("exit_code")))

today = datetime.date.today().isoformat()
for gate in evidence.get("gates", []):
    name, status = gate.get("name"), gate.get("status")
    if status == "fail":
        problems.append("gate '%s' failed" % name)
    elif status == "not_run":
        problems.append("gate '%s' did not run. Gates fail closed: a missing result is not a pass." % name)
    elif status == "waived":
        waiver = gate.get("waiver") or {}
        expires = waiver.get("expires", "")
        if not expires:
            problems.append("gate '%s' waived without an expiry. That is not a waiver." % name)
        elif expires < today:
            problems.append("gate '%s' waiver expired on %s. Expired waivers fail the build." % (name, expires))

if problems:
    print("aidf: evidence REJECTED (%d problem%s)\n" % (len(problems), "" if len(problems) == 1 else "s"))
    for p in problems:
        print("  - %s" % p)
    sys.exit(1)

print("aidf: evidence accepted -- %d check(s), %d gate(s), runner=%s, commit=%s"
      % (len(evidence.get("checks", [])), len(evidence.get("gates", [])),
         runner, evidence.get("commit", "?")[:8]))
PY
