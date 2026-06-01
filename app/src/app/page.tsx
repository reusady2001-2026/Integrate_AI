"use client";

import { useCallback } from "react";
import { Shell } from "@/components/Shell";
import { KpiForm } from "@/components/forms/KpiForm";
import { KpiTemplate } from "@/templates/kpis/Template";
import { useKpiStore } from "@/lib/store";

export default function HomePage() {
  const doc = useKpiStore((s) => s.doc);

  const onExport = useCallback(async () => {
    const res = await fetch("/api/export/kpis", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(doc),
    });
    if (!res.ok) {
      const text = await res.text();
      alert(`Export failed: ${text}`);
      return;
    }
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `kpis_${(doc.company || "untitled").replace(/\s+/g, "_")}.docx`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }, [doc]);

  return (
    <Shell
      artifactTitle="מדדי ביצוע · KPIs & Metrics"
      form={<KpiForm />}
      preview={<KpiTemplate doc={doc} />}
      onExport={onExport}
    />
  );
}
