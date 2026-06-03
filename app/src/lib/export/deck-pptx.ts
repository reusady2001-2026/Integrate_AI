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

// PPTX uses inches; 16:9 = 10" × 5.625"
const SLIDE_W = 10;
const SLIDE_H = 5.625;
const MARGIN = 0.55;

type Ctx = {
  theme: DeckTheme;
  palette: Palette;
  font: FontPair;
  titleScale: number;
  bodyScale: number;
  accent: string;
  rtl: boolean;
  align: "left" | "right" | "center";
  company: string;
  date: string;
};

export async function renderDeckPptx(doc: StrategyDeck, lang: Lang): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const prs = new PptxGenJS();
  prs.layout = "LAYOUT_16x9";
  prs.author = doc.company || "Integrate AI";
  prs.title = doc.planTitle || doc.company || "Strategy Deck";

  const theme = DECK_THEMES.find((t) => t.id === doc.theme) ?? DECK_THEMES[0];
  const paletteId = (doc.paletteOverride || theme.palette) as keyof typeof PALETTES;
  const palette = PALETTES[paletteId];
  const baseFont = FONT_PAIRS[theme.font];
  const font: FontPair = { ...baseFont };
  const fmt = doc.formatting;
  const accent = fmt.accentColor || palette.accent;
  const rtl = lang === "he";

  const ctx: Ctx = {
    theme,
    palette: { ...palette, accent },
    font,
    titleScale: (theme.titleScale ?? 1) * (fmt.titleScale ?? 1),
    bodyScale: (theme.bodyScale ?? 1) * (fmt.bodyScale ?? 1),
    accent,
    rtl,
    align: rtl ? "right" : "left",
    company: doc.company,
    date: doc.date,
  };

  for (const slide of doc.slides) {
    const s = prs.addSlide();
    if (slide.layout === "cover") renderCoverPptx(s, slide, ctx);
    else if (slide.layout === "section") renderSectionPptx(s, slide, ctx);
    else if (slide.layout === "quote") renderQuotePptx(s, slide, ctx);
    else renderContentPptx(s, slide, ctx);
  }

  await prs.writeFile({ fileName: `${(doc.company || "deck").replace(/\s+/g, "_")}.pptx` });
}

// ─────────────────────── helpers ───────────────────────

// We accept any object from pptxgenjs's addSlide() and call methods loosely —
// typing the surface strictly fights pptxgenjs's complex generated types.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PptxSlide = any;

function bgFor(layout: Slide["layout"], ctx: Ctx): string {
  const isCoverOrSection = layout === "cover" || layout === "section";
  return noHash(isCoverOrSection ? ctx.palette.coverBg : ctx.palette.bg);
}

function titleColor(layout: Slide["layout"], ctx: Ctx): string {
  const isCoverOrSection = layout === "cover" || layout === "section";
  return noHash(isCoverOrSection ? ctx.palette.coverText : ctx.palette.text);
}

function bodyColor(layout: Slide["layout"], ctx: Ctx): string {
  const isCoverOrSection = layout === "cover" || layout === "section";
  return noHash(isCoverOrSection ? ctx.palette.coverText : ctx.palette.text);
}

function addBar(s: PptxSlide, x: number, y: number, w: number, h: number, color: string) {
  s.addShape("rect", { x, y, w, h, fill: { color: noHash(color) }, line: { color: noHash(color), width: 0 } });
}

// ─────────────────────── COVER ───────────────────────

