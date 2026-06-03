"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateAnyDoc } from "./translate";
import { emptySlide, emptyStrategyDeck, type Slide, type StrategyDeck } from "./schemas/strategy-deck";

type S = StrategyDeck;
type State = {
  doc: S;
  setField: <K extends keyof S>(key: K, value: S[K]) => void;
  setSlide: (i: number, patch: Partial<Slide>) => void;
  addSlide: () => void;
  removeSlide: (i: number) => void;
  setBullet: (si: number, bi: number, v: string) => void;
  addBullet: (si: number) => void;
  removeBullet: (si: number, bi: number) => void;
  loadSample: () => void;
  reset: () => void;
  translate: (from: Lang, to: Lang) => Promise<void>;
};

export const useStrategyDeckStore = create<State>((set, get) => ({
  doc: emptyStrategyDeck(),
  setField: (k, v) => set((s) => ({ doc: { ...s.doc, [k]: v } })),
  setSlide: (i, p) =>
    set((s) => ({ doc: { ...s.doc, slides: s.doc.slides.map((sl, idx) => (idx === i ? { ...sl, ...p } : sl)) } })),
  addSlide: () => set((s) => ({ doc: { ...s.doc, slides: [...s.doc.slides, emptySlide()] } })),
  removeSlide: (i) =>
    set((s) => ({ doc: { ...s.doc, slides: s.doc.slides.length > 1 ? s.doc.slides.filter((_, idx) => idx !== i) : s.doc.slides } })),
  setBullet: (si, bi, v) =>
    set((s) => ({
      doc: {
        ...s.doc,
        slides: s.doc.slides.map((sl, i) =>
          i === si ? { ...sl, bullets: sl.bullets.map((b, j) => (j === bi ? v : b)) } : sl,
        ),
      },
    })),
  addBullet: (si) =>
    set((s) => ({
      doc: {
        ...s.doc,
        slides: s.doc.slides.map((sl, i) => (i === si ? { ...sl, bullets: [...sl.bullets, ""] } : sl)),
      },
    })),
  removeBullet: (si, bi) =>
    set((s) => ({
      doc: {
        ...s.doc,
        slides: s.doc.slides.map((sl, i) =>
          i === si ? { ...sl, bullets: sl.bullets.length > 1 ? sl.bullets.filter((_, j) => j !== bi) : sl.bullets } : sl,
        ),
      },
    })),
  loadSample: () => set({ doc: sampleDeck() }),
  reset: () => set({ doc: emptyStrategyDeck() }),
  translate: async (from, to) => {
    set({ doc: await translateAnyDoc(get().doc, from, to) });
  },
}));

function sampleDeck(): StrategyDeck {
  return {
    company: "אינטגרייט AI בע\"מ",
    horizon: "2026–2030",
    planTitle: "מהזנקה לבגרות — תכנית 5 שנים",
    headlineTarget: "הכנסות 60M ₪ ב-2030, רווחיות תפעולית 20%",
    date: "1 ביוני 2026",
    slides: [
      {
        title: "תקציר מנהלים",
        bullets: [
          "אינטגרייט AI נמצאת בנקודת מפנה מ-startup לחברה בשלה.",
          "צמיחה אורגנית של 40% YoY עם ריכוזיות לקוחות גבוהה.",
          "המעבר הנדרש: תהליכים מובנים, מנועי צמיחה מגוונים, מוכנות להנפקה.",
        ],
      },
      {
        title: "האבחנה האסטרטגית",
        bullets: [
          "פער 1: תהליכים פנימיים לא מתועדים — סיכון לסקלביליות.",
          "פער 2: ריכוזיות לקוחות 30% מההכנסות מ-3 לקוחות.",
          "פער 3: תלות בידע מייסדים.",
        ],
      },
      {
        title: "צירים אסטרטגיים",
        bullets: [
          "ציר 1: הרחבת פלטפורמה — מ-180 ל-500 לקוחות.",
          "ציר 2: תיעוד והטמעה — BSI/SOC2.",
          "ציר 3: גיוון תעשיות — מעבר מ-3 ל-7 ענפים.",
        ],
      },
      {
        title: "יעדים ומדדים",
        bullets: [
          "2028: הכנסות 30M ₪, 320 לקוחות, רווחיות 12%.",
          "2030: הכנסות 60M ₪, 500 לקוחות, רווחיות 20%.",
          "מוכנות להנפקה: Q4 2028.",
        ],
      },
    ],
  };
}
