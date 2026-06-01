"use client";

import { useState, type ReactNode } from "react";
import { useAppStore } from "@/lib/app-store";
import { useKpiStore } from "@/lib/store";
import { useJobStore } from "@/lib/job-store";
import { strings } from "@/lib/i18n";
import { FormattingPanel } from "./FormattingPanel";

export type DesignSystem =
  | "editorial"
  | "elegant"
  | "kami"
  | "paper"
  | "warm-editorial";

const SYSTEM_LABELS: Record<DesignSystem, string> = {
  editorial: "Editorial",
  elegant: "Elegant",
  kami: "Kami",
  paper: "Paper",
  "warm-editorial": "Warm Editorial",
};

export function Shell({
  form,
  preview,
  onExport,
}: {
  form: ReactNode;
  preview: ReactNode;
  onExport?: () => void;
}) {
  const [ds, setDs] = useState<DesignSystem>("editorial");
  const artifact = useAppStore((s) => s.artifact);
  const setArtifact = useAppStore((s) => s.setArtifact);
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const translating = useAppStore((s) => s.translating);
  const setTranslating = useAppStore((s) => s.setTranslating);
  const t = strings[lang];

  const kpiTranslate = useKpiStore((s) => s.translate);
  const jobTranslate = useJobStore((s) => s.translate);

  const switchLang = async (to: "he" | "en") => {
    if (lang === to) return;
    setTranslating(true);
    await Promise.all([kpiTranslate(lang, to), jobTranslate(lang, to)]);
    setLang(to);
    setTranslating(false);
  };

  const artifactTitle =
    artifact === "kpi" ? t.artifactKpi : t.job.docTitle;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-12 flex items-center justify-between px-4 border-b border-[color:var(--app-border)] bg-white">
        <div className="flex items-center gap-3">
          <select
            value={artifact}
            onChange={(e) => setArtifact(e.target.value as "kpi" | "job-description")}
            className="font-display text-base bg-transparent border-0 outline-none cursor-pointer hover:opacity-70"
            aria-label="artifact"
          >
            <option value="kpi">{t.artifactKpi}</option>
            <option value="job-description">{t.artifactJob}</option>
          </select>
          <span className="text-xs text-[color:var(--app-muted)]">{artifactTitle}</span>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-[color:var(--app-muted)]">
            <span>סגנון עיצוב</span>
            <select
              value={ds}
              onChange={(e) => setDs(e.target.value as DesignSystem)}
              className="text-xs bg-white border border-[color:var(--app-border)] rounded px-2 py-1"
              aria-label="design system"
            >
              {(Object.keys(SYSTEM_LABELS) as DesignSystem[]).map((key) => (
                <option key={key} value={key}>
                  {SYSTEM_LABELS[key]}
                </option>
              ))}
            </select>
          </label>
          <FormattingPanel />
          <button
            type="button"
            onClick={() => switchLang(lang === "he" ? "en" : "he")}
            disabled={translating}
            className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50 disabled:opacity-50"
          >
            {translating ? t.translating : t.langToggle}
          </button>
          <button
            type="button"
            onClick={onExport}
            disabled={!onExport}
            className="text-xs px-3 py-1.5 rounded bg-[color:var(--app-accent)] text-white disabled:opacity-40"
          >
            {t.exportBtn}
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[minmax(0,360px)_minmax(0,1fr)] min-h-0">
        <aside className="border-l border-[color:var(--app-border)] bg-white overflow-y-auto p-4">
          {form}
        </aside>
        <section data-ds={ds} className="preview-surface overflow-y-auto p-8">
          <div className="mx-auto max-w-3xl">{preview}</div>
        </section>
      </div>
    </div>
  );
}
