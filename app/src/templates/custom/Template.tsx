"use client";

import { type CSSProperties, useEffect } from "react";
import { useAppStore } from "@/lib/app-store";
import { strings } from "@/lib/i18n";
import { useUserSchemasStore } from "@/lib/user-schemas";
import { useCustomDocStore } from "@/lib/custom-doc-store";
import { resolveDocTheme, buildDocPresentation } from "@/lib/themes/doc-themes";
import { Editable } from "@/components/Editable";
import { localizedText, type Block, type SimpleBlock } from "@/lib/blocks";
import styles from "../kpis/Template.module.css";

export function CustomDocTemplate({ schemaId }: { schemaId: string }) {
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang];
  const schema = useUserSchemasStore((s) => s.schemas.find((x) => x.id === schemaId));
  const ensure = useCustomDocStore((s) => s.ensure);
  const docState = useCustomDocStore((s) => s.byId[schemaId]);
  const hydrate = useUserSchemasStore((s) => s.hydrate);

  useEffect(() => { hydrate(); }, [hydrate]);
  useEffect(() => { if (schema) ensure(schema); }, [schema, ensure]);

  if (!schema || !docState) {
    return (
      <div style={{ padding: "2rem", color: "#6b7280", fontSize: "0.9rem" }}>
        {lang === "he" ? "טוען מסמך…" : "Loading document…"}
      </div>
    );
  }

  const eff = resolveDocTheme(docState.design.theme, docState.design);
  const { className: docClasses, style: docStyle } = buildDocPresentation(eff, styles);

  return (
    <article className={docClasses} lang={lang} dir={t.dir} style={docStyle as CSSProperties}>
      {schema.blocks.map((b) => (
        <BlockRenderer key={b.id} block={b} schemaId={schemaId} lang={lang} />
      ))}
      {schema.blocks.length === 0 && (
        <p style={{ color: eff.muted, textAlign: "center", padding: "3rem 0" }}>
          {lang === "he" ? "המסמך ריק — פתח את הבונה כדי להוסיף בלוקים." : "Empty document — open the builder to add blocks."}
        </p>
      )}
    </article>
  );
}

// ─── BlockRenderer — switch on block.type ─────────────────────────────

function BlockRenderer({ block, schemaId, lang }: { block: Block; schemaId: string; lang: string }) {
  switch (block.type) {
    case "title":    return <TitleR     block={block} lang={lang} />;
    case "heading":  return <HeadingR   block={block} lang={lang} />;
    case "guidance": return <GuidanceR  block={block} lang={lang} />;
    case "note":     return <NoteR      block={block} lang={lang} />;
    case "field":    return <FieldR     block={block} schemaId={schemaId} lang={lang} />;
    case "longText": return <LongTextR  block={block} schemaId={schemaId} lang={lang} />;
    case "list":     return <ListR      block={block} schemaId={schemaId} lang={lang} />;
    case "table":    return <TableR     block={block} schemaId={schemaId} lang={lang} />;
    case "group":    return <GroupR     block={block} schemaId={schemaId} lang={lang} />;
    case "divider":  return <hr className={styles.rule} />;
  }
}

// ─── Individual block renderers ───────────────────────────────────────

function TitleR({ block, lang }: { block: Extract<Block, { type: "title" }>; lang: string }) {
  return <h1 className={styles.h1}>{localizedText(block.text, lang)}</h1>;
}

function HeadingR({ block, lang }: { block: Extract<Block, { type: "heading" }>; lang: string }) {
  const text = localizedText(block.text, lang);
  return block.level === 3
    ? <h3 className={styles.h3}>{text}</h3>
    : <h2 className={styles.h2}>{text}</h2>;
}

function GuidanceR({ block, lang }: { block: Extract<Block, { type: "guidance" }>; lang: string }) {
  return <p className={styles.guidance}>{localizedText(block.text, lang)}</p>;
}

