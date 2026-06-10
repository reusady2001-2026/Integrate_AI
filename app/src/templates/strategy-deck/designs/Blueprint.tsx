"use client";

/**
 * "Blueprint" — technical / schematic. Faint dotted grid background, thin
 * line-art boxes with corner ticks, monospace labels, dashed dividers.
 * Engineering-drawing aesthetic. Light and precise.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette } from "@/lib/themes/deck-themes";
import { W, H, AutoFit, T, rgba, numSize, type DesignCtx } from "./shared";

const PAD = 50;
const CHROME_B = 54;
const CW = W - PAD * 2;
const BTOP = CHROME_B + 16;
const BH = H - BTOP - 40;
const MONO = "'IBM Plex Mono', 'Courier New', ui-monospace, monospace";
const SANS = "var(--deck-font, 'Heebo', 'Helvetica Neue', system-ui, Arial, sans-serif)";

type Tok = { bg: string; grid: string; ink: string; muted: string; subtle: string; accent: string; accent2: string; line: string; soft: string };
function toks(p: Palette): Tok {
  const ink = p.dark ? "#dbe6ef" : "#16334d";
  const bg = p.dark ? p.bg : "#f4f7fa";
  return {
    bg, grid: rgba(ink, p.dark ? 0.06 : 0.05), ink, muted: p.textMuted, subtle: rgba(ink, 0.5),
    accent: p.accent, accent2: p.accent2 || p.accent, line: rgba(ink, 0.4), soft: rgba(ink, 0.16),
  };
}
const sev = (t: Tok, v?: string) => (v === "high" ? t.accent : v === "med" ? t.accent2 : v === "low" ? t.subtle : t.muted);

// box with corner ticks
function Box({ t, children, style, accent }: { t: Tok; children: ReactNode; style?: CSSProperties; accent?: boolean }) {
  const c = accent ? t.accent : t.line;
  const tick = (pos: CSSProperties) => <span style={{ position: "absolute", width: 7, height: 7, borderColor: c, ...pos }} />;
  return (
    <div style={{ border: `1px solid ${accent ? t.accent : t.soft}`, padding: 15, position: "relative", overflow: "hidden", minWidth: 0, background: accent ? rgba(t.accent, 0.05) : "transparent", ...style }}>
      {tick({ top: -1, insetInlineStart: -1, borderTopWidth: 1, borderInlineStartWidth: 1, borderStyle: "solid", borderInlineEndWidth: 0, borderBottomWidth: 0 })}
      {tick({ bottom: -1, insetInlineEnd: -1, borderBottomWidth: 1, borderInlineEndWidth: 1, borderStyle: "solid", borderTopWidth: 0, borderInlineStartWidth: 0 })}
      {children}
    </div>
  );
}
function Tag({ label, v, t }: { label: string; v?: string; t: Tok }) {
  const c = sev(t, v);
  return <span style={{ display: "inline-block", border: `1px solid ${c}`, color: c, padding: "1px 8px", fontFamily: MONO, fontSize: 9.5, fontWeight: 600, whiteSpace: "nowrap", textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</span>;
}

function Chrome({ ctx, t }: { ctx: DesignCtx; t: Tok }) {
  const s = ctx.isRtl ? "right" : "left", e = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{ position: "absolute", top: PAD - 18, [s]: PAD, fontFamily: MONO, fontSize: 10, letterSpacing: 1, color: t.muted, textTransform: "uppercase", maxWidth: 440, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } as CSSProperties}>◰ {ctx.company}</div>
      {ctx.pageNumber !== undefined && <div style={{ position: "absolute", top: PAD - 18, [e]: PAD, fontFamily: MONO, fontSize: 10, color: t.subtle } as CSSProperties}>P.{String(ctx.pageNumber).padStart(2, "0")}/{String(ctx.totalPages ?? 0).padStart(2, "0")}</div>}
      <div style={{ position: "absolute", top: CHROME_B, left: PAD, right: PAD, height: 1, background: t.line, borderTop: `1px dashed ${t.line}` }} />
    </>
  );
}

function Head({ ctx, t, slide, size = 28 }: { ctx: DesignCtx; t: Tok; slide: Slide; size?: number }) {
  return (
    <div style={{ textAlign: "start", marginBottom: 16 }}>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 9 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: t.accent, fontWeight: 600 }} /></div>}
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: size, lineHeight: 1.12, color: t.ink, fontWeight: 700, letterSpacing: -0.3 }} />
      {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 8 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: t.muted, maxWidth: 760 }} /></div>}
    </div>
  );
}

export function renderBlueprint(slide: Slide, ctx: DesignCtx): ReactNode {
  const t = toks(ctx.palette);
  const k = slide.kind;
  const gridBg = `radial-gradient(${t.grid} 1px, transparent 1px)`;
  if (k === "cover" || (!k && slide.layout === "cover")) return <Cover slide={slide} ctx={ctx} t={t} gridBg={gridBg} />;
  if (k === "summary" || (!k && (slide.layout === "section" || slide.layout === "quote"))) return <Summary slide={slide} ctx={ctx} t={t} gridBg={gridBg} />;
  let body: ReactNode;
  if (k === "toc") body = <Toc slide={slide} ctx={ctx} t={t} />;
  else if (k === "stats") body = <Stats slide={slide} ctx={ctx} t={t} />;
  else if (k === "kpi-card") body = <Kpi slide={slide} ctx={ctx} t={t} />;
  else if (k === "horizons") body = <Horizons slide={slide} ctx={ctx} t={t} />;
  else if (k === "grid") body = <GridK slide={slide} ctx={ctx} t={t} />;
  else if (k === "tracks") body = <Tracks slide={slide} ctx={ctx} t={t} />;
  else if (k === "table") body = <TableK slide={slide} ctx={ctx} t={t} />;
  else if (k === "compare") body = <Compare slide={slide} ctx={ctx} t={t} />;
  else if (k === "donts") body = <Donts slide={slide} ctx={ctx} t={t} />;
  else body = <Bullets slide={slide} ctx={ctx} t={t} />;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${gridBg} 0 0/22px 22px, ${t.bg}`, color: t.ink, direction: ctx.isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <Chrome ctx={ctx} t={t} />
      <div style={{ position: "absolute", top: BTOP, left: PAD, right: PAD, height: BH }}><AutoFit availW={CW} availH={BH} isRtl={ctx.isRtl} alignTop>{body}</AutoFit></div>
    </div>
  );
}

function Cover({ slide, ctx, t, gridBg }: { slide: Slide; ctx: DesignCtx; t: Tok; gridBg: string }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${gridBg} 0 0/22px 22px, ${t.bg}`, color: t.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 40, [isRtl ? "right" : "left"]: PAD, fontFamily: MONO, fontSize: 11, letterSpacing: 1, color: t.muted, textTransform: "uppercase" } as CSSProperties}>◰ {ctx.company}</div>
      <div style={{ position: "absolute", top: 40, [isRtl ? "left" : "right"]: PAD, fontFamily: MONO, fontSize: 11, color: t.subtle } as CSSProperties}>{ctx.date}</div>
      <div style={{ position: "absolute", top: 130, [isRtl ? "right" : "left"]: PAD, width: W - PAD * 2, height: H - 210 }}>
        <AutoFit availW={W - PAD * 2} availH={H - 210} isRtl={isRtl} alignTop>
          <Box t={t} accent style={{ padding: 30 }}>
            {(slide.subtitle || ctx.interactive) && <div style={{ marginBottom: 16 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת" style={{ fontFamily: MONO, fontSize: 13, fontWeight: 600, color: t.accent, letterSpacing: 1, textTransform: "uppercase" }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת ראשית" block style={{ fontFamily: SANS, fontSize: 56, lineHeight: 1.04, fontWeight: 800, color: t.ink, letterSpacing: -1.4 }} />
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginTop: 18, paddingTop: 16, borderTop: `1px dashed ${t.line}` }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה" style={{ fontFamily: SANS, fontSize: 19, color: t.muted, fontWeight: 500 }} /></div>}
          </Box>
        </AutoFit>
      </div>
    </div>
  );
}

function Summary({ slide, ctx, t, gridBg }: { slide: Slide; ctx: DesignCtx; t: Tok; gridBg: string }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${gridBg} 0 0/22px 22px, ${t.bg}`, color: t.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", padding: 60 }}>
      <div style={{ width: W - 160, height: H - 130 }}>
        <AutoFit availW={W - 160} availH={H - 130} isRtl={isRtl}>
          <Box t={t} accent style={{ padding: 34, textAlign: "center" }}>
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 20 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: MONO, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: t.accent, fontWeight: 600 }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="האמירה המרכזית" block style={{ fontFamily: SANS, fontSize: 36, lineHeight: 1.22, fontWeight: 800, color: t.ink, letterSpacing: -0.5 }} />
            {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 20, paddingTop: 18, borderTop: `1px dashed ${t.line}` }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה" style={{ fontFamily: SANS, fontSize: 15, color: t.muted, lineHeight: 1.6 }} /></div>}
            {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 18 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="כותרת תחתית" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: t.subtle }} /></div>}
          </Box>
        </AutoFit>
      </div>
    </div>
  );
}

function Toc({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const items = slide.tocItems ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["tocItems"]>[number]>) => ctx.onChange?.({ tocItems: items.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={32} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map((it, i) => (
          <Box key={i} t={t} style={{ padding: 12 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12, alignItems: "center" }}>
              <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: t.accent, minWidth: 28, display: "inline-block" }}><T v={it.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
              <div style={{ minWidth: 0 }}>
                <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 14, fontWeight: 700, color: t.ink }} />
                {(it.subtitle || ctx.interactive) && <T v={it.subtitle} onCh={(v) => set(i, { subtitle: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: MONO, fontSize: 10.5, color: t.muted, marginTop: 3 }} />}
              </div>
            </div>
          </Box>
        ))}
      </div>
    </div>
  );
}

function StatBody({ s, i, set, t, ctx, big }: { s: NonNullable<Slide["stats"]>[number]; i: number; set: (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => void; t: Tok; ctx: DesignCtx; big?: boolean }) {
  return (
    <>
      <T v={s.label ?? ""} onCh={(v) => set(i, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: MONO, fontSize: 9.5, color: t.subtle, letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 8 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <T v={s.value ?? ""} onCh={(v) => set(i, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", big ? 46 : 34), lineHeight: 0.95, fontWeight: 800, color: t.ink, letterSpacing: -1 }} />
        {(s.unit || ctx.interactive) && <T v={s.unit ?? ""} onCh={(v) => set(i, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: MONO, fontSize: big ? 13 : 11, color: t.accent, fontWeight: 600 }} />}
      </div>
      {(s.caption || ctx.interactive) && <T v={s.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="הסבר" style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, marginTop: 8, lineHeight: 1.45 }} />}
    </>
  );
}

function Stats({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const hero = stats.slice(0, 4), sub = stats.slice(4, 8);
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      {hero.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length}, 1fr)`, gap: 12 }}>{hero.map((s, i) => <Box key={i} t={t} accent={i === 0}><StatBody s={s} i={i} set={set} t={t} ctx={ctx} big /></Box>)}</div>}
      {sub.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 12, marginTop: 12 }}>{sub.map((s, i) => <Box key={i} t={t}><StatBody s={s} i={i + 4} set={set} t={t} ctx={ctx} /></Box>)}</div>}
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 14 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} /></div>}
    </div>
  );
}

function Kpi({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 12 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: MONO, fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", color: t.accent, fontWeight: 600 }} /></div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stats[0] && <Box t={t} accent style={{ padding: 18 }}><StatBody s={stats[0]} i={0} set={set} t={t} ctx={ctx} big /></Box>}
          {stats[1] && <Box t={t}><StatBody s={stats[1]} i={1} set={set} t={t} ctx={ctx} /></Box>}
        </div>
        <Box t={t} style={{ padding: 18 }}>
          <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: 24, lineHeight: 1.18, fontWeight: 700, color: t.ink, letterSpacing: -0.3 }} />
          {(slide.body || ctx.interactive) && <div style={{ marginTop: 14 }}><T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: t.muted }} /></div>}
        </Box>
      </div>
    </div>
  );
}

function Horizons({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const cards = slide.horizons ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["horizons"]>[number]>) => ctx.onChange?.({ horizons: cards.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const setRow = (ci: number, ri: number, p: Partial<{ label: string; value: string }>) => { const c = cards[ci]; if (c) set(ci, { rows: (c.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) }); };
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 12 }}>
        {cards.map((c, i) => {
          const acc = c.variant === "teal" || c.variant === "navy";
          return (
            <Box key={i} t={t} accent={acc}>
              <T v={c.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: MONO, fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase", color: acc ? t.accent : t.subtle, marginBottom: 8 }} />
              <T v={c.bigText} onCh={(v) => set(i, { bigText: v })} ed={ctx.interactive} ph="2026" style={{ display: "block", fontFamily: SANS, fontSize: numSize(c.bigText, 44), lineHeight: 0.95, fontWeight: 800, color: acc ? t.accent : t.ink, letterSpacing: -1, marginBottom: 10 }} />
              {(c.caption || ctx.interactive) && <T v={c.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="תיאור" style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, marginBottom: 12, lineHeight: 1.45 }} />}
              {(c.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "6px 0", borderTop: `1px dashed ${t.soft}`, alignItems: "baseline" }}>
                  <T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: MONO, fontSize: 10.5, color: t.muted }} />
                  <T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11.5, color: t.ink, fontWeight: 700, textAlign: "end", display: "block" }} />
                </div>
              ))}
            </Box>
          );
        })}
      </div>
    </div>
  );
}

function GridK({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const cells = slide.gridCards ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["gridCards"]>[number]>) => ctx.onChange?.({ gridCards: cells.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cells.map((c, i) => (
          <Box key={i} t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 13 }}>
              <span style={{ width: 34, height: 34, border: `1px solid ${t.accent}`, color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 13, flexShrink: 0 }}><T v={c.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
              <div style={{ minWidth: 0 }}>
                <T v={c.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 15.5, fontWeight: 700, color: t.ink, lineHeight: 1.25, marginBottom: 6 }} />
                <T v={c.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, lineHeight: 1.55 }} />
              </div>
            </div>
          </Box>
        ))}
      </div>
    </div>
  );
}

function Tracks({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const tr = slide.tracks ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["tracks"]>[number]>) => ctx.onChange?.({ tracks: tr.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tr.length || 1}, 1fr)`, gap: 12 }}>
        {tr.map((tk, i) => {
          const c = tk.variant === "teal" ? t.accent : tk.variant === "navy" || tk.variant === "blue" ? t.accent2 : t.line;
          return (
            <Box key={i} t={t} style={{ borderTop: `3px solid ${c}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: MONO, fontSize: 16, fontWeight: 700, color: c }}><T v={tk.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
                <T v={tk.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ fontFamily: MONO, fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase", color: t.subtle }} />
              </div>
              <T v={tk.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 16.5, fontWeight: 700, color: t.ink, lineHeight: 1.2, marginBottom: 10 }} />
              <T v={tk.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, lineHeight: 1.6 }} />
              {(tk.chip || ctx.interactive) && <div style={{ marginTop: 12 }}><span style={{ border: `1px solid ${c}`, color: c, padding: "2px 9px", fontFamily: MONO, fontWeight: 600, fontSize: 10, display: "inline-block", textTransform: "uppercase" }}><T v={tk.chip ?? ""} onCh={(v) => set(i, { chip: v })} ed={ctx.interactive} ph="תגית" /></span></div>}
            </Box>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && <Box t={t} accent style={{ marginTop: 12, padding: 11 }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="הערה" style={{ fontFamily: SANS, fontSize: 12.5, color: t.ink, fontWeight: 600 }} />{(slide.footnoteChip || ctx.interactive) && <T v={slide.footnoteChip ?? ""} onCh={(v) => ctx.onChange?.({ footnoteChip: v })} ed={ctx.interactive} ph="תגית" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 1, color: t.accent, textTransform: "uppercase", whiteSpace: "nowrap" }} />}</div></Box>}
    </div>
  );
}

function TableK({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const headers = slide.tableHeaders ?? [], rows = slide.tableRows ?? [];
  const hasChip = rows.some((r) => r.chip), nData = headers.length, PE = 18;
  const sh = (i: number, v: string) => ctx.onChange?.({ tableHeaders: headers.map((h, j) => (j === i ? v : h)) });
  const sc = (ri: number, ci: number, v: string) => ctx.onChange?.({ tableRows: rows.map((r, j) => (j === ri ? { ...r, cells: r.cells.map((c, q) => (q === ci ? v : c)) } : r)) });
  const pe = (ci: number) => (!hasChip && ci === nData - 1 ? 0 : PE);
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <Box t={t} style={{ padding: "2px 14px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", direction: ctx.isRtl ? "rtl" : "ltr" }}>
          <colgroup>{headers.map((_, i) => <col key={i} style={i === 0 ? { width: "22%" } : undefined} />)}{hasChip && <col style={{ width: 110 }} />}</colgroup>
          <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "start", verticalAlign: "bottom", padding: "10px 0", paddingInlineEnd: pe(i), borderBottom: `1px solid ${t.accent}` }}><T v={h} onCh={(v) => sh(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: MONO, fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase", color: t.accent, fontWeight: 600, lineHeight: 1.3 }} /></th>)}{hasChip && <th style={{ borderBottom: `1px solid ${t.accent}` }} />}</tr></thead>
          <tbody>{rows.map((row, ri) => (
            <tr key={ri} style={{ background: row.emphasize ? rgba(t.accent, 0.07) : "transparent" }}>
              {Array.from({ length: nData }).map((_, ci) => <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 0", paddingInlineEnd: pe(ci), borderTop: `1px dashed ${t.soft}` }}><T v={row.cells[ci] ?? ""} onCh={(v) => sc(ri, ci, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: ci === 0 ? SANS : MONO, fontSize: ci === 0 ? 12.5 : 11, fontWeight: ci === 0 ? 700 : 400, color: ci === 0 ? t.ink : t.muted, lineHeight: 1.4 }} /></td>)}
              {hasChip && <td style={{ verticalAlign: "middle", padding: "9px 0", borderTop: `1px dashed ${t.soft}` }}>{row.chip ? <Tag label={row.chip} v={row.chipVariant} t={t} /> : null}</td>}
            </tr>
          ))}</tbody>
        </table>
      </Box>
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 12 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} /></div>}
    </div>
  );
}

function Compare({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const panes: ("leftPane" | "rightPane")[] = [];
  if (slide.leftPane) panes.push("leftPane");
  if (slide.rightPane) panes.push("rightPane");
  const setPane = (k: "leftPane" | "rightPane", p: Partial<NonNullable<Slide["leftPane"]>>) => { const c = slide[k]; if (c) ctx.onChange?.({ [k]: { ...c, ...p } } as Partial<Slide>); };
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 12 }}>
        {panes.map((k, i) => {
          const pane = slide[k]!;
          const acc = pane.variant === "dark" || pane.variant === "teal";
          const setRow = (ri: number, p: Partial<{ label: string; value: string }>) => setPane(k, { rows: (pane.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) });
          const setB = (bi: number, v: string) => setPane(k, { bullets: (pane.bullets ?? []).map((b, j) => (j === bi ? v : b)) });
          return (
            <Box key={i} t={t} accent={acc} style={{ padding: 16 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <T v={pane.eyebrow ?? ""} onCh={(v) => setPane(k, { eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: MONO, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: t.accent, fontWeight: 600 }} />
                {(pane.chip || ctx.interactive) && <T v={pane.chip ?? ""} onCh={(v) => setPane(k, { chip: v })} ed={ctx.interactive} ph="תג" style={{ fontFamily: MONO, fontSize: 10, color: t.muted, whiteSpace: "nowrap" }} />}
              </div>
              <T v={pane.title ?? ""} onCh={(v) => setPane(k, { title: v })} ed={ctx.interactive} block ph="כותרת" style={{ display: "block", fontFamily: SANS, fontSize: 18, fontWeight: 700, color: t.ink, lineHeight: 1.2, marginBottom: 14 }} />
              {(pane.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, padding: "6px 0", borderBottom: `1px dashed ${t.soft}` }}>
                  <T v={r.label} onCh={(v) => setRow(ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: MONO, fontSize: 11, color: t.muted }} />
                  <T v={r.value} onCh={(v) => setRow(ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 12, color: t.ink, fontWeight: 700, textAlign: "end", display: "block" }} />
                </div>
              ))}
              {(pane.bullets ?? []).map((b, bi) => (
                <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, marginTop: 9, minWidth: 0 }}>
                  <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.accent }}>{String.fromCharCode(65 + bi)}</span>
                  <T v={b} onCh={(v) => setB(bi, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: t.ink }} />
                </div>
              ))}
              {(pane.footnote || ctx.interactive) && <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px dashed ${t.soft}` }}><T v={pane.footnote ?? ""} onCh={(v) => setPane(k, { footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11, color: t.muted, lineHeight: 1.5 }} /></div>}
            </Box>
          );
        })}
      </div>
    </div>
  );
}

function Donts({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const items = slide.dontItems ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["dontItems"]>[number]>) => ctx.onChange?.({ dontItems: items.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={30} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map((it, i) => (
          <Box key={i} t={t} style={{ padding: 13, borderStyle: "dashed" }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
              <span style={{ width: 22, height: 22, border: `1px solid ${t.accent}`, color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: MONO, fontWeight: 700, fontSize: 12, flexShrink: 0 }}>×</span>
              <div style={{ minWidth: 0 }}>
                <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: t.ink, marginBottom: 5 }} />
                <T v={it.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} />
              </div>
            </div>
          </Box>
        ))}
      </div>
    </div>
  );
}

function Bullets({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const bl = slide.bullets ?? [];
  const set = (i: number, v: string) => ctx.onChange?.({ bullets: bl.map((b, j) => (j === i ? v : b)) });
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={30} />
      <Box t={t} style={{ padding: 16, maxWidth: 820 }}>
        {bl.map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, padding: "9px 0", borderTop: i === 0 ? "none" : `1px dashed ${t.soft}`, minWidth: 0 }}>
            <span style={{ fontFamily: MONO, fontSize: 12, fontWeight: 700, color: t.accent, minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</span>
            <T v={b} onCh={(v) => set(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 13, color: t.ink, lineHeight: 1.6 }} />
          </div>
        ))}
      </Box>
    </div>
  );
}
