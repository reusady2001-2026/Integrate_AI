"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { defaultFormatting, type Formatting } from "./formatting";

export type Artifact =
  | "kpi"
  | "job-description"
  | "strategy-document"
  | "strategy-deck"
  | "org-structure"
  | "workflow";

export type View = "home" | "editor";

type AppState = {
  view: View;
  artifact: Artifact;
  lang: Lang;
  translating: boolean;
  formatting: Formatting;
  setView: (v: View) => void;
  setArtifact: (a: Artifact) => void;
  openArtifact: (a: Artifact) => void;
  goHome: () => void;
  setLang: (lang: Lang) => void;
  setTranslating: (v: boolean) => void;
  setFormatting: (patch: Partial<Formatting>) => void;
  resetFormatting: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  artifact: "kpi",
  lang: "he",
  translating: false,
  formatting: defaultFormatting(),
  setView: (view) => set({ view }),
  setArtifact: (artifact) => set({ artifact }),
  openArtifact: (artifact) => set({ artifact, view: "editor" }),
  goHome: () => set({ view: "home" }),
  setLang: (lang) => set({ lang }),
  setTranslating: (translating) => set({ translating }),
  setFormatting: (patch) => set((s) => ({ formatting: { ...s.formatting, ...patch } })),
  resetFormatting: () => set({ formatting: defaultFormatting() }),
}));
