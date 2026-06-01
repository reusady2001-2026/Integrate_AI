"use client";

import { useCallback } from "react";
import { Shell } from "@/components/Shell";
import { KpiForm } from "@/components/forms/KpiForm";
import { JobForm } from "@/components/forms/JobForm";
import { KpiTemplate } from "@/templates/kpis/Template";
import { JobTemplate } from "@/templates/job-description/Template";
import { useKpiStore } from "@/lib/store";
import { useJobStore } from "@/lib/job-store";
import { useAppStore } from "@/lib/app-store";
import { renderKpiDocx } from "@/lib/export/kpi-docx";
import { renderJobDocx } from "@/lib/export/job-docx";

export default function HomePage() {
  const artifact = useAppStore((s) => s.artifact);
  const lang = useAppStore((s) => s.lang);
  const formatting = useAppStore((s) => s.formatting);
  const kpiDoc = useKpiStore((s) => s.doc);
  const jobDoc = useJobStore((s) => s.doc);

  const onExport = useCallback(async () => {
    const isKpi = artifact === "kpi";
    const blob = isKpi
      ? await renderKpiDocx(kpiDoc, lang, formatting)
      : await renderJobDocx(jobDoc, lang, formatting);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const name = isKpi ? (kpiDoc.company || "untitled") : (jobDoc.title || "untitled");
    const prefix = isKpi ? "kpis" : "job";
    a.download = `${prefix}_${name.replace(/\s+/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [artifact, kpiDoc, jobDoc, lang, formatting]);

  return (
    <Shell
      form={artifact === "kpi" ? <KpiForm /> : <JobForm />}
      preview={artifact === "kpi" ? <KpiTemplate doc={kpiDoc} /> : <JobTemplate doc={jobDoc} />}
      onExport={onExport}
    />
  );
}
