"use client";

import { useEffect } from "react";
import { useAppStore, BUILTIN_ARTIFACTS, artifactFromSchemaId } from "@/lib/app-store";
import { useUserSchemasStore } from "@/lib/user-schemas";
import { useRouter } from "next/navigation";
import { localizedText } from "@/lib/blocks";
import { strings } from "@/lib/i18n";

export function LandingPage() {
  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const openArtifact = useAppStore((s) => s.openArtifact);
  const userSchemas = useUserSchemasStore((s) => s.schemas);
  const hydrate = useUserSchemasStore((s) => s.hydrate);
  const deleteSchema = useUserSchemasStore((s) => s.deleteSchema);
  const router = useRouter();
  useEffect(() => { hydrate(); }, [hydrate]);
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
            {BUILTIN_ARTIFACTS.map((a) => {
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

          <div className="mt-12 flex items-center justify-between mb-4">
            <h2 className="font-display text-2xl font-bold">
              {lang === "he" ? "המסמכים שלי" : "My documents"}
            </h2>
            <button
              type="button"
              onClick={() => router.push("/builder")}
              className="text-sm px-3 py-1.5 rounded bg-[color:var(--app-accent)] text-white hover:opacity-90"
            >
              {lang === "he" ? "+ צור תבנית חדשה" : "+ Build new template"}
            </button>
          </div>

          {userSchemas.length === 0 ? (
            <p className="text-sm text-[color:var(--app-muted)] p-5 border border-dashed border-[color:var(--app-border)] rounded-lg text-center">
              {lang === "he"
                ? "עוד אין מסמכים מותאמים. לחץ \"צור תבנית חדשה\" כדי לבנות את הסוג הראשון שלך."
                : "No custom documents yet. Click \"Build new template\" to compose your first one."}
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {userSchemas.map((s) => (
                <div
                  key={s.id}
                  className="relative p-5 bg-white rounded-lg border border-[color:var(--app-border)] hover:border-[color:var(--app-accent)] hover:shadow-md transition-all group"
                >
                  <button
                    type="button"
                    onClick={() => openArtifact(artifactFromSchemaId(s.id))}
                    className="text-start w-full"
                  >
                    <div className="font-display text-lg font-bold mb-2 group-hover:text-[color:var(--app-accent)]">
                      {localizedText(s.name, lang) || (lang === "he" ? "ללא שם" : "Untitled")}
                    </div>
                    {s.description && (
                      <p className="text-sm text-[color:var(--app-muted)] leading-relaxed mb-4">
                        {localizedText(s.description, lang)}
                      </p>
                    )}
                    <span className="text-xs text-[color:var(--app-accent)] font-bold">
                      {t.home.openBtn} →
                    </span>
                  </button>
                  <div className="absolute top-2 inset-inline-end-2 flex gap-1">
                    <button
                      type="button"
                      onClick={() => router.push(`/builder?id=${s.id}`)}
                      title={lang === "he" ? "ערוך תבנית" : "Edit template"}
                      className="text-xs px-1.5 py-0.5 rounded text-[color:var(--app-muted)] hover:bg-neutral-100"
                    >
                      ✎
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (confirm(lang === "he" ? "למחוק את התבנית הזאת?" : "Delete this template?")) {
                          deleteSchema(s.id);
                        }
                      }}
                      title={lang === "he" ? "מחק תבנית" : "Delete template"}
                      className="text-xs px-1.5 py-0.5 rounded text-[color:var(--app-muted)] hover:bg-neutral-100 hover:text-red-600"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
