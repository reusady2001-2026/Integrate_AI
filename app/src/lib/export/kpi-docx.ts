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

const DAVID = "David";
const BODY_HP = 14;
const H1_HP = 18;
const H2_HP = 16;
const H3_HP = 14;
const FILL_LINE = "_______________________________________________________";

function run(text: string, opts: Partial<IRunOptions> = {}): TextRun {
  return new TextRun({
    text,
    font: DAVID,
    rightToLeft: true,
    size: BODY_HP,
    ...opts,
  });
}

function bold(text: string): TextRun {
  return run(text, { bold: true });
}

function heading(
  text: string,
  level: (typeof HeadingLevel)[keyof typeof HeadingLevel],
  hp: number,
) {
  return new Paragraph({
    children: [
      new TextRun({ text, font: DAVID, rightToLeft: true, size: hp }),
    ],
    heading: level,
    bidirectional: true,
  });
}

function inlineField(
  label: string,
  value: string,
  opts: { sep?: string; hint?: string } = {},
) {
  const sep = opts.sep ?? " — ";
  const hint = opts.hint ? `${opts.hint} ` : "";
  const tail = value.trim() ? value : FILL_LINE;
  return new Paragraph({
    children: [bold(label), run(`${sep}${hint}${tail}`)],
    bidirectional: true,
  });
}

function guidance(text: string) {
  return new Paragraph({
    children: [run(text)],
    bidirectional: true,
  });
}

function cell(children: TextRun[]): TableCell {
  return new TableCell({
    children: [
      new Paragraph({
        children,
        alignment: AlignmentType.CENTER,
        bidirectional: true,
      }),
    ],
  });
}

function textCell(text: string, header = false): TableCell {
  const value = text.trim() ? text : FILL_LINE;
  return cell([header ? bold(value) : run(value)]);
}

function statusCell(text: string): TableCell {
  if (text.trim()) return cell([run(text)]);
  return cell([run("🟢 __________ 🟡 __________ 🔴 __________")]);
}

export async function renderKpiDocx(doc: KpiDocument): Promise<Blob> {
  const children: (Paragraph | Table)[] = [];

  children.push(
    heading("מדדי ביצוע · KPIs & Metrics", HeadingLevel.HEADING_1, H1_HP),
  );

  children.push(inlineField("שם החברה / Company", doc.company));
  children.push(
    inlineField("רמת המדידה / Level", doc.level, {
      hint: "מה למלא: ארגון / חטיבה / תפקיד.",
    }),
  );
  children.push(inlineField("תאריך / Date", doc.date));

  children.push(
    heading("הגדרות מדדים · KPI Definitions", HeadingLevel.HEADING_2, H2_HP),
  );
  children.push(
    guidance(
      "מה למלא: “נוסחה” חייבת להיות חד-משמעית. ה”ספים” קובעים את סטטוס הרמזור (ירוק/צהוב/אדום). לכל מדד חייב להיות בעלים יחיד ומקור נתונים.",
    ),
  );
  children.push(heading("מדדים / KPI's :", HeadingLevel.HEADING_3, H3_HP));

  const kpis =
    doc.kpis.length > 0
      ? doc.kpis
      : [
          {
            name: "",
            definition: "",
            formula: "",
            owner: "",
            dataSource: "",
            cadence: "",
            baseline: "",
            targets: "",
            thresholds: "",
          },
        ];

  kpis.forEach((k) => {
    children.push(
      new Paragraph({
        children: [
          bold("שם / Name"),
          run(`: ${k.name.trim() ? k.name : FILL_LINE} `),
        ],
        heading: HeadingLevel.HEADING_3,
        bidirectional: true,
      }),
    );
    children.push(
      inlineField(
        "הגדרה (מה הוא מודד, בפשטות) / Definition",
        k.definition,
        { sep: ": " },
      ),
    );
    children.push(inlineField("נוסחה / Formula", k.formula, { sep: ": " }));
    children.push(
      inlineField("בעלים (תפקיד יחיד) / Owner", k.owner, { sep: ": " }),
    );
    children.push(
      inlineField("מקור נתונים / Data source", k.dataSource, { sep: ": " }),
    );
    children.push(inlineField("תדירות / Cadence", k.cadence, { sep: ": " }));
    children.push(
      inlineField("בסיס היום / Baseline", k.baseline, { sep: ": " }),
    );
    children.push(
      inlineField("יעדים: T+1 / T+2 / T+5", k.targets, { sep: ": " }),
    );
    children.push(
      inlineField(
        "ספים — 🟢 ירוק / 🟡 צהוב / 🔴 אדום",
        k.thresholds,
        { sep: ": " },
      ),
    );
  });

  children.push(
    heading("כרטיס מדדים · Scorecard", HeadingLevel.HEADING_2, H2_HP),
  );
  children.push(guidance("מה למלא: טבלת סיכום של כל המדדים שלמעלה במבט אחד."));

  const headerRow = new TableRow({
    tableHeader: true,
    children: [
      textCell("מדד / KPI", true),
      textCell("בעלים / Owner", true),
      textCell("בסיס / Baseline", true),
      textCell("יעד / Target", true),
      textCell("תדירות / Cadence", true),
      textCell("סטטוס", true),
    ],
  });

  const rows =
    doc.scorecard.length > 0
      ? doc.scorecard
      : [
          { kpi: "", owner: "", baseline: "", target: "", cadence: "", status: "" },
          { kpi: "", owner: "", baseline: "", target: "", cadence: "", status: "" },
          { kpi: "", owner: "", baseline: "", target: "", cadence: "", status: "" },
        ];

  const bodyRows = rows.map(
    (r) =>
      new TableRow({
        children: [
          textCell(r.kpi),
          textCell(r.owner),
          textCell(r.baseline),
          textCell(r.target),
          textCell(r.cadence),
          statusCell(r.status),
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

  const document = new Document({
    creator: "Integrate AI",
    title: `מדדי ביצוע — ${doc.company || "Untitled"}`,
    styles: {
      default: {
        document: {
          run: { font: DAVID, rightToLeft: true, size: BODY_HP },
        },
      },
    },
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

  return Packer.toBlob(document);
}
