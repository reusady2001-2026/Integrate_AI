# Implementation Plan — Integrate_AI Web App

## Overview
A minimal Next.js app that wraps our six template families with a Hebrew-RTL,
form-driven UI, live preview, in-place editing, and Word/PDF export. Design
language vendored from `nexu-io/open-design` (Apache-2.0). Built in vertical
slices: every slice leaves the system shippable for one artifact end-to-end
before the next is added.

See [`app-design.md`](app-design.md) for the design spec.

## Architecture decisions
- **Next.js 14 (App Router) + TypeScript** — same family as OD, sane for a
  small full-stack app, deploys later to Vercel/Codespaces without rework.
- **Tailwind CSS + Radix UI primitives** — accessible, RTL-friendly, zero
  bespoke component library to maintain.
- **Zustand for client state** — form values + active design system + active
  template. Small, no boilerplate.
- **Zod schemas per artifact** — single source of truth for form fields,
  validation, and the data the template consumes.
- **Templates as TSX components** parametrized by Zod-validated data. No MDX
  for v1 — keep the toolchain small.
- **`docx` npm library for Word export** (better Word fidelity than
  html-docx-js; we can drive it from the data + template structure, reusing
  the bidi rules from `scripts/rtl_postprocess.py`).
- **Local dev only** — `pnpm dev`, no deployment in this PR.
- **In the `app/` folder** of the existing repo, alongside `pipeline/`,
  `templates/`, `methodology/`. Single repo, single PR.

## Dependency graph

```
Foundation
├── Next.js scaffold + Tailwind + Radix
├── Hebrew fonts (David, Heebo, Frank Ruhl Libre)
├── RTL base (lang="he" dir="rtl") + bidi utility
├── Design-token system (CSS vars scoped to preview panel)
└── Vendored design-systems/ (5 from OD) + NOTICE

KPI vertical slice (proves the architecture)
├── Zod schema for KPI scorecard
├── KPIScorecardTemplate.tsx (one-to-one with templates/kpis/)
├── Form panel (auto-rendered from schema)
├── Preview panel (renders the template with the form data)
└── Word export server route → uses `docx` lib + rtl rules

Editing layer
├── Shared form↔preview state (Zustand)
├── contenteditable wiring in the preview
├── Selection toolbar (bold/italic minimal)
└── Duplicate/remove block affordance (+/-)

Design-system layer
├── tokens.css loader per active system
├── Header switcher (5 systems)
└── Snapshot tests that the preview re-skins correctly

Remaining artifacts (each is a TSX template + Zod schema)
├── Strategy document
├── Job description
├── Strategy deck
├── Org structure
└── Workflow / SOP
```

Implementation order follows that graph bottom-up: build foundation, then one
end-to-end vertical slice, then layer editing + design-systems on top, then
clone the slice for the other five artifacts.

## Task list

### Phase 1 — Foundation
- [ ] **Task 1 (M):** `app/` Next.js 14 scaffold (App Router, TypeScript, Tailwind, Radix, Zustand, Zod, `docx`). Basic page rendering "שלום" in RTL. *Verify:* `pnpm dev` boots; `<html lang="he" dir="rtl">` in DOM.
- [ ] **Task 2 (S):** Hebrew font pipeline — David + Heebo + Frank Ruhl Libre via `next/font/google`; tabular figures variant. *Verify:* a test paragraph in each font in `/test/fonts`.
- [ ] **Task 3 (M):** Vendor 5 design systems from OD into `app/design-systems/`; `app/NOTICE` records Apache-2.0 + attribution. Each system exposes its `tokens.css`. *Verify:* a `<style>`-scoped wrapper applies the tokens to a sample card without leaking to the app chrome.
- [ ] **Task 4 (S):** App shell — header (artifact name · system picker · export), two-pane layout (form left, preview right), RTL-flipped. *Verify:* visual check; resize behavior.

### Checkpoint: Foundation
- [ ] `pnpm dev` boots without errors.
- [ ] RTL flow correct in shell + sample preview.
- [ ] Design tokens swap when the picker changes (preview only; chrome stays).

### Phase 2 — First artifact end-to-end (KPI scorecard)
- [ ] **Task 5 (M):** `app/lib/schemas/kpis.ts` — Zod schema for the KPI scorecard exactly mirroring `templates/kpis/kpi-template.md`: header fields (company / level / date / classification), framework block (logic / cadence), an array of KPI blocks (nine fields), scorecard rows, governance. *Verify:* unit tests for valid/invalid data.
- [ ] **Task 6 (M):** `app/templates/kpis/Template.tsx` — renders the schema to JSX matching the approved structure (one-field-per-line, bold labels, `מדדים / KPI'S :` heading, no perspective sub-headers, scorecard with multi-line cells + stacked 🟢/🟡/🔴 status). *Verify:* visual snapshot against the approved `kpis_3.docx` structure.
- [ ] **Task 7 (M):** Form panel generated from the Zod schema (field types → input widgets). RTL labels, English gloss next to each. *Verify:* fill all fields, the preview updates live.
- [ ] **Task 8 (L):** Word export route `app/api/export/kpis/route.ts` — consumes the form state, emits a `.docx` with the same structure using the `docx` library + section-level bidi + per-paragraph bidi + David font. *Verify:* generated docx round-trips through `scripts/rtl_postprocess.py` checks (sectPr bidi, no «FILL» tokens).

