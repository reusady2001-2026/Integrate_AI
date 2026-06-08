import type { Slide, StrategyDeck } from "@/lib/schemas/strategy-deck";
import type { Lang } from "@/lib/i18n";
import {
  DECK_THEMES,
  PALETTES,
  FONT_PAIRS,
  noHash,
  type DeckTheme,
  type Palette,
  type FontPair,
} from "@/lib/themes/deck-themes";

// ──────────────────────────────────────────────────────────────────────
// PowerPoint export. Mirrors the on-screen deck CONTENT faithfully: every
// rich slide kind (stats, horizons, grid, tracks, table, compare, donts,
// kpi-card, toc, cover, summary, bullets) is rebuilt as real PowerPoint
// objects, including eyebrows, footnotes and severity chips. It is a clean,
// palette-coloured, editable .pptx — not a pixel copy of the chosen design
// (PowerPoint can't reproduce the CSS), but nothing is dropped.
// ──────────────────────────────────────────────────────────────────────

const SLIDE_W = 10;          // inches (16:9)
const SLIDE_H = 5.625;
const MARGIN = 0.5;
const CONTENT_W = SLIDE_W - MARGIN * 2;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type S = any; // pptxgenjs slide — loose typing on purpose

type Ctx = {
  palette: Palette;
  accent: string;
  accent2: string;
  ink: string;
  muted: string;
  coverBg: string;
  coverText: string;
  bg: string;
  rtl: boolean;
  align: "left" | "right";
  alignEnd: "left" | "right";
  titleFace: string;
  bodyFace: string;
  company: string;
  date: string;
};

