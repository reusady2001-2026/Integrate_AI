"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAppStore } from "@/lib/app-store";
import { useUserDesignsStore, labelText, type LocalizedLabel } from "@/lib/user-designs";
import {
  DOC_THEMES,
  DOC_FONT_OPTIONS,
  PALETTES,
  getPalette,
  defaultDocDesign,
  resolveDocTheme,
  buildDocPresentation,
  H1_STYLES,
  H3_STYLES,
  BODY_STYLES,
  GUIDANCE_STYLES,
  FIELD_STYLES,
  LIST_STYLES,
  GROUP_STYLES,
  DIVIDER_STYLES,
  DOC_PADDINGS,
  DOC_RADII,
  type DocCustomPalette,
  type DocDesign,
  type HeadingStyle,
  type PaletteId,
} from "@/lib/themes/doc-themes";
import { TABLE_STYLE_DEFS, type TableStyle } from "@/lib/formatting";
import styles from "@/templates/kpis/Template.module.css";

const HEADING_STYLE_VALUES: HeadingStyle[] = ["classic", "minimal", "bold", "editorial", "modern", "magazine"];

export function DesignBuilderClient() {
  const router = useRouter();
  const params = useSearchParams();
  const editingId = params.get("id");
  const lang = useAppStore((s) => s.lang);
  const isHe = lang === "he";

  const hydrate = useUserDesignsStore((s) => s.hydrate);
  const hydrated = useUserDesignsStore((s) => s.hydrated);
  const presets = useUserDesignsStore((s) => s.presets);
  const addPreset = useUserDesignsStore((s) => s.addPreset);
  const removePreset = useUserDesignsStore((s) => s.removePreset);

  useEffect(() => { hydrate(); }, [hydrate]);

  const [design, setDesign] = useState<DocDesign>(() => defaultDocDesign());
  const [nameHe, setNameHe] = useState("");
  const [nameEn, setNameEn] = useState("");
  const [showOther, setShowOther] = useState(false);

  // Hydrate from URL ?id= once
  useEffect(() => {
    if (!hydrated) return;
    if (!editingId) return;
    const existing = presets.find((p) => p.id === editingId);
    if (existing) {
      setDesign({ ...defaultDocDesign(), ...existing.design, customPalette: { ...existing.design.customPalette } });
      setNameHe(existing.name.he ?? "");
      setNameEn(existing.name.en ?? "");
      if (existing.name.he && existing.name.en) setShowOther(true);
    }
  }, [hydrated, editingId, presets]);

  const updateDesign = (patch: Partial<DocDesign>) => setDesign((d) => ({ ...d, ...patch }));
  const updateCustomPalette = (patch: Partial<DocCustomPalette>) =>
    setDesign((d) => ({ ...d, customPalette: { ...d.customPalette, ...patch } }));

  const save = () => {
    const label: LocalizedLabel = isHe
      ? { he: nameHe.trim() || undefined, en: nameEn.trim() || undefined }
      : { en: nameHe.trim() || undefined, he: nameEn.trim() || undefined };
    if (!label.he && !label.en) {
      alert(isHe ? "נא להזין שם" : "Please enter a name");
      return;
    }
    if (editingId) {
      removePreset(editingId);
    }
    addPreset(label, design);
    router.push("/");
  };

  return (
    <div dir={isHe ? "rtl" : "ltr"} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={{
        height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
        padding: "0 1rem", borderBottom: "1px solid var(--app-border)", background: "white",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={() => router.push("/")}
            style={miniBtn}>← {isHe ? "חזרה" : "Back"}</button>
          <span style={{ color: "var(--app-border)" }}>|</span>
          <span style={{ fontWeight: 700, fontSize: 14 }}>
            {isHe ? "בונה עיצוב" : "Design builder"}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <button type="button" onClick={save}
            style={{ ...miniBtn, background: "var(--app-accent)", color: "white", border: "1px solid var(--app-accent)" }}>
            {editingId ? (isHe ? "עדכן עיצוב" : "Update design") : (isHe ? "שמור עיצוב" : "Save design")}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        {/* Live preview */}
        <section style={{ flex: 1, overflowY: "auto", padding: "1.5rem", background: "#f4f4f6" }}>
          <DesignPreview design={design} lang={lang} />
        </section>

        {/* Controls panel */}
        <aside style={{ width: 380, overflowY: "auto", borderInlineStart: "1px solid var(--app-border)", background: "white" }}>
          <div style={{ padding: 14 }}>
            {/* Name */}
            <Section title={isHe ? "שם העיצוב" : "Design name"}>
              <input type="text" value={nameHe} onChange={(e) => setNameHe(e.target.value)}
                placeholder={isHe ? "שם" : "Name"}
                style={inputStyle} />
              {!showOther ? (
                <button type="button" onClick={() => setShowOther(true)}
                  style={{ background: "none", border: "none", color: "var(--app-accent)", fontSize: 10, cursor: "pointer", padding: 0, marginTop: 4 }}>
                  + {isHe ? "הוסף תרגום" : "Add translation"}
                </button>
              ) : (
                <input type="text" value={nameEn} onChange={(e) => setNameEn(e.target.value)}
                  placeholder={isHe ? "English" : "עברית"}
                  style={{ ...inputStyle, marginTop: 4 }} />
              )}
            </Section>

            {/* Colors */}
            <Section title={isHe ? "צבעים" : "Colours"}>
              <Sub label={isHe ? "ערכת צבעים בסיסית" : "Base palette"}>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 4 }}>
                  <button type="button" onClick={() => updateDesign({ paletteOverride: "" })}
                    style={{ ...miniSelectBtn, ...(design.paletteOverride === "" ? activeBorder : {}), fontSize: 8, padding: "4px 2px" }}>
                    {isHe ? "מהערכה" : "From theme"}
                  </button>
                  {(Object.keys(PALETTES) as PaletteId[]).map((pid) => {
                    const p = PALETTES[pid];
                    return (
                      <button key={pid} type="button" onClick={() => updateDesign({ paletteOverride: pid })}
                        title={pid}
                        style={{ ...miniSelectBtn, padding: 0, height: 28, overflow: "hidden", ...(design.paletteOverride === pid ? activeBorder : {}) }}>
                        <div style={{ height: "55%", background: p.coverGradient }} />
                        <div style={{ height: "45%", background: p.bgGradient, display: "flex", alignItems: "center", gap: 2, paddingInline: 3 }}>
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.accent }} />
                          <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.accent2 }} />
                        </div>
                      </button>
                    );
                  })}
                </div>
              </Sub>
              <Sub label={isHe ? "כיוונון ידני (4 צבעים)" : "Custom palette (4 colours)"}>
                <CustomPaletteEditor cp={design.customPalette}
                  basePaletteId={(design.paletteOverride || (DOC_THEMES.find((t) => t.id === design.theme)?.palette ?? "corporate-navy")) as PaletteId}
                  onChange={updateCustomPalette} lang={lang} />
              </Sub>
            </Section>

            {/* Fonts */}
            <Section title={isHe ? "פונטים וגדלים" : "Fonts & sizes"}>
              <Sub label={isHe ? "פונט כותרות" : "Heading font"}>
                <FontSelect value={design.titleFont} onChange={(v) => updateDesign({ titleFont: v })} />
              </Sub>
              <Sub label={isHe ? "פונט גוף" : "Body font"}>
                <FontSelect value={design.bodyFont} onChange={(v) => updateDesign({ bodyFont: v })} />
              </Sub>
              <Sub label={isHe ? `גודל טקסט — ${design.fontSize}pt` : `Font size — ${design.fontSize}pt`}>
                <input type="range" min={8} max={15} step={0.5} value={design.fontSize}
                  onChange={(e) => updateDesign({ fontSize: Number(e.target.value) })}
                  style={{ width: "100%" }} />
              </Sub>
            </Section>

            {/* H1 */}
            <Section title={isHe ? "כותרת ראשית (H1)" : "Document title (H1)"}>
              <FormGrid options={[
                { v: "",          he: "ברירת מחדל",   en: "Default" },
                { v: "thinLine",  he: "קו דק",         en: "Thin line" },
                { v: "thickBar",  he: "פס עבה",         en: "Thick bar" },
                { v: "none",      he: "ללא קו",         en: "No line" },
                { v: "filled",    he: "רקע מלא",        en: "Filled bar" },
                { v: "centered",  he: "ממורכז",          en: "Centered" },
                { v: "smallCaps", he: "אותיות גדולות",  en: "Small caps" },
              ]} current={design.h1Style ?? ""}
                 onPick={(v) => updateDesign({ h1Style: v as DocDesign["h1Style"] })}
                 allOptions={H1_STYLES} lang={lang} />
            </Section>

            {/* H2 (heading style) */}
            <Section title={isHe ? "כותרת סעיף (H2)" : "Section heading (H2)"}>
              <FormGrid options={[
                { v: "",           he: "מהערכה", en: "From theme" },
                { v: "classic",    he: "קלאסי",   en: "Classic" },
                { v: "minimal",    he: "מינימלי", en: "Minimal" },
                { v: "bold",       he: "מודגש",   en: "Bold" },
                { v: "editorial",  he: "עיתונאי", en: "Editorial" },
                { v: "modern",     he: "מודרני",  en: "Modern" },
                { v: "magazine",   he: "מגזין",   en: "Magazine" },
              ]} current={design.headingStyleOverride ?? ""}
                 onPick={(v) => updateDesign({ headingStyleOverride: (v as HeadingStyle | "") })}
                 allOptions={["", ...HEADING_STYLE_VALUES]} lang={lang} />
            </Section>

            {/* H3 */}
            <Section title={isHe ? "תת־כותרת (H3)" : "Subheading (H3)"}>
              <FormGrid options={[
                { v: "",              he: "ברירת מחדל", en: "Default" },
                { v: "italic",        he: "נטוי",        en: "Italic" },
                { v: "bulleted",      he: "● עם נקודה", en: "● Bulleted" },
                { v: "thinUnderline", he: "קו תחתון",   en: "Thin underline" },
                { v: "accentColor",   he: "צבע הדגשה",  en: "Accent colour" },
              ]} current={design.h3Style ?? ""}
                 onPick={(v) => updateDesign({ h3Style: v as DocDesign["h3Style"] })}
                 allOptions={H3_STYLES} lang={lang} />
            </Section>

            {/* Body density */}
            <Section title={isHe ? "צפיפות טקסט" : "Body density"}>
              <FormGrid options={[
                { v: "",      he: "רגיל",      en: "Normal" },
                { v: "tight", he: "צפוף",       en: "Tight" },
                { v: "loose", he: "מרווח",      en: "Loose" },
              ]} current={design.bodyStyle ?? ""}
                 onPick={(v) => updateDesign({ bodyStyle: v as DocDesign["bodyStyle"] })}
                 allOptions={BODY_STYLES} lang={lang} />
            </Section>

            {/* Guidance */}
            <Section title={isHe ? "הסבר / הנחיה" : "Guidance text"}>
              <FormGrid options={[
                { v: "",           he: "ברירת מחדל",    en: "Default" },
                { v: "bar",        he: "רק קו צד",       en: "Side bar only" },
                { v: "box",        he: "רקע אפור",       en: "Gray box" },
                { v: "italic",     he: "נטוי בלבד",      en: "Italic only" },
                { v: "accentBar",  he: "קו צבעוני",     en: "Accent bar" },
                { v: "corner",     he: "פינה צבעונית", en: "Top rule" },
              ]} current={design.guidanceStyle ?? ""}
                 onPick={(v) => updateDesign({ guidanceStyle: v as DocDesign["guidanceStyle"] })}
                 allOptions={GUIDANCE_STYLES} lang={lang} />
            </Section>

            {/* Field underline */}
            <Section title={isHe ? "קו תחתון לשדות" : "Field underline"}>
              <FormGrid options={[
                { v: "",       he: "ברירת מחדל",   en: "Default" },
                { v: "thick",  he: "עבה",            en: "Thick" },
                { v: "dashed", he: "מקווקו",         en: "Dashed" },
                { v: "none",   he: "ללא קו",          en: "None" },
                { v: "boxed",  he: "מסגרת מלאה",    en: "Boxed" },
              ]} current={design.fieldStyle ?? ""}
                 onPick={(v) => updateDesign({ fieldStyle: v as DocDesign["fieldStyle"] })}
                 allOptions={FIELD_STYLES} lang={lang} />
            </Section>

            {/* List bullets */}
            <Section title={isHe ? "סימני רשימה" : "List markers"}>
              <FormGrid options={[
                { v: "",        he: "● ברירת מחדל", en: "● Default" },
                { v: "diamond", he: "◆ יהלום",         en: "◆ Diamond" },
                { v: "arrow",   he: "→ חץ",             en: "→ Arrow" },
                { v: "dash",    he: "— מקף",            en: "— Dash" },
                { v: "square",  he: "▪ ריבוע",          en: "▪ Square" },
                { v: "circle",  he: "○ עיגול",          en: "○ Circle" },
              ]} current={design.listStyle ?? ""}
                 onPick={(v) => updateDesign({ listStyle: v as DocDesign["listStyle"] })}
                 allOptions={LIST_STYLES} lang={lang} />
            </Section>

            {/* Group card */}
            <Section title={isHe ? "קלף חוזר" : "Group card"}>
              <FormGrid options={[
                { v: "",             he: "ברירת מחדל",  en: "Default" },
                { v: "thick",        he: "מסגרת עבה",   en: "Thick border" },
                { v: "shadow",       he: "צל",            en: "Shadow" },
                { v: "sideAccent",   he: "פס צד",         en: "Side accent" },
                { v: "grayBg",       he: "רקע אפור",      en: "Gray bg" },
                { v: "accentHeader", he: "כותרת צבעונית", en: "Accent header" },
              ]} current={design.groupStyle ?? ""}
                 onPick={(v) => updateDesign({ groupStyle: v as DocDesign["groupStyle"] })}
                 allOptions={GROUP_STYLES} lang={lang} />
            </Section>

            {/* Divider */}
            <Section title={isHe ? "קו מפריד" : "Divider"}>
              <FormGrid options={[
                { v: "",       he: "ברירת מחדל",  en: "Default" },
                { v: "dashed", he: "מקווקו",       en: "Dashed" },
                { v: "double", he: "כפול",          en: "Double" },
                { v: "thick",  he: "עבה",            en: "Thick" },
                { v: "dotted", he: "מנוקד",          en: "Dotted" },
              ]} current={design.dividerStyle ?? ""}
                 onPick={(v) => updateDesign({ dividerStyle: v as DocDesign["dividerStyle"] })}
                 allOptions={DIVIDER_STYLES} lang={lang} />
            </Section>

            {/* Table style */}
            <Section title={isHe ? "סגנון טבלה" : "Table style"}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 4 }}>
                {(Object.keys(TABLE_STYLE_DEFS) as TableStyle[]).map((ts) => {
                  const def = TABLE_STYLE_DEFS[ts];
                  const isActive = design.tableStyle === ts;
                  return (
                    <button key={ts} type="button" onClick={() => updateDesign({ tableStyle: ts })}
                      style={{ ...miniSelectBtn, padding: "4px 5px", fontSize: 9, textAlign: "start", ...(isActive ? activeBorder : {}) }}>
                      {isHe ? def.nameHe : def.nameEn}
                    </button>
                  );
                })}
              </div>
            </Section>

            {/* Doc padding/radius */}
            <Section title={isHe ? "פריסת המסמך" : "Document layout"}>
              <Sub label={isHe ? "ריווח פנימי" : "Padding"}>
                <FormGrid options={[
                  { v: "",         he: "רגיל",  en: "Normal" },
                  { v: "compact",  he: "צפוף",   en: "Compact" },
                  { v: "spacious", he: "מרווח",  en: "Spacious" },
                ]} current={design.docPadding ?? ""}
                   onPick={(v) => updateDesign({ docPadding: v as DocDesign["docPadding"] })}
                   allOptions={DOC_PADDINGS} lang={lang} />
              </Sub>
              <Sub label={isHe ? "עיגול פינות" : "Corner radius"}>
                <FormGrid options={[
                  { v: "",       he: "קטן",   en: "Small" },
                  { v: "sharp",  he: "חד",     en: "Sharp" },
                  { v: "medium", he: "בינוני", en: "Medium" },
                  { v: "large",  he: "גדול",  en: "Large" },
                ]} current={design.docRadius ?? ""}
                   onPick={(v) => updateDesign({ docRadius: v as DocDesign["docRadius"] })}
                   allOptions={DOC_RADII} lang={lang} />
              </Sub>
            </Section>

            <button type="button" onClick={() => setDesign(defaultDocDesign())}
              style={{ ...miniBtn, width: "100%", marginTop: 10 }}>
              {isHe ? "איפוס הכל" : "Reset all"}
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

