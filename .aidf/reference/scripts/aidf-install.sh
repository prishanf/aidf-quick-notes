#!/bin/sh
# Install or upgrade AIDF inside a project, as a single vendored directory.
#
# Usage:
#   reference/scripts/aidf-install.sh --target /path/to/project [options]
#
#   --target DIR     the project to install into (required)
#   --root NAME      vendored directory name (default: .aidf)
#   --upgrade        refresh the vendored tree only; touch nothing project-owned
#   --force          overwrite project-owned files on a fresh install
#   --dry-run        print what would happen and change nothing
#
# Exit:  0 done · 1 refused · 2 could not run
#
# Why this exists: cloning the framework into a project leaves `commands/`,
# `guide/`, `reference/`, `schemas/`, `standards/`, `templates/` and `adapters/`
# sitting in the project root next to `app/`, `server/`, and `docs/`, with
# nothing marking which is which. Seven framework directories interleaved with
# the project's own is not a filing problem, it is a comprehension problem --
# for the humans reading the repository and for the agents deciding what is
# theirs to edit.
#
# After this script, a project has exactly one framework directory, and the
# mental model is: `.aidf/` is framework INPUT, `docs/` is project OUTPUT.

set -eu

HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
SOURCE=$(CDPATH= cd -- "$HERE/../.." && pwd)

TARGET=""
ROOT=".aidf"
UPGRADE=0
FORCE=0
DRY=0

while [ $# -gt 0 ]; do
  case "$1" in
    --target)   TARGET=$2; shift 2 ;;
    --root)     ROOT=$2; shift 2 ;;
    --upgrade)  UPGRADE=1; shift ;;
    --force)    FORCE=1; shift ;;
    --dry-run)  DRY=1; shift ;;
    -h|--help)  sed -n '2,15p' "$0"; exit 0 ;;
    *) echo "aidf: unknown option $1" >&2; exit 2 ;;
  esac
done

[ -n "$TARGET" ] || { echo "aidf: --target is required" >&2; exit 2; }
command -v python3 >/dev/null 2>&1 || { echo "aidf: python3 is required" >&2; exit 2; }
[ -f "$SOURCE/VERSION" ] || { echo "aidf: $SOURCE does not look like the AIDF repository" >&2; exit 2; }
[ -d "$TARGET" ] || { echo "aidf: target does not exist: $TARGET" >&2; exit 2; }

SOURCE="$SOURCE" TARGET="$TARGET" ROOT="$ROOT" UPGRADE="$UPGRADE" FORCE="$FORCE" \
DRY="$DRY" python3 - <<'PY'
import os, shutil, sys

source = os.environ["SOURCE"]
target = os.path.abspath(os.environ["TARGET"])
root = os.environ["ROOT"].strip("/")
upgrade = os.environ["UPGRADE"] == "1"
force = os.environ["FORCE"] == "1"
dry = os.environ["DRY"] == "1"

if os.path.abspath(source) == target:
    print("aidf: refusing to install the framework into itself")
    sys.exit(1)

version = open(os.path.join(source, "VERSION")).read().strip()
vendor = os.path.join(target, root)

# What a PROJECT needs at runtime. Everything else in the framework repository
# is for people learning or developing the framework, and only adds noise to a
# project: diagrams/, examples/, presentation-deck/, CHANGELOG, CONTRIBUTING.
#
# This set is closed under linking: no file inside it links out to anything
# excluded, so every relative link keeps resolving once vendored. Adding a
# cross-directory link from a vendored file to an excluded one breaks that --
# check-consistency.sh catches it.
VENDOR = ["commands", "standards", "templates", "schemas", "guide", "reference", "adapters"]

actions, skipped = [], []


def note(verb, path):
    actions.append("%-8s %s" % (verb, os.path.relpath(path, target)))


def copy_tree(src, dst):
    if dry:
        return
    if os.path.isdir(dst):
        shutil.rmtree(dst)
    shutil.copytree(src, dst, ignore=shutil.ignore_patterns(
        ".DS_Store", "__pycache__", "*.pyc", "node_modules"))


def write(path, body, project_owned=True):
    """Project-owned files are never silently overwritten: they are the ones a
    project edits. Clobbering a filled-in project.yaml on upgrade would be the
    single most destructive thing this script could do."""
    if os.path.exists(path) and project_owned and not force:
        skipped.append(os.path.relpath(path, target))
        return
    note("write", path)
    if dry:
        return
    os.makedirs(os.path.dirname(path), exist_ok=True)
    with open(path, "w") as fh:
        fh.write(body)


def relink(body):
    """Rewrite a framework document's relative links so they resolve from the
    project root into the vendored directory."""
    out = body
    for name in VENDOR:
        out = out.replace("](%s/" % name, "](%s/%s/" % (root, name))
    out = out.replace("](README.md)", "](%s/README.md)" % root)
    return out


