"use client";

/**
 * The single deck design — "Editorial".
 *
 * Three hard guarantees, in priority order:
 *   1. NOTHING overflows, is clipped, or overlaps. Every slide's content
 *      is measured at natural size and the WHOLE slide is uniformly
 *      scaled down (transform: scale) until it fits the 960×540 frame.
 *      Text shrinks together as one block — never cut, never spilling.
 *   2. Every visible string is editable in place (contentEditable),
 *      wired back to the deck store via onChange patches.
 *   3. Colors come entirely from the active palette, so a palette swap
 *      restyles the whole design without touching layout.
 *
 * Magazine identity: serif display + sans body, thin rules instead of
 * cards, oversized numerals, generous whitespace.
 */

import {
  useRef, useState, useEffect, useLayoutEffect,
  type CSSProperties, type ReactNode,
} from "react";
import { Editable } from "@/components/Editable";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette, FontPair } from "@/lib/themes/deck-themes";

// SSR-safe layout effect (static export renders on the server once).
const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

// ── Canvas geometry ───────────────────────────────────────────────────
const W = 960;
const H = 540;
const PAD_X = 54;
const PAD_TOP = 34;
const PAD_BOTTOM = 34;
const CHROME_BOTTOM = 60;                 // y where the chrome rule sits
const CONTENT_W = W - PAD_X * 2;          // 852
const BODY_TOP = CHROME_BOTTOM + 16;      // 76
const BODY_AVAIL_H = H - BODY_TOP - PAD_BOTTOM;  // 430

// Full-bleed area (cover / summary) — no chrome.
const HERO_PAD_X = 84;
const HERO_PAD_Y = 64;
const HERO_AVAIL_W = W - HERO_PAD_X * 2;
const HERO_AVAIL_H = H - HERO_PAD_Y * 2;

// ── Type identity ─────────────────────────────────────────────────────
const SERIF = "'Frank Ruhl Libre', 'David Libre', Georgia, 'Times New Roman', serif";
const SANS  = "'Heebo', 'Helvetica Neue', system-ui, -apple-system, Arial, sans-serif";

// ── Context ───────────────────────────────────────────────────────────
type DesignCtx = {
  palette: Palette;
  font: FontPair;
  isRtl: boolean;
  company: string;
  date: string;
  pageNumber?: number;
  totalPages?: number;
  interactive?: boolean;
  onChange?: (patch: Partial<Slide>) => void;
};