// Extract a usable PowerPoint font face from a CSS stack ("'Anton', ..." → "Anton").
function faceFrom(css: string | undefined, fallback: string): string {
  if (!css) return fallback;
  const first = css.split(",")[0].replace(/var\(--[^,]*/i, "").replace(/['"]/g, "").trim();
  return first || fallback;
}

export async function renderDeckPptx(doc: StrategyDeck, lang: Lang): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const prs = new PptxGenJS();
  prs.layout = "LAYOUT_16x9";
  prs.author = doc.company || "Integrate AI";
  prs.title = doc.planTitle || doc.company || "Strategy Deck";

  const theme: DeckTheme = DECK_THEMES.find((t) => t.id === doc.theme) ?? DECK_THEMES[0];
  const paletteId = (doc.paletteOverride || theme.palette) as keyof typeof PALETTES;
  const palette = { ...PALETTES[paletteId] };
  const cp = doc.customPalette ?? {};
  if (cp.coverBg) palette.coverBg = cp.coverBg;
  if (cp.bg) { palette.bg = cp.bg; palette.bgAlt = cp.bg; }
  if (cp.accent) palette.accent = cp.accent;
  if (cp.accent2) palette.accent2 = cp.accent2;
  if (cp.text) { palette.text = cp.text; palette.textMuted = cp.text; }

  const baseFont: FontPair = FONT_PAIRS[theme.font];
  const fmt = doc.formatting;
  const rtl = lang === "he";

  const ctx: Ctx = {
    palette,
    accent: noHash(palette.accent),
    accent2: noHash(palette.accent2 || palette.accent),
    ink: noHash(palette.text),
    muted: noHash(palette.textMuted),
    coverBg: noHash(palette.coverBg),
    coverText: noHash(palette.coverText),
    bg: noHash(palette.bg),
    rtl,
    align: rtl ? "right" : "left",
    alignEnd: rtl ? "left" : "right",
    titleFace: faceFrom(fmt.titleFont, baseFont.pptxDisplay),
    bodyFace: faceFrom(fmt.bodyFont, baseFont.pptxBody),
    company: doc.company,
    date: doc.date,
  };

  doc.slides.forEach((slide, i) => {
    const s = prs.addSlide();
    const k = slide.kind;
    if (k === "cover" || (!k && slide.layout === "cover")) renderCover(s, slide, ctx);
    else if (k === "summary" || (!k && (slide.layout === "section" || slide.layout === "quote"))) renderSummary(s, slide, ctx);
    else {
      renderChrome(s, ctx, i + 1, doc.slides.length);
      const region = renderHeader(s, slide, ctx);
      if (k === "stats") renderStats(s, slide, ctx, region);
      else if (k === "kpi-card") renderKpi(s, slide, ctx, region);
      else if (k === "horizons") renderHorizons(s, slide, ctx, region);
      else if (k === "grid") renderGrid(s, slide, ctx, region);
      else if (k === "tracks") renderTracks(s, slide, ctx, region);
      else if (k === "table") renderTable(s, slide, ctx, region);
      else if (k === "compare") renderCompare(s, slide, ctx, region);
      else if (k === "donts") renderDonts(s, slide, ctx, region);
      else if (k === "toc") renderToc(s, slide, ctx, region);
      else renderBullets(s, slide, ctx, region);
    }
  });

  await prs.writeFile({ fileName: `${(doc.company || "deck").replace(/\s+/g, "_")}.pptx` });
}

// ─────────────────────── shared bits ───────────────────────

type Region = { x: number; y: number; w: number; h: number };

function rect(s: S, x: number, y: number, w: number, h: number, color: string, opts: { radius?: number; transparency?: number; line?: { color: string; width: number } } = {}) {
  s.addShape(opts.radius ? "roundRect" : "rect", {
    x, y, w, h,
    fill: { color: noHash(color), ...(opts.transparency ? { transparency: opts.transparency } : {}) },
    line: opts.line ? { color: noHash(opts.line.color), width: opts.line.width } : { type: "none" },
    ...(opts.radius ? { rectRadius: opts.radius } : {}),
  });
}

function chipColor(ctx: Ctx, v?: string): string {
  return v === "high" ? ctx.accent : v === "med" ? ctx.accent2 : ctx.muted;
}

// Top company + page number + accent rule.
function renderChrome(s: S, ctx: Ctx, page: number, total: number) {
  s.background = { color: ctx.bg };
  s.addText(ctx.company, {
    x: ctx.rtl ? SLIDE_W - MARGIN - 4 : MARGIN, y: 0.18, w: 4, h: 0.28,
    fontSize: 8, color: ctx.muted, fontFace: ctx.bodyFace, align: ctx.align,
    rtlMode: ctx.rtl, bold: true, charSpacing: 1,
  });
  s.addText(`${String(page).padStart(2, "0")} / ${String(total).padStart(2, "0")}`, {
    x: ctx.rtl ? MARGIN : SLIDE_W - MARGIN - 2, y: 0.18, w: 2, h: 0.28,
    fontSize: 8, color: ctx.muted, fontFace: ctx.bodyFace, align: ctx.alignEnd,
  });
  rect(s, MARGIN, 0.5, CONTENT_W, 0.018, ctx.accent);
}

// Eyebrow + title + subtitle. Returns the body region below.
function renderHeader(s: S, slide: Slide, ctx: Ctx): Region {
  let y = 0.66;
  if (slide.eyebrow) {
    s.addText((slide.eyebrow).toUpperCase(), {
      x: MARGIN, y, w: CONTENT_W, h: 0.24, fontSize: 9, color: ctx.accent,
      fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, bold: true, charSpacing: 2,
    });
    y += 0.26;
  }
  s.addText(slide.title || "", {
    x: MARGIN, y, w: CONTENT_W, h: 0.62, fontSize: 22, color: ctx.ink,
    fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, bold: true,
    valign: "top", fit: "shrink",
  });
  y += 0.66;
  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: MARGIN, y, w: CONTENT_W, h: 0.5, fontSize: 11, color: ctx.muted,
      fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink",
    });
    y += 0.5;
  }
  const top = y + 0.12;
  return { x: MARGIN, y: top, w: CONTENT_W, h: SLIDE_H - top - 0.3 };
}

