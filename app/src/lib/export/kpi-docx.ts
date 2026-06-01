import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
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
import type { KpiDocument } from "../schemas/kpis";
import { strings, type Lang } from "../i18n";
import {
  defaultFormatting,
  FONT_DOCX,
  type Formatting,
  type TableStyle,
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

function build(fmt: Formatting) {
  const font = FONT_DOCX[fmt.fontFamily];
  const bodyHp = Math.round(fmt.fontSize * 2);
  const h1Hp = Math.round(fmt.fontSize * 1.6 * 2);
  const h2Hp = Math.round(fmt.fontSize * 1.3 * 2);
  const h3Hp = Math.round(fmt.fontSize * 1.1 * 2);
  const headColor = hexNoHash(fmt.headingColor);

  function run(text: string, rtl: boolean, opts: Partial<IRunOptions> = {}): TextRun {
    return new TextRun({ text, font, rightToLeft: rtl, size: bodyHp, ...opts });
  }
  function bold(text: string, rtl: boolean): TextRun {
    return run(text, rtl, { bold: true });
  }
  function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], hp: number, rtl: boolean) {
    return new Paragraph({
      children: [new TextRun({ text, font, rightToLeft: rtl, size: hp, color: headColor, bold: true })],
      heading: level,
      bidirectional: rtl,
    });
  }
  function inlineField(label: string, value: string, rtl: boolean, opts: { sep?: string; hint?: string } = {}) {
    const sep = opts.sep ?? " — ";
    const hint = opts.hint ? `${opts.hint} ` : "";
    const tail = value.trim() ? value : FILL_LINE;
    return new Paragraph({
      children: [bold(label, rtl), run(`${sep}${hint}${tail}`, rtl)],
      bidirectional: rtl,
    });
  }
  function guidance(text: string, rtl: boolean) {
    return new Paragraph({ children: [run(text, rtl)], bidirectional: rtl });
  }

  return { run, bold, heading, inlineField, guidance, bodyHp, h1Hp, h2Hp, h3Hp, font, headColor };
}

function tableBorders(style: TableStyle, accent: string) {
  const solid = (color: string, size: number) => ({
    style: BorderStyle.SINGLE,
    size,
    color,
  });
  const none = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
  const soft = mixHex(`#${accent}`, 0.18);
  const accentSize = 8;

  switch (style) {
    case "minimal":
      return {
        top: none,
        bottom: solid(soft, 4),
        left: none,
        right: none,
        insideHorizontal: solid(soft, 4),
        insideVertical: none,
      };
    case "bordered":
      return {
        top: solid(accent, 16),
        bottom: solid(accent, 16),
        left: solid(accent, 16),
        right: solid(accent, 16),
        insideHorizontal: solid(accent, accentSize),
        insideVertical: solid(accent, accentSize),
      };
    case "striped":
      return {
        top: solid(soft, 4),
        bottom: solid(soft, 4),
        left: solid(soft, 4),
        right: solid(soft, 4),
        insideHorizontal: solid(soft, 4),
        insideVertical: solid(soft, 4),
      };
    case "classic":
    default:
      return {
        top: solid("888888", 6),
        bottom: solid("888888", 6),
        left: solid("888888", 6),
        right: solid("888888", 6),
        insideHorizontal: solid("888888", 6),
        insideVertical: solid("888888", 6),
      };
  }
}

function cellShading(role: "header" | "evenBody" | "oddBody" | "body", style: TableStyle, accent: string): { fill: string } | undefined {
  if (role === "header") {
    if (style === "striped") return { fill: accent };
    if (style === "bordered") return { fill: mixHex(`#${accent}`, 0.85) };
    return { fill: mixHex(`#${accent}`, 0.92) };
  }
  if (role === "evenBody" && style === "striped") {
    return { fill: mixHex(`#${accent}`, 0.96) };
  }
  return undefined;
}

