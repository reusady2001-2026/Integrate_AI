import { Document, Packer, PageOrientation, Paragraph, Table } from "docx";
import type { StrategyDocument } from "../schemas/strategy-document";
import { strings, type Lang } from "../i18n";
import { defaultFormatting, type Formatting } from "../formatting";
import { buildDocx, buildTable, BULLET_NUMBERING } from "./_docx-common";

export async function renderStrategyDocDocx(
  doc: StrategyDocument,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
): Promise<Blob> {
  const t = strings[lang].strategy;
  const rtl = strings[lang].dir === "rtl";
  const b = buildDocx(formatting, rtl);
  const children: (Paragraph | Table)[] = [];

  children.push(b.h1(t.docTitle));
  children.push(b.inlineField(t.company, doc.company));
  children.push(b.inlineField(t.docType, doc.docType, { hint: t.docTypeHint }));
  children.push(b.inlineField(t.horizon, doc.horizon, { hint: t.horizonHint }));
  children.push(b.inlineField(t.date, doc.date));

  children.push(b.h2(t.partAHeading));

  children.push(b.h3(t.identityHeading));
  children.push(b.inlineField(t.founding, doc.founding));
  children.push(b.inlineField(t.ownership, doc.ownership));
  children.push(b.inlineField(t.listing, doc.listing));
  children.push(b.inlineField(t.rating, doc.rating));
  children.push(b.inlineField(t.officers, doc.officers));

  children.push(b.h3(t.portfolioHeading));
  children.push(
    buildTable(
      [t.colSegment, t.colScale, t.colValue, t.colNoi, t.colOccupancy, t.colNotes],
      doc.portfolio.map((r) => [r.segment, r.scale, r.value, r.noi, r.occupancy, r.notes]),
      b, formatting,
    ),
  );

  children.push(b.h3(t.financeHeading));
  children.push(
    buildTable(
      [t.colMetric, t.colMetricValue, t.colMetricNote],
      doc.finance.map((r) => [r.metric, r.value, r.note]),
      b, formatting,
    ),
  );

  children.push(b.h3(t.challengesHeading));
  doc.challenges.forEach((c) => children.push(b.bulletItem(c)));

  children.push(b.h2(t.partBHeading));

  children.push(b.h3(t.thesisHeading));
  children.push(b.paragraph(doc.thesis));

  children.push(b.h3(t.tradeoffsHeading));
  children.push(new Paragraph({ children: [b.bold(t.willDo + ":")], bidirectional: rtl }));
  doc.willDo.forEach((c) => children.push(b.bulletItem(c)));
  children.push(new Paragraph({ children: [b.bold(t.wontDo + ":")], bidirectional: rtl }));
  doc.wontDo.forEach((c) => children.push(b.bulletItem(c)));

  children.push(b.h3(t.enginesHeading));
  doc.engines.forEach((e, i) => {
    children.push(new Paragraph({ children: [b.bold(t.engineLabel(i))], bidirectional: rtl }));
    children.push(b.inlineField(t.engineName, e.name));
    children.push(b.inlineField(t.engineOpportunity, e.opportunity));
    children.push(b.inlineField(t.engineLandscape, e.landscape));
    children.push(b.inlineField(t.engineModel, e.model));
    children.push(b.inlineField(t.engineEntry, e.entryPath));
  });

  children.push(b.h3(t.baseHeading));
  children.push(
    buildTable(
      [t.colBaseSegment, t.colBaseStatus, t.colBaseRisk, t.colBaseAction],
      doc.base.map((r) => [r.segment, r.status, r.risk, r.action]),
      b, formatting,
    ),
  );

  children.push(b.h3(t.risksHeading));
  children.push(
    buildTable(
      [t.colRisk, t.colResponse, t.colOwner],
      doc.risks.map((r) => [r.risk, r.response, r.owner]),
      b, formatting,
    ),
  );

  children.push(b.h3(t.summaryHeading));
  children.push(b.paragraph(doc.summary));

  const document = new Document({
    creator: "Integrate AI",
    title: `${t.docTitle} — ${doc.company || "Untitled"}`,
    styles: { default: { document: { run: { font: b.font, rightToLeft: rtl, size: b.bodyHp } } } },
    numbering: BULLET_NUMBERING,
    sections: [{ properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } }, children }],
  });

  return Packer.toBlob(document);
}
