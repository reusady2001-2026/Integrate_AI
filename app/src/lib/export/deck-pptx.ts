import type { StrategyDeck } from "@/lib/schemas/strategy-deck";
import type { Lang } from "@/lib/i18n";
import { DECK_THEMES } from "@/lib/themes/deck-themes";

export async function renderDeckPptx(doc: StrategyDeck, lang: Lang): Promise<void> {
  // Dynamic import to avoid SSR issues
  const PptxGenJS = (await import("pptxgenjs")).default;
  const prs = new PptxGenJS();
  prs.layout = "LAYOUT_16x9";
  prs.author = doc.company || "Integrate AI";
  prs.title = doc.planTitle || doc.company || "Strategy Deck";

  const theme = DECK_THEMES.find((t) => t.id === doc.theme) ?? DECK_THEMES[0];
  const isRtl = lang === "he";
  const align = isRtl ? "right" : "left";
  const SLIDE_W = 10; // pptxgenjs uses inches; 16:9 = 10" × 5.625"
  const SLIDE_H = 5.625;
  const MARGIN = 0.5;

  for (const slide of doc.slides) {
    const s = prs.addSlide();
    const isCoverOrSection = slide.layout === "cover" || slide.layout === "section";
    const bgHex = isCoverOrSection ? theme.pptx.coverBg : theme.pptx.bg;
    const titleHex = isCoverOrSection ? theme.pptx.coverText : theme.pptx.title;
    const bodyHex = isCoverOrSection ? theme.pptx.coverText : theme.pptx.body;

    s.background = { color: bgHex };

    if (slide.layout === "cover") {
      // Accent bar (narrow rectangle on start side)
      s.addShape("rect" as Parameters<typeof s.addShape>[0], {
        x: isRtl ? SLIDE_W - 0.12 : 0,
        y: 0,
        w: 0.12,
        h: SLIDE_H,
        fill: { color: theme.pptx.accent },
        line: { color: theme.pptx.accent, width: 0 },
      });

      // Company name
      if (doc.company) {
        s.addText(doc.company, {
          x: MARGIN, y: 0.35, w: SLIDE_W - MARGIN * 2, h: 0.4,
          fontSize: 12, color: titleHex, align,
          rtlMode: isRtl, transparency: 35,
        });
      }

      // Main title
      if (slide.title) {
        s.addText(slide.title, {
          x: MARGIN, y: 1.4, w: SLIDE_W - MARGIN * 2, h: 2,
          fontSize: 38, bold: true, color: titleHex, align,
          rtlMode: isRtl, lineSpacingMultiple: 1.1,
        });
      }

      // Subtitle
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: MARGIN, y: 3.3, w: SLIDE_W - MARGIN * 2, h: 0.8,
          fontSize: 22, color: titleHex, align,
          rtlMode: isRtl, transparency: 15,
        });
      }

      // Date
      if (doc.date) {
        s.addText(doc.date, {
          x: MARGIN, y: SLIDE_H - 0.55, w: SLIDE_W - MARGIN * 2, h: 0.35,
          fontSize: 12, color: titleHex, align,
          rtlMode: isRtl, transparency: 45,
        });
      }
    } else if (slide.layout === "section") {
      // Top accent line
      s.addShape("rect" as Parameters<typeof s.addShape>[0], {
        x: 0, y: 0, w: SLIDE_W, h: 0.06,
        fill: { color: theme.pptx.accent },
        line: { color: theme.pptx.accent, width: 0 },
      });

      // Centered title
      if (slide.title) {
        s.addText(slide.title, {
          x: 0.8, y: 1.8, w: SLIDE_W - 1.6, h: 1.5,
          fontSize: 42, bold: true, color: titleHex, align: "center",
          rtlMode: isRtl, lineSpacingMultiple: 1.15,
        });
      }

      // Subtitle
      if (slide.subtitle) {
        s.addText(slide.subtitle, {
          x: 0.8, y: 3.5, w: SLIDE_W - 1.6, h: 0.7,
          fontSize: 20, color: titleHex, align: "center",
          rtlMode: isRtl, transparency: 25,
        });
      }
    } else if (slide.layout === "quote") {
      // Quote text
      if (slide.title) {
        s.addText(`"${slide.title}"`, {
          x: 0.7, y: 1.2, w: SLIDE_W - 1.4, h: 2.5,
          fontSize: 28, italic: true, color: titleHex, align: "center",
          rtlMode: isRtl, lineSpacingMultiple: 1.5,
        });
      }

      // Attribution
      if (slide.subtitle) {
        s.addText(`— ${slide.subtitle}`, {
          x: 0.7, y: 4.0, w: SLIDE_W - 1.4, h: 0.6,
          fontSize: 18, color: bodyHex, align,
          rtlMode: isRtl, transparency: 20,
        });
      }

      // Bottom accent line
      s.addShape("rect" as Parameters<typeof s.addShape>[0], {
        x: 0, y: SLIDE_H - 0.05, w: SLIDE_W, h: 0.05,
        fill: { color: theme.pptx.accent },
        line: { color: theme.pptx.accent, width: 0 },
      });
    } else {
      // Content layout
      // Top accent line
      s.addShape("rect" as Parameters<typeof s.addShape>[0], {
        x: 0, y: 0, w: SLIDE_W, h: 0.05,
        fill: { color: theme.pptx.accent },
        line: { color: theme.pptx.accent, width: 0 },
      });

      // Title
      if (slide.title) {
        s.addText(slide.title, {
          x: MARGIN, y: 0.5, w: SLIDE_W - MARGIN * 2, h: 0.85,
          fontSize: 26, bold: true, color: titleHex, align,
          rtlMode: isRtl,
        });
      }

      // Separator line
      s.addShape("rect" as Parameters<typeof s.addShape>[0], {
        x: MARGIN, y: 1.4, w: SLIDE_W - MARGIN * 2, h: 0.02,
        fill: { color: theme.pptx.accent },
        line: { color: theme.pptx.accent, width: 0 },
      });

      // Bullets
      const filledBullets = slide.bullets.filter((b) => b.trim());
      if (filledBullets.length > 0) {
        const bulletItems = filledBullets.map((b) => ({
          text: b,
          options: { bullet: { type: "bullet" as const }, paraSpaceAfter: 8 },
        }));
        s.addText(bulletItems, {
          x: MARGIN, y: 1.55, w: SLIDE_W - MARGIN * 2, h: 3.7,
          fontSize: 18, color: bodyHex, align,
          rtlMode: isRtl, lineSpacingMultiple: 1.4,
          valign: "top",
        });
      }
    }
  }

  // Trigger browser download
  await prs.writeFile({
    fileName: `${(doc.company || "deck").replace(/\s+/g, "_")}.pptx`,
  });
}
