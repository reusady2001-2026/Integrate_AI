"use client";

/**
 * "Strips" — horizontal banded rows. Content is organised as full-width
 * stacked strips, each led by an oversized index on the start side, with
 * alternating tints. Row-based rather than card/column-based — a
 * newspaper-ledger rhythm.
 */

import { type CSSProperties, type ReactNode } from "react";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette } from "@/lib/themes/deck-themes";
import { W, H, AutoFit, T, rgba, shiftHex, numSize, type DesignCtx } from "./shared";

const PAD = 50;
const CHROME_B = 52;
const CW = W - PAD * 2;
const BTOP = CHROME_B + 16;
const BH = H - BTOP - 40;
const SANS = "'Heebo', 'Helvetica Neue', system-ui, Arial, sans-serif";

type Tok = { bg: string; ink: string; muted: string; subtle: string; accent: string; accent2: string; line: string; tint: string; onAccent: string };
function toks(p: Palette): Tok {
  const ink = p.text;
  return { bg: p.bg, ink, muted: p.textMuted, subtle: rgba(ink, 0.5), accent: p.accent, accent2: p.accent2 || p.accent, line: rgba(ink, 0.14), tint: rgba(ink, 0.035), onAccent: "#fff" };
}
const sev = (t: Tok, v?: string) => (v === "high" ? t.accent : v === "med" ? t.accent2 : v === "low" ? t.subtle : t.muted);
function Tag({ label, v, t }: { label: string; v?: string; t: Tok }) {
  const c = sev(t, v);
  return <span style={{ display: "inline-block", background: rgba(c, 0.14), color: c, padding: "3px 10px", borderRadius: 3, fontFamily: SANS, fontSize: 10.5, fontWeight: 700, whiteSpace: "nowrap" }}>{label}</span>;
}
function strip(t: Tok, i: number, extra?: CSSProperties): CSSProperties {
  return { background: i % 2 ? t.tint : "transparent", borderInlineStart: `3px solid ${t.accent}`, padding: "12px 16px", minWidth: 0, ...extra };
}

function Chrome({ ctx, t }: { ctx: DesignCtx; t: Tok }) {
  const s = ctx.isRtl ? "right" : "left", e = ctx.isRtl ? "left" : "right";
  return (
    <>
      <div style={{ position: "absolute", top: PAD - 16, [s]: PAD, fontFamily: SANS, fontSize: 10, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase", maxWidth: 440, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis" } as CSSProperties}>{ctx.company}</div>
      {ctx.pageNumber !== undefined && <div style={{ position: "absolute", top: PAD - 16, [e]: PAD, fontFamily: SANS, fontSize: 10.5, color: t.subtle, fontWeight: 700 } as CSSProperties}>{String(ctx.pageNumber).padStart(2, "0")} / {String(ctx.totalPages ?? 0).padStart(2, "0")}</div>}
      <div style={{ position: "absolute", top: CHROME_B, left: PAD, right: PAD, height: 2, background: t.accent }} />
    </>
  );
}

function Head({ ctx, t, slide, size = 30 }: { ctx: DesignCtx; t: Tok; slide: Slide; size?: number }) {
  return (
    <div style={{ textAlign: "start", marginBottom: 14 }}>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 9 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: t.accent, fontWeight: 800 }} /></div>}
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: size, lineHeight: 1.1, color: t.ink, fontWeight: 800, letterSpacing: -0.5 }} />
      {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 7 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 13, lineHeight: 1.5, color: t.muted, maxWidth: 780 }} /></div>}
    </div>
  );
}