// ─── Live preview ─────────────────────────────────────────────────────

function DesignPreview({ design, lang }: { design: DocDesign; lang: string }) {
  const eff = useMemo(() => resolveDocTheme(design.theme, design), [design]);
  const { className, style } = buildDocPresentation(eff, styles as unknown as Record<string, string>);
  const isHe = lang === "he";
  return (
    <article className={className} dir={isHe ? "rtl" : "ltr"} lang={lang} style={style as CSSProperties}>
      <h1 className={styles.h1}>{isHe ? "כותרת המסמך" : "Document title"}</h1>

      <div className={styles.fieldInline}>
        <strong>{isHe ? "שדה לדוגמא" : "Sample field"}</strong>{": "}
        <span className={styles.valueInline}>{isHe ? "ערך לדוגמא" : "Example value"}</span>
      </div>
      <div className={styles.field}>
        <strong>{isHe ? "שדה עם קו" : "Field with line"}</strong>{": "}
        <span className={styles.value}>{isHe ? "תוכן השדה כאן" : "Field content here"}</span>
      </div>

      <h2 className={styles.h2}>{isHe ? "כותרת סעיף לדוגמא" : "Section heading"}</h2>
      <p className={styles.guidance}>
        {isHe ? "טקסט הסבר קצר שמדריך את ממלא הטופס מה לכתוב כאן." : "Short guidance text that explains what goes in this section."}
      </p>

      <h3 className={styles.h3}>{isHe ? "תת־כותרת" : "Subheading"}</h3>
      <ul style={{ paddingInlineStart: "1.2rem", margin: "0.4rem 0 1rem" }}>
        <li>{isHe ? "פריט ראשון ברשימה" : "First list item"}</li>
        <li>{isHe ? "פריט שני ברשימה" : "Second list item"}</li>
        <li>{isHe ? "פריט שלישי" : "Third item"}</li>
      </ul>

      <div className={styles.kpiBlock}>
        <div className={styles.kpiBlockHeader}>
          <div className={styles.kpiIndex}>{isHe ? "פריט #1" : "Item #1"}</div>
        </div>
        <div className={styles.fieldInline}>
          <strong>{isHe ? "שם" : "Name"}</strong>{": "}
          <span className={styles.valueInline}>{isHe ? "דוגמא" : "Example"}</span>
        </div>
        <div className={styles.fieldInline}>
          <strong>{isHe ? "תיאור" : "Description"}</strong>{": "}
          <span className={styles.valueInline}>{isHe ? "תיאור הפריט" : "Item description"}</span>
        </div>
      </div>

      <hr className={styles.rule} />

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{isHe ? "עמודה א'" : "Column A"}</th>
              <th>{isHe ? "עמודה ב'" : "Column B"}</th>
              <th>{isHe ? "עמודה ג'" : "Column C"}</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>{isHe ? "שורה 1א" : "Row 1A"}</td><td>{isHe ? "שורה 1ב" : "Row 1B"}</td><td>{isHe ? "שורה 1ג" : "Row 1C"}</td></tr>
            <tr><td>{isHe ? "שורה 2א" : "Row 2A"}</td><td>{isHe ? "שורה 2ב" : "Row 2B"}</td><td>{isHe ? "שורה 2ג" : "Row 2C"}</td></tr>
            <tr><td>{isHe ? "שורה 3א" : "Row 3A"}</td><td>{isHe ? "שורה 3ב" : "Row 3B"}</td><td>{isHe ? "שורה 3ג" : "Row 3C"}</td></tr>
          </tbody>
        </table>
      </div>
    </article>
  );
}

