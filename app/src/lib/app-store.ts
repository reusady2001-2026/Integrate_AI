"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { defaultFormatting, type Formatting } from "./formatting";

export type Artifact = "kpi" | "job-description";

type AppState = {
  artifact: Artifact;
  lang: Lang;
  translating: boolean;
  formatting: Formatting;
  setArtifact: (a: Artifact) => void;
  setLang: (lang: Lang) => void;
  setTranslating: (v: boolean) => void;
  setFormatting: (patch: Partial<Formatting>) => void;
  resetFormatting: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  artifact: "kpi",
  lang: "he",
  translating: false,
  formatting: defaultFormatting(),
  setArtifact: (artifact) => set({ artifact }),
  setLang: (lang) => set({ lang }),
  setTranslating: (translating) => set({ translating }),
  setFormatting: (patch) => set((s) => ({ formatting: { ...s.formatting, ...patch } })),
  resetFormatting: () => set({ formatting: defaultFormatting() }),
}));
