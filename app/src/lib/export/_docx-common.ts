import {
  AlignmentType,
  BorderStyle,
  HeadingLevel,
  LevelFormat,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IRunOptions,
  type IBorderOptions,
} from "docx";
import {
  FONT_DOCX,
  TABLE_STYLE_DEFS,
  type Formatting,
} from "../formatting";
import type { EffectiveDocDesign } from "../themes/doc-themes";

export const FILL_LINE = "_______________________________________________________";

export function hexNoHash(hex: string): string {
  return hex.replace(/^#/, "");
}

export function mixHex(hex: string, withWhite: number): string {
  const h = hexNoHash(hex);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - withWhite));
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return to2(mix(r)) + to2(mix(g)) + to2(mix(b));
}

// Blend two hexes: amount of `top` over `under` (both with or without #).
function blend(top: string, under: string, amount: number): string {
  const t = hexNoHash(top), u = hexNoHash(under);
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  const mix = (i: number) => Math.round(ch(t, i) * amount + ch(u, i) * (1 - amount)).toString(16).padStart(2, "0");
  return mix(0) + mix(2) + mix(4);
}

// First family of a CSS font stack → a Word face name.
function faceOf(stack: string, fallback: string): string {
  const first = (stack || "").split(",")[0].replace(/['"]/g, "").trim();
  return first || fallback;
}

export type DocxBuilder = ReturnType<typeof buildDocx>;

// Design-aware builder. When `eff` (the SAME resolved design the app renders
// with) is provided, every helper mirrors the app's CSS: display/body fonts,
// fg/muted ink, accent-styled headings per heading-style variant, guidance
// blocks, 1.65 line-height and the app's spacing rhythm. Without `eff` it
// falls back to the legacy plain output.
export function buildDocx(fmt: Formatting, rtl: boolean, eff?: EffectiveDocDesign) {
  // ── faces & sizes ────────────────────────────────────────────────
  const bodyFont = eff ? faceOf(eff.fontBody, "David Libre") : FONT_DOCX[fmt.fontFamily];
  const displayFont = eff ? faceOf(eff.fontDisplay, "Frank Ruhl Libre") : bodyFont;
  // App CSS: .doc { font-size: 11.5pt } and headings in rem (1rem = 12pt).
  const bodyPt = eff ? 11.5 : fmt.fontSize;
  const bodyHp = Math.round(bodyPt * 2);
  const h1Hp = eff ? 48 : Math.round(fmt.fontSize * 1.6 * 2);  // 2rem = 24pt
  const h2HpDefault = eff ? 34 : Math.round(fmt.fontSize * 1.3 * 2); // 1.4rem ≈ 17pt
  const h3Hp = eff ? 26 : Math.round(fmt.fontSize * 1.1 * 2);  // 1.1rem ≈ 13pt

  // ── ink ──────────────────────────────────────────────────────────
  const surface = eff ? hexNoHash(eff.surface) : "FFFFFF";
  const fg = eff ? hexNoHash(eff.fg) : "1A1A1A";
  const muted = eff ? hexNoHash(eff.muted) : "6B6B6B";
  const accent = eff ? hexNoHash(eff.accent) : hexNoHash(fmt.headingColor);
  const accent2 = eff ? hexNoHash(eff.accent2) : accent;
  const border = eff ? hexNoHash(eff.border) : "D8D4CC";
  const borderSoft = eff ? hexNoHash(eff.borderSoft) : "EBE6DC";
  const headColor = eff ? fg : hexNoHash(fmt.headingColor);

  // line-height 1.65 (app .doc) → Word line in 240ths of a line.
  const LINE = eff ? 396 : undefined;
  const lineSpacing = LINE ? { line: LINE } : {};

  const run = (text: string, opts: Partial<IRunOptions> = {}) =>
    new TextRun({ text, font: bodyFont, rightToLeft: rtl, size: bodyHp, color: fg, ...opts });
  const bold = (text: string) => run(text, { bold: true });
  const mutedRun = (text: string, opts: Partial<IRunOptions> = {}) =>
    run(text, { color: muted, size: Math.round(bodyHp * 0.92), ...opts });

  // ── headings ─────────────────────────────────────────────────────
  const noBorder: IBorderOptions = { style: BorderStyle.NONE, size: 0, color: "auto" };
  const accentBorder = (size: number): IBorderOptions => ({ style: BorderStyle.SINGLE, size, color: accent });
  const softBorder = (size: number): IBorderOptions => ({ style: BorderStyle.SINGLE, size, color: borderSoft });
  const hairline: IBorderOptions = { style: BorderStyle.SINGLE, size: 4, color: border };

  // H1 — display font + 2px accent rule below (app .h1).
  const h1 = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, font: displayFont, rightToLeft: rtl, size: h1Hp, color: headColor, bold: true })],
      heading: HeadingLevel.HEADING_1,
      bidirectional: rtl,
      spacing: { after: 240, ...lineSpacing },
      ...(eff ? { border: { bottom: accentBorder(16) } } : {}),
    });

  // H2 — mirrors the app's heading-style variant (hs_* classes).
  const h2 = (text: string) => {
    const hs = eff?.headingStyle ?? "classic";
    const base = { heading: HeadingLevel.HEADING_2, bidirectional: rtl } as const;
    if (!eff) {
      return new Paragraph({
        ...base,
        children: [new TextRun({ text, font: bodyFont, rightToLeft: rtl, size: h2HpDefault, color: headColor, bold: true })],
      });
    }
    const T = (size: number, opts: Partial<IRunOptions> = {}) =>
      new TextRun({ text: opts.allCaps ? text : text, font: displayFont, rightToLeft: rtl, size, bold: true, color: accent, ...opts });
    switch (hs) {
      case "minimal":
        return new Paragraph({
          ...base,
          children: [T(h2HpDefault)],
          spacing: { before: 480, after: 160, ...lineSpacing },
          border: { bottom: accentBorder(16) },
        });
      case "bold":
        return new Paragraph({
          ...base,
          children: [T(24, { color: fg, allCaps: true })], // 1rem heavy uppercase
          spacing: { before: 600, after: 160, ...lineSpacing },
          border: { top: accentBorder(24) },
        });
      case "editorial":
        return new Paragraph({
          ...base,
          children: [new TextRun({ text, font: displayFont, rightToLeft: rtl, size: 48, bold: false, color: fg })],
          spacing: { before: 480, after: 160, ...lineSpacing },
          border: { bottom: hairline },
        });
      case "modern":
      case "magazine":
        return new Paragraph({
          ...base,
          children: [new TextRun({ text, font: displayFont, rightToLeft: rtl, size: hs === "modern" ? 29 : 28, bold: true, color: surface })],
          spacing: { before: 480, after: 160, ...lineSpacing },
          shading: { type: ShadingType.CLEAR, color: "auto", fill: accent },
        });
      case "classic":
      default:
        // accent colour + 3px start border (logical start respects RTL).
        return new Paragraph({
          ...base,
          children: [T(h2HpDefault)],
          spacing: { before: 480, after: 120, ...lineSpacing },
          border: rtl ? { right: accentBorder(24) } : { left: accentBorder(24) },
        });
    }
  };

  const h3 = (text: string) =>
    new Paragraph({
      children: [new TextRun({ text, font: bodyFont, rightToLeft: rtl, size: h3Hp, color: headColor, bold: true })],
      heading: HeadingLevel.HEADING_3,
      bidirectional: rtl,
      spacing: { before: 300, after: 180, ...lineSpacing },
    });

  // legacy generic heading (kept for callers that pass explicit levels)
  const heading = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], hp: number) =>
    new Paragraph({
      children: [new TextRun({ text, font: displayFont, rightToLeft: rtl, size: hp, color: headColor, bold: true })],
      heading: level,
      bidirectional: rtl,
      spacing: { ...lineSpacing },
    });

  // ── guidance ("מה למלא: …") — muted, indented, softly shaded ─────
  const guidance = (text: string) =>
    new Paragraph({
      children: [mutedRun(text)],
      bidirectional: rtl,
      spacing: { after: 240, ...lineSpacing },
      ...(eff
        ? {
            shading: { type: ShadingType.CLEAR, color: "auto", fill: blend(fg, surface, 0.04) },
            border: rtl ? { right: softBorder(16) } : { left: softBorder(16) },
          }
        : {}),
    });

  // ── fields & body ────────────────────────────────────────────────
  const inlineField = (label: string, value: string, opts: { sep?: string; hint?: string } = {}) => {
    const sep = opts.sep ?? ": ";
    const tail = value.trim() ? value : FILL_LINE;
    const children: TextRun[] = [bold(label)];
    if (opts.hint) children.push(mutedRun(` — ${opts.hint}`));
    children.push(run(sep === ": " ? ": " : sep));
    children.push(value.trim() ? run(tail) : mutedRun(tail));
    return new Paragraph({
      children,
      bidirectional: rtl,
      spacing: { after: 200, ...lineSpacing },
    });
  };

  const paragraph = (text: string) =>
    new Paragraph({
      children: [text.trim() ? run(text) : mutedRun(FILL_LINE)],
      bidirectional: rtl,
      spacing: { after: 200, ...lineSpacing },
    });

  const bulletItem = (text: string) =>
    new Paragraph({
      children: [text.trim() ? run(text) : mutedRun(FILL_LINE)],
      bullet: { level: 0 },
      bidirectional: rtl,
      spacing: { after: 80, ...(LINE ? { line: 360 } : {}) },
    });

  // small uppercase muted card label (app .kpiIndex)
  const cardLabel = (text: string) =>
    new Paragraph({
      children: [mutedRun(text.toUpperCase(), { bold: true, size: Math.round(bodyHp * 0.85) })],
      bidirectional: rtl,
      spacing: { after: 120, ...lineSpacing },
    });

  // ── card (app .kpiBlock): bordered single-cell table wrapping a group ──
  const card = (children: Paragraph[]): Table =>
    new Table({
      rows: [
        new TableRow({
          children: [
            new TableCell({
              children,
              margins: { top: 160, bottom: 60, left: 200, right: 200 },
              shading: { type: ShadingType.CLEAR, color: "auto", fill: surface },
            }),
          ],
        }),
      ],
      width: { size: 100, type: WidthType.PERCENTAGE },
      visuallyRightToLeft: rtl,
      borders: {
        top: softBorder(6), bottom: softBorder(6), left: softBorder(6), right: softBorder(6),
        insideHorizontal: noBorder, insideVertical: noBorder,
      },
    });

  // a thin spacer paragraph (between cards / after tables)
  const spacer = (twips = 200) =>
    new Paragraph({ children: [], spacing: { after: twips }, bidirectional: rtl });

  return {
    font: bodyFont, displayFont, bodyHp, h1Hp, h2Hp: h2HpDefault, h3Hp,
    headColor, accent, accent2, fg, muted, surface, border, borderSoft, rtl, eff,
    run, bold, mutedRun, heading, h1, h2, h3,
    guidance, inlineField, paragraph, bulletItem, cardLabel, card, spacer,
  };
}

