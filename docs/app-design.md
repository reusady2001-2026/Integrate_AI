# App Design Plan — Integrate_AI Web App

The companion app that wraps our existing methodology + templates with a web
UI: pick an artifact, pick a design system, fill the fields, edit in place,
export to Word. Hebrew-primary, RTL throughout. Design language vendored from
nexu-io/open-design (Apache-2.0, attribution preserved).

## Audience & frame

- **Operator (you):** drives the app — runs the methodology, refines drafts.
- **Position-holder (downstream):** fills fields, edits text in their cell,
  receives a Word doc for distribution.
- **Reader (board / management):** ultimately consumes the printed/Word output.

The app must look professional enough that the position-holder takes it
seriously and the reader doesn't notice it was AI-tooled.

## Visual principles (non-negotiable)

1. **Hebrew-primary, true RTL.** `<html lang="he" dir="rtl">`. All layout flips:
   form panel on the left, preview on the right (because the document inside
   the preview is right-anchored Hebrew). Bidi where needed for English
   technical terms (NOI, FFO, IFRS).
2. **Print fidelity.** Every preview is a *direct* representation of the Word
   export, not just a "nice screen view." If the user changes a value, the doc
   they download contains exactly that.
3. **Official, not playful.** Editorial / corporate register — David, Frank
   Ruhl Libre, or Heebo for Hebrew; Inter or Georgia for English glosses.
   Minimal accent color. Generous white space. No emoji or icons in the doc
   body unless the template explicitly calls for them (status traffic lights).
4. **Edit happens in-place.** No separate "edit mode." You click a paragraph,
   the cursor lands there, you type. Save is implicit / autosave.
5. **The methodology rules of `CLAUDE.md` are enforced by the UI**, not by
   politeness. No "מתודולוגיה" preambles inserted into outputs. No "ניקודת
   ההוכחה" comparisons. Field labels bold; guidance plain text.

## Layout

```
┌─────────────────────────────────────────────────────────────────┐
│ Header: artifact name · design system picker · export button    │
├──────────────────────┬──────────────────────────────────────────┤
│                      │                                          │
│    Form panel        │     Preview panel (the document)         │
│    (left, LTR-ish    │     (right, RTL Hebrew, edit in place)   │
│     for the form     │                                          │
│     widgets)         │                                          │
│                      │                                          │
└──────────────────────┴──────────────────────────────────────────┘
```

- The form panel holds the input widgets, organized into the same sections as
  the template (`1. מסגרת המדידה`, `2. הגדרות מדדים`, etc.).
- The preview panel is the *rendered document* — exactly the layout that will
  ship in the Word file. Clicking a paragraph there focuses the matching form
  field; typing in either place updates both.

## Typography

- **Hebrew (default):** David (serif) for body; Heebo (sans) for UI; Frank Ruhl
  Libre (serif display) for headings — all via Google Fonts.
- **English glosses:** Inter or Georgia, matching weight to the Hebrew.
- **Numerals:** tabular-figures for scorecard tables so columns align.
- **Sizes (compact, per the existing learned rule):** body 9pt-equivalent, H2
  ~10pt, H1 ~11pt. Re-evaluated in the browser at a larger zoom-friendly base.

## Color & tokens

Each vendored design system supplies a `tokens.css` with `--palette-*`,
`--type-*`, `--space-*` CSS variables. The app keeps **its own neutral chrome**
(header, sidebar, buttons) — the design-system tokens apply **only inside the
preview panel** so swapping a system changes the document, not the app.

Starting set of systems (vendored from OD; Apache-2.0 attribution in
`app/NOTICE`):

| System (OD name) | When it fits |
|---|---|
| `editorial` | Default. Magazine-grade serif, restrained. |
| `elegant` | Board / dirextoriate-facing strategy docs. |
| `kami` | Warm-paper feel for HR / personal notices. |
| `paper` | Print-mimic for legal-ish docs. |
| `warm-editorial` | Softer alternative to `editorial`. |

Five is enough to cover most needs and small enough to QA in RTL.

## Components

A short, reusable kit; nothing artisanal. Built with Radix UI primitives
(accessible, RTL-aware) + Tailwind. Each component has a print-form and an
edit-form.

- **FieldLabel** — bold Hebrew + English gloss, on its own line. (This is the
  rule we already learned the hard way.)
- **FillLine** — the underline-on-its-own-line writing space for the *empty*
  template view (when scaffolded without data); becomes the value paragraph
  once filled. Click → edit.
- **GuidanceLine** — "`מה למלא: ...`" — plain text, italics off, slightly
  muted color, *never* removed by the agent.
- **KPIBlock** — the nine-field block (Name, Definition, Formula, Owner,
  Source, Cadence, Baseline, Targets, Thresholds), exactly the order in the
  approved `kpis_3.docx`. No reorganization, no perspective grouping.
- **ScorecardCell** — multi-line cell with three long lines + one short line
  (matching the layout you showed me).
- **StatusCell** — stacked 🟢 / 🟡 / 🔴 with a short line each.
- **RiskTable**, **PortfolioTable**, **FinancialTable** — the artifact-specific
  tables, each pre-styled per the active design system.
- **ExportButton** — Word (.docx) and PDF.

## Editing

- **Click any text in the preview** → cursor enters, the matching form field
  on the left highlights, and typing in either updates both via shared state.
- **Toolbar on selection** — bold / italic only, deliberately minimal.
- **Add / remove a duplicated block** (KPI, growth engine, etc.) via a "+ /
  −" affordance at the start of the block. The template's rule of *one
  example block + "duplicate as needed"* becomes a real button.

## Export

- **Word (.docx)** — server route that consumes the form state + active
  template + active design system and produces the doc. Reuses the bidi/RTL
  rules from `scripts/rtl_postprocess.py`. The Word output is a *structurally
  equivalent* but design-simplified version of the preview — Word can't render
  custom CSS the same way HTML can, and we accept that loss in fidelity in
  return for editability.
- **PDF** — exact preview, exported via `@react-pdf/renderer` or the browser's
  print pipeline.
- **Markdown** — for round-trip with our existing `templates/` pipeline.

The preview is the source of truth for *what it will look like printed*; the
Word file is the source of truth for *what the position-holder will edit
afterwards*. Both must be in sync, never one or the other.

## RTL & bilingual rules (carryovers from `CLAUDE.md`)

- Body text Hebrew; English appears only as field labels alongside Hebrew
  labels and preserved technical terms (NOI, FFO, IFRS, FDA, BSC, …).
- True RTL = `<w:bidi/>` at section level + per-paragraph level for Word;
  `dir="rtl"` + correct `unicode-bidi: plaintext` for HTML.
- Tables: header row centered; body rows right-aligned; column order
  follows the document reading direction (RTL).
- Default to David / Heebo / Frank Ruhl Libre; never Calibri / Arial unless
  the chosen design system demands it.

## Sourcing from OD (Apache-2.0)

- Vendored: 5 `design-systems/` (above), each as a snapshot in
  `app/design-systems/<name>/`.
- `app/NOTICE` records: `Portions of design-systems/ derived from
  nexu-io/open-design (Apache-2.0).`
- We do **not** vendor OD's daemon, web app, skills protocol, or runtime —
  only the static design assets we need.

## Out of scope (explicit non-goals)

- No live AI generation inside the app. Drafting happens via the existing
  `scripts/draft.py` + the agent (me) outside the app; the app fills and
  refines pre-generated drafts.
- No login / multi-user. Single-operator MVP.
- No version history / collaboration. Files are downloaded snapshots.
- No deployment in this phase (per the operator's call). Local dev only.
