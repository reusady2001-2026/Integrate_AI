import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
  Packer,
  PageOrientation,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IRunOptions,
} from "docx";
import type { JobDocument } from "../schemas/job-description";
import { strings, type Lang } from "../i18n";
import {
  defaultFormatting,
  FONT_DOCX,
  TABLE_STYLE_DEFS,
  type Formatting,
} from "../formatting";

const FILL_LINE = "_______________________________________________________";

function hexNoHash(hex: string): string {
  return hex.replace(/^#/, "");
}

function mixHex(hex: string, withWhite: number): string {
  const h = hexNoHash(hex);
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  const mix = (c: number) => Math.round(c + (255 - c) * (1 - withWhite));
  const to2 = (n: number) => n.toString(16).padStart(2, "0");
  return to2(mix(r)) + to2(mix(g)) + to2(mix(b));
}

function tableBorders(style: string, accent: string) {
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

  return {
    top: outer, bottom: outer, left: outer, right: outer,
    insideHorizontal: innerH, insideVertical: innerV,
  };
}

function cellShading(role: "header" | "evenBody" | "body", style: string, accent: string) {
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

export async function renderJobDocx(
  doc: JobDocument,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
): Promise<Blob> {
  const t = strings[lang];
  const tj = t.job;
  const rtl = t.dir === "rtl";
  const fmt = formatting;
  const font = FONT_DOCX[fmt.fontFamily];
  const bodyHp = Math.round(fmt.fontSize * 2);
  const h1Hp = Math.round(fmt.fontSize * 1.6 * 2);
  const h2Hp = Math.round(fmt.fontSize * 1.3 * 2);
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
  const inlineField = (label: string, value: string, opts: { sep?: string; hint?: string } = {}) => {
    const sep = opts.sep ?? ": ";
    const hint = opts.hint ? `${opts.hint} ` : "";
    const tail = value.trim() ? value : FILL_LINE;
    return new Paragraph({
      children: [bold(label), run(`${sep}${hint}${tail}`)],
      bidirectional: rtl,
    });
  };
  const guidance = (text: string) =>
    new Paragraph({ children: [run(text)], bidirectional: rtl });
  const paragraph = (text: string) =>
    new Paragraph({
      children: [run(text.trim() ? text : FILL_LINE)],
      bidirectional: rtl,
    });

  const children: (Paragraph | Table)[] = [];

  children.push(heading(tj.docTitle, HeadingLevel.HEADING_1, h1Hp));

  children.push(inlineField(tj.title, doc.title));
  children.push(inlineField(tj.positioning, doc.positioning, { hint: tj.positioningHint }));
  children.push(inlineField(tj.reportsTo, doc.reportsTo));
  children.push(inlineField(tj.directReports, doc.directReports));
  children.push(inlineField(tj.division, doc.division));
  children.push(inlineField(tj.date, doc.date));

  children.push(heading(tj.purposeHeading, HeadingLevel.HEADING_2, h2Hp));
  children.push(paragraph(doc.purpose));

  children.push(heading(tj.areasHeading, HeadingLevel.HEADING_2, h2Hp));

  doc.areas.forEach((a, i) => {
    if (doc.areas.length > 1) {
      children.push(
        new Paragraph({
          children: [run(tj.areaLabel(i), { color: "8a8a8a" })],
          bidirectional: rtl,
        }),
      );
    }
    children.push(inlineField(tj.areaName, a.name));
    children.push(
      new Paragraph({
        children: [bold(tj.duties + ":")],
        bidirectional: rtl,
      }),
    );
    a.duties.forEach((d) => {
      children.push(
        new Paragraph({
          children: [run(d.trim() ? d : FILL_LINE)],
          bullet: { level: 0 },
          bidirectional: rtl,
        }),
      );
    });
  });

  if (doc.enabled.interfaces) {
    children.push(heading(tj.interfacesHeading, HeadingLevel.HEADING_2, h2Hp));

    const cell = (text: string, header: boolean, even: boolean) => {
      const value = text.trim() ? text : FILL_LINE;
      const isStripedHeader = header && fmt.tableStyle === "striped";
      const textRun = header
        ? new TextRun({
            text: value,
            font,
            rightToLeft: rtl,
            size: bodyHp,
            bold: true,
            ...(isStripedHeader ? { color: "FFFFFF" } : {}),
          })
        : run(value);
      const shading = cellShading(header ? "header" : even ? "evenBody" : "body", fmt.tableStyle, headColor);
      return new TableCell({
        children: [new Paragraph({ children: [textRun], alignment: AlignmentType.CENTER, bidirectional: rtl })],
        ...(shading ? { shading: { type: ShadingType.CLEAR, color: "auto", fill: shading.fill } } : {}),
      });
    };

    const headerRow = new TableRow({
      tableHeader: true,
      children: [cell(tj.colParty, true, false), cell(tj.colKind, true, false), cell(tj.colPurpose, true, false)],
    });
    const bodyRows = doc.interfaces.map(
      (r, idx) =>
        new TableRow({
          children: [cell(r.party, false, idx % 2 === 1), cell(r.kind, false, idx % 2 === 1), cell(r.purpose, false, idx % 2 === 1)],
        }),
    );

    children.push(
      new Table({
        rows: [headerRow, ...bodyRows],
        width: { size: 100, type: WidthType.PERCENTAGE },
        visuallyRightToLeft: rtl,
        borders: tableBorders(fmt.tableStyle, headColor),
      }),
    );
  }

  if (doc.enabled.successMetrics) {
    children.push(heading(tj.metricsHeading, HeadingLevel.HEADING_2, h2Hp));
    children.push(paragraph(doc.successMetrics));
  }

  if (doc.enabled.qualifications) {
    children.push(heading(tj.qualificationsHeading, HeadingLevel.HEADING_2, h2Hp));
    children.push(inlineField(tj.required, doc.required));
    children.push(inlineField(tj.advantage, doc.advantage));
  }

  if (doc.enabled.authority) {
    children.push(heading(tj.authorityHeading, HeadingLevel.HEADING_2, h2Hp));
    children.push(inlineField(tj.decides, doc.decides));
    children.push(inlineField(tj.recommends, doc.recommends));
    children.push(inlineField(tj.escalates, doc.escalates));
  }

  const document = new Document({
    creator: "Integrate AI",
    title: `${tj.docTitle} — ${doc.title || "Untitled"}`,
    styles: {
      default: { document: { run: { font, rightToLeft: rtl, size: bodyHp } } },
    },
    numbering: {
      config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•" }] }],
    },
    sections: [
      {
        properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
