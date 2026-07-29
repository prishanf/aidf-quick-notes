#!/bin/bash
# Serve this mockup over HTTP (required for JS modules to work).
# Usage: ./serve.sh  or  bash serve.sh
# Then visit http://localhost:3333/docs/design/mockups/edit-note/

cd "$(dirname "$0")"
echo "Mockup at http://localhost:3333/docs/design/mockups/edit-note/"
python3 -m http.server 3333
