"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import {
  useAppStore, isCustomArtifact, customSchemaIdFrom, type Artifact,
} from "@/lib/app-store";
import { useProjectsStore } from "@/lib/projects-store";
import { useKpiStore } from "@/lib/store";
import { useJobStore } from "@/lib/job-store";
import { useStrategyDocStore } from "@/lib/strategy-doc-store";
import { useStrategyDeckStore } from "@/lib/strategy-deck-store";
import { useOrgStructureStore } from "@/lib/org-structure-store";
import { useWorkflowStore } from "@/lib/workflow-store";
import { useCustomDocStore } from "@/lib/custom-doc-store";
import { labelText, type LocalizedLabel } from "@/lib/user-designs";

function snapshotCurrentArtifact(artifact: Artifact) {
  if (isCustomArtifact(artifact)) {
    const schemaId = customSchemaIdFrom(artifact);
    const docState = useCustomDocStore.getState().byId[schemaId];
    return { doc: docState?.values ?? {}, design: docState?.design };
  }
  switch (artifact) {
    case "kpi":                { const s = useKpiStore.getState();           return { doc: s.doc, design: s.design }; }
    case "job-description":    { const s = useJobStore.getState();           return { doc: s.doc, design: s.design }; }
    case "strategy-document":  { const s = useStrategyDocStore.getState();   return { doc: s.doc, design: s.design }; }
    case "org-structure":      { const s = useOrgStructureStore.getState(); return { doc: s.doc, design: s.design }; }
    case "workflow":           { const s = useWorkflowStore.getState();      return { doc: s.doc, design: s.design }; }
    case "strategy-deck":      { const s = useStrategyDeckStore.getState();  return { doc: s.doc, design: undefined }; }
  }
}

