# Methodology Library · ספריית מתודולוגיה

Vetted, source-grounded frameworks that let the agent work across **any** kind of
company or organization — not just one industry. These are the "rules behind the
templates": pick the right lens for the org in front of you, then fill the
relevant template in `../templates/`.

## Files
- [`organization-types.md`](organization-types.md) — legal/ownership forms, industry classification (GICS/NAICS/ISIC), by-sector nuances.
- [`strategy-frameworks.md`](strategy-frameworks.md) — canonical strategy frameworks + when to use/combine each.
- [`org-structures.md`](org-structures.md) — Mintzberg configurations, classic structures, Galbraith Star, governance by org type.
- [`job-architecture.md`](job-architecture.md) — SOC/O*NET taxonomy, job-description components, leveling, C-suite mandates, role-set by size/stage.
- [`kpi-and-process.md`](kpi-and-process.md) — Balanced Scorecard, OKRs, KPI design; APQC/ISO 9001/BPMN/SIPOC/RACI/COSO for processes.
- [`competitive-benchmarking.md`](competitive-benchmarking.md) — reliability rubric for real, named-peer benchmarking (never invent).
- [`drafting-playbook.md`](drafting-playbook.md) — the gated source → filled-draft method (pairs with `pipeline/` + `scripts/draft.py`).

## How the agent uses this
1. **Classify the organization first** (type + industry) — see `organization-types.md`. This gates governance, disclosure, the objective function, and which roles exist.
2. **Pick frameworks to fit the question** (competitive / growth / turnaround / mission) — see `strategy-frameworks.md`. Combine 2–4 complementary lenses, never stack redundant ones.
3. **Design structure + roles** to fit strategy and org type — `org-structures.md` + `job-architecture.md`.
4. **Make it measurable and operable** — `kpi-and-process.md`.
5. **Always:** ground every claim in source; benchmark only against same-class peers; mark gaps `[להשלמה / TO FILL]`; never invent figures, competitors, or facts.

## Provenance & reliability
Frameworks are attributed to their originators / standards bodies. Attributions
for the most-misattributed items (SWOT, Three Horizons) and the classification
standards (GICS, NAICS, ISIC, SOC, O*NET, APQC PCF, BSC) were verified against
primary sources during research. Some stable details (ISO 9001:2015, BPMN 2.0,
COSO 2013, Mintzberg/Galbraith book specifics, C-suite mandates) rest on
well-established canonical knowledge and are labeled as such. Treat version
numbers and exact tier counts as worth a one-click re-check before publishing in
a client deliverable. Contested/emerging items are flagged inline.
