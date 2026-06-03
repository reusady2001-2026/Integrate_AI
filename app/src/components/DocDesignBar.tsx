"use client";

import { useState, useRef, useEffect, type CSSProperties } from "react";
import {
  DOC_THEMES,
  DOC_FONT_OPTIONS,
  PALETTES,
  getPalette,
  resolveDocTheme,
  defaultDocDesign,
  type DocCustomPalette,
  type DocDesign,
  type PaletteId,
} from "@/lib/themes/doc-themes";
import { TABLE_STYLE_DEFS, type TableStyle, type TableStyleDef } from "@/lib/formatting";

export interface DocDesignProps {
  design: DocDesign;
  setDocTheme: (id: string) => void;
  setDocPaletteOverride: (id: string) => void;
  setDocCustomPalette: (patch: Partial<DocCustomPalette>) => void;
  resetDocDesign: () => void;
  setDocFormatting: (patch: Partial<Pick<DocDesign, "titleFont" | "bodyFont" | "fontSize" | "titleScale" | "bodyScale" | "tableStyle">>) => void;
  lang: string;
}

export function DocDesignBar({
  design,
  setDocTheme,
  setDocPaletteOverride,
  setDocCustomPalette,
  resetDocDesign,
  setDocFormatting,
  lang,
}: DocDesignProps) {
  const [themeOpen, setThemeOpen] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);

  const themeRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);
  const formatRef = useRef<HTMLDivElement>(null);

  useClickOutside(themeRef, themeOpen, () => setThemeOpen(false));
  useClickOutside(paletteRef, paletteOpen, () => setPaletteOpen(false));
  useClickOutside(formatRef, formatOpen, () => setFormatOpen(false));

  const isHe = lang === "he";
  const currentTheme = DOC_THEMES.find((t) => t.id === design.theme) ?? DOC_THEMES[0];
  const eff = resolveDocTheme(design.theme, design);
  const basePaletteId = (design.paletteOverride || currentTheme.palette) as PaletteId;
  const basePalette = getPalette(basePaletteId);

  return (
    <>
      {/* ── Theme picker ── */}
      <div ref={themeRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => { setThemeOpen((o) => !o); setPaletteOpen(false); setFormatOpen(false); }}
          className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
        >
          {isHe ? `עיצוב (${currentTheme.name_he})` : `Theme (${currentTheme.name_en})`}
        </button>

        {themeOpen && (
          <div style={popoverStyle(isHe)}><div style={{ padding: 14 }} dir={isHe ? "rtl" : "ltr"}>
            <div style={popoverHeader}>{isHe ? "עיצוב מסמך" : "Document theme"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 8, maxHeight: 420, overflowY: "auto" }}>
              {DOC_THEMES.map((th) => {
                const isSelected = th.id === design.theme;
                const thEff = resolveDocTheme(th.id, { ...defaultDocDesign(), theme: th.id });
                return (
                  <button
                    key={th.id}
                    type="button"
                    onClick={() => { setDocTheme(th.id); setThemeOpen(false); }}
                    title={isHe ? th.name_he : th.name_en}
                    style={{
                      border: isSelected ? "2px solid var(--app-accent)" : "1px solid #e5e7eb",
                      borderRadius: 6,
                      cursor: "pointer",
                      background: "transparent",
                      padding: 0,
                      overflow: "hidden",
                      display: "flex",
                      flexDirection: "column",
                    }}
                  >
                    <DocThemeMiniPreview eff={thEff} headingStyle={th.headingStyle} />
                    <div style={{ fontSize: 9, padding: "3px 4px", textAlign: "center", color: "#374151", lineHeight: 1.3, background: "white" }}>
                      {isHe ? th.name_he : th.name_en}
                    </div>
                  </button>
                );
              })}
            </div>
          </div></div>
        )}
      </div>

      {/* ── Palette picker ── */}
      <div ref={paletteRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => { setPaletteOpen((o) => !o); setThemeOpen(false); setFormatOpen(false); }}
          className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
          style={{ display: "flex", alignItems: "center", gap: 5 }}
        >
          {(["accent", "bg"] as const).map((k) => {
            const color = k === "accent" ? (design.customPalette.accent || basePalette.accent) : (design.customPalette.bg || basePalette.bg);
            return <span key={k} style={{ width: 10, height: 10, borderRadius: "50%", background: color, border: "1px solid rgba(0,0,0,0.15)" }} />;
          })}
          {isHe ? "פלטה" : "Palette"}
        </button>

        {paletteOpen && (
          <div style={popoverStyle(isHe)}><div style={{ padding: 14 }} dir={isHe ? "rtl" : "ltr"}>
            <div style={popoverHeader}>{isHe ? "פלטת צבעים" : "Colour palette"}</div>

            <div style={sectionLabel}>{isHe ? "ערכת צבעים בסיסית" : "Base colour set"}</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 5, marginBottom: 14 }}>
              <button type="button"
                onClick={() => setDocPaletteOverride("")}
                style={{ ...palettePresetBtn, border: !design.paletteOverride ? "2px solid var(--app-accent)" : "1px solid #d1d5db", background: !design.paletteOverride ? "#f0f7ff" : "white" }}>
                {isHe ? "ברירת מחדל" : "Default"}
              </button>
              {(Object.keys(PALETTES) as PaletteId[]).map((pid) => {
                const p = PALETTES[pid];
                const isActive = design.paletteOverride === pid;
                return (
                  <button key={pid} type="button"
                    onClick={() => setDocPaletteOverride(pid)}
                    title={pid}
                    style={{ padding: 0, border: isActive ? "2px solid var(--app-accent)" : "1px solid #d1d5db", borderRadius: 5, cursor: "pointer", overflow: "hidden", height: 32 }}>
                    <div style={{ height: "55%", background: p.coverGradient }} />
                    <div style={{ height: "45%", background: p.bgGradient, display: "flex", alignItems: "center", gap: 3, paddingInline: 4 }}>
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.accent, flexShrink: 0 }} />
                      <span style={{ width: 5, height: 5, borderRadius: "50%", background: p.accent2, flexShrink: 0 }} />
                    </div>
                  </button>
                );
              })}
            </div>

            <div style={sectionLabel}>{isHe ? "כיוונון ידני (4 צבעים)" : "Custom colours (fine-tune)"}</div>
            <DocCustomPaletteEditor
              cp={design.customPalette}
              basePalette={basePalette}
              onChange={setDocCustomPalette}
              lang={lang}
            />

            <button type="button" onClick={resetDocDesign}
              style={{ marginTop: 12, width: "100%", padding: "6px 0", fontSize: 11, border: "1px solid #d1d5db", borderRadius: 5, cursor: "pointer", background: "white", color: "#6b7280" }}>
              {isHe ? "איפוס כל העיצוב" : "Reset all design"}
            </button>
          </div></div>
        )}
      </div>

      {/* ── Format panel ── */}
      <div ref={formatRef} style={{ position: "relative" }}>
        <button
          type="button"
          onClick={() => { setFormatOpen((o) => !o); setThemeOpen(false); setPaletteOpen(false); }}
          className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
        >
          {isHe ? "פורמט" : "Format"}
        </button>

        {formatOpen && (
          <div style={{ ...popoverStyle(isHe), width: 320 }}><div style={{ padding: 14 }} dir={isHe ? "rtl" : "ltr"}>
            <div style={popoverHeader}>{isHe ? "פורמטציה" : "Formatting"}</div>

            <FmtRow label={isHe ? "גופן כותרות" : "Heading font"}>
              <FontSelect value={design.titleFont} onChange={(v) => setDocFormatting({ titleFont: v })} />
            </FmtRow>
            <FmtRow label={isHe ? "גופן טקסט" : "Body font"}>
              <FontSelect value={design.bodyFont} onChange={(v) => setDocFormatting({ bodyFont: v })} />
            </FmtRow>
            <FmtRow label={isHe ? `גודל טקסט — ${design.fontSize}pt` : `Font size — ${design.fontSize}pt`}>
              <input type="range" min={8} max={15} step={0.5}
                value={design.fontSize}
                onChange={(e) => setDocFormatting({ fontSize: Number(e.target.value) })}
                style={{ width: "100%" }} />
            </FmtRow>
            <FmtRow label={isHe ? `גודל כותרות — ×${design.titleScale.toFixed(2)}` : `Title scale — ×${design.titleScale.toFixed(2)}`}>
              <input type="range" min={0.7} max={1.5} step={0.05}
                value={design.titleScale}
                onChange={(e) => setDocFormatting({ titleScale: Number(e.target.value) })}
                style={{ width: "100%" }} />
            </FmtRow>

            <div style={{ marginBottom: 8 }}>
              <span style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6, color: "#374151" }}>
                {isHe ? "סגנון טבלה" : "Table style"}
              </span>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 5 }}>
                {(Object.keys(TABLE_STYLE_DEFS) as TableStyle[]).map((ts) => {
                  const def = TABLE_STYLE_DEFS[ts];
                  const isActive = design.tableStyle === ts;
                  return (
                    <button key={ts} type="button"
                      onClick={() => setDocFormatting({ tableStyle: ts })}
                      title={isHe ? def.nameHe : def.nameEn}
                      style={{
                        border: isActive ? "2px solid var(--app-accent)" : "1px solid #e5e7eb",
                        borderRadius: 5, cursor: "pointer",
                        background: "transparent", padding: 0,
                        overflow: "hidden", display: "flex", flexDirection: "column",
                      }}>
                      <TableStyleMiniPreview def={def} eff={eff} />
                      <div style={{ fontSize: 8, padding: "2px 3px 3px", textAlign: "center", color: "#374151", lineHeight: 1.3, background: "white", width: "100%" }}>
                        {isHe ? def.nameHe : def.nameEn}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <button type="button"
              onClick={() => setDocFormatting({ titleFont: "", bodyFont: "", fontSize: 11, titleScale: 1, bodyScale: 1, tableStyle: "classic" })}
              style={{ width: "100%", padding: "5px 0", fontSize: 11, border: "1px solid #d1d5db", borderRadius: 5, cursor: "pointer", background: "white", color: "#6b7280" }}>
              {isHe ? "איפוס פורמט" : "Reset format"}
            </button>
          </div></div>
        )}
      </div>
    </>
  );
}

