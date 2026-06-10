"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateAnyDoc } from "./translate";
import {
  emptyActionMove, emptyBaseRow, emptyEngine, emptyEngineSubSection,
  emptyFinanceRow, emptyPortfolioRow, emptyRiskRow, emptyStrategyDocument,
  emptyTargetHorizon,
  type ActionMove, type BaseRow, type EngineSubSection, type FinanceRow,
  type GrowthEngine, type PortfolioRow, type RiskRow, type StrategyDocument,
  type TargetHorizon,
} from "./schemas/strategy-document";
import { sampleStraussStrategy } from "./samples/strauss-samples";
import { defaultDocDesign, type DocCustomPalette, type DocDesign } from "./themes/doc-themes";

type S = StrategyDocument;
type State = {
  doc: S;
  design: DocDesign;
  setField: <K extends keyof S>(key: K, value: S[K]) => void;

  // Section 1
  setExecutiveSummary: (i: number, v: string) => void;
  addExecutiveSummary: () => void;
  removeExecutiveSummary: (i: number) => void;

  // Section 2 — portfolio
  setPortfolio: (i: number, patch: Partial<PortfolioRow>) => void;
  addPortfolio: () => void;
  removePortfolio: (i: number) => void;
  // Section 2 — finance
  setFinance: (i: number, patch: Partial<FinanceRow>) => void;
  addFinance: () => void;
  removeFinance: (i: number) => void;

  // Section 4 — won't do
  setWontDo: (i: number, v: string) => void;
  addWontDo: () => void;
  removeWontDo: (i: number) => void;

  // Section 5 — engines and sub-sections
  setEngine: (i: number, patch: Partial<GrowthEngine>) => void;
  addEngine: () => void;
  removeEngine: (i: number) => void;
  setEngineSubSection: (ei: number, si: number, patch: Partial<EngineSubSection>) => void;
  addEngineSubSection: (ei: number) => void;
  removeEngineSubSection: (ei: number, si: number) => void;
  setEngineSubSectionBullet: (ei: number, si: number, bi: number, v: string) => void;
  addEngineSubSectionBullet: (ei: number, si: number) => void;
  removeEngineSubSectionBullet: (ei: number, si: number, bi: number) => void;

  // Section 6 — base
  setBase: (i: number, patch: Partial<BaseRow>) => void;
  addBase: () => void;
  removeBase: (i: number) => void;
  setBaseRecommendation: (bi: number, ri: number, v: string) => void;
  addBaseRecommendation: (bi: number) => void;
  removeBaseRecommendation: (bi: number, ri: number) => void;

  // Section 7 — capabilities
  setCapability: (i: number, v: string) => void;
  addCapability: () => void;
  removeCapability: (i: number) => void;

  // Section 8 — action moves
  setActionMove: (i: number, patch: Partial<ActionMove>) => void;
  addActionMove: () => void;
  removeActionMove: (i: number) => void;

  // Section 9 — target horizons
  setTargetHorizon: (i: number, patch: Partial<TargetHorizon>) => void;
  addTargetHorizon: () => void;
  removeTargetHorizon: (i: number) => void;

  // Section 10 — risks
  setRisk: (i: number, patch: Partial<RiskRow>) => void;
  addRisk: () => void;
  removeRisk: (i: number) => void;

  // Section 11 — summary paragraphs
  setSummaryParagraph: (i: number, v: string) => void;
  addSummaryParagraph: () => void;
  removeSummaryParagraph: (i: number) => void;

  // Legacy
  setChallenge: (i: number, v: string) => void;
  addChallenge: () => void;
  removeChallenge: (i: number) => void;
  setWillDo: (i: number, v: string) => void;
  addWillDo: () => void;
  removeWillDo: (i: number) => void;

  setDocTheme: (id: string) => void;
  setDocPaletteOverride: (id: string) => void;
  setDocCustomPalette: (patch: Partial<DocCustomPalette>) => void;
  resetDocDesign: () => void;
  setDocFormatting: (patch: Partial<Pick<DocDesign, "titleFont" | "bodyFont" | "fontSize" | "titleScale" | "bodyScale" | "tableStyle">>) => void;
  loadSample: () => void;
  reset: () => void;
  translate: (from: Lang, to: Lang) => Promise<void>;
};

const setRow = <T,>(arr: T[], i: number, patch: Partial<T>): T[] =>
  arr.map((r, idx) => (idx === i ? { ...r, ...patch } : r));
const removeAt = <T,>(arr: T[], i: number): T[] => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr);
const setItem = (arr: string[], i: number, v: string): string[] =>
  arr.map((c, idx) => (idx === i ? v : c));