function NoteR({ block, lang }: { block: Extract<Block, { type: "note" }>; lang: string }) {
  return <p className={styles.note}>{localizedText(block.text, lang)}</p>;
}

function FieldR({ block, schemaId, lang }: { block: Extract<Block, { type: "field" }>; schemaId: string; lang: string }) {
  const value = useCustomDocStore((s) => (s.byId[schemaId]?.values[block.id] as string) || "");
  const setText = useCustomDocStore((s) => s.setText);
  const label = localizedText(block.label, lang);
  const hint  = block.hint ? localizedText(block.hint, lang) : "";
  return (
    <div className={block.inline ? styles.fieldInline : styles.field}>
      <strong>{label}</strong>
      {hint && <span className={styles.hint}> — {hint}</span>}
      {": "}
      <Editable
        value={value}
        onChange={(v) => setText(schemaId, block.id, v)}
        className={block.inline ? styles.valueInline : styles.value}
      />
    </div>
  );
}

function LongTextR({ block, schemaId, lang }: { block: Extract<Block, { type: "longText" }>; schemaId: string; lang: string }) {
  const value = useCustomDocStore((s) => (s.byId[schemaId]?.values[block.id] as string) || "");
  const setText = useCustomDocStore((s) => s.setText);
  const label = block.label ? localizedText(block.label, lang) : "";
  const hint  = block.hint  ? localizedText(block.hint,  lang) : "";
  return (
    <div className={styles.field}>
      {label && <div className={styles.fieldLabel}><strong>{label}</strong>{hint && <span className={styles.hint}> — {hint}</span>}</div>}
      <Editable
        value={value}
        onChange={(v) => setText(schemaId, block.id, v)}
        block
        className={styles.value}
        style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }}
      />
    </div>
  );
}

function ListR({ block, schemaId, lang }: { block: Extract<Block, { type: "list" }>; schemaId: string; lang: string }) {
  const items = useCustomDocStore((s) => (s.byId[schemaId]?.values[block.id] as string[]) || [""]);
  const setItem = useCustomDocStore((s) => s.setListItem);
  const addItem = useCustomDocStore((s) => s.addListItem);
  const removeItem = useCustomDocStore((s) => s.removeListItem);
  const Tag: "ol" | "ul" = block.ordered ? "ol" : "ul";
  const label = block.label ? localizedText(block.label, lang) : "";
  const hint  = block.hint  ? localizedText(block.hint,  lang) : "";
  return (
    <>
      {label && <div className={styles.fieldInline}><strong>{label}</strong>{hint && <span className={styles.hint}> — {hint}</span>}{":"}</div>}
      <Tag style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {items.map((x, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={x} onChange={(v) => setItem(schemaId, block.id, i, v)} />
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(schemaId, block.id, i)} className={styles.removeBtn}>×</button>
            )}
          </li>
        ))}
      </Tag>
      <button type="button" onClick={() => addItem(schemaId, block.id)} className={styles.addBtn}>
        {lang === "he" ? "+ הוסף" : "+ Add"}
      </button>
    </>
  );
}