export function SaveToProjectButton() {
  const lang = useAppStore((s) => s.lang);
  const artifact = useAppStore((s) => s.artifact);
  const activeProjectDocId = useAppStore((s) => s.activeProjectDocId);
  const currentProjectId = useAppStore((s) => s.currentProjectId);
  const isHe = lang === "he";

  const hydrate = useProjectsStore((s) => s.hydrate);
  const projects = useProjectsStore((s) => s.projects);
  const saveDoc = useProjectsStore((s) => s.saveDoc);
  const createProject = useProjectsStore((s) => s.createProject);
  const docsMap = useProjectsStore((s) => s.docs);
  useEffect(() => { hydrate(); }, [hydrate]);

  const [open, setOpen] = useState(false);
  const [pickedProjectId, setPickedProjectId] = useState<string>("");
  const [docName, setDocName] = useState("");
  const [newProjectName, setNewProjectName] = useState("");
  const [creatingNew, setCreatingNew] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Pre-fill from binding when popover opens
  useEffect(() => {
    if (!open) return;
    if (activeProjectDocId) {
      const bound = docsMap[activeProjectDocId];
      if (bound) {
        setPickedProjectId(bound.projectId);
        setDocName(labelText(bound.name, lang));
      }
    } else if (currentProjectId) {
      setPickedProjectId(currentProjectId);
    } else if (projects.length > 0 && !pickedProjectId) {
      setPickedProjectId(projects[0].id);
    }
  }, [open, activeProjectDocId, currentProjectId, projects, docsMap, lang, pickedProjectId]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!popoverRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const handleSave = () => {
    let projectId = pickedProjectId;
    if (creatingNew) {
      if (!newProjectName.trim()) return;
      const slug = newProjectName.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9\-]/g, "").slice(0, 32) || `prj-${Date.now()}`;
      const labelName: LocalizedLabel = isHe ? { he: newProjectName.trim() } : { en: newProjectName.trim() };
      const project = createProject(labelName, slug);
      projectId = project.id;
    }
    if (!projectId) return;
    const snap = snapshotCurrentArtifact(artifact);
    if (!snap || !snap.design) return;
    const labelDocName: LocalizedLabel = isHe ? { he: docName.trim() || "ללא שם" } : { en: docName.trim() || "Untitled" };
    const saved = saveDoc({
      projectId, artifact,
      name: labelDocName,
      doc: snap.doc,
      design: snap.design,
      docId: activeProjectDocId ?? undefined,
    });
    useAppStore.setState({ activeProjectDocId: saved.id, currentProjectId: projectId });
    setOpen(false);
    setCreatingNew(false);
    setNewProjectName("");
  };

  const labelText_ = (() => {
    if (activeProjectDocId) {
      const bound = docsMap[activeProjectDocId];
      const projName = bound ? projects.find((p) => p.id === bound.projectId)?.name : undefined;
      if (projName) return (isHe ? "שמור ב־" : "Save to ") + (labelText(projName, lang) || "—");
    }
    return isHe ? "שמור בפרויקט" : "Save to project";
  })();

  return (
    <div ref={popoverRef} style={{ position: "relative" }}>
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="text-xs px-3 py-1.5 rounded border border-[color:var(--app-border)] hover:bg-neutral-50">
        {labelText_}
      </button>
      {open && (
        <div style={{
          position: "absolute", top: "calc(100% + 4px)", insetInlineEnd: 0, zIndex: 100,
          background: "white", border: "1px solid var(--app-border)", borderRadius: 6,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)", padding: 14, width: 320,
        }} dir={isHe ? "rtl" : "ltr"}>
          <div style={{ fontSize: 12, fontWeight: 700, marginBottom: 10 }}>
            {activeProjectDocId ? (isHe ? "עדכן את המסמך השמור" : "Update saved doc") : (isHe ? "שמור בפרויקט" : "Save to project")}
          </div>

          {!creatingNew ? (
            <>
              <Field label={isHe ? "פרויקט" : "Project"}>
                <select value={pickedProjectId} onChange={(e) => setPickedProjectId(e.target.value)} style={inputStyle}>
                  {projects.length === 0 && <option value="">{isHe ? "אין פרויקטים" : "No projects"}</option>}
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>{labelText(p.name, lang) || (isHe ? "ללא שם" : "Untitled")}</option>
                  ))}
                </select>
              </Field>
              <button type="button" onClick={() => setCreatingNew(true)}
                style={{ background: "none", border: "none", color: "var(--app-accent)", fontSize: 11, cursor: "pointer", padding: 0, marginBottom: 8 }}>
                + {isHe ? "צור פרויקט חדש" : "Create new project"}
              </button>
            </>
          ) : (
            <Field label={isHe ? "שם פרויקט חדש" : "New project name"}>
              <input type="text" autoFocus value={newProjectName} onChange={(e) => setNewProjectName(e.target.value)}
                style={inputStyle} />
              <button type="button" onClick={() => setCreatingNew(false)}
                style={{ background: "none", border: "none", color: "var(--app-muted)", fontSize: 11, cursor: "pointer", padding: 0, marginTop: 4 }}>
                ← {isHe ? "בחר פרויקט קיים" : "Pick existing project"}
              </button>
            </Field>
          )}

          <Field label={isHe ? "שם המסמך" : "Document name"}>
            <input type="text" value={docName} onChange={(e) => setDocName(e.target.value)}
              placeholder={isHe ? "לדוגמה: KPIs ל־CFO" : "e.g., CFO KPIs"}
              style={inputStyle} />
          </Field>

          <div style={{ display: "flex", gap: 6, marginTop: 10 }}>
            <button type="button" onClick={handleSave}
              disabled={!creatingNew && !pickedProjectId}
              style={{ flex: 1, ...primaryBtn }}>
              {activeProjectDocId ? (isHe ? "עדכן" : "Update") : (isHe ? "שמור" : "Save")}
            </button>
            <button type="button" onClick={() => setOpen(false)} style={{ flex: 1, ...secondaryBtn }}>
              {isHe ? "ביטול" : "Cancel"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: "#374151", marginBottom: 4 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle: CSSProperties = {
  width: "100%", padding: "5px 8px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 4, background: "white",
};
const primaryBtn: CSSProperties = {
  padding: "5px 0", fontSize: 12, border: "1px solid var(--app-accent)",
  borderRadius: 4, background: "var(--app-accent)", color: "white", cursor: "pointer",
};
const secondaryBtn: CSSProperties = {
  padding: "5px 0", fontSize: 12, border: "1px solid var(--app-border)",
  borderRadius: 4, background: "white", color: "#6b7280", cursor: "pointer",
};