// ─── Mini document theme preview ─────────────────────────────────────

function DocThemeMiniPreview({ eff, headingStyle }: {
  eff: ReturnType<typeof resolveDocTheme>;
  headingStyle: string;
}) {
  const w = 72, h = 54;
  return (
    <div style={{ width: w, height: h, background: eff.surface, position: "relative", overflow: "hidden", flexShrink: 0 }}>
      {/* Heading style indicator */}
      {headingStyle === "classic" && (
        <div style={{ position: "absolute", top: 10, insetInlineStart: 0, insetInlineEnd: 6, paddingInlineStart: 8, borderInlineStart: `3px solid ${eff.accent}` }}>
          <div style={{ height: 4, width: 36, background: eff.fg, opacity: 0.75, borderRadius: 2 }} />
        </div>
      )}
      {headingStyle === "minimal" && (
        <div style={{ position: "absolute", top: 10, insetInlineStart: 6, insetInlineEnd: 6, borderBottom: `2px solid ${eff.accent}`, paddingBottom: 4 }}>
          <div style={{ height: 4, width: 36, background: eff.fg, opacity: 0.75, borderRadius: 2 }} />
        </div>
      )}
      {headingStyle === "bold" && (
        <div style={{ position: "absolute", top: 8, insetInlineStart: 6, insetInlineEnd: 6, borderTop: `3px solid ${eff.accent}`, paddingTop: 5 }}>
          <div style={{ height: 4, width: 28, background: eff.fg, opacity: 0.85, borderRadius: 1 }} />
        </div>
      )}
      {headingStyle === "editorial" && (
        <div style={{ position: "absolute", top: 12, insetInlineStart: 6, insetInlineEnd: 6, borderBottom: `1px solid ${eff.border}`, paddingBottom: 4 }}>
          <div style={{ height: 6, width: 42, background: eff.fg, opacity: 0.45, borderRadius: 2 }} />
        </div>
      )}
      {headingStyle === "modern" && (
        <div style={{ position: "absolute", top: 8, left: 0, right: 0, height: 14, background: eff.accent, opacity: 0.9 }} />
      )}
      {headingStyle === "magazine" && (
        <div style={{ position: "absolute", top: 8, left: 0, right: 0, height: 16, background: eff.accent }} />
      )}

      {/* Body text lines */}
      <div style={{ position: "absolute", bottom: 10, insetInlineStart: 8, insetInlineEnd: 8 }}>
        <div style={{ height: 2, background: eff.fg, opacity: 0.18, borderRadius: 1, marginBottom: 4 }} />
        <div style={{ height: 2, background: eff.fg, opacity: 0.13, width: "65%", borderRadius: 1, marginBottom: 4 }} />
        <div style={{ height: 2, background: eff.fg, opacity: 0.10, width: "80%", borderRadius: 1 }} />
      </div>

      {/* Accent dot */}
      <div style={{ position: "absolute", bottom: 6, insetInlineEnd: 8, width: 6, height: 6, borderRadius: "50%", background: eff.accent2, opacity: 0.8 }} />
    </div>
  );
}

