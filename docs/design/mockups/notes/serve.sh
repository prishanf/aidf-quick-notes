#!/bin/sh
# Serve the shared notes design mockup over HTTP.
#
# Why this exists: the mockup loads fixtures with fetch('./data/seed.json'),
# which fails under file://. Always serve over HTTP.
#
# Usage: npm run mockup:serve   OR   sh docs/design/mockups/notes/serve.sh [port]

set -eu
HERE=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
PORT=${1:-3333}

echo "mockup: http://127.0.0.1:$PORT/"
echo "mockup: shared notes prototype (create/list/edit/delete) — Ctrl-C to stop"

cd "$HERE"
if command -v python3 >/dev/null 2>&1; then
  exec python3 -m http.server "$PORT" --bind 127.0.0.1
fi
if command -v npx >/dev/null 2>&1; then
  exec npx --yes serve -l "tcp://127.0.0.1:$PORT" .
fi
echo "mockup: need python3 or npx to serve this folder" >&2
exit 1
