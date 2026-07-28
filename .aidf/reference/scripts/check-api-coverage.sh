#!/bin/sh
# Fail when a changed API endpoint has no test that references it.
#
# Usage:
#   reference/scripts/check-api-coverage.sh [--manifest path] [--changed-only]
#                                           [--base ref] [--json out.json]
#
# Exit:   0 every endpoint referenced · 1 gaps found · 2 could not run
#
# Why this exists: the `api` tag required "contract and authorization tests",
# and that phrasing turned out to be satisfiable without touching an endpoint.
# Observed: a change added fourteen routes, three unit tests were written
# against the pure helper functions those routes call, every gate went green,
# and not one HTTP request was made in the entire suite.
#
# What this proves: a test file names the endpoint. What it CANNOT prove: that
# the test asserts anything meaningful, or that the request really goes through
# the router. Those are the reviewer's job and the endpoint test matrix's job --
# see standards/testing.md and templates/api-contract.md. A mechanical check
# that catches the absent test is still worth having; it is the failure that
# actually happened.

set -eu

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
MANIFEST="$(CDPATH= cd -- "$HERE/../.." && pwd)/project.yaml"
CHANGED_ONLY=0
BASE=""
JSON_OUT=""

while [ $# -gt 0 ]; do
  case "$1" in
    --manifest)     MANIFEST=$2; shift 2 ;;
    --changed-only) CHANGED_ONLY=1; shift ;;
    --base)         BASE=$2; shift 2 ;;
    --json)         JSON_OUT=$2; shift 2 ;;
    -h|--help)      sed -n '2,25p' "$0"; exit 0 ;;
    *) echo "aidf: unknown option $1" >&2; exit 2 ;;
  esac
done

command -v python3 >/dev/null 2>&1 || { echo "aidf: python3 is required" >&2; exit 2; }
[ -f "$MANIFEST" ] || { echo "aidf: manifest not found: $MANIFEST" >&2; exit 2; }

# Globs are resolved against the manifest's directory -- the project root --
# not against this script's location. The script may be vendored under .aidf/,
# or run from anywhere; the manifest is what anchors the project.
ROOT=$(CDPATH= cd -- "$(dirname -- "$MANIFEST")" && pwd)

CHANGED=""
if [ "$CHANGED_ONLY" = "1" ]; then
  # Default to the manifest's integration branch; --base overrides it.
  REF=$BASE
  if [ -z "$REF" ]; then
    REF=$(sed -n 's/^[[:space:]]*integration_branch:[[:space:]]*\([^[:space:]#]*\).*/\1/p' "$MANIFEST" | head -1)
    REF=${REF:-develop}
    git -C "$ROOT" rev-parse --verify "origin/$REF" >/dev/null 2>&1 && REF="origin/$REF"
  fi
  CHANGED=$(git -C "$ROOT" diff --name-only "$REF"...HEAD 2>/dev/null || true)
fi

MANIFEST="$MANIFEST" ROOT="$ROOT" CHANGED="$CHANGED" CHANGED_ONLY="$CHANGED_ONLY" \
JSON_OUT="$JSON_OUT" LIB="$HERE/lib" python3 - <<'PY'
import fnmatch, glob, json, os, re, sys

sys.path.insert(0, os.environ["LIB"])
import minischema

root = os.environ["ROOT"]
manifest = minischema.load_yaml(os.environ["MANIFEST"])
api = manifest.get("api") or {}

route_globs = api.get("route_globs") or []
test_globs = api.get("test_globs") or []
route_root = (api.get("route_root") or "").strip("/")
url_prefix = "/" + (api.get("route_url_prefix") or "").strip("/")
waivers = api.get("coverage_waivers") or []

if isinstance(route_globs, str):
    route_globs = [route_globs]
if isinstance(test_globs, str):
    test_globs = [test_globs]

# Fail closed. This script only runs for the `api` tag, so reaching it with no
# configuration means the gate cannot be evaluated -- which is a failure, not a
# skip. An unconfigured check that reports success is worse than no check.
if not route_globs:
    print("aidf: api.route_globs is not set in the manifest.")
    print("      The `api` tag cannot be evaluated without it. Example:\n")
    print('        api:')
    print('          route_root: server/api')
    print('          route_url_prefix: /api')
    print('          route_globs: ["server/api/**/*.ts"]')
    print('          test_globs: ["tests/**/*.test.ts"]')
    sys.exit(1)
if not test_globs:
    print("aidf: api.test_globs is not set in the manifest -- cannot locate tests.")
    sys.exit(1)


def expand(patterns):
    found = []
    for pattern in patterns:
        for path in glob.glob(os.path.join(root, pattern), recursive=True):
            if os.path.isfile(path):
                found.append(os.path.relpath(path, root))
    return sorted(set(found))


route_files = expand(route_globs)
test_files = expand(test_globs)

if not route_files:
    print("aidf: api.route_globs matched no files: %s" % ", ".join(route_globs))
    sys.exit(1)

# Restrict to the endpoints this change actually touched, when asked. A PR that
# adds one route should not be blocked by an endpoint that predates it.
changed = {p for p in (os.environ.get("CHANGED") or "").split("\n") if p.strip()}
if os.environ["CHANGED_ONLY"] == "1" and changed:
    route_files = [p for p in route_files if p in changed]
    if not route_files:
        print("aidf: no API route files changed -- nothing to check")
        sys.exit(0)

METHODS = ("get", "post", "put", "patch", "delete", "head", "options")

