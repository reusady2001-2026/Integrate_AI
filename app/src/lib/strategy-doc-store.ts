"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateAnyDoc } from "./translate";
import {
  emptyBaseRow, emptyEngine, emptyFinanceRow, emptyPortfolioRow, emptyRiskRow,
  emptyStrategyDocument,
  type BaseRow, type FinanceRow, type GrowthEngine, type PortfolioRow, type RiskRow,
  type StrategyDocument,
} from "./schemas/strategy-document";
import { sampleStraussStrategy } from "./samples/strauss-samples";
import { defaultDocDesign, emptyDocCustomPalette, type DocCustomPalette, type DocDesign } from "./themes/doc-themes";

type S = StrategyDocument;
type State = {
  doc: S;
  design: DocDesign;
  setField: <K extends keyof S>(key: K, value: S[K]) => void;
  setPortfolio: (i: number, patch: Partial<PortfolioRow>) => void;
  addPortfolio: () => void;
  removePortfolio: (i: number) => void;
  setFinance: (i: number, patch: Partial<FinanceRow>) => void;
  addFinance: () => void;
  removeFinance: (i: number) => void;
  setChallenge: (i: number, v: string) => void;
  addChallenge: () => void;
  removeChallenge: (i: number) => void;
  setWillDo: (i: number, v: string) => void;
  addWillDo: () => void;
  removeWillDo: (i: number) => void;
  setWontDo: (i: number, v: string) => void;
  addWontDo: () => void;
  removeWontDo: (i: number) => void;
  setEngine: (i: number, patch: Partial<GrowthEngine>) => void;
  addEngine: () => void;
  removeEngine: (i: number) => void;
  setBase: (i: number, patch: Partial<BaseRow>) => void;
  addBase: () => void;
  removeBase: (i: number) => void;
  setRisk: (i: number, patch: Partial<RiskRow>) => void;
  addRisk: () => void;
  removeRisk: (i: number) => void;
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

export const useStrategyDocStore = create<State>((set, get) => ({
  doc: emptyStrategyDocument(),
  design: defaultDocDesign(),

  setDocTheme: (id) => set((s) => ({ design: { ...s.design, theme: id } })),
  setDocPaletteOverride: (id) => set((s) => ({ design: { ...s.design, paletteOverride: id } })),
  setDocCustomPalette: (patch) => set((s) => ({ design: { ...s.design, customPalette: { ...s.design.customPalette, ...patch } } })),
  resetDocDesign: () => set({ design: defaultDocDesign() }),
  setDocFormatting: (patch) => set((s) => ({ design: { ...s.design, ...patch } })),

  setField: (key, value) => set((s) => ({ doc: { ...s.doc, [key]: value } })),
  setPortfolio: (i, p) => set((s) => ({ doc: { ...s.doc, portfolio: setRow(s.doc.portfolio, i, p) } })),
  addPortfolio: () => set((s) => ({ doc: { ...s.doc, portfolio: [...s.doc.portfolio, emptyPortfolioRow()] } })),
  removePortfolio: (i) => set((s) => ({ doc: { ...s.doc, portfolio: removeAt(s.doc.portfolio, i) } })),
  setFinance: (i, p) => set((s) => ({ doc: { ...s.doc, finance: setRow(s.doc.finance, i, p) } })),
  addFinance: () => set((s) => ({ doc: { ...s.doc, finance: [...s.doc.finance, emptyFinanceRow()] } })),
  removeFinance: (i) => set((s) => ({ doc: { ...s.doc, finance: removeAt(s.doc.finance, i) } })),
  setChallenge: (i, v) => set((s) => ({ doc: { ...s.doc, challenges: s.doc.challenges.map((c, idx) => idx === i ? v : c) } })),
  addChallenge: () => set((s) => ({ doc: { ...s.doc, challenges: [...s.doc.challenges, ""] } })),
  removeChallenge: (i) => set((s) => ({ doc: { ...s.doc, challenges: removeAt(s.doc.challenges, i) } })),
  setWillDo: (i, v) => set((s) => ({ doc: { ...s.doc, willDo: s.doc.willDo.map((c, idx) => idx === i ? v : c) } })),
  addWillDo: () => set((s) => ({ doc: { ...s.doc, willDo: [...s.doc.willDo, ""] } })),
  removeWillDo: (i) => set((s) => ({ doc: { ...s.doc, willDo: removeAt(s.doc.willDo, i) } })),
  setWontDo: (i, v) => set((s) => ({ doc: { ...s.doc, wontDo: s.doc.wontDo.map((c, idx) => idx === i ? v : c) } })),
  addWontDo: () => set((s) => ({ doc: { ...s.doc, wontDo: [...s.doc.wontDo, ""] } })),
  removeWontDo: (i) => set((s) => ({ doc: { ...s.doc, wontDo: removeAt(s.doc.wontDo, i) } })),
  setEngine: (i, p) => set((s) => ({ doc: { ...s.doc, engines: setRow(s.doc.engines, i, p) } })),
  addEngine: () => set((s) => ({ doc: { ...s.doc, engines: [...s.doc.engines, emptyEngine()] } })),
  removeEngine: (i) => set((s) => ({ doc: { ...s.doc, engines: removeAt(s.doc.engines, i) } })),
  setBase: (i, p) => set((s) => ({ doc: { ...s.doc, base: setRow(s.doc.base, i, p) } })),
  addBase: () => set((s) => ({ doc: { ...s.doc, base: [...s.doc.base, emptyBaseRow()] } })),
  removeBase: (i) => set((s) => ({ doc: { ...s.doc, base: removeAt(s.doc.base, i) } })),
  setRisk: (i, p) => set((s) => ({ doc: { ...s.doc, risks: setRow(s.doc.risks, i, p) } })),
  addRisk: () => set((s) => ({ doc: { ...s.doc, risks: [...s.doc.risks, emptyRiskRow()] } })),
  removeRisk: (i) => set((s) => ({ doc: { ...s.doc, risks: removeAt(s.doc.risks, i) } })),
  loadSample: () => set({ doc: sampleStraussStrategy() }),
  reset: () => set({ doc: emptyStrategyDocument() }),
  translate: async (from, to) => {
    const translated = await translateAnyDoc(get().doc, from, to);
    set({ doc: translated });
  },
}));

function sampleStrategy(): StrategyDocument {
  return {
    company: "אינטגרייט AI בע\"מ",
    docType: "אסטרטגיה ממוקדת",
    horizon: "2026–2030",
    date: "1 ביוני 2026",
    founding: "נוסדה ב-2024 כחברת תוכנה לארגון ותכנון אסטרטגי, פעילות בישראל ובחו\"ל.",
    ownership: "בעלי השליטה: יזמים-מייסדים (60%), קרן צמיחה (30%), עובדים (10%).",
    listing: "פרטית; שוקלת הנפקה ב-2028.",
    rating: "טרם דורגה.",
    officers: "יו\"ר: יובל ב.; מנכ\"ל: דנה כ.; סמנכ\"ל כספים: רן א.",
    portfolio: [
      { segment: "פלטפורמת תוכנה", scale: "180 לקוחות עסקיים", value: "—", noi: "12M ₪/שנה", occupancy: "—", notes: "צמיחה 40% YoY" },
    ],
    finance: [
      { metric: "סך הכנסות", value: "12M ₪", note: "+40% YoY, צמיחה אורגנית" },
      { metric: "NOI", value: "3M ₪", note: "+25% YoY" },
      { metric: "הון עצמי", value: "20M ₪", note: "—" },
    ],
    challenges: [
      "ריכוזיות לקוחות: 30% מההכנסות מ-3 לקוחות.",
      "תלות במייסדים: ידע קריטי לא מתועד.",
    ],
    thesis: "מעבר מ-startup בשלב מוקדם לחברת תוכנה בשלה עם תהליכי עבודה מובנים, מנועי צמיחה מגוונים ובסיס לקוחות רחב.",
    willDo: [
      "להשקיע בתיעוד תהליכים ובניית BSI/SOC2.",
      "להרחיב את בסיס הלקוחות מ-180 ל-500 בתוך 3 שנים.",
    ],
    wontDo: [
      "לא ניכנס לשווקים גאוגרפיים חדשים לפני 2028.",
      "לא נרכוש חברות אחרות עד לאחר ההנפקה.",
    ],
    engines: [
      {
        name: "הרחבת פלטפורמה",
        opportunity: "ביקוש גובר ל-AI ארגוני בישראל ובאירופה.",
        landscape: "Anthropic, OpenAI, Cohere ברמה גלובלית; מתחרים מקומיים: AI21 Labs.",
        model: "SaaS חודשי + שירותי הטמעה.",
        entryPath: "ניצול לקוחות קיימים להרחבה אזורית.",
      },
    ],
    base: [
      { segment: "פלטפורמת תוכנה", status: "צמיחה", risk: "ריכוזיות לקוחות", action: "תכנית הרחבת בסיס לקוחות וגיוון תעשיות." },
    ],
    risks: [
      { risk: "תלות בלקוחות מובילים", response: "פיזור פעיל וחוזים ארוכי-טווח", owner: "מנכ\"ל" },
      { risk: "תחרות גלובלית", response: "התמחות בשוק הישראלי והאירופי", owner: "סמנכ\"ל אסטרטגיה" },
    ],
    summary: "המעבר הנדרש: מ-startup צומח לחברה בשלה עם תהליכים מובנים, מוכנה להנפקה ב-2028.",
  };
}
