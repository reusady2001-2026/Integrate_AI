import { z } from "zod";

export const PortfolioRow = z.object({
  segment: z.string().default(""),
  scale: z.string().default(""),
  value: z.string().default(""),
  noi: z.string().default(""),
  occupancy: z.string().default(""),
  notes: z.string().default(""),
});
export type PortfolioRow = z.infer<typeof PortfolioRow>;

export const FinanceRow = z.object({
  metric: z.string().default(""),
  value: z.string().default(""),
  note: z.string().default(""),
});
export type FinanceRow = z.infer<typeof FinanceRow>;

/** A sub-section inside a growth engine (e.g., "Peer positioning",
 * "Relative advantage in domain", "Recommended entry path", "2026
 * operational recommendation"). Body is a multi-line string; bullets
 * are an optional list rendered after the body. */
export const EngineSubSection = z.object({
  heading: z.string().default(""),
  body: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});
export type EngineSubSection = z.infer<typeof EngineSubSection>;

export const GrowthEngine = z.object({
  name: z.string().default(""),
  /** Multi-paragraph main description of the engine. */
  description: z.string().default(""),
  /** Optional ordered sub-sections (peer positioning, entry path, etc.). */
  subSections: z.array(EngineSubSection).default([]),
  /** Legacy fields — kept optional for backward compatibility with
   * earlier seed files. New documents should use description +
   * subSections. */
  opportunity: z.string().default(""),
  landscape: z.string().default(""),
  model: z.string().default(""),
  entryPath: z.string().default(""),
});
export type GrowthEngine = z.infer<typeof GrowthEngine>;

export const BaseRow = z.object({
  segment: z.string().default(""),
  /** Multi-paragraph narrative describing the segment's role in the
   * cashflow base and the action plan for it. */
  narrative: z.string().default(""),
  /** Optional bulleted recommendations under the segment. */
  recommendations: z.array(z.string()).default([]),
  /** Legacy fields — backward compatibility. */
  status: z.string().default(""),
  risk: z.string().default(""),
  action: z.string().default(""),
});
export type BaseRow = z.infer<typeof BaseRow>;

export const RiskRow = z.object({
  risk: z.string().default(""),
  response: z.string().default(""),
  owner: z.string().default(""),
});
export type RiskRow = z.infer<typeof RiskRow>;

/** Action move for Section 8 — 2026 action plan. */
export const ActionMove = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
  owner: z.string().default(""),
  successMetric: z.string().default(""),
});
export type ActionMove = z.infer<typeof ActionMove>;

/** Target horizon row for Section 9 (base / milestone / target). */
export const TargetHorizon = z.object({
  metric: z.string().default(""),
  base2026: z.string().default(""),
  milestone2028: z.string().default(""),
  target2030: z.string().default(""),
});
export type TargetHorizon = z.infer<typeof TargetHorizon>;

