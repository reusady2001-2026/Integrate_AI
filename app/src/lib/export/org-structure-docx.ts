import { Document, Packer, PageOrientation, Paragraph, Table } from "docx";
import type { OrgStructure } from "../schemas/org-structure";
import { strings, type Lang } from "../i18n";
import type { EffectiveDocDesign } from "../themes/doc-themes";
import { defaultFormatting, type Formatting } from "../formatting";
import { buildDocx, buildTable, BULLET_NUMBERING } from "./_docx-common";

export async function renderOrgStructureDocx(
  doc: OrgStructure,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
  eff?: EffectiveDocDesign,
): Promise<Blob> {
  const t = strings[lang].org;
  const rtl = strings[lang].dir === "rtl";
  const b = buildDocx(formatting, rtl, eff);
  const children: (Paragraph | Table)[] = [];

  children.push(b.h1(t.docTitle));
  children.push(b.inlineField(t.company, doc.company));
  children.push(b.inlineField(t.date, doc.date));

  children.push(b.h2(t.principlesHeading));
  doc.principles.forEach((p) => children.push(b.bulletItem(p)));

  children.push(b.h2(t.governanceHeading));
  children.push(
    buildTable(
      [t.colBody, t.colMandate, t.colComposition],
      doc.governance.map((r) => [r.body, r.mandate, r.composition]),
      b, formatting,
    ),
  );

  children.push(b.h2(t.chartHeading));
  doc.chart.split("\n").forEach((line) =>
    children.push(new Paragraph({ children: [b.run(line || " ")], bidirectional: rtl })),
  );

  children.push(b.h2(t.divisionsHeading));
  doc.divisions.forEach((d, i) => {
    children.push(new Paragraph({ children: [b.bold(t.divisionLabel(i))], bidirectional: rtl }));
    children.push(b.inlineField(t.divisionName, d.name));
    children.push(b.inlineField(t.divisionHead, d.head));
    children.push(b.inlineField(t.divisionScope, d.scope));
    children.push(b.inlineField(t.divisionKpis, d.kpis));
  });

  children.push(b.h2(t.authorityHeading));
  children.push(
    buildTable(
      [t.colDecision, t.colDecides, t.colRecommends, t.colExecutes],
      doc.authority.map((r) => [r.decision, r.decides, r.recommends, r.executes]),
      b, formatting,
    ),
  );

  const document = new Document({
    creator: "Integrate AI",
    title: `${t.docTitle} — ${doc.company || "Untitled"}`,
    styles: { default: { document: { run: { font: b.font, rightToLeft: rtl, size: b.bodyHp } } } },
    numbering: BULLET_NUMBERING,
    sections: [{ properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } }, children }],
  });

  return Packer.toBlob(document);
}
