"use client";

/**
 * "Corporate Cards" design — modular consulting-deck language.
 *
 * Identity (deliberately the opposite of Editorial):
 *   - Soft gray canvas; every content block lives inside its own white
 *     rounded card with a subtle shadow. Modular, tidy, friendly.
 *   - Clean sans typography throughout (no serif), bold headings, bold
 *     numerals. Rounded severity pills instead of hairline dots.
 *   - Colored top-accent bars and number badges drawn from the palette.
 *
 * Same engine as every design: AutoFit scales the whole slide to fit
 * (nothing clipped/overlapping), every string is inline-editable, and all
 * colors come from the active palette. Text uses logical start/end so it
 * sits right in Hebrew and left in English from one code path.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette } from "@/lib/themes/deck-themes";
import {
  W, H, AutoFit, T, rgba, shiftHex, numSize,
  type DesignCtx,
} from "./shared";

// ── Geometry ──────────────────────────────────────────────────────────
const PAD_X = 44;
const PAD_TOP = 30;
const PAD_BOTTOM = 30;
const CHROME_BOTTOM = 54;
const CONTENT_W = W - PAD_X * 2;            // 872
const BODY_TOP = CHROME_BOTTOM + 16;        // 70
const BODY_AVAIL_H = H - BODY_TOP - PAD_BOTTOM;  // 440
const HERO_PAD = 78;

// ── Type ──────────────────────────────────────────────────────────────
const SANS = "var(--deck-font, 'Heebo', 'Assistant', 'Helvetica Neue', system-ui, -apple-system, Arial, sans-serif)";

// ── Tokens ────────────────────────────────────────────────────────────
type Tokens = {
  canvas: string; surface: string; surfaceAlt: string;
  ink: string; inkMuted: string; inkSubtle: string;
  border: string; shadow: string; shadowSoft: string;
  accent: string; accent2: string; onAccent: string;
  sevHigh: string; sevMed: string; sevLow: string;
};
function tokensFrom(p: Palette): Tokens {
  const dark = p.dark;
  const ink = p.text;
  return {
    canvas: dark ? p.bg : shiftHex(p.bg, -8),
    surface: dark ? shiftHex(p.bg, 16) : "#ffffff",
    surfaceAlt: dark ? shiftHex(p.bg, 24) : shiftHex(p.bg, -4),
    ink,
    inkMuted: p.textMuted,
    inkSubtle: rgba(ink, 0.5),
    border: dark ? rgba("#ffffff", 0.08) : rgba(ink, 0.07),
    shadow: dark ? "rgba(0,0,0,0.5)" : "rgba(16,30,60,0.09)",
    shadowSoft: dark ? "rgba(0,0,0,0.32)" : "rgba(16,30,60,0.05)",
    accent: p.accent,
    accent2: p.accent2 || p.accent,
    onAccent: "#ffffff",
    sevHigh: p.accent,
    sevMed: p.accent2 || shiftHex(p.accent, -30),
    sevLow: rgba(ink, 0.4),
  };
}

// ── Card primitive ────────────────────────────────────────────────────
function Card({ tok, children, style, accentTop, pad = 18 }: {
  tok: Tokens; children: ReactNode; style?: CSSProperties; accentTop?: string; pad?: number;
}) {
  return (
    <div style={{
      background: tok.surface, borderRadius: 14,
      boxShadow: `0 1px 2px ${tok.shadow}, 0 10px 26px ${tok.shadowSoft}`,
      border: `1px solid ${tok.border}`,
      padding: pad, position: "relative", overflow: "hidden",
      minWidth: 0, ...style,
    }}>
      {accentTop && <div style={{ position: "absolute", top: 0, insetInlineStart: 0, insetInlineEnd: 0, height: 4, background: accentTop }} />}
      {children}
    </div>
  );
}

// ── Severity / status pill ────────────────────────────────────────────
function Pill({ label, variant, tok }: { label: string; variant: "high" | "med" | "low" | "neutral"; tok: Tokens }) {
  const [bg, fg] =
    variant === "high" ? [rgba(tok.sevHigh, 0.14), tok.sevHigh] :
    variant === "med" ? [rgba(tok.sevMed, 0.14), tok.sevMed] :
    variant === "low" ? [rgba(tok.ink, 0.07), tok.inkMuted] :
    [rgba(tok.ink, 0.06), tok.inkMuted];
  return (
    <span style={{ display: "inline-block", background: bg, color: fg, padding: "3px 10px", borderRadius: 999, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap", letterSpacing: 0.2 }}>
      {label}
    </span>
  );
}

// ── Kicker (accent uppercase label) ───────────────────────────────────
function Kicker({ ctx, tok, value, onCh }: { ctx: DesignCtx; tok: Tokens; value: string; onCh?: (v: string) => void }) {
  if (!value && !ctx.interactive) return null;
  return (
    <div style={{ marginBottom: 10 }}>
      <T v={value} onCh={onCh} ed={ctx.interactive} ph="KICKER"
        style={{ fontFamily: SANS, fontSize: 10.5, color: tok.accent, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800 }} />
    </div>
  );
}

// ── Chrome ────────────────────────────────────────────────────────────
function Chrome({ ctx, tok }: { ctx: DesignCtx; tok: Tokens }) {
  const startSide = ctx.isRtl ? "right" : "left";
  const endSide = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{ position: "absolute", top: PAD_TOP, [startSide]: PAD_X, display: "flex", alignItems: "center", gap: 9 } as CSSProperties}>
        <span style={{ width: 16, height: 16, borderRadius: 5, background: tok.accent, flexShrink: 0 }} />
        <span style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, color: tok.inkMuted, fontWeight: 700, maxWidth: 420, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ctx.company}</span>
      </div>
      {ctx.pageNumber !== undefined && (
        <div style={{ position: "absolute", top: PAD_TOP + 1, [endSide]: PAD_X, fontFamily: SANS, fontSize: 11, color: tok.inkSubtle, fontWeight: 600 } as CSSProperties}>
          {String(ctx.pageNumber).padStart(2, "0")} / {String(ctx.totalPages ?? 0).padStart(2, "0")}
        </div>
      )}
    </>
  );
}

// ── Title block (on canvas, above the cards) ──────────────────────────
function Title({ ctx, tok, slide, size = 28 }: { ctx: DesignCtx; tok: Tokens; slide: Slide; size?: number }) {
  return (
    <div style={{ textAlign: "start", marginBottom: 16 }}>
      <Kicker ctx={ctx} tok={tok} value={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} />
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת"
        style={{ display: "block", fontFamily: SANS, fontSize: size, lineHeight: 1.15, color: tok.ink, fontWeight: 800, letterSpacing: -0.4 }} />
      {(slide.subtitle || ctx.interactive) && (
        <div style={{ marginTop: 8 }}>
          <T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת"
            style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: tok.inkMuted, maxWidth: 780 }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// Dispatcher
// ──────────────────────────────────────────────────────────────────────
export function renderCorporate(slide: Slide, ctx: DesignCtx): ReactNode {
  const tok = tokensFrom(ctx.palette);
  const kind = slide.kind;

  if (kind === "cover" || (!kind && slide.layout === "cover")) return <Cover slide={slide} ctx={ctx} tok={tok} />;
  if (kind === "summary" || (!kind && (slide.layout === "section" || slide.layout === "quote"))) return <Summary slide={slide} ctx={ctx} tok={tok} />;

  let body: ReactNode;
  if (kind === "toc") body = <Toc slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "stats") body = <Stats slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "kpi-card") body = <KpiCard slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "horizons") body = <Horizons slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "grid") body = <Grid slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "tracks") body = <Tracks slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "table") body = <TableCard slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "compare") body = <Compare slide={slide} ctx={ctx} tok={tok} />;
  else if (kind === "donts") body = <Donts slide={slide} ctx={ctx} tok={tok} />;
  else body = <Bullets slide={slide} ctx={ctx} tok={tok} />;

  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: tok.canvas, color: tok.ink, direction: ctx.isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <Chrome ctx={ctx} tok={tok} />
      <div style={{ position: "absolute", top: BODY_TOP, left: PAD_X, right: PAD_X, height: BODY_AVAIL_H }}>
        <AutoFit availW={CONTENT_W} availH={BODY_AVAIL_H} isRtl={ctx.isRtl} alignTop>
          {body}
        </AutoFit>
      </div>
    </div>
  );
}

export function corporateBg(palette: Palette): string {
  return tokensFrom(palette).canvas;
}

// ──────────────────────────────────────────────────────────────────────
// COVER — full-bleed accent gradient title card.
// ──────────────────────────────────────────────────────────────────────
function Cover({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  void tok;
  const isRtl = ctx.isRtl;
  const fg = ctx.palette.coverText;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${ctx.palette.coverGradient}, ${ctx.palette.coverBg}`, color: fg, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      {/* soft geometric accent */}
      <div style={{ position: "absolute", [isRtl ? "left" : "right"]: -120, top: -120, width: 360, height: 360, borderRadius: 40, background: rgba(fg, 0.06), transform: "rotate(20deg)" } as CSSProperties} />
      <div style={{ position: "absolute", top: PAD_TOP, [isRtl ? "right" : "left"]: HERO_PAD, display: "flex", alignItems: "center", gap: 9 } as CSSProperties}>
        <span style={{ width: 16, height: 16, borderRadius: 5, background: fg, opacity: 0.9 }} />
        <span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1, color: rgba(fg, 0.85), fontWeight: 700 }}>{ctx.company}</span>
      </div>
      <div style={{ position: "absolute", top: PAD_TOP + 1, [isRtl ? "left" : "right"]: HERO_PAD, fontFamily: SANS, fontSize: 11, color: rgba(fg, 0.7), fontWeight: 600 } as CSSProperties}>{ctx.date}</div>

      <div style={{ position: "absolute", top: HERO_PAD + 20, [isRtl ? "right" : "left"]: HERO_PAD, width: W - HERO_PAD * 2, height: H - (HERO_PAD + 20) - HERO_PAD }}>
        <AutoFit availW={W - HERO_PAD * 2} availH={H - (HERO_PAD + 20) - HERO_PAD} isRtl={isRtl} alignTop>
          <div style={{ textAlign: "start" }}>
            {(slide.subtitle || ctx.interactive) && (
              <div style={{ marginBottom: 18 }}>
                <span style={{ display: "inline-block", padding: "5px 14px", borderRadius: 999, background: rgba(fg, 0.14), color: fg }}>
                  <T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת"
                    style={{ fontFamily: SANS, fontSize: 12, fontWeight: 700, letterSpacing: 0.5 }} />
                </span>
              </div>
            )}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} block ph="כותרת ראשית"
              style={{ fontFamily: SANS, fontSize: 56, lineHeight: 1.06, color: fg, fontWeight: 800, letterSpacing: -1.4 }} />
            {(slide.eyebrow || ctx.interactive) && (
              <div style={{ marginTop: 20 }}>
                <T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה"
                  style={{ fontFamily: SANS, fontSize: 20, color: rgba(fg, 0.9), fontWeight: 600 }} />
              </div>
            )}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// SUMMARY — full-bleed centered statement.
