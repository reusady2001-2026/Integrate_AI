"use client";

/**
 * "Midnight" — dark keynote. Deep gradient canvas, luminous accent,
 * thin translucent outlined panels with a soft glow, light text. Tech /
 * product-launch feel. The opposite of the light card & paper designs.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette } from "@/lib/themes/deck-themes";
import { W, H, AutoFit, T, rgba, shiftHex, numSize, type DesignCtx } from "./shared";

const PAD = 50;
const CHROME_B = 54;
const CW = W - PAD * 2;
const BTOP = CHROME_B + 18;
const BH = H - BTOP - 40;
const SANS = "'Heebo', 'Helvetica Neue', system-ui, Arial, sans-serif";

type Tok = { bg: string; grad: string; ink: string; muted: string; subtle: string; accent: string; accent2: string; panel: string; border: string; glow: string };
function toks(p: Palette): Tok {
  const accent = p.accent;
  const baseDark = p.dark ? p.bg : p.coverBg;
  return {
    bg: baseDark,
    grad: `radial-gradient(120% 120% at 80% -10%, ${rgba(accent, 0.16)} 0%, transparent 45%), linear-gradient(160deg, ${shiftHex(baseDark, 6)} 0%, ${shiftHex(baseDark, -10)} 100%)`,
    ink: "#eef2f8", muted: rgba("#eef2f8", 0.66), subtle: rgba("#eef2f8", 0.4),
    accent, accent2: p.accent2 || accent,
    panel: rgba("#ffffff", 0.05), border: rgba("#ffffff", 0.13), glow: rgba(accent, 0.4),
  };
}
const sev = (t: Tok, v?: string) => (v === "high" ? t.accent : v === "med" ? t.accent2 : v === "low" ? t.subtle : t.muted);

function Panel({ t, children, style, glow }: { t: Tok; children: ReactNode; style?: CSSProperties; glow?: boolean }) {
  return <div style={{ background: t.panel, border: `1px solid ${t.border}`, borderRadius: 12, padding: 16, position: "relative", overflow: "hidden", minWidth: 0, boxShadow: glow ? `0 0 30px ${t.glow}` : "none", ...style }}>{children}</div>;
}
function Pill({ label, v, t }: { label: string; v?: string; t: Tok }) {
  const c = sev(t, v);
  return <span style={{ display: "inline-block", border: `1px solid ${rgba(c, 0.5)}`, color: c, background: rgba(c, 0.12), padding: "3px 10px", borderRadius: 999, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>;
}

function Chrome({ ctx, t }: { ctx: DesignCtx; t: Tok }) {
  const s = ctx.isRtl ? "right" : "left", e = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{ position: "absolute", top: PAD - 18, [s]: PAD, display: "flex", alignItems: "center", gap: 8 } as CSSProperties}>
        <span style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent, boxShadow: `0 0 10px ${t.glow}` }} />
        <span style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1.5, color: t.muted, fontWeight: 600, textTransform: "uppercase" }}>{ctx.company}</span>
      </div>
      {ctx.pageNumber !== undefined && <div style={{ position: "absolute", top: PAD - 18, [e]: PAD, fontFamily: SANS, fontSize: 10.5, color: t.subtle, fontWeight: 600 } as CSSProperties}>{String(ctx.pageNumber).padStart(2, "0")} · {String(ctx.totalPages ?? 0).padStart(2, "0")}</div>}
      <div style={{ position: "absolute", top: CHROME_B, left: PAD, right: PAD, height: 1, background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />
    </>
  );
}

function Head({ ctx, t, slide, size = 30 }: { ctx: DesignCtx; t: Tok; slide: Slide; size?: number }) {
  return (
    <div style={{ textAlign: "start", marginBottom: 18 }}>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 10 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase", color: t.accent, fontWeight: 700 }} /></div>}
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: size, lineHeight: 1.12, color: t.ink, fontWeight: 700, letterSpacing: -0.4 }} />
      {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 8 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: t.muted, maxWidth: 760 }} /></div>}
    </div>
  );
}

export function renderMidnight(slide: Slide, ctx: DesignCtx): ReactNode {
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
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.grad + ", " + t.bg, color: t.ink, direction: ctx.isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <Chrome ctx={ctx} t={t} />
      <div style={{ position: "absolute", top: BTOP, left: PAD, right: PAD, height: BH }}><AutoFit availW={CW} availH={BH} isRtl={ctx.isRtl} alignTop>{body}</AutoFit></div>
    </div>
  );
}

function Cover({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.grad + ", " + t.bg, color: t.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <div style={{ position: "absolute", [isRtl ? "left" : "right"]: -100, top: -100, width: 340, height: 340, borderRadius: "50%", background: `radial-gradient(circle, ${t.glow}, transparent 60%)` } as CSSProperties} />
      <div style={{ position: "absolute", top: 40, [isRtl ? "right" : "left"]: PAD, display: "flex", alignItems: "center", gap: 8 } as CSSProperties}><span style={{ width: 8, height: 8, borderRadius: "50%", background: t.accent, boxShadow: `0 0 10px ${t.glow}` }} /><span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1.5, color: t.muted, fontWeight: 600, textTransform: "uppercase" }}>{ctx.company}</span></div>
      <div style={{ position: "absolute", top: 40, [isRtl ? "left" : "right"]: PAD, fontFamily: SANS, fontSize: 11, color: t.subtle, fontWeight: 600 } as CSSProperties}>{ctx.date}</div>
      <div style={{ position: "absolute", top: 150, [isRtl ? "right" : "left"]: PAD, width: W - PAD * 2, height: H - 230 }}>
        <AutoFit availW={W - PAD * 2} availH={H - 230} isRtl={isRtl} alignTop>
          <div style={{ textAlign: "start" }}>
            {(slide.subtitle || ctx.interactive) && <div style={{ marginBottom: 18 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 14, fontWeight: 600, color: t.accent, letterSpacing: 3, textTransform: "uppercase" }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת ראשית" block style={{ fontFamily: SANS, fontSize: 62, lineHeight: 1.04, fontWeight: 800, color: t.ink, letterSpacing: -1.6 }} />
            <div style={{ marginTop: 24, height: 2, width: 140, background: `linear-gradient(90deg, ${t.accent}, transparent)` }} />
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginTop: 20 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה" style={{ fontFamily: SANS, fontSize: 21, color: t.muted, fontWeight: 500 }} /></div>}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

function Summary({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.grad + ", " + t.bg, color: t.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ width: W - 150, height: H - 110 }}>
        <AutoFit availW={W - 150} availH={H - 110} isRtl={isRtl}>
          <div style={{ textAlign: "center" }}>
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 26 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 4, textTransform: "uppercase", color: t.accent, fontWeight: 700 }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="האמירה המרכזית" block style={{ fontFamily: SANS, fontSize: 40, lineHeight: 1.22, fontWeight: 800, color: t.ink, letterSpacing: -0.6 }} />
            {(slide.subtitle || ctx.interactive) && <><div style={{ width: 80, height: 1, background: t.accent, margin: "24px auto", boxShadow: `0 0 12px ${t.glow}` }} /><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה" style={{ fontFamily: SANS, fontSize: 15, color: t.muted, lineHeight: 1.6, maxWidth: 700, margin: "0 auto" }} /></>}
            {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 30 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="כותרת תחתית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: t.subtle, fontWeight: 600 }} /></div>}
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
      <Head ctx={ctx} t={t} slide={slide} size={34} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map((it, i) => (
          <Panel key={i} t={t} style={{ padding: 13 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 13, alignItems: "center" }}>
              <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: t.accent, minWidth: 26, display: "inline-block" }}><T v={it.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
              <div style={{ minWidth: 0 }}>
                <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 14, fontWeight: 700, color: t.ink }} />
                {(it.subtitle || ctx.interactive) && <T v={it.subtitle} onCh={(v) => set(i, { subtitle: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, marginTop: 2 }} />}
              </div>
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

function StatBody({ s, i, set, t, ctx, big }: { s: NonNullable<Slide["stats"]>[number]; i: number; set: (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => void; t: Tok; ctx: DesignCtx; big?: boolean }) {
  return (
    <>
      <T v={s.label ?? ""} onCh={(v) => set(i, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 10, color: t.subtle, letterSpacing: 1, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <T v={s.value ?? ""} onCh={(v) => set(i, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", big ? 50 : 36), lineHeight: 0.95, fontWeight: 800, color: t.accent, letterSpacing: -1, textShadow: `0 0 22px ${t.glow}` }} />
        {(s.unit || ctx.interactive) && <T v={s.unit ?? ""} onCh={(v) => set(i, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: big ? 14 : 12, color: t.muted, fontWeight: 700 }} />}
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
      {hero.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length}, 1fr)`, gap: 14 }}>{hero.map((s, i) => <Panel key={i} t={t} glow={i === 0}><StatBody s={s} i={i} set={set} t={t} ctx={ctx} big /></Panel>)}</div>}
      {sub.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 14, marginTop: 14 }}>{sub.map((s, i) => <Panel key={i} t={t}><StatBody s={s} i={i + 4} set={set} t={t} ctx={ctx} /></Panel>)}</div>}
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 16 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} /></div>}
    </div>
  );
}

function Kpi({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 12 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 2.5, textTransform: "uppercase", color: t.accent, fontWeight: 700 }} /></div>}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {stats[0] && <Panel t={t} glow style={{ padding: 20 }}><StatBody s={stats[0]} i={0} set={set} t={t} ctx={ctx} big /></Panel>}
          {stats[1] && <Panel t={t}><StatBody s={stats[1]} i={1} set={set} t={t} ctx={ctx} /></Panel>}
        </div>
        <Panel t={t} style={{ padding: 20 }}>
          <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: 24, lineHeight: 1.18, fontWeight: 700, color: t.ink, letterSpacing: -0.3 }} />
          {(slide.body || ctx.interactive) && <div style={{ marginTop: 14 }}><T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: t.muted }} /></div>}
        </Panel>
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
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 14 }}>
        {cards.map((c, i) => {
          const acc = c.variant === "teal" || c.variant === "navy";
          return (
            <Panel key={i} t={t} glow={acc} style={acc ? { borderColor: rgba(t.accent, 0.5) } : undefined}>
              <T v={c.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: acc ? t.accent : t.subtle, fontWeight: 700, marginBottom: 8 }} />
              <T v={c.bigText} onCh={(v) => set(i, { bigText: v })} ed={ctx.interactive} ph="2026" style={{ display: "block", fontFamily: SANS, fontSize: numSize(c.bigText, 46), lineHeight: 0.95, fontWeight: 800, color: acc ? t.accent : t.ink, letterSpacing: -1, marginBottom: 10, textShadow: acc ? `0 0 22px ${t.glow}` : "none" }} />
              {(c.caption || ctx.interactive) && <T v={c.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="תיאור" style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, marginBottom: 12, lineHeight: 1.45 }} />}
              {(c.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 10, padding: "6px 0", borderTop: ri === 0 ? "none" : `1px solid ${t.border}`, alignItems: "baseline" }}>
                  <T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11, color: t.muted, fontWeight: 600 }} />
                  <T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11.5, color: t.ink, fontWeight: 700, textAlign: "end", display: "block" }} />
                </div>
              ))}
            </Panel>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {cells.map((c, i) => (
          <Panel key={i} t={t}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14 }}>
              <span style={{ width: 36, height: 36, borderRadius: 10, border: `1px solid ${rgba(t.accent, 0.5)}`, color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 14, flexShrink: 0, boxShadow: `0 0 16px ${t.glow}` }}><T v={c.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
              <div style={{ minWidth: 0 }}>
                <T v={c.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 16, fontWeight: 700, color: t.ink, lineHeight: 1.25, marginBottom: 7 }} />
                <T v={c.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12.5, color: t.muted, lineHeight: 1.55 }} />
              </div>
            </div>
          </Panel>
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
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tr.length || 1}, 1fr)`, gap: 14 }}>
        {tr.map((tk, i) => {
          const c = tk.variant === "teal" ? t.accent : tk.variant === "navy" || tk.variant === "blue" ? t.accent2 : t.muted;
          return (
            <Panel key={i} t={t} style={{ borderTop: `2px solid ${c}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: c }}><T v={tk.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
                <T v={tk.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: 1, textTransform: "uppercase", color: t.subtle, fontWeight: 700 }} />
              </div>
              <T v={tk.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 17, fontWeight: 700, color: t.ink, lineHeight: 1.2, marginBottom: 10 }} />
              <T v={tk.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, lineHeight: 1.6 }} />
              {(tk.chip || ctx.interactive) && <div style={{ marginTop: 12 }}><span style={{ border: `1px solid ${rgba(c, 0.5)}`, color: c, background: rgba(c, 0.12), padding: "4px 11px", borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 11, display: "inline-block" }}><T v={tk.chip ?? ""} onCh={(v) => set(i, { chip: v })} ed={ctx.interactive} ph="תגית" /></span></div>}
            </Panel>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && <Panel t={t} style={{ marginTop: 14, padding: 12, background: rgba(t.accent, 0.08), borderColor: rgba(t.accent, 0.3) }}><div style={{ display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="הערה" style={{ fontFamily: SANS, fontSize: 12.5, color: t.ink, fontWeight: 600 }} />{(slide.footnoteChip || ctx.interactive) && <T v={slide.footnoteChip ?? ""} onCh={(v) => ctx.onChange?.({ footnoteChip: v })} ed={ctx.interactive} ph="תגית" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1.5, color: t.accent, textTransform: "uppercase", fontWeight: 700, whiteSpace: "nowrap" }} />}</div></Panel>}
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
      <Panel t={t} style={{ padding: "4px 14px" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", direction: ctx.isRtl ? "rtl" : "ltr" }}>
          <colgroup>{headers.map((_, i) => <col key={i} style={i === 0 ? { width: "22%" } : undefined} />)}{hasChip && <col style={{ width: 116 }} />}</colgroup>
          <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "start", verticalAlign: "bottom", padding: "10px 0", paddingInlineEnd: pe(i), borderBottom: `1px solid ${t.accent}` }}><T v={h} onCh={(v) => sh(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: t.accent, fontWeight: 700, lineHeight: 1.3 }} /></th>)}{hasChip && <th style={{ borderBottom: `1px solid ${t.accent}` }} />}</tr></thead>
          <tbody>{rows.map((row, ri) => (
            <tr key={ri} style={{ background: row.emphasize ? rgba(t.accent, 0.1) : "transparent" }}>
              {Array.from({ length: nData }).map((_, ci) => <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 0", paddingInlineEnd: pe(ci), borderTop: `1px solid ${t.border}` }}><T v={row.cells[ci] ?? ""} onCh={(v) => sc(ri, ci, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, fontWeight: ci === 0 ? 700 : 400, color: ci === 0 ? t.ink : t.muted, lineHeight: 1.4 }} /></td>)}
              {hasChip && <td style={{ verticalAlign: "middle", padding: "9px 0", borderTop: `1px solid ${t.border}` }}>{row.chip ? <Pill label={row.chip} v={row.chipVariant} t={t} /> : null}</td>}
            </tr>
          ))}</tbody>
        </table>
      </Panel>
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
      <div style={{ display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 14 }}>
        {panes.map((k, i) => {
          const pane = slide[k]!;
          const hot = pane.variant === "dark" || pane.variant === "teal";
          const setRow = (ri: number, p: Partial<{ label: string; value: string }>) => setPane(k, { rows: (pane.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) });
          const setB = (bi: number, v: string) => setPane(k, { bullets: (pane.bullets ?? []).map((b, j) => (j === bi ? v : b)) });
          return (
            <Panel key={i} t={t} glow={hot} style={hot ? { borderColor: rgba(t.accent, 0.5), background: rgba(t.accent, 0.08) } : undefined}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                <T v={pane.eyebrow ?? ""} onCh={(v) => setPane(k, { eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 1, textTransform: "uppercase", color: t.accent, fontWeight: 700 }} />
                {(pane.chip || ctx.interactive) && <T v={pane.chip ?? ""} onCh={(v) => setPane(k, { chip: v })} ed={ctx.interactive} ph="תג" style={{ fontFamily: SANS, fontSize: 10.5, color: t.muted, fontWeight: 600, whiteSpace: "nowrap" }} />}
              </div>
              <T v={pane.title ?? ""} onCh={(v) => setPane(k, { title: v })} ed={ctx.interactive} block ph="כותרת" style={{ display: "block", fontFamily: SANS, fontSize: 18, fontWeight: 700, color: t.ink, lineHeight: 1.2, marginBottom: 14 }} />
              {(pane.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 14, padding: "6px 0", borderBottom: `1px solid ${t.border}` }}>
                  <T v={r.label} onCh={(v) => setRow(ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 12, color: t.muted }} />
                  <T v={r.value} onCh={(v) => setRow(ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 12, color: t.ink, fontWeight: 700, textAlign: "end", display: "block" }} />
                </div>
              ))}
              {(pane.bullets ?? []).map((b, bi) => (
                <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 10, marginTop: 9, minWidth: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: t.accent }}>{String.fromCharCode(65 + bi)}</span>
                  <T v={b} onCh={(v) => setB(bi, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, lineHeight: 1.5, color: t.ink }} />
                </div>
              ))}
              {(pane.footnote || ctx.interactive) && <div style={{ marginTop: 12, paddingTop: 10, borderTop: `1px solid ${t.border}` }}><T v={pane.footnote ?? ""} onCh={(v) => setPane(k, { footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11, color: t.muted, lineHeight: 1.5 }} /></div>}
            </Panel>
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
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
        {items.map((it, i) => (
          <Panel key={i} t={t} style={{ padding: 14 }}>
            <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
              <span style={{ width: 24, height: 24, borderRadius: "50%", border: `1px solid ${rgba(t.accent, 0.5)}`, color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>×</span>
              <div style={{ minWidth: 0 }}>
                <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 13.5, fontWeight: 700, color: t.ink, marginBottom: 5 }} />
                <T v={it.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} />
              </div>
            </div>
          </Panel>
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
      <Panel t={t} style={{ padding: 18, maxWidth: 820 }}>
        {bl.map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${t.border}`, minWidth: 0 }}>
            <span style={{ fontFamily: SANS, fontSize: 13, fontWeight: 800, color: t.accent, minWidth: 22 }}>{String(i + 1).padStart(2, "0")}</span>
            <T v={b} onCh={(v) => set(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 13, color: t.ink, lineHeight: 1.6 }} />
          </div>
        ))}
      </Panel>
    </div>
  );
}
