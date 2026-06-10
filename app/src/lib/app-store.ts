"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { defaultFormatting, type Formatting } from "./formatting";

export type BuiltinArtifact =
  | "kpi"
  | "job-description"
  | "strategy-document"
  | "strategy-deck"
  | "org-structure"
  | "workflow";

export type CustomArtifact = `custom:${string}`;
export type Artifact = BuiltinArtifact | CustomArtifact;

export const BUILTIN_ARTIFACTS: BuiltinArtifact[] = [
  "kpi", "job-description", "strategy-document", "strategy-deck", "org-structure", "workflow",
];

export const isCustomArtifact = (a: string): a is CustomArtifact => a.startsWith("custom:");
export const customSchemaIdFrom = (a: CustomArtifact): string => a.slice("custom:".length);
export const artifactFromSchemaId = (id: string): CustomArtifact => `custom:${id}`;

export type View = "home" | "editor";

type AppState = {
  view: View;
  artifact: Artifact;
  lang: Lang;
  translating: boolean;
  formatting: Formatting;
  /** When an editor session is bound to a project doc, "save" updates that doc. */
  activeProjectDocId: string | null;
  /** When an editor session was started from a project (blank, not yet bound), saving creates a new doc inside this project. */
  currentProjectId: string | null;
  setView: (v: View) => void;
  setArtifact: (a: Artifact) => void;
  openArtifact: (a: Artifact) => void;
  goHome: () => void;
  setLang: (lang: Lang) => void;
  setTranslating: (v: boolean) => void;
  setFormatting: (patch: Partial<Formatting>) => void;
  resetFormatting: () => void;
  clearProjectBinding: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  view: "home",
  artifact: "kpi",
  lang: "he",
  translating: false,
  formatting: defaultFormatting(),
  activeProjectDocId: null,
  currentProjectId: null,
  setView: (view) => set({ view }),
  setArtifact: (artifact) => set({ artifact }),
  openArtifact: (artifact) => set({ artifact, view: "editor", activeProjectDocId: null, currentProjectId: null }),
  goHome: () => set({ view: "home", activeProjectDocId: null, currentProjectId: null }),
  setLang: (lang) => set({ lang }),
  setTranslating: (translating) => set({ translating }),
  setFormatting: (patch) => set((s) => ({ formatting: { ...s.formatting, ...patch } })),
  resetFormatting: () => set({ formatting: defaultFormatting() }),
  clearProjectBinding: () => set({ activeProjectDocId: null, currentProjectId: null }),
}));
