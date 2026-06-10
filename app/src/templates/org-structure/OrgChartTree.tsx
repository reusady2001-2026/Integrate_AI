"use client";

/**
 * Visual organization-chart renderer.
 *
 * Input: the same ASCII-tree string the store already holds, e.g.
 *   מנכ"ל — Plony
 *   ├── סמנכ"ל א
 *   │   └── מנהל
 *   └── סמנכ"ל ב
 *
 * Output: a hierarchical tree of boxes with connector lines, descending
 * downward from the trunk (root) like roots fanning out beneath it.
 *
 * RTL-aware via CSS logical properties.
 */

import { useMemo, type CSSProperties } from "react";
import styles from "../kpis/Template.module.css";

export type OrgNode = { text: string; children: OrgNode[] };

const INDENT_UNIT_RE = /^(│   |    )/;
const LEAF_MARKER_RE = /^(├── |└── )/;

export function parseOrgTree(input: string): OrgNode[] {
  const lines = input
    .split("\n")
    .map((l) => l.replace(/\r$/, ""))
    .filter((l) => l.trim().length > 0)
    .filter((l) => !/^[│├└─\s]+$/.test(l));

  type Entry = { depth: number; content: string };
  const entries: Entry[] = lines.map((line) => {
    let depth = 0;
    let rest = line;
    while (INDENT_UNIT_RE.test(rest)) {
      depth++;
      rest = rest.slice(4);
    }
    if (LEAF_MARKER_RE.test(rest)) {
      depth++;
      rest = rest.slice(4);
    }
    return { depth, content: rest.trim() };
  });

  const roots: OrgNode[] = [];
  const stack: { node: OrgNode; depth: number }[] = [];

  for (const { depth, content } of entries) {
    const node: OrgNode = { text: content, children: [] };
    while (stack.length > 0 && stack[stack.length - 1].depth >= depth) {
      stack.pop();
    }
    if (stack.length === 0) {
      roots.push(node);
    } else {
      stack[stack.length - 1].node.children.push(node);
    }
    stack.push({ node, depth });
  }

  return roots;
}

export function OrgChartView({ chart }: { chart: string }) {
  const roots = useMemo(() => parseOrgTree(chart), [chart]);
  if (roots.length === 0) return null;
  return (
    <div className={styles.orgChart}>
      {roots.map((r, i) => (
        <OrgNodeView key={i} node={r} isRoot />
      ))}
    </div>
  );
}

function OrgNodeView({ node, isRoot = false }: { node: OrgNode; isRoot?: boolean }) {
  // Split "title — name (notes)" pattern for two-line layout when present.
  const split = splitTitleAndName(node.text);
  const boxClass = isRoot
    ? `${styles.orgBox} ${styles.orgBoxRoot}`
    : styles.orgBox;
  return (
    <div className={styles.orgNode}>
      <div className={boxClass}>
        {split.title && <div className={styles.orgBoxTitle}>{split.title}</div>}
        <div className={styles.orgBoxName}>{split.name || node.text}</div>
        {split.notes && <div className={styles.orgBoxNotes}>{split.notes}</div>}
      </div>
      {node.children.length > 0 && (
        <div className={styles.orgChildren}>
          {node.children.map((c, i) => (
            <OrgNodeView key={i} node={c} />
          ))}
        </div>
      )}
    </div>
  );
}

function splitTitleAndName(text: string): { title?: string; name?: string; notes?: string } {
  // "Title — Name (notes)" pattern: em-dash or " - " between role and name.
  const dashSplit = text.match(/^(.+?)\s+[—–-]\s+(.+)$/);
  if (!dashSplit) return { name: text };
  const title = dashSplit[1].trim();
  let rest = dashSplit[2].trim();
  let notes: string | undefined;
  const parenStart = rest.indexOf("(");
  if (parenStart > 0 && rest.endsWith(")")) {
    notes = rest.slice(parenStart).trim();
    rest = rest.slice(0, parenStart).trim();
  }
  return { title, name: rest, notes };
}

// Unused, exported for potential future toggle
export const ORG_CHART_INLINE_STYLES: CSSProperties = {};
