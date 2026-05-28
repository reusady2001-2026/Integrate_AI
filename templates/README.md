# Template Library · ספריית תבניות

Reusable, bilingual (Hebrew + English) templates for organizational analysis and
restructuring. Produced and maintained by the agent defined in
[`../CLAUDE.md`](../CLAUDE.md).

## The two-layer model

Every template exists in two layers:

- **TEMPLATE** — the blank skeleton in this directory: section structure, inline
  guidance, and `[להשלמה / TO FILL: ...]` markers. Domain-agnostic; works for any
  company or organization.
- **DRAFT** — a *copy* of a template filled with one specific company's real,
  sourced data. Drafts are not committed here (often confidential).

Markdown files are the **versionable master**. Render to `.docx` / `.pptx` / `.pdf`
on delivery using the document skills in [`../skills-library/`](../skills-library/).

## Templates

| Template | Path | Hebrew | Use for |
|---|---|---|---|
| Strategy document | [`strategy-document/`](strategy-document/) | מסמך אסטרטגי | Full management/board strategy |
| Strategy deck | [`strategy-deck/`](strategy-deck/) | מצגת אסטרטגית | Board-facing distillation of the strategy |
| Job / role definition | [`job-description/`](job-description/) | הגדרת תפקיד | A single executive/role charter |
| Org structure | [`org-structure/`](org-structure/) | מבנה ארגוני | Hierarchy, governance, delegation of authority |
| Workflow / SOP | [`workflows/`](workflows/) | תהליך עבודה / נוהל | A single process with RACI and controls |
| KPIs & metrics | [`kpis/`](kpis/) | מדדי ביצוע | Measurement framework per org/division/role |

## How the templates connect

- The **strategy document** is the anchor. The **deck** distills it for the board.
- **Job/role definitions** populate the **org structure** boxes.
- **Workflow** RACI roles and **KPI** owners reference those same roles.
- KPI targets-by-horizon mirror the strategy document's KPI appendix.

## Rules (all templates)

1. **Bilingual & RTL** — Hebrew primary, English alongside; respect right-to-left.
2. **Never invent facts** — anything unsourced stays a `[להשלמה / TO FILL]` marker.
3. **Real, named benchmarks** — competitive comparisons use real competitors only.
4. **Tweak-friendly** — a non-technical executive should be able to edit in place.