### Checkpoint: KPI vertical
- [ ] Open the app, fill the KPI scorecard form, watch the preview, click "Export Word", get a `.docx` that opens in Word with correct RTL + structure.

### Phase 3 — Editing layer
- [ ] **Task 9 (M):** Shared Zustand store wiring — every form field maps to a preview node by stable id; updates flow both ways. *Verify:* edit in preview → form reflects it; edit in form → preview reflects it.
- [ ] **Task 10 (M):** `contenteditable` on every value node in the preview, with the selection toolbar (bold/italic only). *Verify:* click in preview → cursor lands; type → form updates.
- [ ] **Task 11 (S):** "+ / −" affordance on repeatable blocks (KPI block, scorecard row, growth-engine block). *Verify:* add/remove KPI from the preview; schema array updates; export reflects it.

### Checkpoint: editable
- [ ] You can fill via form OR via preview, interchangeably; export still produces the right Word file.

### Phase 4 — Design-system picker
- [ ] **Task 12 (M):** System switcher in the header (5 vendored systems). Active system applies its `tokens.css` to the preview only. *Verify:* swapping a system changes the preview but not the app chrome; export honors the active system (insofar as Word allows).
- [ ] **Task 13 (S):** A small documentation page (`/about`) listing the systems with their OD attribution. *Verify:* present, readable, links to OD.

### Phase 5 — Remaining artifacts

KPI proved the architecture in Phase 2; each remaining artifact reuses the
form-generator, the contenteditable wiring, and the export route from there.
But every artifact still has its own schema, its own template, its own
artifact-specific widgets (risk register, slide deck, org chart, RACI / BPMN),
and its own export quirks. So each gets its own mini-phase of four tasks,
mirroring Phase 2's structure (Tasks 5–8).

