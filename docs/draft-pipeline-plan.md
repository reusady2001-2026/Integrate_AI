# Implementation Plan: Draft Pipeline + Benchmarking

## Overview
Build a tested `pipeline/` package + `scripts/draft.py` CLI for the mechanical
filing→draft steps, plus two methodology docs (benchmarking rubric + drafting
playbook). Built TDD-first, in thin vertical slices, committing each.

## Architecture decisions
- **Stdlib-first, thin side effects.** Pure functions (slugify, artifact discovery,
  comment-stripping) are unit-tested; subprocess/fs wrappers stay minimal.
- **Reuse the render path** (`make_rtl_reference.py` + `rtl_postprocess.py`) — do
  not reimplement RTL logic.
- **Agent-in-the-loop.** The pipeline scaffolds + renders; the playbook governs how
  the agent fills content. No prose auto-generation.

## Dependency graph
```
scaffold.slugify ─┐
scaffold.artifacts/template_for ─�> scaffold.scaffold_draft ─┐
extract.extract_text ──────────────────────────────────────┼─> scripts/draft.py (CLI)
render.render (wraps existing) ─────────────────────────────┘
methodology docs (independent)
```

## Task list

### Phase 1: Foundation (pipeline package)
- [ ] **Task 1 (XS):** `pipeline/__init__.py` + `scaffold.slugify()`. *Accept:* slugifies names (spaces→-, lowercase, strip unsafe). *Verify:* `pytest tests/test_scaffold.py`.
- [ ] **Task 2 (S):** `scaffold.available_artifacts()` + `template_for(artifact)` reading `templates/*/*.md`. *Accept:* returns the six artifacts; resolves a template path; errors on unknown. *Verify:* unit tests.
- [ ] **Task 3 (M):** `scaffold.scaffold_draft(artifact, dest_dir)` — copy template md into `work/<dest>`, strip the leading `<!-- ... -->` meta block. *Accept:* file created, comment header removed, body intact. *Verify:* unit test on a temp dir.
- [ ] **Task 4 (M):** `extract.extract_text(path)` for `.txt`/`.docx`/`.pdf`. *Accept:* returns text; clear error on unsupported. *Verify:* txt + generated-docx tests; pdf `skipif`.

### Checkpoint: Foundation
- [ ] `python -m pytest -q` green; no network needed.

### Phase 2: Render + CLI
- [ ] **Task 5 (M):** `pipeline/render.py render(md, out)` wrapping pandoc + `rtl_postprocess`; ensure reference doc built. *Accept:* produces RTL docx (sectPr bidi). *Verify:* `skipif` pandoc — assert bidi present.
- [ ] **Task 6 (S):** `scripts/draft.py` CLI (`extract` / `artifacts` / `new` / `render`). *Accept:* each subcommand runs. *Verify:* smoke test invoking the module.

### Checkpoint: Core
- [ ] `draft new strategy-document --slug demo` → `work/demo/strategy-document.md`; `draft render` → docx.

### Phase 3: Methodology + wiring
- [ ] **Task 7 (S):** `methodology/competitive-benchmarking.md` — reliability rubric + process (authoritative sources only, named peers, no invention, confidence tags).
- [ ] **Task 8 (S):** `methodology/drafting-playbook.md` — gated method: classify org → extract grounded data → select frameworks → fill template → benchmark → mark gaps → render.
- [ ] **Task 9 (XS):** `requirements.txt`, `.gitignore` (`work/`), CLAUDE.md repo map + roadmap + methodology README links.

### Checkpoint: Complete
- [ ] All success criteria in the spec met; tests green; docs linked.

### Phase 4: Validation (agent-run, optional follow-up)
- [ ] **Task 10:** breadth proof — scaffold + partially fill a draft for a different org type (e.g., nonprofit) to confirm the playbook generalizes.

## Risks & mitigations
| Risk | Impact | Mitigation |
|---|---|---|
| pandoc/poppler absent in a fresh container | Med | `skipif` in tests; document system deps; CLI errors clearly |
| python-docx not installed | Med | add to `requirements.txt`; render/extract guard imports |
| Over-engineering the package | Low | Rule 0 simplicity; stdlib-first; no abstractions until 3rd use |
| Confidential drafts committed | High | `work/` gitignored; never commit `work/` |

## Open questions
- None blocking. Playbook = methodology doc (decided in spec).
