"use client";

import { useCallback } from "react";
import { Shell } from "@/components/Shell";
import { LandingPage } from "@/components/LandingPage";
import { KpiTemplate } from "@/templates/kpis/Template";
import { JobTemplate } from "@/templates/job-description/Template";
import { StrategyDocumentTemplate } from "@/templates/strategy-document/Template";
import { DeckEditor } from "@/templates/strategy-deck/DeckEditor";
import { OrgStructureTemplate } from "@/templates/org-structure/Template";
import { WorkflowTemplate } from "@/templates/workflows/Template";
import { CustomDocTemplate } from "@/templates/custom/Template";
import { useKpiStore } from "@/lib/store";
import { useJobStore } from "@/lib/job-store";
import { useStrategyDocStore } from "@/lib/strategy-doc-store";
import { useOrgStructureStore } from "@/lib/org-structure-store";
import { useWorkflowStore } from "@/lib/workflow-store";
import { useAppStore, isCustomArtifact, customSchemaIdFrom } from "@/lib/app-store";
import { resolveDocTheme } from "@/lib/themes/doc-themes";
import { renderKpiDocx } from "@/lib/export/kpi-docx";
import { renderJobDocx } from "@/lib/export/job-docx";
import { renderStrategyDocDocx } from "@/lib/export/strategy-doc-docx";
import { renderOrgStructureDocx } from "@/lib/export/org-structure-docx";
import { renderWorkflowDocx } from "@/lib/export/workflow-docx";

export default function HomePage() {
  const view = useAppStore((s) => s.view);
  const artifact = useAppStore((s) => s.artifact);
  const lang = useAppStore((s) => s.lang);
  const formatting = useAppStore((s) => s.formatting);
  const kpiDoc = useKpiStore((s) => s.doc);
  const kpiDesign = useKpiStore((s) => s.design);
  const jobDoc = useJobStore((s) => s.doc);
  const jobDesign = useJobStore((s) => s.design);
  const sdocDoc = useStrategyDocStore((s) => s.doc);
  const sdocDesign = useStrategyDocStore((s) => s.design);
  const orgDoc = useOrgStructureStore((s) => s.doc);
  const orgDesign = useOrgStructureStore((s) => s.design);
  const wfDoc = useWorkflowStore((s) => s.doc);
  const wfDesign = useWorkflowStore((s) => s.design);

  const onExport = useCallback(async () => {
    let blob: Blob;
    let name: string;
    let prefix: string;
    // The export receives the SAME resolved design the on-screen document
    // renders with, so the .docx mirrors the app's typography and styling.
    const eff = (d: Parameters<typeof resolveDocTheme>[1]) => resolveDocTheme(d.theme, d);
    switch (artifact) {
      case "kpi":
        blob = await renderKpiDocx(kpiDoc, lang, formatting, eff(kpiDesign));
        name = kpiDoc.company || "untitled"; prefix = "kpis"; break;
      case "job-description":
        blob = await renderJobDocx(jobDoc, lang, formatting, eff(jobDesign));
        name = jobDoc.title || "untitled"; prefix = "job"; break;
      case "strategy-document":
        blob = await renderStrategyDocDocx(sdocDoc, lang, formatting, eff(sdocDesign));
        name = sdocDoc.company || "untitled"; prefix = "strategy"; break;
      case "org-structure":
        blob = await renderOrgStructureDocx(orgDoc, lang, formatting, eff(orgDesign));
        name = orgDoc.company || "untitled"; prefix = "org"; break;
      case "workflow":
        blob = await renderWorkflowDocx(wfDoc, lang, formatting, eff(wfDesign));
        name = wfDoc.name || "untitled"; prefix = "workflow"; break;
      default:
        return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${prefix}_${name.replace(/\s+/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [artifact, kpiDoc, jobDoc, sdocDoc, orgDoc, wfDoc, lang, formatting, kpiDesign, jobDesign, sdocDesign, orgDesign, wfDesign]);

  if (view === "home") return <LandingPage />;

  // Strategy deck has its own full-page editor
  if (artifact === "strategy-deck") return <DeckEditor />;

  if (isCustomArtifact(artifact)) {
    return <Shell preview={<CustomDocTemplate schemaId={customSchemaIdFrom(artifact)} />} />;
  }

  const template = (() => {
    switch (artifact) {
      case "kpi": return <KpiTemplate />;
      case "job-description": return <JobTemplate />;
      case "strategy-document": return <StrategyDocumentTemplate />;
      case "org-structure": return <OrgStructureTemplate />;
      case "workflow": return <WorkflowTemplate />;
    }
  })();

  return <Shell preview={template} onExport={onExport} />;
}