// ─── Table style mini preview ─────────────────────────────────────────

function blendHex(base: string, over: string, alpha: number): string {
  const parse = (h: string): [number, number, number] => {
    const c = h.replace("#", "");
    const s = c.length === 3 ? [c[0]+c[0], c[1]+c[1], c[2]+c[2]] : [c.slice(0,2), c.slice(2,4), c.slice(4,6)];
    return s.map((x) => parseInt(x, 16)) as [number, number, number];
  };
  try {
    const [br, bg, bb] = parse(base);
    const [or, og, ob] = parse(over);
    return `#${Math.round(br+(or-br)*alpha).toString(16).padStart(2,"0")}${Math.round(bg+(og-bg)*alpha).toString(16).padStart(2,"0")}${Math.round(bb+(ob-bb)*alpha).toString(16).padStart(2,"0")}`;
  } catch { return base; }
}

function TableStyleMiniPreview({ def, eff }: {
  def: TableStyleDef;
  eff: ReturnType<typeof resolveDocTheme>;
}) {
  const headerBg = { white: eff.surface, light: blendHex(eff.surface, eff.fg, 0.08), medium: blendHex(eff.surface, eff.fg, 0.15), accent: eff.accent, dark: eff.fg }[def.headerBg];
  const headerFgColor = def.headerFg === "white" ? eff.surface : eff.fg;
  const altBg = { none: eff.surface, light: blendHex(eff.surface, eff.fg, 0.04), "accent-light": blendHex(eff.surface, eff.accent, 0.07) }[def.altBg];
  const innerHColor = def.innerH === "none" ? "" : def.innerH === "thin" ? eff.borderSoft : eff.border;
  const innerVColor = def.innerV === "none" ? "" : def.innerV === "thin" ? eff.borderSoft : eff.border;
  const innerHBorder = innerHColor ? `1px solid ${innerHColor}` : "none";
  const innerVBorder = innerVColor ? `1px solid ${innerVColor}` : "none";
  const headerBottom = def.headerBottomBold ? `2px solid ${eff.accent}` : innerHColor ? `1px solid ${innerHColor}` : "none";
  const outerBorder = def.outerBorder === "none" ? undefined
    : def.outerBorder === "thin" ? `1px solid ${eff.borderSoft}`
    : def.outerBorder === "normal" ? `1px solid ${eff.border}`
    : `2px solid ${eff.accent}`;
  const rowBg = (r: number) => def.altRows && r % 2 === 1 ? altBg : eff.surface;

  return (
    <div style={{ background: eff.surface, overflow: "hidden", border: outerBorder }}>
      <div style={{ display: "flex", height: 13, background: headerBg, borderBottom: headerBottom }}>
        {[0, 1, 2].map((c) => (
          <div key={c} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", borderRight: c < 2 ? innerVBorder : "none" }}>
            <div style={{ height: 2, width: "50%", background: headerFgColor, opacity: 0.65, borderRadius: 1 }} />
          </div>
        ))}
      </div>
      {[0, 1, 2].map((r) => (
        <div key={r} style={{ display: "flex", height: 10, background: rowBg(r), borderBottom: r < 2 ? innerHBorder : "none" }}>
          {[0, 1, 2].map((c) => (
            <div key={c} style={{ flex: 1, display: "flex", alignItems: "center", paddingLeft: 3, borderRight: c < 2 ? innerVBorder : "none" }}>
              <div style={{ height: 2, width: c === 0 ? "60%" : "40%", background: eff.fg, opacity: 0.2, borderRadius: 1 }} />
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}

// ─── Custom palette editor (4 colors for documents) ──────────────────

function DocCustomPaletteEditor({
  cp,
  basePalette,
  onChange,
  lang,
}: {
  cp: DocCustomPalette;
  basePalette: ReturnType<typeof getPalette>;
  onChange: (patch: Partial<DocCustomPalette>) => void;
  lang: string;
}) {
  const fields: { key: keyof DocCustomPalette; labelHe: string; labelEn: string; baseVal: string }[] = [
    { key: "bg",      labelHe: "רקע מסמך",     labelEn: "Document background", baseVal: basePalette.bg },
    { key: "accent",  labelHe: "הדגשה ראשית",  labelEn: "Primary accent",       baseVal: basePalette.accent },
    { key: "accent2", labelHe: "הדגשה משנית",  labelEn: "Secondary accent",     baseVal: basePalette.accent2 },
    { key: "text",    labelHe: "צבע טקסט",     labelEn: "Text colour",          baseVal: basePalette.text },
  ];
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 4 }}>
      {fields.map(({ key, labelHe, labelEn, baseVal }) => {
        const current = cp[key] || baseVal;
        const isCustom = !!cp[key];
        return (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input type="color" value={current}
              onChange={(e) => onChange({ [key]: e.target.value })}
              style={{ width: 36, height: 28, border: "1px solid #d1d5db", borderRadius: 4, cursor: "pointer", padding: 2, flexShrink: 0 }} />
            <span style={{ flex: 1, fontSize: 11, color: "#374151" }}>
              {lang === "he" ? labelHe : labelEn}
              {isCustom && <span style={{ color: "var(--app-accent)", marginInlineStart: 4 }}>✓</span>}
            </span>
            {isCustom && (
              <button type="button" onClick={() => onChange({ [key]: "" })}
                style={{ fontSize: 10, color: "#9ca3af", background: "none", border: "none", cursor: "pointer", padding: "0 2px" }}>
                ✕
              </button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────

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

function FmtRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 10 }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 5, color: "#374151" }}>{label}</span>
      {children}
    </label>
  );
}

function useClickOutside(ref: React.RefObject<HTMLDivElement | null>, active: boolean, onClose: () => void) {
  useEffect(() => {
    if (!active) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) onClose();
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [active, ref, onClose]);
}

// html[dir=rtl] is always set in layout.tsx, so the design buttons always
// sit on the visual LEFT of the screen. Always anchor the popover's left
// edge so it grows rightward and stays in-viewport.
// IMPORTANT: do NOT put the dir attribute on this element — if dir="ltr"
// is on the same element as inset-inline-end, the browser resolves that
// logical property as "right" (LTR end), sending the panel off-screen.
// The dir attribute belongs on the inner content wrapper instead.
const popoverStyle = (_isHe: boolean): CSSProperties => ({
  position: "absolute",
  top: "calc(100% + 4px)",
  left: 0,
  width: 420,
  maxHeight: "calc(100vh - 80px)",
  overflowY: "auto",
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 8,
  boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
  zIndex: 100,
});

const popoverHeader: CSSProperties = {
  fontSize: 12,
  fontWeight: 700,
  color: "#1e293b",
  marginBottom: 12,
};

const sectionLabel: CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  color: "#374151",
  marginBottom: 6,
};

const palettePresetBtn: CSSProperties = {
  padding: "5px 4px",
  fontSize: 9,
  borderRadius: 5,
  cursor: "pointer",
  color: "#374151",
  lineHeight: 1.3,
};
