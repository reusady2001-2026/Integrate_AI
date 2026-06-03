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
} from "docx";
import {
  FONT_DOCX,
  TABLE_STYLE_DEFS,
  type Formatting,
} from "../formatting";

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

export type DocxBuilder = ReturnType<typeof buildDocx>;

export function buildDocx(fmt: Formatting, rtl: boolean) {
  const font = FONT_DOCX[fmt.fontFamily];
  const bodyHp = Math.round(fmt.fontSize * 2);
  const h1Hp = Math.round(fmt.fontSize * 1.6 * 2);
  const h2Hp = Math.round(fmt.fontSize * 1.3 * 2);
  const h3Hp = Math.round(fmt.fontSize * 1.1 * 2);
  const headColor = hexNoHash(fmt.headingColor);

  const run = (text: string, opts: Partial<IRunOptions> = {}) =>
    new TextRun({ text, font, rightToLeft: rtl, size: bodyHp, ...opts });
  const bold = (text: string) => run(text, { bold: true });

  const heading = (text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], hp: number) =>
    new Paragraph({
      children: [new TextRun({ text, font, rightToLeft: rtl, size: hp, color: headColor, bold: true })],
      heading: level,
      bidirectional: rtl,
    });

  const h1 = (text: string) => heading(text, HeadingLevel.HEADING_1, h1Hp);
  const h2 = (text: string) => heading(text, HeadingLevel.HEADING_2, h2Hp);
  const h3 = (text: string) => heading(text, HeadingLevel.HEADING_3, h3Hp);

  const inlineField = (label: string, value: string, opts: { sep?: string; hint?: string } = {}) => {
    const sep = opts.sep ?? " — ";
    const hint = opts.hint ? `${opts.hint} ` : "";
    const tail = value.trim() ? value : FILL_LINE;
    return new Paragraph({
      children: [bold(label), run(`${sep}${hint}${tail}`)],
      bidirectional: rtl,
    });
  };

  const paragraph = (text: string) =>
    new Paragraph({
      children: [run(text.trim() ? text : FILL_LINE)],
      bidirectional: rtl,
    });

  const bulletItem = (text: string) =>
    new Paragraph({
      children: [run(text.trim() ? text : FILL_LINE)],
      bullet: { level: 0 },
      bidirectional: rtl,
    });

  return {
    font, bodyHp, h1Hp, h2Hp, h3Hp, headColor, rtl,
    run, bold, heading, h1, h2, h3, inlineField, paragraph, bulletItem,
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
  const cell = (text: string, header: boolean, even: boolean) => {
    const value = text.trim() ? text : FILL_LINE;
    const isStripedHeader = header && fmt.tableStyle === "striped";
    const textRun = header
      ? new TextRun({
          text: value,
          font: b.font,
          rightToLeft: b.rtl,
          size: b.bodyHp,
          bold: true,
          ...(isStripedHeader ? { color: "FFFFFF" } : {}),
        })
      : b.run(value);
    const shading = cellShading(header ? "header" : even ? "evenBody" : "body", fmt.tableStyle, b.headColor);
    return new TableCell({
      children: [new Paragraph({ children: [textRun], alignment: AlignmentType.CENTER, bidirectional: b.rtl })],
      ...(shading ? { shading: { type: ShadingType.CLEAR, color: "auto", fill: shading.fill } } : {}),
    });
  };

  const headerRow = new TableRow({
    tableHeader: true,
    children: headers.map((h) => cell(h, true, false)),
  });
  const bodyRows = rows.map(
    (r, idx) => new TableRow({ children: r.map((c) => cell(c, false, idx % 2 === 1)) }),
  );

  return new Table({
    rows: [headerRow, ...bodyRows],
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: b.rtl,
    borders: tableBorders(fmt.tableStyle, b.headColor),
  });
}

export const BULLET_NUMBERING = {
  config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•" }] }],
};
