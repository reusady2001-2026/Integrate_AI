"use client";

/**
 * "Sidebar" — a full-height colored panel on the reading-start side holds
 * the title, eyebrow and page; the content fills the rest. Strong vertical
 * two-tone split; structurally distinct from the header-on-top designs.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette } from "@/lib/themes/deck-themes";
import { W, H, AutoFit, T, rgba, shiftHex, numSize, type DesignCtx } from "./shared";

const SBW = 300;            // sidebar width
const GAP = 30;
const PAD = 34;
const CW = W - SBW - GAP - PAD;   // content width
const CH = H - PAD * 2;
const SANS = "var(--deck-font, 'Heebo', 'Assistant', 'Helvetica Neue', system-ui, Arial, sans-serif)";

type Tok = { bg: string; sbBg: string; sbGrad: string; ink: string; muted: string; subtle: string; accent: string; accent2: string; onSb: string; onSbMut: string; line: string; soft: string; surf: string };
function toks(p: Palette): Tok {
  const ink = p.text;
  return {
    bg: p.dark ? p.bg : shiftHex(p.bg, -4),
    sbBg: p.coverBg, sbGrad: `${p.coverGradient}, ${p.coverBg}`,
    ink, muted: p.textMuted, subtle: rgba(ink, 0.5),
    accent: p.accent, accent2: p.accent2 || p.accent,
    onSb: p.coverText, onSbMut: rgba(p.coverText, 0.72),
    line: rgba(ink, 0.16), soft: rgba(ink, 0.09),
    surf: p.dark ? shiftHex(p.bg, 12) : "#ffffff",
  };
}
const sev = (t: Tok, v?: string) => (v === "high" ? t.accent : v === "med" ? t.accent2 : v === "low" ? t.subtle : t.muted);
function Pill({ label, v, t }: { label: string; v?: string; t: Tok }) {
  const c = sev(t, v);
  return <span style={{ display: "inline-block", background: rgba(c, 0.14), color: c, padding: "3px 10px", borderRadius: 999, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>;
}

// Sidebar shell wraps any body content.
function Shell({ ctx, t, slide, children }: { ctx: DesignCtx; t: Tok; slide: Slide; children: ReactNode }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.bg, color: t.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      {/* sidebar on the start side */}
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: SBW, background: t.sbGrad, color: t.onSb, padding: 30, display: "flex", flexDirection: "column", overflow: "hidden" } as CSSProperties}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ width: 14, height: 14, borderRadius: 4, background: t.accent }} />
          <span style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 1.5, color: t.onSbMut, fontWeight: 700, textTransform: "uppercase", overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" }}>{ctx.company}</span>
        </div>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "center", overflow: "hidden", paddingBlock: 18 }}>
          <div style={{ width: "100%", height: "100%" }}>
            <AutoFit availW={SBW - 60} availH={CH - 90} isRtl={isRtl} alignTop>
              <div style={{ textAlign: "start" }}>
                {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 14 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: t.accent, fontWeight: 800 }} /></div>}
                <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: 32, lineHeight: 1.12, color: t.onSb, fontWeight: 800, letterSpacing: -0.6 }} />
                {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 12 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 12.5, lineHeight: 1.55, color: t.onSbMut }} /></div>}
              </div>
            </AutoFit>
          </div>
        </div>
        {ctx.pageNumber !== undefined && <div style={{ fontFamily: SANS, fontSize: 11, color: t.onSbMut, fontWeight: 600 }}>{String(ctx.pageNumber).padStart(2, "0")} / {String(ctx.totalPages ?? 0).padStart(2, "0")}</div>}
      </div>
      {/* content area */}
      <div style={{ position: "absolute", top: PAD, bottom: PAD, [isRtl ? "left" : "right"]: PAD, width: CW }}>
        <AutoFit availW={CW} availH={CH} isRtl={isRtl} alignTop>{children}</AutoFit>
      </div>
    </div>
  );
}
function card(t: Tok, extra?: CSSProperties): CSSProperties {
  return { background: t.surf, borderRadius: 12, border: `1px solid ${t.soft}`, boxShadow: "0 4px 14px rgba(16,30,60,0.05)", padding: 16, minWidth: 0, ...extra };
}

