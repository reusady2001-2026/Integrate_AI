import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
  type IRunOptions,
} from "docx";
import type { KpiDocument } from "../schemas/kpis";
import { strings, type Lang } from "../i18n";

const DAVID = "David";
const BODY_HP = 14;
const H1_HP = 18;
const H2_HP = 16;
const H3_HP = 14;
const FILL_LINE = "_______________________________________________________";

function run(text: string, rtl: boolean, opts: Partial<IRunOptions> = {}): TextRun {
  return new TextRun({ text, font: DAVID, rightToLeft: rtl, size: BODY_HP, ...opts });
}

function bold(text: string, rtl: boolean): TextRun {
  return run(text, rtl, { bold: true });
}

function heading(text: string, level: (typeof HeadingLevel)[keyof typeof HeadingLevel], hp: number, rtl: boolean) {
  return new Paragraph({
    children: [new TextRun({ text, font: DAVID, rightToLeft: rtl, size: hp })],
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

function cell(children: TextRun[], rtl: boolean): TableCell {
  return new TableCell({
    children: [new Paragraph({ children, alignment: AlignmentType.CENTER, bidirectional: rtl })],
  });
}

function textCell(text: string, rtl: boolean, header = false): TableCell {
  const value = text.trim() ? text : FILL_LINE;
  return cell([header ? bold(value, rtl) : run(value, rtl)], rtl);
}

export async function renderKpiDocx(doc: KpiDocument, lang: Lang = "he"): Promise<Blob> {
  const t = strings[lang];
  const rtl = t.dir === "rtl";
  const children: (Paragraph | Table)[] = [];

  children.push(heading(t.docTitle, HeadingLevel.HEADING_1, H1_HP, rtl));

  const levelLabel = t.companyGloss ? `${t.company} / ${t.companyGloss}` : t.company;
  children.push(inlineField(levelLabel, doc.company, rtl));

  const roleLabel = t.roleGloss ? `${t.role} / ${t.roleGloss}` : t.role;
  children.push(inlineField(roleLabel, doc.role, rtl, { hint: t.roleHint || undefined }));

  const dateLabel = t.dateGloss ? `${t.date} / ${t.dateGloss}` : t.date;
  children.push(inlineField(dateLabel, doc.date, rtl));

  children.push(heading(t.kpiDefsHeading, HeadingLevel.HEADING_2, H2_HP, rtl));
  children.push(guidance(t.kpiDefsGuidance, rtl));
  children.push(heading(t.kpisSubheading, HeadingLevel.HEADING_3, H3_HP, rtl));

  doc.kpis.forEach((k) => {
    const nameLabel = t.kpiNameGloss ? `${t.kpiName} / ${t.kpiNameGloss}` : t.kpiName;
    children.push(
      new Paragraph({
        children: [bold(nameLabel, rtl), run(`: ${k.name.trim() ? k.name : FILL_LINE} `, rtl)],
        heading: HeadingLevel.HEADING_3,
        bidirectional: rtl,
      }),
    );
    const f = (label: string, gloss: string, value: string) => {
      const l = gloss ? `${label} / ${gloss}` : label;
      return inlineField(l, value, rtl, { sep: ": " });
    };
    children.push(f(t.kpiDef, t.kpiDefGloss, k.definition));
    children.push(f(t.kpiFormula, t.kpiFormulaGloss, k.formula));
    children.push(f(t.kpiOwner, t.kpiOwnerGloss, k.owner));
    children.push(f(t.kpiDataSource, t.kpiDataSourceGloss, k.dataSource));
    children.push(f(t.kpiCadence, t.kpiCadenceGloss, k.cadence));
    children.push(f(t.kpiBaseline, t.kpiBaselineGloss, k.baseline));
    children.push(f(t.kpiTargets, t.kpiTargetsGloss, k.targets));
  });

  children.push(heading(t.scorecardHeading, HeadingLevel.HEADING_2, H2_HP, rtl));
  children.push(guidance(t.scorecardGuidance, rtl));

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell(t.colKpi, rtl, true),
      textCell(t.colOwner, rtl, true),
      textCell(t.colBaseline, rtl, true),
      textCell(t.colTarget, rtl, true),
      textCell(t.colCadence, rtl, true),
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
    (r) => new TableRow({
      children: [
        textCell(r.kpi, rtl),
        textCell(r.owner, rtl),
        textCell(r.baseline, rtl),
        textCell(r.target, rtl),
        textCell(r.cadence, rtl),
      ],
    }),
  );

  children.push(
    new Table({
      rows: [headerRow, ...bodyRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      visuallyRightToLeft: rtl,
    }),
  );

  const document = new Document({
    creator: "Integrate AI",
    title: `${t.docTitle} — ${doc.company || "Untitled"}`,
    styles: {
      default: {
        document: { run: { font: DAVID, rightToLeft: rtl, size: BODY_HP } },
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