export function renderStrips(slide: Slide, ctx: DesignCtx): ReactNode {
  const t = toks(ctx.palette);
  const k = slide.kind;
  if (k === "cover" || (!k && slide.layout === "cover")) return <Cover slide={slide} ctx={ctx} t={t} />;
  if (k === "summary" || (!k && (slide.layout === "section" || slide.layout === "quote"))) return <Summary slide={slide} ctx={ctx} t={t} />;
  let body: ReactNode;
  if (k === "toc") body = <Rows slide={slide} ctx={ctx} t={t} mode="toc" />;
  else if (k === "stats") body = <Stats slide={slide} ctx={ctx} t={t} />;
  else if (k === "kpi-card") body = <Kpi slide={slide} ctx={ctx} t={t} />;
  else if (k === "horizons") body = <Horizons slide={slide} ctx={ctx} t={t} />;
  else if (k === "grid") body = <Rows slide={slide} ctx={ctx} t={t} mode="grid" />;
  else if (k === "tracks") body = <Rows slide={slide} ctx={ctx} t={t} mode="tracks" />;
  else if (k === "table") body = <TableK slide={slide} ctx={ctx} t={t} />;
  else if (k === "compare") body = <Compare slide={slide} ctx={ctx} t={t} />;
  else if (k === "donts") body = <Rows slide={slide} ctx={ctx} t={t} mode="donts" />;
  else body = <Bullets slide={slide} ctx={ctx} t={t} />;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.bg, color: t.ink, direction: ctx.isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <Chrome ctx={ctx} t={t} />
      <div style={{ position: "absolute", top: BTOP, left: PAD, right: PAD, height: BH }}><AutoFit availW={CW} availH={BH} isRtl={ctx.isRtl} alignTop>{body}</AutoFit></div>
    </div>
  );
}

function Cover({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const isRtl = ctx.isRtl;
  return (
    <div style={{ position: "absolute", inset: 0, width: W, height: H, background: t.bg, color: t.ink, direction: isRtl ? "rtl" : "ltr", overflow: "hidden" }}>
      <div style={{ position: "absolute", top: 0, [isRtl ? "right" : "left"]: 0, right: isRtl ? undefined : 0, left: isRtl ? 0 : undefined, height: 12, width: "100%", background: t.accent } as CSSProperties} />
      <div style={{ position: "absolute", top: 46, [isRtl ? "right" : "left"]: PAD, fontFamily: SANS, fontSize: 11, letterSpacing: 1.5, color: t.muted, fontWeight: 700, textTransform: "uppercase" } as CSSProperties}>{ctx.company}</div>
      <div style={{ position: "absolute", top: 46, [isRtl ? "left" : "right"]: PAD, fontFamily: SANS, fontSize: 11, color: t.subtle, fontWeight: 600 } as CSSProperties}>{ctx.date}</div>
      <div style={{ position: "absolute", top: 130, [isRtl ? "right" : "left"]: PAD, width: W - PAD * 2, height: H - 210 }}>
        <AutoFit availW={W - PAD * 2} availH={H - 210} isRtl={isRtl} alignTop>
          <div style={{ textAlign: "start", borderInlineStart: `8px solid ${t.accent}`, paddingInlineStart: 22 }}>
            {(slide.subtitle || ctx.interactive) && <div style={{ marginBottom: 16 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} ph="תת-כותרת" style={{ fontFamily: SANS, fontSize: 15, fontWeight: 800, color: t.accent, letterSpacing: 1, textTransform: "uppercase" }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת ראשית" block style={{ fontFamily: SANS, fontSize: 60, lineHeight: 1.02, fontWeight: 800, color: t.ink, letterSpacing: -1.5 }} />
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginTop: 20 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="כותרת משנה" style={{ fontFamily: SANS, fontSize: 20, color: t.muted, fontWeight: 500 }} /></div>}
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
          <div style={{ textAlign: "start", borderInlineStart: `8px solid rgba(255,255,255,0.6)`, paddingInlineStart: 24 }}>
            {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 20 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2.5, textTransform: "uppercase", color: rgba("#ffffff", 0.85), fontWeight: 800 }} /></div>}
            <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="האמירה המרכזית" block style={{ fontFamily: SANS, fontSize: 42, lineHeight: 1.16, fontWeight: 800, color: "#fff", letterSpacing: -0.8 }} />
            {(slide.subtitle || ctx.interactive) && <div style={{ marginTop: 20, maxWidth: 720 }}><T v={slide.subtitle} onCh={(v) => ctx.onChange?.({ subtitle: v })} ed={ctx.interactive} block ph="הרחבה" style={{ fontFamily: SANS, fontSize: 15, color: rgba("#ffffff", 0.9), lineHeight: 1.55 }} /></div>}
            {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 22 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} ph="כותרת תחתית" style={{ fontFamily: SANS, fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: rgba("#ffffff", 0.75), fontWeight: 700 }} /></div>}
          </div>
        </AutoFit>
      </div>
    </div>
  );
}