> Per-artifact sub-task pattern: **schema** (Zod) · **template** (TSX) · **form
> widgets** (any artifact-specific inputs the generator can't auto-render) ·
> **export** (Word + PDF, deck also PPTX).

#### Phase 5a — Strategy document (full + focused board version)
- [ ] **Task 14 (M):** `app/lib/schemas/strategy-document.ts` — Zod schema for
      the 7-section structure from `CLAUDE.md` §4.1 (current situation →
      executive summary → trade-offs → growth engines → cash-flow base → risk
      management → strategic summary). Variant flag for full vs. board-focused.
      *Verify:* unit tests for valid/invalid, both variants.
- [ ] **Task 15 (M):** `app/templates/strategy-document/Template.tsx` — renders
      the schema honoring the methodology: named-competitor blocks per growth
      engine, the trade-offs section as a signature block, risk table with
      *risk → response → owner* shape. *Verify:* visual snapshot against
      `templates/strategy-document/`.
- [ ] **Task 16 (S):** Artifact-specific widgets — risk-row repeater,
      growth-engine block (opportunity / competitive landscape / operating
      model / entry path), trade-off pair widget. *Verify:* each can add/remove.
- [ ] **Task 17 (M):** Word + PDF export route. Long doc → check page breaks
      and bidi on every section. *Verify:* open exported `.docx` in Word, RTL
      correct, no orphan headings.

#### Phase 5b — Job / role definition
- [ ] **Task 18 (S):** `app/lib/schemas/job-description.ts` — title +
      positioning, role purpose, responsibility areas (grouped header +
      bulleted duties), extensions (KPIs, interfaces, qualifications,
      reporting lines). *Verify:* unit tests.
- [ ] **Task 19 (S):** `app/templates/job-description/Template.tsx`. *Verify:*
      snapshot against `templates/job-description/`.
- [ ] **Task 20 (S):** Responsibility-area block widget (header + bullets,
      duplicatable). *Verify:* +/− works.
- [ ] **Task 21 (S):** Word + PDF export. *Verify:* round-trips through the
      rtl checks.

#### Phase 5c — Strategy deck (board, ~10 chapters)
- [ ] **Task 22 (M):** `app/lib/schemas/strategy-deck.ts` — slide-array
      schema mirroring `CLAUDE.md` §4.2 (exec summary → who we are → diagnosis
      → focus principle → axes → managing the base → year-one priorities →
      goals/KPIs across horizons → risk → summary). Each slide has its own
      typed shape. *Verify:* unit tests for each slide type.
- [ ] **Task 23 (L):** `app/templates/strategy-deck/Template.tsx` — slide-by-
      slide TSX rendering with a slide-thumbnail nav. Quantified-targets slide
      (NOI / market cap / occupancy across e.g. 2026/2028/2030) gets a custom
      multi-horizon table widget. *Verify:* visual snapshot.
- [ ] **Task 24 (M):** Slide-specific widgets — horizon-targets table,
      chapter-reorder, slide-add/remove. *Verify:* all interactions.
- [ ] **Task 25 (L):** PDF export (v1) + PPTX export (`pptxgenjs`, v2). RTL
      slide direction. *Verify:* both formats open cleanly. (PPTX deferred if
      Phase 5c runs long; PDF is the v1 deliverable per the open question.)

#### Phase 5d — Org structure / org chart
- [ ] **Task 26 (M):** `app/lib/schemas/org-structure.ts` — nodes (role,
      reporting line, function, headcount, mandate) + edges. *Verify:* unit
      tests; validates no cycles.
- [ ] **Task 27 (M):** `app/templates/org-structure/Template.tsx` — an SVG
      org chart (top-down or sideways for compact RTL pages) with a fallback
      tabular view. *Verify:* visual snapshot.
- [ ] **Task 28 (M):** Org-chart editor widget — add/edit/delete node,
      drag-to-reparent. *Verify:* tree edits round-trip into the schema.
- [ ] **Task 29 (M):** Export — Word embeds an SVG of the chart + the tabular
      view; PDF keeps the SVG. *Verify:* chart renders in Word.

#### Phase 5e — Workflow / SOP (incl. RACI, BPMN-lite)
- [ ] **Task 30 (M):** `app/lib/schemas/workflow.ts` — process steps,
      swimlanes (actors), RACI table, inputs / outputs / triggers,
      KPIs-for-this-process. *Verify:* unit tests.
- [ ] **Task 31 (M):** `app/templates/workflow/Template.tsx` — SIPOC header,
      a BPMN-lite swimlane diagram (SVG), RACI table per step. *Verify:*
      snapshot.
- [ ] **Task 32 (M):** Workflow-specific widgets — swimlane editor, RACI
      cell picker (R/A/C/I), step reorder. *Verify:* edits round-trip.
- [ ] **Task 33 (M):** Export — Word table for RACI + embedded SVG; PDF
      keeps both. *Verify:* RACI columns RTL-correct.

### Checkpoint: all artifacts
- [ ] Six pickers in the homepage; each works end-to-end (form → preview →
      edit → export to Word + PDF; deck adds PPTX where supported).
- [ ] Snapshot tests pass for each template against its `templates/` source.
- [ ] Manual smoke pass: fill one of each artifact end-to-end.

### Phase 6 — Polish
- [ ] **Task 34 (S):** Persistence — Zustand persists to `localStorage` per artifact + slug; reload restores state.
- [ ] **Task 35 (S):** Error handling — schema validation surfaces inline; export errors show a clear message.
- [ ] **Task 36 (S):** Keyboard & accessibility — focus order in RTL, escape closes toolbars, all interactive elements reachable by keyboard.
- [ ] **Task 37 (S):** README in `app/` — local dev steps, deploy steps (kept for the future, even though we're not deploying now).

### Checkpoint: complete
- [ ] All success criteria in the design spec met.
- [ ] Manual smoke pass on each artifact (fill → edit → export → re-open in Word).

## Risks & mitigations

| Risk | Impact | Mitigation |
|---|---|---|
| Word fidelity loss from HTML→docx | Med | Drive `.docx` directly from data + the `docx` lib, not via HTML conversion. Reuse our bidi rules. |
| RTL bugs in vendored OD systems (designed LTR) | Med | Start with the editorial/print-style systems (least chrome). Add a small `app/design-systems/_rtl-overrides.css` per system as needed. |
| Scope creep (six artifacts in one PR) | High | Strictly slice; Phase 2 ships KPI alone first. Don't start Task 14 until KPI is approved. |
| Confidential data ending up in the app | High | No backend storage. Everything is in the browser. `localStorage` is per-device. |
| OD attribution drift / license missed | Low | `app/NOTICE` written in Task 3 before any system is vendored. |
| Designing without seeing it (sandbox can't render) | Med | After each phase, render the page to a screenshot via Playwright in CI (or locally) so we can verify visually before claiming "done." |

## Open questions
- **Word export library:** `docx` (npm) gives us full programmatic control but means writing a serializer per template. `html-docx-js` is faster to ship but produces messier output. Default plan = `docx`; revisit if Phase 2 reveals it's too slow.
- **PPTX export for the deck:** is a real deck export needed in v1, or is a PDF/HTML preview acceptable for the first iteration? Defaulting to "PDF for v1, PPTX in v2."
- **Live preview accuracy:** the HTML preview won't be 100% identical to the Word output (CSS doesn't map to OOXML exactly). Is that acceptable, or do we need a "preview-as-Word" iframe via a server-side renderer? Default = accept the gap, document it.

## Verification (planning skill checklist)
- [x] Every task has acceptance criteria.
- [x] Every task has a verification step.
- [x] Dependencies identified and ordered correctly.
- [x] No task touches more than ~5 files (Task 8, 23, 25 are the largest).
- [x] Checkpoints between phases.
- [ ] The operator (you) reviews and approves before any code is written.
