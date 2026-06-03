"use client";

import { create } from "zustand";
import { defaultDocDesign, type DocDesign } from "./themes/doc-themes";

export type LocalizedLabel = { he?: string; en?: string };

export type UserDesignPreset = {
  id: string;
  name: LocalizedLabel;
  design: DocDesign;
};

const STORAGE_KEY = "integrate-ai.user-designs.v1";

const isBrowser = () => typeof window !== "undefined";

function loadFromStorage(): UserDesignPreset[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserDesignPreset[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(list: UserDesignPreset[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / serialization errors
  }
}

export const labelText = (label: LocalizedLabel, lang: string): string =>
  (lang === "he" ? label.he || label.en : label.en || label.he) || "";

type State = {
  presets: UserDesignPreset[];
  hydrated: boolean;
  hydrate: () => void;
  addPreset: (name: LocalizedLabel, design: DocDesign) => string;
  removePreset: (id: string) => void;
  renamePreset: (id: string, name: LocalizedLabel) => void;
  exportJson: () => string;
  importJson: (raw: string) => { added: number; error?: string };
};

export const useUserDesignsStore = create<State>((set, get) => ({
  presets: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ presets: loadFromStorage(), hydrated: true });
  },
  addPreset: (name, design) => {
    const id = `ud_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
    const preset: UserDesignPreset = {
      id,
      name,
      design: { ...defaultDocDesign(), ...design, customPalette: { ...design.customPalette } },
    };
    const next = [...get().presets, preset];
    writeToStorage(next);
    set({ presets: next });
    return id;
  },
  removePreset: (id) => {
    const next = get().presets.filter((p) => p.id !== id);
    writeToStorage(next);
    set({ presets: next });
  },
  renamePreset: (id, name) => {
    const next = get().presets.map((p) => (p.id === id ? { ...p, name } : p));
    writeToStorage(next);
    set({ presets: next });
  },
  exportJson: () => JSON.stringify(get().presets, null, 2),
  importJson: (raw) => {
    try {
      const parsed = JSON.parse(raw) as UserDesignPreset[];
      if (!Array.isArray(parsed)) return { added: 0, error: "not-an-array" };
      const existingIds = new Set(get().presets.map((p) => p.id));
      const incoming = parsed
        .filter((p) => p && typeof p.id === "string" && p.design && typeof p.design === "object")
        .map((p) => (existingIds.has(p.id) ? { ...p, id: `${p.id}_imp_${Math.random().toString(36).slice(2, 6)}` } : p));
      const next = [...get().presets, ...incoming];
      writeToStorage(next);
      set({ presets: next });
      return { added: incoming.length };
    } catch (e) {
      return { added: 0, error: e instanceof Error ? e.message : "parse-error" };
    }
  },
}));