// ── Color helpers ─────────────────────────────────────────────────────
function rgba(hex: string, a: number): string {
  const h = (hex || "").replace(/^#/, "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
function shiftHex(hex: string, d: number): string {
  const h = (hex || "").replace(/^#/, "");
  if (h.length !== 6) return hex;
  const ch = (i: number) => Math.max(0, Math.min(255, parseInt(h.slice(i, i + 2), 16) + d)).toString(16).padStart(2, "0");
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}

type Tokens = {
  bg: string; ink: string; inkMuted: string; inkSubtle: string;
  rule: string; ruleSoft: string; accent: string; accent2: string;
  sevHigh: string; sevMed: string; sevLow: string;
};
function tokensFrom(p: Palette): Tokens {
  const ink = p.text;
  return {
    bg: p.bg,
    ink,
    inkMuted: p.textMuted,
    inkSubtle: rgba(ink, 0.55),
    rule: rgba(ink, 0.18),
    ruleSoft: rgba(ink, 0.09),
    accent: p.accent,
    accent2: p.accent2 || p.accent,
    sevHigh: p.accent,
    sevMed: p.accent2 || shiftHex(p.accent, -30),
    sevLow: rgba(ink, 0.42),
  };
}

// ──────────────────────────────────────────────────────────────────────
// AutoFit — the core overflow guarantee.
// Renders children at natural size inside a fixed (availW × availH) frame,
// measures the natural height, and scales the WHOLE block down so it fits.
// transform: scale doesn't affect layout, so scrollHeight stays the
// natural size and the measurement never feeds back on itself.
// A ResizeObserver re-fits live while the user edits text.
// ──────────────────────────────────────────────────────────────────────
function AutoFit({
  availW, availH, isRtl, children, alignTop,
}: { availW: number; availH: number; isRtl: boolean; children: ReactNode; alignTop?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useIsoLayout(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.scrollHeight;
      const w = el.scrollWidth;
      if (!h || !w) return;
      const s = Math.min(1, availH / h, availW / w);
      setScale((prev) => (Math.abs(prev - s) > 0.004 ? s : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const f = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    if (f?.ready) f.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  });

  return (
    <div style={{
      width: availW, height: availH, overflow: "hidden",
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      justifyContent: "center",
    }}>
      <div ref={ref} style={{
        width: availW,
        transform: `scale(${scale})`,
        transformOrigin: alignTop ? (isRtl ? "top right" : "top left") : "center",
      }}>
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Editable text. When interactive, renders a contentEditable span wired
// to onCh; otherwise a plain span with identical styling.
// ──────────────────────────────────────────────────────────────────────
function T({ v, onCh, ed, style, block, ph }: {
  v: string; onCh?: (v: string) => void; ed?: boolean;
  style?: CSSProperties; block?: boolean; ph?: string;
}) {
  const base: CSSProperties = { overflowWrap: "break-word", wordBreak: "break-word", ...style };
  if (ed && onCh) {
    return <Editable value={v || ""} onChange={onCh} block={block} placeholder={ph} style={base} />;
  }
  return <span style={{ ...base, whiteSpace: block ? "pre-wrap" : "normal", display: block ? "block" : "inline" }}>{v || ""}</span>;
}

// ── Small shared bits ─────────────────────────────────────────────────
function Eyebrow({ ctx, tok, value, onCh }: { ctx: DesignCtx; tok: Tokens; value: string; onCh?: (v: string) => void }) {
  if (!value && !ctx.interactive) return null;
  return (
    <div style={{ marginBottom: 12 }}>
      <T v={value} onCh={onCh} ed={ctx.interactive} ph="EYEBROW"
        style={{ fontFamily: SANS, fontSize: 10.5, color: tok.accent, letterSpacing: 4, textTransform: "uppercase", fontWeight: 700 }} />
    </div>
  );
}

function SevDot({ label, variant, tok }: { label: string; variant: "high" | "med" | "low" | "neutral"; tok: Tokens }) {
  const color = variant === "high" ? tok.sevHigh : variant === "med" ? tok.sevMed : variant === "low" ? tok.sevLow : rgba(tok.ink, 0.3);
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: 7, fontFamily: SANS, fontSize: 11, color: tok.inkMuted, whiteSpace: "nowrap" }}>
      <span style={{ width: 7, height: 7, borderRadius: "50%", background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

// Chrome — company (start) + page serial (end) + thin rule. Stays fixed
// (not inside AutoFit) since it never overflows.
function Chrome({ ctx, tok }: { ctx: DesignCtx; tok: Tokens }) {
  const startSide = ctx.isRtl ? "right" : "left";
  const endSide = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{ position: "absolute", top: PAD_TOP, [startSide]: PAD_X, fontFamily: SANS, fontSize: 9.5, letterSpacing: 3, color: tok.inkSubtle, textTransform: "uppercase", fontWeight: 600, maxWidth: 420, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } as CSSProperties}>
        {ctx.company}
      </div>
      {ctx.pageNumber !== undefined && (
        <div style={{ position: "absolute", top: PAD_TOP, [endSide]: PAD_X, fontFamily: SERIF, fontSize: 11, fontStyle: "italic", color: tok.inkSubtle } as CSSProperties}>
          {String(ctx.pageNumber).padStart(2, "0")} <span style={{ opacity: 0.4 }}>·</span> {String(ctx.totalPages ?? 0).padStart(2, "0")}
        </div>
      )}
      <div style={{ position: "absolute", top: CHROME_BOTTOM, left: PAD_X, right: PAD_X, height: 1, background: tok.rule }} />
    </>
  );
}

// Header block (eyebrow + title + subtitle), rendered in flow inside AutoFit.
// Always aligned to the reading-start side — RIGHT in Hebrew (RTL), LEFT in
// English (LTR) — via `text-align: start`.
function Header({ ctx, tok, slide, titleSize = 30 }: {
  ctx: DesignCtx; tok: Tokens; slide: Slide; titleSize?: number;
}) {
  return (
    <div style={{ textAlign: "start", marginBottom: 20 }}>
      <Eyebrow ctx={ctx} tok={tok} value={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} />
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת"
        style={{ display: "block", fontFamily: SERIF, fontSize: titleSize, lineHeight: 1.14, color: tok.ink, fontWeight: 600, letterSpacing: -0.2 }} />
      {(slide.subtitle || ctx.interactive) && (
        <div style={{ marginTop: 10 }}>
          <T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת"
            style={{ fontFamily: SANS, fontSize: 13.5, lineHeight: 1.55, color: tok.inkMuted, maxWidth: 760 }} />
        </div>
      )}
    </div>
  );
}

// Auto-shrinking numeral (still wrapped by AutoFit, but this keeps very
// long values from dominating their own column before the global fit).
function numSize(value: string, base: number): number {
  const n = String(value || "").length;
  if (n <= 2) return base;
  if (n <= 3) return base * 0.92;
  if (n <= 4) return base * 0.78;
  if (n <= 5) return base * 0.64;
  if (n <= 7) return base * 0.52;
  return base * 0.42;
}

// ──────────────────────────────────────────────────────────────────────
// Dispatcher.
// ──────────────────────────────────────────────────────────────────────
export function renderEditorial(slide: Slide, ctx: DesignCtx): ReactNode {
  const tok = tokensFrom(ctx.palette);
  const kind = slide.kind;

  // Hero layouts (full-bleed).
  if (kind === "cover" || (!kind && slide.layout === "cover")) return <Cover slide={slide} ctx={ctx} tok={tok} />;
  if (kind === "summary" || (!kind && (slide.layout === "section" || slide.layout === "quote"))) return <Summary slide={slide} ctx={ctx} tok={tok} />;

  // Chromed body layouts.
  let body: ReactNode;
  if (kind === "toc") body = <Toc slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "stats") body = <Stats slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "kpi-card") body = <KpiCard slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "horizons") body = <Horizons slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "grid") body = <Grid slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "tracks") body = <Tracks slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "table") body = <Table slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "compare") body = <Compare slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "donts") body = <Donts slide={slide} ctx={ctx} tok={tok} />;
  else body = <Bullets slide={slide} ctx={ctx} tok={tok} />;

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: tok.bg, color: tok.ink, direction: ctx.isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <Chrome ctx={ctx} tok={tok} />
      <div style={{ position: "absolute", top: BODY_TOP, left: PAD_X, right: PAD_X, height: BODY_AVAIL_H }}>
        <AutoFit availW={CONTENT_W} availH={BODY_AVAIL_H} isRtl={ctx.isRtl} alignTop>
          {body}
        </AutoFit>
      </div>
    </div>
  );
}

