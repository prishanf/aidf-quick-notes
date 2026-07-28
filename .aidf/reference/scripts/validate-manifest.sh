#!/bin/sh
# Validate an AIDF project manifest against schemas/project.schema.json.
#
# Usage:  reference/scripts/validate-manifest.sh [path/to/project.yaml]
# Exit:   0 valid · 1 invalid · 2 could not run
#
# An empty *required* command is reported as a FAILURE, not a skip. See
# standards/manifest.md -- gates fail closed, and a manifest that configures
# nothing must not be able to satisfy every gate by omission.

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
MANIFEST=${1:-$ROOT/templates/project.yaml}
SCHEMA=$ROOT/schemas/project.schema.json

command -v python3 >/dev/null 2>&1 || { echo "aidf: python3 is required" >&2; exit 2; }
[ -f "$MANIFEST" ] || { echo "aidf: manifest not found: $MANIFEST" >&2; exit 2; }
[ -f "$SCHEMA" ] || { echo "aidf: schema not found: $SCHEMA" >&2; exit 2; }

MANIFEST="$MANIFEST" SCHEMA="$SCHEMA" LIB="$ROOT/reference/scripts/lib" python3 - <<'PY'
import json, os, sys
sys.path.insert(0, os.environ["LIB"])
import minischema

manifest_path = os.environ["MANIFEST"]

try:
    data = minischema.load_yaml(manifest_path)
except Exception as exc:
    print("aidf: could not read manifest: %s" % exc); sys.exit(2)

with open(os.environ["SCHEMA"]) as fh:
    schema = json.load(fh)

try:
    errors = minischema.validate(data, schema)
except minischema.SchemaFeatureError as exc:
    print("aidf: schema uses an unsupported feature: %s" % exc); sys.exit(2)

# Fail-closed rule: a required command that is present but empty is a failing
# gate. The schema can require the key; only this check can require a value.
REQUIRED_COMMANDS = ("lint", "test", "build")
for name in REQUIRED_COMMANDS:
    value = (data.get("commands") or {}).get(name)
    if value is not None and str(value).strip() == "":
        errors.append(
            "$.commands.%s: empty. An unset required command is a FAILING gate, "
            "not a skip. Set it, or record a waiver with an expiry." % name
        )

# The manifest may enable tags but never redefine them; unknown names would
# silently never match a gate.
DEFINED = {"ui","api","database","security","mcp-write","infra","dependency","release","docs"}
tags = data.get("tags") or {}
for field in ("enabled", "preview_required_for", "track_c_forced_by"):
    for tag in tags.get(field) or []:
        if tag not in DEFINED:
            errors.append("$.tags.%s: '%s' is not defined in standards/quality-gates.md" % (field, tag))

# An agent cannot corroborate its own work.
runners = (data.get("evidence") or {}).get("corroborating_runners") or []
if "agent" in runners:
    errors.append("$.evidence.corroborating_runners: 'agent' can never corroborate. See standards/evidence.md.")

if errors:
    print("aidf: manifest INVALID (%d problem%s)\n" % (len(errors), "" if len(errors) == 1 else "s"))
    for err in errors:
        print("  - %s" % err)
    sys.exit(1)

print("aidf: manifest valid (%s)" % manifest_path)
PY
