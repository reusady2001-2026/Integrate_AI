import type { KpiDocument } from "./schemas/kpis";
import type { JobDocument } from "./schemas/job-description";
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

/** Recursively walks an object and translates every string leaf.
 *  Skips boolean / number / nullish values. */
async function walk<T>(value: T, from: Lang, to: Lang): Promise<T> {
  if (typeof value === "string") {
    return (await t(value, from, to)) as unknown as T;
  }
  if (Array.isArray(value)) {
    return (await Promise.all(value.map((v) => walk(v, from, to)))) as unknown as T;
  }
  if (value && typeof value === "object") {
    const entries = await Promise.all(
      Object.entries(value).map(async ([k, v]) => [k, await walk(v, from, to)] as const),
    );
    return Object.fromEntries(entries) as T;
  }
  return value;
}

export async function translateDoc(doc: KpiDocument, from: Lang, to: Lang): Promise<KpiDocument> {
  return walk(doc, from, to);
}

export async function translateJobDoc(doc: JobDocument, from: Lang, to: Lang): Promise<JobDocument> {
  return walk(doc, from, to);
}

export async function translateAnyDoc<T>(doc: T, from: Lang, to: Lang): Promise<T> {
  return walk(doc, from, to);
}
