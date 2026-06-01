#!/usr/bin/env bash
# Start the Open Design daemon + web layer. Run this once Claude Code is
# authenticated (`claude` to sign in).
set -euo pipefail

cd /workspaces/open-design
pnpm tools-dev start daemon
pnpm tools-dev start web

echo
echo "Open Design is running. Codespaces should open the web URL for port"
echo "34091 in your browser automatically (look for the Ports tab at the"
echo "bottom of VS Code if it doesn't pop up)."
