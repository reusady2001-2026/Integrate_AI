# Integrate AI — Web App

The companion app to the methodology library at the repo root. Pick an
artifact (KPIs first; the rest of the six follow in Phase 5), fill the form,
watch the live RTL Hebrew preview, swap the design system, export to Word.

See [`docs/app-design.md`](../docs/app-design.md) and
[`docs/app-plan.md`](../docs/app-plan.md) for the full plan.

## Run it locally

Requirements: Node 22+, pnpm 10+.

```bash
cd app
pnpm install
pnpm dev
```

Then open <http://localhost:3000>. Click **טען דוגמה** in the form panel to
populate sample data, and try the **סגנון עיצוב** picker in the header to
swap between the five design systems vendored from
[nexu-io/open-design](https://github.com/nexu-io/open-design).

## What's implemented

- **KPI scorecard end-to-end** (Phase 2 of the plan):
  - Zod schema mirroring `templates/kpis/kpi-template.md`.
  - Form panel auto-built from the schema, with add/remove for KPI blocks
    and scorecard rows.
  - Live RTL Hebrew preview rendered from the same state, with
    fill-in lines for empty fields.
  - Word (`.docx`) export with paragraph-level `<w:bidi/>` + run-level
    `<w:rtl/>` for true Word RTL.
- **5 design systems** vendored from OD under Apache-2.0
  (`editorial` / `elegant` / `kami` / `paper` / `warm-editorial`).
  See [`app/NOTICE`](./NOTICE) for attribution.
- A small build script (`scripts/build-design-systems.mjs`) generates a
  scoped CSS bundle by rewriting each `:root` to `[data-ds="<name>"]` so
  the system tokens apply only inside the preview surface, not the app
  chrome. Runs automatically before `dev` and `build`.

## Next phases

- **3** — edit text directly inside the preview (contenteditable wiring).
- **5a-e** — the other five artifacts (strategy doc, job description,
  strategy deck, org structure, workflow / SOP).
- **6** — persistence, errors, accessibility polish.

## Layout

```
app/
  src/
    app/                     Next.js App Router (page.tsx, layout.tsx,
                             api/export/kpis/route.ts, globals.css)
    components/              Shell + form panels
    templates/kpis/          KPI document template + CSS module
    lib/
      schemas/kpis.ts        Zod schema
      store.ts               Zustand store
      export/kpi-docx.ts     Word export via the `docx` library
    styles/                  Generated design-systems bundle (committed)
  design-systems/            Vendored from nexu-io/open-design
  scripts/
    build-design-systems.mjs Generates the scoped CSS bundle
    screenshots.mjs          Playwright capture for review
  NOTICE                     Third-party attribution
```
