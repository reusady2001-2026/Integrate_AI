import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  LevelFormat,
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

const DAVID = "David";
const HEEBO = "Heebo";

function he(text: string, opts: Partial<IRunOptions> = {}): TextRun {
  return new TextRun({
    text,
    font: DAVID,
    rightToLeft: true,
    ...opts,
  });
}

function bold(text: string): TextRun {
  return he(text, { bold: true });
}

function gloss(text: string): TextRun {
  return new TextRun({ text, font: HEEBO, color: "6b6b6b", italics: false });
}

function pBidi(children: TextRun[], opts: { spacingBefore?: number; spacingAfter?: number } = {}) {
  return new Paragraph({
    children,
    bidirectional: true,
    spacing: { before: opts.spacingBefore ?? 0, after: opts.spacingAfter ?? 100 },
  });
}

function h1(text: string, glossText: string) {
  return new Paragraph({
    children: [bold(text), gloss(`  · ${glossText}`)],
    heading: HeadingLevel.HEADING_1,
    bidirectional: true,
    spacing: { before: 200, after: 200 },
    border: { bottom: { color: "1a1a1a", size: 12, style: BorderStyle.SINGLE, space: 4 } },
  });
}

function h2(num: string, text: string, glossText: string) {
  return new Paragraph({
    children: [bold(`${num}. ${text}`), gloss(`  · ${glossText}`)],
    heading: HeadingLevel.HEADING_2,
    bidirectional: true,
    spacing: { before: 320, after: 120 },
  });
}

function h3(text: string, glossText: string) {
  return new Paragraph({
    children: [bold(text), gloss(`  · ${glossText}`)],
    heading: HeadingLevel.HEADING_3,
    bidirectional: true,
    spacing: { before: 200, after: 100 },
  });
}

function field(label: string, glossText: string, value: string, opts: { hint?: string } = {}) {
  const labelRuns: TextRun[] = [
    bold(`${label} `),
    gloss(`/ ${glossText}`),
  ];
  if (opts.hint) labelRuns.push(he(` — ${opts.hint}`, { color: "6b6b6b" }));
  return [
    pBidi(labelRuns, { spacingAfter: 40 }),
    pBidi(value ? [he(value)] : [he("________________________________________", { color: "c8c4bb" })], {
      spacingAfter: 160,
    }),
  ];
}

function guidance(text: string) {
  return new Paragraph({
    children: [bold("מה למלא: "), he(text, { color: "5a5a5a" })],
    bidirectional: true,
    spacing: { before: 80, after: 200 },
    indent: { start: 240 },
  });
}

function rule() {
  return new Paragraph({
    children: [],
    border: { bottom: { color: "d8d4cc", size: 6, style: BorderStyle.SINGLE, space: 1 } },
    spacing: { before: 240, after: 240 },
  });
}

function tableCell(text: string, isHeader = false): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children: [isHeader ? bold(text) : he(text)],
        alignment: isHeader ? AlignmentType.CENTER : AlignmentType.START,
        bidirectional: true,
      }),
    ],
  });
}

export async function renderKpiDocx(doc: KpiDocument): Promise<Buffer> {
  const children: (Paragraph | Table)[] = [];

  children.push(h1("מדדי ביצוע", "KPIs & Metrics"));
  children.push(
    pBidi(
      [
        he(
          "מסמך זה מגדיר את מערך המדדים — ברמת הארגון, החטיבה או התפקיד. שמרו על מספר מדדים קטן שמניע החלטות.",
        ),
      ],
      { spacingAfter: 200 },
    ),
  );

  children.push(...field("שם החברה", "Company", doc.company));
  children.push(...field("רמת המדידה", "Level", doc.level, { hint: "ארגון / חטיבה / תפקיד" }));
  children.push(...field("תאריך", "Date", doc.date));
  children.push(...field("סיווג", "Classification", doc.classification));

  children.push(rule());

  children.push(h2("1", "מסגרת המדידה", "Measurement Framework"));
  children.push(
    guidance(
      "כיצד המדדים מאורגנים (לפי ציר אסטרטגי / לפי פונקציה / לפי תפקיד) ומהו קצב הסקירה.",
    ),
  );
  children.push(...field("לוגיקת המדידה", "Logic", doc.framework.logic));
  children.push(...field("קצב סקירה", "Review cadence", doc.framework.cadence));

  children.push(rule());

  children.push(h2("2", "הגדרות מדדים", "KPI Definitions"));
  children.push(
    guidance(
      "בלוק אחד לכל מדד. נוסחה חייבת להיות חד-משמעית. הספים קובעים את סטטוס הרמזור.",
    ),
  );
  children.push(h3("מדדים", "KPI's"));

  doc.kpis.forEach((k, i) => {
    if (doc.kpis.length > 1) {
      children.push(
        pBidi([gloss(`מדד ${i + 1}`)], { spacingBefore: 200, spacingAfter: 80 }),
      );
    }
    children.push(...field("שם", "Name", k.name));
    children.push(...field("הגדרה (מה הוא מודד, בפשטות)", "Definition", k.definition));
    children.push(...field("נוסחה", "Formula", k.formula));
    children.push(...field("בעלים (תפקיד יחיד)", "Owner", k.owner));
    children.push(...field("מקור נתונים", "Data source", k.dataSource));
    children.push(...field("תדירות", "Cadence", k.cadence));
    children.push(...field("בסיס היום", "Baseline", k.baseline));
    children.push(...field("יעדים: T+1 / T+2 / T+5", "Targets", k.targets));
    children.push(...field("ספים — 🟢 ירוק / 🟡 צהוב / 🔴 אדום", "Thresholds", k.thresholds));
  });

  children.push(rule());

  children.push(h2("3", "כרטיס מדדים", "Scorecard"));
  children.push(guidance("טבלת סיכום של כל המדדים שלמעלה במבט אחד."));

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      tableCell("מדד · KPI", true),
      tableCell("בעלים · Owner", true),
      tableCell("בסיס · Baseline", true),
      tableCell("יעד · Target", true),
      tableCell("תדירות · Cadence", true),
      tableCell("סטטוס", true),
    ],
  });
  const bodyRows = doc.scorecard.map(
    (r) =>
      new TableRow({
        children: [
          tableCell(r.kpi),
          tableCell(r.owner),
          tableCell(r.baseline),
          tableCell(r.target),
          tableCell(r.cadence),
          tableCell(r.status),
        ],
      }),
  );
  children.push(
    new Table({
      rows: [headerRow, ...bodyRows],
      width: { size: 100, type: WidthType.PERCENTAGE },
      visuallyRightToLeft: true,
    }),
  );

  children.push(rule());

  children.push(h2("4", "ממשל המדידה", "KPI Governance"));
  children.push(guidance("מי סוקר מה ומתי, ואיזו פעולה מפעיל סטטוס אדום."));
  children.push(
    ...field(
      "פורום · תדירות · זכויות החלטה",
      "Forum · Frequency · Decision rights",
      doc.governance,
    ),
  );

  const document = new Document({
    creator: "Integrate AI",
    title: `מדדי ביצוע — ${doc.company || "Untitled"}`,
    styles: {
      default: {
        document: {
          run: { font: DAVID, rightToLeft: true },
        },
      },
    },
    numbering: { config: [{ reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•" }] }] },
    sections: [
      {
        properties: {
          page: {
            size: { orientation: PageOrientation.PORTRAIT },
          },
        },
        children,
      },
    ],
  });

  return Packer.toBuffer(document);
}
