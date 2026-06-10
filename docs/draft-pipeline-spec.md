# Spec: Draft Pipeline + Competitive Benchmarking

## Objective
Make the agent reliably turn a **source document** (TASE/SEC filing, annual report,
or a written company description) into a **scaffolded, renderable, client-ready
DRAFT** of any artifact in `templates/` — repeatably, with the mechanical work
automated — and add a **competitive-benchmarking** capability that produces real,
**named-peer** comparisons grounded only in authoritative sources (never invented).

Who it's for: the operator (you) running restructuring engagements; downstream,
the position-holders who receive tweak-ready drafts.

Success = the manual toil (extract → scaffold → render) is a tested command, the
agent follows one **playbook** to fill drafts consistently across org types, and
benchmarking has a **reliability rubric** that refuses unsourced claims.

## Scope (in)
- A small Python package `pipeline/` for the mechanical steps, with unit tests.
- A CLI `scripts/draft.py` wrapping it.
- `methodology/competitive-benchmarking.md` — reliability rubric + process.
- `methodology/drafting-playbook.md` — the gated agent method tying it together.
- Wiring: `requirements.txt`, `.gitignore` (`work/`), CLAUDE.md repo map + roadmap.

## Scope (out — "Not Doing")
- Fully autonomous filling of prose — the **agent stays in the loop**; the pipeline
  scaffolds and renders, it does not write the analysis.
- Live market-data feeds / paid data APIs.
- A web UI or service. CLI + playbook only.

## Tech stack
- Python 3 (stdlib-first), `python-docx` for `.docx` read/RTL post-process.
- System deps (already used by `scripts/`): `pandoc`, `poppler-utils` (`pdftotext`).
- Tests: `pytest`.

## Commands
- Test: `python -m pytest -q`
- Extract: `python scripts/draft.py extract <file>`
- List artifacts: `python scripts/draft.py artifacts`
- Scaffold a draft: `python scripts/draft.py new <artifact> --slug <slug>`
- Render to Word: `python scripts/draft.py render <draft.md>`

## Project structure
```
pipeline/            → package (extract, scaffold, render)
  __init__.py  extract.py  scaffold.py  render.py
scripts/draft.py     → CLI entry point
tests/               → pytest unit tests
work/                → scaffolded working drafts (gitignored; may be confidential)
methodology/         → + competitive-benchmarking.md, drafting-playbook.md
```

## Code style
- Simplest thing that works (no premature abstraction). Type hints on public funcs.
- Pure functions where possible; side effects (fs, subprocess) isolated and thin.
- Reuse existing `scripts/make_rtl_reference.py` + `scripts/rtl_postprocess.py`.

## Testing strategy
- Test pyramid: mostly **small** unit tests (slugify, artifact discovery, template
  resolution, draft scaffolding, token/RTL post-process on a synthetic docx).
- `extract_text`: txt + a generated docx fixture (small); pdf test `skipif` poppler
  missing. Render test `skipif` pandoc missing (medium).
- State-based assertions (outputs, file contents), not internal calls.

## Boundaries
- **Always:** write a failing test first; ground claims in source; mark gaps `[להשלמה / TO FILL]`; keep the repo building/tests green between increments.
- **Ask first:** adding heavy dependencies; creating auto-activated skills under `.claude/skills/`.
- **Never:** invent competitors/figures/ratings; commit confidential drafts (`work/` is gitignored).

## Success criteria
- [ ] `python -m pytest -q` passes.
- [ ] `draft artifacts` lists the six templates.
- [ ] `draft new strategy-document --slug demo` creates `work/demo/strategy-document.md`.
- [ ] `draft render <md>` produces a true-RTL `.docx`.
- [ ] `draft extract` returns text for `.txt`/`.docx` (and `.pdf` when poppler present).
- [ ] `competitive-benchmarking.md` + `drafting-playbook.md` exist and are linked from CLAUDE.md.

## Open questions
- Auto-activated skill vs. methodology doc for the playbook → **decided: methodology doc** (consistent with repo pattern, no context bloat, no untrusted-code concern).