// ─── Form-picker grid (visual button list) ───────────────────────────

function FormGrid<T extends string>({ options, current, onPick, allOptions, lang }: {
  options: { v: string; he: string; en: string }[];
  current: string;
  onPick: (v: T | "") => void;
  allOptions: readonly (T | "")[];
  lang: string;
}) {
  // Filter to options that exist in allOptions
  const valid = options.filter((o) => (allOptions as readonly string[]).includes(o.v));
  const isHe = lang === "he";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 4 }}>
      {valid.map((o) => {
        const isActive = current === o.v;
        return (
          <button key={o.v || "__default__"} type="button"
            onClick={() => onPick(o.v as T | "")}
            style={{
              ...miniSelectBtn,
              padding: "5px 7px",
              fontSize: 10,
              textAlign: "start",
              ...(isActive ? activeBorder : {}),
            }}>
            {isHe ? o.he : o.en}
          </button>
        );
      })}
    </div>
  );
}

function CustomPaletteEditor({ cp, basePaletteId, onChange, lang }: {
  cp: DocCustomPalette;
  basePaletteId: PaletteId;
  onChange: (p: Partial<DocCustomPalette>) => void;
  lang: string;
}) {
  const isHe = lang === "he";
  const base = getPalette(basePaletteId);
  const fields: { key: keyof DocCustomPalette; he: string; en: string; baseVal: string }[] = [
    { key: "bg",      he: "רקע",            en: "Background", baseVal: base.bg },
    { key: "accent",  he: "הדגשה ראשית",   en: "Primary",    baseVal: base.accent },
    { key: "accent2", he: "הדגשה משנית",   en: "Secondary",  baseVal: base.accent2 },
    { key: "text",    he: "טקסט",            en: "Text",       baseVal: base.text },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
      {fields.map(({ key, he, en, baseVal }) => {
        const current = cp[key] || baseVal;
        const isCustom = !!cp[key];
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <input type="color" value={current}
              onChange={(e) => onChange({ [key]: e.target.value })}
              style={{ width: 30, height: 24, border: "1px solid #d1d5db", borderRadius: 3, padding: 1, cursor: "pointer" }} />
            <span style={{ flex: 1, fontSize: 10, color: "#374151" }}>
              {isHe ? he : en}
              {isCustom && <span style={{ color: "var(--app-accent)", marginInlineStart: 4 }}>✓</span>}
            </span>
            {isCustom && (
              <button type="button" onClick={() => onChange({ [key]: "" })}
                style={{ fontSize: 10, color: "#9ca3af", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

function FontSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "5px 8px", fontSize: 11, border: "1px solid #d1d5db", borderRadius: 4, background: "white" }}>
      {DOC_FONT_OPTIONS.map((o) => (
        <option key={o.id} value={o.id} style={{ fontFamily: o.css || undefined }}>{o.label}</option>
      ))}
    </select>
  );
}

// ─── Layout atoms ─────────────────────────────────────────────────────

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 14, paddingBottom: 14, borderBottom: "1px solid #f1f5f9" }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#1e293b", marginBottom: 8 }}>{title}</div>
      {children}
    </div>
  );
}

function Sub({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 10, fontWeight: 600, color: "#6b7280", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

// ─── Style atoms ──────────────────────────────────────────────────────

const miniBtn: CSSProperties = {
  fontSize: 12, padding: "5px 12px", border: "1px solid var(--app-border)",
  borderRadius: 4, background: "white", cursor: "pointer",
};
const miniSelectBtn: CSSProperties = {
  border: "1px solid #e5e7eb", borderRadius: 4, background: "white", cursor: "pointer",
  color: "#374151", padding: "4px 6px", fontSize: 10,
};
const activeBorder: CSSProperties = { border: "2px solid var(--app-accent)" };
const inputStyle: CSSProperties = {
  width: "100%", padding: "5px 8px", fontSize: 11, border: "1px solid #d1d5db", borderRadius: 4,
};

// quiet unused-vars warnings on imports kept for type narrowing
const _kept = () => HEADING_STYLE_VALUES.length;
void _kept;
