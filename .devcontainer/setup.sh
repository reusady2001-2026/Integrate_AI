#!/usr/bin/env bash
# Bootstraps a Codespace with everything needed to run Open Design alongside
# Integrate_AI. Runs once on Codespace creation (postCreateCommand).
set -euo pipefail

echo "==> Node $(node --version), npm $(npm --version)"

echo "==> Installing pnpm 10.33.2 and Claude Code CLI..."
sudo npm install -g pnpm@10.33.2 @anthropic-ai/claude-code

echo "==> Cloning Open Design into /workspaces/open-design..."
if [ ! -d /workspaces/open-design ]; then
  git clone --depth 1 https://github.com/nexu-io/open-design.git /workspaces/open-design
else
  echo "    (already exists — skipping clone)"
fi

echo "==> Installing Open Design dependencies (this takes ~1 minute)..."
cd /workspaces/open-design
pnpm install

cat <<'EOF'

==========================================================================
  ✅ Setup complete.

  TO START OPEN DESIGN:
    1. Authenticate Claude Code (one-time):
         claude
       Follow the browser prompt to sign in. Then close it.

    2. Start the daemon + web layer:
         bash /workspaces/Integrate_AI/.devcontainer/start-od.sh

    3. Codespaces will open the forwarded URL for port 34091 in your
       browser automatically.

  TO STOP:   cd /workspaces/open-design && pnpm tools-dev stop
==========================================================================
EOF
