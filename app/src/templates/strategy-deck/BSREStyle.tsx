"use client";

/**
 * BSRE-style rich content layouts for the strategy-deck template.
 *
 * Each render function below corresponds to a `kind` on the Slide schema
 * (see schemas/strategy-deck.ts). They produce a self-contained board-deck
 * page modeled on the user-supplied BSRE reference: a very light cool-gray
 * background, dark navy/teal headings, oversized stat values, color-coded
 * gradient cards, severity chips, and consistent horizontal rules.
 *
 * These renderers intentionally bypass the per-theme palette — the design
 * language is uniform across themes so a deck always reads at this level.
 * The only thing that flows through from `ctx` is the RTL direction, the
 * editability flags, and the typography pair.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";

// ──────────────────────────────────────────────────────────────────────
// Fixed BSRE-inspired palette.
// ──────────────────────────────────────────────────────────────────────
export const BSRE = {
  bg: "#ECF0F2",            // page background (very light cool gray)
  bgAlt: "#E4EAEE",
  surface: "#FFFFFF",       // white card surface
  rule: "#D7DDE2",          // horizontal rule
  text: "#0F2D52",          // primary dark navy text
  textMuted: "#56708F",     // secondary
  teal: "#1E7E76",          // primary teal accent (eyebrows, titles)
  tealDark: "#155A54",
  tealLight: "#2DA59C",
  tealChipBg: "#CBE5E1",    // pale teal for chip backgrounds
  navy: "#0F2D52",
  navyDeep: "#0A1F3A",
  navyMid: "#1B4670",
  blue: "#2872B5",
  blueDark: "#1F578E",
  // Severity chip colors:
  chipHighBg: "#E5D5DC",    chipHighText: "#5F2A45",
  chipMedBg:  "#CBE5E1",    chipMedText:  "#155A54",
  chipLowBg:  "#D7E8F1",    chipLowText:  "#1F578E",
  chipNeutralBg: "#E2E7EB", chipNeutralText: "#3A5275",
};

// ──────────────────────────────────────────────────────────────────────
// Shared chrome — top header strip + page number, used by every content
// slide in the BSRE style. Renders at the slide's edge.
// ──────────────────────────────────────────────────────────────────────
export function BSREChrome({
  company,
  pageNumber,
  totalPages,
  isRtl,
}: { company: string; pageNumber?: number; totalPages?: number; isRtl: boolean; }) {
  return (
    <>
      {/* Top bar: company chip + accent square (right in RTL) */}
      <div style={{
        position: "absolute", top: 24, [isRtl ? "right" : "left"]: 36,
        display: "flex", alignItems: "center", gap: 10,
        fontFamily: "system-ui, sans-serif", fontSize: 12, color: BSRE.text,
      }}>
        <span style={{ display: "inline-block", width: 14, height: 14, borderRadius: 3,
          background: `linear-gradient(135deg, ${BSRE.teal}, ${BSRE.tealDark})` }} />
        <span style={{ fontWeight: 600, letterSpacing: 0.2 }}>{company}</span>
      </div>
      {/* Page number top-far corner */}
      {pageNumber !== undefined && (
        <div style={{
          position: "absolute", top: 24, [isRtl ? "left" : "right"]: 36,
          fontFamily: "system-ui, sans-serif", fontSize: 11, color: BSRE.textMuted, letterSpacing: 1,
        }}>
          {String(pageNumber).padStart(2, "0")} / {totalPages ?? "—"}
        </div>
      )}
      {/* Horizontal rule under the top bar */}
      <div style={{
        position: "absolute", top: 56, left: 36, right: 36,
        height: 1, background: BSRE.rule,
      }} />
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Small eyebrow text shown above each slide title (teal, letter-spaced).
// ──────────────────────────────────────────────────────────────────────
function Eyebrow({ text }: { text: string }) {
  if (!text) return null;
  return (
    <div style={{
      fontSize: 11, color: BSRE.teal, letterSpacing: 5, fontWeight: 700,
      textTransform: "uppercase", marginBottom: 12,
    }}>
      {text}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Title block. Title is large and split-color: most words navy, the last
// fragment after " — " in teal (matching BSRE typography pattern).
// ──────────────────────────────────────────────────────────────────────
function SlideTitle({ title, fontSize = 32 }: { title: string; fontSize?: number }) {
  // If the title contains " — " we color the right half teal.
  const parts = title.split(" — ");
  return (
    <div style={{
      fontSize, lineHeight: 1.15, fontWeight: 800, color: BSRE.text,
      fontFamily: "system-ui, sans-serif",
    }}>
      {parts[0]}
      {parts.length > 1 && (
        <span style={{ color: BSRE.teal }}>{" — " + parts.slice(1).join(" — ")}</span>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Page shell. Every BSRE content slide uses this base.
// ──────────────────────────────────────────────────────────────────────
function BSREPage({
  children, isRtl, company, pageNumber, totalPages,
}: { children: ReactNode; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number; }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: BSRE.bg, color: BSRE.text,
      direction: isRtl ? "rtl" : "ltr",
      fontFamily: "system-ui, sans-serif",
    }}>
      <BSREChrome company={company} pageNumber={pageNumber} totalPages={totalPages} isRtl={isRtl} />
      <div style={{
        position: "absolute", top: 88, left: 36, right: 36, bottom: 28,
        display: "flex", flexDirection: "column",
      }}>
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Stat tile — used by both `kpi-card` (one giant) and `stats` (a row).
// ──────────────────────────────────────────────────────────────────────
function StatTile({ stat, hero = false }: { stat: { value?: string; unit?: string; label?: string; caption?: string; variant?: string }; hero?: boolean; }) {
  const variant = stat.variant ?? "white";
  const variants: Record<string, CSSProperties> = {
    teal:           { background: `linear-gradient(135deg, ${BSRE.teal}, ${BSRE.tealDark})`, color: "#fff" },
    "gradient-teal":{ background: `linear-gradient(135deg, ${BSRE.tealLight}, ${BSRE.tealDark})`, color: "#fff" },
    navy:           { background: `linear-gradient(135deg, ${BSRE.navyMid}, ${BSRE.navyDeep})`, color: "#fff" },
    "gradient-navy":{ background: `linear-gradient(135deg, ${BSRE.navyMid}, ${BSRE.navyDeep})`, color: "#fff" },
    blue:           { background: `linear-gradient(135deg, ${BSRE.blue}, ${BSRE.blueDark})`, color: "#fff" },
    white:          { background: "#fff", color: BSRE.text, boxShadow: "0 1px 0 rgba(0,0,0,0.04)" },
  };
  const cardStyle: CSSProperties = {
    borderRadius: 10, padding: hero ? "20px 22px" : "14px 16px",
    display: "flex", flexDirection: "column", justifyContent: "flex-end",
    minHeight: hero ? 130 : 96,
    ...variants[variant],
  };
  const valueColor = variant === "white" ? BSRE.text : "#fff";
  const labelColor = variant === "white" ? BSRE.textMuted : "rgba(255,255,255,0.78)";
  return (
    <div style={cardStyle}>
      <div style={{ fontSize: 11, color: labelColor, marginBottom: 4, letterSpacing: 0.3 }}>{stat.label}</div>
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <span style={{ fontSize: hero ? 56 : 38, fontWeight: 800, lineHeight: 1, color: valueColor }}>{stat.value}</span>
        {stat.unit && <span style={{ fontSize: hero ? 16 : 13, fontWeight: 600, color: valueColor }}>{stat.unit}</span>}
      </div>
      {stat.caption && <div style={{ fontSize: 11, marginTop: 6, color: labelColor }}>{stat.caption}</div>}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Severity chip — used by the table layout.
// ──────────────────────────────────────────────────────────────────────
function Chip({ text, variant = "neutral", small = false }: { text: string; variant?: "high" | "med" | "low" | "neutral"; small?: boolean }) {
  const palette = {
    high:    { bg: BSRE.chipHighBg, text: BSRE.chipHighText },
    med:     { bg: BSRE.chipMedBg, text: BSRE.chipMedText },
    low:     { bg: BSRE.chipLowBg, text: BSRE.chipLowText },
    neutral: { bg: BSRE.chipNeutralBg, text: BSRE.chipNeutralText },
  }[variant];
  return (
    <span style={{
      display: "inline-block", padding: small ? "2px 9px" : "4px 12px", borderRadius: 999,
      background: palette.bg, color: palette.text,
      fontSize: small ? 10 : 11, fontWeight: 700, letterSpacing: 0.2,
    }}>{text}</span>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Slide head — eyebrow + big title + optional subtitle paragraph.
// ──────────────────────────────────────────────────────────────────────
function SlideHead({
  eyebrow, title, subtitle, isRtl, titleSize = 32, alignEnd = true,
}: { eyebrow?: string; title?: string; subtitle?: string; isRtl: boolean; titleSize?: number; alignEnd?: boolean; }) {
  return (
    <div style={{ textAlign: alignEnd ? (isRtl ? "right" : "left") : "left", marginBottom: 18 }}>
      <Eyebrow text={eyebrow ?? ""} />
      {title && <SlideTitle title={title} fontSize={titleSize} />}
      {subtitle && (
        <div style={{
          fontSize: 14, color: BSRE.textMuted, marginTop: 10, lineHeight: 1.55,
          maxWidth: 720, marginLeft: alignEnd ? (isRtl ? 0 : "auto") : 0,
        }}>
          {subtitle}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 1. STATS — horizontal row of oversized stat tiles + optional sub-row.
// ──────────────────────────────────────────────────────────────────────
export function BSREStats({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const stats = slide.stats ?? [];
  // Split: first row uses up to 4 hero tiles; remaining as a flat sub-row.
  const hero = stats.slice(0, 4);
  const sub = stats.slice(4);
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length || 1}, 1fr)`, gap: 14, marginTop: 8 }}>
        {hero.map((s, i) => <StatTile key={i} stat={s} hero />)}
      </div>
      {sub.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 14, marginTop: 14 }}>
          {sub.map((s, i) => <StatTile key={i} stat={s} />)}
        </div>
      )}
      {slide.footnote && (
        <div style={{ marginTop: "auto", paddingTop: 12, color: BSRE.textMuted, fontSize: 12 }}>{slide.footnote}</div>
      )}
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 2. KPI-CARD — body text on one side + hero stat card on the other.
// ──────────────────────────────────────────────────────────────────────
export function BSREKpiCard({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const stat = (slide.stats ?? [])[0];
  const stat2 = (slide.stats ?? [])[1];
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, flex: 1 }}>
        {/* Left: stat tiles */}
        <div style={{ display: "flex", flexDirection: "column", gap: 14, justifyContent: "center" }}>
          {stat && <StatTile stat={stat} hero />}
          {stat2 && <StatTile stat={stat2} />}
        </div>
        {/* Right: heading + body */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center" }}>
          <Eyebrow text={slide.eyebrow ?? ""} />
          <SlideTitle title={slide.title} fontSize={34} />
          {slide.body && (
            <div style={{ fontSize: 14, color: BSRE.text, marginTop: 16, lineHeight: 1.6, whiteSpace: "pre-wrap" }}>
              {slide.body}
            </div>
          )}
        </div>
      </div>
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 3. HORIZONS — 3 column horizon cards (e.g. 2026 base / 2028 / 2030).
// ──────────────────────────────────────────────────────────────────────
export function BSREHorizons({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const cards = slide.horizons ?? [];
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 14, marginTop: 8 }}>
        {cards.map((c, i) => {
          const tealCard = c.variant === "teal";
          const navyCard = c.variant === "navy";
          const bg = tealCard ? `linear-gradient(135deg, ${BSRE.teal}, ${BSRE.tealDark})`
                  : navyCard ? `linear-gradient(135deg, ${BSRE.navyMid}, ${BSRE.navyDeep})`
                  : "#fff";
          const fg = tealCard || navyCard ? "#fff" : BSRE.text;
          const muted = tealCard || navyCard ? "rgba(255,255,255,0.78)" : BSRE.textMuted;
          const rowBorder = tealCard || navyCard ? "rgba(255,255,255,0.16)" : BSRE.rule;
          return (
            <div key={i} style={{ background: bg, borderRadius: 10, padding: "18px 18px", color: fg, minHeight: 230 }}>
              <div style={{ fontSize: 11, color: muted, letterSpacing: 0.6, marginBottom: 6 }}>{c.eyebrow}</div>
              <div style={{ fontSize: 50, fontWeight: 800, lineHeight: 1, color: fg, marginBottom: 8 }}>{c.bigText}</div>
              {c.caption && <div style={{ fontSize: 12, color: muted, marginBottom: 12 }}>{c.caption}</div>}
              <div>
                {(c.rows ?? []).map((r, ri) => (
                  <div key={ri} style={{
                    display: "flex", justifyContent: "space-between", padding: "6px 0",
                    fontSize: 12, borderBottom: ri < (c.rows ?? []).length - 1 ? `1px solid ${rowBorder}` : "none",
                  }}>
                    <span style={{ color: fg, fontWeight: 600 }}>{r.label}</span>
                    <span style={{ color: muted }}>{r.value}</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {slide.footnote && (
        <div style={{ marginTop: 16, color: BSRE.textMuted, fontSize: 12, lineHeight: 1.6 }}>{slide.footnote}</div>
      )}
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 4. GRID — 4 numbered cards (the "relative advantages" layout).
// ──────────────────────────────────────────────────────────────────────
export function BSREGrid({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const cards = slide.gridCards ?? [];
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
        {cards.map((c, i) => (
          <div key={i} style={{
            background: "#fff", borderRadius: 10, padding: "18px 20px",
            boxShadow: "0 1px 0 rgba(0,0,0,0.04)",
          }}>
            <div style={{ fontSize: 28, fontWeight: 800, color: BSRE.teal, lineHeight: 1, marginBottom: 8 }}>{c.index}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: BSRE.text, marginBottom: 8 }}>{c.title}</div>
            <div style={{ fontSize: 12.5, color: BSRE.textMuted, lineHeight: 1.55 }}>{c.description}</div>
          </div>
        ))}
      </div>
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 5. TRACKS — 3 numbered tracks with chip footer (the "3 axes" layout).
// ──────────────────────────────────────────────────────────────────────
export function BSRETracks({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const tracks = slide.tracks ?? [];
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tracks.length || 1}, 1fr)`, gap: 14, marginTop: 8 }}>
        {tracks.map((tk, i) => {
          const v = tk.variant;
          const isDark = v === "teal" || v === "navy" || v === "blue";
          const bg =
            v === "teal" ? `linear-gradient(135deg, ${BSRE.teal}, ${BSRE.tealDark})` :
            v === "navy" ? `linear-gradient(135deg, ${BSRE.navyMid}, ${BSRE.navyDeep})` :
            v === "blue" ? `linear-gradient(135deg, ${BSRE.blue}, ${BSRE.blueDark})` :
            "#fff";
          const fg = isDark ? "#fff" : BSRE.text;
          const muted = isDark ? "rgba(255,255,255,0.82)" : BSRE.textMuted;
          const chipBg = isDark ? "rgba(255,255,255,0.18)" : BSRE.tealChipBg;
          const chipText = isDark ? "#fff" : BSRE.tealDark;
          return (
            <div key={i} style={{
              background: bg, borderRadius: 10, padding: "20px 20px", color: fg,
              minHeight: 250, display: "flex", flexDirection: "column",
            }}>
              <div style={{ fontSize: 11, color: muted, letterSpacing: 0.5, marginBottom: 8 }}>
                {tk.eyebrow || `מסלול ${tk.index}`}
              </div>
              <div style={{ fontSize: 20, fontWeight: 800, color: fg, lineHeight: 1.2, marginBottom: 12 }}>{tk.title}</div>
              <div style={{ fontSize: 12.5, color: muted, lineHeight: 1.6, flex: 1 }}>{tk.description}</div>
              {tk.chip && (
                <div style={{ marginTop: 14 }}>
                  <span style={{
                    display: "inline-block", padding: "5px 12px", borderRadius: 999,
                    background: chipBg, color: chipText, fontSize: 11, fontWeight: 700,
                  }}>{tk.chip}</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
      {slide.footnote && (
        <div style={{
          marginTop: 14, padding: "10px 16px", borderRadius: 6,
          background: `linear-gradient(90deg, ${BSRE.teal}, ${BSRE.tealDark})`, color: "#fff",
          fontSize: 12, fontWeight: 600, display: "flex", justifyContent: "space-between", alignItems: "center",
        }}>
          <span>{slide.footnote}</span>
          {slide.footnoteChip && <span style={{ opacity: 0.85 }}>{slide.footnoteChip}</span>}
        </div>
      )}
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 6. TOC — numbered two-column TOC.
// ──────────────────────────────────────────────────────────────────────
export function BSREToc({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const items = slide.tocItems ?? [];
  const half = Math.ceil(items.length / 2);
  // RTL: column 1 (1..half) on the right, column 2 on the left.
  const col1 = items.slice(0, half);
  const col2 = items.slice(half);
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} titleSize={36} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 36, marginTop: 12 }}>
        {[col1, col2].map((col, ci) => (
          <div key={ci}>
            {col.map((it, i) => (
              <div key={i} style={{
                display: "flex", alignItems: "flex-start", gap: 14, padding: "12px 0",
                borderBottom: `1px solid ${BSRE.rule}`,
              }}>
                <div style={{ fontSize: 16, fontWeight: 800, color: BSRE.teal, minWidth: 32 }}>{it.index}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: BSRE.text }}>{it.title}</div>
                  {it.subtitle && <div style={{ fontSize: 11.5, color: BSRE.textMuted, marginTop: 3 }}>{it.subtitle}</div>}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 7. TABLE — data table with severity chips on the right edge.
// ──────────────────────────────────────────────────────────────────────
export function BSRETable({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const headers = slide.tableHeaders ?? [];
  const rows = slide.tableRows ?? [];
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} />
      <div style={{ background: "#fff", borderRadius: 10, padding: "4px 0", overflow: "hidden", boxShadow: "0 1px 0 rgba(0,0,0,0.04)" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12.5 }}>
          <thead>
            <tr style={{ background: BSRE.bgAlt }}>
              {headers.map((h, i) => (
                <th key={i} style={{ textAlign: isRtl ? "right" : "left", padding: "12px 16px", fontWeight: 700, color: BSRE.teal, fontSize: 11.5, letterSpacing: 0.3 }}>{h}</th>
              ))}
              {rows.some((r) => r.chip) && <th style={{ padding: "12px 16px" }}></th>}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{
                borderTop: `1px solid ${BSRE.rule}`,
                background: row.emphasize ? BSRE.bgAlt : "transparent",
                fontWeight: row.emphasize ? 700 : 500,
              }}>
                {row.cells.map((cell, ci) => (
                  <td key={ci} style={{ padding: "12px 16px", color: BSRE.text, lineHeight: 1.5 }}>{cell}</td>
                ))}
                {row.chip && (
                  <td style={{ padding: "12px 16px", textAlign: isRtl ? "left" : "right" }}>
                    <Chip text={row.chip} variant={row.chipVariant ?? "neutral"} small />
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {slide.footnote && (
        <div style={{ marginTop: 14, color: BSRE.textMuted, fontSize: 12, lineHeight: 1.55 }}>{slide.footnote}</div>
      )}
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 8. COMPARE — 2 panes side by side (e.g. "pain → response").
// ──────────────────────────────────────────────────────────────────────
export function BSRECompare({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const renderPane = (pane: NonNullable<Slide["leftPane"]>) => {
    const isDark = pane.variant === "dark";
    const isTeal = pane.variant === "teal";
    const bg = isDark ? `linear-gradient(135deg, ${BSRE.navyMid}, ${BSRE.navyDeep})`
            : isTeal ? `linear-gradient(135deg, ${BSRE.teal}, ${BSRE.tealDark})`
            : "#fff";
    const fg = isDark || isTeal ? "#fff" : BSRE.text;
    const muted = isDark || isTeal ? "rgba(255,255,255,0.78)" : BSRE.textMuted;
    const chipBg = isDark || isTeal ? "rgba(255,255,255,0.18)" : BSRE.tealChipBg;
    const chipText = isDark || isTeal ? "#fff" : BSRE.tealDark;
    const rowBorder = isDark || isTeal ? "rgba(255,255,255,0.16)" : BSRE.rule;
    return (
      <div style={{ background: bg, borderRadius: 10, padding: "22px 22px", color: fg, minHeight: 320, display: "flex", flexDirection: "column" }}>
        {(pane.eyebrow || pane.chip) && (
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
            <div style={{ fontSize: 11, color: muted, letterSpacing: 0.6, fontWeight: 700 }}>{pane.eyebrow}</div>
            {pane.chip && (
              <span style={{ padding: "3px 10px", borderRadius: 999, background: chipBg, color: chipText, fontSize: 10.5, fontWeight: 700 }}>{pane.chip}</span>
            )}
          </div>
        )}
        {pane.title && <div style={{ fontSize: 18, fontWeight: 800, lineHeight: 1.3, color: fg, marginBottom: 14 }}>{pane.title}</div>}
        {(pane.rows ?? []).length > 0 && (
          <div style={{ marginBottom: 12 }}>
            {(pane.rows ?? []).map((r, i) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${rowBorder}`, fontSize: 12.5 }}>
                <span style={{ color: muted }}>{r.label}</span>
                <span style={{ color: fg, fontWeight: 700 }}>{r.value}</span>
              </div>
            ))}
          </div>
        )}
        {(pane.bullets ?? []).map((b, i) => {
          const letter = String.fromCharCode(65 + i);
          // Try to split "Title:body" or first-line bold.
          const [head, ...rest] = b.split(" — ");
          return (
            <div key={i} style={{ display: "flex", gap: 12, marginTop: 12 }}>
              <div style={{ minWidth: 22, fontSize: 14, fontWeight: 800, color: isDark || isTeal ? "rgba(255,255,255,0.9)" : BSRE.teal }}>{letter}</div>
              <div style={{ flex: 1, fontSize: 12.5, lineHeight: 1.55 }}>
                <span style={{ fontWeight: 700, color: fg }}>{head}</span>
                {rest.length > 0 && <span style={{ color: muted }}>{" — " + rest.join(" — ")}</span>}
              </div>
            </div>
          );
        })}
        {pane.footnote && <div style={{ marginTop: "auto", paddingTop: 12, fontSize: 11.5, color: muted, lineHeight: 1.5 }}>{pane.footnote}</div>}
      </div>
    );
  };
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginTop: 8 }}>
        {slide.leftPane && renderPane(slide.leftPane)}
        {slide.rightPane && renderPane(slide.rightPane)}
      </div>
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 9. DONTS — "what we will NOT do" 6-grid with × icons.
// ──────────────────────────────────────────────────────────────────────
export function BSREDonts({ slide, isRtl, company, pageNumber, totalPages }: {
  slide: Slide; isRtl: boolean; company: string; pageNumber?: number; totalPages?: number;
}) {
  const items = slide.dontItems ?? [];
  return (
    <BSREPage isRtl={isRtl} company={company} pageNumber={pageNumber} totalPages={totalPages}>
      <SlideHead eyebrow={slide.eyebrow} title={slide.title} subtitle={slide.subtitle} isRtl={isRtl} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18, marginTop: 8 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "flex", gap: 14, paddingTop: 8, paddingBottom: 12, borderTop: `1px solid ${BSRE.rule}` }}>
            <div style={{
              width: 24, height: 24, borderRadius: "50%",
              border: `1.5px solid ${BSRE.teal}`, color: BSRE.teal,
              display: "flex", alignItems: "center", justifyContent: "center",
              fontSize: 13, flexShrink: 0, marginTop: 2,
            }}>×</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: BSRE.text, marginBottom: 6 }}>{it.title}</div>
              <div style={{ fontSize: 12, color: BSRE.textMuted, lineHeight: 1.55 }}>{it.description}</div>
            </div>
          </div>
        ))}
      </div>
    </BSREPage>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 10. SUMMARY — full-bleed dark closing quote with chip footer.
// ──────────────────────────────────────────────────────────────────────
export function BSRESummary({ slide, isRtl, company }: {
  slide: Slide; isRtl: boolean; company: string;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(135deg, ${BSRE.navyDeep}, ${BSRE.navyMid})`,
      color: "#fff",
      direction: isRtl ? "rtl" : "ltr",
      fontFamily: "system-ui, sans-serif",
      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
      padding: "60px 80px", textAlign: "center",
    }}>
      <div style={{ fontSize: 11, color: BSRE.tealLight, letterSpacing: 5, fontWeight: 700, marginBottom: 28 }}>
        {slide.eyebrow || "סיכום אסטרטגי"}
      </div>
      <div style={{ fontSize: 42, fontWeight: 800, lineHeight: 1.2, color: "#fff", maxWidth: 880 }}>
        {/* Split " — " for teal accent */}
        {(() => {
          const parts = slide.title.split(" — ");
          return (
            <>
              {parts[0]}
              {parts.length > 1 && <span style={{ color: BSRE.tealLight }}>{" — " + parts.slice(1).join(" — ")}</span>}
            </>
          );
        })()}
      </div>
      {slide.subtitle && (
        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.78)", marginTop: 22, lineHeight: 1.65, maxWidth: 720 }}>
          {slide.subtitle}
        </div>
      )}
      {slide.footnote && (
        <div style={{
          marginTop: 36, padding: "9px 18px", borderRadius: 999,
          background: `linear-gradient(135deg, ${BSRE.teal}, ${BSRE.tealDark})`,
          color: "#fff", fontSize: 12, fontWeight: 700, letterSpacing: 0.3,
        }}>
          {slide.footnote}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 11. COVER — BSRE-style cover (dark navy, big white title, teal accent).
// Used when slide.kind === "cover" on a `layout: "cover"` slide.
// ──────────────────────────────────────────────────────────────────────
export function BSRECover({ slide, isRtl, company, date }: {
  slide: Slide; isRtl: boolean; company: string; date: string;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0,
      background: `linear-gradient(135deg, ${BSRE.navyDeep} 0%, ${BSRE.navyMid} 60%, ${BSRE.blueDark} 100%)`,
      color: "#fff",
      direction: isRtl ? "rtl" : "ltr",
      fontFamily: "system-ui, sans-serif",
      overflow: "hidden",
    }}>
      {/* Subtle radial highlight */}
      <div style={{
        position: "absolute", top: -120, [isRtl ? "left" : "right"]: -80,
        width: 540, height: 540, borderRadius: "50%",
        background: `radial-gradient(circle, rgba(46,166,156,0.18), transparent 60%)`,
      }} />
      {/* Top chip */}
      <div style={{
        position: "absolute", top: 28, [isRtl ? "left" : "right"]: 36,
        padding: "7px 16px", borderRadius: 6, fontSize: 12, fontWeight: 700,
        background: `linear-gradient(135deg, ${BSRE.teal}, ${BSRE.tealDark})`,
        boxShadow: "0 0 0 1px rgba(255,255,255,0.08)",
      }}>
        {company}{slide.eyebrow ? ` · ${slide.eyebrow}` : ""}
      </div>
      {/* Top opposite corner — date */}
      <div style={{
        position: "absolute", top: 30, [isRtl ? "right" : "left"]: 36,
        fontSize: 12, color: "rgba(255,255,255,0.7)", letterSpacing: 0.8,
      }}>
        {date}
      </div>
      {/* Centered title block */}
      <div style={{
        position: "absolute", inset: 0,
        display: "flex", flexDirection: "column", justifyContent: "center",
        padding: "0 90px",
      }}>
        {slide.subtitle && (
          <div style={{ fontSize: 11, color: BSRE.tealLight, letterSpacing: 6, fontWeight: 700, marginBottom: 16 }}>
            {slide.subtitle}
          </div>
        )}
        <div style={{
          fontSize: 64, fontWeight: 800, lineHeight: 1.05, color: "#fff",
          textAlign: isRtl ? "right" : "left", maxWidth: 800,
          marginLeft: isRtl ? "auto" : 0, marginRight: isRtl ? 0 : "auto",
        }}>
          {(() => {
            const parts = slide.title.split(" — ");
            return (
              <>
                <span>{parts[0]}</span>
                {parts.length > 1 && (
                  <>
                    <br />
                    <span style={{ color: BSRE.tealLight, fontWeight: 700 }}>{parts.slice(1).join(" — ")}</span>
                  </>
                )}
              </>
            );
          })()}
        </div>
        {slide.eyebrow && (
          <div style={{
            marginTop: 24, fontSize: 32, color: BSRE.tealLight, fontWeight: 600,
            textAlign: isRtl ? "right" : "left", letterSpacing: 1,
          }}>
            {slide.eyebrow}
          </div>
        )}
      </div>
      {/* Bottom row — left + right slots driven by leftPane/rightPane.bullets */}
      {(slide.leftPane || slide.rightPane) && (
        <div style={{
          position: "absolute", bottom: 36, left: 36, right: 36,
          display: "flex", justifyContent: "space-between", gap: 36,
          color: "rgba(255,255,255,0.84)",
        }}>
          {[slide.leftPane, slide.rightPane].filter(Boolean).map((pane, i) => (
            <div key={i} style={{ maxWidth: 360 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: "#fff", marginBottom: 6 }}>{pane!.title}</div>
              {pane!.bullets && pane!.bullets.length > 0 && (
                <div style={{ fontSize: 12, color: "rgba(255,255,255,0.7)", lineHeight: 1.55 }}>
                  {pane!.bullets.join(" · ")}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
