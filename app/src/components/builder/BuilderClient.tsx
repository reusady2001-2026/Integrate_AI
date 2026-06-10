"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore, artifactFromSchemaId } from "@/lib/app-store";
import { useUserSchemasStore } from "@/lib/user-schemas";
import {
  blockTypeLabels, isSimpleBlockType, localizedText, newBlock, newBlockId,
  type Block, type BlockType, type GroupBlock, type LocalizedText,
  type SimpleBlock, type SimpleBlockType, type TableBlock,
} from "@/lib/blocks";
import { strings } from "@/lib/i18n";

const SIMPLE_TYPES: SimpleBlockType[] = ["field", "longText", "list"];
const ALL_BLOCK_TYPES: BlockType[] = [
  "title", "heading", "guidance", "note",
  "field", "longText", "list", "group", "table", "divider",
];

export function BuilderClient() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");
  const lang = useAppStore((s) => s.lang);
  const openArtifact = useAppStore((s) => s.openArtifact);
  const t = strings[lang];

  const hydrate = useUserSchemasStore((s) => s.hydrate);
  const hydrated = useUserSchemasStore((s) => s.hydrated);
  const schemas = useUserSchemasStore((s) => s.schemas);
  const createSchema = useUserSchemasStore((s) => s.createSchema);
  const updateSchema = useUserSchemasStore((s) => s.updateSchema);
  const deleteSchema = useUserSchemasStore((s) => s.deleteSchema);

  useEffect(() => { hydrate(); }, [hydrate]);

  // ─── Resolve / create schema ─────────────────────────────────────
  const [activeId, setActiveId] = useState<string | null>(editingId);
  useEffect(() => {
    if (!hydrated) return;
    if (activeId) return;
    if (editingId && schemas.some((s) => s.id === editingId)) {
      setActiveId(editingId);
      return;
    }
    const s = createSchema();
    setActiveId(s.id);
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href);
      url.searchParams.set("id", s.id);
      window.history.replaceState({}, "", url.toString());
    }
  }, [hydrated, editingId, activeId, schemas, createSchema]);

  const schema = useMemo(() => schemas.find((s) => s.id === activeId), [schemas, activeId]);

  if (!schema) {
    return <div style={{ padding: "2rem", color: "#6b7280" }}>{lang === "he" ? "טוען…" : "Loading…"}</div>;
  }

  const setName = (name: LocalizedText) => updateSchema(schema.id, { name });
  const setBlocks = (blocks: Block[]) => updateSchema(schema.id, { blocks });

  const addBlock = (type: BlockType) => setBlocks([...schema.blocks, newBlock(type)]);
  const removeBlock = (id: string) => setBlocks(schema.blocks.filter((b) => b.id !== id));
  const moveBlock = (id: string, dir: -1 | 1) => {
    const i = schema.blocks.findIndex((b) => b.id === id);
    if (i < 0) return;
    const j = i + dir;
    if (j < 0 || j >= schema.blocks.length) return;
    const next = [...schema.blocks];
    [next[i], next[j]] = [next[j], next[i]];
    setBlocks(next);
  };
  const updateBlock = (id: string, patch: Partial<Block>) =>
    setBlocks(schema.blocks.map((b) => (b.id === id ? ({ ...b, ...patch } as Block) : b)));

  const openFillable = () => {
    openArtifact(artifactFromSchemaId(schema.id));
  };

  return (
    <div dir={t.dir} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1rem", borderBottom: "1px solid var(--app-border)", background: "white",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={() => router.push("/")}
            style={{ fontSize: 12, padding: "4px 10px", border: "1px solid var(--app-border)", borderRadius: 4, background: "white", cursor: "pointer" }}>
            ← {lang === "he" ? "חזרה" : "Back"}
          </button>
          <span style={{ color: "var(--app-border)" }}>|</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {lang === "he" ? "בונה תבניות" : "Template builder"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={openFillable}
            style={{ fontSize: 12, padding: "5px 12px", border: "1px solid var(--app-accent)", borderRadius: 4, background: "var(--app-accent)", color: "white", cursor: "pointer" }}>
            {lang === "he" ? "פתח מסמך למילוי" : "Open fillable doc"}
          </button>
          <button type="button"
            onClick={() => {
              if (confirm(lang === "he" ? "למחוק את התבנית?" : "Delete template?")) {
                deleteSchema(schema.id);
                router.push("/");
              }
            }}
            title={lang === "he" ? "מחק תבנית" : "Delete template"}
            style={{ fontSize: 12, padding: "5px 10px", border: "1px solid var(--app-border)", borderRadius: 4, background: "white", color: "#6b7280", cursor: "pointer" }}>
            ✕
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto", background: "transparent" }}>
        <div style={{ maxWidth: 900, margin: "0 auto" }}>
          {/* Schema name */}
          <section style={card}>
            <div style={sectionLabel}>{lang === "he" ? "שם התבנית" : "Template name"}</div>
            <LocalizedTextInput value={schema.name} onChange={setName} lang={lang} placeholder={lang === "he" ? "שם התבנית" : "Template name"} />
          </section>

          {/* Blocks list */}
          <div style={{ marginTop: 18 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
              <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>
                {lang === "he" ? "מבנה המסמך" : "Document structure"}
              </h2>
            </div>

            {schema.blocks.length === 0 && (
              <p style={{ ...card, color: "#9ca3af", textAlign: "center", fontSize: 13 }}>
                {lang === "he" ? "אין בלוקים. הוסף בלוק ראשון ↓" : "No blocks yet. Add one below ↓"}
              </p>
            )}

            {schema.blocks.map((b, i) => (
              <BlockEditor
                key={b.id}
                block={b}
                index={i}
                total={schema.blocks.length}
                lang={lang}
                onChange={(patch) => updateBlock(b.id, patch)}
                onRemove={() => removeBlock(b.id)}
                onMoveUp={() => moveBlock(b.id, -1)}
                onMoveDown={() => moveBlock(b.id, 1)}
              />
            ))}

            <AddBlockMenu lang={lang} onAdd={addBlock} />
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Add block menu (palette of all 10 block types) ───────────────────

function AddBlockMenu({ lang, onAdd }: { lang: string; onAdd: (t: BlockType) => void }) {
  const [open, setOpen] = useState(false);
  return (
    <div style={{ marginTop: 8 }}>
      {!open ? (
        <button type="button" onClick={() => setOpen(true)}
          style={{
            width: "100%", padding: "10px 16px", fontSize: 13,
            border: "1px dashed var(--app-border)", borderRadius: 6,
            background: "white", color: "#6b7280", cursor: "pointer",
          }}>
          + {lang === "he" ? "הוסף בלוק" : "Add block"}
        </button>
      ) : (
        <div style={{ ...card, padding: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
            <span style={{ fontSize: 12, fontWeight: 700 }}>{lang === "he" ? "בחר סוג בלוק" : "Choose block type"}</span>
            <button type="button" onClick={() => setOpen(false)}
              style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 14 }}>✕</button>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(140px, 1fr))", gap: 6 }}>
            {ALL_BLOCK_TYPES.map((t) => (
              <button key={t} type="button"
                onClick={() => { onAdd(t); setOpen(false); }}
                style={{
                  padding: "8px 10px", fontSize: 12, textAlign: "start",
                  border: "1px solid var(--app-border)", borderRadius: 4,
                  background: "white", cursor: "pointer",
                }}>
                {localizedText(blockTypeLabels[t], lang)}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Per-block editor ────────────────────────────────────────────────

function BlockEditor({ block, index, total, lang, onChange, onRemove, onMoveUp, onMoveDown }: {
  block: Block; index: number; total: number; lang: string;
  onChange: (patch: Partial<Block>) => void;
  onRemove: () => void; onMoveUp: () => void; onMoveDown: () => void;
}) {
  return (
    <div style={card}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: "#374151", textTransform: "uppercase", letterSpacing: "0.04em" }}>
          {index + 1}. {localizedText(blockTypeLabels[block.type], lang)}
        </span>
        <div style={{ display: "flex", gap: 4 }}>
          <button type="button" onClick={onMoveUp} disabled={index === 0} style={iconBtn} title={lang === "he" ? "העבר מעלה" : "Move up"}>↑</button>
          <button type="button" onClick={onMoveDown} disabled={index === total - 1} style={iconBtn} title={lang === "he" ? "העבר מטה" : "Move down"}>↓</button>
          <button type="button" onClick={onRemove} style={{ ...iconBtn, color: "#b91c1c" }} title={lang === "he" ? "מחק" : "Delete"}>✕</button>
        </div>
      </div>
      <BlockConfig block={block} onChange={onChange} lang={lang} />
    </div>
  );
}

function BlockConfig({ block, onChange, lang }: {
  block: Block; onChange: (patch: Partial<Block>) => void; lang: string;
}) {
  switch (block.type) {
    case "divider":
      return <p style={{ fontSize: 11, color: "#9ca3af" }}>{lang === "he" ? "קו מפריד" : "Divider"}</p>;
    case "title":
    case "heading":
    case "guidance":
    case "note": {
      return (
        <>
          <FieldRow label={lang === "he" ? "טקסט" : "Text"}>
            <LocalizedTextInput value={block.text} onChange={(v) => onChange({ text: v } as Partial<Block>)} lang={lang} />
          </FieldRow>
          {block.type === "heading" && (
            <FieldRow label={lang === "he" ? "רמה" : "Level"}>
              <select value={block.level}
                onChange={(e) => onChange({ level: Number(e.target.value) as 2 | 3 } as Partial<Block>)}
                style={selectStyle}>
                <option value={2}>H2</option>
                <option value={3}>H3</option>
              </select>
            </FieldRow>
          )}
        </>
      );
    }
    case "field":
      return (
        <>
          <FieldRow label={lang === "he" ? "תווית" : "Label"}>
            <LocalizedTextInput value={block.label} onChange={(v) => onChange({ label: v } as Partial<Block>)} lang={lang} />
          </FieldRow>
          <FieldRow label={lang === "he" ? "רמז (אופציונלי)" : "Hint (optional)"}>
            <LocalizedTextInput value={block.hint || {}} onChange={(v) => onChange({ hint: v } as Partial<Block>)} lang={lang} />
          </FieldRow>
          <FieldRow label={lang === "he" ? "תצוגה" : "Layout"}>
            <select value={block.inline ? "inline" : "stacked"}
              onChange={(e) => onChange({ inline: e.target.value === "inline" } as Partial<Block>)}
              style={selectStyle}>
              <option value="inline">{lang === "he" ? "תווית: ערך באותה שורה" : "Label: value (inline)"}</option>
              <option value="stacked">{lang === "he" ? "תווית מעל הערך" : "Label above value"}</option>
            </select>
          </FieldRow>
        </>
      );
    case "longText":
      return (
        <>
          <FieldRow label={lang === "he" ? "תווית (אופציונלי)" : "Label (optional)"}>
            <LocalizedTextInput value={block.label || {}} onChange={(v) => onChange({ label: v } as Partial<Block>)} lang={lang} />
          </FieldRow>
          <FieldRow label={lang === "he" ? "רמז (אופציונלי)" : "Hint (optional)"}>
            <LocalizedTextInput value={block.hint || {}} onChange={(v) => onChange({ hint: v } as Partial<Block>)} lang={lang} />
          </FieldRow>
        </>
      );
    case "list":
      return (
        <>
          <FieldRow label={lang === "he" ? "תווית (אופציונלי)" : "Label (optional)"}>
            <LocalizedTextInput value={block.label || {}} onChange={(v) => onChange({ label: v } as Partial<Block>)} lang={lang} />
          </FieldRow>
          <FieldRow label={lang === "he" ? "סוג רשימה" : "List type"}>
            <select value={block.ordered ? "ordered" : "bulleted"}
              onChange={(e) => onChange({ ordered: e.target.value === "ordered" } as Partial<Block>)}
              style={selectStyle}>
              <option value="bulleted">{lang === "he" ? "● תבליטים" : "● Bulleted"}</option>
              <option value="ordered">{lang === "he" ? "1. ממוספרת" : "1. Numbered"}</option>
            </select>
          </FieldRow>
        </>
      );
    case "table":
      return <TableConfig block={block} onChange={onChange} lang={lang} />;
    case "group":
      return <GroupConfig block={block} onChange={onChange} lang={lang} />;
  }
}

function TableConfig({ block, onChange, lang }: {
  block: TableBlock; onChange: (patch: Partial<Block>) => void; lang: string;
}) {
  const updateCol = (i: number, label: LocalizedText) =>
    onChange({ columns: block.columns.map((c, j) => (j === i ? { ...c, label } : c)) } as Partial<Block>);
  const removeCol = (i: number) =>
    onChange({ columns: block.columns.filter((_, j) => j !== i) } as Partial<Block>);
  const addCol = () =>
    onChange({ columns: [...block.columns, { id: newBlockId("col"), label: { he: "עמודה", en: "Column" } }] } as Partial<Block>);
  return (
    <>
      <FieldRow label={lang === "he" ? "תווית טבלה (אופציונלי)" : "Table label (optional)"}>
        <LocalizedTextInput value={block.label || {}} onChange={(v) => onChange({ label: v } as Partial<Block>)} lang={lang} />
      </FieldRow>
      <FieldRow label={lang === "he" ? "רמז (אופציונלי)" : "Hint (optional)"}>
        <LocalizedTextInput value={block.hint || {}} onChange={(v) => onChange({ hint: v } as Partial<Block>)} lang={lang} />
      </FieldRow>
      <div style={{ marginTop: 6 }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          {lang === "he" ? "עמודות" : "Columns"}
        </div>
        {block.columns.map((c, i) => (
          <div key={c.id} style={{ display: "flex", gap: 6, alignItems: "center", marginBottom: 5 }}>
            <span style={{ fontSize: 10, color: "#9ca3af", width: 18 }}>{i + 1}.</span>
            <div style={{ flex: 1 }}>
              <LocalizedTextInput value={c.label} onChange={(v) => updateCol(i, v)} lang={lang} />
            </div>
            {block.columns.length > 1 && (
              <button type="button" onClick={() => removeCol(i)} style={{ ...iconBtn, color: "#b91c1c" }}>✕</button>
            )}
          </div>
        ))}
        <button type="button" onClick={addCol}
          style={{ fontSize: 11, padding: "4px 10px", border: "1px dashed var(--app-border)", borderRadius: 4, background: "transparent", color: "#6b7280", cursor: "pointer", marginTop: 4 }}>
          + {lang === "he" ? "הוסף עמודה" : "Add column"}
        </button>
      </div>
    </>
  );
}

function GroupConfig({ block, onChange, lang }: {
  block: GroupBlock; onChange: (patch: Partial<Block>) => void; lang: string;
}) {
  const updateField = (i: number, patch: Partial<SimpleBlock>) =>
    onChange({ fields: block.fields.map((f, j) => (j === i ? ({ ...f, ...patch } as SimpleBlock) : f)) } as Partial<Block>);
  const removeField = (i: number) =>
    onChange({ fields: block.fields.filter((_, j) => j !== i) } as Partial<Block>);
  const addField = (t: SimpleBlockType) => {
    const fresh = newBlock(t);
    if (!isSimpleBlockType(fresh.type)) return;
    onChange({ fields: [...block.fields, fresh as SimpleBlock] } as Partial<Block>);
  };
  return (
    <>
      <FieldRow label={lang === "he" ? "תווית הקבוצה (אופציונלי)" : "Group label (optional)"}>
        <LocalizedTextInput value={block.label || {}} onChange={(v) => onChange({ label: v } as Partial<Block>)} lang={lang} />
      </FieldRow>
      <FieldRow label={lang === "he" ? "רמז (אופציונלי)" : "Hint (optional)"}>
        <LocalizedTextInput value={block.hint || {}} onChange={(v) => onChange({ hint: v } as Partial<Block>)} lang={lang} />
      </FieldRow>
      <FieldRow label={lang === "he" ? "תווית פריט בודד" : "Single-item label"}>
        <LocalizedTextInput value={block.itemLabel || {}} onChange={(v) => onChange({ itemLabel: v } as Partial<Block>)} lang={lang}
          placeholder={lang === "he" ? "למשל: KPI, חטיבה, סיכון" : "e.g., KPI, Division, Risk"} />
      </FieldRow>
      <div style={{ marginTop: 8, padding: 10, border: "1px solid #f1f5f9", borderRadius: 4, background: "#fafbfc" }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6 }}>
          {lang === "he" ? "שדות בכל פריט" : "Fields inside each item"}
        </div>
        {block.fields.map((f, i) => (
          <div key={f.id} style={{ padding: 8, marginBottom: 6, background: "white", border: "1px solid #e5e7eb", borderRadius: 4 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <span style={{ fontSize: 10, fontWeight: 700, color: "#6b7280", textTransform: "uppercase" }}>
                {i + 1}. {localizedText(blockTypeLabels[f.type], lang)}
              </span>
              {block.fields.length > 1 && (
                <button type="button" onClick={() => removeField(i)} style={{ ...iconBtn, color: "#b91c1c" }}>✕</button>
              )}
            </div>
            <FieldRow label={lang === "he" ? "תווית" : "Label"}>
              <LocalizedTextInput value={(f as { label?: LocalizedText }).label || {}} onChange={(v) => updateField(i, { label: v } as Partial<SimpleBlock>)} lang={lang} />
            </FieldRow>
          </div>
        ))}
        <div style={{ display: "flex", gap: 4 }}>
          {SIMPLE_TYPES.map((t) => (
            <button key={t} type="button" onClick={() => addField(t)}
              style={{ fontSize: 11, padding: "4px 8px", border: "1px dashed var(--app-border)", borderRadius: 4, background: "transparent", color: "#6b7280", cursor: "pointer" }}>
              + {localizedText(blockTypeLabels[t], lang)}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}

// ─── Localized text input (single language or both) ──────────────────

function LocalizedTextInput({ value, onChange, lang, placeholder }: {
  value: LocalizedText;
  onChange: (v: LocalizedText) => void;
  lang: string;
  placeholder?: string;
}) {
  const isHe = lang === "he";
  const primary = isHe ? value.he ?? "" : value.en ?? "";
  const secondary = isHe ? value.en ?? "" : value.he ?? "";
  const [showOther, setShowOther] = useState(!!secondary);
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
      <input type="text" value={primary} placeholder={placeholder}
        onChange={(e) => onChange(isHe ? { ...value, he: e.target.value } : { ...value, en: e.target.value })}
        style={inputStyle} />
      {showOther ? (
        <input type="text" value={secondary}
          placeholder={isHe ? "English (optional)" : "עברית (אופציונלי)"}
          onChange={(e) => onChange(isHe ? { ...value, en: e.target.value } : { ...value, he: e.target.value })}
          style={inputStyle} />
      ) : (
        <button type="button" onClick={() => setShowOther(true)}
          style={{ alignSelf: "start", background: "none", border: "none", color: "var(--app-accent)", fontSize: 10, cursor: "pointer", padding: 0 }}>
          + {isHe ? "הוסף תרגום באנגלית" : "Add Hebrew translation"}
        </button>
      )}
    </div>
  );
}

function FieldRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Style atoms ─────────────────────────────────────────────────────

const card: React.CSSProperties = {
  background: "white", border: "1px solid #e5e7eb", borderRadius: 6, padding: 14, marginBottom: 8,
};
const sectionLabel: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 6,
};
const inputStyle: React.CSSProperties = {
  width: "100%", padding: "5px 8px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 4,
};
const selectStyle: React.CSSProperties = {
  width: "100%", padding: "5px 8px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 4, background: "white",
};
const iconBtn: React.CSSProperties = {
  padding: "2px 6px", fontSize: 11, border: "1px solid #e5e7eb", borderRadius: 3, background: "white", cursor: "pointer", color: "#6b7280",
};
