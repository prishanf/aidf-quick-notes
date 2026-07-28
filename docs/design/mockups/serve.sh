#!/bin/sh
# Serves design mockups over HTTP. Opening HTML via file:// cannot fetch fixtures.
# Feature 1 design will populate docs/design/mockups/; until then this is a stub.
set -eu
ROOT=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$ROOT"
if [ ! -f index.html ]; then
  echo "aidf-quick-notes: no mockup screens yet under $ROOT"
  echo "After Feature 1 design, run: npm run mockup:serve"
  exit 0
fi
if [ -x ./serve.sh ] && [ "$(basename "$0")" != "serve.sh" ]; then
  exec ./serve.sh "$@"
fi
PORT=${PORT:-4173}
echo "Serving mockups at http://127.0.0.1:$PORT (ctrl-c to stop)"
exec python3 -m http.server "$PORT"