export const StrategyDocument = z.object({
  // ── Header ───────────────────────────────────────────────────────
  company: z.string().default(""),
  docType: z.string().default(""),
  horizon: z.string().default(""),
  date: z.string().default(""),

  // ── Section 1 — Executive Summary (multi-paragraph) ──────────────
  executiveSummary: z.array(z.string()).default([]),

  // ── Section 2 — Who we are: current state ────────────────────────
  // 2.1 Corporate identity
  founding: z.string().default(""),
  ownership: z.string().default(""),
  listing: z.string().default(""),
  rating: z.string().default(""),
  officers: z.string().default(""),
  // 2.2 Activity portfolio
  portfolioNarrative: z.string().default(""),
  portfolio: z.array(PortfolioRow).default([]),
  // 2.3 Financial state
  financeNarrative: z.string().default(""),
  finance: z.array(FinanceRow).default([]),
  financeImplication: z.string().default(""),

  // ── Section 3 — Strategic Diagnosis ──────────────────────────────
  diagnosisIntro: z.string().default(""),
  relativeAdvantage: z.string().default(""),
  peerPositioning: z.string().default(""),

  // ── Section 4 — Focus Principle: what to avoid ───────────────────
  focusPrincipleIntro: z.string().default(""),
  wontDo: z.array(z.string()).default([]),

  // ── Section 5 — Strategic Growth Focuses ─────────────────────────
  growthEnginesIntro: z.string().default(""),
  engines: z.array(GrowthEngine).default([]),

  // ── Section 6 — Managing the existing cashflow base ──────────────
  cashflowBaseIntro: z.string().default(""),
  base: z.array(BaseRow).default([]),

  // ── Section 7 — Building organizational capabilities ─────────────
  capabilities: z.array(z.string()).default([]),

  // ── Section 8 — 2026 action plan & priorities ────────────────────
  actionPlanIntro: z.string().default(""),
  actionPlanRhythm: z.string().default(""),
  actionMoves: z.array(ActionMove).default([]),

  // ── Section 9 — Success metrics & target horizons ────────────────
  successMetricsIntro: z.string().default(""),
  targetHorizons: z.array(TargetHorizon).default([]),

  // ── Section 10 — Risk management ─────────────────────────────────
  risksIntro: z.string().default(""),
  risks: z.array(RiskRow).default([]),

  // ── Section 11 — Strategic summary (multi-paragraph) ─────────────
  summaryParagraphs: z.array(z.string()).default([]),

  // ── Legacy fields kept for backward compatibility ────────────────
  thesis: z.string().default(""),
  challenges: z.array(z.string()).default([]),
  willDo: z.array(z.string()).default([]),
  summary: z.string().default(""),
});
export type StrategyDocument = z.infer<typeof StrategyDocument>;

export const emptyPortfolioRow = (): PortfolioRow => ({ segment: "", scale: "", value: "", noi: "", occupancy: "", notes: "" });
export const emptyFinanceRow = (): FinanceRow => ({ metric: "", value: "", note: "" });
export const emptyEngineSubSection = (): EngineSubSection => ({ heading: "", body: "", bullets: [] });
export const emptyEngine = (): GrowthEngine => ({
  name: "", description: "", subSections: [],
  opportunity: "", landscape: "", model: "", entryPath: "",
});
export const emptyBaseRow = (): BaseRow => ({
  segment: "", narrative: "", recommendations: [],
  status: "", risk: "", action: "",
});
export const emptyRiskRow = (): RiskRow => ({ risk: "", response: "", owner: "" });
export const emptyActionMove = (): ActionMove => ({ title: "", description: "", owner: "", successMetric: "" });
export const emptyTargetHorizon = (): TargetHorizon => ({ metric: "", base2026: "", milestone2028: "", target2030: "" });

export const emptyStrategyDocument = (): StrategyDocument => ({
  company: "", docType: "", horizon: "", date: "",
  executiveSummary: [""],
  founding: "", ownership: "", listing: "", rating: "", officers: "",
  portfolioNarrative: "",
  portfolio: [emptyPortfolioRow()],
  financeNarrative: "",
  finance: [emptyFinanceRow()],
  financeImplication: "",
  diagnosisIntro: "",
  relativeAdvantage: "",
  peerPositioning: "",
  focusPrincipleIntro: "",
  wontDo: [""],
  growthEnginesIntro: "",
  engines: [emptyEngine()],
  cashflowBaseIntro: "",
  base: [emptyBaseRow()],
  capabilities: [""],
  actionPlanIntro: "",
  actionPlanRhythm: "",
  actionMoves: [emptyActionMove()],
  successMetricsIntro: "",
  targetHorizons: [emptyTargetHorizon()],
  risksIntro: "",
  risks: [emptyRiskRow()],
  summaryParagraphs: [""],
  // Legacy
  thesis: "",
  challenges: [],
  willDo: [],
  summary: "",
});