// Generic stacked-row renderer for toc / grid / tracks / donts.
function Rows({ slide, ctx, t, mode }: { slide: Slide; ctx: DesignCtx; t: Tok; mode: "toc" | "grid" | "tracks" | "donts" }) {
  const data = mode === "toc" ? (slide.tocItems ?? []) : mode === "grid" ? (slide.gridCards ?? []) : mode === "tracks" ? (slide.tracks ?? []) : (slide.dontItems ?? []);
  const upd = (next: unknown[]) => {
    if (mode === "toc") ctx.onChange?.({ tocItems: next as Slide["tocItems"] });
    else if (mode === "grid") ctx.onChange?.({ gridCards: next as Slide["gridCards"] });
    else if (mode === "tracks") ctx.onChange?.({ tracks: next as Slide["tracks"] });
    else ctx.onChange?.({ dontItems: next as Slide["dontItems"] });
  };
  const setF = (i: number, p: Record<string, string>) => upd(data.map((x, j) => (j === i ? { ...x, ...p } : x)));
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={mode === "toc" || mode === "donts" ? 32 : 28} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {(data as Array<Record<string, string>>).map((it, i) => {
          const idx = mode === "donts" ? "×" : (it.index ?? String(i + 1).padStart(2, "0"));
          const title = it.title ?? "";
          const desc = mode === "toc" ? (it.subtitle ?? "") : (it.description ?? "");
          const chip = mode === "tracks" ? (it.chip ?? "") : "";
          return (
            <div key={i} style={strip(t, i, { display: "grid", gridTemplateColumns: "auto 1fr auto", gap: 18, alignItems: "center" })}>
              <span style={{ fontFamily: SANS, fontSize: mode === "donts" ? 24 : 26, fontWeight: 800, color: t.accent, minWidth: 40, letterSpacing: -0.5 }}>{mode === "donts" ? "×" : <T v={idx} onCh={(v) => setF(i, { index: v })} ed={ctx.interactive} />}</span>
              <div style={{ minWidth: 0 }}>
                <T v={title} onCh={(v) => setF(i, { title: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 15, fontWeight: 800, color: t.ink, marginBottom: desc ? 3 : 0 }} />
                {(desc || ctx.interactive) && <T v={desc} onCh={(v) => setF(i, mode === "toc" ? { subtitle: v } : { description: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.45 }} />}
              </div>
              {mode === "tracks" && (chip || ctx.interactive) ? <span><Tag label={chip || "—"} t={t} /></span> : <span />}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function StatBody({ s, i, set, t, ctx, big }: { s: NonNullable<Slide["stats"]>[number]; i: number; set: (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => void; t: Tok; ctx: DesignCtx; big?: boolean }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 18, alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "baseline", gap: 5, minWidth: 130 }}>
        <T v={s.value ?? ""} onCh={(v) => set(i, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(s.value ?? "", big ? 44 : 34), lineHeight: 1, fontWeight: 800, color: t.accent, letterSpacing: -1 }} />
        {(s.unit || ctx.interactive) && <T v={s.unit ?? ""} onCh={(v) => set(i, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: 12, color: t.muted, fontWeight: 700 }} />}
      </div>
      <div style={{ minWidth: 0 }}>
        <T v={s.label ?? ""} onCh={(v) => set(i, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.ink, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 800, marginBottom: s.caption ? 3 : 0 }} />
        {(s.caption || ctx.interactive) && <T v={s.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11, color: t.muted, lineHeight: 1.4 }} />}
      </div>
    </div>
  );
}

function Stats({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {stats.map((s, i) => <div key={i} style={strip(t, i)}><StatBody s={s} i={i} set={set} t={t} ctx={ctx} big={stats.length <= 4} /></div>)}
      </div>
      {(slide.footnote || ctx.interactive) && <div style={{ marginTop: 12 }}><T v={slide.footnote ?? ""} onCh={(v) => ctx.onChange?.({ footnote: v })} ed={ctx.interactive} block ph="הערה" style={{ fontFamily: SANS, fontSize: 11.5, color: t.muted, lineHeight: 1.5 }} /></div>}
    </div>
  );
}

function Kpi({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const stats = slide.stats ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["stats"]>[number]>) => ctx.onChange?.({ stats: stats.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  return (
    <div>
      {(slide.eyebrow || ctx.interactive) && <div style={{ marginBottom: 12 }}><T v={slide.eyebrow ?? ""} onCh={(v) => ctx.onChange?.({ eyebrow: v })} ed={ctx.interactive} ph="LABEL" style={{ fontFamily: SANS, fontSize: 10.5, letterSpacing: 2, textTransform: "uppercase", color: t.accent, fontWeight: 800 }} /></div>}
      {stats[0] && <div style={{ background: t.accent, color: "#fff", padding: "16px 20px", display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "baseline", gap: 6 }}><T v={stats[0].value ?? ""} onCh={(v) => set(0, { value: v })} ed={ctx.interactive} ph="0" style={{ fontFamily: SANS, fontSize: numSize(stats[0].value ?? "", 58), lineHeight: 1, fontWeight: 800, color: "#fff", letterSpacing: -1.5 }} />{(stats[0].unit || ctx.interactive) && <T v={stats[0].unit ?? ""} onCh={(v) => set(0, { unit: v })} ed={ctx.interactive} ph="יח" style={{ fontFamily: SANS, fontSize: 15, color: rgba("#ffffff", 0.9), fontWeight: 700 }} />}</div>
        <div style={{ minWidth: 0 }}><T v={stats[0].label ?? ""} onCh={(v) => set(0, { label: v })} ed={ctx.interactive} ph="תווית" style={{ display: "block", fontFamily: SANS, fontSize: 11, letterSpacing: 0.5, textTransform: "uppercase", fontWeight: 800, color: rgba("#ffffff", 0.9) }} />{(stats[0].caption || ctx.interactive) && <T v={stats[0].caption ?? ""} onCh={(v) => set(0, { caption: v })} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 11.5, color: rgba("#ffffff", 0.85), marginTop: 3, lineHeight: 1.4 }} />}</div>
      </div>}
      <T v={slide.title} onCh={(v) => ctx.onChange?.({ title: v })} ed={ctx.interactive} ph="כותרת" block style={{ display: "block", fontFamily: SANS, fontSize: 24, lineHeight: 1.15, fontWeight: 800, color: t.ink, letterSpacing: -0.4, marginBottom: 10 }} />
      {(slide.body || ctx.interactive) && <T v={slide.body ?? ""} onCh={(v) => ctx.onChange?.({ body: v })} ed={ctx.interactive} block ph="טקסט גוף" style={{ display: "block", fontFamily: SANS, fontSize: 13, lineHeight: 1.65, color: t.muted, maxWidth: 760 }} />}
      {stats[1] && <div style={{ marginTop: 12 }}><div style={strip(t, 1)}><StatBody s={stats[1]} i={1} set={set} t={t} ctx={ctx} /></div></div>}
    </div>
  );
}

function Horizons({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const cards = slide.horizons ?? [];
  const set = (i: number, p: Partial<NonNullable<Slide["horizons"]>[number]>) => ctx.onChange?.({ horizons: cards.map((x, j) => (j === i ? { ...x, ...p } : x)) });
  const setRow = (ci: number, ri: number, p: Partial<{ label: string; value: string }>) => { const c = cards[ci]; if (c) set(ci, { rows: (c.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) }); };
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {cards.map((c, i) => {
          const acc = c.variant === "teal" || c.variant === "navy";
          return (
            <div key={i} style={strip(t, i, { borderInlineStartColor: acc ? t.accent : t.line, borderInlineStartWidth: acc ? 6 : 3, display: "grid", gridTemplateColumns: "auto 1fr", gap: 20, alignItems: "center" })}>
              <div style={{ minWidth: 120 }}>
                <T v={c.eyebrow} onCh={(v) => set(i, { eyebrow: v })} ed={ctx.interactive} style={{ display: "block", fontFamily: SANS, fontSize: 9.5, letterSpacing: 0.5, textTransform: "uppercase", color: acc ? t.accent : t.subtle, fontWeight: 800, marginBottom: 4 }} />
                <T v={c.bigText} onCh={(v) => set(i, { bigText: v })} ed={ctx.interactive} ph="2026" style={{ display: "block", fontFamily: SANS, fontSize: numSize(c.bigText, 38), lineHeight: 1, fontWeight: 800, color: acc ? t.accent : t.ink, letterSpacing: -1 }} />
              </div>
              <div style={{ minWidth: 0 }}>
                {(c.caption || ctx.interactive) && <T v={c.caption ?? ""} onCh={(v) => set(i, { caption: v })} ed={ctx.interactive} block ph="תיאור" style={{ display: "block", fontFamily: SANS, fontSize: 12, color: t.ink, fontWeight: 600, marginBottom: 4, lineHeight: 1.4 }} />}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "2px 16px" }}>
                  {(c.rows ?? []).map((r, ri) => (
                    <span key={ri} style={{ fontFamily: SANS, fontSize: 11, color: t.muted }}><T v={r.label} onCh={(v) => setRow(i, ri, { label: v })} ed={ctx.interactive} /> <strong style={{ color: t.ink }}><T v={r.value} onCh={(v) => setRow(i, ri, { value: v })} ed={ctx.interactive} /></strong></span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
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
        <thead><tr style={{ background: t.accent }}>{headers.map((h, i) => <th key={i} style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 12px", paddingInlineEnd: pe(i) + 12 }}><T v={h} onCh={(v) => sh(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 10, letterSpacing: 0.5, textTransform: "uppercase", color: "#fff", fontWeight: 800, lineHeight: 1.3 }} /></th>)}{hasChip && <th style={{ background: t.accent }} />}</tr></thead>
        <tbody>{rows.map((row, ri) => (
          <tr key={ri} style={{ background: row.emphasize ? rgba(t.accent, 0.12) : (ri % 2 ? t.tint : "transparent") }}>
            {Array.from({ length: nData }).map((_, ci) => <td key={ci} style={{ textAlign: "start", verticalAlign: "middle", padding: "9px 12px", paddingInlineEnd: pe(ci) + 12 }}><T v={row.cells[ci] ?? ""} onCh={(v) => sc(ri, ci, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 12, fontWeight: ci === 0 ? 800 : 400, color: ci === 0 ? t.ink : t.muted, lineHeight: 1.4 }} /></td>)}
            {hasChip && <td style={{ verticalAlign: "middle", padding: "9px 12px" }}>{row.chip ? <Tag label={row.chip} v={row.chipVariant} t={t} /> : null}</td>}
          </tr>
        ))}</tbody>
      </table>
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
      <Head ctx={ctx} t={t} slide={slide} size={28} />
      <div style={{ display: "grid", gridTemplateColumns: panes.length === 2 ? "1fr 1fr" : "1fr", gap: 16 }}>
        {panes.map((k, i) => {
          const pane = slide[k]!;
          const dark = pane.variant === "dark" || pane.variant === "teal";
          const bg = dark ? t.accent : t.tint, fg = dark ? "#fff" : t.ink, mut = dark ? rgba("#ffffff", 0.82) : t.muted, ln = dark ? rgba("#ffffff", 0.2) : t.line;
          const setRow = (ri: number, p: Partial<{ label: string; value: string }>) => setPane(k, { rows: (pane.rows ?? []).map((r, j) => (j === ri ? { ...r, ...p } : r)) });
          const setB = (bi: number, v: string) => setPane(k, { bullets: (pane.bullets ?? []).map((b, j) => (j === bi ? v : b)) });
          return (
            <div key={i} style={{ background: bg, color: fg, padding: 18, borderInlineStart: `4px solid ${dark ? rgba("#ffffff", 0.5) : t.accent}`, minWidth: 0 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, marginBottom: 10 }}>
                <T v={pane.eyebrow ?? ""} onCh={(v) => setPane(k, { eyebrow: v })} ed={ctx.interactive} ph="תווית" style={{ fontFamily: SANS, fontSize: 10, letterSpacing: 0.8, textTransform: "uppercase", color: dark ? rgba("#ffffff", 0.85) : t.accent, fontWeight: 800 }} />
                {(pane.chip || ctx.interactive) && <T v={pane.chip ?? ""} onCh={(v) => setPane(k, { chip: v })} ed={ctx.interactive} ph="תג" style={{ fontFamily: SANS, fontSize: 10.5, color: mut, fontWeight: 700, whiteSpace: "nowrap" }} />}
              </div>
              <T v={pane.title ?? ""} onCh={(v) => setPane(k, { title: v })} ed={ctx.interactive} block ph="כותרת" style={{ display: "block", fontFamily: SANS, fontSize: 17, fontWeight: 800, color: fg, lineHeight: 1.2, marginBottom: 12 }} />
              {(pane.rows ?? []).map((r, ri) => (
                <div key={ri} style={{ display: "grid", gridTemplateColumns: "1fr auto", gap: 12, padding: "5px 0", borderBottom: `1px solid ${ln}` }}>
                  <T v={r.label} onCh={(v) => setRow(ri, { label: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11.5, color: mut }} />
                  <T v={r.value} onCh={(v) => setRow(ri, { value: v })} ed={ctx.interactive} style={{ fontFamily: SANS, fontSize: 11.5, color: fg, fontWeight: 800, textAlign: "end", display: "block" }} />
                </div>
              ))}
              {(pane.bullets ?? []).map((b, bi) => (
                <div key={bi} style={{ display: "grid", gridTemplateColumns: "auto 1fr", gap: 9, marginTop: 8, minWidth: 0 }}>
                  <span style={{ fontFamily: SANS, fontSize: 12, fontWeight: 800, color: dark ? "#fff" : t.accent }}>{String.fromCharCode(65 + bi)}</span>
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

function Bullets({ slide, ctx, t }: { slide: Slide; ctx: DesignCtx; t: Tok }) {
  const bl = slide.bullets ?? [];
  const set = (i: number, v: string) => ctx.onChange?.({ bullets: bl.map((b, j) => (j === i ? v : b)) });
  return (
    <div>
      <Head ctx={ctx} t={t} slide={slide} size={30} />
      <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {bl.map((b, i) => (
          <div key={i} style={strip(t, i, { display: "grid", gridTemplateColumns: "auto 1fr", gap: 16, alignItems: "center" })}>
            <span style={{ fontFamily: SANS, fontSize: 18, fontWeight: 800, color: t.accent, minWidth: 30 }}>{String(i + 1).padStart(2, "0")}</span>
            <T v={b} onCh={(v) => set(i, v)} ed={ctx.interactive} block style={{ display: "block", fontFamily: SANS, fontSize: 13, color: t.ink, lineHeight: 1.5, fontWeight: 500 }} />
          </div>
        ))}
      </div>
    </div>
  );
}
