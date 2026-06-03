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

export const GrowthEngine = z.object({
  name: z.string().default(""),
  opportunity: z.string().default(""),
  landscape: z.string().default(""),
  model: z.string().default(""),
  entryPath: z.string().default(""),
});
export type GrowthEngine = z.infer<typeof GrowthEngine>;

export const BaseRow = z.object({
  segment: z.string().default(""),
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

export const StrategyDocument = z.object({
  company: z.string().default(""),
  docType: z.string().default(""),
  horizon: z.string().default(""),
  date: z.string().default(""),
  founding: z.string().default(""),
  ownership: z.string().default(""),
  listing: z.string().default(""),
  rating: z.string().default(""),
  officers: z.string().default(""),
  portfolio: z.array(PortfolioRow).default([]),
  finance: z.array(FinanceRow).default([]),
  challenges: z.array(z.string()).default([]),
  thesis: z.string().default(""),
  willDo: z.array(z.string()).default([]),
  wontDo: z.array(z.string()).default([]),
  engines: z.array(GrowthEngine).default([]),
  base: z.array(BaseRow).default([]),
  risks: z.array(RiskRow).default([]),
  summary: z.string().default(""),
});
export type StrategyDocument = z.infer<typeof StrategyDocument>;

export const emptyPortfolioRow = (): PortfolioRow => ({ segment: "", scale: "", value: "", noi: "", occupancy: "", notes: "" });
export const emptyFinanceRow = (): FinanceRow => ({ metric: "", value: "", note: "" });
export const emptyEngine = (): GrowthEngine => ({ name: "", opportunity: "", landscape: "", model: "", entryPath: "" });
export const emptyBaseRow = (): BaseRow => ({ segment: "", status: "", risk: "", action: "" });
export const emptyRiskRow = (): RiskRow => ({ risk: "", response: "", owner: "" });

export const emptyStrategyDocument = (): StrategyDocument => ({
  company: "", docType: "", horizon: "", date: "",
  founding: "", ownership: "", listing: "", rating: "", officers: "",
  portfolio: [emptyPortfolioRow()],
  finance: [emptyFinanceRow()],
  challenges: [""],
  thesis: "",
  willDo: [""],
  wontDo: [""],
  engines: [emptyEngine()],
  base: [emptyBaseRow()],
  risks: [emptyRiskRow()],
  summary: "",
});