export function tableBorders(style: string, accent: string) {
  const def = TABLE_STYLE_DEFS[style as keyof typeof TABLE_STYLE_DEFS] ?? TABLE_STYLE_DEFS.classic;
  const solid = (color: string, size: number) => ({ style: BorderStyle.SINGLE, size, color });
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const soft = mixHex(`#${accent}`, 0.18);

  const outer = def.outerBorder === "thick" ? solid(accent, 16)
    : def.outerBorder === "normal" ? solid("888888", 6)
    : def.outerBorder === "thin" ? solid(soft, 4)
    : none;
  const innerH = def.innerH === "normal" ? solid("888888", 6)
    : def.innerH === "thin" ? solid(soft, 4)
    : none;
  const innerV = def.innerV === "normal" ? solid("888888", 6)
    : def.innerV === "thin" ? solid(soft, 4)
    : none;

  return { top: outer, bottom: outer, left: outer, right: outer, insideHorizontal: innerH, insideVertical: innerV };
}

export function cellShading(role: "header" | "evenBody" | "body", style: string, accent: string): { fill: string } | undefined {
  const def = TABLE_STYLE_DEFS[style as keyof typeof TABLE_STYLE_DEFS] ?? TABLE_STYLE_DEFS.classic;
  if (role === "header") {
    if (def.headerBg === "accent") return { fill: accent };
    if (def.headerBg === "dark") return { fill: "1a1a1a" };
    if (def.headerBg === "medium") return { fill: mixHex(`#${accent}`, 0.72) };
    if (def.headerBg === "light") return { fill: mixHex(`#${accent}`, 0.88) };
    return undefined;
  }
  if (role === "evenBody" && def.altRows) {
    if (def.altBg === "accent-light") return { fill: mixHex(`#${accent}`, 0.93) };
    if (def.altBg === "light") return { fill: "f5f5f5" };
  }
  return undefined;
}

