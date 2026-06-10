import { Document, Packer, PageOrientation, Paragraph, Table } from "docx";
import type { Workflow } from "../schemas/workflow";
import { strings, type Lang } from "../i18n";
import type { EffectiveDocDesign } from "../themes/doc-themes";
import { defaultFormatting, type Formatting } from "../formatting";
import { buildDocx, buildTable, BULLET_NUMBERING } from "./_docx-common";

export async function renderWorkflowDocx(
  doc: Workflow,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
  eff?: EffectiveDocDesign,
): Promise<Blob> {
  const t = strings[lang].workflow;
  const rtl = strings[lang].dir === "rtl";
  const b = buildDocx(formatting, rtl, eff);
  const children: (Paragraph | Table)[] = [];

  children.push(b.h1(t.docTitle));
  children.push(b.inlineField(t.name, doc.name));
  children.push(b.inlineField(t.owner, doc.owner, { hint: t.ownerHint }));
  children.push(b.inlineField(t.purpose, doc.purpose));
  children.push(b.inlineField(t.scope, doc.scope, { hint: t.scopeHint }));
  children.push(b.inlineField(t.trigger, doc.trigger, { hint: t.triggerHint }));
  children.push(b.inlineField(t.frequency, doc.frequency));
  children.push(b.inlineField(t.version, doc.version));

  children.push(b.h2(t.ioHeading));
  children.push(new Paragraph({ children: [b.bold(t.inputs + ":")], bidirectional: rtl }));
  doc.inputs.forEach((x) => children.push(b.bulletItem(x)));
  children.push(new Paragraph({ children: [b.bold(t.outputs + ":")], bidirectional: rtl }));
  doc.outputs.forEach((x) => children.push(b.bulletItem(x)));

  children.push(b.h2(t.stepsHeading));
  children.push(
    buildTable(
      [t.colStep, t.colWhat, t.colWho, t.colOutput],
      doc.steps.map((s, i) => [String(i + 1), s.what, s.who, s.output]),
      b, formatting,
    ),
  );

  children.push(b.h2(t.raciHeading));
  children.push(
    buildTable(
      [t.colActivity, t.colR, t.colA, t.colC, t.colI],
      doc.raci.map((r) => [r.activity, r.r, r.a, r.c, r.i]),
      b, formatting,
    ),
  );

  children.push(b.h2(t.controlsHeading));
  children.push(b.paragraph(doc.controls));

  const document = new Document({
    creator: "Integrate AI",
    title: `${t.docTitle} — ${doc.name || "Untitled"}`,
    styles: { default: { document: { run: { font: b.font, rightToLeft: rtl, size: b.bodyHp } } } },
    numbering: BULLET_NUMBERING,
    sections: [{ properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } }, children }],
  });

  return Packer.toBlob(document);
}
