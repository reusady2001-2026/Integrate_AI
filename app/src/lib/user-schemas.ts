"use client";

import { create } from "zustand";
import { emptySchema, type Block, type LocalizedText, type UserDocSchema } from "./blocks";
import type { DocDesign } from "./themes/doc-themes";

const STORAGE_KEY = "integrate-ai.user-schemas.v1";
const isBrowser = () => typeof window !== "undefined";

function loadFromStorage(): UserDocSchema[] {
  if (!isBrowser()) return [];
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as UserDocSchema[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeToStorage(list: UserDocSchema[]): void {
  if (!isBrowser()) return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    // ignore quota / serialization errors
  }
}

type State = {
  schemas: UserDocSchema[];
  hydrated: boolean;
  hydrate: () => void;
  createSchema: () => UserDocSchema;
  updateSchema: (id: string, patch: Partial<UserDocSchema>) => void;
  deleteSchema: (id: string) => void;
  duplicateSchema: (id: string) => UserDocSchema | undefined;
  renameSchema: (id: string, name: LocalizedText) => void;
  setBlocks: (id: string, blocks: Block[]) => void;
  setDefaultDesign: (id: string, design: DocDesign) => void;
  getSchema: (id: string) => UserDocSchema | undefined;
  exportJson: () => string;
  importJson: (raw: string) => { added: number; error?: string };
};

export const useUserSchemasStore = create<State>((set, get) => ({
  schemas: [],
  hydrated: false,
  hydrate: () => {
    if (get().hydrated) return;
    set({ schemas: loadFromStorage(), hydrated: true });
  },
  createSchema: () => {
    const s = emptySchema();
    const next = [...get().schemas, s];
    writeToStorage(next);
    set({ schemas: next });
    return s;
  },
  updateSchema: (id, patch) => {
    const next = get().schemas.map((s) =>
      s.id === id ? { ...s, ...patch, updatedAt: Date.now() } : s,
    );
    writeToStorage(next);
    set({ schemas: next });
  },
  deleteSchema: (id) => {
    const next = get().schemas.filter((s) => s.id !== id);
    writeToStorage(next);
    set({ schemas: next });
  },
  duplicateSchema: (id) => {
    const orig = get().schemas.find((s) => s.id === id);
    if (!orig) return undefined;
    const copy: UserDocSchema = JSON.parse(JSON.stringify(orig));
    copy.id = `us_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`;
    copy.createdAt = Date.now();
    copy.updatedAt = Date.now();
    const next = [...get().schemas, copy];
    writeToStorage(next);
    set({ schemas: next });
    return copy;
  },
  renameSchema: (id, name) => {
    get().updateSchema(id, { name });
  },
  setBlocks: (id, blocks) => {
    get().updateSchema(id, { blocks });
  },
  setDefaultDesign: (id, design) => {
    get().updateSchema(id, { defaultDesign: design });
  },
  getSchema: (id) => get().schemas.find((s) => s.id === id),
  exportJson: () => JSON.stringify(get().schemas, null, 2),
  importJson: (raw) => {
    try {
      const parsed = JSON.parse(raw) as UserDocSchema[];
      if (!Array.isArray(parsed)) return { added: 0, error: "not-an-array" };
      const existing = new Set(get().schemas.map((s) => s.id));
      const incoming = parsed
        .filter((s) => s && typeof s.id === "string" && Array.isArray(s.blocks))
        .map((s) => (existing.has(s.id) ? { ...s, id: `${s.id}_imp_${Math.random().toString(36).slice(2, 6)}` } : s));
      const next = [...get().schemas, ...incoming];
      writeToStorage(next);
      set({ schemas: next });
      return { added: incoming.length };
    } catch (e) {
      return { added: 0, error: e instanceof Error ? e.message : "parse-error" };
    }
  },
}));