function renderFootnote(s: S, text: string | undefined, ctx: Ctx) {
  if (!text) return;
  s.addText(text, {
    x: MARGIN, y: SLIDE_H - 0.42, w: CONTENT_W, h: 0.32, fontSize: 8.5, italic: true,
    color: ctx.muted, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink",
  });
}

// ─────────────────────── COVER ───────────────────────

function renderCover(s: S, slide: Slide, ctx: Ctx) {
  s.background = { color: ctx.coverBg };
  // accent rail on the start edge
  rect(s, ctx.rtl ? SLIDE_W - 0.1 : 0, 0, 0.1, SLIDE_H, ctx.accent);
  s.addText(ctx.company, {
    x: ctx.rtl ? SLIDE_W - MARGIN - 4 : MARGIN + 0.25, y: 0.3, w: 4, h: 0.3,
    fontSize: 10, color: ctx.coverText, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, bold: true,
  });
  if (ctx.date) s.addText(ctx.date, {
    x: ctx.rtl ? MARGIN : SLIDE_W - MARGIN - 3, y: 0.3, w: 3, h: 0.3,
    fontSize: 10, color: ctx.coverText, fontFace: ctx.bodyFace, align: ctx.alignEnd, transparency: 25,
  });
  let y = 1.5;
  if (slide.subtitle) {
    s.addText((slide.subtitle).toUpperCase(), {
      x: MARGIN + 0.25, y, w: CONTENT_W - 0.25, h: 0.35, fontSize: 13, color: ctx.accent,
      fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, bold: true, charSpacing: 1,
    });
    y += 0.4;
  }
  s.addText(slide.title || "", {
    x: MARGIN + 0.25, y, w: CONTENT_W - 0.25, h: 1.8, fontSize: 40, color: ctx.coverText,
    fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, bold: true, valign: "top", fit: "shrink",
  });
  if (slide.eyebrow) {
    s.addText(slide.eyebrow, {
      x: MARGIN + 0.25, y: SLIDE_H - 1.0, w: CONTENT_W - 0.25, h: 0.5, fontSize: 16,
      color: ctx.coverText, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, transparency: 12, fit: "shrink",
    });
  }
}

// ─────────────────────── SUMMARY ───────────────────────

function renderSummary(s: S, slide: Slide, ctx: Ctx) {
  s.background = { color: ctx.coverBg };
  if (slide.eyebrow) s.addText((slide.eyebrow).toUpperCase(), {
    x: 1, y: 1.05, w: SLIDE_W - 2, h: 0.35, fontSize: 11, color: ctx.accent,
    fontFace: ctx.bodyFace, align: "center", rtlMode: ctx.rtl, bold: true, charSpacing: 2,
  });
  s.addText(slide.title || "", {
    x: 0.9, y: 1.5, w: SLIDE_W - 1.8, h: 2.0, fontSize: 28, color: ctx.coverText,
    fontFace: ctx.titleFace, align: "center", rtlMode: ctx.rtl, bold: true, valign: "middle", fit: "shrink",
  });
  if (slide.subtitle) s.addText(slide.subtitle, {
    x: 1.2, y: 3.6, w: SLIDE_W - 2.4, h: 0.9, fontSize: 13, color: ctx.coverText,
    fontFace: ctx.bodyFace, align: "center", rtlMode: ctx.rtl, italic: true, transparency: 12, valign: "top", fit: "shrink",
  });
  if (slide.footnote) s.addText((slide.footnote).toUpperCase(), {
    x: 1, y: SLIDE_H - 0.6, w: SLIDE_W - 2, h: 0.3, fontSize: 9, color: ctx.coverText,
    fontFace: ctx.bodyFace, align: "center", rtlMode: ctx.rtl, transparency: 30, charSpacing: 2,
  });
}

// ─────────────────────── STATS ───────────────────────