// ──────────────────────────────────────────────────────────────────────
function Summary({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  void tok;
  const isRtl = ctx.isRtl;
  const fg = ctx.palette.coverText;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${ctx.palette.coverGradient}, ${ctx.palette.coverBg}`, color: fg, direction: isRtl ? "rtl" : "ltr", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: W - 150, height: H - 110 }}>
        <AutoFit availW={W - 150} availH={H - 110} isRtl={isRtl}>
          <div style={{ textAlign: "center" }}>
            {(slide.eyebrow || ctx.interactive) && (
              <div style={{ marginBottom: 26 }}>
                <span style={{ display: "inline-block", padding: "5px 16px", borderRadius: 999, background: rgba(fg, 0.14) }}>
                  <T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית"
                    style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: fg, fontWeight: 800 }} />
                </span>
              </div>
            )}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} block ph="האמירה המרכזית"
              style={{ fontFamily: SANS, fontSize: 36, lineHeight: 1.25, color: fg, fontWeight: 800, letterSpacing: -0.6 }} />
            {(slide.subtitle || ctx.interactive) && (
              <div style={{ marginTop: 22 }}>
                <T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה"
                  style={{ fontFamily: SANS, fontSize: 15, color: rgba(fg, 0.85), lineHeight: 1.6, fontWeight: 400 }} />
              </div>
            )}
            {(slide.footnote || ctx.interactive) && (
              <div style={{ marginTop: 30 }}>
                <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="כותרת תחתית"
                  style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: rgba(fg, 0.7), fontWeight: 700 }} />
              </div>
            )}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TOC — grid of small numbered cards.
// ──────────────────────────────────────────────────────────────────────
function Toc({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const items = slide.tocItems ?? [];
  const setItem = (i: number, patch: Partial<NonNullable<Slide["tocItems"]>[number]>) =>
    ctx.onChange?.({ tocItems: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={32} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {items.map((it, i) => (
          <Card key={i} tok={tok} pad={14}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, alignItems: "center" }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: rgba(tok.accent, 0.12), color: tok.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>
                <T v={it.index} onCh={(v) => setItem(i, { index: v })} ed={ctx.interactive} />
              </div>
              <div style={{ minWidth: 0 }}>
                <T v={it.title} onCh={(v) => setItem(i, { title: v })} ed={ctx.interactive}
                  style={{ display: "block", fontFamily: SANS, fontSize: 14, color: tok.ink, fontWeight: 700 }} />
                {(it.subtitle || ctx.interactive) && (
                  <T v={it.subtitle} onCh={(v) => setItem(i, { subtitle: v })} ed={ctx.interactive}
                    style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: tok.inkMuted, marginTop: 2 }} />
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// STATS — row(s) of KPI cards.
// ──────────────────────────────────────────────────────────────────────
function Stats({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const stats = slide.stats ?? [];
  const setStat = (i: number, patch: Partial<NonNullable<Slide["stats"]>[number]>) =>
    ctx.onChange?.({ stats: stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const hero = stats.slice(0, 4);
  const sub = stats.slice(4, 8);
  const renderCard = (s: NonNullable<Slide["stats"]>[number], i: number, big: boolean) => (
    <Card key={i} tok={tok} pad={16} accentTop={i === 0 && big ? tok.accent : undefined}>
      <T v={s.label ?? ""} onCh={(v) => setStat(i, { label: v })} ed={ctx.interactive} ph="תווית"
        style={{ display: "block", fontFamily: SANS, fontSize: 10, color: tok.inkSubtle, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 6, minWidth: 0 }}>
        <T v={s.value ?? ""} onCh={(v) => setStat(i, { value: v })} ed={ctx.interactive} ph="0"
          style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", big ? 46 : 34), lineHeight: 1, fontWeight: 800, color: tok.accent, letterSpacing: -1 }} />
        {(s.unit || ctx.interactive) && (
          <T v={s.unit ?? ""} onCh={(v) => setStat(i, { unit: v })} ed={ctx.interactive} ph="יח׳"
            style={{ fontFamily: SANS, fontSize: big ? 14 : 12, color: tok.inkMuted, fontWeight: 700 }} />
        )}
      </div>
      {(s.caption || ctx.interactive) && (
        <T v={s.caption ?? ""} onCh={(v) => setStat(i, { caption: v })} ed={ctx.interactive} block ph="הסבר"
          style={{ display: "block", fontFamily: SANS, fontSize: 11, color: tok.inkMuted, marginTop: 8, lineHeight: 1.45 }} />
      )}
    </Card>
  );
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={28} />
      {hero.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length}, 1fr)`, gap: 14 }}>
          {hero.map((s, i) => renderCard(s, i, true))}
        </div>
      )}
      {sub.length > 0 && (
        <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 14, marginTop: 14 }}>
          {sub.map((s, i) => renderCard(s, i + 4, false))}
        </div>
      )}
      {(slide.footnote || ctx.interactive) && (
        <div style={{ marginTop: 14 }}>
          <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה"
            style={{ fontFamily: SANS, fontSize: 11.5, color: tok.inkMuted, lineHeight: 1.5 }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// KPI-CARD — hero stat card + body card.
// ──────────────────────────────────────────────────────────────────────
function KpiCard({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const stats = slide.stats ?? [];
  const setStat = (i: number, patch: Partial<NonNullable<Slide["stats"]>[number]>) =>
    ctx.onChange?.({ stats: stats.map((s, idx) => (idx === i ? { ...s, ...patch } : s)) });
  const statCard = (s: NonNullable<Slide["stats"]>[number], i: number, accentFill: boolean) => (
    <Card tok={tok} pad={20} style={accentFill ? { background: `linear-gradient(140deg, ${tok.accent}, ${shiftHex(tok.accent, -28)})`, border: "none" } : undefined}>
      <T v={s.label ?? ""} onCh={(v) => setStat(i, { label: v })} ed={ctx.interactive} ph="תווית"
        style={{ display: "block", fontFamily: SANS, fontSize: 10, color: accentFill ? rgba("#ffffff", 0.85) : tok.inkSubtle, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}>
        <T v={s.value ?? ""} onCh={(v) => setStat(i, { value: v })} ed={ctx.interactive} ph="0"
          style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", accentFill ? 64 : 40), lineHeight: 1, fontWeight: 800, color: accentFill ? "#ffffff" : tok.accent, letterSpacing: -1.5 }} />
        {(s.unit || ctx.interactive) && (
          <T v={s.unit ?? ""} onCh={(v) => setStat(i, { unit: v })} ed={ctx.interactive} ph="יח׳"
            style={{ fontFamily: SANS, fontSize: accentFill ? 16 : 13, color: accentFill ? rgba("#ffffff", 0.9) : tok.inkMuted, fontWeight: 700 }} />
        )}
      </div>
      {(s.caption || ctx.interactive) && (
        <T v={s.caption ?? ""} onCh={(v) => setStat(i, { caption: v })} ed={ctx.interactive} block ph="הסבר"
          style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: accentFill ? rgba("#ffffff", 0.85) : tok.inkMuted, marginTop: 10, lineHeight: 1.5 }} />
      )}
    </Card>
  );
  return (
    <div>
      <Kicker ctx={ctx} tok={tok} value={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} />
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 16, alignItems: "start", marginTop: 4 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {stats[0] && statCard(stats[0], 0, true)}
          {stats[1] && statCard(stats[1], 1, false)}
        </div>
        <Card tok={tok} pad={20}>
          <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} block ph="כותרת"
            style={{ display: "block", fontFamily: SANS, fontSize: 24, lineHeight: 1.2, color: tok.ink, fontWeight: 800, letterSpacing: -0.4 }} />
          {(slide.body || ctx.interactive) && (
            <div style={{ marginTop: 14 }}>
              <T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף"
                style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: tok.inkMuted }} />
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// HORIZONS — 3 cards.
// ──────────────────────────────────────────────────────────────────────
function Horizons({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const cards = slide.horizons ?? [];
  const setCard = (i: number, patch: Partial<NonNullable<Slide["horizons"]>[number]>) =>
    ctx.onChange?.({ horizons: cards.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  const setRow = (ci: number, ri: number, patch: Partial<{ label: string; value: string }>) => {
    const card = cards[ci]; if (!card) return;
    setCard(ci, { rows: (card.rows ?? []).map((r, idx) => (idx === ri ? { ...r, ...patch } : r)) });
  };
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 14 }}>
        {cards.map((c, i) => {
          const accent = c.variant === "teal" || c.variant === "navy";
          return (
            <Card key={i} tok={tok} pad={16} accentTop={accent ? tok.accent : tok.border}
              style={accent ? { background: `linear-gradient(150deg, ${rgba(tok.accent, 0.10)}, ${tok.surface})` } : undefined}>
              <T v={c.eyebrow} onCh={(v) => setCard(i, { eyebrow: v })} ed={ctx.interactive}
                style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: accent ? tok.accent : tok.inkSubtle, fontWeight: 800, marginBottom: 8 }} />
              <T v={c.bigText} onCh={(v) => setCard(i, { bigText: v })} ed={ctx.interactive} ph="2026"
                style={{ display: "block", fontFamily: SANS, fontSize: numSize(c.bigText, 44), lineHeight: 1, fontWeight: 800, color: accent ? tok.accent : tok.ink, letterSpacing: -1, marginBottom: 10 }} />
              {(c.caption || ctx.interactive) && (
                <T v={c.caption ?? ""} onCh={(v) => setCard(i, { caption: v })} ed={ctx.interactive} block ph="תיאור"
                  style={{ display: "block", fontFamily: SANS, fontSize: 12, color: tok.inkMuted, marginBottom: 12, lineHeight: 1.45 }} />
              )}
              <div>
                {(c.rows ?? []).map((r, ri) => (
                  <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "6px 0", borderTop: ri === 0 ? "none" : `1px solid ${tok.border}`, alignItems: "baseline", minWidth: 0 }}>
                    <T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive}
                      style={{ fontFamily: SANS, fontSize: 11, color: tok.inkMuted, fontWeight: 600 }} />
                    <T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive}
                      style={{ fontFamily: SANS, fontSize: 11.5, color: tok.ink, fontWeight: 700, textAlign: "end", display: "block" }} />
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && (
        <div style={{ marginTop: 12 }}>
          <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה"
            style={{ fontFamily: SANS, fontSize: 11, color: tok.inkMuted, lineHeight: 1.5 }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// GRID — 2×2 cards with number badge.
// ──────────────────────────────────────────────────────────────────────
function Grid({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const cells = slide.gridCards ?? [];
  const setCell = (i: number, patch: Partial<NonNullable<Slide["gridCards"]>[number]>) =>
    ctx.onChange?.({ gridCards: cells.map((c, idx) => (idx === i ? { ...c, ...patch } : c)) });
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {cells.map((c, i) => (
          <Card key={i} tok={tok} pad={16}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: rgba(tok.accent, 0.12), color: tok.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                <T v={c.index} onCh={(v) => setCell(i, { index: v })} ed={ctx.interactive} />
              </div>
              <div style={{ minWidth: 0 }}>
                <T v={c.title} onCh={(v) => setCell(i, { title: v })} ed={ctx.interactive}
                  style={{ display: "block", fontFamily: SANS, fontSize: 16, fontWeight: 800, color: tok.ink, lineHeight: 1.25, marginBottom: 7 }} />
                <T v={c.description} onCh={(v) => setCell(i, { description: v })} ed={ctx.interactive} block
                  style={{ display: "block", fontFamily: SANS, fontSize: 12.5, color: tok.inkMuted, lineHeight: 1.55 }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TRACKS — 3 cards with colored top bar + chip pill.
// ──────────────────────────────────────────────────────────────────────
function Tracks({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const tracks = slide.tracks ?? [];
  const setTrack = (i: number, patch: Partial<NonNullable<Slide["tracks"]>[number]>) =>
    ctx.onChange?.({ tracks: tracks.map((t, idx) => (idx === i ? { ...t, ...patch } : t)) });
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tracks.length || 1}, 1fr)`, gap: 14 }}>
        {tracks.map((tk, i) => {
          const bar = tk.variant === "teal" ? tok.accent : tk.variant === "navy" || tk.variant === "blue" ? tok.accent2 : tok.inkMuted;
          return (
            <Card key={i} tok={tok} pad={16} accentTop={bar}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 28, height: 28, borderRadius: 8, background: rgba(bar, 0.14), color: bar, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>
                  <T v={tk.index} onCh={(v) => setTrack(i, { index: v })} ed={ctx.interactive} />
                </span>
                <T v={tk.eyebrow} onCh={(v) => setTrack(i, { eyebrow: v })} ed={ctx.interactive}
                  style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", color: tok.inkSubtle, fontWeight: 700 }} />
              </div>
              <T v={tk.title} onCh={(v) => setTrack(i, { title: v })} ed={ctx.interactive}
                style={{ display: "block", fontFamily: SANS, fontSize: 17, fontWeight: 800, color: tok.ink, lineHeight: 1.2, marginBottom: 10 }} />
              <T v={tk.description} onCh={(v) => setTrack(i, { description: v })} ed={ctx.interactive} block
                style={{ display: "block", fontFamily: SANS, fontSize: 12, color: tok.inkMuted, lineHeight: 1.6 }} />
              {(tk.chip || ctx.interactive) && (
                <div style={{ marginTop: 12 }}>
                  <span style={{ display: "inline-block", background: rgba(bar, 0.12), color: bar, padding: "4px 11px", borderRadius: 999, fontWeight: 700, fontSize: 11 }}>
                    <T v={tk.chip ?? ""} onCh={(v) => setTrack(i, { chip: v })} ed={ctx.interactive} ph="תגית" style={{ fontFamily: SANS }} />
                  </span>
                </div>
              )}
            </Card>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && (
        <Card tok={tok} pad={12} style={{ marginTop: 14, background: rgba(tok.accent, 0.06), border: `1px solid ${rgba(tok.accent, 0.18)}`, boxShadow: "none" }}>
          <div style={{ display: "flex", justifyContent: "space-between", gap: 18, alignItems: "center" }}>
            <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="הערה"
              style={{ fontFamily: SANS, fontSize: 12.5, color: tok.ink, fontWeight: 700 }} />
            {(slide.footnoteChip || ctx.interactive) && (
              <T v={slide.footnoteChip ?? ""} onCh={(v) => ctx.onChange?.({ footnoteChip: v })} ed={ctx.interactive} ph="תגית"
                style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 0.8, color: tok.accent, textTransform: "uppercase", fontWeight: 800, whiteSpace: "nowrap" }} />
            )}
          </div>
        </Card>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// TABLE — one card wrapping a shared-column <table>.
// ──────────────────────────────────────────────────────────────────────
function TableCard({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const headers = slide.tableHeaders ?? [];
  const rows = slide.tableRows ?? [];
  const hasChip = rows.some((r) => r.chip);
  const nData = headers.length;
  const PAD_END = 18;
  const setHeader = (i: number, v: string) =>
    ctx.onChange?.({ tableHeaders: headers.map((h, idx) => (idx === i ? v : h)) });
  const setCell = (ri: number, ci: number, v: string) =>
    ctx.onChange?.({ tableRows: rows.map((r, idx) => (idx === ri ? { ...r, cells: r.cells.map((c, j) => (j === ci ? v : c)) } : r)) });
  const dataPadEnd = (ci: number) => (!hasChip && ci === nData - 1 ? 0 : PAD_END);
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={26} />
      <Card tok={tok} pad={6}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", direction: ctx.isRtl ? "rtl" : "ltr" }}>
          <colgroup>
            {headers.map((_, i) => (<col key={i} style={i === 0 ? { width: "22%" } : undefined} />))}
            {hasChip && <col style={{ width: 120 }} />}
          </colgroup>
          <thead>
            <tr style={{ background: tok.surfaceAlt }}>
              {headers.map((h, i) => (
                <th key={i} style={{ textAlign: "start", verticalAlign: "middle", padding: "10px 12px", paddingInlineEnd: dataPadEnd(i) + 12 }}>
                  <T v={h} onCh={(v) => setHeader(i, v)} ed={ctx.interactive} block
                    style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: tok.accent, fontWeight: 800, lineHeight: 1.3 }} />
                </th>
              ))}
              {hasChip && <th style={{ padding: "10px 12px" }} />}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, ri) => (
              <tr key={ri} style={{ background: row.emphasize ? rgba(tok.accent, 0.07) : (ri % 2 ? rgba(tok.ink, 0.02) : "transparent") }}>
                {Array.from({ length: nData }).map((_, ci) => (
                  <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 12px", paddingInlineEnd: dataPadEnd(ci) + 12, borderTop: `1px solid ${tok.border}` }}>
                    <T v={row.cells[ci] ?? ""} onCh={(v) => setCell(ri, ci, v)} ed={ctx.interactive} block
                      style={{ display: "block", fontFamily: SANS, fontSize: 12, fontWeight: ci === 0 ? 700 : 400, color: ci === 0 ? tok.ink : tok.inkMuted, lineHeight: 1.4 }} />
                  </td>
                ))}
                {hasChip && (
                  <td style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 12px", borderTop: `1px solid ${tok.border}` }}>
                    {row.chip ? <Pill label={row.chip} variant={row.chipVariant ?? "neutral"} tok={tok} /> : null}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
      {(slide.footnote || ctx.interactive) && (
        <div style={{ marginTop: 12 }}>
          <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה"
            style={{ fontFamily: SANS, fontSize: 11.5, color: tok.inkMuted, lineHeight: 1.5 }} />
        </div>
      )}
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// COMPARE — two cards.
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
      <Title ctx={ctx} tok={tok} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 16 }}>
        {panes.map((key, i) => {
          const pane = slide[key]!;
          const dark = pane.variant === "dark" || pane.variant === "teal";
          const cardBg = dark ? `linear-gradient(150deg, ${tok.accent}, ${shiftHex(tok.accent, -30)})` : tok.surface;
          const fg = dark ? "#ffffff" : tok.ink;
          const muted = dark ? rgba("#ffffff", 0.82) : tok.inkMuted;
          const line = dark ? rgba("#ffffff", 0.18) : tok.border;
          const setRow = (ri: number, patch: Partial<{ label: string; value: string }>) =>
            setPane(key, { rows: (pane.rows ?? []).map((r, idx) => (idx === ri ? { ...r, ...patch } : r)) });
          const setBullet = (bi: number, v: string) =>
            setPane(key, { bullets: (pane.bullets ?? []).map((b, idx) => (idx === bi ? v : b)) });
          return (
            <Card key={i} tok={tok} pad={18} style={{ background: cardBg, border: dark ? "none" : `1px solid ${tok.border}` }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <T v={pane.eyebrow ?? ""} onCh={(v) => setPane(key, { eyebrow: v })} ed={ctx.interactive} ph="תווית"
                  style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: dark ? rgba("#ffffff", 0.85) : tok.accent, fontWeight: 800 }} />
                {(pane.chip || ctx.interactive) && (
                  <span style={{ display: "inline-block", padding: "3px 10px", borderRadius: 999, background: dark ? rgba("#ffffff", 0.16) : rgba(tok.accent, 0.12) }}>
                    <T v={pane.chip ?? ""} onCh={(v) => setPane(key, { chip: v })} ed={ctx.interactive} ph="תג"
                      style={{ fontFamily: SANS, fontSize: 10.5, color: dark ? "#ffffff" : tok.accent, fontWeight: 700, whiteSpace: "nowrap" }} />
                  </span>
                )}
              </div>
              <T v={pane.title ?? ""} onCh={(v) => setPane(key, { title: v })} ed={ctx.interactive} block ph="כותרת"
                style={{ display: "block", fontFamily: SANS, fontSize: 18, fontWeight: 800, color: fg, lineHeight: 1.22, marginBottom: 14 }} />
              {(pane.rows ?? []).length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  {(pane.rows ?? []).map((r, ri) => (
                    <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, padding: "6px 0", borderBottom: `1px solid ${line}` }}>
                      <T v={r.label} onCh={(v) => setRow(ri, { label: v })} ed={ctx.interactive}
                        style={{ fontFamily: SANS, fontSize: 12, color: muted }} />
                      <T v={r.value} onCh={(v) => setRow(ri, { value: v })} ed={ctx.interactive}
                        style={{ fontFamily: SANS, fontSize: 12, color: fg, fontWeight: 700, textAlign: "end", display: "block" }} />
                    </div>
                  ))}
                </div>
              )}
              {(pane.bullets ?? []).map((b, bi) => (
                <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, marginTop: 8, minWidth: 0 }}>
                  <span style={{ width: 18, height: 18, borderRadius: 5, background: dark ? rgba("#ffffff", 0.18) : rgba(tok.accent, 0.14), color: dark ? "#ffffff" : tok.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{String.fromCharCode(65 + bi)}</span>
                  <T v={b} onCh={(v) => setBullet(bi, v)} ed={ctx.interactive} block
                    style={{ display: "block", fontFamily: SANS, fontSize: 12, lineHeight: 1.55, color: dark ? rgba("#ffffff", 0.92) : tok.ink }} />
                </div>
              ))}
              {(pane.footnote || ctx.interactive) && (
                <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${line}` }}>
                  <T v={pane.footnote ?? ""} onCh={(v) => setPane(key, { footnote: v })} ed={ctx.interactive} block ph="הערה"
                    style={{ fontFamily: SANS, fontSize: 11, color: muted, lineHeight: 1.5 }} />
                </div>
              )}
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// DONTS — 2×3 muted cards with × badge.
// ──────────────────────────────────────────────────────────────────────
function Donts({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const items = slide.dontItems ?? [];
  const setItem = (i: number, patch: Partial<NonNullable<Slide["dontItems"]>[number]>) =>
    ctx.onChange?.({ dontItems: items.map((it, idx) => (idx === i ? { ...it, ...patch } : it)) });
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={28} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {items.map((it, i) => (
          <Card key={i} tok={tok} pad={14} style={{ background: tok.surfaceAlt, boxShadow: "none" }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", background: rgba(tok.accent, 0.12), color: tok.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>×</span>
              <div style={{ minWidth: 0 }}>
                <T v={it.title} onCh={(v) => setItem(i, { title: v })} ed={ctx.interactive}
                  style={{ display: "block", fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: tok.ink, marginBottom: 5 }} />
                <T v={it.description} onCh={(v) => setItem(i, { description: v })} ed={ctx.interactive} block
                  style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: tok.inkMuted, lineHeight: 1.5 }} />
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// BULLETS — a card with a list.
// ──────────────────────────────────────────────────────────────────────
function Bullets({ slide, ctx, tok }: { slide: Slide; ctx: DesignCtx; tok: Tokens }) {
  const bullets = slide.bullets ?? [];
  const setB = (i: number, v: string) =>
    ctx.onChange?.({ bullets: bullets.map((b, idx) => (idx === i ? v : b)) });
  return (
    <div>
      <Title ctx={ctx} tok={tok} slide={slide} size={28} />
      <Card tok={tok} pad={18}>
        {bullets.map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${tok.border}`, minWidth: 0 }}>
            <span style={{ width: 24, height: 24, borderRadius: 7, background: rgba(tok.accent, 0.12), color: tok.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
            <T v={b} onCh={(v) => setB(i, v)} ed={ctx.interactive} block
              style={{ display: "block", fontFamily: SANS, fontSize: 13, color: tok.ink, lineHeight: 1.6, alignSelf: "center" }} />
          </div>
        ))}
      </Card>
    </div>
  );
}