export function renderSidebar(slide: Slide, ctx: DesignCtx): ReactNode {
  const t = toks(ctx.palette);
  const k = slide.kind;
  if (k === "cover" || (!k && slide.layout === "cover")) return <Cover slide={slide} ctx={ctx} t={t} />;
  if (k === "summary" || (!k && (slide.layout === "section" || slide.layout === "quote"))) return <Cover slide={slide} ctx={ctx} t={t} summary />;
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
  return <Shell ctx={ctx} t={t} slide={slide}>{body}</Shell>;
}

function Cover({ slide, ctx, t, summary }: { slide: Slide; ctx: DesignCtx; t: Tok; summary?: boolean }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.sbGrad, color: t.onSb, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: 8, background: t.accent } as CSSProperties} />
      <div style={{ position: "absolute", top: 40, [isRtl ? "right" : "left"]: 60, fontFamily: SANS, fontSize: 11, letterSpacing: 1.5, color: t.onSbMut, fontWeight: 700, textTransform: "uppercase" } as CSSProperties}>{ctx.company}</div>
      <div style={{ position: "absolute", top: 40, [isRtl ? "left" : "right"]: 48, fontFamily: SANS, fontSize: 11, color: t.onSbMut, fontWeight: 600 } as CSSProperties}>{ctx.date}</div>
      <div style={{ position: "absolute", top: 120, [isRtl ? "right" : "left"]: 60, width: W - 120, height: H - 200 }}>
        <AutoFit availW={W - 120} availH={H - 200} isRtl={isRtl} alignTop={!summary}>
          <div style={{ textAlign: summary ? "center" : "start" }}>
            {(slide.subtitle || ctx.interactive) && !summary && <div style={{ marginBottom: 18 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 15, fontWeight: 700, color: t.accent, letterSpacing: 1, textTransform: "uppercase" }} /></div>}
            {summary && (slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 22 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 3, textTransform: "uppercase", color: t.accent, fontWeight: 800 }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת ראשית" block style={{ fontFamily: SANS, fontSize: summary ? 40 : 58, lineHeight: summary ? 1.22 : 1.04, fontWeight: 800, color: t.onSb, letterSpacing: -1.4 }} />
            {summary && (slide.subtitle || ctx.interactive) && <div style={{ marginTop: 22 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה" style={{ fontFamily: SANS, fontSize: 15, color: t.onSbMut, lineHeight: 1.6, maxWidth: 680, margin: "0 auto" }} /></div>}
            {!summary && (slide.eyebrow || ctx.interactive) && <div style={{ marginTop: 22 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה" style={{ fontFamily: SANS, fontSize: 20, color: t.onSbMut, fontWeight: 500 }} /></div>}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

function StatBody({ s, i, set, t, ctx, big }: { s: NonNullable<Slide["stats"]>[number]; i: number; set: (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => void; t: Tok; ctx: DesignCtx; big?: boolean }) {
  return (
    <>
      <T v={s.label ?? ""} onCh={(v) => set(i, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 10, color: t.subtle, letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 8 }} />
      <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}>
        <T v={s.value ?? ""} onCh={(v) => set(i, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", big ? 44 : 32), lineHeight: 1, fontWeight: 800, color: t.accent, letterSpacing: -1 }} />
        {(s.unit || ctx.interactive) && <T v={s.unit ?? ""} onCh={(v) => set(i, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: big ? 13 : 11, color: t.muted, fontWeight: 700 }} />}
      </div>
      {(s.caption || ctx.interactive) && <T v={s.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="הסבר" style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, marginTop: 8, lineHeight: 1.45 }} />}
    </>
  );
}

function Toc({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const items = slide.tocItems ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["tocItems"]>[number]>) => ctx.onChange?.({ tocItems: items.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 9 }}>
      {items.map((it, i) => (
        <div key={i} style={{ ...card(t, { padding: 12 }), display: "grid", gridTemplateColumns: "auto 1fr", gap: 13, alignItems: "center" }}>
          <span style={{ width: 32, height: 32, borderRadius: 8, background: rgba(t.accent, 0.12), color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 13, flexShrink: 0 }}><T v={it.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
          <div style={{ minWidth: 0 }}>
            <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 14, fontWeight: 700, color: t.ink }} />
            {(it.subtitle || ctx.interactive) && <T v={it.subtitle} onCh={(v) => set(i, { subtitle: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, marginTop: 2 }} />}
          </div>
        </div>
      ))}
    </div>
  );
}

function Stats({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const cols = stats.length <= 4 ? stats.length : 2;
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols || 1}, 1fr)`, gap: 12 }}>
        {stats.map((s, i) => <div key={i} style={card(t)}><StatBody s={s} i={i} set={set} t={t} ctx={ctx} big={stats.length <= 4} /></div>)}
      </div>
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 12 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} /></div>}
    </div>
  );
}

function Kpi({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {stats[0] && <div style={card(t, { background: `linear-gradient(140deg, ${t.accent}, ${shiftHex(t.accent, -28)})`, border: "none", padding: 20 })}>
        <T v={stats[0].label ?? ""} onCh={(v) => set(0, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 10, color: rgba("#ffffff", 0.85), letterSpacing: 0.8, textTransform: "uppercase", fontWeight: 700, marginBottom: 10 }} />
        <div style={{ display: "flex", alignItems: "baseline", gap: 8 }}><T v={stats[0].value ?? ""} onCh={(v) => set(0, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(stats[0].value ?? "", 58), lineHeight: 1, fontWeight: 800, color: "#fff", letterSpacing: -1.5 }} />{(stats[0].unit || ctx.interactive) && <T v={stats[0].unit ?? ""} onCh={(v) => set(0, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: 15, color: rgba("#ffffff", 0.9), fontWeight: 700 }} />}</div>
        {(stats[0].caption || ctx.interactive) && <T v={stats[0].caption ?? ""} onCh={(v) => set(0, { caption: v })} ed={ctx.interactive} block ph="הסבר" style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: rgba("#ffffff", 0.85), marginTop: 10, lineHeight: 1.5 }} />}
      </div>}
      <div style={card(t, { padding: 18 })}>
        {(slide.body || ctx.interactive) ? <T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: t.muted }} /> : null}
        {stats[1] && <div style={{ marginTop: slide.body ? 14 : 0, paddingTop: slide.body ? 14 : 0, borderTop: slide.body ? `1px solid ${t.soft}` : "none" }}><StatBody s={stats[1]} i={1} set={set} t={t} ctx={ctx} /></div>}
      </div>
    </div>
  );
}

function Horizons({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const cards = slide.horizons ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["horizons"]>[number]>) => ctx.onChange?.({ horizons: cards.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const setRow = (ci: number, ri: number, p: Partial<{ label: string; value: string }>) => { const c = cards[ci]; if (c) set(ci, { rows: (c.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) }); };
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length || 1}, 1fr)`, gap: 12 }}>
      {cards.map((c, i) => {
        const acc = c.variant === "teal" || c.variant === "navy";
        return (
          <div key={i} style={card(t, acc ? { borderColor: rgba(t.accent, 0.4), background: rgba(t.accent, 0.05) } : undefined)}>
            <T v={c.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: acc ? t.accent : t.subtle, fontWeight: 800, marginBottom: 8 }} />
            <T v={c.bigText} onCh={(v) => set(i, { bigText: v })} ed={ctx.interactive} ph="2026" style={{ display: "block", fontFamily: SANS, fontSize: numSize(c.bigText, 40), lineHeight: 1, fontWeight: 800, color: acc ? t.accent : t.ink, letterSpacing: -1, marginBottom: 10 }} />
            {(c.caption || ctx.interactive) && <T v={c.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="תיאור" style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: t.muted, marginBottom: 10, lineHeight: 1.45 }} />}
            {(c.rows ?? []).map((r, ri) => (
              <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 8, padding: "5px 0", borderTop: ri === 0 ? "none" : `1px solid ${t.soft}`, alignItems: "baseline" }}>
                <T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 10.5, color: t.muted, fontWeight: 600 }} />
                <T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11, color: t.ink, fontWeight: 700, textAlign: "end", display: "block" }} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

function GridK({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const cells = slide.gridCards ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["gridCards"]>[number]>) => ctx.onChange?.({ gridCards: cells.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {cells.map((c, i) => (
        <div key={i} style={{ ...card(t), display: "grid", gridTemplateColumns: "auto 1fr", gap: 13 }}>
          <span style={{ width: 34, height: 34, borderRadius: 9, background: rgba(t.accent, 0.12), color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 14, flexShrink: 0 }}><T v={c.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
          <div style={{ minWidth: 0 }}>
            <T v={c.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 800, color: t.ink, lineHeight: 1.25, marginBottom: 6 }} />
            <T v={c.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.muted, lineHeight: 1.55 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Tracks({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const tr = slide.tracks ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["tracks"]>[number]>) => ctx.onChange?.({ tracks: tr.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: `repeat(${tr.length || 1}, 1fr)`, gap: 12 }}>
        {tr.map((tk, i) => {
          const c = tk.variant === "teal" ? t.accent : tk.variant === "navy" || tk.variant === "blue" ? t.accent2 : t.muted;
          return (
            <div key={i} style={card(t, { borderTop: `3px solid ${c}` })}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ width: 26, height: 26, borderRadius: 7, background: rgba(c, 0.14), color: c, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 12, flexShrink: 0 }}><T v={tk.index} onCh={(v) => set(i, { index: v })} ed={ctx.interactive} /></span>
                <T v={tk.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 9, letterSpacing: 0.8, textTransform: "uppercase", color: t.subtle, fontWeight: 700 }} />
              </div>
              <T v={tk.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 16, fontWeight: 800, color: t.ink, lineHeight: 1.2, marginBottom: 9 }} />
              <T v={tk.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.55 }} />
              {(tk.chip || ctx.interactive) && <div style={{ marginTop: 10 }}><span style={{ background: rgba(c, 0.12), color: c, padding: "4px 10px", borderRadius: 999, fontFamily: SANS, fontWeight: 700, fontSize: 10.5, display: "inline-block" }}><T v={tk.chip ?? ""} onCh={(v) => set(i, { chip: v })} ed={ctx.interactive} ph="תגית" /></span></div>}
            </div>
          );
        })}
      </div>
      {(slide.footnote || ctx.interactive) && <div style={card(t, { marginTop: 12, padding: 11, background: rgba(t.accent, 0.06), border: `1px solid ${rgba(t.accent, 0.18)}`, boxShadow: "none", display: "flex", justifyContent: "space-between", gap: 16, alignItems: "center" })}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="הערה" style={{ fontFamily: SANS, fontSize: 12, color: t.ink, fontWeight: 700 }} />{(slide.footnoteChip || ctx.interactive) && <T v={slide.footnoteChip ?? ""} onCh={(v) => ctx.onChange?.({ footnoteChip: v })} ed={ctx.interactive} ph="תגית" style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 0.8, color: t.accent, textTransform: "uppercase", fontWeight: 800, whiteSpace: "nowrap" }} />}</div>}
    </div>
  );
}

function TableK({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const headers = slide.tableHeaders ?? [], rows = slide.tableRows ?? [];
  const hasChip = rows.some((r) => r.chip), nData = headers.length, PE = 14;
  const sh = (i: number, v: string) => ctx.onChange?.({ tableHeaders: headers.map((h, j) => (j === i ? v : h)) });
  const sc = (ri: number, ci: number, v: string) => ctx.onChange?.({ tableRows: rows.map((r, j) => (j === ri ? { ...r, cells: r.cells.map((c, q) => (q === ci ? v : c)) } : r)) });
  const pe = (ci: number) => (!hasChip && ci === nData - 1 ? 0 : PE);
  return (
    <div>
      <div style={card(t, { padding: "4px 12px" })}>
        <table style={{ width: "100%", borderCollapse: "collapse", tableLayout: "fixed", direction: ctx.isRtl ? "rtl" : "ltr" }}>
          <colgroup>{headers.map((_, i) => <col key={i} style={i === 0 ? { width: "24%" } : undefined} />)}{hasChip && <col style={{ width: 100 }} />}</colgroup>
          <thead><tr>{headers.map((h, i) => <th key={i} style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 0", paddingInlineEnd: pe(i), borderBottom: `2px solid ${t.line}` }}><T v={h} onCh={(v) => sh(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase", color: t.accent, fontWeight: 800, lineHeight: 1.3 }} /></th>)}{hasChip && <th style={{ borderBottom: `2px solid ${t.line}` }} />}</tr></thead>
          <tbody>{rows.map((row, ri) => (
            <tr key={ri} style={{ background: row.emphasize ? rgba(t.accent, 0.07) : "transparent" }}>
              {Array.from({ length: nData }).map((_, ci) => <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "8px 0", paddingInlineEnd: pe(ci), borderTop: `1px solid ${t.soft}` }}><T v={row.cells[ci] ?? ""} onCh={(v) => sc(ri, ci, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, fontWeight: ci === 0 ? 700 : 400, color: ci === 0 ? t.ink : t.muted, lineHeight: 1.4 }} /></td>)}
              {hasChip && <td style={{ verticalAlign: "middle", padding: "8px 0", borderTop: `1px solid ${t.soft}` }}>{row.chip ? <Pill label={row.chip} v={row.chipVariant} t={t} /> : null}</td>}
            </tr>
          ))}</tbody>
        </table>
      </div>
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 10 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11, color: t.muted, lineHeight: 1.5 }} /></div>}
    </div>
  );
}