function renderCoverPptx(s: PptxSlide, slide: Slide, ctx: Ctx) {
  s.background = { color: bgFor("cover", ctx) };
  const cover = ctx.theme.cover;
  const tColor = titleColor("cover", ctx);

  // Add stylistic decoration based on cover variant
  switch (cover) {
    case "left-bar-strong": {
      addBar(s, ctx.rtl ? SLIDE_W - 0.14 : 0, 0, 0.14, SLIDE_H, ctx.accent);
      break;
    }
    case "split-half": {
      addBar(s, ctx.rtl ? SLIDE_W * 0.56 : 0, 0, SLIDE_W * 0.44, SLIDE_H, ctx.accent);
      break;
    }
    case "framed-thin": {
      // 4 thin bars as frame
      addBar(s, 0.24, 0.24, SLIDE_W - 0.48, 0.025, ctx.accent);
      addBar(s, 0.24, SLIDE_H - 0.265, SLIDE_W - 0.48, 0.025, ctx.accent);
      addBar(s, 0.24, 0.24, 0.025, SLIDE_H - 0.48, ctx.accent);
      addBar(s, SLIDE_W - 0.265, 0.24, 0.025, SLIDE_H - 0.48, ctx.accent);
      break;
    }
    case "horizon-line": {
      addBar(s, MARGIN, 1.0, SLIDE_W - MARGIN * 2, 0.012, ctx.accent);
      addBar(s, MARGIN, SLIDE_H - 1.0, SLIDE_W - MARGIN * 2, 0.008, ctx.accent);
      break;
    }
    case "duotone-block": {
      addBar(s, 0, SLIDE_H * 0.55, SLIDE_W, SLIDE_H * 0.45, ctx.accent);
      break;
    }
    case "stripes-side": {
      addBar(s, ctx.rtl ? SLIDE_W - 0.07 : 0, 0, 0.07, SLIDE_H, ctx.accent);
      addBar(s, ctx.rtl ? SLIDE_W - 0.19 : 0.16, 0, 0.035, SLIDE_H, ctx.accent);
      addBar(s, ctx.rtl ? SLIDE_W - 0.28 : 0.26, 0, 0.015, SLIDE_H, ctx.accent);
      break;
    }
    case "circle-accent": {
      s.addShape("ellipse", {
        x: ctx.rtl ? -1.8 : SLIDE_W - 3.6, y: -1.8,
        w: 5.4, h: 5.4,
        fill: { color: noHash(ctx.accent), transparency: 75 },
        line: { color: noHash(ctx.accent), width: 0 },
      });
      break;
    }
    case "label-strip": {
      addBar(s, MARGIN, 1.0, SLIDE_W - MARGIN * 2, 0.33, ctx.accent);
      s.addText(ctx.company || "", {
        x: MARGIN + 0.16, y: 1.0, w: SLIDE_W - MARGIN * 2 - 0.32, h: 0.33,
        fontSize: 12, color: "FFFFFF", bold: true, align: ctx.align,
        rtlMode: ctx.rtl, charSpacing: 80, fontFace: ctx.font.pptxBody,
      });
      break;
    }
    case "geometric-corner": {
      // Triangle in corner — approximate with a right-triangle shape
      s.addShape("rtTriangle", {
        x: ctx.rtl ? 0 : SLIDE_W - 2.5, y: 0,
        w: 2.5, h: 2.5,
        flipH: ctx.rtl, flipV: false,
        fill: { color: noHash(ctx.accent) },
        line: { color: noHash(ctx.accent), width: 0 },
      });
      break;
    }
    case "underline-title": break; // handled inline below
    default: break;
  }

  // Company top
  if (ctx.company && cover !== "label-strip" && cover !== "card-center") {
    s.addText(ctx.company, {
      x: MARGIN, y: 0.38, w: SLIDE_W - MARGIN * 2, h: 0.35,
      fontSize: 11, color: tColor, transparency: 45, align: ctx.align,
      rtlMode: ctx.rtl, charSpacing: 40, fontFace: ctx.font.pptxBody,
    });
  }

  // Title block — varies by layout
  if (cover === "centered-bold") {
    s.addText(slide.title || "", {
      x: 0.6, y: 1.7, w: SLIDE_W - 1.2, h: 1.8,
      fontSize: 44 * ctx.titleScale, bold: true, color: tColor, align: "center",
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.1, fontFace: ctx.font.pptxDisplay,
    });
    // Divider line
    addBar(s, SLIDE_W / 2 - 0.4, 3.5, 0.8, 0.04, ctx.accent);
    s.addText(slide.subtitle || "", {
      x: 0.6, y: 3.7, w: SLIDE_W - 1.2, h: 0.7,
      fontSize: 18 * ctx.bodyScale, color: tColor, align: "center",
      rtlMode: ctx.rtl, transparency: 18, fontFace: ctx.font.pptxBody,
    });
  } else if (cover === "split-half") {
    s.addText(slide.title || "", {
      x: ctx.rtl ? SLIDE_W * 0.6 : 0.5, y: 2.0, w: SLIDE_W * 0.38, h: 1.6,
      fontSize: 36 * ctx.titleScale, bold: true, color: "FFFFFF", align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.1, fontFace: ctx.font.pptxDisplay,
    });
    s.addText(slide.subtitle || "", {
      x: ctx.rtl ? 0.5 : SLIDE_W * 0.5, y: 2.2, w: SLIDE_W * 0.45, h: 1.4,
      fontSize: 18 * ctx.bodyScale, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, transparency: 8, fontFace: ctx.font.pptxBody,
    });
  } else if (cover === "duotone-block") {
    s.addText(slide.title || "", {
      x: MARGIN, y: 1.7, w: SLIDE_W - MARGIN * 2, h: 1.5,
      fontSize: 40 * ctx.titleScale, bold: true, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.1, fontFace: ctx.font.pptxDisplay,
    });
    s.addText(slide.subtitle || "", {
      x: MARGIN, y: 3.5, w: SLIDE_W - MARGIN * 2, h: 1.2,
      fontSize: 18 * ctx.bodyScale, color: "FFFFFF", align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.3, fontFace: ctx.font.pptxBody,
    });
  } else if (cover === "framed-thin" || cover === "card-center") {
    s.addText(slide.title || "", {
      x: 0.9, y: 2.0, w: SLIDE_W - 1.8, h: 1.6,
      fontSize: 36 * ctx.titleScale, bold: true, color: tColor, align: "center",
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.1, fontFace: ctx.font.pptxDisplay,
    });
    s.addText(slide.subtitle || "", {
      x: 0.9, y: 3.7, w: SLIDE_W - 1.8, h: 0.8,
      fontSize: 18 * ctx.bodyScale, color: tColor, align: "center",
      rtlMode: ctx.rtl, transparency: 18, fontFace: ctx.font.pptxBody,
    });
  } else if (cover === "minimal-bottom") {
    addBar(s, MARGIN, SLIDE_H - 1.6, 0.42, 0.02, ctx.accent);
    s.addText(slide.title || "", {
      x: MARGIN, y: SLIDE_H - 1.45, w: SLIDE_W - MARGIN * 2, h: 0.85,
      fontSize: 32 * ctx.titleScale, bold: true, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.1, fontFace: ctx.font.pptxDisplay,
    });
    s.addText(slide.subtitle || "", {
      x: MARGIN, y: SLIDE_H - 0.6, w: SLIDE_W - MARGIN * 2, h: 0.4,
      fontSize: 14 * ctx.bodyScale, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, transparency: 30, fontFace: ctx.font.pptxBody,
    });
  } else if (cover === "underline-title") {
    s.addText(slide.title || "", {
      x: MARGIN, y: 1.7, w: SLIDE_W - MARGIN * 2, h: 1.6,
      fontSize: 40 * ctx.titleScale, bold: true, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.1, fontFace: ctx.font.pptxDisplay,
      underline: { style: "thick", color: noHash(ctx.accent) },
    });
    s.addText(slide.subtitle || "", {
      x: MARGIN, y: 3.5, w: SLIDE_W - MARGIN * 2, h: 1.0,
      fontSize: 18 * ctx.bodyScale, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, transparency: 18, fontFace: ctx.font.pptxBody,
    });
  } else {
    // Default: left-aligned title at vertical center
    const indent = (cover === "stripes-side" || cover === "left-bar-strong") ? 0.85 : MARGIN;
    s.addText(slide.title || "", {
      x: indent, y: 1.7, w: SLIDE_W - indent - MARGIN, h: 1.7,
      fontSize: 40 * ctx.titleScale, bold: true, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.1, fontFace: ctx.font.pptxDisplay,
    });
    s.addText(slide.subtitle || "", {
      x: indent, y: 3.55, w: SLIDE_W - indent - MARGIN, h: 1.0,
      fontSize: 18 * ctx.bodyScale, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, transparency: 18, fontFace: ctx.font.pptxBody,
    });
  }

  // Date footer
  if (ctx.date) {
    s.addText(ctx.date, {
      x: MARGIN, y: SLIDE_H - 0.4, w: SLIDE_W - MARGIN * 2, h: 0.3,
      fontSize: 10, color: tColor, transparency: 45, align: ctx.align,
      rtlMode: ctx.rtl, fontFace: ctx.font.pptxBody,
    });
  }
}

