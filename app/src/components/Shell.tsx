"use client";

import { useState, type ReactNode } from "react";

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
  artifactTitle,
  form,
  preview,
  onExport,
}: {
  artifactTitle: string;
  form: ReactNode;
  preview: ReactNode;
  onExport?: () => void;
}) {
  const [ds, setDs] = useState<DesignSystem>("editorial");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="h-12 flex items-center justify-between px-4 border-b border-[color:var(--app-border)] bg-white">
        <h1 className="font-display text-base">{artifactTitle}</h1>
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
          <button
            type="button"
            onClick={onExport}
            disabled={!onExport}
            className="text-xs px-3 py-1.5 rounded bg-[color:var(--app-accent)] text-white disabled:opacity-40"
          >
            ייצוא Word
          </button>
        </div>
      </header>

      <div className="flex-1 grid grid-cols-[minmax(0,360px)_minmax(0,1fr)] min-h-0">
        <aside className="border-l border-[color:var(--app-border)] bg-white overflow-y-auto p-4">
          {form}
        </aside>
        <section className="overflow-y-auto p-6">
          <div
            data-ds={ds}
            className="preview-surface mx-auto max-w-3xl rounded shadow-sm border border-[color:var(--app-border)] p-8"
          >
            {preview}
          </div>
        </section>
      </div>
    </div>
  );
}