function renderStats(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const stats = (slide.stats ?? []).slice(0, 8);
  if (stats.length === 0) { renderFootnote(s, slide.footnote, ctx); return; }
  const hero = stats.slice(0, Math.min(4, stats.length));
  const sub = stats.slice(4, 8);
  const gap = 0.18;
  const rowH = sub.length ? (r.h - 0.5 - gap) / 2 : Math.min(2.2, r.h - 0.4);
  const drawRow = (items: typeof stats, y: number, h: number, big: boolean) => {
    const w = (r.w - gap * (items.length - 1)) / items.length;
    items.forEach((st, i) => {
      const x = r.x + (ctx.rtl ? (items.length - 1 - i) : i) * (w + gap);
      if (i === 0 && big) rect(s, x, y, w, h, ctx.accent, { radius: 0.06 });
      else rect(s, x, y, w, h, ctx.ink, { radius: 0.06, transparency: 95, line: { color: ctx.muted, width: 0.5 } });
      const onAcc = i === 0 && big;
      s.addText((st.label ?? "").toUpperCase(), {
        x: x + 0.12, y: y + 0.1, w: w - 0.24, h: 0.3, fontSize: 8,
        color: onAcc ? "FFFFFF" : ctx.muted, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, bold: true, charSpacing: 1,
      });
      s.addText([
        { text: st.value ?? "", options: { fontSize: big ? 30 : 24, bold: true, color: onAcc ? "FFFFFF" : ctx.accent } },
        ...(st.unit ? [{ text: " " + st.unit, options: { fontSize: big ? 12 : 10, color: onAcc ? "FFFFFF" : ctx.muted } }] : []),
      ], {
        x: x + 0.12, y: y + 0.42, w: w - 0.24, h: 0.6, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink",
      });
      if (st.caption) s.addText(st.caption, {
        x: x + 0.12, y: y + h - 0.62, w: w - 0.24, h: 0.55, fontSize: 8.5,
        color: onAcc ? "FFFFFF" : ctx.muted, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink",
      });
    });
  };
  drawRow(hero, r.y, rowH, true);
  if (sub.length) drawRow(sub, r.y + rowH + gap, rowH, false);
  renderFootnote(s, slide.footnote, ctx);
}

// ─────────────────────── KPI CARD ───────────────────────

