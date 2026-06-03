"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateAnyDoc } from "./translate";
import {
  defaultDeckFormatting,
  emptyCustomPalette,
  emptySlide,
  type CustomPalette,
  type DeckFormatting,
  type Slide,
  type SlideLayout,
  type StrategyDeck,
} from "./schemas/strategy-deck";
import { sampleStraussDeck } from "./samples/strauss-deck";

type S = StrategyDeck;
type State = {
  doc: S;
  setField: <K extends keyof S>(key: K, value: S[K]) => void;
  setTheme: (id: string) => void;
  setPaletteOverride: (id: string) => void;
  setCustomPalette: (patch: Partial<CustomPalette>) => void;
  resetCustomPalette: () => void;
  setFormatting: (patch: Partial<DeckFormatting>) => void;
  resetFormatting: () => void;
  setSlide: (i: number, patch: Partial<Slide>) => void;
  addSlide: (layout?: SlideLayout) => void;
  insertSlide: (after: number, layout?: SlideLayout) => void;
  duplicateSlide: (i: number) => void;
  removeSlide: (i: number) => void;
  moveSlide: (from: number, to: number) => void;
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
  theme: "navy-classic",
  paletteOverride: "",
  customPalette: emptyCustomPalette(),
  formatting: defaultDeckFormatting(),
  slides: [
    emptySlide("cover"),
    { ...emptySlide("content"), title: "תקציר מנהלים" },
    { ...emptySlide("content"), title: "מי אנחנו" },
    { ...emptySlide("content"), title: "האבחנה האסטרטגית" },
    { ...emptySlide("content"), title: "עקרון הוויתורים" },
    { ...emptySlide("content"), title: "מנועי הצמיחה" },
    { ...emptySlide("content"), title: "ניהול בסיס התזרים" },
    { ...emptySlide("content"), title: "עדיפויות שנה ראשונה" },
    { ...emptySlide("content"), title: "יעדים ו-KPIs" },
    { ...emptySlide("content"), title: "ניהול סיכונים" },
    { ...emptySlide("content"), title: "סיכום" },
  ],
});

export const useStrategyDeckStore = create<State>((set, get) => ({
  doc: emptyDeck(),
  setField: (k, v) => set((s) => ({ doc: { ...s.doc, [k]: v } })),
  setTheme: (id) => set((s) => ({ doc: { ...s.doc, theme: id } })),
  setPaletteOverride: (id) => set((s) => ({ doc: { ...s.doc, paletteOverride: id } })),
  setCustomPalette: (patch) =>
    set((s) => ({ doc: { ...s.doc, customPalette: { ...s.doc.customPalette, ...patch } } })),
  resetCustomPalette: () =>
    set((s) => ({ doc: { ...s.doc, paletteOverride: "", customPalette: emptyCustomPalette() } })),
  setFormatting: (patch) =>
    set((s) => ({ doc: { ...s.doc, formatting: { ...s.doc.formatting, ...patch } } })),
  resetFormatting: () =>
    set((s) => ({ doc: { ...s.doc, formatting: defaultDeckFormatting() } })),
  setSlide: (i, p) =>
    set((s) => ({ doc: { ...s.doc, slides: s.doc.slides.map((sl, idx) => (idx === i ? { ...sl, ...p } : sl)) } })),
  addSlide: (layout = "content") =>
    set((s) => ({ doc: { ...s.doc, slides: [...s.doc.slides, emptySlide(layout)] } })),
  insertSlide: (after, layout = "content") =>
    set((s) => {
      const next = [...s.doc.slides];
      next.splice(after + 1, 0, emptySlide(layout));
      return { doc: { ...s.doc, slides: next } };
    }),
  duplicateSlide: (i) =>
    set((s) => {
      const next = [...s.doc.slides];
      const copy = JSON.parse(JSON.stringify(s.doc.slides[i])) as Slide;
      next.splice(i + 1, 0, copy);
      return { doc: { ...s.doc, slides: next } };
    }),
  removeSlide: (i) =>
    set((s) => ({ doc: { ...s.doc, slides: s.doc.slides.length > 1 ? s.doc.slides.filter((_, idx) => idx !== i) : s.doc.slides } })),
  moveSlide: (from, to) =>
    set((s) => {
      if (from === to || from < 0 || to < 0 || from >= s.doc.slides.length || to >= s.doc.slides.length) {
        return { doc: s.doc };
      }
      const next = [...s.doc.slides];
      const [moved] = next.splice(from, 1);
      next.splice(to, 0, moved);
      return { doc: { ...s.doc, slides: next } };
    }),
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
  loadSample: () => set({ doc: sampleStraussDeck() }),
  reset: () => set({ doc: emptyDeck() }),
  translate: async (from, to) => {
    set({ doc: await translateAnyDoc(get().doc, from, to) });
  },
}));
