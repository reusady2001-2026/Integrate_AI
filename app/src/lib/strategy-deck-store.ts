"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateAnyDoc } from "./translate";
import { emptySlide, type Slide, type SlideLayout, type StrategyDeck } from "./schemas/strategy-deck";

type S = StrategyDeck;
type State = {
  doc: S;
  setField: <K extends keyof S>(key: K, value: S[K]) => void;
  setTheme: (id: string) => void;
  setSlide: (i: number, patch: Partial<Slide>) => void;
  addSlide: (layout?: SlideLayout) => void;
  removeSlide: (i: number) => void;
  setBullet: (si: number, bi: number, v: string) => void;
  addBullet: (si: number) => void;
  removeBullet: (si: number, bi: number) => void;
  loadSample: () => void;
  reset: () => void;
  translate: (from: Lang, to: Lang) => Promise<void>;
};

const emptyDeck = (): StrategyDeck => ({
  company: "",
  horizon: "",
  planTitle: "",
  headlineTarget: "",
  date: "",
  theme: "corporate",
  slides: [emptySlide("cover"), emptySlide("content")],
});

export const useStrategyDeckStore = create<State>((set, get) => ({
  doc: emptyDeck(),
  setField: (k, v) => set((s) => ({ doc: { ...s.doc, [k]: v } })),
  setTheme: (id) => set((s) => ({ doc: { ...s.doc, theme: id } })),
  setSlide: (i, p) =>
    set((s) => ({ doc: { ...s.doc, slides: s.doc.slides.map((sl, idx) => (idx === i ? { ...sl, ...p } : sl)) } })),
  addSlide: (layout = "content") =>
    set((s) => ({ doc: { ...s.doc, slides: [...s.doc.slides, emptySlide(layout)] } })),
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
  reset: () => set({ doc: emptyDeck() }),
  translate: async (from, to) => {
    set({ doc: await translateAnyDoc(get().doc, from, to) });
  },
}));

function sampleDeck(): StrategyDeck {
  return {
    company: "אינטגרייט AI בע\"מ",
    horizon: "2026–2030",
    planTitle: "מהזנקה לבגרות — תכנית 5 שנים",
    headlineTarget: "הכנסות 60M ₪ ב-2030, רווחיות 20%",
    date: "1 ביוני 2026",
    theme: "corporate",
    slides: [
      {
        layout: "cover",
        title: "מהזנקה לבגרות",
        subtitle: "תכנית אסטרטגית 2026–2030",
        bullets: [],
      },
      {
        layout: "content",
        title: "תקציר מנהלים",
        subtitle: "",
        bullets: [
          "אינטגרייט AI נמצאת בנקודת מפנה מ-startup לחברה בשלה.",
          "צמיחה אורגנית של 40% YoY עם ריכוזיות לקוחות גבוהה.",
          "המעבר הנדרש: תהליכים מובנים, מנועי צמיחה מגוונים, מוכנות להנפקה.",
        ],
      },
      {
        layout: "section",
        title: "האבחנה האסטרטגית",
        subtitle: "היכן אנחנו עומדים היום",
        bullets: [],
      },
      {
        layout: "content",
        title: "פערים מרכזיים",
        subtitle: "",
        bullets: [
          "פער 1: תהליכים פנימיים לא מתועדים — סיכון לסקלביליות.",
          "פער 2: ריכוזיות לקוחות — 30% מההכנסות מ-3 לקוחות.",
          "פער 3: תלות בידע מייסדים.",
        ],
      },
      {
        layout: "content",
        title: "צירים אסטרטגיים",
        subtitle: "",
        bullets: [
          "ציר 1: הרחבת פלטפורמה — מ-180 ל-500 לקוחות עד 2028.",
          "ציר 2: תיעוד והטמעה — ISO / SOC2 עד Q2 2027.",
          "ציר 3: גיוון תעשיות — מ-3 ל-7 ענפים עד 2030.",
        ],
      },
      {
        layout: "content",
        title: "יעדים ומדדים",
        subtitle: "",
        bullets: [
          "2027: הכנסות 20M ₪, 250 לקוחות, רווחיות 8%.",
          "2028: הכנסות 30M ₪, 320 לקוחות, רווחיות 12%.",
          "2030: הכנסות 60M ₪, 500 לקוחות, רווחיות 20%.",
        ],
      },
      {
        layout: "quote",
        title: "לגדול בלי לאבד את מה שגרם לנו להצליח.",
        subtitle: "עיקרון ליבה — 2026",
        bullets: [],
      },
    ],
  };
}
