#!/bin/sh
# Serve the design mockup over HTTP.
#
# Usage:  sh serve.sh [port]
#
# Why this exists: the mockup loads its fixtures with fetch('./data/seed.json'),
# and a browser refuses that request under file:// -- the reviewer opens the page
# by double-clicking it, sees nothing, and reports that the prototype is broken.
# One command, no build step, no dependencies beyond python3.
#
# Wire it into the project manifest as `commands.mockup_serve` so the design
# handoff can name a command instead of a paragraph of instructions.

set -eu

PORT=${1:-5500}
DIR=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)

echo "mockup: http://127.0.0.1:$PORT/"
echo "mockup: throwaway prototype, fabricated data -- Ctrl-C to stop"

# `exec "$cmd $args"` would word-split a directory containing spaces, so each
# branch execs with its own argument list instead of building a command string.
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --directory "$DIR" --bind 127.0.0.1
elif command -v npx >/dev/null 2>&1; then
  exec npx --yes serve --listen "$PORT" "$DIR"
else
  echo "mockup: need python3 or npx to serve this folder" >&2
  exit 2
fi
