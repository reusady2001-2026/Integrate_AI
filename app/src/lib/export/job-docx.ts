import {
  Document,
  Packer,
  PageOrientation,
  Paragraph,
  Table,
} from "docx";
import type { JobDocument } from "../schemas/job-description";
import { strings, type Lang } from "../i18n";
import { defaultFormatting, type Formatting } from "../formatting";
import type { EffectiveDocDesign } from "../themes/doc-themes";
import { buildDocx, buildTable, BULLET_NUMBERING, hexNoHash } from "./_docx-common";

// Mirrors the app's JobTemplate CONTENT (same sections, order, the four
// capability lists), styled by the SAME resolved doc design the app uses.
// Editing chrome is deliberately NOT exported: the grey guidance blocks,
// the card frames around repeating areas, and fill-lines for empty fields
// exist only to help filling the document in the app.
export async function renderJobDocx(
  doc: JobDocument,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
  eff?: EffectiveDocDesign,
): Promise<Blob> {
  const t = strings[lang];
  const tj = t.job;
  const rtl = t.dir === "rtl";
  const b = buildDocx(formatting, rtl, eff);

  const children: (Paragraph | Table)[] = [];

  children.push(b.h1(tj.docTitle));

  children.push(b.inlineField(tj.title, doc.title));
  children.push(b.inlineField(tj.positioning, doc.positioning, { hint: tj.positioningHint }));
  children.push(b.inlineField(tj.reportsTo, doc.reportsTo));
  children.push(b.inlineField(tj.directReports, doc.directReports));
  children.push(b.inlineField(tj.division, doc.division));
  children.push(b.inlineField(tj.date, doc.date));

  children.push(b.h2(tj.purposeHeading));
  children.push(b.paragraph(doc.purpose));

  children.push(b.h2(tj.areasHeading));

  doc.areas.forEach((a, i) => {
    children.push(b.cardLabel(tj.areaLabel(i)));
    children.push(b.inlineField(tj.areaName, a.name));
    children.push(new Paragraph({ children: [b.bold(tj.duties + ":")], bidirectional: rtl, spacing: { after: 120, line: 396 } }));
    for (const d of a.duties.filter((x) => x.trim())) children.push(b.bulletItem(d));
    children.push(b.spacer(240));
  });

  if (doc.enabled.interfaces) {
    children.push(b.h2(tj.interfacesHeading));
      children.push(
      buildTable(
        [tj.colParty, tj.colKind, tj.colPurpose],
        doc.interfaces.map((r) => [r.party, r.kind, r.purpose]),
        b,
        formatting,
      ),
    );
    children.push(b.spacer(200));
  }

  if (doc.enabled.successMetrics) {
    children.push(b.h2(tj.metricsHeading));
      children.push(b.paragraph(doc.successMetrics));
  }

  if (doc.enabled.qualifications) {
    children.push(b.h2(tj.qualificationsHeading));
  
    const capList = (heading: string, items: string[]) => {
      children.push(new Paragraph({
        children: [b.bold(heading + ":")],
        bidirectional: rtl,
        spacing: { before: 160, after: 100, line: 396 },
      }));
      for (const it of items.filter((x) => x.trim())) children.push(b.bulletItem(it));
    };
    capList(
      lang === "he" ? "יכולות מקצועיות (כלים, סטנדרטים, מומחיות)" : "Professional capabilities (tools, standards, expertise)",
      doc.capabilitiesProfessional,
    );
    capList(
      lang === "he" ? "יכולות אסטרטגיות וניהוליות" : "Strategic & managerial capabilities",
      doc.capabilitiesStrategic,
    );
    capList(
      lang === "he" ? "יכולות בין-אישיות" : "Interpersonal capabilities",
      doc.capabilitiesInterpersonal,
    );
    capList(
      lang === "he" ? "ציפיות מנהיגות ופרופיל אישיותי" : "Leadership expectations & personality profile",
      doc.capabilitiesLeadership,
    );

    children.push(b.spacer(120));
    children.push(b.inlineField(tj.required, doc.required));
    children.push(b.inlineField(tj.advantage, doc.advantage));
  }

  if (doc.enabled.authority) {
    children.push(b.h2(tj.authorityHeading));
      children.push(b.inlineField(tj.decides, doc.decides));
    children.push(b.inlineField(tj.recommends, doc.recommends));
    children.push(b.inlineField(tj.escalates, doc.escalates));
  }

  const document = new Document({
    creator: "Integrate AI",
    title: `${tj.docTitle} — ${doc.title || "Untitled"}`,
    ...(eff && hexNoHash(eff.surface).toUpperCase() !== "FFFFFF"
      ? { background: { color: hexNoHash(eff.surface) } }
      : {}),
    styles: {
      default: { document: { run: { font: b.font, rightToLeft: rtl, size: b.bodyHp, color: b.fg } } },
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
