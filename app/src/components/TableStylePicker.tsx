"use client";

import type { TableStyle, TableStyleDef } from "@/lib/formatting";
import { TABLE_STYLE_DEFS } from "@/lib/formatting";

// SVG grid constants
const W = 82;
const H = 56;
const COLS = [0, 28, 55, W];
const ROWS = [0, 16, 28, 40, H];

function resolveColor(
  key: "white" | "light" | "medium" | "accent" | "dark" | "accent-light" | "none",
  accent: string,
): string {
  const a = accent.replace(/^#/, "");
  const ar = parseInt(a.slice(0, 2), 16);
  const ag = parseInt(a.slice(2, 4), 16);
  const ab = parseInt(a.slice(4, 6), 16);
  const mix = (c: number, w: number) => Math.round(c + (255 - c) * w);
  const hex = (n: number) => n.toString(16).padStart(2, "0");
  const tint = (w: number) => `#${hex(mix(ar, w))}${hex(mix(ag, w))}${hex(mix(ab, w))}`;

  switch (key) {
    case "white":       return "#ffffff";
    case "light":       return tint(0.88);
    case "medium":      return tint(0.72);
    case "accent":      return `#${a}`;
    case "accent-light": return tint(0.93);
    case "dark":        return "#1a1a1a";
    case "none":        return "#ffffff";
  }
}

function TableMiniSvg({ def, accent }: { def: TableStyleDef; accent: string }) {
  const headerBg = resolveColor(def.headerBg, accent);
  const headerFg = def.headerFg === "white" ? "#ffffff" : "#1a1a1a";
  const altBg = def.altRows ? resolveColor(def.altBg, accent) : "#ffffff";

  const outerStroke = def.outerBorder === "thick" ? 2 : def.outerBorder === "normal" ? 1.2 : def.outerBorder === "thin" ? 0.7 : 0;
  const innerHStroke = def.innerH === "normal" ? 0.8 : def.innerH === "thin" ? 0.5 : 0;
  const innerVStroke = def.innerV === "normal" ? 0.8 : def.innerV === "thin" ? 0.5 : 0;
  const headerBottomStroke = def.headerBottomBold ? 1.5 : 0;
  const borderColor = "#888";
  const accentBorder = `#${accent.replace(/^#/, "")}`;

  // Cell content bars (simulated text)
  const bar = (x: number, y: number, w: number, h: number, color: string) => (
    <rect x={x} y={y} width={w} height={h} rx={1} fill={color} />
  );

  const contentFg = (fg: string) => fg === "#ffffff" ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.18)";

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={W}
      height={H}
      xmlns="http://www.w3.org/2000/svg"
      className="block"
    >
      {/* Row backgrounds */}
      <rect x={0} y={ROWS[0]} width={W} height={ROWS[1] - ROWS[0]} fill={headerBg} />
      <rect x={0} y={ROWS[1]} width={W} height={ROWS[2] - ROWS[1]} fill="#ffffff" />
      <rect x={0} y={ROWS[2]} width={W} height={ROWS[3] - ROWS[2]} fill={def.altRows ? altBg : "#ffffff"} />
      <rect x={0} y={ROWS[3]} width={W} height={ROWS[4] - ROWS[3]} fill="#ffffff" />

      {/* Cell content bars - header */}
      {bar(COLS[0] + 4, ROWS[0] + 5, 16, 4, contentFg(headerFg))}
      {bar(COLS[1] + 4, ROWS[0] + 5, 13, 4, contentFg(headerFg))}
      {bar(COLS[2] + 4, ROWS[0] + 5, 13, 4, contentFg(headerFg))}

      {/* Cell content bars - rows */}
      {[1, 2, 3].map((row) =>
        [0, 1, 2].map((col) => (
          <rect
            key={`${row}-${col}`}
            x={COLS[col] + 4}
            y={ROWS[row] + (ROWS[row + 1] - ROWS[row]) / 2 - 2}
            width={col === 0 ? 14 : 11}
            height={3}
            rx={1}
            fill="rgba(0,0,0,0.13)"
          />
        ))
      )}

      {/* Inner vertical lines */}
      {innerVStroke > 0 && [1, 2].map((ci) => (
        <line
          key={ci}
          x1={COLS[ci]} y1={ROWS[0]}
          x2={COLS[ci]} y2={ROWS[4]}
          stroke={borderColor}
          strokeWidth={innerVStroke}
        />
      ))}

      {/* Inner horizontal lines */}
      {innerHStroke > 0 && [2, 3].map((ri) => (
        <line
          key={ri}
          x1={COLS[0]} y1={ROWS[ri]}
          x2={COLS[3]} y2={ROWS[ri]}
          stroke={borderColor}
          strokeWidth={innerHStroke}
        />
      ))}

      {/* Header bottom line */}
      {headerBottomStroke > 0 && (
        <line
          x1={COLS[0]} y1={ROWS[1]}
          x2={COLS[3]} y2={ROWS[1]}
          stroke={def.headerBg === "accent" || def.headerBg === "dark" ? accentBorder : accentBorder}
          strokeWidth={headerBottomStroke}
        />
      )}

      {/* Outer border */}
      {outerStroke > 0 && (
        <rect
          x={outerStroke / 2}
          y={outerStroke / 2}
          width={W - outerStroke}
          height={H - outerStroke}
          fill="none"
          stroke={def.outerBorder === "thick" ? accentBorder : borderColor}
          strokeWidth={outerStroke}
        />
      )}
    </svg>
  );
}

export function TableStylePicker({
  value,
  onChange,
  accent,
  lang,
}: {
  value: TableStyle;
  onChange: (s: TableStyle) => void;
  accent: string;
  lang: "he" | "en";
}) {
  const styles = Object.entries(TABLE_STYLE_DEFS) as [TableStyle, TableStyleDef][];

  return (
    <div className="grid grid-cols-3 gap-1.5">
      {styles.map(([key, def]) => {
        const label = lang === "he" ? def.nameHe : def.nameEn;
        const isActive = key === value;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onChange(key)}
            title={label}
            className={`flex flex-col items-center gap-1 rounded p-1 border transition-colors ${
              isActive
                ? "border-[color:var(--app-accent)] bg-[color:var(--app-accent)]/5 ring-1 ring-[color:var(--app-accent)]"
                : "border-[color:var(--app-border)] hover:bg-neutral-50"
            }`}
          >
            <div className="overflow-hidden rounded-sm border border-neutral-200">
              <TableMiniSvg def={def} accent={accent.replace(/^#/, "")} />
            </div>
            <span
              className={`text-[10px] text-center leading-tight ${
                isActive ? "font-bold text-[color:var(--app-accent)]" : "text-[color:var(--app-muted)]"
              }`}
            >
              {label}
            </span>
          </button>
        );
      })}
    </div>
  );
}