export function editorialBg(palette: Palette): string {
  return tokensFrom(palette).bg;
}

// ──────────────────────────────────────────────────────────────────────
// COVER
// ──────────────────────────────────────────────────────────────────────
function Cover({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: tok.bg, color: tok.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      {/* Accent rail */}
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: 4, background: tok.accent } as CSSProperties} />
      {/* Top meta */}
      <div style={{ position: "absolute", top: 40, [isRtl ? "right" : "left"]: HERO_PAD_X, fontFamily: SANS, fontSize: 10, letterSpacing: 4, color: tok.inkSubtle, textTransform: "uppercase", fontWeight: 700 } as CSSProperties}>
        <T v={ctx.date} ed={false} />
      </div>
      <div style={{ position: "absolute", top: 36, [isRtl ? "left" : "right"]: HERO_PAD_X, fontFamily: SERIF, fontSize: 11, fontStyle: "italic", color: tok.inkMuted, padding: "5px 14px", borderTop: `1px solid ${tok.rule}`, borderBottom: `1px solid ${tok.rule}`, maxWidth: 320, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } as CSSProperties}>
        {ctx.company}
      </div>

      {/* Centered title, autofit */}
      <div style={{ position: "absolute", top: HERO_PAD_Y + 30, [isRtl ? "right" : "left"]: HERO_PAD_X, width: HERO_AVAIL_W, height: HERO_AVAIL_H - 60 }}>
        <AutoFit availW={HERO_AVAIL_W} availH={HERO_AVAIL_H - 60} isRtl={isRtl} alignTop>
          <div style={{ textAlign: "start" }}>
            {(slide.subtitle || ctx.interactive) && (
              <div style={{ marginBottom: 22 }}>
                <T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת"
                  style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 18, color: tok.accent }} />
              </div>
            )}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} block ph="כותרת ראשית"
              style={{ fontFamily: SERIF, fontSize: 60, lineHeight: 1.05, color: tok.ink, fontWeight: 600, letterSpacing: -1.2 }} />
            <div style={{ marginTop: 26, height: 1, width: 120, background: tok.accent }} />
            {(slide.eyebrow || ctx.interactive) && (
              <div style={{ marginTop: 22 }}>
                <T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה"
                  style={{ fontFamily: SERIF, fontSize: 26, color: tok.inkMuted, fontWeight: 500 }} />
              </div>
            )}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// SUMMARY (full-bleed gradient quote)
