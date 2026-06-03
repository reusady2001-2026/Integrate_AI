"use client";

import { type ReactNode } from "react";
import { useAppStore, type Artifact } from "@/lib/app-store";
import { useKpiStore } from "@/lib/store";
import { useJobStore } from "@/lib/job-store";
import { useStrategyDocStore } from "@/lib/strategy-doc-store";
import { useStrategyDeckStore } from "@/lib/strategy-deck-store";
import { useOrgStructureStore } from "@/lib/org-structure-store";
import { useWorkflowStore } from "@/lib/workflow-store";
import { strings, type Lang } from "@/lib/i18n";
import { DocDesignBar, type DocDesignProps } from "./DocDesignBar";

const ARTIFACTS: Artifact[] = [
  "kpi",
  "job-description",
  "strategy-document",
  "strategy-deck",
  "org-structure",
  "workflow",
];

export function Shell({
  preview,
  onExport,
}: {
  preview: ReactNode;
  onExport?: () => void;
}) {
  const artifact = useAppStore((s) => s.artifact);
  const openArtifact = useAppStore((s) => s.openArtifact);
  const goHome = useAppStore((s) => s.goHome);
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const translating = useAppStore((s) => s.translating);
  const setTranslating = useAppStore((s) => s.setTranslating);
  const t = strings[lang];

  const kpi = useKpiStore();
  const job = useJobStore();
  const sdoc = useStrategyDocStore();
  const sdeck = useStrategyDeckStore();
  const org = useOrgStructureStore();
  const wf = useWorkflowStore();

  const stores = { kpi, "job-description": job, "strategy-document": sdoc, "strategy-deck": sdeck, "org-structure": org, workflow: wf };
  const current = stores[artifact];

  // Build DocDesignBar props from the current artifact's store
  const docDesignProps: DocDesignProps | null = (() => {
    const storeMap = {
      kpi:                kpi,
      "job-description":  job,
      "strategy-document": sdoc,
      "org-structure":    org,
      workflow:           wf,
    };
    const s = storeMap[artifact as keyof typeof storeMap];
    if (!s) return null;
    return {
      design:               s.design,
      setDocTheme:          s.setDocTheme,
      setDocPaletteOverride: s.setDocPaletteOverride,
      setDocCustomPalette:  s.setDocCustomPalette,
      resetDocDesign:       s.resetDocDesign,
      setDocFormatting:     s.setDocFormatting,
      lang,
    };
  })();

  const switchLang = async (to: Lang) => {
    if (lang === to) return;
    setTranslating(true);
    await Promise.all(Object.values(stores).map((s) => s.translate(lang, to)));
    setLang(to);
    setTranslating(false);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-12 flex items-center justify-between px-4 border-b border-[color:var(--app-border)] bg-white">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={goHome}
            className="text-xs px-2 py-1 rounded hover:bg-neutral-100 text-[color:var(--app-muted)]"
            title={t.home.back}
          >
            ← {t.home.title}
          </button>
          <span className="text-[color:var(--app-border)]">|</span>
          <select
            value={artifact}
            onChange={(e) => openArtifact(e.target.value as Artifact)}
            className="font-display text-base bg-transparent border-0 outline-none cursor-pointer hover:opacity-70"
            aria-label="artifact"
          >
            {ARTIFACTS.map((a) => (
              <option key={a} value={a}>{t.artifacts[a].title}</option>
            ))}
          </select>
          <span className="text-[color:var(--app-border)]">|</span>
          <button type="button" onClick={current.loadSample} className="btn-secondary">{t.loadSample}</button>
          <button type="button" onClick={current.reset} className="btn-secondary">{t.reset}</button>
        </div>
        <div className="flex items-center gap-3">
          {docDesignProps && <DocDesignBar {...docDesignProps} />}
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

      <div className="flex-1 preview-surface overflow-y-auto p-8">
        <div className="mx-auto max-w-3xl">{preview}</div>
      </div>
    </div>
  );
}
