"use client";

/**
 * "Geometric" — bold shapes. A large circle/diagonal motif sits behind the
 * content; panels are color-blocked with circular index badges and a strong
 * display face. Playful but premium; shape-driven rather than line- or
 * card-shadow-driven.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette } from "@/lib/themes/deck-themes";
import { W, H, AutoFit, T, rgba, shiftHex, numSize, type DesignCtx } from "./shared";

const PAD = 48;
const CHROME_B = 52;
const CW = W - PAD * 2;
const BTOP = CHROME_B + 16;
const BH = H - BTOP - 40;
const SANS = "'Heebo', 'Assistant', 'Helvetica Neue', system-ui, Arial, sans-serif";

type Tok = { bg: string; ink: string; muted: string; subtle: string; accent: string; accent2: string; surf: string; soft: string; line: string };
function toks(p: Palette): Tok {
  const ink = p.text;
  return { bg: p.dark ? p.bg : shiftHex(p.bg, -5), ink, muted: p.textMuted, subtle: rgba(ink, 0.5), accent: p.accent, accent2: p.accent2 || p.accent, surf: p.dark ? shiftHex(p.bg, 14) : "#ffffff", soft: rgba(ink, 0.08), line: rgba(ink, 0.14) };
}
const sev = (t: Tok, v?: string) => (v === "high" ? t.accent : v === "med" ? t.accent2 : v === "low" ? t.subtle : t.muted);
function Pill({ label, v, t }: { label: string; v?: string; t: Tok }) {
  const c = sev(t, v);
  return <span style={{ display: "inline-block", background: rgba(c, 0.15), color: c, padding: "3px 10px", borderRadius: 999, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>;
}
function Badge({ children, t, c }: { children: ReactNode; t: Tok; c?: string }) {
  return <span style={{ width: 34, height: 34, borderRadius: "50%", background: c ?? t.accent, color: "#fff", display: "inline-flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 14, flexShrink: 0 }}>{children}</span>;
}
function card(t: Tok, extra?: CSSProperties): CSSProperties {
  return { background: t.surf, borderRadius: 16, padding: 16, minWidth: 0, position: "relative", overflow: "hidden", boxShadow: "0 6px 20px rgba(16,30,60,0.06)", ...extra };
}
function Shapes({ t, isRtl }: { t: Tok; isRtl: boolean }) {
  return (
    <>
      <div style={{ position: "absolute", [isRtl ? "left" : "right"]: -90, top: -90, width: 240, height: 240, borderRadius: "50%", background: rgba(t.accent, 0.1) } as CSSProperties} />
      <div style={{ position: "absolute", [isRtl ? "right" : "left"]: -70, bottom: -110, width: 200, height: 200, borderRadius: 40, background: rgba(t.accent2, 0.08), transform: "rotate(22deg)" } as CSSProperties} />
    </>
  );
}

function Chrome({ ctx, t }: { ctx: DesignCtx; t: Tok }) {
  const s = ctx.isRtl ? "right" : "left", e = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{ position: "absolute", top: PAD - 16, [s]: PAD, display: "flex", alignItems: "center", gap: 8 } as CSSProperties}><span style={{ width: 14, height: 14, borderRadius: "50%", background: t.accent }} /><span style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, color: t.muted, fontWeight: 700, textTransform: "uppercase" }}>{ctx.company}</span></div>
      {ctx.pageNumber !== undefined && <div style={{ position: "absolute", top: PAD - 16, [e]: PAD, fontFamily: SANS, fontSize: 11, color: t.subtle, fontWeight: 600 } as CSSProperties}>{String(ctx.pageNumber).padStart(2, "0")} / {String(ctx.totalPages ?? 0).padStart(2, "0")}</div>}
    </>
  );
}

function Head({ ctx, t, slide, size = 28 }: { ctx: DesignCtx; t: Tok; slide: Slide; size?: number }) {
  return (
    <div style={{ textAlign: "start", marginBottom: 16 }}>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 10 }}><span style={{ display: "inline-block", background: rgba(t.accent, 0.14), color: t.accent, padding: "4px 12px", borderRadius: 999 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800 }} /></span></div>}
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: size, lineHeight: 1.12, color: t.ink, fontWeight: 800, letterSpacing: -0.5 }} />
      {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 8 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.55, color: t.muted, maxWidth: 780 }} /></div>}
    </div>
  );
}

export function renderGeometric(slide: Slide, ctx: DesignCtx): ReactNode {
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
      <Shapes t={t} isRtl={ctx.isRtl} />
      <Chrome ctx={ctx} t={t} />
      <div style={{ position: "absolute", top: BTOP, left: PAD, right: PAD, height: BH }}><AutoFit availW={CW} availH={BH} isRtl={ctx.isRtl} alignTop>{body}</AutoFit></div>
    </div>
  );
}

function Cover({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const isRtl = ctx.isRtl;
  const fg = ctx.palette.coverText;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${ctx.palette.coverGradient}, ${ctx.palette.coverBg}`, color: fg, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <div style={{ position: "absolute", [isRtl ? "left" : "right"]: -140, top: -100, width: 420, height: 420, borderRadius: "50%", border: `2px solid ${rgba(fg, 0.12)}` } as CSSProperties} />
      <div style={{ position: "absolute", [isRtl ? "left" : "right"]: 40, bottom: -120, width: 260, height: 260, borderRadius: 50, background: rgba(fg, 0.06), transform: "rotate(20deg)" } as CSSProperties} />
      <div style={{ position: "absolute", top: 42, [isRtl ? "right" : "left"]: PAD, display: "flex", alignItems: "center", gap: 8 } as CSSProperties}><span style={{ width: 14, height: 14, borderRadius: "50%", background: fg, opacity: 0.9 }} /><span style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1, color: rgba(fg, 0.85), fontWeight: 700 }}>{ctx.company}</span></div>
      <div style={{ position: "absolute", top: 43, [isRtl ? "left" : "right"]: PAD, fontFamily: SANS, fontSize: 11, color: rgba(fg, 0.7), fontWeight: 600 } as CSSProperties}>{ctx.date}</div>
      <div style={{ position: "absolute", top: 150, [isRtl ? "right" : "left"]: PAD, width: W - PAD * 2, height: H - 230 }}>
        <AutoFit availW={W - PAD * 2} availH={H - 230} isRtl={isRtl} alignTop>
          <div style={{ textAlign: "start" }}>
            {(slide.subtitle || ctx.interactive) && <div style={{ marginBottom: 18 }}><span style={{ display: "inline-block", background: rgba(fg, 0.15), color: fg, padding: "5px 14px", borderRadius: 999 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, letterSpacing: 0.5 }} /></span></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת ראשית" block style={{ fontFamily: SANS, fontSize: 58, lineHeight: 1.04, fontWeight: 800, color: fg, letterSpacing: -1.6 }} />
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginTop: 20 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה" style={{ fontFamily: SANS, fontSize: 20, color: rgba(fg, 0.9), fontWeight: 500 }} /></div>}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

function Summary({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const isRtl = ctx.isRtl;
  const fg = ctx.palette.coverText;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: `${ctx.palette.coverGradient}, ${ctx.palette.coverBg}`, color: fg, direction: isRtl ? "rtl" : "ltr", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div style={{ position: "absolute", left: "50%", top: "50%", width: 460, height: 460, borderRadius: "50%", border: `2px solid ${rgba(fg, 0.1)}`, transform: "translate(-50%,-50%)" }} />
      <div style={{ width: W - 150, height: H - 110, position: "relative" }}>
        <AutoFit availW={W - 150} availH={H - 110} isRtl={isRtl}>
          <div style={{ textAlign: "center" }}>
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 24 }}><span style={{ display: "inline-block", background: rgba(fg, 0.15), padding: "5px 16px", borderRadius: 999 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: fg, fontWeight: 800 }} /></span></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="האמירה המרכזית" block style={{ fontFamily: SANS, fontSize: 38, lineHeight: 1.24, fontWeight: 800, color: fg, letterSpacing: -0.6 }} />
            {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 22 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה" style={{ fontFamily: SANS, fontSize: 15, color: rgba(fg, 0.85), lineHeight: 1.6, maxWidth: 680, margin: "0 auto" }} /></div>}
            {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 28 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="כותרת תחתית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 1.5, textTransform: "uppercase", color: rgba(fg, 0.7), fontWeight: 700 }} /></div>}
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
      <Head ctx={ctx} t={t} slide={slide} size={32} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ ...card(t, { padding: 12 }), display: "grid", gridTemplateColumns: "auto 1fr", gap: 13, alignItems: "center" }}>
            <Badge t={t} c={i % 2 ? t.accent2 : t.accent}><T v={it.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></Badge>
            <div style={{ minWidth: 0 }}>
              <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 14, fontWeight: 800, color: t.ink }} />
              {(it.subtitle || ctx.interactive) && <T v={it.subtitle} onCh={(v) => set(i, { subtitle: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, marginTop: 2 }} />}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatBody({ s, i, set, t, ctx, big, onCol }: { s: NonNullable<Slide["stats"]>[number]; i: number; set: (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => void; t: Tok; ctx: DesignCtx; big?: boolean; onCol?: boolean }) {
  const num = onCol ? "#fff" : t.accent, lab = onCol ? rgba("#ffffff", 0.85) : t.subtle, cap = onCol ? rgba("#ffffff", 0.85) : t.muted;
  return (
    <>
      <T v={s.label ?? ""} onCh={(v) => set(i, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 10, color: lab, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <T v={s.value ?? ""} onCh={(v) => set(i, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", big ? 48 : 34), lineHeight: 1, fontWeight: 800, color: num, letterSpacing: -1 }} />
        {(s.unit || ctx.interactive) && <T v={s.unit ?? ""} onCh={(v) => set(i, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: big ? 14 : 12, color: cap, fontWeight: 700 }} />}
      </div>
      {(s.caption || ctx.interactive) && <T v={s.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="הסבר" style={{ display: "block", fontFamily: SANS, fontSize: 11, color: cap, marginTop: 8, lineHeight: 1.45 }} />}
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
      {hero.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${hero.length}, 1fr)`, gap: 12 }}>{hero.map((s, i) => i === 0 ? <div key={i} style={card(t, { background: `linear-gradient(140deg, ${t.accent}, ${shiftHex(t.accent, -28)})` })}><StatBody s={s} i={i} set={set} t={t} ctx={ctx} big onCol /></div> : <div key={i} style={card(t)}><StatBody s={s} i={i} set={set} t={t} ctx={ctx} big /></div>)}</div>}
      {sub.length > 0 && <div style={{ display: "grid", gridTemplateColumns: `repeat(${sub.length}, 1fr)`, gap: 12, marginTop: 12 }}>{sub.map((s, i) => <div key={i} style={card(t)}><StatBody s={s} i={i + 4} set={set} t={t} ctx={ctx} /></div>)}</div>}
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 14 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} /></div>}
    </div>
  );
}

function Kpi({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 12 }}><span style={{ display: "inline-block", background: rgba(t.accent, 0.14), color: t.accent, padding: "4px 12px", borderRadius: 999 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, textTransform: "uppercase", fontWeight: 800 }} /></span></div>}
      <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 14, alignItems: "start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {stats[0] && <div style={card(t, { background: `linear-gradient(140deg, ${t.accent}, ${shiftHex(t.accent, -30)})`, padding: 20 })}><StatBody s={stats[0]} i={0} set={set} t={t} ctx={ctx} big onCol /></div>}
          {stats[1] && <div style={card(t)}><StatBody s={stats[1]} i={1} set={set} t={t} ctx={ctx} /></div>}
        </div>
        <div style={card(t, { padding: 20 })}>
          <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: 24, lineHeight: 1.18, fontWeight: 800, color: t.ink, letterSpacing: -0.3 }} />
          {(slide.body || ctx.interactive) && <div style={{ marginTop: 14 }}><T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: t.muted }} /></div>}
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
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 12 }}>
        {cards.map((c, i) => {
          const acc = c.variant === "teal" || c.variant === "navy";
          const onCol = acc;
          return (
            <div key={i} style={card(t, onCol ? { background: `linear-gradient(150deg, ${t.accent}, ${shiftHex(t.accent, -28)})` } : undefined)}>
              <T v={c.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: onCol ? rgba("#ffffff", 0.85) : t.subtle, fontWeight: 800, marginBottom: 8 }} />
              <T v={c.bigText} onCh={(v) => set(i, { bigText: v })} ed={ctx.interactive} ph="2026" style={{ display: "block", fontFamily: SANS, fontSize: numSize(c.bigText, 42), lineHeight: 1, fontWeight: 800, color: onCol ? "#fff" : t.accent, letterSpacing: -1, marginBottom: 10 }} />
              {(c.caption || ctx.interactive) && <T v={c.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="תיאור" style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: onCol ? rgba("#ffffff", 0.85) : t.muted, marginBottom: 10, lineHeight: 1.45 }} />}
              {(c.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: "5px 0", borderTop: `1px solid ${onCol ? rgba("#ffffff", 0.18) : t.soft}`, alignItems: "baseline" }}>
                  <T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 10.5, color: onCol ? rgba("#ffffff", 0.8) : t.muted, fontWeight: 600 }} />
                  <T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11, color: onCol ? "#fff" : t.ink, fontWeight: 700, textAlign: "end", display: "block" }} />
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
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {cells.map((c, i) => (
          <div key={i} style={{ ...card(t), display: "grid", gridTemplateColumns: "auto 1fr", gap: 14 }}>
            <Badge t={t} c={i % 2 ? t.accent2 : t.accent}><T v={c.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></Badge>
            <div style={{ minWidth: 0 }}>
              <T v={c.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 15.5, fontWeight: 800, color: t.ink, lineHeight: 1.25, marginBottom: 6 }} />
              <T v={c.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, lineHeight: 1.55 }} />
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
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tr.length || 1}, 1fr)`, gap: 12 }}>
        {tr.map((tk, i) => {
          const c = tk.variant === "teal" ? t.accent : tk.variant === "navy" || tk.variant === "blue" ? t.accent2 : t.muted;
          return (
            <div key={i} style={card(t)}>
              <div style={{ position: "absolute", insetInlineEnd: -24, top: -24, width: 70, height: 70, borderRadius: "50%", background: rgba(c, 0.12) }} />
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, position: "relative" }}>
                <Badge t={t} c={c}><T v={tk.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></Badge>
                <T v={tk.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 9.5, letterSpacing: 0.8, textTransform: "uppercase", color: t.subtle, fontWeight: 700 }} />
              </div>
              <T v={tk.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 17, fontWeight: 800, color: t.ink, lineHeight: 1.2, marginBottom: 9, position: "relative" }} />
              <T v={tk.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, lineHeight: 1.6, position: "relative" }} />
              {(tk.chip || ctx.interactive) && <div style={{ marginTop: 12, position: "relative" }}><span style={{ background: rgba(c, 0.12), color: c, padding: "4px 11px", borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 11, display: "inline-block" }}><T v={tk.chip ?? ""} onCh={(v) => set(i, { chip: v })} ed={ctx.interactive} ph="תגית" /></span></div>}
            </div>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && <div style={card(t, { marginTop: 12, padding: 12, background: rgba(t.accent, 0.08), boxShadow: "none", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" })}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="הערה" style={{ fontFamily: SANS, fontSize: 12.5, color: t.ink, fontWeight: 700 }} />{(slide.footnoteChip || ctx.interactive) && <T v={slide.footnoteChip ?? ""} onCh={(v) => ctx.onChange?.({ footnoteChip: v })} ed={ctx.interactive} ph="תגית" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 1, color: t.accent, textTransform: "uppercase", fontWeight: 800, whiteSpace: "nowrap" }} />}</div>}
    </div>
  );
}

function TableK({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const headers = slide.tableHeaders ?? [], rows = slide.tableRows ?? [];
  const hasChip = rows.some((r) => r.chip), nData = headers.length, PE = 16;
  const sh = (i: number, v: string) => ctx.onChange?.({ tableHeaders: headers.map((h, j) => (j === i ? v : h)) });
  const sc = (ri: number, ci: number, v: string) => ctx.onChange?.({ tableRows: rows.map((r, j) => (j === ri ? { ...r, cells: r.cells.map((c, q) => (q === ci ? v : c)) } : r)) });
  const pe = (ci: number) => (!hasChip && ci === nData - 1 ? 0 : PE);
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={26} />
      <div style={card(t, { padding: "6px 14px", boxShadow: "0 6px 20px rgba(16,30,60,0.06)" })}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", direction: ctx.isRtl ? "rtl" : "ltr" }}>
          <colgroup>{headers.map((_, i) => <col key={i} style={i === 0 ? { width: "22%" } : undefined} />)}{hasChip && <col style={{ width: 116 }} />}</colgroup>
          <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "start", verticalAlign: "bottom", padding: "10px 0", paddingInlineEnd: pe(i), borderBottom: `2px solid ${rgba(t.accent, 0.4)}` }}><T v={h} onCh={(v) => sh(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: t.accent, fontWeight: 800, lineHeight: 1.3 }} /></th>)}{hasChip && <th style={{ borderBottom: `2px solid ${rgba(t.accent, 0.4)}` }} />}</tr></thead>
          <tbody>{rows.map((row, ri) => (
            <tr key={ri} style={{ background: row.emphasize ? rgba(t.accent, 0.08) : "transparent" }}>
              {Array.from({ length: nData }).map((_, ci) => <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 0", paddingInlineEnd: pe(ci), borderTop: `1px solid ${t.soft}` }}><T v={row.cells[ci] ?? ""} onCh={(v) => sc(ri, ci, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, fontWeight: ci === 0 ? 700 : 400, color: ci === 0 ? t.ink : t.muted, lineHeight: 1.4 }} /></td>)}
              {hasChip && <td style={{ verticalAlign: "middle", padding: "9px 0", borderTop: `1px solid ${t.soft}` }}>{row.chip ? <Pill label={row.chip} v={row.chipVariant} t={t} /> : null}</td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
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
          const dark = pane.variant === "dark" || pane.variant === "teal";
          const bg = dark ? `linear-gradient(150deg, ${t.accent}, ${shiftHex(t.accent, -30)})` : t.surf;
          const fg = dark ? "#fff" : t.ink, mut = dark ? rgba("#ffffff", 0.82) : t.muted, ln = dark ? rgba("#ffffff", 0.18) : t.soft;
          const setRow = (ri: number, p: Partial<{ label: string; value: string }>) => setPane(k, { rows: (pane.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) });
          const setB = (bi: number, v: string) => setPane(k, { bullets: (pane.bullets ?? []).map((b, j) => (j === bi ? v : b)) });
          return (
            <div key={i} style={card(t, { background: bg, padding: 18 })}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <T v={pane.eyebrow ?? ""} onCh={(v) => setPane(k, { eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: dark ? rgba("#ffffff", 0.85) : t.accent, fontWeight: 800 }} />
                {(pane.chip || ctx.interactive) && <span style={{ background: dark ? rgba("#ffffff", 0.16) : rgba(t.accent, 0.12), color: dark ? "#fff" : t.accent, padding: "2px 9px", borderRadius: 999, display: "inline-block" }}><T v={pane.chip ?? ""} onCh={(v) => setPane(k, { chip: v })} ed={ctx.interactive} ph="תג" style={{ fontFamily: SANS, fontSize: 10, fontWeight: 700, whiteSpace: "nowrap" }} /></span>}
              </div>
              <T v={pane.title ?? ""} onCh={(v) => setPane(k, { title: v })} ed={ctx.interactive} block ph="כותרת" style={{ display: "block", fontFamily: SANS, fontSize: 17, fontWeight: 800, color: fg, lineHeight: 1.2, marginBottom: 12 }} />
              {(pane.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "5px 0", borderBottom: `1px solid ${ln}` }}>
                  <T v={r.label} onCh={(v) => setRow(ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11.5, color: mut }} />
                  <T v={r.value} onCh={(v) => setRow(ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11.5, color: fg, fontWeight: 700, textAlign: "end", display: "block" }} />
                </div>
              ))}
              {(pane.bullets ?? []).map((b, bi) => (
                <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 9, marginTop: 8, minWidth: 0 }}>
                  <span style={{ width: 17, height: 17, borderRadius: "50%", background: dark ? rgba("#ffffff", 0.2) : rgba(t.accent, 0.14), color: dark ? "#fff" : t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 9.5, fontWeight: 800, flexShrink: 0 }}>{String.fromCharCode(65 + bi)}</span>
                  <T v={b} onCh={(v) => setB(bi, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, lineHeight: 1.5, color: dark ? rgba("#ffffff", 0.92) : t.ink }} />
                </div>
              ))}
              {(pane.footnote || ctx.interactive) && <div style={{ marginTop: 10, paddingTop: 9, borderTop: `1px solid ${ln}` }}><T v={pane.footnote ?? ""} onCh={(v) => setPane(k, { footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 10.5, color: mut, lineHeight: 1.5 }} /></div>}
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
      <Head ctx={ctx} t={t} slide={slide} size={30} />
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {items.map((it, i) => (
          <div key={i} style={{ ...card(t, { padding: 14 }), display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
            <Badge t={t}>×</Badge>
            <div style={{ minWidth: 0 }}>
              <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 13, fontWeight: 800, color: t.ink, marginBottom: 5 }} />
              <T v={it.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, lineHeight: 1.5 }} />
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
      <Head ctx={ctx} t={t} slide={slide} size={30} />
      <div style={card(t, { padding: 18 })}>
        {bl.map((b, i) => (
          <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${t.soft}`, minWidth: 0, alignItems: "center" }}>
            <Badge t={t} c={i % 2 ? t.accent2 : t.accent}>{String(i + 1).padStart(2, "0")}</Badge>
            <T v={b} onCh={(v) => set(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 13, color: t.ink, lineHeight: 1.6 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
