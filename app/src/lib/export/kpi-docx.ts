import {
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
} from "docx";
import type { KpiDocument } from "../schemas/kpis";
import { strings as i18nStrings, type Lang } from "../i18n";
import { defaultFormatting, type Formatting } from "../formatting";
import type { EffectiveDocDesign } from "../themes/doc-themes";
import { buildDocx, buildTable, BULLET_NUMBERING, hexNoHash } from "./_docx-common";

// Mirrors the app's KPI template through the shared design-aware builder —
// same fonts, accent-styled headings, guidance rhythm and table styling as
// the on-screen document.
export async function renderKpiDocx(
  doc: KpiDocument,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
  eff?: EffectiveDocDesign,
): Promise<Blob> {
  const t = i18nStrings[lang];
  const rtl = t.dir === "rtl";
  const b = buildDocx(formatting, rtl, eff);
  const children: (Paragraph | Table)[] = [];

  children.push(b.h1(t.docTitle));

  const companyLabel = t.companyGloss ? `${t.company} / ${t.companyGloss}` : t.company;
  children.push(b.inlineField(companyLabel, doc.company));

  const roleLabel = t.roleGloss ? `${t.role} / ${t.roleGloss}` : t.role;
  children.push(b.inlineField(roleLabel, doc.role, { hint: t.roleHint || undefined }));

  const dateLabel = t.dateGloss ? `${t.date} / ${t.dateGloss}` : t.date;
  children.push(b.inlineField(dateLabel, doc.date));

  children.push(b.h2(t.kpiDefsHeading));
  children.push(b.h3(t.kpisSubheading));

  doc.kpis.forEach((k: KpiDocument["kpis"][number], i: number) => {
    const nameLabel = t.kpiNameGloss ? `${t.kpiName} / ${t.kpiNameGloss}` : t.kpiName;
    const inner: Paragraph[] = [
      b.cardLabel(`KPI ${i + 1}`),
      b.inlineField(nameLabel, k.name),
    ];
    const f = (label: string, gloss: string, value: string) => {
      const l = gloss ? `${label} / ${gloss}` : label;
      inner.push(b.inlineField(l, value));
    };
    f(t.kpiDef, t.kpiDefGloss, k.definition);
    f(t.kpiFormula, t.kpiFormulaGloss, k.formula);
    f(t.kpiOwner, t.kpiOwnerGloss, k.owner);
    f(t.kpiDataSource, t.kpiDataSourceGloss, k.dataSource);
    f(t.kpiCadence, t.kpiCadenceGloss, k.cadence);
    f(t.kpiBaseline, t.kpiBaselineGloss, k.baseline);
    f(t.kpiTargets, t.kpiTargetsGloss, k.targets);
    children.push(b.card(inner));
    children.push(b.spacer(200));
  });

  children.push(b.h2(t.scorecardHeading));

  const rows = doc.scorecard.length > 0
    ? doc.scorecard
    : [
        { kpi: "", owner: "", baseline: "", target: "", cadence: "" },
        { kpi: "", owner: "", baseline: "", target: "", cadence: "" },
        { kpi: "", owner: "", baseline: "", target: "", cadence: "" },
      ];

  children.push(
    buildTable(
      [t.colKpi, t.colOwner, t.colBaseline, t.colTarget, t.colCadence],
      rows.map((r: { kpi: string; owner: string; baseline: string; target: string; cadence: string }) => [r.kpi, r.owner, r.baseline, r.target, r.cadence]),
      b,
      formatting,
    ),
  );

  const document = new Document({
    creator: "Integrate AI",
    title: `${t.docTitle} — ${doc.company || "Untitled"}`,
    ...(eff && hexNoHash(eff.surface).toUpperCase() !== "FFFFFF"
      ? { background: { color: hexNoHash(eff.surface) } }
      : {}),
    styles: {
      default: {
        document: { run: { font: b.font, rightToLeft: rtl, size: b.bodyHp, color: b.fg } },
      },
    },
    numbering: BULLET_NUMBERING,
    sections: [
      {
        properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } },
        children,
      },
    ],
  });

  return Packer.toBlob(document);
}