# ------------------------------------------------------------------ vendor
previous = None
version_file = os.path.join(vendor, "VERSION")
if os.path.exists(version_file):
    previous = open(version_file).read().strip()

for name in VENDOR:
    src = os.path.join(source, name)
    if not os.path.isdir(src):
        continue
    note("vendor", os.path.join(vendor, name))
    copy_tree(src, os.path.join(vendor, name))

if not dry:
    os.makedirs(vendor, exist_ok=True)
    with open(version_file, "w") as fh:
        fh.write(version + "\n")
note("write", version_file)

# The vendored directory gets its own README, because the first question anyone
# asks on finding it is "may I edit this?"
write(os.path.join(vendor, "README.md"), """# AIDF %s (vendored)

**Do not edit anything in this directory.** It is a verbatim copy of the
[AI Development Framework](https://github.com/prishanf/ai-development-framework)
at version `%s`, installed by `aidf-install.sh`. Local edits are silently
discarded on the next upgrade.

## The split this directory exists to make

| | |
|---|---|
| `%s/` | Framework **input**: the contracts, standards, and templates agents read |
| `docs/` | Project **output**: the specs, plans, designs, and records agents write |
| `project.yaml` | Where this project configures the framework |
| `AGENTS.md` | Where agents start |

Everything else in the repository root is the project's own code.

## What is here

| Path | Purpose |
|---|---|
| `guide/` | Read first: overview, tracks, workflow, roles, documents, decisions, commands |
| `standards/` | Configure once: gates, evidence, testing, UI, database, API, security |
| `commands/` | The agent prompt contracts |
| `templates/` | Copy-ready documents, each tagged with the track that needs it |
| `schemas/` | Machine-readable contracts for the manifest and evidence |
| `reference/` | Working CI workflows, gate scripts, and the design-mockup scaffold |
| `adapters/` | How to wire the contracts onto another agent surface |

Not vendored, because a project does not need them: `diagrams/`, `examples/`,
and the framework's own changelog. Read those in the framework repository.

## Upgrading

```bash
sh %s/reference/scripts/aidf-install.sh --target . --upgrade
```

This replaces the vendored tree and `%s/VERSION`, and touches nothing the
project owns -- not `project.yaml`, not `AGENTS.md`, not `.github/`. Read the
framework's CHANGELOG for what changed before you do it, then re-run the gates.

## Version

`%s` -- also recorded as `framework.version` in `project.yaml`. If the two
disagree, the gates will say so.
""" % (version, version, root, root, root, version), project_owned=False)

