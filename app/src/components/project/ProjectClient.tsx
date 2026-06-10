"use client";

import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  useAppStore, BUILTIN_ARTIFACTS, isCustomArtifact, customSchemaIdFrom,
  type Artifact, type BuiltinArtifact,
} from "@/lib/app-store";
import { useProjectsStore } from "@/lib/projects-store";
import { useUserSchemasStore } from "@/lib/user-schemas";
import { useKpiStore } from "@/lib/store";
import { useJobStore } from "@/lib/job-store";
import { useStrategyDocStore } from "@/lib/strategy-doc-store";
import { useStrategyDeckStore } from "@/lib/strategy-deck-store";
import { useOrgStructureStore } from "@/lib/org-structure-store";
import { useWorkflowStore } from "@/lib/workflow-store";
import { useCustomDocStore } from "@/lib/custom-doc-store";
import { strings } from "@/lib/i18n";
import { localizedText } from "@/lib/blocks";
import { labelText, type LocalizedLabel } from "@/lib/user-designs";
import type { ProjectDoc, ProjectSource, ProjectSourceKind } from "@/lib/projects";

const SOURCE_KINDS: ProjectSourceKind[] = [
  "annual-report", "quarterly", "investor-deck", "prospectus", "filing", "press-release", "other",
];

const sourceKindLabel = (k: ProjectSourceKind, lang: string): string => {
  const he: Record<ProjectSourceKind, string> = {
    "annual-report":  "דוח שנתי",
    "quarterly":      "דוח רבעוני",
    "investor-deck":  "מצגת משקיעים",
    "prospectus":     "תשקיף",
    "filing":         "דיווח מיידי",
    "press-release":  "הודעה לעיתונות",
    "other":          "אחר",
  };
  const en: Record<ProjectSourceKind, string> = {
    "annual-report":  "Annual report",
    "quarterly":      "Quarterly report",
    "investor-deck":  "Investor deck",
    "prospectus":     "Prospectus",
    "filing":         "Filing",
    "press-release":  "Press release",
    "other":          "Other",
  };
  return lang === "he" ? he[k] : en[k];
};

