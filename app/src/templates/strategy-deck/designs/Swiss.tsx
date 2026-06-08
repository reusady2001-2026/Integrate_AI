"use client";

/**
 * "Swiss Grid" — international-typographic-style deck.
 * Identity: hard edges (zero radius), thick rules, oversized bold numerals,
 * uppercase tight labels, solid accent blocks, high contrast. No shadows,
 * no cards — structure comes from the grid and heavy lines.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette } from "@/lib/themes/deck-themes";
import { W, H, AutoFit, T, rgba, numSize, type DesignCtx } from "./shared";

const PAD = 48;
const CHROME_B = 52;
const CW = W - PAD * 2;
const BTOP = CHROME_B + 18;
const BH = H - BTOP - 44;
const SANS = "'Heebo', 'Helvetica Neue', Arial, sans-serif";

type Tok = { bg: string; ink: string; muted: string; subtle: string; accent: string; accent2: string; line: string; soft: string; onAccent: string };
function toks(p: Palette): Tok {
  const ink = p.text;
  return {
    bg: p.bg, ink, muted: p.textMuted, subtle: rgba(ink, 0.55),
    accent: p.accent, accent2: p.accent2 || p.accent,
    line: ink, soft: rgba(ink, 0.14), onAccent: "#ffffff",
  };
}
const sev = (t: Tok, v?: string) => (v === "high" ? t.accent : v === "med" ? t.accent2 : v === "low" ? t.subtle : t.muted);

function Tag({ label, v, t }: { label: string; v?: string; t: Tok }) {
  return <span style={{ display: "inline-block", background: sev(t, v), color: "#fff", padding: "2px 9px", fontFamily: SANS, fontSize: 10, fontWeight: 800, letterSpacing: 0.5, whiteSpace: "nowrap", textTransform: "uppercase" }}>{label}</span>;
}

function Chrome({ ctx, t }: { ctx: DesignCtx; t: Tok }) {
  const s = ctx.isRtl ? "right" : "left", e = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{ position: "absolute", top: PAD - 14, [s]: PAD, fontFamily: SANS, fontSize: 10, letterSpacing: 2, color: t.ink, fontWeight: 800, textTransform: "uppercase", maxWidth: 440, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } as CSSProperties}>{ctx.company}</div>
      {ctx.pageNumber !== undefined && <div style={{ position: "absolute", top: PAD - 14, [e]: PAD, fontFamily: SANS, fontSize: 10, color: t.ink, fontWeight: 800, letterSpacing: 1 } as CSSProperties}>{String(ctx.pageNumber).padStart(2, "0")}/{String(ctx.totalPages ?? 0).padStart(2, "0")}</div>}
      <div style={{ position: "absolute", top: CHROME_B, left: PAD, right: PAD, height: 3, background: t.line }} />
    </>
  );
}

function Head({ ctx, t, slide, size = 34 }: { ctx: DesignCtx; t: Tok; slide: Slide; size?: number }) {
  return (
    <div style={{ textAlign: "start", marginBottom: 18 }}>
      {(slide.eyebrow || ctx.interactive) && (
        <span style={{ display: "inline-block", background: t.accent, color: "#fff", padding: "3px 10px", marginBottom: 12 }}>
          <T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800 }} />
        </span>
      )}
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: size, lineHeight: 1.05, color: t.ink, fontWeight: 900, letterSpacing: -0.8 }} />
      {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 8 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: t.muted, maxWidth: 760, fontWeight: 500 }} /></div>}
    </div>
  );
}

export function renderSwiss(slide: Slide, ctx: DesignCtx): ReactNode {
  const t = toks(ctx.palette);
  const k = slide.kind;
  if (k === "cover" || (!k && slide.layout === "cover")) return <Cover slide={slide} ctx={ctx} t={t} />;
  if (k === "summary" || (!k && (slide.layout === "section" || slide.layout === "quote"))) return <Summary slide={slide} ctx={ctx} t={t} />;
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
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.bg, color: t.ink, direction: ctx.isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <Chrome ctx={ctx} t={t} />
      <div style={{ position: "absolute", top: BTOP, left: PAD, right: PAD, height: BH }}>
        <AutoFit availW={CW} availH={BH} isRtl={ctx.isRtl} alignTop>{body}</AutoFit>
      </div>
    </div>
  );
}

function Cover({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.bg, color: t.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: 14, background: t.accent } as CSSProperties} />
      <div style={{ position: "absolute", top: 40, [isRtl ? "right" : "left"]: PAD + 24, fontFamily: SANS, fontSize: 11, letterSpacing: 2, fontWeight: 800, textTransform: "uppercase", color: t.ink } as CSSProperties}>{ctx.company}</div>
      <div style={{ position: "absolute", top: 40, [isRtl ? "left" : "right"]: PAD, fontFamily: SANS, fontSize: 11, fontWeight: 800, color: t.muted } as CSSProperties}>{ctx.date}</div>
      <div style={{ position: "absolute", top: 150, [isRtl ? "right" : "left"]: PAD + 24, width: W - PAD * 2 - 24, height: H - 230 }}>
        <AutoFit availW={W - PAD * 2 - 24} availH={H - 230} isRtl={isRtl} alignTop>
          <div style={{ textAlign: "start" }}>
            {(slide.subtitle || ctx.interactive) && <div style={{ marginBottom: 18 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: t.accent, letterSpacing: 1, textTransform: "uppercase" }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ fontFamily: SANS, fontSize: 70, lineHeight: 0.98, fontWeight: 900, color: t.ink, letterSpacing: -2 }} />
            <div style={{ marginTop: 22, height: 6, width: 160, background: t.accent }} />
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginTop: 20 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה" style={{ fontFamily: SANS, fontSize: 22, color: t.muted, fontWeight: 700 }} /></div>}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

function Summary({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.accent, color: "#fff", direction: isRtl ? "rtl" : "ltr", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: W - 150, height: H - 110 }}>
        <AutoFit availW={W - 150} availH={H - 110} isRtl={isRtl}>
          <div style={{ textAlign: "start" }}>
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 22 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", fontWeight: 800, color: rgba("#ffffff", 0.85) }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="האמירה המרכזית" block style={{ fontFamily: SANS, fontSize: 44, lineHeight: 1.1, fontWeight: 900, color: "#fff", letterSpacing: -1 }} />
            {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 22, maxWidth: 720 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה" style={{ fontFamily: SANS, fontSize: 16, color: rgba("#ffffff", 0.9), lineHeight: 1.55, fontWeight: 500 }} /></div>}
            {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 26, height: 5, width: 120, background: "#fff" }} />}
          </div>
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
      <Head ctx={ctx} t={t} slide={slide} size={40} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 40px" }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, padding: "12px 0", borderTop: `2px solid ${t.line}`, alignItems: "baseline" }}>
            <T v={it.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: t.accent, minWidth: 30, display: "inline-block" }} />
            <div style={{ minWidth: 0 }}>
              <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 800, color: t.ink }} />
              {(it.subtitle || ctx.interactive) && <T v={it.subtitle} onCh={(v) => set(i, { subtitle: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: t.muted, marginTop: 3, fontWeight: 500 }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatCell({ s, i, set, t, ctx, big }: { s: NonNullable<Slide["stats"]>[number]; i: number; set: (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => void; t: Tok; ctx: DesignCtx; big?: boolean }) {
  return (
    <div style={{ borderTop: `3px solid ${t.line}`, paddingTop: 12, minWidth: 0 }}>
      <T v={s.label ?? ""} onCh={(v) => set(i, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 10, color: t.subtle, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800, marginBottom: 10 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <T v={s.value ?? ""} onCh={(v) => set(i, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", big ? 56 : 40), lineHeight: 0.9, fontWeight: 900, color: t.ink, letterSpacing: -2 }} />
        {(s.unit || ctx.interactive) && <T v={s.unit ?? ""} onCh={(v) => set(i, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: big ? 15 : 12, color: t.accent, fontWeight: 800 }} />}
      </div>
      {(s.caption || ctx.interactive) && <T v={s.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="הסבר" style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, marginTop: 8, lineHeight: 1.45, fontWeight: 500 }} />}
    </div>
  );
}

function Stats({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const hero = stats.slice(0, 4), sub = stats.slice(4, 8);
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={32} />
      {hero.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length}, 1fr)`, gap: 28 }}>{hero.map((s, i) => <StatCell key={i} s={s} i={i} set={set} t={t} ctx={ctx} big />)}</div>}
      {sub.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 28, marginTop: 22 }}>{sub.map((s, i) => <StatCell key={i} s={s} i={i + 4} set={set} t={t} ctx={ctx} />)}</div>}
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 22 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5, fontWeight: 500 }} /></div>}
    </div>
  );
}

function Kpi({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      {(slide.eyebrow || ctx.interactive) && <span style={{ display: "inline-block", background: t.accent, color: "#fff", padding: "3px 10px", marginBottom: 14 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1.5, textTransform: "uppercase", fontWeight: 800 }} /></span>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
        <div>
          {stats[0] && <div style={{ background: t.accent, color: "#fff", padding: 22 }}>
            <T v={stats[0].label ?? ""} onCh={(v) => set(0, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800, color: rgba("#ffffff", 0.85), marginBottom: 10 }} />
            <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><T v={stats[0].value ?? ""} onCh={(v) => set(0, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(stats[0].value ?? "", 66), lineHeight: 0.9, fontWeight: 900, color: "#fff", letterSpacing: -2 }} />{(stats[0].unit || ctx.interactive) && <T v={stats[0].unit ?? ""} onCh={(v) => set(0, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: 16, fontWeight: 800, color: rgba("#ffffff", 0.9) }} />}</div>
            {(stats[0].caption || ctx.interactive) && <T v={stats[0].caption ?? ""} onCh={(v) => set(0, { caption: v })} ed={ctx.interactive} block ph="הסבר" style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: rgba("#ffffff", 0.85), marginTop: 10, lineHeight: 1.5, fontWeight: 500 }} />}
          </div>}
          {stats[1] && <div style={{ marginTop: 18 }}><StatCell s={stats[1]} i={1} set={set} t={t} ctx={ctx} /></div>}
        </div>
        <div>
          <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: 28, lineHeight: 1.12, fontWeight: 900, color: t.ink, letterSpacing: -0.6 }} />
          {(slide.body || ctx.interactive) && <div style={{ marginTop: 14 }}><T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: t.muted, fontWeight: 500 }} /></div>}
        </div>
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
      <Head ctx={ctx} t={t} slide={slide} size={30} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 28 }}>
        {cards.map((c, i) => {
          const acc = c.variant === "teal" || c.variant === "navy";
          return (
            <div key={i} style={{ borderTop: `${acc ? 8 : 3}px solid ${acc ? t.accent : t.line}`, paddingTop: 12, minWidth: 0 }}>
              <T v={c.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: acc ? t.accent : t.subtle, fontWeight: 800, marginBottom: 8 }} />
              <T v={c.bigText} onCh={(v) => set(i, { bigText: v })} ed={ctx.interactive} ph="2026" style={{ display: "block", fontFamily: SANS, fontSize: numSize(c.bigText, 60), lineHeight: 0.9, fontWeight: 900, color: acc ? t.accent : t.ink, letterSpacing: -2, marginBottom: 12 }} />
              {(c.caption || ctx.interactive) && <T v={c.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="תיאור" style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, marginBottom: 12, lineHeight: 1.4, fontWeight: 600 }} />}
              {(c.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "6px 0", borderTop: `1px solid ${t.soft}`, alignItems: "baseline" }}>
                  <T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11, color: t.muted, fontWeight: 700 }} />
                  <T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11.5, color: t.ink, fontWeight: 800, textAlign: "end", display: "block" }} />
                </div>
              ))}
            </div>
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
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "26px 40px" }}>
        {cells.map((c, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, minWidth: 0 }}>
            <T v={c.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 32, fontWeight: 900, color: t.accent, letterSpacing: -1, lineHeight: 1 }} />
            <div style={{ minWidth: 0, borderTop: `3px solid ${t.line}`, paddingTop: 8 }}>
              <T v={c.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 16, fontWeight: 800, color: t.ink, lineHeight: 1.2, marginBottom: 7 }} />
              <T v={c.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12.5, color: t.muted, lineHeight: 1.55, fontWeight: 500 }} />
            </div>
          </div>
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
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tr.length || 1}, 1fr)`, gap: 28 }}>
        {tr.map((tk, i) => {
          const bar = tk.variant === "teal" ? t.accent : tk.variant === "navy" || tk.variant === "blue" ? t.accent2 : t.line;
          return (
            <div key={i} style={{ borderTop: `8px solid ${bar}`, paddingTop: 12, minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginBottom: 8 }}>
                <T v={tk.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 22, fontWeight: 900, color: bar, lineHeight: 1 }} />
                <T v={tk.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: t.subtle, fontWeight: 800 }} />
              </div>
              <T v={tk.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 18, fontWeight: 900, color: t.ink, lineHeight: 1.15, marginBottom: 10, letterSpacing: -0.3 }} />
              <T v={tk.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, lineHeight: 1.55, fontWeight: 500 }} />
              {(tk.chip || ctx.interactive) && <div style={{ marginTop: 12 }}><Tag label={tk.chip ?? "—"} t={t} /></div>}
            </div>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 18, background: t.line, color: t.bg, padding: "10px 16px", display: "flex", justifyContent: "space-between", gap: 18 }}>
        <T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="הערה" style={{ fontFamily: SANS, fontSize: 12.5, fontWeight: 800 }} />
        {(slide.footnoteChip || ctx.interactive) && <T v={slide.footnoteChip ?? ""} onCh={(v) => ctx.onChange?.({ footnoteChip: v })} ed={ctx.interactive} ph="תגית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800, color: rgba("#ffffff", 0.8), whiteSpace: "nowrap" }} />}
      </div>}
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
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", direction: ctx.isRtl ? "rtl" : "ltr" }}>
        <colgroup>{headers.map((_, i) => <col key={i} style={i === 0 ? { width: "22%" } : undefined} />)}{hasChip && <col style={{ width: 110 }} />}</colgroup>
        <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "start", verticalAlign: "bottom", padding: "0 0 9px", paddingInlineEnd: pe(i), borderBottom: `3px solid ${t.line}` }}><T v={h} onCh={(v) => sh(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: t.ink, fontWeight: 800, lineHeight: 1.3 }} /></th>)}{hasChip && <th style={{ borderBottom: `3px solid ${t.line}` }} />}</tr></thead>
        <tbody>{rows.map((row, ri) => (
          <tr key={ri} style={{ background: row.emphasize ? rgba(t.accent, 0.1) : "transparent" }}>
            {Array.from({ length: nData }).map((_, ci) => <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "8px 0", paddingInlineEnd: pe(ci), borderBottom: `1px solid ${t.soft}` }}><T v={row.cells[ci] ?? ""} onCh={(v) => sc(ri, ci, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, fontWeight: ci === 0 ? 800 : 500, color: ci === 0 ? t.ink : t.muted, lineHeight: 1.4 }} /></td>)}
            {hasChip && <td style={{ verticalAlign: "middle", padding: "8px 0", borderBottom: `1px solid ${t.soft}` }}>{row.chip ? <Tag label={row.chip} v={row.chipVariant} t={t} /> : null}</td>}
          </tr>
        ))}</tbody>
      </table>
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 14 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5, fontWeight: 500 }} /></div>}
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
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      <div style={{ display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 0 }}>
        {panes.map((k, i) => {
          const pane = slide[k]!;
          const dark = pane.variant === "dark" || pane.variant === "teal";
          const bg = dark ? t.accent : t.bg, fg = dark ? "#fff" : t.ink, mut = dark ? rgba("#ffffff", 0.82) : t.muted, ln = dark ? rgba("#ffffff", 0.2) : t.soft;
          const setRow = (ri: number, p: Partial<{ label: string; value: string }>) => setPane(k, { rows: (pane.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) });
          const setB = (bi: number, v: string) => setPane(k, { bullets: (pane.bullets ?? []).map((b, j) => (j === bi ? v : b)) });
          return (
            <div key={i} style={{ background: bg, color: fg, padding: 22, borderInlineEnd: i === 0 && panes.length === 2 && !dark ? `3px solid ${t.line}` : "none", minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <T v={pane.eyebrow ?? ""} onCh={(v) => setPane(k, { eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: dark ? rgba("#ffffff", 0.85) : t.accent, fontWeight: 800 }} />
                {(pane.chip || ctx.interactive) && <T v={pane.chip ?? ""} onCh={(v) => setPane(k, { chip: v })} ed={ctx.interactive} ph="תג" style={{ fontFamily: SANS, fontSize: 10.5, color: mut, fontWeight: 700, whiteSpace: "nowrap" }} />}
              </div>
              <T v={pane.title ?? ""} onCh={(v) => setPane(k, { title: v })} ed={ctx.interactive} block ph="כותרת" style={{ display: "block", fontFamily: SANS, fontSize: 18, fontWeight: 900, color: fg, lineHeight: 1.18, marginBottom: 14, letterSpacing: -0.3 }} />
              {(pane.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, padding: "6px 0", borderBottom: `1px solid ${ln}` }}>
                  <T v={r.label} onCh={(v) => setRow(ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 12, color: mut, fontWeight: 600 }} />
                  <T v={r.value} onCh={(v) => setRow(ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 12, color: fg, fontWeight: 800, textAlign: "end", display: "block" }} />
                </div>
              ))}
              {(pane.bullets ?? []).map((b, bi) => (
                <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, marginTop: 9, minWidth: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 900, color: dark ? "#fff" : t.accent }}>{String.fromCharCode(65 + bi)}</span>
                  <T v={b} onCh={(v) => setB(bi, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: dark ? rgba("#ffffff", 0.92) : t.ink, fontWeight: 500 }} />
                </div>
              ))}
              {(pane.footnote || ctx.interactive) && <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${ln}` }}><T v={pane.footnote ?? ""} onCh={(v) => setPane(k, { footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11, color: mut, lineHeight: 1.5, fontWeight: 500 }} /></div>}
            </div>
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
      <Head ctx={ctx} t={t} slide={slide} size={32} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "22px 44px" }}>
        {items.map((it, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, borderTop: `3px solid ${t.line}`, paddingTop: 10, minWidth: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 26, fontWeight: 900, color: t.accent, lineHeight: 1 }}>×</span>
            <div style={{ minWidth: 0 }}>
              <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 14, fontWeight: 800, color: t.ink, marginBottom: 5 }} />
              <T v={it.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5, fontWeight: 500 }} />
            </div>
          </div>
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
      <Head ctx={ctx} t={t} slide={slide} size={32} />
      <div style={{ maxWidth: 820 }}>
        {bl.map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, padding: "11px 0", borderTop: `2px solid ${t.line}`, minWidth: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 16, fontWeight: 900, color: t.accent, minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</span>
            <T v={b} onCh={(v) => set(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 13, color: t.ink, lineHeight: 1.55, fontWeight: 500 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