# ------------------------------------------------- project-owned scaffolding
if not upgrade:
    # AGENTS.md: the adapter-neutral entry point every surface reads.
    agents = relink(open(os.path.join(source, "AGENTS.md")).read())
    agents = agents.replace(
        "This repository follows the",
        "This project follows the")
    agents += """
## Where things live

- `%s/` — the vendored framework. Read-only; upgrade it, do not edit it.
- `docs/` — this project's specs, plans, designs, decisions, and records.
- `project.yaml` — this project's manifest: commands, branches, gates, paths.

Framework paths in this file resolve into `%s/`. Everything else in the
repository root belongs to the project.
""" % (root, root)
    write(os.path.join(target, "AGENTS.md"), agents)

    # The manifest, with framework.root pre-set to wherever we just installed.
    manifest = open(os.path.join(source, "templates", "project.yaml")).read()
    manifest = manifest.replace("  root: .aidf", "  root: %s" % root)
    manifest = manifest.replace(
        "# Validated by reference/scripts/validate-manifest.sh",
        "# Validated by %s/reference/scripts/validate-manifest.sh" % root)
    write(os.path.join(target, "project.yaml"), manifest)

    # A changelog for the project itself, distinct from the framework's own.
    # Track B/C changes are required to add an entry here -- enforced by
    # check-changelog.sh -- so the record exists from the first commit.
    write(os.path.join(target, "CHANGELOG.md"), """# Changelog

All notable changes to this project are recorded here, most recent first.
Track B/C changes are required to add an entry under `[Unreleased]`; Track A
is optional. See `%s/standards/quality-gates.md`.

## [Unreleased]
""" % root)

    # CI and repository controls belong at the project root, not in .aidf.
    for rel, dest in [
        ("reference/github/workflows/aidf-gates.yml", ".github/workflows/aidf-gates.yml"),
        ("reference/github/workflows/aidf-selfcheck.yml", ".github/workflows/aidf-selfcheck.yml"),
        ("reference/github/PULL_REQUEST_TEMPLATE.md", ".github/PULL_REQUEST_TEMPLATE.md"),
        ("reference/github/CODEOWNERS", ".github/CODEOWNERS"),
    ]:
        src = os.path.join(source, rel)
        if not os.path.exists(src):
            continue
        body = open(src).read()
        # Workflows call the scripts, which now live under the vendored root.
        body = body.replace("reference/scripts/", "%s/reference/scripts/" % root)
        write(os.path.join(target, dest), body)

    # Claude Code: one file per contract turns each into a slash command.
    # This is the adapter wiring adapters/README.md describes -- done here so a
    # project gets a working surface instead of a promise of one.
    commands_dir = os.path.join(source, "commands")
    if os.path.isdir(commands_dir):
        for name in sorted(os.listdir(commands_dir)):
            if not name.endswith(".md"):
                continue
            slug = name[:-3]
            write(os.path.join(target, ".claude", "commands", name),
                  "Follow the contract in `%s/commands/%s` exactly as written.\n"
                  % (root, name))
        write(os.path.join(target, ".claude", "CLAUDE.md"),
              "# Claude adapter\n\n"
              "Follow the adapter-neutral rules in [AGENTS.md](../AGENTS.md).\n\n"
              "The command contracts live in [%s/commands/](../%s/commands/) and are\n"
              "exposed as slash commands by the files in `.claude/commands/`. Read the\n"
              "contract matching the role you are performing and follow it as written.\n\n"
              "`%s/` is the vendored framework: read it, never edit it.\n"
              "Do not add Claude-specific lifecycle rules here.\n" % (root, root, root))

    write(os.path.join(target, ".codex", "AGENTS.md"),
          "# Codex adapter\n\n"
          "Follow the adapter-neutral rules in [AGENTS.md](../AGENTS.md). The command\n"
          "contracts live in [%s/commands/](../%s/commands/); reference the one matching\n"
          "your role by path in the task prompt.\n\n"
          "`%s/` is the vendored framework: read it, never edit it.\n" % (root, root, root))

    write(os.path.join(target, ".cursor", "rules", "aidf.mdc"),
          "---\ndescription: AI Development Framework adapter rules\nalwaysApply: true\n---\n\n"
          "Follow the adapter-neutral rules in `AGENTS.md`.\n\n"
          "Read the matching prompt contract in `%s/commands/` before acting in that\n"
          "role. `%s/` is the vendored framework: read it, never edit it.\n\n"
          "Preserve human gates. Report evidence, and never assert a check result a\n"
          "runner did not produce.\n" % (root, root))

    # Mark the vendored tree so GitHub collapses its diffs and excludes it from
    # language statistics. Small thing; it is why a 400-line PR still reads as
    # 400 lines after an upgrade.
    attrs = os.path.join(target, ".gitattributes")
    line = "%s/** linguist-vendored\n" % root
    existing = open(attrs).read() if os.path.exists(attrs) else ""
    if line not in existing:
        note("append", attrs)
        if not dry:
            with open(attrs, "a") as fh:
                if existing and not existing.endswith("\n"):
                    fh.write("\n")
                fh.write(line)

    # The document tree the manifest points at. Empty directories do not survive
    # git, so each gets a .gitkeep.
    for sub in ("specs", "plans", "architecture", "decisions", "design",
                "design/mockups", "releases", "reviews", "pull-requests",
                "migrations", "api", "mcp", "deployments", "qa", "wiki", "evidence"):
        keep = os.path.join(target, "docs", sub, ".gitkeep")
        if not os.path.exists(keep):
            note("mkdir", os.path.dirname(keep))
            if not dry:
                os.makedirs(os.path.dirname(keep), exist_ok=True)
                open(keep, "w").close()

# ------------------------------------------------------------------ report
mode = "upgrade" if upgrade else "install"
print("aidf: %s%s -- %s %s" % (mode, " (dry run)" if dry else "",
                               "AIDF", version))
if previous and previous != version:
    print("aidf: vendored tree %s -> %s" % (previous, version))
elif previous:
    print("aidf: vendored tree already at %s (refreshed)" % version)

for line in actions:
    print("  " + line)

if skipped:
    print("\naidf: left alone (project-owned, already present):")
    for path in skipped:
        print("  - %s" % path)
    print("  Re-run with --force to overwrite them.")

if not upgrade:
    print("""
Next, in this order:

  1. Fill in project.yaml -- commands, branches, and the ui/api blocks.
     An empty required command is a FAILING gate, not a skip.
       sh %s/reference/scripts/validate-manifest.sh project.yaml

  2. Create the integration branch, if you are using the GitFlow default:
       git switch -c develop && git push -u origin develop

  3. In repository settings: protect main and develop, require passing checks,
     and require Code Owner review. Until you do, every gate is advisory --
     see %s/reference/README.md.

  4. Read %s/guide/01-overview.md, then %s/guide/02-tracks.md.

Commit the vendored directory. Pinning the framework in the repository is what
makes a checkout reproducible and an upgrade a reviewable diff.""" % (root, root, root, root))
else:
    print("""
Now re-run the gates and read the framework's CHANGELOG for breaking changes:
  sh %s/reference/scripts/validate-manifest.sh project.yaml
  sh %s/reference/scripts/run-gates.sh --track B""" % (root, root))
PY
