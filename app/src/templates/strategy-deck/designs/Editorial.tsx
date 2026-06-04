"use client";

/**
 * "Editorial" design — a magazine-grade visual language for strategy decks.
 *
 * Design ethos:
 *   - Typography is the design. Serif display + clean sans body, with
 *     careful sizing, optical alignment, and small-caps section markers.
 *   - Whitespace > decoration. Thin 1px rules instead of cards. The page
 *     is allowed to breathe.
 *   - Anchored asymmetry. One oversized element (a number, a title, a
 *     stat) per slide carries the visual weight; the rest supports it.
 *   - Palette-agnostic. Every color is read from the theme palette so a
 *     palette swap rotates the entire identity without touching layout.
 *   - Overflow-safe. Every text container clips/wraps. No string can
 *     escape the 960×540 slide bounds.
 *
 * Renders every Slide.kind: cover, toc, stats, kpi-card, horizons, grid,
 * tracks, table, compare, donts, summary, plus a bullets fallback.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette, FontPair } from "@/lib/themes/deck-themes";

// ──────────────────────────────────────────────────────────────────────
// 16:9 reference canvas — every renderer sits inside this bound and is
// strictly absolute-positioned to guarantee no overflow into the next
// slide. Inner padding is generous on purpose; the design language is
// built around whitespace.
// ──────────────────────────────────────────────────────────────────────
const W = 960;
const H = 540;
const PAD_X = 56;
const PAD_TOP = 36;
const PAD_BOTTOM = 36;
const CHROME_H = 22;        // top serial bar height
const TITLE_RAIL = 88;      // y-coordinate where slide title sits
const BODY_TOP = 158;       // y-coordinate where main content begins
const BODY_BOTTOM = H - PAD_BOTTOM - 22;
const BODY_H = BODY_BOTTOM - BODY_TOP;
const CONTENT_W = W - PAD_X * 2;

// ──────────────────────────────────────────────────────────────────────
// Editorial font pair. Falls back to system fonts if the theme's pair
// isn't loaded. The display face must be serif; the body face is
// reserved for sans-serif (small caps, captions, table cells).
// ──────────────────────────────────────────────────────────────────────
const SERIF =
  "'Frank Ruhl Libre', 'David Libre', Georgia, 'Times New Roman', serif";
const SANS =
  "'Heebo', 'Helvetica Neue', system-ui, -apple-system, Arial, sans-serif";

type DesignCtx = {
  palette: Palette;
  font: FontPair;
  isRtl: boolean;
  company: string;
  date: string;
  pageNumber?: number;
  totalPages?: number;
};

// ──────────────────────────────────────────────────────────────────────
// Color helpers. Derive editorial tones from a theme palette so the
// visual language stays consistent across palettes while still feeling
// distinct (cream backgrounds get a warm tint; navy palettes get cool).
// ──────────────────────────────────────────────────────────────────────
function shiftHex(hex: string, delta: number): string {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6) return hex;
  const r = Math.max(0, Math.min(255, parseInt(h.slice(0, 2), 16) + delta));
  const g = Math.max(0, Math.min(255, parseInt(h.slice(2, 4), 16) + delta));
  const b = Math.max(0, Math.min(255, parseInt(h.slice(4, 6), 16) + delta));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}
function rgba(hex: string, a: number): string {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}

type Tokens = {
  bg: string;
  surface: string;   // subtle off-bg surface for cards
  rule: string;      // thin separator
  ruleSoft: string;
  ink: string;       // primary text
  inkMuted: string;
  inkSubtle: string;
  accent: string;
  accent2: string;
  // Severity tones (derived from accent + ink + accent2)
  sevHigh: string;
  sevMed: string;
  sevLow: string;
};
function tokensFrom(palette: Palette): Tokens {
  const ink = palette.text;
  const accent = palette.accent;
  return {
    bg: palette.bg,
    surface: rgba(ink, 0.035),
    rule: rgba(ink, 0.16),
    ruleSoft: rgba(ink, 0.08),
    ink,
    inkMuted: palette.textMuted,
    inkSubtle: rgba(ink, 0.55),
    accent,
    accent2: palette.accent2 || accent,
    sevHigh: accent,                          // most prominent
    sevMed: palette.accent2 || shiftHex(accent, -30),
    sevLow: rgba(ink, 0.45),
  };
}

// ──────────────────────────────────────────────────────────────────────
// Common typographic primitives.
// All of them clamp their content to N lines so nothing escapes the
// slide.
// ──────────────────────────────────────────────────────────────────────
function Clamp({ lines = 2, children, style }: { lines?: number; children: ReactNode; style?: CSSProperties }) {
  return (
    <div style={{
      display: "-webkit-box",
      WebkitBoxOrient: "vertical",
      WebkitLineClamp: lines,
      overflow: "hidden",
      ...style,
    }}>{children}</div>
  );
}

function Eyebrow({ text, tokens }: { text: string; tokens: Tokens }) {
  if (!text) return null;
  return (
    <Clamp lines={1} style={{
      fontFamily: SANS, fontSize: 10, color: tokens.accent,
      letterSpacing: 4, textTransform: "uppercase", fontWeight: 700,
      marginBottom: 14,
    }}>{text}</Clamp>
  );
}

function H1({ text, tokens, size = 36, maxLines = 2 }: { text: string; tokens: Tokens; size?: number; maxLines?: number }) {
  return (
    <Clamp lines={maxLines} style={{
      fontFamily: SERIF, fontSize: size, lineHeight: 1.12,
      color: tokens.ink, fontWeight: 600, letterSpacing: -0.2,
    }}>{text}</Clamp>
  );
}

function Lede({ text, tokens, maxLines = 3 }: { text: string; tokens: Tokens; maxLines?: number }) {
  if (!text) return null;
  return (
    <Clamp lines={maxLines} style={{
      fontFamily: SANS, fontSize: 13.5, lineHeight: 1.6,
      color: tokens.inkMuted, marginTop: 14, maxWidth: 720,
      fontWeight: 400,
    }}>{text}</Clamp>
  );
}

// Thin 1px rule.
function Rule({ tokens, soft }: { tokens: Tokens; soft?: boolean }) {
  return <div style={{ height: 1, background: soft ? tokens.ruleSoft : tokens.rule, width: "100%" }} />;
}

// Page chrome — top serial bar with company / page number / thin rule.
function Chrome({ ctx, tokens }: { ctx: DesignCtx; tokens: Tokens }) {
  const left = ctx.isRtl ? "right" : "left";
  const right = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{
        position: "absolute", top: PAD_TOP, [left]: PAD_X,
        fontFamily: SANS, fontSize: 9.5, letterSpacing: 3,
        color: tokens.inkSubtle, textTransform: "uppercase", fontWeight: 600,
      } as CSSProperties}>{ctx.company}</div>
      {ctx.pageNumber !== undefined && (
        <div style={{
          position: "absolute", top: PAD_TOP, [right]: PAD_X,
          fontFamily: SERIF, fontSize: 11, color: tokens.inkSubtle,
          fontStyle: "italic",
        } as CSSProperties}>
          {String(ctx.pageNumber).padStart(2, "0")} <span style={{ opacity: 0.4 }}>·</span> {String(ctx.totalPages ?? "—").padStart(2, "0")}
        </div>
      )}
      <div style={{
        position: "absolute", top: PAD_TOP + CHROME_H, left: PAD_X, right: PAD_X,
        height: 1, background: tokens.rule,
      }} />
    </>
  );
}

// Universal page shell.
function Page({ ctx, tokens, children, fullBleed }: {
  ctx: DesignCtx; tokens: Tokens; children: ReactNode; fullBleed?: boolean;
}) {
  return (
    <div style={{
      position: "absolute", inset: 0, width: W, height: H,
      background: tokens.bg, color: tokens.ink,
      direction: ctx.isRtl ? "rtl" : "ltr",
      overflow: "hidden",
    }}>
      {!fullBleed && <Chrome ctx={ctx} tokens={tokens} />}
      {children}
    </div>
  );
}

// Slide-title block — eyebrow + H1 + lede.
// Always lands at the same vertical rhythm.
function TitleBlock({ slide, tokens, size, maxLines, alignEnd }: {
  slide: Slide; tokens: Tokens; size?: number; maxLines?: number; alignEnd?: boolean;
}) {
  const isRtl = true; // alignment via direction; this block uses logical end
  void isRtl;
  return (
    <div style={{
      position: "absolute", top: TITLE_RAIL, left: PAD_X, right: PAD_X,
      textAlign: alignEnd ? "end" : "start",
    }}>
      <Eyebrow text={slide.eyebrow ?? ""} tokens={tokens} />
      <H1 text={slide.title || ""} tokens={tokens} size={size} maxLines={maxLines} />
      <Lede text={slide.subtitle || ""} tokens={tokens} />
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Severity dot (editorial-grade chip — a colored dot + label, not a pill).
// ──────────────────────────────────────────────────────────────────────
function SevDot({ label, variant, tokens }: { label: string; variant: "high" | "med" | "low" | "neutral"; tokens: Tokens }) {
  const color =
    variant === "high" ? tokens.sevHigh :
    variant === "med"  ? tokens.sevMed  :
    variant === "low"  ? tokens.sevLow  :
    rgba(tokens.ink, 0.3);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 10.5, color: tokens.inkMuted, letterSpacing: 0.4 }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Auto-sizing number — clamps font-size by character count so a value
// like "9,500.5" doesn't overflow its slot, while a single digit still
// reads as oversized art.
// ──────────────────────────────────────────────────────────────────────
function autoNumberSize(value: string, base: number): number {
  const len = String(value).length;
  if (len <= 2)  return base * 1.10;
  if (len <= 3)  return base * 1.00;
  if (len <= 4)  return base * 0.85;
  if (len <= 5)  return base * 0.70;
  if (len <= 6)  return base * 0.58;
  return base * 0.48;
}

// ──────────────────────────────────────────────────────────────────────
// Public renderer dispatcher.
// ──────────────────────────────────────────────────────────────────────
export function renderEditorial(slide: Slide, ctx: DesignCtx): ReactNode {
  const tokens = tokensFrom(ctx.palette);
  const kind = slide.kind;

  // Cover & summary use full-bleed shells.
  if (kind === "cover")   return EditorialCover  (slide, ctx, tokens);
  if (kind === "summary") return EditorialSummary(slide, ctx, tokens);

  // Everything else uses the chromed page shell.
  if (kind === "toc")      return <Page ctx={ctx} tokens={tokens}>{EditorialToc      (slide, ctx, tokens)}</Page>;
  if (kind === "stats")    return <Page ctx={ctx} tokens={tokens}>{EditorialStats    (slide, ctx, tokens)}</Page>;
  if (kind === "kpi-card") return <Page ctx={ctx} tokens={tokens}>{EditorialKpiCard  (slide, ctx, tokens)}</Page>;
  if (kind === "horizons") return <Page ctx={ctx} tokens={tokens}>{EditorialHorizons (slide, ctx, tokens)}</Page>;
  if (kind === "grid")     return <Page ctx={ctx} tokens={tokens}>{EditorialGrid     (slide, ctx, tokens)}</Page>;
  if (kind === "tracks")   return <Page ctx={ctx} tokens={tokens}>{EditorialTracks   (slide, ctx, tokens)}</Page>;
  if (kind === "table")    return <Page ctx={ctx} tokens={tokens}>{EditorialTable    (slide, ctx, tokens)}</Page>;
  if (kind === "compare")  return <Page ctx={ctx} tokens={tokens}>{EditorialCompare  (slide, ctx, tokens)}</Page>;
  if (kind === "donts")    return <Page ctx={ctx} tokens={tokens}>{EditorialDonts    (slide, ctx, tokens)}</Page>;
  // Fallback for "bullets" or unknown kinds.
  return <Page ctx={ctx} tokens={tokens}>{EditorialBullets(slide, ctx, tokens)}</Page>;
}

// Provide the surface tokens for outer callers (e.g. SlideView container background).
export function editorialBg(palette: Palette): string {
  return tokensFrom(palette).bg;
}

// ──────────────────────────────────────────────────────────────────────
// 1. COVER
// Single oversized title, italic serif subtitle, accent rail down one
// edge, slim metadata at top.
// ──────────────────────────────────────────────────────────────────────
function EditorialCover(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const isRtl = ctx.isRtl;
  // Cover uses a warmer bg for premium feel: ink-tinted off-bg.
  const bg = tokens.bg;
  return (
    <div style={{
      position: "absolute", inset: 0, width: W, height: H,
      background: bg, color: tokens.ink,
      direction: isRtl ? "rtl" : "ltr",
      overflow: "hidden",
    }}>
      {/* Thin accent rail running the full vertical edge */}
      <div style={{
        position: "absolute", top: 0, bottom: 0,
        [isRtl ? "right" : "left"]: 0,
        width: 4, background: tokens.accent,
      } as CSSProperties} />

      {/* Top metadata: date on one side, label chip on the other */}
      <div style={{
        position: "absolute", top: 42, [isRtl ? "right" : "left"]: PAD_X + 18,
        fontFamily: SANS, fontSize: 10, letterSpacing: 4,
        color: tokens.inkSubtle, textTransform: "uppercase", fontWeight: 700,
      } as CSSProperties}>{ctx.date}</div>

      <div style={{
        position: "absolute", top: 36, [isRtl ? "left" : "right"]: PAD_X,
        fontFamily: SERIF, fontSize: 11, fontStyle: "italic",
        color: tokens.inkMuted, padding: "5px 14px",
        borderTop: `1px solid ${tokens.rule}`, borderBottom: `1px solid ${tokens.rule}`,
      } as CSSProperties}>
        {ctx.company}{slide.eyebrow ? ` · ${slide.eyebrow}` : ""}
      </div>

      {/* Centered title block */}
      <div style={{
        position: "absolute",
        top: 170, [isRtl ? "right" : "left"]: PAD_X + 28,
        width: W - PAD_X * 2 - 28, maxWidth: 760,
      } as CSSProperties}>
        {slide.subtitle && (
          <Clamp lines={1} style={{
            fontFamily: SERIF, fontStyle: "italic", fontSize: 18,
            color: tokens.accent, marginBottom: 22,
          }}>{slide.subtitle}</Clamp>
        )}
        <Clamp lines={3} style={{
          fontFamily: SERIF, fontSize: 62, lineHeight: 1.05,
          color: tokens.ink, fontWeight: 600, letterSpacing: -1.2,
        }}>{slide.title}</Clamp>
        <div style={{ marginTop: 28, height: 1, width: 120, background: tokens.accent }} />
      </div>

      {/* Bottom row — two text slots driven by leftPane/rightPane.bullets */}
      {(slide.leftPane || slide.rightPane) && (
        <div style={{
          position: "absolute", bottom: PAD_BOTTOM, left: PAD_X + 28, right: PAD_X,
          display: "flex", justifyContent: "space-between", gap: 36,
          alignItems: "flex-end",
        }}>
          {[slide.leftPane, slide.rightPane].filter(Boolean).map((pane, i) => (
            <div key={i} style={{ maxWidth: 320 }}>
              <Clamp lines={1} style={{
                fontFamily: SANS, fontSize: 9.5, letterSpacing: 3,
                textTransform: "uppercase", fontWeight: 700, color: tokens.accent,
                marginBottom: 6,
              }}>{pane!.title}</Clamp>
              {pane!.bullets && pane!.bullets.length > 0 && (
                <Clamp lines={2} style={{
                  fontFamily: SERIF, fontSize: 13, fontStyle: "italic",
                  lineHeight: 1.45, color: tokens.inkMuted,
                }}>{pane!.bullets.join(" · ")}</Clamp>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 2. TOC — "Contents" two-column numbered list.
// ──────────────────────────────────────────────────────────────────────
function EditorialToc(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const items = slide.tocItems ?? [];
  const half = Math.ceil(items.length / 2);
  const col1 = items.slice(0, half);
  const col2 = items.slice(half);
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={40} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 16, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 8,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
      }}>
        {[col1, col2].map((col, ci) => (
          <div key={ci}>
            {col.map((it, i) => (
              <div key={i} style={{
                display: "grid", gridTemplateColumns: "auto 1fr",
                gap: 18, padding: "10px 0",
                borderBottom: i < col.length - 1 ? `1px solid ${tokens.ruleSoft}` : "none",
                alignItems: "baseline",
              }}>
                <div style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: tokens.accent, fontWeight: 600, minWidth: 24 }}>
                  {it.index}
                </div>
                <div style={{ minWidth: 0 }}>
                  <Clamp lines={1} style={{ fontFamily: SERIF, fontSize: 15, color: tokens.ink, fontWeight: 600 }}>
                    {it.title}
                  </Clamp>
                  {it.subtitle && (
                    <Clamp lines={1} style={{ fontFamily: SANS, fontSize: 11.5, color: tokens.inkMuted, marginTop: 3 }}>
                      {it.subtitle}
                    </Clamp>
                  )}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 3. STATS — minimal stat tiles, oversized serif numbers, thin rule below.
// ──────────────────────────────────────────────────────────────────────
function EditorialStats(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const stats = slide.stats ?? [];
  // Layout: up to 4 hero stats top row, rest as a tighter sub-row.
  const hero = stats.slice(0, 4);
  const sub = stats.slice(4, 8);
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={32} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 16, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 24,
        display: "flex", flexDirection: "column", gap: 18,
      }}>
        {hero.length > 0 && (
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length}, 1fr)`, gap: 24 }}>
            {hero.map((s, i) => <StatBlock key={i} stat={s} tokens={tokens} hero />)}
          </div>
        )}
        {sub.length > 0 && (
          <>
            <Rule tokens={tokens} soft />
            <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 24 }}>
              {sub.map((s, i) => <StatBlock key={i} stat={s} tokens={tokens} />)}
            </div>
          </>
        )}
        {slide.footnote && (
          <div style={{ marginTop: "auto", fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: tokens.inkMuted, lineHeight: 1.55 }}>
            <Clamp lines={2}>{slide.footnote}</Clamp>
          </div>
        )}
      </div>
    </>
  );
}

function StatBlock({ stat, tokens, hero }: { stat: NonNullable<Slide["stats"]>[number]; tokens: Tokens; hero?: boolean; }) {
  const baseNum = hero ? 56 : 42;
  const numSize = autoNumberSize(stat.value || "", baseNum);
  return (
    <div style={{
      paddingTop: 14, borderTop: `1px solid ${tokens.rule}`,
      display: "flex", flexDirection: "column", minWidth: 0,
    }}>
      <Clamp lines={1} style={{
        fontFamily: SANS, fontSize: 9.5, color: tokens.inkSubtle,
        letterSpacing: 3.5, textTransform: "uppercase", fontWeight: 700,
        marginBottom: 10,
      }}>{stat.label}</Clamp>
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
        <span style={{
          fontFamily: SERIF, fontSize: numSize, lineHeight: 0.95,
          fontWeight: 500, color: tokens.accent, letterSpacing: -1.5,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{stat.value}</span>
        {stat.unit && (
          <Clamp lines={1} style={{
            fontFamily: SERIF, fontSize: hero ? 15 : 12, fontStyle: "italic",
            color: tokens.inkMuted,
          }}>{stat.unit}</Clamp>
        )}
      </div>
      {stat.caption && (
        <Clamp lines={2} style={{
          fontFamily: SANS, fontSize: 11, color: tokens.inkMuted,
          marginTop: 8, lineHeight: 1.5,
        }}>{stat.caption}</Clamp>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 4. KPI-CARD — one hero stat anchored on one side, editorial body on
// the other, divided by a vertical thin rule.
// ──────────────────────────────────────────────────────────────────────
function EditorialKpiCard(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const stat = (slide.stats ?? [])[0];
  const stat2 = (slide.stats ?? [])[1];
  return (
    <>
      <div style={{
        position: "absolute", top: TITLE_RAIL - 8, left: PAD_X, right: PAD_X,
      }}>
        <Eyebrow text={slide.eyebrow ?? ""} tokens={tokens} />
      </div>
      <div style={{
        position: "absolute", top: TITLE_RAIL + 14, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 16,
        display: "grid", gridTemplateColumns: "1fr 1fr", gap: 48,
        alignItems: "stretch",
      }}>
        {/* Left: hero stat(s) anchored vertically center */}
        <div style={{
          display: "flex", flexDirection: "column", justifyContent: "center",
          gap: 30, paddingInlineEnd: 24,
          borderInlineEnd: `1px solid ${tokens.rule}`,
        }}>
          {stat && <BigStat stat={stat} tokens={tokens} size={92} />}
          {stat2 && (
            <div style={{ paddingTop: 18, borderTop: `1px solid ${tokens.ruleSoft}` }}>
              <BigStat stat={stat2} tokens={tokens} size={48} compact />
            </div>
          )}
        </div>
        {/* Right: editorial body */}
        <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", minWidth: 0 }}>
          <Clamp lines={3} style={{
            fontFamily: SERIF, fontSize: 32, lineHeight: 1.18,
            color: tokens.ink, fontWeight: 600, letterSpacing: -0.3,
          }}>{slide.title}</Clamp>
          {slide.body && (
            <Clamp lines={9} style={{
              fontFamily: SANS, fontSize: 13, lineHeight: 1.65,
              color: tokens.inkMuted, marginTop: 18, whiteSpace: "pre-wrap",
            }}>{slide.body}</Clamp>
          )}
        </div>
      </div>
    </>
  );
}

function BigStat({ stat, tokens, size = 92, compact }: { stat: NonNullable<Slide["stats"]>[number]; tokens: Tokens; size?: number; compact?: boolean; }) {
  const numSize = autoNumberSize(stat.value || "", size);
  return (
    <div style={{ minWidth: 0 }}>
      {stat.label && (
        <Clamp lines={1} style={{
          fontFamily: SANS, fontSize: 9.5, color: tokens.inkSubtle,
          letterSpacing: 3.5, textTransform: "uppercase", fontWeight: 700,
          marginBottom: 12,
        }}>{stat.label}</Clamp>
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
        <span style={{
          fontFamily: SERIF, fontSize: numSize, lineHeight: 0.9,
          fontWeight: 500, color: tokens.accent, letterSpacing: -3,
          whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
        }}>{stat.value}</span>
        {stat.unit && (
          <Clamp lines={1} style={{
            fontFamily: SERIF, fontSize: compact ? 14 : 22, fontStyle: "italic",
            color: tokens.inkMuted,
          }}>{stat.unit}</Clamp>
        )}
      </div>
      {stat.caption && (
        <Clamp lines={2} style={{
          fontFamily: SANS, fontSize: 11.5, color: tokens.inkMuted,
          marginTop: 12, lineHeight: 1.55, maxWidth: 360,
        }}>{stat.caption}</Clamp>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 5. HORIZONS — three vertical columns with giant serif year + rows.
// The accented column (variant: "teal") gets a heavier rule on top.
// ──────────────────────────────────────────────────────────────────────
function EditorialHorizons(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const cards = (slide.horizons ?? []).slice(0, 3);
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={30} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 18, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 30,
        display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`,
        gap: 36, alignItems: "stretch",
      }}>
        {cards.map((c, i) => {
          const isAccent = c.variant === "teal" || c.variant === "navy";
          return (
            <div key={i} style={{
              paddingTop: 12, paddingInlineStart: 0,
              borderTop: `${isAccent ? 3 : 1}px solid ${isAccent ? tokens.accent : tokens.rule}`,
              display: "flex", flexDirection: "column", minWidth: 0,
            }}>
              <Clamp lines={1} style={{
                fontFamily: SANS, fontSize: 9.5, letterSpacing: 3.5,
                textTransform: "uppercase", color: isAccent ? tokens.accent : tokens.inkSubtle,
                fontWeight: 700, marginBottom: 10,
              }}>{c.eyebrow}</Clamp>
              <Clamp lines={1} style={{
                fontFamily: SERIF, fontSize: 64, lineHeight: 0.95,
                fontWeight: 500, color: isAccent ? tokens.accent : tokens.ink,
                letterSpacing: -2, marginBottom: 14,
              }}>{c.bigText}</Clamp>
              {c.caption && (
                <Clamp lines={2} style={{
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 13,
                  color: tokens.inkMuted, marginBottom: 14, lineHeight: 1.45,
                }}>{c.caption}</Clamp>
              )}
              <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 0 }}>
                {(c.rows ?? []).slice(0, 6).map((r, ri) => (
                  <div key={ri} style={{
                    display: "grid", gridTemplateColumns: "auto 1fr",
                    gap: 12, padding: "8px 0",
                    borderBottom: `1px solid ${tokens.ruleSoft}`,
                    fontFamily: SANS, fontSize: 11.5,
                    alignItems: "baseline", minWidth: 0,
                  }}>
                    <Clamp lines={1} style={{ color: tokens.inkSubtle, fontWeight: 600, letterSpacing: 0.2 }}>
                      {r.label}
                    </Clamp>
                    <Clamp lines={1} style={{ color: tokens.ink, fontFamily: SERIF, fontSize: 12.5, textAlign: "end" }}>
                      {r.value}
                    </Clamp>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {slide.footnote && (
        <div style={{
          position: "absolute", bottom: PAD_BOTTOM - 4, left: PAD_X, right: PAD_X,
          fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: tokens.inkMuted,
        }}>
          <Clamp lines={1}>{slide.footnote}</Clamp>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 6. GRID — 4 numbered cells in 2×2. No card chrome; thin rules only.
// ──────────────────────────────────────────────────────────────────────
function EditorialGrid(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const cells = (slide.gridCards ?? []).slice(0, 4);
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={28} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 30, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 16,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        gridTemplateRows: "1fr 1fr",
        columnGap: 48, rowGap: 28,
      }}>
        {cells.map((c, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "auto 1fr", gap: 18,
            paddingTop: 14, borderTop: `1px solid ${tokens.rule}`,
            minWidth: 0,
          }}>
            <div style={{
              fontFamily: SERIF, fontStyle: "italic", fontSize: 28, fontWeight: 500,
              color: tokens.accent, letterSpacing: -0.5, lineHeight: 1,
            }}>{c.index}</div>
            <div style={{ minWidth: 0 }}>
              <Clamp lines={2} style={{
                fontFamily: SERIF, fontSize: 17, fontWeight: 600,
                color: tokens.ink, lineHeight: 1.25, marginBottom: 8,
              }}>{c.title}</Clamp>
              <Clamp lines={4} style={{
                fontFamily: SANS, fontSize: 12.5, color: tokens.inkMuted,
                lineHeight: 1.6,
              }}>{c.description}</Clamp>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 7. TRACKS — 3 vertical columns separated by thin rules. The accent
// column has its top rule in the accent color.
// ──────────────────────────────────────────────────────────────────────
function EditorialTracks(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const tracks = (slide.tracks ?? []).slice(0, 3);
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={28} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 24, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + (slide.footnote ? 60 : 24),
        display: "grid", gridTemplateColumns: `repeat(${tracks.length || 1}, 1fr)`,
        gap: 36, alignItems: "stretch",
      }}>
        {tracks.map((tk, i) => {
          const isAccent = tk.variant === "teal";
          const isDark = tk.variant === "navy" || tk.variant === "blue";
          const topColor = isAccent ? tokens.accent : isDark ? tokens.accent2 : tokens.rule;
          return (
            <div key={i} style={{
              display: "flex", flexDirection: "column", minWidth: 0,
              paddingTop: 14, borderTop: `${isAccent ? 3 : 1}px solid ${topColor}`,
            }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginBottom: 8 }}>
                <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 500, color: tokens.accent, letterSpacing: -0.4, lineHeight: 1 }}>
                  {tk.index}
                </span>
                <Clamp lines={1} style={{
                  fontFamily: SANS, fontSize: 9.5, letterSpacing: 3,
                  textTransform: "uppercase", color: tokens.inkSubtle, fontWeight: 700,
                }}>{tk.eyebrow || `Track ${tk.index}`}</Clamp>
              </div>
              <Clamp lines={2} style={{
                fontFamily: SERIF, fontSize: 19, fontWeight: 600,
                color: tokens.ink, lineHeight: 1.2, marginBottom: 14,
              }}>{tk.title}</Clamp>
              <Clamp lines={7} style={{
                fontFamily: SANS, fontSize: 12, color: tokens.inkMuted,
                lineHeight: 1.65, flex: 1,
              }}>{tk.description}</Clamp>
              {tk.chip && (
                <Clamp lines={1} style={{
                  marginTop: 14, paddingTop: 10,
                  borderTop: `1px solid ${tokens.ruleSoft}`,
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 12,
                  color: tokens.accent,
                }}>{tk.chip}</Clamp>
              )}
            </div>
          );
        })}
      </div>
      {slide.footnote && (
        <div style={{
          position: "absolute", bottom: PAD_BOTTOM, left: PAD_X, right: PAD_X,
          paddingTop: 12, borderTop: `1px solid ${tokens.rule}`,
          display: "flex", justifyContent: "space-between", gap: 24, alignItems: "baseline",
        }}>
          <Clamp lines={1} style={{ fontFamily: SERIF, fontSize: 13, color: tokens.ink, fontWeight: 600, flex: 1 }}>
            {slide.footnote}
          </Clamp>
          {slide.footnoteChip && (
            <Clamp lines={1} style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 2.5, color: tokens.accent, textTransform: "uppercase", fontWeight: 700, flexShrink: 0 }}>
              {slide.footnoteChip}
            </Clamp>
          )}
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 8. TABLE — editorial table with small-caps header, thin rules, severity
// dots on the trailing column.
// ──────────────────────────────────────────────────────────────────────
function EditorialTable(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const headers = slide.tableHeaders ?? [];
  const rows = (slide.tableRows ?? []).slice(0, 10);
  const hasChip = rows.some((r) => r.chip);
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={28} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 24, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + (slide.footnote ? 36 : 12),
        display: "flex", flexDirection: "column",
      }}>
        <div style={{
          display: "grid",
          gridTemplateColumns: hasChip ? `repeat(${headers.length}, 1fr) auto` : `repeat(${headers.length}, 1fr)`,
          gap: "0 24px",
          paddingBottom: 10, borderBottom: `1.5px solid ${tokens.ink}`,
        }}>
          {headers.map((h, i) => (
            <Clamp key={i} lines={1} style={{
              fontFamily: SANS, fontSize: 9.5, letterSpacing: 3,
              textTransform: "uppercase", color: tokens.ink, fontWeight: 700,
            }}>{h}</Clamp>
          ))}
          {hasChip && <span />}
        </div>
        {rows.map((row, ri) => (
          <div key={ri} style={{
            display: "grid",
            gridTemplateColumns: hasChip ? `repeat(${headers.length}, 1fr) auto` : `repeat(${headers.length}, 1fr)`,
            gap: "0 24px",
            padding: "10px 0",
            borderBottom: ri < rows.length - 1 ? `1px solid ${tokens.ruleSoft}` : "none",
            alignItems: "center",
            background: row.emphasize ? rgba(tokens.accent, 0.05) : "transparent",
          }}>
            {row.cells.slice(0, headers.length).map((cell, ci) => (
              <Clamp key={ci} lines={2} style={{
                fontFamily: ci === 0 ? SERIF : SANS,
                fontSize: ci === 0 ? 13 : 12,
                fontWeight: ci === 0 ? (row.emphasize ? 700 : 600) : 400,
                color: ci === 0 ? tokens.ink : tokens.inkMuted,
                lineHeight: 1.4,
              }}>{cell}</Clamp>
            ))}
            {hasChip && row.chip && (
              <SevDot label={row.chip} variant={row.chipVariant ?? "neutral"} tokens={tokens} />
            )}
            {hasChip && !row.chip && <span />}
          </div>
        ))}
      </div>
      {slide.footnote && (
        <div style={{
          position: "absolute", bottom: PAD_BOTTOM - 4, left: PAD_X, right: PAD_X,
        }}>
          <Clamp lines={1} style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: tokens.inkMuted }}>
            {slide.footnote}
          </Clamp>
        </div>
      )}
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 9. COMPARE — two panes divided by a vertical rule, asymmetric weights.
// ──────────────────────────────────────────────────────────────────────
function EditorialCompare(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const panes = [slide.leftPane, slide.rightPane].filter(Boolean) as NonNullable<Slide["leftPane"]>[];
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={28} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 22, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 16,
        display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 48,
      }}>
        {panes.map((pane, i) => (
          <div key={i} style={{
            paddingInlineEnd: i === 0 && panes.length === 2 ? 24 : 0,
            paddingInlineStart: i === 1 ? 24 : 0,
            borderInlineEnd: i === 0 && panes.length === 2 ? `1px solid ${tokens.rule}` : "none",
            display: "flex", flexDirection: "column", minWidth: 0,
          }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
              <Clamp lines={1} style={{
                fontFamily: SANS, fontSize: 9.5, letterSpacing: 3.5,
                textTransform: "uppercase", color: tokens.accent, fontWeight: 700,
              }}>{pane.eyebrow}</Clamp>
              {pane.chip && (
                <Clamp lines={1} style={{
                  fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: tokens.inkMuted,
                }}>{pane.chip}</Clamp>
              )}
            </div>
            <Clamp lines={2} style={{
              fontFamily: SERIF, fontSize: 20, fontWeight: 600,
              color: tokens.ink, lineHeight: 1.22, marginBottom: 16,
            }}>{pane.title}</Clamp>
            {(pane.rows ?? []).length > 0 && (
              <div style={{ marginBottom: 14 }}>
                {(pane.rows ?? []).slice(0, 5).map((r, ri) => (
                  <div key={ri} style={{
                    display: "grid", gridTemplateColumns: "1fr auto", gap: 16,
                    padding: "7px 0", borderBottom: `1px solid ${tokens.ruleSoft}`,
                    fontSize: 12,
                  }}>
                    <Clamp lines={1} style={{ fontFamily: SANS, color: tokens.inkMuted, letterSpacing: 0.2 }}>
                      {r.label}
                    </Clamp>
                    <Clamp lines={1} style={{ fontFamily: SERIF, color: tokens.ink, fontWeight: 600 }}>
                      {r.value}
                    </Clamp>
                  </div>
                ))}
              </div>
            )}
            {(pane.bullets ?? []).slice(0, 5).map((b, bi) => {
              const [head, ...rest] = b.split(" — ");
              return (
                <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, marginTop: 9, minWidth: 0 }}>
                  <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: tokens.accent, fontWeight: 600 }}>
                    {String.fromCharCode(65 + bi)}
                  </span>
                  <Clamp lines={2} style={{ fontSize: 12, lineHeight: 1.55, minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontWeight: 600, color: tokens.ink }}>{head}</span>
                    {rest.length > 0 && <span style={{ fontFamily: SANS, color: tokens.inkMuted }}>{" — " + rest.join(" — ")}</span>}
                  </Clamp>
                </div>
              );
            })}
            {pane.footnote && (
              <Clamp lines={2} style={{
                marginTop: "auto", paddingTop: 12,
                borderTop: `1px solid ${tokens.ruleSoft}`,
                fontFamily: SERIF, fontStyle: "italic", fontSize: 11,
                color: tokens.inkMuted, lineHeight: 1.5,
              }}>{pane.footnote}</Clamp>
            )}
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 10. DONTS — "we will NOT do" list, six items in 2-column.
// Editorial styling: a thin strikethrough through the title, no boxes.
// ──────────────────────────────────────────────────────────────────────
function EditorialDonts(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const items = (slide.dontItems ?? []).slice(0, 6);
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={32} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 26, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 12,
        display: "grid", gridTemplateColumns: "1fr 1fr",
        columnGap: 56, rowGap: 22,
      }}>
        {items.map((it, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "auto 1fr", gap: 16,
            paddingTop: 12, borderTop: `1px solid ${tokens.rule}`,
            minWidth: 0,
          }}>
            <div style={{
              fontFamily: SERIF, fontSize: 20, color: tokens.accent, fontWeight: 500,
              lineHeight: 1, fontStyle: "italic",
            }}>—</div>
            <div style={{ minWidth: 0 }}>
              <Clamp lines={1} style={{
                fontFamily: SERIF, fontSize: 14, fontWeight: 600,
                color: tokens.ink, marginBottom: 6,
                textDecoration: "line-through",
                textDecorationColor: rgba(tokens.ink, 0.35),
                textDecorationThickness: 1,
              }}>{it.title}</Clamp>
              <Clamp lines={3} style={{
                fontFamily: SANS, fontSize: 11.5, color: tokens.inkMuted, lineHeight: 1.55,
              }}>{it.description}</Clamp>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 11. SUMMARY — full-bleed, large serif quote, subtle gradient ground.
// ──────────────────────────────────────────────────────────────────────
function EditorialSummary(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  const isRtl = ctx.isRtl;
  // Use the palette's cover bg + gradient for full-bleed feel.
  return (
    <div style={{
      position: "absolute", inset: 0, width: W, height: H,
      background: ctx.palette.coverGradient + ", " + ctx.palette.coverBg,
      color: ctx.palette.coverText,
      direction: isRtl ? "rtl" : "ltr",
      padding: "80px 110px",
      display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", textAlign: "center",
      overflow: "hidden",
    }}>
      {slide.eyebrow && (
        <Clamp lines={1} style={{
          fontFamily: SANS, fontSize: 10, letterSpacing: 5,
          textTransform: "uppercase", color: rgba(ctx.palette.coverText, 0.7),
          fontWeight: 700, marginBottom: 36,
        }}>{slide.eyebrow}</Clamp>
      )}
      <Clamp lines={5} style={{
        fontFamily: SERIF, fontSize: 38, lineHeight: 1.2,
        color: ctx.palette.coverText, fontWeight: 600, letterSpacing: -0.5,
        maxWidth: 860,
      }}>{slide.title}</Clamp>
      {slide.subtitle && (
        <>
          <div style={{ width: 90, height: 1, background: rgba(ctx.palette.coverText, 0.4), margin: "26px auto" }} />
          <Clamp lines={3} style={{
            fontFamily: SERIF, fontStyle: "italic", fontSize: 16,
            color: rgba(ctx.palette.coverText, 0.85), lineHeight: 1.6, maxWidth: 700,
          }}>{slide.subtitle}</Clamp>
        </>
      )}
      {slide.footnote && (
        <Clamp lines={1} style={{
          marginTop: 38, fontFamily: SANS, fontSize: 10.5,
          letterSpacing: 4, textTransform: "uppercase",
          color: rgba(ctx.palette.coverText, 0.65), fontWeight: 700,
        }}>{slide.footnote}</Clamp>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// 12. BULLETS fallback — used when slide.kind is "bullets" or unset.
// ──────────────────────────────────────────────────────────────────────
function EditorialBullets(slide: Slide, ctx: DesignCtx, tokens: Tokens): ReactNode {
  return (
    <>
      <TitleBlock slide={slide} tokens={tokens} size={30} maxLines={2} />
      <div style={{
        position: "absolute", top: BODY_TOP + 26, left: PAD_X, right: PAD_X,
        bottom: PAD_BOTTOM + 12, maxWidth: 800,
      }}>
        {(slide.bullets ?? []).slice(0, 8).map((b, i) => (
          <div key={i} style={{
            display: "grid", gridTemplateColumns: "auto 1fr", gap: 18,
            padding: "12px 0", borderBottom: `1px solid ${tokens.ruleSoft}`, minWidth: 0,
          }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: tokens.accent, fontWeight: 600, minWidth: 16 }}>
              {String(i + 1).padStart(2, "0")}
            </span>
            <Clamp lines={3} style={{ fontFamily: SANS, fontSize: 13, color: tokens.ink, lineHeight: 1.6 }}>
              {b}
            </Clamp>
          </div>
        ))}
      </div>
    </>
  );
}
