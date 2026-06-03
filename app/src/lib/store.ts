"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateDoc } from "./translate";
import {
  emptyKpiBlock,
  emptyKpiDocument,
  emptyScorecardRow,
  type KpiBlock,
  type KpiDocument,
  type ScorecardRow,
} from "./schemas/kpis";
import { sampleStraussKpi } from "./samples/strauss-samples";

type KpiState = {
  doc: KpiDocument;
  setField: <K extends keyof KpiDocument>(key: K, value: KpiDocument[K]) => void;
  setKpi: (index: number, patch: Partial<KpiBlock>) => void;
  addKpi: () => void;
  removeKpi: (index: number) => void;
  setScorecardRow: (index: number, patch: Partial<ScorecardRow>) => void;
  addScorecardRow: () => void;
  removeScorecardRow: (index: number) => void;
  loadSample: () => void;
  reset: () => void;
  translate: (from: Lang, to: Lang) => Promise<void>;
};

export const useKpiStore = create<KpiState>((set, get) => ({
  doc: emptyKpiDocument(),

  setField: (key, value) =>
    set((s) => ({ doc: { ...s.doc, [key]: value } })),
  setKpi: (index, patch) =>
    set((s) => ({
      doc: { ...s.doc, kpis: s.doc.kpis.map((k, i) => (i === index ? { ...k, ...patch } : k)) },
    })),
  addKpi: () =>
    set((s) => ({ doc: { ...s.doc, kpis: [...s.doc.kpis, emptyKpiBlock()] } })),
  removeKpi: (index) =>
    set((s) => ({
      doc: {
        ...s.doc,
        kpis: s.doc.kpis.length > 1 ? s.doc.kpis.filter((_, i) => i !== index) : s.doc.kpis,
      },
    })),
  setScorecardRow: (index, patch) =>
    set((s) => ({
      doc: { ...s.doc, scorecard: s.doc.scorecard.map((r, i) => (i === index ? { ...r, ...patch } : r)) },
    })),
  addScorecardRow: () =>
    set((s) => ({ doc: { ...s.doc, scorecard: [...s.doc.scorecard, emptyScorecardRow()] } })),
  removeScorecardRow: (index) =>
    set((s) => ({
      doc: {
        ...s.doc,
        scorecard: s.doc.scorecard.length > 1 ? s.doc.scorecard.filter((_, i) => i !== index) : s.doc.scorecard,
      },
    })),
  loadSample: () => set({ doc: sampleStraussKpi() }),
  reset: () => set({ doc: emptyKpiDocument() }),
  translate: async (from, to) => {
    const translated = await translateDoc(get().doc, from, to);
    set({ doc: translated });
  },
}));

function sampleKpiDocument(): KpiDocument {
  return {
    company: "אינטגרייט AI בע\"מ",
    role: "מנכ\"ל",
    date: "1 ביוני 2026",
    kpis: [
      {
        name: "צמיחה בהכנסות חוזרות (ARR Growth)",
        definition: "השינוי הרבעוני בהכנסות החוזרות מלקוחות פעילים, ללא חד-פעמיים.",
        formula: "(ARR רבעון נוכחי − ARR רבעון קודם) / ARR רבעון קודם × 100%",
        owner: "סמנכ\"ל הכנסות (CRO)",
        dataSource: "מערכת ה-CRM, דוח ARR חודשי",
        cadence: "רבעוני",
        baseline: "12% צמיחה רבעונית (Q2 2026)",
        targets: "T+1: 14% · T+2: 18% · T+5: 22%",
      },
    ],
    scorecard: [
      { kpi: "ARR Growth", owner: "CRO", baseline: "12%", target: "14% (T+1)", cadence: "רבעוני" },
    ],
  };
}
