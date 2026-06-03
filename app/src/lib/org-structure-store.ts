"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateAnyDoc } from "./translate";
import {
  emptyAuthorityRow, emptyDivision, emptyGovernanceRow, emptyOrgStructure,
  type AuthorityRow, type Division, type GovernanceRow, type OrgStructure,
} from "./schemas/org-structure";
import { sampleStraussOrg } from "./samples/strauss-samples";

type S = OrgStructure;
type State = {
  doc: S;
  setField: <K extends keyof S>(key: K, value: S[K]) => void;
  setPrinciple: (i: number, v: string) => void;
  addPrinciple: () => void;
  removePrinciple: (i: number) => void;
  setGovernance: (i: number, patch: Partial<GovernanceRow>) => void;
  addGovernance: () => void;
  removeGovernance: (i: number) => void;
  setDivision: (i: number, patch: Partial<Division>) => void;
  addDivision: () => void;
  removeDivision: (i: number) => void;
  setAuthority: (i: number, patch: Partial<AuthorityRow>) => void;
  addAuthority: () => void;
  removeAuthority: (i: number) => void;
  loadSample: () => void;
  reset: () => void;
  translate: (from: Lang, to: Lang) => Promise<void>;
};

const setRow = <T,>(arr: T[], i: number, p: Partial<T>): T[] => arr.map((r, idx) => (idx === i ? { ...r, ...p } : r));
const removeAt = <T,>(arr: T[], i: number): T[] => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr);

export const useOrgStructureStore = create<State>((set, get) => ({
  doc: emptyOrgStructure(),
  setField: (k, v) => set((s) => ({ doc: { ...s.doc, [k]: v } })),
  setPrinciple: (i, v) => set((s) => ({ doc: { ...s.doc, principles: s.doc.principles.map((p, idx) => idx === i ? v : p) } })),
  addPrinciple: () => set((s) => ({ doc: { ...s.doc, principles: [...s.doc.principles, ""] } })),
  removePrinciple: (i) => set((s) => ({ doc: { ...s.doc, principles: removeAt(s.doc.principles, i) } })),
  setGovernance: (i, p) => set((s) => ({ doc: { ...s.doc, governance: setRow(s.doc.governance, i, p) } })),
  addGovernance: () => set((s) => ({ doc: { ...s.doc, governance: [...s.doc.governance, emptyGovernanceRow()] } })),
  removeGovernance: (i) => set((s) => ({ doc: { ...s.doc, governance: removeAt(s.doc.governance, i) } })),
  setDivision: (i, p) => set((s) => ({ doc: { ...s.doc, divisions: setRow(s.doc.divisions, i, p) } })),
  addDivision: () => set((s) => ({ doc: { ...s.doc, divisions: [...s.doc.divisions, emptyDivision()] } })),
  removeDivision: (i) => set((s) => ({ doc: { ...s.doc, divisions: removeAt(s.doc.divisions, i) } })),
  setAuthority: (i, p) => set((s) => ({ doc: { ...s.doc, authority: setRow(s.doc.authority, i, p) } })),
  addAuthority: () => set((s) => ({ doc: { ...s.doc, authority: [...s.doc.authority, emptyAuthorityRow()] } })),
  removeAuthority: (i) => set((s) => ({ doc: { ...s.doc, authority: removeAt(s.doc.authority, i) } })),
  loadSample: () => set({ doc: sampleStraussOrg() }),
  reset: () => set({ doc: emptyOrgStructure() }),
  translate: async (from, to) => {
    set({ doc: await translateAnyDoc(get().doc, from, to) });
  },
}));

function sampleOrg(): OrgStructure {
  return {
    company: "אינטגרייט AI בע\"מ",
    date: "1 ביוני 2026",
    principles: [
      "הפרדה בין מנועי צמיחה (פלטפורמה חדשה) לבסיס התזרים (לקוחות קיימים).",
      "מטה רזה — סמנכ\"לים בודדים עם מנדט רחב.",
      "אחריות חד-משמעית: בעלים יחיד לכל תחום.",
    ],
    governance: [
      { body: "דירקטוריון", mandate: "פיקוח אסטרטגי, אישור תקציב והון.", composition: "5 חברים: יו\"ר, 2 חיצוניים, 2 נציגי בעלי שליטה." },
      { body: "ועדת ביקורת", mandate: "פיקוח על דוחות כספיים וניהול סיכונים.", composition: "3 חברים, רוב דירקטורים חיצוניים." },
    ],
    chart: "מנכ\"ל\n  סמנכ\"ל מוצר\n    ראש פיתוח\n    ראש UX\n  סמנכ\"ל הכנסות\n    ראש מכירות\n    ראש שיווק\n  סמנכ\"ל כספים ותפעול\n    מנהל כספים\n    מנהל תפעול",
    divisions: [
      { name: "חטיבת מוצר", head: "סמנכ\"ל מוצר", scope: "פיתוח פלטפורמה, חוויית משתמש, ארכיטקטורת ענן.", kpis: "Time-to-market < 6 שבועות, NPS > 50" },
      { name: "חטיבת הכנסות", head: "סמנכ\"ל הכנסות", scope: "מכירות, שיווק, הצלחת לקוח.", kpis: "ARR Growth 40% YoY, churn < 5%" },
    ],
    authority: [
      { decision: "אישור תקציב שנתי", decides: "דירקטוריון", recommends: "מנכ\"ל + סמנכ\"ל כספים", executes: "סמנכ\"ל כספים" },
      { decision: "גיוס בכירים (סמנכ\"לים)", decides: "מנכ\"ל", recommends: "ועדת מינויים", executes: "מנהלת HR" },
    ],
  };
}