// ─────────────────────── SECTION ───────────────────────

function renderSectionPptx(s: PptxSlide, slide: Slide, ctx: Ctx) {
  s.background = { color: bgFor("section", ctx) };
  const tColor = titleColor("section", ctx);

  addBar(s, 0, 0, SLIDE_W, 0.08, ctx.accent);
  addBar(s, 0, SLIDE_H - 0.08, SLIDE_W, 0.08, ctx.accent);

  if (ctx.company) {
    s.addText(ctx.company, {
      x: 0.8, y: 1.5, w: SLIDE_W - 1.6, h: 0.4,
      fontSize: 12, color: noHash(ctx.accent), bold: true, align: "center",
      rtlMode: ctx.rtl, charSpacing: 100, fontFace: ctx.font.pptxBody,
    });
  }

  s.addText(slide.title || "", {
    x: 0.8, y: 2.1, w: SLIDE_W - 1.6, h: 1.6,
    fontSize: 42 * ctx.titleScale, bold: true, color: tColor, align: "center",
    rtlMode: ctx.rtl, lineSpacingMultiple: 1.15, fontFace: ctx.font.pptxDisplay,
  });

  if (slide.subtitle) {
    s.addText(slide.subtitle, {
      x: 0.8, y: 3.85, w: SLIDE_W - 1.6, h: 0.8,
      fontSize: 18 * ctx.bodyScale, color: tColor, align: "center",
      rtlMode: ctx.rtl, transparency: 22, fontFace: ctx.font.pptxBody,
    });
  }
}

