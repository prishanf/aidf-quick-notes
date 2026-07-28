#!/bin/sh
# Fail when a Track B/C change touches source but never touches the changelog.
#
# Usage:
#   reference/scripts/check-changelog.sh --track A|B|C [--manifest path] [--base ref]
#
# Exit:   0 not required, or required and satisfied · 1 required and missing
#         2 could not run
#
# Why this exists: the framework keeps its own CHANGELOG so a reader can see
# what changed without diffing every file. An installed project had no
# equivalent -- nothing recorded what a release actually did beyond the git
# log, and the git log is commit-message discipline, not a reviewable record.
# Track A (typo fixes, comment changes, formatting) is exempt: forcing an
# entry for every trivial change trains people to write meaningless ones.

set -eu

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MANIFEST="$(CDPATH= cd -- "$HERE/../.." && pwd)/project.yaml"
TRACK=""
BASE=""

while [ $# -gt 0 ]; do
  case "$1" in
    --track)    TRACK=$2; shift 2 ;;
    --manifest) MANIFEST=$2; shift 2 ;;
    --base)     BASE=$2; shift 2 ;;
    -h|--help)  sed -n '2,14p' "$0"; exit 0 ;;
    *) echo "aidf: unknown option $1" >&2; exit 2 ;;
  esac
done

[ -n "$TRACK" ] || { echo "aidf: --track is required" >&2; exit 2; }
command -v python3 >/dev/null 2>&1 || { echo "aidf: python3 is required" >&2; exit 2; }
[ -f "$MANIFEST" ] || { echo "aidf: manifest not found: $MANIFEST" >&2; exit 2; }

if [ "$TRACK" = "A" ]; then
  echo "aidf: track A -- changelog entry optional, not checked"
  exit 0
fi

# Globs and paths are resolved against the manifest's directory -- the project
# root -- not this script's location, the same reasoning as check-api-coverage.sh.
ROOT=$(CDPATH= cd -- "$(dirname -- "$MANIFEST")" && pwd)

REF=$BASE
if [ -z "$REF" ]; then
  REF=$(sed -n 's/^[[:space:]]*integration_branch:[[:space:]]*\([^[:space:]#]*\).*/\1/p' "$MANIFEST" | head -1)
  REF=${REF:-develop}
  git -C "$ROOT" rev-parse --verify "origin/$REF" >/dev/null 2>&1 && REF="origin/$REF"
fi

if ! git -C "$ROOT" rev-parse --verify "$REF" >/dev/null 2>&1; then
  echo "aidf: cannot resolve base ref '$REF' -- nothing to compare, skipping" >&2
  exit 0
fi

CHANGED=$(git -C "$ROOT" diff --name-only "$REF"...HEAD 2>/dev/null || true)

MANIFEST="$MANIFEST" ROOT="$ROOT" CHANGED="$CHANGED" LIB="$HERE/lib" python3 - <<'PY'
import fnmatch, os, sys

sys.path.insert(0, os.environ["LIB"])
import minischema

manifest = minischema.load_yaml(os.environ["MANIFEST"])
changelog = (manifest.get("documents") or {}).get("changelog") or "CHANGELOG.md"

changed = [p for p in os.environ["CHANGED"].split("\n") if p.strip()]

if not changed:
    print("aidf: no changes against base -- nothing to check")
    sys.exit(0)

# Paths that never need a changelog entry on their own: the vendored framework,
# generated evidence, and lockfiles/gitkeeps that are not user-facing behavior.
root_name = os.path.basename(os.environ["ROOT"].rstrip("/"))
framework_root = (manifest.get("framework") or {}).get("root") or ".aidf"
EXEMPT_DIRS = (framework_root.strip("/") + "/", ".github/")
EXEMPT_FILES = ("evidence.json", ".gitkeep", "package-lock.json", "yarn.lock", "pnpm-lock.yaml")

def exempt(path):
    if path == changelog:
        return True
    if any(path.startswith(d) for d in EXEMPT_DIRS):
        return True
    if os.path.basename(path) in EXEMPT_FILES:
        return True
    return False

source_changes = [p for p in changed if not exempt(p)]

if not source_changes:
    print("aidf: only exempt paths changed -- changelog entry not required")
    sys.exit(0)

if changelog in changed:
    print("aidf: %s updated alongside %d source file%s"
          % (changelog, len(source_changes), "" if len(source_changes) == 1 else "s"))
    sys.exit(0)

print("aidf: %d source file%s changed but %s was not:"
      % (len(source_changes), "" if len(source_changes) == 1 else "s", changelog))
for p in source_changes[:15]:
    print("  - %s" % p)
if len(source_changes) > 15:
    print("  ... and %d more" % (len(source_changes) - 15))
print("\nFAIL  Track B/C changes require a changelog entry. Add one under")
print("      [Unreleased] in %s describing what changed and why." % changelog)
sys.exit(1)
PY