// ──────────────────────────────────────────────────────────────────────
function Summary({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  void tok;
  const isRtl = ctx.isRtl;
  const fg = ctx.palette.coverText;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${ctx.palette.coverGradient}, ${ctx.palette.coverBg}`, color: fg, direction: isRtl ? "rtl" : "ltr", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: W - 160, height: H - 110 }}>
        <AutoFit availW={W - 160} availH={H - 110} isRtl={isRtl}>
          <div style={{ textAlign: "center" }}>
            {(slide.eyebrow || ctx.interactive) && (
              <div style={{ marginBottom: 30 }}>
                <T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית"
                  style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 5, textTransform: "uppercase", color: rgba(fg, 0.7), fontWeight: 700 }} />
              </div>
            )}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} block ph="האמירה המרכזית"
              style={{ fontFamily: SERIF, fontSize: 38, lineHeight: 1.22, color: fg, fontWeight: 600, letterSpacing: -0.4 }} />
            {(slide.subtitle || ctx.interactive) && (
              <>
                <div style={{ width: 90, height: 1, background: rgba(fg, 0.4), margin: "26px auto" }} />
                <T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה"
                  style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 16, color: rgba(fg, 0.85), lineHeight: 1.6 }} />
              </>
            )}
            {(slide.footnote || ctx.interactive) && (
              <div style={{ marginTop: 34 }}>
                <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="כותרת תחתית"
                  style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 4, textTransform: "uppercase", color: rgba(fg, 0.65), fontWeight: 700 }} />
              </div>
            )}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TOC
// ──────────────────────────────────────────────────────────────────────
function Toc({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const items = slide.tocItems ?? [];
  const setItem = (i: number, patch: Partial<NonNullable<Slide["tocItems"]>[number]>) =>
    ctx.onChange?.({ tocItems: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  const half = Math.ceil(items.length / 2);
  const cols = [items.slice(0, half), items.slice(half)];
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={38} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44 }}>
        {cols.map((col, ci) => (
          <div key={ci}>
            {col.map((it, i) => {
              const globalIdx = ci === 0 ? i : half + i;
              return (
                <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, padding: "11px 0", borderBottom: `1px solid ${tok.ruleSoft}`, alignItems: "baseline" }}>
                  <T v={it.index} onCh={(v) => setItem(globalIdx, { index: v })} ed={ctx.interactive}
                    style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 15, color: tok.accent, fontWeight: 600, minWidth: 22, display: "inline-block" }} />
                  <div style={{ minWidth: 0 }}>
                    <T v={it.title} onCh={(v) => setItem(globalIdx, { title: v })} ed={ctx.interactive}
                      style={{ display: "block", fontFamily: SERIF, fontSize: 15, color: tok.ink, fontWeight: 600 }} />
                    {(it.subtitle || ctx.interactive) && (
                      <T v={it.subtitle} onCh={(v) => setItem(globalIdx, { subtitle: v })} ed={ctx.interactive}
                        style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: tok.inkMuted, marginTop: 3 }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// STATS
// ──────────────────────────────────────────────────────────────────────
function Stats({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const stats = slide.stats ?? [];
  const setStat = (i: number, patch: Partial<NonNullable<Slide["stats"]>[number]>) =>
    ctx.onChange?.({ stats: stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const hero = stats.slice(0, 4);
  const sub = stats.slice(4, 8);
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={30} />
      {hero.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length}, 1fr)`, gap: 24 }}>
          {hero.map((s, i) => <StatBlock key={i} stat={s} tok={tok} ctx={ctx} onCh={(p) => setStat(i, p)} hero />)}
        </div>
      )}
      {sub.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 24, marginTop: 20 }}>
          {sub.map((s, i) => <StatBlock key={i} stat={s} tok={tok} ctx={ctx} onCh={(p) => setStat(i + 4, p)} />)}
        </div>
      )}
      {(slide.footnote || ctx.interactive) && (
        <div style={{ marginTop: 22 }}>
          <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה"
            style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: tok.inkMuted, lineHeight: 1.55 }} />
        </div>
      )}
    </div>
  );
}

