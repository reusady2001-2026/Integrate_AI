"use client";

/**
 * Shared engine for every deck design.
 *
 * The look of each design lives in its own file; what they all share is:
 *   - AutoFit: measures a slide's natural content and uniformly scales the
 *     WHOLE block down (transform: scale) until it fits the 960×540 frame.
 *     Nothing is ever clipped, overlapped, or pushed off the slide.
 *   - T: an inline-editable text node (contentEditable when interactive,
 *     plain span otherwise) wired to the deck store.
 *   - DesignCtx: palette + language + edit handlers passed to a design.
 *   - color helpers + numeral auto-sizing.
 *
 * Designs never hardcode physical left/right for text — they use logical
 * `start`/`end` so Hebrew aligns right and English aligns left from the
 * same code.
 */

import {
  useRef, useState, useEffect, useLayoutEffect,
  type CSSProperties, type ReactNode,
} from "react";
import { Editable } from "@/components/Editable";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { Palette, FontPair } from "@/lib/themes/deck-themes";

// 16:9 reference canvas every design renders into.
export const W = 960;
export const H = 540;

// SSR-safe layout effect (static export renders on the server once).
export const useIsoLayout = typeof window === "undefined" ? useEffect : useLayoutEffect;

export type DesignCtx = {
  palette: Palette;
  font: FontPair;
  isRtl: boolean;
  company: string;
  date: string;
  pageNumber?: number;
  totalPages?: number;
  interactive?: boolean;
  onChange?: (patch: Partial<Slide>) => void;
};

// ── Color helpers ─────────────────────────────────────────────────────
export function rgba(hex: string, a: number): string {
  const h = (hex || "").replace(/^#/, "");
  if (h.length !== 6) return hex;
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r},${g},${b},${a})`;
}
export function shiftHex(hex: string, d: number): string {
  const h = (hex || "").replace(/^#/, "");
  if (h.length !== 6) return hex;
  const ch = (i: number) => Math.max(0, Math.min(255, parseInt(h.slice(i, i + 2), 16) + d)).toString(16).padStart(2, "0");
  return `#${ch(0)}${ch(2)}${ch(4)}`;
}
export function isDarkHex(hex: string): boolean {
  const h = (hex || "").replace(/^#/, "");
  if (h.length !== 6) return false;
  const r = parseInt(h.slice(0, 2), 16), g = parseInt(h.slice(2, 4), 16), b = parseInt(h.slice(4, 6), 16);
  return r * 0.299 + g * 0.587 + b * 0.114 < 140;
}

// Auto-shrink a numeral by length so a long value doesn't dominate its
// slot before the global AutoFit kicks in.
export function numSize(value: string, base: number): number {
  const n = String(value || "").length;
  if (n <= 2) return base;
  if (n <= 3) return base * 0.92;
  if (n <= 4) return base * 0.78;
  if (n <= 5) return base * 0.64;
  if (n <= 7) return base * 0.52;
  return base * 0.42;
}

// ──────────────────────────────────────────────────────────────────────
// AutoFit — the universal overflow guarantee.
// transform: scale doesn't affect layout, so scrollHeight stays the
// natural size and the measurement never feeds back on itself. A
// ResizeObserver re-fits live while the user edits text.
// ──────────────────────────────────────────────────────────────────────
export function AutoFit({
  availW, availH, isRtl, children, alignTop,
}: { availW: number; availH: number; isRtl: boolean; children: ReactNode; alignTop?: boolean }) {
  const ref = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useIsoLayout(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const h = el.scrollHeight;
      const w = el.scrollWidth;
      if (!h || !w) return;
      const s = Math.min(1, availH / h, availW / w);
      setScale((prev) => (Math.abs(prev - s) > 0.004 ? s : prev));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    const f = (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts;
    if (f?.ready) f.ready.then(measure).catch(() => {});
    return () => ro.disconnect();
  });

  return (
    <div style={{
      width: availW, height: availH, overflow: "hidden",
      display: "flex",
      alignItems: alignTop ? "flex-start" : "center",
      justifyContent: "center",
    }}>
      <div ref={ref} style={{
        width: availW,
        transform: `scale(${scale})`,
        transformOrigin: alignTop ? (isRtl ? "top right" : "top left") : "center",
      }}>
        {children}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────
// T — inline editable text. When interactive, a contentEditable span
// wired to onCh; otherwise a plain span with identical styling.
// ──────────────────────────────────────────────────────────────────────
export function T({ v, onCh, ed, style, block, ph }: {
  v: string; onCh?: (v: string) => void; ed?: boolean;
  style?: CSSProperties; block?: boolean; ph?: string;
}) {
  const base: CSSProperties = { overflowWrap: "break-word", wordBreak: "break-word", ...style };
  if (ed && onCh) {
    return <Editable value={v || ""} onChange={onCh} block={block} placeholder={ph} style={base} />;
  }
  return <span style={{ ...base, whiteSpace: block ? "pre-wrap" : "normal", display: block ? "block" : "inline" }}>{v || ""}</span>;
}