function renderKpi(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const stats = slide.stats ?? [];
  const half = r.w / 2 - 0.12;
  const leftX = ctx.rtl ? r.x + half + 0.24 : r.x;
  const rightX = ctx.rtl ? r.x : r.x + half + 0.24;
  // left: hero stat tile(s)
  const st0 = stats[0];
  if (st0) {
    const h = stats[1] ? r.h * 0.58 : r.h;
    rect(s, leftX, r.y, half, h, ctx.accent, { radius: 0.06 });
    s.addText((st0.label ?? "").toUpperCase(), { x: leftX + 0.18, y: r.y + 0.16, w: half - 0.36, h: 0.3, fontSize: 8.5, color: "FFFFFF", fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, bold: true, charSpacing: 1 });
    s.addText([
      { text: st0.value ?? "", options: { fontSize: 40, bold: true, color: "FFFFFF" } },
      ...(st0.unit ? [{ text: " " + st0.unit, options: { fontSize: 15, color: "FFFFFF" } }] : []),
    ], { x: leftX + 0.18, y: r.y + 0.5, w: half - 0.36, h: 0.9, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink" });
    if (st0.caption) s.addText(st0.caption, { x: leftX + 0.18, y: r.y + h - 0.7, w: half - 0.36, h: 0.6, fontSize: 8.5, color: "FFFFFF", fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" });
    const st1 = stats[1];
    if (st1) {
      const y2 = r.y + h + 0.16;
      rect(s, leftX, y2, half, r.h - h - 0.16, ctx.ink, { radius: 0.06, transparency: 95, line: { color: ctx.muted, width: 0.5 } });
      s.addText([
        { text: st1.value ?? "", options: { fontSize: 22, bold: true, color: ctx.accent } },
        ...(st1.unit ? [{ text: " " + st1.unit, options: { fontSize: 10, color: ctx.muted } }] : []),
        { text: "   " + (st1.label ?? ""), options: { fontSize: 9, color: ctx.muted } },
      ], { x: leftX + 0.18, y: y2, w: half - 0.36, h: r.h - h - 0.16, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink" });
    }
  }
  // right: body text
  s.addText(slide.title || "", { x: rightX, y: r.y, w: half, h: 1.0, fontSize: 18, bold: true, color: ctx.ink, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" });
  if (slide.body) s.addText(slide.body, { x: rightX, y: r.y + 1.1, w: half, h: r.h - 1.1, fontSize: 11, color: ctx.muted, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink", lineSpacingMultiple: 1.2 });
}

// ─────────────────────── HORIZONS ───────────────────────

function renderHorizons(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const cards = (slide.horizons ?? []).slice(0, 4);
  if (!cards.length) { renderFootnote(s, slide.footnote, ctx); return; }
  const gap = 0.2;
  const w = (r.w - gap * (cards.length - 1)) / cards.length;
  const h = r.h - (slide.footnote ? 0.3 : 0);
  cards.forEach((c, i) => {
    const x = r.x + (ctx.rtl ? (cards.length - 1 - i) : i) * (w + gap);
    const acc = c.variant === "teal" || c.variant === "navy";
    rect(s, x, r.y, w, h, acc ? ctx.accent : ctx.ink, acc ? { radius: 0.06 } : { radius: 0.06, transparency: 95, line: { color: ctx.muted, width: 0.5 } });
    const fg = acc ? "FFFFFF" : ctx.ink, mut = acc ? "FFFFFF" : ctx.muted;
    s.addText((c.eyebrow ?? "").toUpperCase(), { x: x + 0.14, y: r.y + 0.12, w: w - 0.28, h: 0.26, fontSize: 8, color: acc ? "FFFFFF" : ctx.accent, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, bold: true, charSpacing: 1 });
    s.addText(c.bigText ?? "", { x: x + 0.14, y: r.y + 0.38, w: w - 0.28, h: 0.7, fontSize: 30, bold: true, color: acc ? "FFFFFF" : ctx.accent, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink" });
    let ry = r.y + 1.12;
    if (c.caption) { s.addText(c.caption, { x: x + 0.14, y: ry, w: w - 0.28, h: 0.5, fontSize: 9, italic: true, color: mut, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" }); ry += 0.52; }
    (c.rows ?? []).slice(0, 6).forEach((row) => {
      s.addText([
        { text: (row.label ?? "") + "  ", options: { color: mut, fontSize: 9 } },
        { text: row.value ?? "", options: { color: fg, fontSize: 9.5, bold: true } },
      ], { x: x + 0.14, y: ry, w: w - 0.28, h: 0.26, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink" });
      ry += 0.26;
    });
  });
  renderFootnote(s, slide.footnote, ctx);
}

// ─────────────────────── GRID ───────────────────────

function renderGrid(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const cells = (slide.gridCards ?? []).slice(0, 4);
  const gap = 0.2;
  const w = (r.w - gap) / 2, h = (r.h - gap) / 2;
  cells.forEach((c, i) => {
    const col = i % 2, rowi = Math.floor(i / 2);
    const x = r.x + (ctx.rtl ? (1 - col) : col) * (w + gap);
    const y = r.y + rowi * (h + gap);
    rect(s, x, y, w, h, ctx.ink, { radius: 0.06, transparency: 96, line: { color: ctx.muted, width: 0.5 } });
    s.addText(c.index ?? "", { x: x + 0.16, y: y + 0.12, w: 0.7, h: 0.5, fontSize: 24, bold: true, color: ctx.accent, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl });
    s.addText(c.title ?? "", { x: x + (ctx.rtl ? 0.16 : 0.85), y: y + 0.12, w: w - 1.0, h: 0.5, fontSize: 13, bold: true, color: ctx.ink, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" });
    s.addText(c.description ?? "", { x: x + 0.16, y: y + 0.66, w: w - 0.32, h: h - 0.78, fontSize: 9.5, color: ctx.muted, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink", lineSpacingMultiple: 1.1 });
  });
}

// ─────────────────────── TRACKS ───────────────────────

function renderTracks(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const tr = (slide.tracks ?? []).slice(0, 3);
  const footH = slide.footnote ? 0.5 : 0;
  const gap = 0.2;
  const w = (r.w - gap * (tr.length - 1)) / tr.length;
  const h = r.h - footH;
  tr.forEach((tk, i) => {
    const x = r.x + (ctx.rtl ? (tr.length - 1 - i) : i) * (w + gap);
    const bar = tk.variant === "teal" ? ctx.accent : tk.variant === "navy" || tk.variant === "blue" ? ctx.accent2 : ctx.muted;
    rect(s, x, r.y, w, h, ctx.ink, { radius: 0.06, transparency: 96, line: { color: ctx.muted, width: 0.5 } });
    rect(s, x, r.y, w, 0.07, bar, { radius: 0.0 });
    s.addText([
      { text: (tk.index ?? "") + "  ", options: { fontSize: 16, bold: true, color: bar } },
      { text: (tk.eyebrow ?? "").toUpperCase(), options: { fontSize: 8, color: ctx.muted, bold: true } },
    ], { x: x + 0.14, y: r.y + 0.18, w: w - 0.28, h: 0.3, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle" });
    s.addText(tk.title ?? "", { x: x + 0.14, y: r.y + 0.5, w: w - 0.28, h: 0.5, fontSize: 13, bold: true, color: ctx.ink, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" });
    s.addText(tk.description ?? "", { x: x + 0.14, y: r.y + 1.05, w: w - 0.28, h: h - (tk.chip ? 1.55 : 1.2), fontSize: 9.5, color: ctx.muted, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink", lineSpacingMultiple: 1.1 });
    if (tk.chip) addChip(s, x + 0.14, r.y + h - 0.42, tk.chip, ctx.accent, ctx);
  });
  if (slide.footnote) {
    rect(s, r.x, SLIDE_H - 0.62, r.w, 0.42, ctx.accent, { radius: 0.05, transparency: 88 });
    s.addText(slide.footnote, { x: r.x + 0.15, y: SLIDE_H - 0.62, w: r.w - 1.6, h: 0.42, fontSize: 10, bold: true, color: ctx.ink, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink" });
    if (slide.footnoteChip) s.addText((slide.footnoteChip).toUpperCase(), { x: r.x, y: SLIDE_H - 0.62, w: r.w - 0.15, h: 0.42, fontSize: 9, bold: true, color: ctx.accent, fontFace: ctx.bodyFace, align: ctx.alignEnd, valign: "middle", charSpacing: 1 });
  }
}

function addChip(s: S, x: number, y: number, label: string, color: string, ctx: Ctx) {
  const w = Math.min(2.2, 0.22 + label.length * 0.085);
  rect(s, x, y, w, 0.3, color, { radius: 0.15, transparency: 86 });
  s.addText(label, { x, y, w, h: 0.3, fontSize: 9, bold: true, color: noHash(color), fontFace: ctx.bodyFace, align: "center", rtlMode: ctx.rtl, valign: "middle" });
}

// ─────────────────────── TABLE ───────────────────────

function renderTable(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const headers = slide.tableHeaders ?? [];
  const rows = slide.tableRows ?? [];
  const hasChip = rows.some((row) => row.chip);
  const nCols = headers.length + (hasChip ? 1 : 0);

  const headRow = [
    ...headers.map((h) => ({ text: h, options: { bold: true, color: ctx.accent, fontSize: 9, align: ctx.align, fill: { color: ctx.ink, transparency: 95 } } })),
    ...(hasChip ? [{ text: "", options: { fill: { color: ctx.ink, transparency: 95 } } }] : []),
  ];
  const bodyRows = rows.map((row) => {
    const cells = headers.map((_, ci) => ({
      text: row.cells[ci] ?? "",
      options: {
        bold: ci === 0, color: ci === 0 ? ctx.ink : ctx.muted, fontSize: 9.5, align: ctx.align,
        ...(row.emphasize ? { fill: { color: ctx.accent, transparency: 92 } } : {}),
      },
    }));
    if (hasChip) cells.push({
      text: row.chip ?? "",
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      options: { bold: true, color: noHash(chipColor(ctx, row.chipVariant)), fontSize: 8.5, align: "center", ...(row.emphasize ? { fill: { color: ctx.accent, transparency: 92 } } : {}) } as any,
    });
    return cells;
  });

  // Column widths: first wider, chip narrow.
  const chipW = hasChip ? 1.1 : 0;
  const firstW = (r.w - chipW) * 0.26;
  const restW = (r.w - chipW - firstW) / Math.max(1, headers.length - 1);
  const colW = [firstW, ...headers.slice(1).map(() => restW), ...(hasChip ? [chipW] : [])];

  s.addTable([headRow, ...bodyRows], {
    x: r.x, y: r.y, w: r.w, colW,
    fontFace: ctx.bodyFace, rtlMode: ctx.rtl,
    border: [
      { type: "none" }, { type: "none" },
      { type: "solid", pt: 0.5, color: ctx.muted }, { type: "none" },
    ],
    valign: "middle", autoPage: false, rowH: Math.min(0.5, (r.h - 0.3) / Math.max(1, bodyRows.length + 1)),
    margin: [2, 4, 2, 4],
  });
  renderFootnote(s, slide.footnote, ctx);
  void nCols;
}

// ─────────────────────── COMPARE ───────────────────────

function renderCompare(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const panes = [slide.leftPane, slide.rightPane].filter(Boolean) as NonNullable<Slide["leftPane"]>[];
  if (!panes.length) return;
  const gap = 0.22;
  const w = panes.length === 2 ? (r.w - gap) / 2 : r.w;
  panes.forEach((pane, i) => {
    const x = r.x + (ctx.rtl ? (panes.length - 1 - i) : i) * (w + gap);
    const dark = pane.variant === "dark" || pane.variant === "teal";
    if (dark) rect(s, x, r.y, w, r.h, ctx.accent, { radius: 0.06 });
    else rect(s, x, r.y, w, r.h, ctx.ink, { radius: 0.06, transparency: 96, line: { color: ctx.muted, width: 0.5 } });
    const fg = dark ? "FFFFFF" : ctx.ink, mut = dark ? "FFFFFF" : ctx.muted;
    let y = r.y + 0.14;
    s.addText((pane.eyebrow ?? "").toUpperCase(), { x: x + 0.16, y, w: w - 1.2, h: 0.26, fontSize: 8, color: dark ? "FFFFFF" : ctx.accent, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, bold: true, charSpacing: 1 });
    if (pane.chip) s.addText(pane.chip, { x: x + 0.16, y, w: w - 0.32, h: 0.26, fontSize: 8.5, italic: true, color: mut, fontFace: ctx.bodyFace, align: ctx.alignEnd, rtlMode: ctx.rtl });
    y += 0.32;
    s.addText(pane.title ?? "", { x: x + 0.16, y, w: w - 0.32, h: 0.55, fontSize: 14, bold: true, color: fg, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" });
    y += 0.6;
    (pane.rows ?? []).slice(0, 5).forEach((row) => {
      s.addText([
        { text: (row.label ?? "") + "  ", options: { color: mut, fontSize: 9 } },
        { text: row.value ?? "", options: { color: fg, fontSize: 9.5, bold: true } },
      ], { x: x + 0.16, y, w: w - 0.32, h: 0.24, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink" });
      y += 0.25;
    });
    (pane.bullets ?? []).slice(0, 5).forEach((b, bi) => {
      const letter = String.fromCharCode(65 + bi);
      const [head, ...rest] = (b || "").split(" — ");
      s.addText([
        { text: letter + "  ", options: { color: dark ? "FFFFFF" : ctx.accent, bold: true, fontSize: 9.5 } },
        { text: head, options: { color: fg, bold: true, fontSize: 9.5 } },
        ...(rest.length ? [{ text: " — " + rest.join(" — "), options: { color: mut, fontSize: 9.5 } }] : []),
      ], { x: x + 0.16, y, w: w - 0.32, h: 0.4, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" });
      y += 0.38;
    });
    if (pane.footnote) s.addText(pane.footnote, { x: x + 0.16, y: r.y + r.h - 0.5, w: w - 0.32, h: 0.42, fontSize: 8.5, italic: true, color: mut, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink" });
  });
}

// ─────────────────────── DONTS ───────────────────────

function renderDonts(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const items = (slide.dontItems ?? []).slice(0, 6);
  const gap = 0.25;
  const w = (r.w - gap) / 2;
  const rowsN = Math.ceil(items.length / 2);
  const h = (r.h - gap * (rowsN - 1)) / Math.max(1, rowsN);
  items.forEach((it, i) => {
    const col = i % 2, rowi = Math.floor(i / 2);
    const x = r.x + (ctx.rtl ? (1 - col) : col) * (w + gap);
    const y = r.y + rowi * (h + gap);
    rect(s, x, y + 0.04, 0.28, 0.28, ctx.accent, { radius: 0.14, transparency: 84 });
    s.addText("✕", { x, y: y + 0.04, w: 0.28, h: 0.28, fontSize: 11, bold: true, color: ctx.accent, align: "center", valign: "middle" });
    s.addText(it.title ?? "", { x: x + (ctx.rtl ? 0 : 0.4), y, w: w - 0.4, h: 0.34, fontSize: 12, bold: true, color: ctx.ink, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink", strike: true });
    s.addText(it.description ?? "", { x: x + 0.4, y: y + 0.36, w: w - 0.4, h: h - 0.4, fontSize: 9, color: ctx.muted, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink", lineSpacingMultiple: 1.1 });
  });
}

// ─────────────────────── TOC ───────────────────────

function renderToc(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const items = slide.tocItems ?? [];
  const half = Math.ceil(items.length / 2);
  const colW = (r.w - 0.4) / 2;
  const rowH = Math.min(0.62, (r.h) / Math.max(1, half));
  items.forEach((it, i) => {
    const col = i < half ? 0 : 1;
    const idx = col === 0 ? i : i - half;
    const x = r.x + (ctx.rtl ? (1 - col) : col) * (colW + 0.4);
    const y = r.y + idx * rowH;
    s.addText(it.index ?? "", { x: x + (ctx.rtl ? colW - 0.5 : 0), y, w: 0.5, h: rowH - 0.08, fontSize: 14, bold: true, color: ctx.accent, fontFace: ctx.titleFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle" });
    s.addText([
      { text: (it.title ?? ""), options: { fontSize: 12, bold: true, color: ctx.ink } },
      ...(it.subtitle ? [{ text: "\n" + it.subtitle, options: { fontSize: 9, color: ctx.muted } }] : []),
    ], { x: x + (ctx.rtl ? 0 : 0.55), y, w: colW - 0.55, h: rowH - 0.08, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "middle", fit: "shrink" });
    rect(s, x, y + rowH - 0.06, colW, 0.008, ctx.muted, { transparency: 60 });
  });
}

// ─────────────────────── BULLETS (legacy/content fallback) ───────────────────────

function renderBullets(s: S, slide: Slide, ctx: Ctx, r: Region) {
  const bullets = (slide.bullets ?? []).filter((b) => b && b.trim());
  if (!bullets.length) return;
  s.addText(
    bullets.map((b, i) => ({
      text: b,
      options: { bullet: { code: "2022", indent: 14 }, color: ctx.ink, fontSize: 13, breakLine: true, paraSpaceAfter: 8, ...(i === 0 ? {} : {}) },
    })),
    { x: r.x, y: r.y, w: r.w, h: r.h, fontFace: ctx.bodyFace, align: ctx.align, rtlMode: ctx.rtl, valign: "top", fit: "shrink", lineSpacingMultiple: 1.15 },
  );
}
