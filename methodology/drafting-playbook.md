# Drafting Playbook — source → filled draft

The repeatable, gated method the agent follows to turn a source document into a
tweak-ready draft. The pipeline (`pipeline/`, `scripts/draft.py`) automates the
mechanical steps; this playbook governs the **intelligent** steps. The agent
stays in the loop — it does not auto-generate analysis unsupervised.

## Inputs
- A source: filing (TASE/Maya, SEC), annual report, or a written company description.
- The target artifact (one of `templates/`).

## Steps

### 0. Extract (mechanical)
`python scripts/draft.py extract <source>` → text. For large filings, pull the
sections that matter (business description, segments, financial statements).

### 1. Classify the organization
Use `organization-types.md`: legal/ownership form + industry (GICS/NAICS/ISIC).
For holdings, work two layers (portfolio vs. operating). The class gates
governance, disclosure, the objective function, and which roles exist.

### 2. Extract grounded data + flag gaps
Pull the real figures the artifact needs (identity, segments, financials,
challenges). Record each with its source. **Anything not in the source stays
`[להשלמה / TO FILL]` — never invent.**

### 3. Select frameworks
Use `strategy-frameworks.md` to pick 2–4 lenses fitting the question (competitive
/ growth / turnaround / mission). For structure/roles/KPIs, use
`org-structures.md`, `job-architecture.md`, `kpi-and-process.md`.

### 4. Scaffold the draft (mechanical)
`python scripts/draft.py new <artifact> --slug <company>` → a working copy in
`work/<company>/` (gitignored; treat as confidential).

### 5. Fill — grounded vs. proposed
- **Part A / facts** (current situation, identity, portfolio, financials): fill
  directly from the source; mark gaps.
- **Part B / analysis** (thesis, trade-offs, growth engines): draft as **proposals
  to validate**, clearly labeled — grounded in the source's facts, not asserted.

### 6. Competitive benchmarking
Run `competitive-benchmarking.md`: named, same-class peers, every figure sourced
and confidence-tagged; unresearched cells stay `[להשלמה / TO FILL]`.

### 7. Render (mechanical)
`python scripts/draft.py render work/<company>/<artifact>.md` → RTL Hebrew `.docx`.

### 8. Deliver
Hand the draft to the human to tweak. Do **not** commit `work/` (confidential).

## Voice (the document is the deliverable, not a demo)
Filled drafts read as **official corporate documents**, not presentations or
teaching material:
- **Preserve the template structure.** A DRAFT *fills* the approved template
  in `templates/<artifact>/` — same sections, same sub-blocks, same field order,
  same scorecard/table shapes. Do not add, reorder, or regroup sections
  (no extra sub-headers like "Financial / Customer / Internal Process /
  Learning & Growth" inside `2. הגדרות מדדים` — keep the KPIs as a flat list
  of blocks, exactly as the template defines).
- **What changes between template and draft:** "מה למלא" guidance lines and
  `«FILL»` underscore lines disappear (the fields are filled); the *skeleton*
  stays identical.
- **No methodology notes inside the document.** The framework choice (BSC,
  Theory of Change, etc.) informs the structure but is not announced in the body.
- **No comparisons to other companies, industries, or templates** unless the
  user explicitly asks for one. A KPI document for company X is about company X.
- **No "pay attention to…", "note that…", "the point here is…"** — official
  register, not narration.
- **No "(draft/demo)" labels in the title.** Drafts may be marked once in a
  header/classification line; the body reads as the finished thing.
- Test: a recipient should not be able to tell the document was AI-generated.

## Language (default)
Filled drafts are **Hebrew-primary** in the body. English appears only as
bilingual labels and preserved technical terms (NOI, FFO, IFRS, FDA, BSC, etc.).
Switch to English-primary only on explicit request.

## Gates (do not skip)
- Surfaced assumptions before drafting? 
- Every claim sourced or marked `[להשלמה / TO FILL]`?
- Competitors real, same-class, sourced — none invented?
- Facts vs. proposals vs. inference clearly separated?
- Confidential drafts kept out of git?

## Boundaries
- **Always:** ground in source; mark gaps; benchmark only same-class peers; keep
  Hebrew/RTL correct; treat company data as confidential.
- **Never:** invent figures/competitors/ratings; present proposals as facts;
  commit `work/`.
