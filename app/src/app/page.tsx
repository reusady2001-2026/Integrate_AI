"use client";

import { useCallback } from "react";
import { Shell } from "@/components/Shell";
import { KpiForm } from "@/components/forms/KpiForm";
import { KpiTemplate } from "@/templates/kpis/Template";
import { useKpiStore } from "@/lib/store";
import { renderKpiDocx } from "@/lib/export/kpi-docx";

export default function HomePage() {
  const doc = useKpiStore((s) => s.doc);
  const lang = useKpiStore((s) => s.lang);
  const formatting = useKpiStore((s) => s.formatting);

  const onExport = useCallback(async () => {
    const blob = await renderKpiDocx(doc, lang, formatting);
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpis_${(doc.company || "untitled").replace(/\s+/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [doc, lang, formatting]);

  return (
    <Shell
      artifactTitle="מדדי ביצוע · KPIs & Metrics"
      form={<KpiForm />}
      preview={<KpiTemplate doc={doc} />}
      onExport={onExport}
    />
  );
}
