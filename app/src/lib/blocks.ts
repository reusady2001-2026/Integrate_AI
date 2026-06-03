/**
 * Block library — the lexicon of building blocks the user can compose into
 * a custom document schema. Mirrors the patterns used by the hardcoded
 * built-in templates (kpis, workflow, org-structure, strategy-document,
 * job-description) so any built-in document could in principle be
 * re-expressed as a block schema.
 *
 * Group nesting is intentionally one level deep — a group may contain
 * simple fields (field/longText/list) but not another group. All existing
 * templates fit this model.
 */

import type { DocDesign } from "./themes/doc-themes";
import { defaultDocDesign } from "./themes/doc-themes";

export type LocalizedText = { he?: string; en?: string };

export const localizedText = (t: LocalizedText | undefined, lang: string): string => {
  if (!t) return "";
  return (lang === "he" ? t.he || t.en : t.en || t.he) || "";
};

export type BlockId = string;

interface BaseBlock { id: BlockId }

export interface TitleBlock extends BaseBlock {
  type: "title";
  text: LocalizedText;
}

export interface HeadingBlock extends BaseBlock {
  type: "heading";
  level: 2 | 3;
  text: LocalizedText;
}

export interface GuidanceBlock extends BaseBlock {
  type: "guidance";
  text: LocalizedText;
}

export interface NoteBlock extends BaseBlock {
  type: "note";
  text: LocalizedText;
}

export interface FieldBlock extends BaseBlock {
  type: "field";
  label: LocalizedText;
  hint?: LocalizedText;
  inline?: boolean;
}

export interface LongTextBlock extends BaseBlock {
  type: "longText";
  label?: LocalizedText;
  hint?: LocalizedText;
}

export interface ListBlock extends BaseBlock {
  type: "list";
  label?: LocalizedText;
  hint?: LocalizedText;
  ordered?: boolean;
}

export interface GroupBlock extends BaseBlock {
  type: "group";
  label?: LocalizedText;
  hint?: LocalizedText;
  itemLabel?: LocalizedText;
  fields: SimpleBlock[];
}

export interface TableColumn {
  id: string;
  label: LocalizedText;
}

export interface TableBlock extends BaseBlock {
  type: "table";
  label?: LocalizedText;
  hint?: LocalizedText;
  columns: TableColumn[];
}

export interface DividerBlock extends BaseBlock {
  type: "divider";
}

export type SimpleBlock = FieldBlock | LongTextBlock | ListBlock;

export type Block =
  | TitleBlock
  | HeadingBlock
  | GuidanceBlock
  | NoteBlock
  | FieldBlock
  | LongTextBlock
  | ListBlock
  | GroupBlock
  | TableBlock
  | DividerBlock;

export type BlockType = Block["type"];

export type SimpleBlockType = SimpleBlock["type"];

export interface UserDocSchema {
  id: string;
  name: LocalizedText;
  description?: LocalizedText;
  blocks: Block[];
  defaultDesign: DocDesign;
  createdAt: number;
  updatedAt: number;
}

// ─── Values stored per instance of a filled custom document ──────────

export type BlockValue =
  | string
  | string[]
  | Record<string, string>[];

export type CustomDocValues = Record<BlockId, BlockValue>;

// ─── Block factory + defaults ─────────────────────────────────────────

let _counter = 0;
export const newBlockId = (kind: string): BlockId => {
  _counter += 1;
  return `${kind}_${Date.now().toString(36)}_${_counter.toString(36)}`;
};

export const blockTypeLabels: Record<BlockType, LocalizedText> = {
  title:    { he: "כותרת ראשית", en: "Title" },
  heading:  { he: "כותרת סעיף",  en: "Heading" },
  guidance: { he: "הסבר",         en: "Guidance" },
  note:     { he: "הערה קבועה",   en: "Note" },
  field:    { he: "שדה (שורה)",  en: "Field (single line)" },
  longText: { he: "טקסט ארוך",    en: "Long text" },
  list:     { he: "רשימה",        en: "List" },
  group:    { he: "קלף חוזר",     en: "Repeating card" },
  table:    { he: "טבלה",         en: "Table" },
  divider:  { he: "קו מפריד",     en: "Divider" },
};

export const isSimpleBlockType = (t: BlockType): t is SimpleBlockType =>
  t === "field" || t === "longText" || t === "list";

export function newBlock(type: BlockType): Block {
  const id = newBlockId(type);
  switch (type) {
    case "title":    return { id, type, text: { he: "כותרת המסמך", en: "Document title" } };
    case "heading":  return { id, type, level: 2, text: { he: "כותרת סעיף", en: "Section heading" } };
    case "guidance": return { id, type, text: { he: "הסבר קצר לממלא הטופס.", en: "Short guidance for the filler." } };
    case "note":     return { id, type, text: { he: "הערה.", en: "Note." } };
    case "field":    return { id, type, label: { he: "שדה", en: "Field" }, inline: true };
    case "longText": return { id, type, label: { he: "טקסט", en: "Text" } };
    case "list":     return { id, type, label: { he: "רשימה", en: "List" } };
    case "group":    return {
      id, type,
      label:     { he: "קבוצה",  en: "Group" },
      itemLabel: { he: "פריט",   en: "Item" },
      fields: [
        { id: newBlockId("field"), type: "field", label: { he: "שם", en: "Name" }, inline: true },
      ],
    };
    case "table":    return {
      id, type,
      label: { he: "טבלה", en: "Table" },
      columns: [
        { id: newBlockId("col"), label: { he: "עמודה 1", en: "Column 1" } },
        { id: newBlockId("col"), label: { he: "עמודה 2", en: "Column 2" } },
      ],
    };
    case "divider":  return { id, type };
  }
}

export function emptySchema(): UserDocSchema {
  const now = Date.now();
  return {
    id: `us_${now.toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
    name: { he: "מסמך חדש", en: "New document" },
    blocks: [newBlock("title")],
    defaultDesign: defaultDocDesign(),
    createdAt: now,
    updatedAt: now,
  };
}

// ─── Initial value for a block (used when seeding a fresh fill-in) ────

export function initialValueFor(block: Block): BlockValue | undefined {
  switch (block.type) {
    case "field":
    case "longText":
      return "";
    case "list":
      return [""];
    case "table":
      return [Object.fromEntries(block.columns.map((c) => [c.id, ""]))];
    case "group":
      return [Object.fromEntries(block.fields.map((f) => [f.id, f.type === "list" ? "" : ""]))];
    default:
      return undefined;
  }
}