function Compare({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const panes: ("leftPane" | "rightPane")[] = [];
  if (slide.leftPane) panes.push("leftPane");
  if (slide.rightPane) panes.push("rightPane");
  const setPane = (k: "leftPane" | "rightPane", p: Partial<NonNullable<Slide["leftPane"]>>) => { const c = slide[k]; if (c) ctx.onChange?.({ [k]: { ...c, ...p } } as Partial<Slide>); };
  return (
    <div style={{ display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 12 }}>
      {panes.map((k, i) => {
        const pane = slide[k]!;
        const dark = pane.variant === "dark" || pane.variant === "teal";
        const bg = dark ? `linear-gradient(150deg, ${t.accent}, ${shiftHex(t.accent, -30)})` : t.surf;
        const fg = dark ? "#fff" : t.ink, mut = dark ? rgba("#ffffff", 0.82) : t.muted, ln = dark ? rgba("#ffffff", 0.18) : t.soft;
        const setRow = (ri: number, p: Partial<{ label: string; value: string }>) => setPane(k, { rows: (pane.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) });
        const setB = (bi: number, v: string) => setPane(k, { bullets: (pane.bullets ?? []).map((b, j) => (j === bi ? v : b)) });
        return (
          <div key={i} style={card(t, { background: bg, border: dark ? "none" : `1px solid ${t.soft}`, padding: 16 })}>
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
                <span style={{ width: 17, height: 17, borderRadius: 5, background: dark ? rgba("#ffffff", 0.18) : rgba(t.accent, 0.14), color: dark ? "#fff" : t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 9.5, fontWeight: 800, flexShrink: 0 }}>{String.fromCharCode(65 + bi)}</span>
                <T v={b} onCh={(v) => setB(bi, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, lineHeight: 1.5, color: dark ? rgba("#ffffff", 0.92) : t.ink }} />
              </div>
            ))}
            {(pane.footnote || ctx.interactive) && <div style={{ marginTop: 10, paddingTop: 9, borderTop: `1px solid ${ln}` }}><T v={pane.footnote ?? ""} onCh={(v) => setPane(k, { footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 10.5, color: mut, lineHeight: 1.5 }} /></div>}
          </div>
        );
      })}
    </div>
  );
}

