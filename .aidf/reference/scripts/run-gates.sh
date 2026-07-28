#!/bin/sh
# Run the gates a change's track and tags require, and emit evidence.json.
#
# Usage:
#   reference/scripts/run-gates.sh [--track A|B|C] [--tags ui,api] [--manifest path]
#                                  [--runner ci|local|agent] [--out evidence.json]
#
# Exit:   0 every required check passed · 1 a check failed · 2 could not run
#
# Emits an evidence artifact regardless of outcome -- a failed run is evidence
# too, and hiding it is how a framework ends up trusting prose.

set -eu

ROOT=$(CDPATH= cd -- "$(dirname -- "$0")/../.." && pwd)
# Prefer the manifest in the working directory. When the framework is vendored
# under .aidf/, ROOT is that vendored directory -- which holds no project.yaml.
# The project's manifest lives at the repository root, where the runner starts.
if [ -f "./project.yaml" ]; then
  MANIFEST="$(CDPATH= cd -- . && pwd)/project.yaml"
else
  MANIFEST="$ROOT/project.yaml"
fi
TRACK=""
TAGS=""
OUT="evidence.json"
RUNNER="${AIDF_RUNNER:-local}"
[ "${CI:-}" = "true" ] && RUNNER="ci"

while [ $# -gt 0 ]; do
  case "$1" in
    --track)    TRACK=$2; shift 2 ;;
    --tags)     TAGS=$2; shift 2 ;;
    --manifest) MANIFEST=$2; shift 2 ;;
    --runner)   RUNNER=$2; shift 2 ;;
    --out)      OUT=$2; shift 2 ;;
    -h|--help)  sed -n '2,12p' "$0"; exit 0 ;;
    *) echo "aidf: unknown option $1" >&2; exit 2 ;;
  esac
done

command -v python3 >/dev/null 2>&1 || { echo "aidf: python3 is required" >&2; exit 2; }
[ -f "$MANIFEST" ] || { echo "aidf: manifest not found: $MANIFEST" >&2; exit 2; }

COMMIT=$(git rev-parse HEAD 2>/dev/null || echo "0000000")

MANIFEST="$MANIFEST" TRACK="$TRACK" TAGS="$TAGS" OUT="$OUT" RUNNER="$RUNNER" \
COMMIT="$COMMIT" LIB="$ROOT/reference/scripts/lib" python3 - <<'PY'
import datetime, json, os, subprocess, sys, time
sys.path.insert(0, os.environ["LIB"])
import minischema

manifest = minischema.load_yaml(os.environ["MANIFEST"])
commands = manifest.get("commands") or {}
tags = [t.strip() for t in os.environ["TAGS"].split(",") if t.strip()]
runner = os.environ["RUNNER"]

forced = (manifest.get("tags") or {}).get("track_c_forced_by") or []
track = os.environ["TRACK"] or ("C" if any(t in forced for t in tags) else "B")
if track == "A" and any(t in forced for t in tags):
    print("aidf: refusing Track A -- tag(s) %s force Track C."
          % ", ".join(t for t in tags if t in forced))
    sys.exit(2)

risk = {"A": "low", "B": "standard", "C": "high"}[track]

# Baseline applies to every track. Optional entries run only when configured.
baseline = ["format", "lint", "typecheck", "test", "build"]
required = {"lint", "test", "build"}

if "database" in tags and commands.get("migrate"):
    baseline.append("migrate")
preview_for = (manifest.get("tags") or {}).get("preview_required_for") or []
needs_preview = track == "C" or any(t in preview_for for t in tags)
if needs_preview and commands.get("smoke"):
    baseline.append("smoke")

checks, gates, failed = [], [], False

