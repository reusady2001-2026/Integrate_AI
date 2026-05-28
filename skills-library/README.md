# skills-library

Vendored agent-skill collections from two upstream repos. These live **outside**
`.claude/skills/`, so they are **not auto-activated**. They are a reference
library you opt into per task.

## Sources
- `anthropics-skills/` — from https://github.com/anthropics/skills (Anthropic official examples). See `THIRD_PARTY_NOTICES.md`.
- `addyosmani-agent-skills/` — from https://github.com/addyosmani/agent-skills. See `LICENSE`.

## Activation protocol (for Claude)
When the user asks to use a skill from this library:
1. Resolve which folder it lives in. If a requested capability exists in **both**
   `anthropics-skills/` and `addyosmani-agent-skills/` (by identical name or by
   overlapping purpose), **do not pick automatically**. Ask the user which one to
   use and explain the practical difference in what each will do.
2. To use a chosen skill, read its `SKILL.md` and follow it directly (these are
   not registered slash-commands; load the file manually).

## Overlapping capabilities (ask before choosing)
There are no identical folder names across the two sets, but these pairs cover
similar ground — confirm which the user wants:

| Capability | anthropics-skills | addyosmani-agent-skills |
|---|---|---|
| Frontend/UI building | `frontend-design`, `web-artifacts-builder` | `frontend-ui-engineering` |
| Browser/web app testing | `webapp-testing` (Playwright) | `browser-testing-with-devtools` (Chrome DevTools MCP) |
| Code review | (session skill `code-review`) | `code-review-and-quality` |
| Code simplification | (session skill `simplify`) | `code-simplification` |
| Claude API | `claude-api` (also a session skill) | — |

> Note: the active session already ships skills named `claude-api`, `code-review`,
> `verify`, `run`, `init`, etc. When a library skill overlaps with one of those,
> flag the overlap to the user too.

## Contents

### anthropics-skills (17)
algorithmic-art, brand-guidelines, canvas-design, claude-api, doc-coauthoring,
docx, frontend-design, internal-comms, mcp-builder, pdf, pptx, skill-creator,
slack-gif-creator, theme-factory, web-artifacts-builder, webapp-testing, xlsx

### addyosmani-agent-skills (23)
api-and-interface-design, browser-testing-with-devtools, ci-cd-and-automation,
code-review-and-quality, code-simplification, context-engineering,
debugging-and-error-recovery, deprecation-and-migration, documentation-and-adrs,
doubt-driven-development, frontend-ui-engineering, git-workflow-and-versioning,
idea-refine, incremental-implementation, interview-me, performance-optimization,
planning-and-task-breakdown, security-and-hardening, shipping-and-launch,
source-driven-development, spec-driven-development, test-driven-development,
using-agent-skills
