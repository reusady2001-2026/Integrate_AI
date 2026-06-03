"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateAnyDoc } from "./translate";
import { emptyRaciRow, emptyStep, emptyWorkflow, type RaciRow, type Step, type Workflow } from "./schemas/workflow";

type S = Workflow;
type State = {
  doc: S;
  setField: <K extends keyof S>(key: K, value: S[K]) => void;
  setInput: (i: number, v: string) => void;
  addInput: () => void;
  removeInput: (i: number) => void;
  setOutput: (i: number, v: string) => void;
  addOutput: () => void;
  removeOutput: (i: number) => void;
  setStep: (i: number, patch: Partial<Step>) => void;
  addStep: () => void;
  removeStep: (i: number) => void;
  setRaci: (i: number, patch: Partial<RaciRow>) => void;
  addRaci: () => void;
  removeRaci: (i: number) => void;
  loadSample: () => void;
  reset: () => void;
  translate: (from: Lang, to: Lang) => Promise<void>;
};

const setRow = <T,>(arr: T[], i: number, p: Partial<T>): T[] => arr.map((r, idx) => (idx === i ? { ...r, ...p } : r));
const removeAt = <T,>(arr: T[], i: number): T[] => (arr.length > 1 ? arr.filter((_, idx) => idx !== i) : arr);

export const useWorkflowStore = create<State>((set, get) => ({
  doc: emptyWorkflow(),
  setField: (k, v) => set((s) => ({ doc: { ...s.doc, [k]: v } })),
  setInput: (i, v) => set((s) => ({ doc: { ...s.doc, inputs: s.doc.inputs.map((x, idx) => idx === i ? v : x) } })),
  addInput: () => set((s) => ({ doc: { ...s.doc, inputs: [...s.doc.inputs, ""] } })),
  removeInput: (i) => set((s) => ({ doc: { ...s.doc, inputs: removeAt(s.doc.inputs, i) } })),
  setOutput: (i, v) => set((s) => ({ doc: { ...s.doc, outputs: s.doc.outputs.map((x, idx) => idx === i ? v : x) } })),
  addOutput: () => set((s) => ({ doc: { ...s.doc, outputs: [...s.doc.outputs, ""] } })),
  removeOutput: (i) => set((s) => ({ doc: { ...s.doc, outputs: removeAt(s.doc.outputs, i) } })),
  setStep: (i, p) => set((s) => ({ doc: { ...s.doc, steps: setRow(s.doc.steps, i, p) } })),
  addStep: () => set((s) => ({ doc: { ...s.doc, steps: [...s.doc.steps, emptyStep()] } })),
  removeStep: (i) => set((s) => ({ doc: { ...s.doc, steps: removeAt(s.doc.steps, i) } })),
  setRaci: (i, p) => set((s) => ({ doc: { ...s.doc, raci: setRow(s.doc.raci, i, p) } })),
  addRaci: () => set((s) => ({ doc: { ...s.doc, raci: [...s.doc.raci, emptyRaciRow()] } })),
  removeRaci: (i) => set((s) => ({ doc: { ...s.doc, raci: removeAt(s.doc.raci, i) } })),
  loadSample: () => set({ doc: sampleWorkflow() }),
  reset: () => set({ doc: emptyWorkflow() }),
  translate: async (from, to) => {
    set({ doc: await translateAnyDoc(get().doc, from, to) });
  },
}));

function sampleWorkflow(): Workflow {
  return {
    name: "סגירה חודשית של דוחות כספיים",
    owner: "סמנכ\"ל כספים",
    purpose: "להפיק דוחות כספיים מדויקים ומאושרים תוך 5 ימי עסקים מסוף החודש.",
    scope: "כל יחידות החברה; חל על דוחות פנימיים והנהלה (לא כולל דוחות לרגולטור).",
    trigger: "סוף חודש קלנדרי.",
    frequency: "חודשי",
    version: "v2.1 — 1 ביוני 2026",
    inputs: [
      "דוחות בנק וכרטיסי אשראי",
      "דוחות תפעוליים מהיחידות",
      "חשבוניות ותשלומים",
    ],
    outputs: [
      "דוח רווח והפסד חודשי",
      "דוח תזרים מזומנים",
      "מאזן בוחן",
    ],
    steps: [
      { what: "איסוף דוחות בנק וסגירת חשבונות", who: "מנהל כספים", output: "טבלת תנועות מאושרת" },
      { what: "התאמות בנקים והעברות פנימיות", who: "מנהל כספים", output: "התאמות מאושרות" },
      { what: "סקירת הוצאות והכרה בהכנסות", who: "סמנכ\"ל כספים", output: "דוח טיוטה" },
      { what: "אישור דוחות והפצה להנהלה", who: "מנכ\"ל + סמנכ\"ל כספים", output: "דוחות מאושרים" },
    ],
    raci: [
      { activity: "איסוף נתונים", r: "מנהל כספים", a: "סמנכ\"ל כספים", c: "מנהלי יחידות", i: "מנכ\"ל" },
      { activity: "סקירה ואישור", r: "סמנכ\"ל כספים", a: "מנכ\"ל", c: "רו\"ח חיצוני", i: "דירקטוריון" },
    ],
    controls: "סקירת 4 עיניים על כל הזנת נתונים מעל 100K ₪. הסלמה למנכ\"ל על חריגות מעל 5% מתחזית. אישור דירקטוריון על חריגה מעל 10%.",
  };
}
