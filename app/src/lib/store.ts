"use client";

import { create } from "zustand";
import {
  emptyKpiBlock,
  emptyKpiDocument,
  emptyScorecardRow,
  type KpiBlock,
  type KpiDocument,
  type ScorecardRow,
} from "./schemas/kpis";

type KpiState = {
  doc: KpiDocument;
  setField: <K extends keyof KpiDocument>(key: K, value: KpiDocument[K]) => void;
  setFrameworkField: (key: keyof KpiDocument["framework"], value: string) => void;
  setKpi: (index: number, patch: Partial<KpiBlock>) => void;
  addKpi: () => void;
  removeKpi: (index: number) => void;
  setScorecardRow: (index: number, patch: Partial<ScorecardRow>) => void;
  addScorecardRow: () => void;
  removeScorecardRow: (index: number) => void;
  loadSample: () => void;
  reset: () => void;
};

export const useKpiStore = create<KpiState>((set) => ({
  doc: emptyKpiDocument(),
  setField: (key, value) =>
    set((s) => ({ doc: { ...s.doc, [key]: value } })),
  setFrameworkField: (key, value) =>
    set((s) => ({ doc: { ...s.doc, framework: { ...s.doc.framework, [key]: value } } })),
  setKpi: (index, patch) =>
    set((s) => ({
      doc: {
        ...s.doc,
        kpis: s.doc.kpis.map((k, i) => (i === index ? { ...k, ...patch } : k)),
      },
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
      doc: {
        ...s.doc,
        scorecard: s.doc.scorecard.map((r, i) => (i === index ? { ...r, ...patch } : r)),
      },
    })),
  addScorecardRow: () =>
    set((s) => ({ doc: { ...s.doc, scorecard: [...s.doc.scorecard, emptyScorecardRow()] } })),
  removeScorecardRow: (index) =>
    set((s) => ({
      doc: {
        ...s.doc,
        scorecard:
          s.doc.scorecard.length > 1
            ? s.doc.scorecard.filter((_, i) => i !== index)
            : s.doc.scorecard,
      },
    })),
  loadSample: () => set({ doc: sampleKpiDocument() }),
  reset: () => set({ doc: emptyKpiDocument() }),
}));

function sampleKpiDocument(): KpiDocument {
  return {
    company: "אינטגרייט AI בע\"מ",
    level: "ארגון",
    date: "1 ביוני 2026",
    classification: "חסוי (Confidential)",
    framework: {
      logic:
        "המדדים מאורגנים לפי ארבעת הצירים האסטרטגיים — צמיחה, יעילות תפעולית, נאמנות לקוחות והון אנושי — ונסקרים על ידי ההנהלה.",
      cadence: "סקירה תפעולית חודשית; סקירת הנהלה רבעונית; סקירת דירקטוריון חצי-שנתית.",
    },
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
        thresholds: "🟢 ≥ יעד · 🟡 80%–99% מהיעד · 🔴 < 80% מהיעד",
      },
    ],
    scorecard: [
      {
        kpi: "ARR Growth",
        owner: "CRO",
        baseline: "12%",
        target: "14% (T+1)",
        cadence: "רבעוני",
        status: "🟡",
      },
    ],
    governance:
      "ועדת הנהלה — חודשי — סוקרת ביצועים מול יעדים; סטטוס אדום מפעיל תכנית פעולה כתובה תוך 14 יום.",
  };
}
