"use client";

import { useAppStore, type Artifact } from "@/lib/app-store";
import { strings } from "@/lib/i18n";

const ARTIFACTS: Artifact[] = [
  "kpi",
  "job-description",
  "strategy-document",
  "strategy-deck",
  "org-structure",
  "workflow",
];

export function LandingPage() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const openArtifact = useAppStore((s) => s.openArtifact);
  const t = strings[lang];

  return (
    <div className="min-h-screen flex flex-col" dir={t.dir}>
      <header className="h-12 flex items-center justify-between px-4 border-b border-[color:var(--app-border)] bg-white">
        <div className="font-display text-base">{t.home.title}</div>
        <button
          type="button"
          onClick={() => setLang(lang === "he" ? "en" : "he")}
          className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
        >
          {t.langToggle}
        </button>
      </header>

      <main className="flex-1 px-6 py-12 overflow-y-auto">
        <div className="max-w-5xl mx-auto">
          <h1 className="font-display text-4xl font-bold mb-3">{t.home.title}</h1>
          <p className="text-[color:var(--app-muted)] mb-2 text-lg">{t.home.subtitle}</p>
          <p className="text-[color:var(--app-muted)] mb-8 text-sm">{t.home.pickArtifact}</p>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARTIFACTS.map((a) => {
              const info = t.artifacts[a];
              return (
                <button
                  key={a}
                  type="button"
                  onClick={() => openArtifact(a)}
                  className="text-start p-5 bg-white rounded-lg border border-[color:var(--app-border)] hover:border-[color:var(--app-accent)] hover:shadow-md transition-all group"
                >
                  <div className="font-display text-lg font-bold mb-2 group-hover:text-[color:var(--app-accent)]">
                    {info.title}
                  </div>
                  <p className="text-sm text-[color:var(--app-muted)] leading-relaxed mb-4">
                    {info.desc}
                  </p>
                  <span className="text-xs text-[color:var(--app-accent)] font-bold">
                    {t.home.openBtn} →
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