export function ProjectClient() {
  const router = useRouter();
  const params = useSearchParams();
  const projectId = params.get("id");
  const lang = useAppStore((s) => s.lang);
  const isHe = lang === "he";
  const t = strings[lang];

  const hydrate = useProjectsStore((s) => s.hydrate);
  const hydrateSchemas = useUserSchemasStore((s) => s.hydrate);
  const hydrated = useProjectsStore((s) => s.hydrated);
  const project = useProjectsStore((s) => s.projects.find((p) => p.id === projectId));
  const projectDocs = useProjectsStore((s) => projectId ? s.projects.find((p) => p.id === projectId)?.docIds.map((id) => s.docs[id]).filter((d): d is ProjectDoc => !!d) ?? [] : []);
  const schemas = useUserSchemasStore((s) => s.schemas);
  const updateProject = useProjectsStore((s) => s.updateProject);
  const deleteProject = useProjectsStore((s) => s.deleteProject);
  const addSource = useProjectsStore((s) => s.addSource);
  const updateSource = useProjectsStore((s) => s.updateSource);
  const removeSource = useProjectsStore((s) => s.removeSource);
  const deleteDoc = useProjectsStore((s) => s.deleteDoc);

  useEffect(() => { hydrate(); hydrateSchemas(); }, [hydrate, hydrateSchemas]);

  if (!hydrated) {
    return <div style={{ padding: "2rem", color: "#6b7280" }}>{isHe ? "טוען…" : "Loading…"}</div>;
  }
  if (!project) {
    return (
      <div style={{ padding: "2rem", color: "#6b7280" }}>
        {isHe ? "פרויקט לא נמצא." : "Project not found."}
        <button onClick={() => router.push("/")} style={{ marginInlineStart: 12, ...miniBtn }}>
          ← {isHe ? "חזרה" : "Back"}
        </button>
      </div>
    );
  }

  const openDoc = (pd: ProjectDoc) => {
    loadProjectDocIntoStore(pd);
    useAppStore.setState({ activeProjectDocId: pd.id, view: "editor", artifact: pd.artifact });
    router.push("/");
  };

  const docsByArtifact = useMemo(() => {
    const m = new Map<Artifact, ProjectDoc[]>();
    for (const d of projectDocs) {
      const arr = m.get(d.artifact) ?? [];
      arr.push(d);
      m.set(d.artifact, arr);
    }
    return m;
  }, [projectDocs]);

  const artifactTitle = (a: Artifact): string => {
    if (isCustomArtifact(a)) {
      const id = customSchemaIdFrom(a);
      const s = schemas.find((x) => x.id === id);
      return localizedText(s?.name ?? {}, lang) || (isHe ? "מסמך מותאם" : "Custom document");
    }
    return t.artifacts[a as BuiltinArtifact]?.title ?? a;
  };

  const startBlank = (artifact: BuiltinArtifact) => {
    useAppStore.setState({ activeProjectDocId: null, currentProjectId: project.id, view: "editor", artifact });
    router.push("/");
  };

  return (
    <div dir={t.dir} style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header style={headerBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <button type="button" onClick={() => router.push("/")} style={miniBtn}>
            ← {isHe ? "הבית" : "Home"}
          </button>
          <span style={{ color: "var(--app-border)" }}>|</span>
          <h1 style={{ fontWeight: 700, fontSize: 16 }}>
            {labelText(project.name, lang) || (isHe ? "פרויקט ללא שם" : "Untitled project")}
          </h1>
          {project.ticker && <span style={{ fontSize: 12, color: "var(--app-muted)" }}>· {project.ticker}</span>}
          {project.seededFrom && (
            <span style={{ fontSize: 10, padding: "2px 6px", border: "1px solid var(--app-border)", borderRadius: 3, color: "var(--app-muted)" }}>
              {isHe ? "מקור: מהריפו" : "Seeded"}
            </span>
          )}
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <button type="button" onClick={() => {
            if (confirm(isHe ? "למחוק את הפרויקט וכל המסמכים בתוכו?" : "Delete project and all its docs?")) {
              deleteProject(project.id);
              router.push("/");
            }
          }} style={{ ...miniBtn, color: "#b91c1c" }}>
            {isHe ? "מחק פרויקט" : "Delete project"}
          </button>
        </div>
      </header>

      <main style={{ flex: 1, padding: "1.5rem", overflowY: "auto" }}>
        <div style={{ maxWidth: 1000, margin: "0 auto" }}>

          {/* Project metadata */}
          <Card title={isHe ? "פרטי הפרויקט" : "Project details"}>
            <ProjectMetaForm project={project} onChange={(patch) => updateProject(project.id, patch)} lang={lang} />
          </Card>

          {/* Sources */}
          <Card title={isHe ? "מקורות" : "Sources"} action={
            <button type="button" onClick={() => addSource(project.id, { kind: "annual-report", title: "" })} style={miniBtn}>
              + {isHe ? "הוסף מקור" : "Add source"}
            </button>
          }>
            {project.sources.length === 0 ? (
              <p style={{ color: "var(--app-muted)", fontSize: 13, padding: 14, textAlign: "center", border: "1px dashed var(--app-border)", borderRadius: 6 }}>
                {isHe ? "עוד אין מקורות. הוסף לפחות את הדוח השנתי האחרון ואת המצגת." : "No sources yet. Add at least the latest annual report and investor deck."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {project.sources.map((s) => (
                  <SourceRow key={s.id} source={s} lang={lang}
                    onChange={(patch) => updateSource(project.id, s.id, patch)}
                    onRemove={() => removeSource(project.id, s.id)} />
                ))}
              </div>
            )}
          </Card>

          {/* Documents */}
          <Card title={isHe ? "מסמכים בפרויקט" : "Project documents"} action={
            <NewDocMenu lang={lang} onPick={startBlank} />
          }>
            {projectDocs.length === 0 ? (
              <p style={{ color: "var(--app-muted)", fontSize: 13, padding: 14, textAlign: "center", border: "1px dashed var(--app-border)", borderRadius: 6 }}>
                {isHe ? "עוד אין מסמכים. הוסף מסמך חדש או בקש מהסוכן לבנות עבורך." : "No documents yet. Add one or ask the agent to draft them."}
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {Array.from(docsByArtifact.entries()).map(([artifact, list]) => (
                  <div key={artifact}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "var(--app-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 6 }}>
                      {artifactTitle(artifact)}
                    </div>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))", gap: 8 }}>
                      {list.map((d) => (
                        <div key={d.id} style={docCard}>
                          <button type="button" onClick={() => openDoc(d)} style={{ ...docCardBody, cursor: "pointer" }}>
                            <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                              {labelText(d.name, lang) || (isHe ? "ללא שם" : "Untitled")}
                            </div>
                            <div style={{ fontSize: 10, color: "var(--app-muted)" }}>
                              {new Date(d.updatedAt).toLocaleDateString(lang === "he" ? "he-IL" : "en-US")}
                            </div>
                          </button>
                          <button type="button" onClick={() => {
                            if (confirm(isHe ? "למחוק מסמך?" : "Delete document?")) deleteDoc(project.id, d.id);
                          }} title={isHe ? "מחק" : "Delete"}
                            style={{ ...miniBtn, padding: "2px 6px", fontSize: 11, color: "#b91c1c", border: "none" }}>✕</button>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  );
}

// ─── Project metadata form ───────────────────────────────────────────

function ProjectMetaForm({ project, onChange, lang }: {
  project: { name: LocalizedLabel; description?: LocalizedLabel; industry?: string; ticker?: string };
  onChange: (patch: { name?: LocalizedLabel; description?: LocalizedLabel; industry?: string; ticker?: string }) => void;
  lang: string;
}) {
  const isHe = lang === "he";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
      <Field label={isHe ? "שם החברה" : "Company name"}>
        <input type="text"
          value={(isHe ? project.name.he : project.name.en) ?? ""}
          onChange={(e) => onChange({ name: isHe ? { ...project.name, he: e.target.value } : { ...project.name, en: e.target.value } })}
          style={inputStyle} />
      </Field>
      <Field label={isHe ? "שם באנגלית / עברית" : "Other-language name"}>
        <input type="text"
          value={(isHe ? project.name.en : project.name.he) ?? ""}
          onChange={(e) => onChange({ name: isHe ? { ...project.name, en: e.target.value } : { ...project.name, he: e.target.value } })}
          style={inputStyle} />
      </Field>
      <Field label={isHe ? "טיקר / סימול" : "Ticker"}>
        <input type="text" value={project.ticker ?? ""} onChange={(e) => onChange({ ticker: e.target.value })} style={inputStyle} />
      </Field>
      <Field label={isHe ? "ענף" : "Industry"}>
        <input type="text" value={project.industry ?? ""} onChange={(e) => onChange({ industry: e.target.value })} style={inputStyle} />
      </Field>
      <div style={{ gridColumn: "1 / -1" }}>
        <Field label={isHe ? "תיאור קצר" : "Short description"}>
          <textarea rows={2}
            value={(isHe ? project.description?.he : project.description?.en) ?? ""}
            onChange={(e) => onChange({ description: isHe ? { ...(project.description ?? {}), he: e.target.value } : { ...(project.description ?? {}), en: e.target.value } })}
            style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }} />
        </Field>
      </div>
    </div>
  );
}

// ─── Source row ──────────────────────────────────────────────────────

function SourceRow({ source, onChange, onRemove, lang }: {
  source: ProjectSource;
  onChange: (patch: Partial<ProjectSource>) => void;
  onRemove: () => void;
  lang: string;
}) {
  const isHe = lang === "he";
  return (
    <div style={{ display: "grid", gridTemplateColumns: "150px 1fr 120px 32px", gap: 8, alignItems: "center" }}>
      <select value={source.kind} onChange={(e) => onChange({ kind: e.target.value as ProjectSourceKind })}
        style={{ ...inputStyle, fontSize: 11 }}>
        {SOURCE_KINDS.map((k) => <option key={k} value={k}>{sourceKindLabel(k, lang)}</option>)}
      </select>
      <input type="text" value={source.title} onChange={(e) => onChange({ title: e.target.value })}
        placeholder={isHe ? "כותרת המסמך + URL" : "Document title"}
        style={inputStyle} />
      <input type="text" value={source.publishedAt ?? ""} onChange={(e) => onChange({ publishedAt: e.target.value })}
        placeholder={isHe ? "תאריך פרסום" : "Published"}
        style={inputStyle} />
      <button type="button" onClick={onRemove} title={isHe ? "מחק" : "Delete"}
        style={{ ...miniBtn, color: "#b91c1c", padding: "4px 6px" }}>✕</button>
      <div style={{ gridColumn: "1 / -1" }}>
        <input type="text" value={source.url ?? ""} onChange={(e) => onChange({ url: e.target.value })}
          placeholder="URL"
          style={{ ...inputStyle, fontSize: 10, color: "#6b7280" }} />
      </div>
    </div>
  );
}

// ─── "New document" picker ───────────────────────────────────────────

function NewDocMenu({ lang, onPick }: { lang: string; onPick: (a: BuiltinArtifact) => void }) {
  const [open, setOpen] = useState(false);
  const t = strings[lang as keyof typeof strings];
  return (
    <div style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)} style={miniBtn}>
        + {lang === "he" ? "מסמך חדש" : "New document"}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", insetInlineEnd: 0, zIndex: 50,
          background: "white", border: "1px solid var(--app-border)", borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 6, minWidth: 200,
        }}>
          {BUILTIN_ARTIFACTS.map((a) => (
            <button key={a} type="button" onClick={() => { onPick(a); setOpen(false); }}
              style={{ display: "block", width: "100%", textAlign: "start", padding: "6px 8px", fontSize: 12, border: "none", background: "transparent", cursor: "pointer", borderRadius: 3 }}>
              {t.artifacts[a].title}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Cross-store loader (project doc → matching editor store) ────────

export function loadProjectDocIntoStore(pdoc: ProjectDoc): void {
  const a = pdoc.artifact;
  if (isCustomArtifact(a)) {
    const schemaId = customSchemaIdFrom(a);
    useCustomDocStore.setState((s) => ({
      byId: { ...s.byId, [schemaId]: { values: pdoc.doc as never, design: pdoc.design } },
    }));
    return;
  }
  switch (a) {
    case "kpi":                useKpiStore.setState({ doc: pdoc.doc as never, design: pdoc.design }); break;
    case "job-description":    useJobStore.setState({ doc: pdoc.doc as never, design: pdoc.design }); break;
    case "strategy-document":  useStrategyDocStore.setState({ doc: pdoc.doc as never, design: pdoc.design }); break;
    case "org-structure":      useOrgStructureStore.setState({ doc: pdoc.doc as never, design: pdoc.design }); break;
    case "workflow":           useWorkflowStore.setState({ doc: pdoc.doc as never, design: pdoc.design }); break;
    case "strategy-deck": {
      const d = pdoc.doc as { theme?: string; paletteOverride?: string; customPalette?: unknown } | undefined;
      useStrategyDeckStore.setState({ doc: pdoc.doc as never });
      void d;
      break;
    }
  }
}

// ─── Layout atoms ────────────────────────────────────────────────────

function Card({ title, action, children }: { title: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section style={{ background: "white", border: "1px solid var(--app-border)", borderRadius: 8, padding: 18, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
        <h2 style={{ fontSize: 14, fontWeight: 700, color: "#1e293b" }}>{title}</h2>
        {action}
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block" }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</span>
      {children}
    </label>
  );
}

// ─── Style atoms ─────────────────────────────────────────────────────

const headerBar: CSSProperties = {
  height: 52, display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 1rem", borderBottom: "1px solid var(--app-border)", background: "white",
};
const miniBtn: CSSProperties = {
  fontSize: 12, padding: "5px 10px", border: "1px solid var(--app-border)",
  borderRadius: 4, background: "white", cursor: "pointer",
};
const inputStyle: CSSProperties = {
  width: "100%", padding: "5px 8px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 4,
};
const docCard: CSSProperties = {
  display: "flex", alignItems: "stretch",
  border: "1px solid var(--app-border)", borderRadius: 6, background: "white",
};
const docCardBody: CSSProperties = {
  flex: 1, padding: "10px 12px", textAlign: "start", background: "transparent", border: "none",
};
