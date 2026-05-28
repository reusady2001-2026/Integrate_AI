# Competitive Benchmarking

The biggest quality gap between a filing-grounded draft and a finished strategy
product is **named-competitor benchmarking with real data**. A filing tells you
about the company; it does not tell you how the company compares to its rivals.
This is analysis the agent must *research*, never invent.

## Reliability rubric (hard rules)
1. **Named, real peers only.** Every competitor is a real, identifiable company.
   No "a leading competitor" placeholders presented as fact.
2. **Same-class peers.** Benchmark only against the same industry + ownership form
   (use `organization-types.md`: GICS/NAICS class + public/private/etc.).
3. **Every figure is sourced.** Each number carries a source and date. Prefer, in
   order: the peer's own filings/IR → regulator (SEC/TASE/Maya) → recognized data
   providers → reputable press. **Reject** SEO blogs, content farms, undated stats.
4. **Confidence tags.** Mark each data point: ✅ sourced & current · 🟡 sourced but
   stale/approximate · 🔴 not found → `[להשלמה / TO FILL: <what's missing>]`.
5. **Never fabricate to fill a table.** A blank, marked cell beats a plausible
   guess. Fabricated competitive data is the worst failure mode of this artifact.
6. **Separate fact from inference.** Market figures = fact (sourced). "We are
   behind on X" = inference (label it as the analyst's read).
7. **Date the snapshot.** Competitive landscapes go stale; stamp "as of <date>".

## Process
1. **Define the comparison set.** From the company's segments (in the filing) and
   its class, list 3–6 real same-class peers. State why each is comparable.
2. **Pick the comparison metrics** that matter for the sector
   (`kpi-and-process.md`): e.g., real estate → NOI, occupancy, cap rate, portfolio
   value, segment scale; SaaS → ARR, NRR, growth; manufacturing → capacity, margin.
3. **Research each peer** from authoritative sources (delegate to research
   subagents when breadth is needed; instruct them: primary sources only, cite
   each, flag uncertainty — the same discipline used to build `methodology/`).
4. **Build the comparison table** — company vs. peers, per metric, each cell
   sourced + confidence-tagged.
5. **Write the gap read** — where the company leads/lags, explicitly labeled as
   inference, tied to the strategy's growth engines.
6. **Slot into the artifact** — the strategy document's "Growth Engines →
   competitive landscape" fields and the diagnosis; leave unresearched cells as
   `[להשלמה / TO FILL]`.

## Output shape (per growth engine / segment)
| מתחרה / Competitor | מדד רלוונטי / Metric | ערך / Value | מקור ותאריך / Source & date | ביטחון |
|---|---|---|---|---|
| <real peer> | <sector metric> | <figure> | <filing/IR/regulator + date> | ✅/🟡/🔴 |

Followed by a 2–4 sentence **gap read** (inference, labeled).

## Boundaries
- **Always:** name real peers; source every figure; tag confidence; date the snapshot.
- **Never:** invent competitors, figures, or rankings; present inference as fact;
  use low-quality sources; benchmark across mismatched classes.
