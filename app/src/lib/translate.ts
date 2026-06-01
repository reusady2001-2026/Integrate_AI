import type { KpiDocument } from "./schemas/kpis";
import type { Lang } from "./i18n";

async function t(text: string, from: Lang, to: Lang): Promise<string> {
  if (!text.trim()) return text;
  const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${from}|${to}`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    return (data.responseData?.translatedText as string) || text;
  } catch {
    return text;
  }
}

export async function translateDoc(doc: KpiDocument, from: Lang, to: Lang): Promise<KpiDocument> {
  const tr = (s: string) => t(s, from, to);

  const [company, level, date] = await Promise.all([tr(doc.company), tr(doc.level), tr(doc.date)]);

  const kpis = await Promise.all(
    doc.kpis.map(async (k) => ({
      name: await tr(k.name),
      definition: await tr(k.definition),
      formula: await tr(k.formula),
      owner: await tr(k.owner),
      dataSource: await tr(k.dataSource),
      cadence: await tr(k.cadence),
      baseline: await tr(k.baseline),
      targets: await tr(k.targets),
    })),
  );

  const scorecard = await Promise.all(
    doc.scorecard.map(async (r) => ({
      kpi: await tr(r.kpi),
      owner: await tr(r.owner),
      baseline: await tr(r.baseline),
      target: await tr(r.target),
      cadence: await tr(r.cadence),
    })),
  );

  return { company, level, date, kpis, scorecard };
}