function Donts({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const items = slide.dontItems ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["dontItems"]>[number]>) => ctx.onChange?.({ dontItems: items.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      {items.map((it, i) => (
        <div key={i} style={{ ...card(t, { padding: 13 }), display: "grid", gridTemplateColumns: "auto 1fr", gap: 12 }}>
          <span style={{ width: 24, height: 24, borderRadius: "50%", background: rgba(t.accent, 0.12), color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontWeight: 800, fontSize: 13, flexShrink: 0 }}>×</span>
          <div style={{ minWidth: 0 }}>
            <T v={it.title} onCh={(v) => set(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 13, fontWeight: 700, color: t.ink, marginBottom: 5 }} />
            <T v={it.description} onCh={(v) => set(i, { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, lineHeight: 1.5 }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function Bullets({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const bl = slide.bullets ?? [];
  const set = (i: number, v: string) => ctx.onChange?.({ bullets: bl.map((b, j) => (j === i ? v : b)) });
  return (
    <div style={card(t, { padding: 18 })}>
      {bl.map((b, i) => (
        <div key={i} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 14, padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${t.soft}`, minWidth: 0 }}>
          <span style={{ width: 24, height: 24, borderRadius: 7, background: rgba(t.accent, 0.12), color: t.accent, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS, fontSize: 11, fontWeight: 800, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
          <T v={b} onCh={(v) => set(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 13, color: t.ink, lineHeight: 1.6, alignSelf: "center" }} />
        </div>
      ))}
    </div>
  );
}