# Signals that a test speaks HTTP rather than calling a function directly.
# A project whose harness is not listed here extends the list via the manifest
# (`api.http_test_hints`) rather than by relaxing the rule.
REQUEST_HINTS = [
    "fetch(", "$fetch", "supertest", "request(", "app.inject", "testClient",
    "httpx", "TestClient", "client.get", "client.post", "requests.",
    "axios", "superagent", "createEvent", "http.request", "WebTestClient",
    "MockMvc", "RestAssured", "httptest.",
]
extra_hints = api.get("http_test_hints") or []
if isinstance(extra_hints, str):
    extra_hints = [extra_hints]
REQUEST_HINTS.extend(str(h) for h in extra_hints)
# `[id]`, `[...slug]`, `{id}`, `:id`, `<int:id>` -- all mean "wildcard here".
DYNAMIC = re.compile(r"^(?:\[(?:\.\.\.)?[^\]]+\]|\{[^}]+\}|<[^>]+>|:.+)$")


def route_of(path):
    """Derive (method, url) from a file path. Handles the common conventions:
    Nuxt/Nitro `index.get.ts`, Next `route.ts`, SvelteKit `+server.ts`,
    and plain `users.py`. Dynamic segments become `*`."""
    rel = path
    if route_root and rel.startswith(route_root + "/"):
        rel = rel[len(route_root) + 1:]

    stem = re.sub(r"\.[A-Za-z0-9]+$", "", rel)          # drop extension
    method = "ANY"
    for m in METHODS:
        if stem.lower().endswith("." + m):
            method = m.upper()
            stem = stem[: -(len(m) + 1)]
            break

    parts = []
    for seg in stem.split("/"):
        if seg in ("index", "route", "+server", "__init__"):
            continue
        match = DYNAMIC.match(seg)
        parts.append("*" if match else seg)

    url = url_prefix.rstrip("/") + "/" + "/".join(parts)
    return method, re.sub(r"/+", "/", url).rstrip("/") or "/"


def static_prefix(url):
    """The longest leading portion of the URL with no wildcard -- the substring
    a test is overwhelmingly likely to contain literally."""
    out = []
    for seg in url.strip("/").split("/"):
        if seg == "*":
            break
        out.append(seg)
    return "/" + "/".join(out)


bodies = {}
for path in test_files:
    try:
        with open(os.path.join(root, path), encoding="utf-8", errors="replace") as fh:
            bodies[path] = fh.read()
    except OSError:
        continue

waived = set()
for entry in waivers:
    waived.add(str(entry).strip().upper())

results, gaps, warnings = [], [], []

for path in route_files:
    method, url = route_of(path)
    needle = static_prefix(url)
    label = "%s %s" % (method, url)

    if label.upper() in waived or url.upper() in waived:
        results.append({"endpoint": label, "file": path, "status": "waived"})
        continue

    matches = []
    for test_path, body in bodies.items():
        if needle not in body:
            continue
        if method not in ("ANY", "GET"):
            # Method and path in the same file. Not proof, but a test that
            # names neither the path nor the verb is not testing this endpoint.
            # GET is exempt: it is the default verb, so `fetch(url)` with no
            # method named is a perfectly ordinary GET test.
            verb = method.lower()
            if not re.search(r"['\"]%s['\"]|\.%s\(|\b%s\b" % (verb, verb, method), body, re.I):
                continue
        matches.append(test_path)

    if not matches:
        gaps.append({"endpoint": label, "file": path, "needle": needle})
        results.append({"endpoint": label, "file": path, "status": "missing"})
        continue

    if not any(hint in bodies[m] for m in matches for hint in REQUEST_HINTS):
        warnings.append({"endpoint": label, "tests": matches})
        results.append({"endpoint": label, "file": path, "status": "no-http-signal",
                        "tests": matches})
        continue

    results.append({"endpoint": label, "file": path, "status": "covered",
                    "tests": matches})

# ------------------------------------------------------------------- report
covered = sum(1 for r in results if r["status"] == "covered")
waived_n = sum(1 for r in results if r["status"] == "waived")
print("aidf: %d endpoint%s · %d covered · %d named but not exercised over HTTP · "
      "%d unreferenced · %d waived"
      % (len(results), "" if len(results) == 1 else "s", covered,
         len(warnings), len(gaps), waived_n))

if warnings:
    print("\nFAIL  a test names these endpoints, but nothing in it makes an HTTP request.")
    print("      A unit test of the handler's helpers is not endpoint coverage --")
    print("      this is the exact loophole the check exists to close.")
    for w in warnings:
        print("  ~ %-32s %s" % (w["endpoint"], ", ".join(w["tests"])))
    print("\n      If your harness is simply not recognised, name it in the manifest:")
    print('        api:\n          http_test_hints: ["myTestClient("]')

if gaps:
    print("\nFAIL  no test references these endpoints:")
    for g in gaps:
        print("  - %-32s %s" % (g["endpoint"], g["file"]))
        print("      looked for %r in %d test file%s"
              % (g["needle"], len(bodies), "" if len(bodies) == 1 else "s"))
    print("\n      Add a test that goes through the real router and asserts the status")
    print("      code and specific values in the body, then the denied paths:")
    print("      unauthenticated, forbidden per object, cross-tenant, and not-found.")
    print("      See standards/testing.md. If a case genuinely does not apply, record")
    print("      it in the endpoint test matrix, or waive it in api.coverage_waivers")
    print("      with a reason.")

out = os.environ.get("JSON_OUT")
if out:
    with open(out, "w") as fh:
        json.dump({"endpoints": results, "gaps": gaps, "warnings": warnings}, fh, indent=2)
        fh.write("\n")
    print("\naidf: wrote %s" % out)

sys.exit(1 if (gaps or warnings) else 0)
PY