for name in baseline:
    cmd = (commands.get(name) or "").strip()
    if not cmd:
        if name in required:
            # Fail closed: an unset required command is a failing gate.
            checks.append({"name": name, "command": "", "exit_code": 127, "duration_ms": 0})
            gates.append({"name": name, "status": "fail", "source": runner if runner != "agent" else "ci"})
            print("FAIL  %-10s (not configured -- an unset required command is a failing gate)" % name)
            failed = True
        continue

    started = time.time()
    # Flush before handing stdout to the child, or our label prints after the
    # output it labels.
    print("RUN   %-10s %s" % (name, cmd), flush=True)
    rc = subprocess.call(cmd, shell=True)
    duration = int((time.time() - started) * 1000)
    checks.append({"name": name, "command": cmd, "exit_code": rc, "duration_ms": duration})
    gates.append({"name": name,
                  "status": "pass" if rc == 0 else "fail",
                  "source": "ci" if runner == "ci" else "human"})
    print("%s  %-10s (%dms)" % ("PASS " if rc == 0 else "FAIL ", name, duration))
    if rc != 0:
        failed = True

# The `api` tag's endpoint-coverage gate. Not a manifest command: it is a
# framework check, so it runs from reference/scripts rather than from a project
# command that could be quietly left empty.
if "api" in tags:
    script = os.path.join(os.environ["LIB"], "..", "check-api-coverage.sh")
    cmd = "sh %s --manifest %s" % (
        json.dumps(os.path.normpath(script)), json.dumps(os.environ["MANIFEST"]))
    started = time.time()
    print("RUN   %-10s %s" % ("api-tests", cmd), flush=True)
    rc = subprocess.call(cmd, shell=True)
    duration = int((time.time() - started) * 1000)
    checks.append({"name": "api-tests", "command": cmd,
                   "exit_code": rc, "duration_ms": duration})
    gates.append({"name": "api-tests",
                  "status": "pass" if rc == 0 else "fail",
                  "source": "ci" if runner == "ci" else "human"})
    print("%s  %-10s (%dms)" % ("PASS " if rc == 0 else "FAIL ", "api-tests", duration))
    if rc != 0:
        failed = True

# Track B/C: a changelog entry is required, same as any other gate -- not a
# manifest command, since a project could leave it configured empty.
if track in ("B", "C"):
    script = os.path.join(os.environ["LIB"], "..", "check-changelog.sh")
    cmd = "sh %s --track %s --manifest %s" % (
        json.dumps(os.path.normpath(script)), track, json.dumps(os.environ["MANIFEST"]))
    started = time.time()
    print("RUN   %-10s %s" % ("changelog", cmd), flush=True)
    rc = subprocess.call(cmd, shell=True)
    duration = int((time.time() - started) * 1000)
    checks.append({"name": "changelog", "command": cmd,
                   "exit_code": rc, "duration_ms": duration})
    gates.append({"name": "changelog",
                  "status": "pass" if rc == 0 else "fail",
                  "source": "ci" if runner == "ci" else "human"})
    print("%s  %-10s (%dms)" % ("PASS " if rc == 0 else "FAIL ", "changelog", duration))
    if rc != 0:
        failed = True

# Gates that automation cannot satisfy are recorded as not_run, never as pass.
manual = [("pr-approval", True), ("ui-qa-signoff", "ui" in tags),
          ("specialist-review", track == "C"), ("preview", needs_preview)]
for name, applies in manual:
    if applies:
        gates.append({"name": name, "status": "not_run", "source": "human"})

evidence = {
    "schema_version": "1",
    "commit": os.environ["COMMIT"],
    "runner": runner,
    "generated_at": datetime.datetime.now(datetime.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
    "classification": {"track": track, "risk": risk, "tags": tags},
    "checks": checks,
    "gates": gates,
}
if os.environ.get("GITHUB_SERVER_URL") and os.environ.get("GITHUB_RUN_ID"):
    evidence["run_url"] = "%s/%s/actions/runs/%s" % (
        os.environ["GITHUB_SERVER_URL"], os.environ.get("GITHUB_REPOSITORY", ""), os.environ["GITHUB_RUN_ID"])

with open(os.environ["OUT"], "w") as fh:
    json.dump(evidence, fh, indent=2)
    fh.write("\n")

print("\naidf: track %s · tags [%s] · preview %s" %
      (track, ", ".join(tags) or "none", "required" if needs_preview else "not required"))
print("aidf: wrote %s (runner=%s)" % (os.environ["OUT"], runner))
if runner != "ci":
    print("aidf: NOTE runner=%s does not corroborate a gate. CI must re-run these checks." % runner)

sys.exit(1 if failed else 0)
PY