function StatBlock({ stat, tok, ctx, onCh, hero }: {
  stat: NonNullable<Slide["stats"]>[number]; tok: Tokens; ctx: DesignCtx;
  onCh: (p: Partial<NonNullable<Slide["stats"]>[number]>) => void; hero?: boolean;
}) {
  return (
    <div style={{ paddingTop: 14, borderTop: `1px solid ${tok.rule}`, minWidth: 0 }}>
      <T v={stat.label ?? ""} onCh={(v) => onCh({ label: v })} ed={ctx.interactive} ph="תווית"
        style={{ display: "block", fontFamily: SANS, fontSize: 9.5, color: tok.inkSubtle, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8, minWidth: 0 }}>
        <T v={stat.value ?? ""} onCh={(v) => onCh({ value: v })} ed={ctx.interactive} ph="0"
          style={{ fontFamily: SERIF, fontSize: numSize(stat.value ?? "", hero ? 54 : 40), lineHeight: 0.95, fontWeight: 500, color: tok.accent, letterSpacing: -1.4 }} />
        {(stat.unit || ctx.interactive) && (
          <T v={stat.unit ?? ""} onCh={(v) => onCh({ unit: v })} ed={ctx.interactive} ph="יח׳"
            style={{ fontFamily: SERIF, fontSize: hero ? 15 : 12, fontStyle: "italic", color: tok.inkMuted }} />
        )}
      </div>
      {(stat.caption || ctx.interactive) && (
        <T v={stat.caption ?? ""} onCh={(v) => onCh({ caption: v })} ed={ctx.interactive} block ph="הסבר"
          style={{ display: "block", fontFamily: SANS, fontSize: 11, color: tok.inkMuted, marginTop: 8, lineHeight: 1.5 }} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// KPI-CARD
// ──────────────────────────────────────────────────────────────────────
function KpiCard({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const stats = slide.stats ?? [];
  const setStat = (i: number, patch: Partial<NonNullable<Slide["stats"]>[number]>) =>
    ctx.onChange?.({ stats: stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  return (
    <div>
      <Eyebrow ctx={ctx} tok={tok} value={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 44, alignItems: "start", marginTop: 6 }}>
        <div style={{ borderInlineEnd: `1px solid ${tok.rule}`, paddingInlineEnd: 24 }}>
          {stats[0] && <BigStat stat={stats[0]} tok={tok} ctx={ctx} onCh={(p) => setStat(0, p)} size={88} />}
          {stats[1] && (
            <div style={{ marginTop: 26, paddingTop: 20, borderTop: `1px solid ${tok.ruleSoft}` }}>
              <BigStat stat={stats[1]} tok={tok} ctx={ctx} onCh={(p) => setStat(1, p)} size={46} />
            </div>
          )}
        </div>
        <div style={{ minWidth: 0 }}>
          <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} block ph="כותרת"
            style={{ fontFamily: SERIF, fontSize: 30, lineHeight: 1.18, color: tok.ink, fontWeight: 600, letterSpacing: -0.3 }} />
          {(slide.body || ctx.interactive) && (
            <div style={{ marginTop: 16 }}>
              <T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף"
                style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: tok.inkMuted }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function BigStat({ stat, tok, ctx, onCh, size }: {
  stat: NonNullable<Slide["stats"]>[number]; tok: Tokens; ctx: DesignCtx;
  onCh: (p: Partial<NonNullable<Slide["stats"]>[number]>) => void; size: number;
}) {
  return (
    <div style={{ minWidth: 0 }}>
      {(stat.label || ctx.interactive) && (
        <T v={stat.label ?? ""} onCh={(v) => onCh({ label: v })} ed={ctx.interactive} ph="תווית"
          style={{ display: "block", fontFamily: SANS, fontSize: 9.5, color: tok.inkSubtle, letterSpacing: 3, textTransform: "uppercase", fontWeight: 700, marginBottom: 12 }} />
      )}
      <div style={{ display: "flex", alignItems: "baseline", gap: 12, minWidth: 0 }}>
        <T v={stat.value ?? ""} onCh={(v) => onCh({ value: v })} ed={ctx.interactive} ph="0"
          style={{ fontFamily: SERIF, fontSize: numSize(stat.value ?? "", size), lineHeight: 0.9, fontWeight: 500, color: tok.accent, letterSpacing: -2.5 }} />
        {(stat.unit || ctx.interactive) && (
          <T v={stat.unit ?? ""} onCh={(v) => onCh({ unit: v })} ed={ctx.interactive} ph="יח׳"
            style={{ fontFamily: SERIF, fontSize: size > 60 ? 20 : 14, fontStyle: "italic", color: tok.inkMuted }} />
        )}
      </div>
      {(stat.caption || ctx.interactive) && (
        <T v={stat.caption ?? ""} onCh={(v) => onCh({ caption: v })} ed={ctx.interactive} block ph="הסבר"
          style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: tok.inkMuted, marginTop: 12, lineHeight: 1.55 }} />
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// HORIZONS
// ──────────────────────────────────────────────────────────────────────
function Horizons({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const cards = slide.horizons ?? [];
  const setCard = (i: number, patch: Partial<NonNullable<Slide["horizons"]>[number]>) =>
    ctx.onChange?.({ horizons: cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const setRow = (ci: number, ri: number, patch: Partial<{ label: string; value: string }>) => {
    const card = cards[ci]; if (!card) return;
    const rows = (card.rows ?? []).map((r, idx) => (idx === ri ? { ...r, ...patch } : r));
    setCard(ci, { rows });
  };
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={28} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 34 }}>
        {cards.map((c, i) => {
          const accent = c.variant === "teal" || c.variant === "navy";
          return (
            <div key={i} style={{ paddingTop: 12, borderTop: `${accent ? 3 : 1}px solid ${accent ? tok.accent : tok.rule}`, minWidth: 0 }}>
              <T v={c.eyebrow} onCh={(v) => setCard(i, { eyebrow: v })} ed={ctx.interactive}
                style={{ display: "block", fontFamily: SANS, fontSize: 9.5, letterSpacing: 3, textTransform: "uppercase", color: accent ? tok.accent : tok.inkSubtle, fontWeight: 700, marginBottom: 10 }} />
              <T v={c.bigText} onCh={(v) => setCard(i, { bigText: v })} ed={ctx.interactive} ph="2026"
                style={{ display: "block", fontFamily: SERIF, fontSize: numSize(c.bigText, 60), lineHeight: 0.95, fontWeight: 500, color: accent ? tok.accent : tok.ink, letterSpacing: -1.6, marginBottom: 12 }} />
              {(c.caption || ctx.interactive) && (
                <T v={c.caption ?? ""} onCh={(v) => setCard(i, { caption: v })} ed={ctx.interactive} block ph="תיאור"
                  style={{ display: "block", fontFamily: SERIF, fontStyle: "italic", fontSize: 12.5, color: tok.inkMuted, marginBottom: 12, lineHeight: 1.45 }} />
              )}
              <div>
                {(c.rows ?? []).map((r, ri) => (
                  <div key={ri} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, padding: "7px 0", borderBottom: `1px solid ${tok.ruleSoft}`, alignItems: "baseline", minWidth: 0 }}>
                    <T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive}
                      style={{ fontFamily: SANS, fontSize: 11, color: tok.inkSubtle, fontWeight: 600 }} />
                    <T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive}
                      style={{ fontFamily: SERIF, fontSize: 12, color: tok.ink, textAlign: "end", display: "block" }} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && (
        <div style={{ marginTop: 16 }}>
          <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה"
            style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: tok.inkMuted, lineHeight: 1.5 }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// GRID
// ──────────────────────────────────────────────────────────────────────
function Grid({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const cells = slide.gridCards ?? [];
  const setCell = (i: number, patch: Partial<NonNullable<Slide["gridCards"]>[number]>) =>
    ctx.onChange?.({ gridCards: cells.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={28} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 44, rowGap: 24 }}>
        {cells.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, paddingTop: 14, borderTop: `1px solid ${tok.rule}`, minWidth: 0 }}>
            <T v={c.index} onCh={(v) => setCell(i, { index: v })} ed={ctx.interactive}
              style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 26, fontWeight: 500, color: tok.accent, letterSpacing: -0.5, lineHeight: 1 }} />
            <div style={{ minWidth: 0 }}>
              <T v={c.title} onCh={(v) => setCell(i, { title: v })} ed={ctx.interactive}
                style={{ display: "block", fontFamily: SERIF, fontSize: 16.5, fontWeight: 600, color: tok.ink, lineHeight: 1.25, marginBottom: 8 }} />
              <T v={c.description} onCh={(v) => setCell(i, { description: v })} ed={ctx.interactive} block
                style={{ display: "block", fontFamily: SANS, fontSize: 12.5, color: tok.inkMuted, lineHeight: 1.55 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TRACKS
// ──────────────────────────────────────────────────────────────────────
function Tracks({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const tracks = slide.tracks ?? [];
  const setTrack = (i: number, patch: Partial<NonNullable<Slide["tracks"]>[number]>) =>
    ctx.onChange?.({ tracks: tracks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={28} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tracks.length || 1}, 1fr)`, gap: 34 }}>
        {tracks.map((tk, i) => {
          const accent = tk.variant === "teal";
          const dark = tk.variant === "navy" || tk.variant === "blue";
          const top = accent ? tok.accent : dark ? tok.accent2 : tok.rule;
          return (
            <div key={i} style={{ paddingTop: 14, borderTop: `${accent ? 3 : 1}px solid ${top}`, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 12, marginBottom: 8 }}>
                <T v={tk.index} onCh={(v) => setTrack(i, { index: v })} ed={ctx.interactive}
                  style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 22, fontWeight: 500, color: tok.accent, letterSpacing: -0.4, lineHeight: 1 }} />
                <T v={tk.eyebrow} onCh={(v) => setTrack(i, { eyebrow: v })} ed={ctx.interactive}
                  style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: 2.5, textTransform: "uppercase", color: tok.inkSubtle, fontWeight: 700 }} />
              </div>
              <T v={tk.title} onCh={(v) => setTrack(i, { title: v })} ed={ctx.interactive}
                style={{ display: "block", fontFamily: SERIF, fontSize: 18.5, fontWeight: 600, color: tok.ink, lineHeight: 1.2, marginBottom: 12 }} />
              <T v={tk.description} onCh={(v) => setTrack(i, { description: v })} ed={ctx.interactive} block
                style={{ display: "block", fontFamily: SANS, fontSize: 12, color: tok.inkMuted, lineHeight: 1.6 }} />
              {(tk.chip || ctx.interactive) && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${tok.ruleSoft}` }}>
                  <T v={tk.chip ?? ""} onCh={(v) => setTrack(i, { chip: v })} ed={ctx.interactive} ph="תגית"
                    style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 12, color: tok.accent }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && (
        <div style={{ marginTop: 16, paddingTop: 12, borderTop: `1px solid ${tok.rule}`, display: "flex", justifyContent: "space-between", gap: 24, alignItems: "baseline" }}>
          <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="הערה"
            style={{ fontFamily: SERIF, fontSize: 13, color: tok.ink, fontWeight: 600 }} />
          {(slide.footnoteChip || ctx.interactive) && (
            <T v={slide.footnoteChip ?? ""} onCh={(v) => ctx.onChange?.({ footnoteChip: v })} ed={ctx.interactive} ph="תגית"
              style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 2.5, color: tok.accent, textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }} />
          )}
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TABLE
// RULE (applies to every design): a table is ONE shared-column structure,
// never a separate grid per row. Here that's a real <table> with
// table-layout: fixed + a <colgroup>, so the header and every row share
// the exact same column tracks and all columns line up from a single
// right-hand baseline (start side). Editorial look kept: hairline rules
// only, serif bold first column, severity dots — no Word-style gridlines.
// ──────────────────────────────────────────────────────────────────────
function Table({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const headers = slide.tableHeaders ?? [];
  const rows = slide.tableRows ?? [];
  const hasChip = rows.some((r) => r.chip);
  const nData = headers.length;
  const PAD_END = 20; // inter-column spacing (on the reading-end side)
  const setHeader = (i: number, v: string) =>
    ctx.onChange?.({ tableHeaders: headers.map((h, idx) => (idx === i ? v : h)) });
  const setCell = (ri: number, ci: number, v: string) => {
    const next = rows.map((r, idx) => (idx === ri ? { ...r, cells: r.cells.map((c, j) => (j === ci ? v : c)) } : r));
    ctx.onChange?.({ tableRows: next });
  };
  // Spacing sits on each cell's end side, except the final column.
  const dataPadEnd = (ci: number) => (!hasChip && ci === nData - 1 ? 0 : PAD_END);

  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={27} />
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", direction: ctx.isRtl ? "rtl" : "ltr" }}>
        <colgroup>
          {headers.map((_, i) => (
            <col key={i} style={i === 0 ? { width: "22%" } : undefined} />
          ))}
          {hasChip && <col style={{ width: 116 }} />}
        </colgroup>
        <thead>
          <tr>
            {headers.map((h, i) => (
              <th key={i} style={{ textAlign: "start", verticalAlign: "bottom", paddingBottom: 9, paddingInlineEnd: dataPadEnd(i), borderBottom: `1.5px solid ${tok.ink}` }}>
                <T v={h} onCh={(v) => setHeader(i, v)} ed={ctx.interactive} block
                  style={{ display: "block", fontFamily: SANS, fontSize: 9.5, letterSpacing: 2.5, textTransform: "uppercase", color: tok.ink, fontWeight: 700, lineHeight: 1.3 }} />
              </th>
            ))}
            {hasChip && <th style={{ borderBottom: `1.5px solid ${tok.ink}` }} />}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => {
            const rule = ri < rows.length - 1 ? `1px solid ${tok.ruleSoft}` : "none";
            return (
              <tr key={ri} style={{ background: row.emphasize ? rgba(tok.accent, 0.05) : "transparent" }}>
                {Array.from({ length: nData }).map((_, ci) => (
                  <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "8px 0", paddingInlineEnd: dataPadEnd(ci), borderBottom: rule }}>
                    <T v={row.cells[ci] ?? ""} onCh={(v) => setCell(ri, ci, v)} ed={ctx.interactive} block
                      style={{ display: "block", fontFamily: ci === 0 ? SERIF : SANS, fontSize: ci === 0 ? 13 : 12, fontWeight: ci === 0 ? (row.emphasize ? 700 : 600) : 400, color: ci === 0 ? tok.ink : tok.inkMuted, lineHeight: 1.4 }} />
                  </td>
                ))}
                {hasChip && (
                  <td style={{ textAlign: "start", verticalAlign: "middle", padding: "8px 0", borderBottom: rule }}>
                    {row.chip ? <SevDot label={row.chip} variant={row.chipVariant ?? "neutral"} tok={tok} /> : null}
                  </td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
      {(slide.footnote || ctx.interactive) && (
        <div style={{ marginTop: 14 }}>
          <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה"
            style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: tok.inkMuted, lineHeight: 1.5 }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// COMPARE
// ──────────────────────────────────────────────────────────────────────
function Compare({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const panes: ("leftPane" | "rightPane")[] = [];
  if (slide.leftPane) panes.push("leftPane");
  if (slide.rightPane) panes.push("rightPane");
  const setPane = (key: "leftPane" | "rightPane", patch: Partial<NonNullable<Slide["leftPane"]>>) => {
    const cur = slide[key]; if (!cur) return;
    ctx.onChange?.({ [key]: { ...cur, ...patch } } as Partial<Slide>);
  };
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={27} />
      <div style={{ display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 44 }}>
        {panes.map((key, i) => {
          const pane = slide[key]!;
          const setRow = (ri: number, patch: Partial<{ label: string; value: string }>) =>
            setPane(key, { rows: (pane.rows ?? []).map((r, idx) => (idx === ri ? { ...r, ...patch } : r)) });
          const setBullet = (bi: number, v: string) =>
            setPane(key, { bullets: (pane.bullets ?? []).map((b, idx) => (idx === bi ? v : b)) });
          return (
            <div key={i} style={{ paddingInlineEnd: i === 0 && panes.length === 2 ? 24 : 0, borderInlineEnd: i === 0 && panes.length === 2 ? `1px solid ${tok.rule}` : "none", minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <T v={pane.eyebrow ?? ""} onCh={(v) => setPane(key, { eyebrow: v })} ed={ctx.interactive} ph="תווית"
                  style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: 3, textTransform: "uppercase", color: tok.accent, fontWeight: 700 }} />
                {(pane.chip || ctx.interactive) && (
                  <T v={pane.chip ?? ""} onCh={(v) => setPane(key, { chip: v })} ed={ctx.interactive} ph="תג"
                    style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11.5, color: tok.inkMuted, whiteSpace: "nowrap" }} />
                )}
              </div>
              <T v={pane.title ?? ""} onCh={(v) => setPane(key, { title: v })} ed={ctx.interactive} block ph="כותרת"
                style={{ display: "block", fontFamily: SERIF, fontSize: 19, fontWeight: 600, color: tok.ink, lineHeight: 1.22, marginBottom: 14 }} />
              {(pane.rows ?? []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {(pane.rows ?? []).map((r, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 16, padding: "6px 0", borderBottom: `1px solid ${tok.ruleSoft}` }}>
                      <T v={r.label} onCh={(v) => setRow(ri, { label: v })} ed={ctx.interactive}
                        style={{ fontFamily: SANS, fontSize: 12, color: tok.inkMuted }} />
                      <T v={r.value} onCh={(v) => setRow(ri, { value: v })} ed={ctx.interactive}
                        style={{ fontFamily: SERIF, fontSize: 12, color: tok.ink, fontWeight: 600, textAlign: "end", display: "block" }} />
                    </div>
                  ))}
                </div>
              )}
              {(pane.bullets ?? []).map((b, bi) => {
                const [head, ...rest] = (b || "").split(" — ");
                return (
                  <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, marginTop: 9, minWidth: 0 }}>
                    <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 13, color: tok.accent, fontWeight: 600 }}>{String.fromCharCode(65 + bi)}</span>
                    {ctx.interactive ? (
                      <T v={b} onCh={(v) => setBullet(bi, v)} ed block
                        style={{ display: "block", fontFamily: SANS, fontSize: 12, lineHeight: 1.55, color: tok.ink }} />
                    ) : (
                      <div style={{ fontFamily: SANS, fontSize: 12, lineHeight: 1.55, minWidth: 0 }}>
                        <span style={{ fontFamily: SERIF, fontWeight: 600, color: tok.ink }}>{head}</span>
                        {rest.length > 0 && <span style={{ color: tok.inkMuted }}>{" — " + rest.join(" — ")}</span>}
                      </div>
                    )}
                  </div>
                );
              })}
              {(pane.footnote || ctx.interactive) && (
                <div style={{ marginTop: 14, paddingTop: 12, borderTop: `1px solid ${tok.ruleSoft}` }}>
                  <T v={pane.footnote ?? ""} onCh={(v) => setPane(key, { footnote: v })} ed={ctx.interactive} block ph="הערה"
                    style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 11, color: tok.inkMuted, lineHeight: 1.5 }} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// DONTS
// ──────────────────────────────────────────────────────────────────────
function Donts({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const items = slide.dontItems ?? [];
  const setItem = (i: number, patch: Partial<NonNullable<Slide["dontItems"]>[number]>) =>
    ctx.onChange?.({ dontItems: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={30} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: 52, rowGap: 20 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, paddingTop: 12, borderTop: `1px solid ${tok.rule}`, minWidth: 0 }}>
            <div style={{ fontFamily: SERIF, fontSize: 20, color: tok.accent, fontWeight: 500, lineHeight: 1, fontStyle: "italic" }}>—</div>
            <div style={{ minWidth: 0 }}>
              <T v={it.title} onCh={(v) => setItem(i, { title: v })} ed={ctx.interactive}
                style={{ display: "block", fontFamily: SERIF, fontSize: 14, fontWeight: 600, color: tok.ink, marginBottom: 6, textDecoration: "line-through", textDecorationColor: rgba(tok.ink, 0.35) }} />
              <T v={it.description} onCh={(v) => setItem(i, { description: v })} ed={ctx.interactive} block
                style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: tok.inkMuted, lineHeight: 1.55 }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// BULLETS (fallback for legacy / content slides)
// ──────────────────────────────────────────────────────────────────────
function Bullets({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const bullets = slide.bullets ?? [];
  const setB = (i: number, v: string) =>
    ctx.onChange?.({ bullets: bullets.map((b, idx) => (idx === i ? v : b)) });
  return (
    <div>
      <Header ctx={ctx} tok={tok} slide={slide} titleSize={30} />
      <div style={{ maxWidth: 800 }}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, padding: "11px 0", borderBottom: `1px solid ${tok.ruleSoft}`, minWidth: 0 }}>
            <span style={{ fontFamily: SERIF, fontStyle: "italic", fontSize: 14, color: tok.accent, fontWeight: 600, minWidth: 16 }}>{String(i + 1).padStart(2, "0")}</span>
            <T v={b} onCh={(v) => setB(i, v)} ed={ctx.interactive} block
              style={{ display: "block", fontFamily: SANS, fontSize: 13, color: tok.ink, lineHeight: 1.6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