export function buildTable(
  headers: string[],
  rows: string[][],
  b: DocxBuilder,
  fmt: Formatting,
): Table {
  const eff = b.eff;
  // App CSS: body cells text-align:start, headers centered; header bg =
  // surface + 6% accent; borders from the design's border colour.
  const headerFill = eff
    ? mixHexOver(b.accent, b.surface, 0.08)
    : cellShading("header", fmt.tableStyle, b.headColor)?.fill;

  const cell = (text: string, header: boolean, even: boolean) => {
    const value = text.trim() ? text : FILL_LINE;
    const isStripedHeader = !eff && header && fmt.tableStyle === "striped";
    const textRun = header
      ? new TextRun({
          text: value, font: b.font, rightToLeft: b.rtl, size: b.bodyHp, bold: true,
          color: isStripedHeader ? "FFFFFF" : b.fg,
        })
      : (text.trim() ? b.run(value) : b.mutedRun(value));
    const fill = header ? headerFill : eff ? undefined : cellShading(even ? "evenBody" : "body", fmt.tableStyle, b.headColor)?.fill;
    return new TableCell({
      children: [new Paragraph({
        children: [textRun],
        alignment: header ? AlignmentType.CENTER : eff ? AlignmentType.START : AlignmentType.CENTER,
        bidirectional: b.rtl,
        spacing: eff ? { line: 330 } : {},
      })],
      margins: eff ? { top: 100, bottom: 100, left: 120, right: 120 } : undefined,
      ...(fill ? { shading: { type: ShadingType.CLEAR, color: "auto", fill } } : {}),
    });
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) => cell(h, true, false)),
  });
  const bodyRows = rows.map(
    (r, idx) => new TableRow({ children: r.map((c) => cell(c, false, idx % 2 === 1)) }),
  );

  const borders = eff
    ? (() => {
        const line = { style: BorderStyle.SINGLE, size: 4, color: b.border };
        return { top: line, bottom: line, left: line, right: line, insideHorizontal: line, insideVertical: line };
      })()
    : tableBorders(fmt.tableStyle, b.headColor);

  return new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: b.rtl,
    borders,
  });
}

// amount of accent blended over surface (matches CSS color-mix usage).
function mixHexOver(accent: string, surface: string, amount: number): string {
  const a = accent, s = surface;
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  const mix = (i: number) => Math.round(ch(a, i) * amount + ch(s, i) * (1 - amount)).toString(16).padStart(2, "0");
  return mix(0) + mix(2) + mix(4);
}

export const BULLET_NUMBERING = {
  config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•" }] }],
};