// ─────────────────────── QUOTE ───────────────────────

function renderQuotePptx(s: PptxSlide, slide: Slide, ctx: Ctx) {
  s.background = { color: bgFor("content", ctx) };
  const text = noHash(ctx.palette.text);

  // Decorative large quote mark
  s.addText(ctx.rtl ? "״" : "\"", {
    x: ctx.rtl ? SLIDE_W - 1.4 : 0.4, y: 0.2, w: 1.0, h: 1.8,
    fontSize: 180, color: noHash(ctx.accent), transparency: 80,
    fontFace: ctx.font.pptxDisplay, align: ctx.align,
  });

  s.addText(`"${slide.title || ""}"`, {
    x: 0.8, y: 1.5, w: SLIDE_W - 1.6, h: 2.2,
    fontSize: 26 * ctx.titleScale, italic: true, color: text, align: "center",
    rtlMode: ctx.rtl, lineSpacingMultiple: 1.5, fontFace: ctx.font.pptxDisplay,
  });

  // Small divider
  addBar(s, SLIDE_W / 2 - 0.3, 4.0, 0.6, 0.02, ctx.accent);

  if (slide.subtitle) {
    s.addText(`— ${slide.subtitle}`, {
      x: 0.8, y: 4.2, w: SLIDE_W - 1.6, h: 0.5,
      fontSize: 14 * ctx.bodyScale, color: noHash(ctx.palette.textMuted),
      align: "center", rtlMode: ctx.rtl, fontFace: ctx.font.pptxBody,
    });
  }
}