function TableR({ block, schemaId, lang }: { block: Extract<Block, { type: "table" }>; schemaId: string; lang: string }) {
  const rows = useCustomDocStore((s) => (s.byId[schemaId]?.values[block.id] as Record<string, string>[]) || []);
  const setCell = useCustomDocStore((s) => s.setTableCell);
  const addRow = useCustomDocStore((s) => s.addTableRow);
  const removeRow = useCustomDocStore((s) => s.removeTableRow);
  const colIds = block.columns.map((c) => c.id);
  const label = block.label ? localizedText(block.label, lang) : "";
  const hint  = block.hint  ? localizedText(block.hint,  lang) : "";
  return (
    <>
      {label && <h3 className={styles.h3}>{label}</h3>}
      {hint && <p className={styles.guidance}>{hint}</p>}
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              {block.columns.map((c) => <th key={c.id}>{localizedText(c.label, lang)}</th>)}
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                {block.columns.map((c) => (
                  <td key={c.id}>
                    <Editable value={r[c.id] || ""} onChange={(v) => setCell(schemaId, block.id, i, c.id, v)} />
                  </td>
                ))}
                <td className={styles.tableCtrlCol}>
                  {rows.length > 1 && (
                    <button type="button" onClick={() => removeRow(schemaId, block.id, i)} className={styles.removeBtn}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={() => addRow(schemaId, block.id, colIds)} className={styles.addBtn}>
        {lang === "he" ? "+ הוסף שורה" : "+ Add row"}
      </button>
    </>
  );
}

function GroupR({ block, schemaId, lang }: { block: Extract<Block, { type: "group" }>; schemaId: string; lang: string }) {
  const items = useCustomDocStore((s) => (s.byId[schemaId]?.values[block.id] as Record<string, string>[]) || []);
  const addItem = useCustomDocStore((s) => s.addGroupItem);
  const removeItem = useCustomDocStore((s) => s.removeGroupItem);
  const fieldIds = block.fields.map((f) => f.id);
  const itemLabelBase = block.itemLabel ? localizedText(block.itemLabel, lang) : (lang === "he" ? "פריט" : "Item");
  return (
    <>
      {block.label && <h3 className={styles.h3}>{localizedText(block.label, lang)}</h3>}
      {block.hint  && <p className={styles.guidance}>{localizedText(block.hint, lang)}</p>}
      {items.map((_it, i) => (
        <div key={i} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>{itemLabelBase} #{i + 1}</div>
            {items.length > 1 && (
              <button type="button" onClick={() => removeItem(schemaId, block.id, i)} className={styles.removeBtn}>×</button>
            )}
          </div>
          {block.fields.map((f) => (
            <GroupFieldR key={f.id} field={f} schemaId={schemaId} blockId={block.id} itemIndex={i} lang={lang} />
          ))}
        </div>
      ))}
      <button type="button" onClick={() => addItem(schemaId, block.id, fieldIds)} className={styles.addBtn}>
        {lang === "he" ? `+ הוסף ${itemLabelBase}` : `+ Add ${itemLabelBase}`}
      </button>
    </>
  );
}

function GroupFieldR({ field, schemaId, blockId, itemIndex, lang }: {
  field: SimpleBlock; schemaId: string; blockId: string; itemIndex: number; lang: string;
}) {
  const value = useCustomDocStore((s) => (s.byId[schemaId]?.values[blockId] as Record<string, string>[] | undefined)?.[itemIndex]?.[field.id] ?? "");
  const setField = useCustomDocStore((s) => s.setGroupField);
  if (field.type === "field") {
    const label = localizedText(field.label, lang);
    const hint  = field.hint ? localizedText(field.hint, lang) : "";
    return (
      <div className={field.inline ? styles.fieldInline : styles.field}>
        <strong>{label}</strong>
        {hint && <span className={styles.hint}> — {hint}</span>}
        {": "}
        <Editable value={value} onChange={(v) => setField(schemaId, blockId, itemIndex, field.id, v)}
          className={field.inline ? styles.valueInline : styles.value} />
      </div>
    );
  }
  if (field.type === "longText") {
    const label = field.label ? localizedText(field.label, lang) : "";
    return (
      <div className={styles.field}>
        {label && <div className={styles.fieldLabel}><strong>{label}</strong></div>}
        <Editable value={value} onChange={(v) => setField(schemaId, blockId, itemIndex, field.id, v)}
          block className={styles.value}
          style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "2.5em" }} />
      </div>
    );
  }
  // list-as-group-field: comma-separated single-line representation (keep it simple here)
  const label = field.label ? localizedText(field.label, lang) : "";
  return (
    <div className={styles.fieldInline}>
      {label && <><strong>{label}</strong>{": "}</>}
      <Editable value={value} onChange={(v) => setField(schemaId, blockId, itemIndex, field.id, v)}
        className={styles.valueInline} />
    </div>
  );
}
