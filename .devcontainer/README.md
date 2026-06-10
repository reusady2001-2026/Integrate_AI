# Integrate_AI + Open Design — Codespace

Running Open Design in a GitHub Codespace gives you a browser-accessible web UI
without anything to install locally. The Codespace's port forwarder handles
network reachability automatically.

## Quick start

1. On GitHub, open this repo → **Code ▸ Codespaces ▸ Create codespace on `claude/quirky-ride-F1w8A`** (or main).
2. Wait ~2 minutes for the postCreate script (`setup.sh`) to finish — it
   installs pnpm, the Claude Code CLI, clones Open Design, and runs `pnpm install`.
3. In the Codespace terminal, authenticate Claude Code once:
   ```bash
   claude
   ```
   Follow the browser sign-in. Once you see the Claude prompt, you can close it.
4. Start Open Design:
   ```bash
   bash /workspaces/Integrate_AI/.devcontainer/start-od.sh
   ```
5. Codespaces auto-opens the forwarded URL for port **34091** in your browser.
   That's the Open Design web UI.

## What gets installed
- Node.js 24 (via the devcontainer image).
- pnpm 10.33.2.
- `@anthropic-ai/claude-code` (the `claude` CLI Open Design uses as its agent runtime).
- Open Design itself, cloned at `/workspaces/open-design`.

## Why a Codespace
Open Design is a local-first app — daemon + Next.js web + an agent CLI running
locally. In a Codespace this all runs on the Codespace host, and the
`forwardPorts` setting tunnels port 34091 (web) and 38353 (daemon API) to your
browser through GitHub's secure proxy. No `ngrok`, no manual SSH, no exposing
anything to the public internet.

## Stopping
```bash
cd /workspaces/open-design
pnpm tools-dev stop
```
Or just close the Codespace — it'll suspend after 30 minutes of inactivity by
default.