// ─────────────────────── CONTENT ───────────────────────

function renderContentPptx(s: PptxSlide, slide: Slide, ctx: Ctx) {
  s.background = { color: bgFor("content", ctx) };
  const tColor = titleColor("content", ctx);
  const bColor = bodyColor("content", ctx);
  const content = ctx.theme.content;

  let titleY = 0.5;
  let titleX = MARGIN;
  let titleW = SLIDE_W - MARGIN * 2;
  let titleFontSize = 24 * ctx.titleScale;
  let bulletsX = MARGIN;
  let bulletsY = 1.6;
  let bulletsW = SLIDE_W - MARGIN * 2;
  let bulletsFontSize = 16 * ctx.bodyScale;

  // Layout-specific decoration + repositioning
  switch (content) {
    case "side-band": {
      addBar(s, ctx.rtl ? SLIDE_W - 0.8 : 0, 0, 0.8, SLIDE_H, ctx.accent);
      const off = 0.95;
      titleX = ctx.rtl ? MARGIN : off; titleW = SLIDE_W - MARGIN - off;
      bulletsX = titleX; bulletsW = titleW;
      break;
    }
    case "header-block": {
      addBar(s, 0, 0, SLIDE_W, 1.3, ctx.palette.coverBg);
      addBar(s, 0, 1.3, SLIDE_W, 0.05, ctx.accent);
      // Title on the colored header
      s.addText(slide.title || "", {
        x: MARGIN, y: 0.35, w: SLIDE_W - MARGIN * 2, h: 0.95,
        fontSize: 24 * ctx.titleScale, bold: true, color: noHash(ctx.palette.coverText),
        align: ctx.align, rtlMode: ctx.rtl, fontFace: ctx.font.pptxDisplay,
      });
      titleY = -10; // don't redraw title later
      bulletsY = 1.7;
      break;
    }
    case "half-color": {
      addBar(s, ctx.rtl ? SLIDE_W * 0.62 : 0, 0, SLIDE_W * 0.38, SLIDE_H, ctx.palette.coverBg);
      s.addText(slide.title || "", {
        x: ctx.rtl ? SLIDE_W * 0.65 : 0.4, y: 1.8, w: SLIDE_W * 0.32, h: 1.5,
        fontSize: 24 * ctx.titleScale, bold: true, color: noHash(ctx.palette.coverText),
        align: ctx.align, rtlMode: ctx.rtl, fontFace: ctx.font.pptxDisplay,
      });
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: ctx.rtl ? SLIDE_W * 0.65 : 0.4, y: 3.4, w: SLIDE_W * 0.32, h: 0.6,
          fontSize: 13 * ctx.bodyScale, italic: true, color: noHash(ctx.palette.coverText),
          align: ctx.align, rtlMode: ctx.rtl, transparency: 25, fontFace: ctx.font.pptxBody,
        });
      }
      titleY = -10; // skip
      bulletsX = ctx.rtl ? MARGIN : SLIDE_W * 0.42; bulletsW = SLIDE_W * 0.55;
      bulletsY = 0.7;
      break;
    }
    case "framed": {
      addBar(s, 0.24, 0.24, SLIDE_W - 0.48, 0.025, ctx.accent);
      addBar(s, 0.24, SLIDE_H - 0.265, SLIDE_W - 0.48, 0.025, ctx.accent);
      addBar(s, 0.24, 0.24, 0.025, SLIDE_H - 0.48, ctx.accent);
      addBar(s, SLIDE_W - 0.265, 0.24, 0.025, SLIDE_H - 0.48, ctx.accent);
      titleX = 0.65; titleW = SLIDE_W - 1.3;
      bulletsX = titleX; bulletsW = titleW;
      titleY = 0.65; bulletsY = 1.7;
      break;
    }
    case "footer-band": {
      addBar(s, 0, SLIDE_H - 0.55, SLIDE_W, 0.55, ctx.accent);
      s.addText(ctx.company || "", {
        x: MARGIN, y: SLIDE_H - 0.5, w: SLIDE_W * 0.5, h: 0.45,
        fontSize: 11, color: "FFFFFF", align: ctx.align,
        rtlMode: ctx.rtl, charSpacing: 60, fontFace: ctx.font.pptxBody,
      });
      s.addText(ctx.date || "", {
        x: ctx.rtl ? MARGIN : SLIDE_W * 0.5, y: SLIDE_H - 0.5, w: SLIDE_W * 0.5 - MARGIN, h: 0.45,
        fontSize: 11, color: "FFFFFF", align: ctx.rtl ? "left" : "right",
        rtlMode: ctx.rtl, fontFace: ctx.font.pptxBody,
      });
      break;
    }
    case "minimal-line": {
      titleY = 0.7; bulletsY = 2.0;
      addBar(s, MARGIN, 1.5, 0.5, 0.012, ctx.accent);
      break;
    }
    case "magazine": {
      titleX = ctx.rtl ? SLIDE_W * 0.6 : MARGIN; titleW = SLIDE_W * 0.34;
      titleY = 0.65; titleFontSize = 26 * ctx.titleScale;
      bulletsX = ctx.rtl ? MARGIN : SLIDE_W * 0.4; bulletsW = SLIDE_W * 0.55;
      bulletsY = 0.7;
      // Add column rule
      addBar(s, ctx.rtl ? SLIDE_W * 0.595 : SLIDE_W * 0.395, 0.7, 0.012, SLIDE_H - 1.4, ctx.palette.textMuted);
      // Eyebrow label
      s.addText(ctx.company || "", {
        x: titleX, y: 0.5, w: titleW, h: 0.3,
        fontSize: 10, color: noHash(ctx.accent), bold: true, charSpacing: 100,
        align: ctx.align, rtlMode: ctx.rtl, fontFace: ctx.font.pptxBody,
      });
      titleY = 0.85;
      break;
    }
    case "two-column": {
      // Title at top + 2-column bullets
      // Title rendered normally below
      titleY = 0.5; bulletsY = 1.55;
      // We'll override bullet rendering further down
      break;
    }
    case "corner-accent": {
      s.addShape("rtTriangle", {
        x: ctx.rtl ? 0 : SLIDE_W - 1.8, y: 0,
        w: 1.8, h: 1.8,
        flipH: ctx.rtl,
        fill: { color: noHash(ctx.accent) },
        line: { color: noHash(ctx.accent), width: 0 },
      });
      break;
    }
    case "left-rule": {
      addBar(s, ctx.rtl ? SLIDE_W - 0.62 : 0.55, 0.7, 0.035, SLIDE_H - 1.4, ctx.accent);
      titleX = ctx.rtl ? MARGIN : 0.85; titleW = SLIDE_W - 0.95;
      bulletsX = titleX; bulletsW = titleW;
      titleY = 0.7; bulletsY = 1.8;
      break;
    }
    case "dot-grid":
    case "classic-top":
    default: {
      // Underline + accent bar at top
      addBar(s, 0, 0, SLIDE_W, 0.05, ctx.accent);
      titleY = 0.45; bulletsY = 1.6;
      break;
    }
  }

  // Render title (unless layout already did it)
  if (titleY > 0) {
    s.addText(slide.title || "", {
      x: titleX, y: titleY, w: titleW, h: 0.85,
      fontSize: titleFontSize, bold: true, color: tColor, align: ctx.align,
      rtlMode: ctx.rtl, fontFace: ctx.font.pptxDisplay,
    });
    if (slide.subtitle && content !== "magazine") {
      s.addText(slide.subtitle, {
        x: titleX, y: titleY + 0.85, w: titleW, h: 0.35,
        fontSize: 12 * ctx.bodyScale, italic: true, color: noHash(ctx.palette.textMuted),
        align: ctx.align, rtlMode: ctx.rtl, fontFace: ctx.font.pptxBody,
      });
    }
    if (content === "classic-top" || content === "dot-grid") {
      addBar(s, titleX, titleY + 0.95, Math.min(titleW, 2.4), 0.022, ctx.accent);
    }
  }

  // Render bullets
  const filled = slide.bullets.filter((b) => b && b.trim());
  if (filled.length === 0) return;

  const bulletsH = Math.max(0.6, SLIDE_H - bulletsY - (content === "footer-band" ? 0.7 : 0.4));

  if (content === "two-column") {
    const mid = Math.ceil(filled.length / 2);
    const colW = (SLIDE_W - MARGIN * 2 - 0.4) / 2;
    const items1 = filled.slice(0, mid).map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 6 } }));
    const items2 = filled.slice(mid).map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 6 } }));
    s.addText(items1, {
      x: ctx.rtl ? MARGIN + colW + 0.4 : MARGIN, y: bulletsY,
      w: colW, h: bulletsH,
      fontSize: 14 * ctx.bodyScale, color: bColor, align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.4, valign: "top",
      fontFace: ctx.font.pptxBody,
    });
    if (items2.length) {
      s.addText(items2, {
        x: ctx.rtl ? MARGIN : MARGIN + colW + 0.4, y: bulletsY,
        w: colW, h: bulletsH,
        fontSize: 14 * ctx.bodyScale, color: bColor, align: ctx.align,
        rtlMode: ctx.rtl, lineSpacingMultiple: 1.4, valign: "top",
        fontFace: ctx.font.pptxBody,
      });
    }
  } else if (content === "numbered-list" || content === "circle-bullets" || content === "card-stack") {
    // Numbered or special-marker lists
    const items = filled.map((b, i) => ({ text: `${i + 1}.  ${b}`, options: { paraSpaceAfter: 8 } }));
    s.addText(items, {
      x: bulletsX, y: bulletsY, w: bulletsW, h: bulletsH,
      fontSize: bulletsFontSize, color: bColor, align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.4, valign: "top",
      fontFace: ctx.font.pptxBody,
    });
  } else if (content === "stripe-cards") {
    // Each bullet in its own stripe
    const stripeH = Math.min(0.55, bulletsH / Math.max(1, filled.length));
    filled.forEach((b, i) => {
      const y = bulletsY + i * (stripeH + 0.08);
      addBar(s, bulletsX, y, 0.05, stripeH, ctx.accent);
      s.addShape("rect", {
        x: bulletsX + 0.05, y, w: bulletsW - 0.05, h: stripeH,
        fill: { color: noHash(ctx.palette.bgAlt) },
        line: { color: noHash(ctx.palette.bgAlt), width: 0 },
      });
      s.addText(b, {
        x: bulletsX + 0.2, y, w: bulletsW - 0.3, h: stripeH,
        fontSize: 13 * ctx.bodyScale, color: bColor, align: ctx.align,
        rtlMode: ctx.rtl, valign: "middle", fontFace: ctx.font.pptxBody,
      });
    });
  } else {
    // Default bulleted list
    const items = filled.map((b) => ({ text: b, options: { bullet: { code: "25CF" }, paraSpaceAfter: 8 } }));
    s.addText(items, {
      x: bulletsX, y: bulletsY, w: bulletsW, h: bulletsH,
      fontSize: bulletsFontSize, color: bColor, align: ctx.align,
      rtlMode: ctx.rtl, lineSpacingMultiple: 1.4, valign: "top",
      fontFace: ctx.font.pptxBody,
    });
  }
}