export const useStrategyDocStore = create<State>((set, get) => ({
  doc: emptyStrategyDocument(),
  design: defaultDocDesign(),

  setDocTheme: (id) => set((s) => ({ design: { ...s.design, theme: id } })),
  setDocPaletteOverride: (id) => set((s) => ({ design: { ...s.design, paletteOverride: id } })),
  setDocCustomPalette: (patch) => set((s) => ({ design: { ...s.design, customPalette: { ...s.design.customPalette, ...patch } } })),
  resetDocDesign: () => set({ design: defaultDocDesign() }),
  setDocFormatting: (patch) => set((s) => ({ design: { ...s.design, ...patch } })),

  setField: (key, value) => set((s) => ({ doc: { ...s.doc, [key]: value } })),

  // Section 1
  setExecutiveSummary: (i, v) => set((s) => ({ doc: { ...s.doc, executiveSummary: setItem(s.doc.executiveSummary, i, v) } })),
  addExecutiveSummary: () => set((s) => ({ doc: { ...s.doc, executiveSummary: [...s.doc.executiveSummary, ""] } })),
  removeExecutiveSummary: (i) => set((s) => ({ doc: { ...s.doc, executiveSummary: removeAt(s.doc.executiveSummary, i) } })),

  // Section 2
  setPortfolio: (i, p) => set((s) => ({ doc: { ...s.doc, portfolio: setRow(s.doc.portfolio, i, p) } })),
  addPortfolio: () => set((s) => ({ doc: { ...s.doc, portfolio: [...s.doc.portfolio, emptyPortfolioRow()] } })),
  removePortfolio: (i) => set((s) => ({ doc: { ...s.doc, portfolio: removeAt(s.doc.portfolio, i) } })),
  setFinance: (i, p) => set((s) => ({ doc: { ...s.doc, finance: setRow(s.doc.finance, i, p) } })),
  addFinance: () => set((s) => ({ doc: { ...s.doc, finance: [...s.doc.finance, emptyFinanceRow()] } })),
  removeFinance: (i) => set((s) => ({ doc: { ...s.doc, finance: removeAt(s.doc.finance, i) } })),

  // Section 4
  setWontDo: (i, v) => set((s) => ({ doc: { ...s.doc, wontDo: setItem(s.doc.wontDo, i, v) } })),
  addWontDo: () => set((s) => ({ doc: { ...s.doc, wontDo: [...s.doc.wontDo, ""] } })),
  removeWontDo: (i) => set((s) => ({ doc: { ...s.doc, wontDo: removeAt(s.doc.wontDo, i) } })),

  // Section 5
  setEngine: (i, p) => set((s) => ({ doc: { ...s.doc, engines: setRow(s.doc.engines, i, p) } })),
  addEngine: () => set((s) => ({ doc: { ...s.doc, engines: [...s.doc.engines, emptyEngine()] } })),
  removeEngine: (i) => set((s) => ({ doc: { ...s.doc, engines: removeAt(s.doc.engines, i) } })),
  setEngineSubSection: (ei, si, patch) => set((s) => ({
    doc: { ...s.doc, engines: s.doc.engines.map((e, idx) =>
      idx === ei ? { ...e, subSections: setRow(e.subSections, si, patch) } : e) }
  })),
  addEngineSubSection: (ei) => set((s) => ({
    doc: { ...s.doc, engines: s.doc.engines.map((e, idx) =>
      idx === ei ? { ...e, subSections: [...e.subSections, emptyEngineSubSection()] } : e) }
  })),
  removeEngineSubSection: (ei, si) => set((s) => ({
    doc: { ...s.doc, engines: s.doc.engines.map((e, idx) =>
      idx === ei ? { ...e, subSections: e.subSections.filter((_, j) => j !== si) } : e) }
  })),
  setEngineSubSectionBullet: (ei, si, bi, v) => set((s) => ({
    doc: { ...s.doc, engines: s.doc.engines.map((e, idx) =>
      idx === ei ? { ...e, subSections: e.subSections.map((ss, j) =>
        j === si ? { ...ss, bullets: setItem(ss.bullets, bi, v) } : ss) } : e) }
  })),
  addEngineSubSectionBullet: (ei, si) => set((s) => ({
    doc: { ...s.doc, engines: s.doc.engines.map((e, idx) =>
      idx === ei ? { ...e, subSections: e.subSections.map((ss, j) =>
        j === si ? { ...ss, bullets: [...ss.bullets, ""] } : ss) } : e) }
  })),
  removeEngineSubSectionBullet: (ei, si, bi) => set((s) => ({
    doc: { ...s.doc, engines: s.doc.engines.map((e, idx) =>
      idx === ei ? { ...e, subSections: e.subSections.map((ss, j) =>
        j === si ? { ...ss, bullets: ss.bullets.filter((_, k) => k !== bi) } : ss) } : e) }
  })),

  // Section 6
  setBase: (i, p) => set((s) => ({ doc: { ...s.doc, base: setRow(s.doc.base, i, p) } })),
  addBase: () => set((s) => ({ doc: { ...s.doc, base: [...s.doc.base, emptyBaseRow()] } })),
  removeBase: (i) => set((s) => ({ doc: { ...s.doc, base: removeAt(s.doc.base, i) } })),
  setBaseRecommendation: (bi, ri, v) => set((s) => ({
    doc: { ...s.doc, base: s.doc.base.map((b, idx) =>
      idx === bi ? { ...b, recommendations: setItem(b.recommendations, ri, v) } : b) }
  })),
  addBaseRecommendation: (bi) => set((s) => ({
    doc: { ...s.doc, base: s.doc.base.map((b, idx) =>
      idx === bi ? { ...b, recommendations: [...b.recommendations, ""] } : b) }
  })),
  removeBaseRecommendation: (bi, ri) => set((s) => ({
    doc: { ...s.doc, base: s.doc.base.map((b, idx) =>
      idx === bi ? { ...b, recommendations: b.recommendations.filter((_, k) => k !== ri) } : b) }
  })),

  // Section 7
  setCapability: (i, v) => set((s) => ({ doc: { ...s.doc, capabilities: setItem(s.doc.capabilities, i, v) } })),
  addCapability: () => set((s) => ({ doc: { ...s.doc, capabilities: [...s.doc.capabilities, ""] } })),
  removeCapability: (i) => set((s) => ({ doc: { ...s.doc, capabilities: removeAt(s.doc.capabilities, i) } })),

  // Section 8
  setActionMove: (i, p) => set((s) => ({ doc: { ...s.doc, actionMoves: setRow(s.doc.actionMoves, i, p) } })),
  addActionMove: () => set((s) => ({ doc: { ...s.doc, actionMoves: [...s.doc.actionMoves, emptyActionMove()] } })),
  removeActionMove: (i) => set((s) => ({ doc: { ...s.doc, actionMoves: removeAt(s.doc.actionMoves, i) } })),

  // Section 9
  setTargetHorizon: (i, p) => set((s) => ({ doc: { ...s.doc, targetHorizons: setRow(s.doc.targetHorizons, i, p) } })),
  addTargetHorizon: () => set((s) => ({ doc: { ...s.doc, targetHorizons: [...s.doc.targetHorizons, emptyTargetHorizon()] } })),
  removeTargetHorizon: (i) => set((s) => ({ doc: { ...s.doc, targetHorizons: removeAt(s.doc.targetHorizons, i) } })),

  // Section 10
  setRisk: (i, p) => set((s) => ({ doc: { ...s.doc, risks: setRow(s.doc.risks, i, p) } })),
  addRisk: () => set((s) => ({ doc: { ...s.doc, risks: [...s.doc.risks, emptyRiskRow()] } })),
  removeRisk: (i) => set((s) => ({ doc: { ...s.doc, risks: removeAt(s.doc.risks, i) } })),

  // Section 11
  setSummaryParagraph: (i, v) => set((s) => ({ doc: { ...s.doc, summaryParagraphs: setItem(s.doc.summaryParagraphs, i, v) } })),
  addSummaryParagraph: () => set((s) => ({ doc: { ...s.doc, summaryParagraphs: [...s.doc.summaryParagraphs, ""] } })),
  removeSummaryParagraph: (i) => set((s) => ({ doc: { ...s.doc, summaryParagraphs: removeAt(s.doc.summaryParagraphs, i) } })),

  // Legacy
  setChallenge: (i, v) => set((s) => ({ doc: { ...s.doc, challenges: setItem(s.doc.challenges, i, v) } })),
  addChallenge: () => set((s) => ({ doc: { ...s.doc, challenges: [...s.doc.challenges, ""] } })),
  removeChallenge: (i) => set((s) => ({ doc: { ...s.doc, challenges: removeAt(s.doc.challenges, i) } })),
  setWillDo: (i, v) => set((s) => ({ doc: { ...s.doc, willDo: setItem(s.doc.willDo, i, v) } })),
  addWillDo: () => set((s) => ({ doc: { ...s.doc, willDo: [...s.doc.willDo, ""] } })),
  removeWillDo: (i) => set((s) => ({ doc: { ...s.doc, willDo: removeAt(s.doc.willDo, i) } })),

  loadSample: () => set({ doc: sampleStraussStrategy() }),
  reset: () => set({ doc: emptyStrategyDocument() }),
  translate: async (from, to) => {
    const translated = await translateAnyDoc(get().doc, from, to);
    set({ doc: translated });
  },
}));
