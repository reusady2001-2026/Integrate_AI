import { z } from "zod";

export const KpiBlock = z.object({
  name: z.string(),
  definition: z.string(),
  formula: z.string(),
  owner: z.string(),
  dataSource: z.string(),
  cadence: z.string(),
  baseline: z.string(),
  targets: z.string(),
  thresholds: z.string(),
});
export type KpiBlock = z.infer<typeof KpiBlock>;

export const ScorecardRow = z.object({
  kpi: z.string(),
  owner: z.string(),
  baseline: z.string(),
  target: z.string(),
  cadence: z.string(),
  status: z.string(),
});
export type ScorecardRow = z.infer<typeof ScorecardRow>;

export const KpiDocument = z.object({
  company: z.string(),
  level: z.string(),
  date: z.string(),
  kpis: z.array(KpiBlock),
  scorecard: z.array(ScorecardRow),
});
export type KpiDocument = z.infer<typeof KpiDocument>;

export const emptyKpiBlock = (): KpiBlock => ({
  name: "",
  definition: "",
  formula: "",
  owner: "",
  dataSource: "",
  cadence: "",
  baseline: "",
  targets: "",
  thresholds: "",
});

export const emptyScorecardRow = (): ScorecardRow => ({
  kpi: "",
  owner: "",
  baseline: "",
  target: "",
  cadence: "",
  status: "",
});

export const emptyKpiDocument = (): KpiDocument => ({
  company: "",
  level: "",
  date: "",
  kpis: [emptyKpiBlock()],
  scorecard: [emptyScorecardRow()],
});
