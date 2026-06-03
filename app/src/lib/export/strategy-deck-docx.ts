import { Document, Packer, PageOrientation, Paragraph, Table } from "docx";
import type { StrategyDeck } from "../schemas/strategy-deck";
import { strings, type Lang } from "../i18n";
import { defaultFormatting, type Formatting } from "../formatting";
import { buildDocx, BULLET_NUMBERING } from "./_docx-common";

export async function renderStrategyDeckDocx(
  doc: StrategyDeck,
  lang: Lang = "he",
  formatting: Formatting = defaultFormatting(),
): Promise<Blob> {
  const t = strings[lang].deck;
  const rtl = strings[lang].dir === "rtl";
  const b = buildDocx(formatting, rtl);
  const children: (Paragraph | Table)[] = [];

  children.push(b.h1(t.docTitle));
  children.push(b.inlineField(t.company, doc.company));
  children.push(b.inlineField(t.horizon, doc.horizon));
  children.push(b.inlineField(t.planTitle, doc.planTitle));
  children.push(b.inlineField(t.headlineTarget, doc.headlineTarget));
  children.push(b.inlineField(t.date, doc.date));

  children.push(b.h2(t.slidesHeading));

  doc.slides.forEach((s, i) => {
    children.push(b.h3(`${t.slideLabel(i)} — ${s.title || ""}`));
    s.bullets.forEach((bullet) => children.push(b.bulletItem(bullet)));
  });

  const document = new Document({
    creator: "Integrate AI",
    title: `${t.docTitle} — ${doc.company || "Untitled"}`,
    styles: { default: { document: { run: { font: b.font, rightToLeft: rtl, size: b.bodyHp } } } },
    numbering: BULLET_NUMBERING,
    sections: [{ properties: { page: { size: { orientation: PageOrientation.PORTRAIT } } }, children }],
  });

  return Packer.toBlob(document);
}
