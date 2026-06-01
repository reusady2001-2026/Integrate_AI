"use client";

import { useState, useRef, useEffect } from "react";
import { useKpiStore } from "@/lib/store";
import { FONT_LABELS, type FontFamily } from "@/lib/formatting";
import { TableStylePicker } from "./TableStylePicker";

export function FormattingPanel() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const lang = useKpiStore((s) => s.lang);
  const formatting = useKpiStore((s) => s.formatting);
  const setFormatting = useKpiStore((s) => s.setFormatting);
  const resetFormatting = useKpiStore((s) => s.resetFormatting);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const isHe = lang === "he";

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
      >
        {isHe ? "עיצוב" : "Formatting"}
      </button>
      {open && (
        <div
          className="absolute top-full mt-1 end-0 w-80 bg-white border border-[color:var(--app-border)] rounded shadow-lg p-3 z-50 space-y-4 text-xs"
          dir={isHe ? "rtl" : "ltr"}
        >
          <Row label={isHe ? "גופן" : "Font"}>
            <select
              value={formatting.fontFamily}
              onChange={(e) => setFormatting({ fontFamily: e.target.value as FontFamily })}
              className="w-full text-xs bg-white border border-[color:var(--app-border)] rounded px-2 py-1"
            >
              {(Object.keys(FONT_LABELS) as FontFamily[]).map((f) => (
                <option key={f} value={f}>
                  {FONT_LABELS[f]}
                </option>
              ))}
            </select>
          </Row>

          <Row label={isHe ? `גודל טקסט — ${formatting.fontSize}pt` : `Font size — ${formatting.fontSize}pt`}>
            <input
              type="range"
              min={8}
              max={16}
              step={0.5}
              value={formatting.fontSize}
              onChange={(e) => setFormatting({ fontSize: Number(e.target.value) })}
              className="w-full"
            />
          </Row>

          <Row label={isHe ? "צבע כותרות" : "Heading color"}>
            <input
              type="color"
              value={formatting.headingColor}
              onChange={(e) => setFormatting({ headingColor: e.target.value })}
              className="w-full h-7 bg-white border border-[color:var(--app-border)] rounded cursor-pointer"
            />
          </Row>

          <div>
            <span className="block text-xs font-bold mb-2 text-[color:var(--app-fg)]">
              {isHe ? "סגנון טבלה" : "Table style"}
            </span>
            <TableStylePicker
              value={formatting.tableStyle}
              onChange={(s) => setFormatting({ tableStyle: s })}
              accent={formatting.headingColor}
              lang={lang}
            />
          </div>

          <button
            type="button"
            onClick={resetFormatting}
            className="w-full text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
          >
            {isHe ? "איפוס לברירת מחדל" : "Reset to defaults"}
          </button>
        </div>
      )}
    </div>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-bold mb-1 text-[color:var(--app-fg)]">{label}</span>
      {children}
    </label>
  );
}