export async function renderKpiDocx(
  doc: KpiDocument,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
): Promise<Blob> {
  const t = strings[lang];
  const rtl = t.dir === "rtl";
  const fmt = formatting;
  const b = build(fmt);
  const children: (Paragraph | Table)[] = [];

  children.push(b.heading(t.docTitle, HeadingLevel.HEADING_1, b.h1Hp, rtl));

  const companyLabel = t.companyGloss ? `${t.company} / ${t.companyGloss}` : t.company;
  children.push(b.inlineField(companyLabel, doc.company, rtl));

  const roleLabel = t.roleGloss ? `${t.role} / ${t.roleGloss}` : t.role;
  children.push(b.inlineField(roleLabel, doc.role, rtl, { hint: t.roleHint || undefined }));

  const dateLabel = t.dateGloss ? `${t.date} / ${t.dateGloss}` : t.date;
  children.push(b.inlineField(dateLabel, doc.date, rtl));

  children.push(b.heading(t.kpiDefsHeading, HeadingLevel.HEADING_2, b.h2Hp, rtl));
  children.push(b.guidance(t.kpiDefsGuidance, rtl));
  children.push(b.heading(t.kpisSubheading, HeadingLevel.HEADING_3, b.h3Hp, rtl));

  doc.kpis.forEach((k) => {
    const nameLabel = t.kpiNameGloss ? `${t.kpiName} / ${t.kpiNameGloss}` : t.kpiName;
    children.push(
      new Paragraph({
        children: [b.bold(nameLabel, rtl), b.run(`: ${k.name.trim() ? k.name : FILL_LINE} `, rtl)],
        heading: HeadingLevel.HEADING_3,
        bidirectional: rtl,
      }),
    );
    const f = (label: string, gloss: string, value: string) => {
      const l = gloss ? `${label} / ${gloss}` : label;
      return b.inlineField(l, value, rtl, { sep: ": " });
    };
    children.push(f(t.kpiDef, t.kpiDefGloss, k.definition));
    children.push(f(t.kpiFormula, t.kpiFormulaGloss, k.formula));
    children.push(f(t.kpiOwner, t.kpiOwnerGloss, k.owner));
    children.push(f(t.kpiDataSource, t.kpiDataSourceGloss, k.dataSource));
    children.push(f(t.kpiCadence, t.kpiCadenceGloss, k.cadence));
    children.push(f(t.kpiBaseline, t.kpiBaselineGloss, k.baseline));
    children.push(f(t.kpiTargets, t.kpiTargetsGloss, k.targets));
  });

  children.push(b.heading(t.scorecardHeading, HeadingLevel.HEADING_2, b.h2Hp, rtl));
  children.push(b.guidance(t.scorecardGuidance, rtl));

  function cell(text: string, header: boolean, even: boolean): TableCell {
    const value = text.trim() ? text : FILL_LINE;
    const isStripedHeader = header && fmt.tableStyle === "striped";
    const textRun = header
      ? new TextRun({
          text: value,
          font: b.font,
          rightToLeft: rtl,
          size: b.bodyHp,
          bold: true,
          ...(isStripedHeader ? { color: "FFFFFF" } : {}),
        })
      : b.run(value, rtl);
    const shading = cellShading(
      header ? "header" : even ? "evenBody" : "body",
      fmt.tableStyle,
      b.headColor,
    );
    return new TableCell({
      children: [
        new Paragraph({
          children: [textRun],
          alignment: AlignmentType.CENTER,
          bidirectional: rtl,
        }),
      ],
      ...(shading
        ? {
            shading: {
              type: ShadingType.CLEAR,
              color: "auto",
              fill: shading.fill,
            },
          }
        : {}),
    });
  }

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      cell(t.colKpi, true, false),
      cell(t.colOwner, true, false),
      cell(t.colBaseline, true, false),
      cell(t.colTarget, true, false),
      cell(t.colCadence, true, false),
    ],
  });

  const rows = doc.scorecard.length > 0
    ? doc.scorecard
    : [
        { kpi: "", owner: "", baseline: "", target: "", cadence: "" },
        { kpi: "", owner: "", baseline: "", target: "", cadence: "" },
        { kpi: "", owner: "", baseline: "", target: "", cadence: "" },
      ];

  const bodyRows = rows.map(
    (r, idx) => new TableRow({
      children: [
        cell(r.kpi, false, idx % 2 === 1),
        cell(r.owner, false, idx % 2 === 1),
        cell(r.baseline, false, idx % 2 === 1),
        cell(r.target, false, idx % 2 === 1),
        cell(r.cadence, false, idx % 2 === 1),
      ],
    }),
  );

  children.push(
    new Table({
      rows: [headerRow, ...bodyRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      visuallyRightToLeft: rtl,
      borders: tableBorders(fmt.tableStyle, b.headColor),
    }),
  );

  const document = new Document({
    creator: "Integrate AI",
    title: `${t.docTitle} — ${doc.company || "Untitled"}`,
    styles: {
      default: {
        document: { run: { font: b.font, rightToLeft: rtl, size: b.bodyHp } },
      },
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
