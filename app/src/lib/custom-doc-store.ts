"use client";

import { create } from "zustand";
import { initialValueFor, type Block, type CustomDocValues, type UserDocSchema } from "./blocks";
import { defaultDocDesign, type DocCustomPalette, type DocDesign } from "./themes/doc-themes";

type DocState = {
  values: CustomDocValues;
  design: DocDesign;
};

type State = {
  byId: Record<string, DocState>;

  ensure: (schema: UserDocSchema) => void;
  reset: (schema: UserDocSchema) => void;

  getValue: (schemaId: string, blockId: string) => unknown;
  getDesign: (schemaId: string) => DocDesign;

  setText:       (schemaId: string, blockId: string, value: string) => void;
  setListItem:   (schemaId: string, blockId: string, index: number, value: string) => void;
  addListItem:   (schemaId: string, blockId: string) => void;
  removeListItem:(schemaId: string, blockId: string, index: number) => void;
  setTableCell:  (schemaId: string, blockId: string, rowIndex: number, columnId: string, value: string) => void;
  addTableRow:   (schemaId: string, blockId: string, columnIds: string[]) => void;
  removeTableRow:(schemaId: string, blockId: string, rowIndex: number) => void;
  setGroupField: (schemaId: string, blockId: string, itemIndex: number, fieldId: string, value: string) => void;
  addGroupItem:  (schemaId: string, blockId: string, fieldIds: string[]) => void;
  removeGroupItem:(schemaId: string, blockId: string, itemIndex: number) => void;

  setDocTheme:           (schemaId: string, themeId: string) => void;
  setDocPaletteOverride: (schemaId: string, paletteId: string) => void;
  setDocCustomPalette:   (schemaId: string, patch: Partial<DocCustomPalette>) => void;
  resetDocDesign:        (schemaId: string) => void;
  setDocFormatting:      (schemaId: string, patch: Partial<DocDesign>) => void;
};

function seedValues(blocks: Block[]): CustomDocValues {
  const out: CustomDocValues = {};
  for (const b of blocks) {
    const v = initialValueFor(b);
    if (v !== undefined) out[b.id] = v;
  }
  return out;
}

export const useCustomDocStore = create<State>((set, get) => ({
  byId: {},

  ensure: (schema) => {
    if (get().byId[schema.id]) return;
    set((s) => ({
      byId: {
        ...s.byId,
        [schema.id]: {
          values: seedValues(schema.blocks),
          design: { ...(schema.defaultDesign || defaultDocDesign()) },
        },
      },
    }));
  },

  reset: (schema) => {
    set((s) => ({
      byId: {
        ...s.byId,
        [schema.id]: {
          values: seedValues(schema.blocks),
          design: { ...(schema.defaultDesign || defaultDocDesign()) },
        },
      },
    }));
  },

  getValue: (schemaId, blockId) => get().byId[schemaId]?.values[blockId],
  getDesign: (schemaId) => get().byId[schemaId]?.design ?? defaultDocDesign(),

  setText: (schemaId, blockId, value) =>
    set((s) => updateValues(s, schemaId, (v) => ({ ...v, [blockId]: value }))),

  setListItem: (schemaId, blockId, index, value) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const arr = (v[blockId] as string[] | undefined) ?? [];
      return { ...v, [blockId]: arr.map((x, i) => (i === index ? value : x)) };
    })),
  addListItem: (schemaId, blockId) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const arr = (v[blockId] as string[] | undefined) ?? [];
      return { ...v, [blockId]: [...arr, ""] };
    })),
  removeListItem: (schemaId, blockId, index) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const arr = (v[blockId] as string[] | undefined) ?? [];
      const next = arr.length > 1 ? arr.filter((_, i) => i !== index) : arr;
      return { ...v, [blockId]: next };
    })),

  setTableCell: (schemaId, blockId, rowIndex, columnId, value) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const rows = (v[blockId] as Record<string, string>[] | undefined) ?? [];
      return { ...v, [blockId]: rows.map((r, i) => (i === rowIndex ? { ...r, [columnId]: value } : r)) };
    })),
  addTableRow: (schemaId, blockId, columnIds) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const rows = (v[blockId] as Record<string, string>[] | undefined) ?? [];
      return { ...v, [blockId]: [...rows, Object.fromEntries(columnIds.map((cid) => [cid, ""]))] };
    })),
  removeTableRow: (schemaId, blockId, rowIndex) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const rows = (v[blockId] as Record<string, string>[] | undefined) ?? [];
      const next = rows.length > 1 ? rows.filter((_, i) => i !== rowIndex) : rows;
      return { ...v, [blockId]: next };
    })),

  setGroupField: (schemaId, blockId, itemIndex, fieldId, value) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const items = (v[blockId] as Record<string, string>[] | undefined) ?? [];
      return { ...v, [blockId]: items.map((it, i) => (i === itemIndex ? { ...it, [fieldId]: value } : it)) };
    })),
  addGroupItem: (schemaId, blockId, fieldIds) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const items = (v[blockId] as Record<string, string>[] | undefined) ?? [];
      return { ...v, [blockId]: [...items, Object.fromEntries(fieldIds.map((fid) => [fid, ""]))] };
    })),
  removeGroupItem: (schemaId, blockId, itemIndex) =>
    set((s) => updateValues(s, schemaId, (v) => {
      const items = (v[blockId] as Record<string, string>[] | undefined) ?? [];
      const next = items.length > 1 ? items.filter((_, i) => i !== itemIndex) : items;
      return { ...v, [blockId]: next };
    })),

  setDocTheme: (schemaId, themeId) =>
    set((s) => updateDesign(s, schemaId, (d) => ({ ...d, theme: themeId }))),
  setDocPaletteOverride: (schemaId, paletteId) =>
    set((s) => updateDesign(s, schemaId, (d) => ({ ...d, paletteOverride: paletteId }))),
  setDocCustomPalette: (schemaId, patch) =>
    set((s) => updateDesign(s, schemaId, (d) => ({ ...d, customPalette: { ...d.customPalette, ...patch } }))),
  resetDocDesign: (schemaId) =>
    set((s) => updateDesign(s, schemaId, () => defaultDocDesign())),
  setDocFormatting: (schemaId, patch) =>
    set((s) => updateDesign(s, schemaId, (d) => ({ ...d, ...patch }))),
}));

function updateValues(s: { byId: Record<string, DocState> }, schemaId: string, fn: (v: CustomDocValues) => CustomDocValues) {
  const cur = s.byId[schemaId];
  if (!cur) return { byId: s.byId };
  return { byId: { ...s.byId, [schemaId]: { ...cur, values: fn(cur.values) } } };
}

function updateDesign(s: { byId: Record<string, DocState> }, schemaId: string, fn: (d: DocDesign) => DocDesign) {
  const cur = s.byId[schemaId];
  if (!cur) return { byId: s.byId };
  return { byId: { ...s.byId, [schemaId]: { ...cur, design: fn(cur.design) } } };
}
