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
Each is a repeat of Tasks 5–8 with a new schema + template; tests in parallel.

- [ ] **Task 14 (M):** Strategy document — schema + template + form + export.
- [ ] **Task 15 (S):** Job / role definition — schema + template + form + export.
- [ ] **Task 16 (M):** Strategy deck (board) — schema + slide-by-slide template + form + export (probably as `.pptx` via `pptxgenjs`, separate route).
- [ ] **Task 17 (M):** Org structure — schema + template + form + export.
- [ ] **Task 18 (M):** Workflow / SOP — schema + template (incl. BPMN/RACI table) + form + export.

### Checkpoint: All artifacts
- [ ] Six pickers in the homepage; each works end-to-end.

### Phase 6 — Polish
- [ ] **Task 19 (S):** Persistence — Zustand persists to `localStorage` per artifact + slug; reload restores state.
- [ ] **Task 20 (S):** Error handling — schema validation surfaces inline; export errors show a clear message.
- [ ] **Task 21 (S):** Keyboard & accessibility — focus order in RTL, escape closes toolbars, all interactive elements reachable by keyboard.
- [ ] **Task 22 (S):** README in `app/` — local dev steps, deploy steps (kept for the future, even though we're not deploying now).

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
- [x] No task touches more than ~5 files (Task 8 / 16 are the largest).
- [x] Checkpoints between phases.
- [ ] The operator (you) reviews and approves before any code is written.
