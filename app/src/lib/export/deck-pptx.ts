"use client";

import { createElement } from "react";
import { createRoot, type Root } from "react-dom/client";
import type { Lang } from "@/lib/i18n";
import type { StrategyDeck } from "@/lib/schemas/strategy-deck";
import { DECK_THEMES, type DeckTheme } from "@/lib/themes/deck-themes";
import { SlideView, SLIDE_W as PXW, SLIDE_H as PXH } from "@/templates/strategy-deck/SlideView";

// ──────────────────────────────────────────────────────────────────────
// PowerPoint export — DOM→PPTX transpiler.
//
// Earlier exporters re-built one generic, card-based layout and only
// recoloured it per design. That made every one of the 10 designs export
// the same — nothing like the app. This exporter instead renders each
// slide's REAL design off-screen (the exact same React renderer the app
// uses), lets it lay out (fonts, RTL, AutoFit scale-to-fit), then walks
// the laid-out DOM and translates every painted box, rule and text
// fragment into native, editable PowerPoint objects at their measured
// positions.
//
// Because it reads the browser's post-layout geometry, three hard problems
// solve themselves:
//   • Design fidelity — whatever the chosen design paints is what we emit.
//   • RTL — Hebrew fragments land where the browser's bidi engine placed
//     them; no manual run-reordering, no mirrored tables.
//   • Overflow / scaling — AutoFit has already shrunk the slide to fit, so
//     measured coordinates are the final on-screen ones.
//
// Decorative CSS that PowerPoint can't express (radial-gradient glows,
// box-shadows, blurs) is dropped; linear gradients collapse to their mid
// stop. Everything structural — layout, cards, rules, colour, typography,
// text — is reproduced, and every text box stays editable.
// ──────────────────────────────────────────────────────────────────────

const INW = 10;            // pptx slide width  (inches, 16:9)
const INH = 5.625;         // pptx slide height (inches)
const PX2IN = INW / PXW;   // 960px → 10in   (96 px/in)
const PX2PT = 72 / 96;     // px → points

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Pptx = any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type PSlide = any;

type RectOp = {
  t: "rect";
  shape: "rect" | "roundRect" | "ellipse";
  x: number; y: number; w: number; h: number;
  fill?: { color: string; transparency: number };
  line?: { color: string; width: number; transparency: number };
  radius?: number;
};
type TextOp = {
  t: "text";
  x: number; y: number; w: number; h: number;
  text: string;
  color: string;
  size: number;       // pt
  bold: boolean;
  italic: boolean;
  face: string;
  align: "left" | "right" | "center";
  rtl: boolean;
  charSpacing: number;
};
type ImageOp = { t: "image"; x: number; y: number; w: number; h: number; data: string };
type Op = RectOp | TextOp | ImageOp;

// ── colour helpers ────────────────────────────────────────────────────
function clampByte(n: number): number {
  return Math.max(0, Math.min(255, Math.round(n)));
}
function hx(n: number): string {
  return clampByte(n).toString(16).padStart(2, "0");
}
// Parse any CSS colour the browser hands back ("rgb(...)", "rgba(...)",
// "#rgb"/"#rrggbb"). Returns hex (no #) + alpha, or null if fully clear.
function parseColor(c: string | null | undefined): { hex: string; a: number } | null {
  if (!c) return null;
  const s = c.trim().toLowerCase();
  if (!s || s === "transparent" || s === "none") return null;
  const rgb = s.match(/rgba?\(([^)]+)\)/);
  if (rgb) {
    const parts = rgb[1].split(/[,/]/).map((p) => p.trim());
    const r = parseFloat(parts[0]);
    const g = parseFloat(parts[1]);
    const b = parseFloat(parts[2]);
    const a = parts[3] !== undefined ? parseFloat(parts[3]) : 1;
    if (a <= 0.01) return null;
    return { hex: hx(r) + hx(g) + hx(b), a };
  }
  if (s[0] === "#") {
    let h = s.slice(1);
    if (h.length === 3) h = h.split("").map((ch) => ch + ch).join("");
    if (h.length === 6 || h.length === 8) {
      const a = h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1;
      if (a <= 0.01) return null;
      return { hex: h.slice(0, 6), a };
    }
  }
  return null;
}
// Collapse a linear-gradient to a single representative colour (mid stop).
// Radial gradients are decorative glows — skipped.
function gradientSolid(bg: string | null | undefined): { hex: string; a: number } | null {
  if (!bg || bg === "none") return null;
  if (/radial-gradient/.test(bg)) return null;
  if (!/linear-gradient/.test(bg)) return null;
  const toks = bg.match(/rgba?\([^)]*\)|#[0-9a-fA-F]{3,8}/g);
  if (!toks) return null;
  const cols = toks.map(parseColor).filter((c): c is { hex: string; a: number } => !!c);
  if (!cols.length) return null;
  return cols[Math.floor(cols.length / 2)];
}
function transpOf(a: number, inheritedOpacity: number): number {
  return Math.round((1 - a * inheritedOpacity) * 100);
}
// Alpha-composite `top` (hex, alpha a) over an opaque `under` hex.
function blendHex(top: string, a: number, under: string): string {
  const ch = (h: string, i: number) => parseInt(h.slice(i, i + 2), 16);
  const mix = (i: number) => hx(ch(top, i) * a + ch(under, i) * (1 - a));
  return mix(0) + mix(2) + mix(4);
}
function firstFace(family: string | undefined): string {
  if (!family) return "Heebo";
  const first = family.split(",")[0].replace(/['"]/g, "").trim();
  return first || "Heebo";
}

// ── DOM walk ──────────────────────────────────────────────────────────
function isHidden(st: CSSStyleDeclaration): boolean {
  return st.display === "none" || st.visibility === "hidden" || parseFloat(st.opacity || "1") === 0;
}
function radiusPx(st: CSSStyleDeclaration): number {
  const vals = [st.borderTopLeftRadius, st.borderTopRightRadius, st.borderBottomLeftRadius, st.borderBottomRightRadius]
    .map((v) => parseFloat(v) || 0);
  return Math.min(...vals);
}
function mapAlign(st: CSSStyleDeclaration, rtl: boolean): "left" | "right" | "center" {
  const a = st.textAlign;
  if (a === "center" || a === "justify") return "center";
  if (a === "right") return "right";
  if (a === "left") return "left";
  if (a === "end") return rtl ? "left" : "right";
  // "start" / default
  return rtl ? "right" : "left";
}
function applyTransform(text: string, tt: string): string {
  if (tt === "uppercase") return text.toUpperCase();
  if (tt === "lowercase") return text.toLowerCase();
  if (tt === "capitalize") return text.replace(/\b\w/g, (m) => m.toUpperCase());
  return text;
}

type GradTask = { xPx: number; yPx: number; wPx: number; hPx: number; image: string };

function buildOps(root: HTMLElement): { ops: Op[]; svgTasks: { el: SVGElement; x: number; y: number; w: number; h: number }[]; gradTasks: GradTask[]; bg: string } {
  const base = root.getBoundingClientRect();
  const ops: Op[] = [];
  const svgTasks: { el: SVGElement; x: number; y: number; w: number; h: number }[] = [];
  const gradTasks: GradTask[] = [];
  let bg = "ffffff";
  let bgArea = 0;

  const toIn = (px: number) => px * PX2IN;
  const rel = (r: DOMRect) => ({
    x: toIn(r.left - base.left),
    y: toIn(r.top - base.top),
    w: toIn(r.width),
    h: toIn(r.height),
  });

  // Emits the element's fill/borders. Returns the backdrop colour now behind
  // the element's content (its fill composited over the inherited backdrop).
  function emitBox(el: HTMLElement, st: CSSStyleDeclaration, op: ReturnType<typeof rel>, opacity: number, backdrop: string): string {
    if (op.w <= 0.003 || op.h <= 0.003) return backdrop;
    const rad = radiusPx(st);
    // Clamp to half the shorter side: a roundRect's adjust value maxes out at
    // 50% (pptx rejects anything larger — PowerPoint refuses to open the file).
    const maxRad = Math.min(op.w, op.h) / 2;
    const radIn = rad > 0 ? Math.min(toIn(rad), maxRad * 0.999) : 0;
    const isCircle = rad > 0 && rad * 2 >= Math.min(el.offsetWidth, el.offsetHeight) - 1;
    const shape: RectOp["shape"] = isCircle && Math.abs(op.w - op.h) < 0.02
      ? "ellipse"
      : radIn > 0 ? "roundRect" : "rect";

    // fill: the solid background colour. Gradient layers are rasterised
    // separately (collected below) so the canvas keeps its glow/fade —
    // PowerPoint shapes can't express CSS gradients.
    const fill = parseColor(st.backgroundColor);
    if (st.backgroundImage && st.backgroundImage.includes("gradient(")) {
      const r = el.getBoundingClientRect();
      gradTasks.push({ xPx: r.left - base.left, yPx: r.top - base.top, wPx: r.width, hPx: r.height, image: st.backgroundImage });
    }

    // borders, side by side.
    const sides = (["Top", "Right", "Bottom", "Left"] as const).map((s) => ({
      s,
      w: parseFloat(st.getPropertyValue(`border-${s.toLowerCase()}-width`)) || 0,
      c: parseColor(st.getPropertyValue(`border-${s.toLowerCase()}-color`)),
    })).filter((b) => b.w > 0.4 && b.c);
    const uniform =
      sides.length === 4 &&
      sides.every((b) => b.c!.hex === sides[0].c!.hex && Math.abs(b.w - sides[0].w) < 0.6);

    if (fill || uniform) {
      const r: RectOp = { t: "rect", shape, x: op.x, y: op.y, w: op.w, h: op.h, radius: radIn || undefined };
      if (fill) r.fill = { color: fill.hex, transparency: transpOf(fill.a, opacity) };
      if (uniform) r.line = { color: sides[0].c!.hex, width: sides[0].w * PX2PT, transparency: transpOf(sides[0].c!.a, opacity) };
      ops.push(r);
      if (fill && op.w * op.h > bgArea) { bgArea = op.w * op.h; bg = fill.hex; }
    }
    if (!uniform) {
      // individual rules / bars (left rule, top bar, underline …)
      for (const b of sides) {
        const wIn = toIn(b.w);
        const t = transpOf(b.c!.a, opacity);
        if (b.s === "Top") ops.push({ t: "rect", shape: "rect", x: op.x, y: op.y, w: op.w, h: wIn, fill: { color: b.c!.hex, transparency: t } });
        if (b.s === "Bottom") ops.push({ t: "rect", shape: "rect", x: op.x, y: op.y + op.h - wIn, w: op.w, h: wIn, fill: { color: b.c!.hex, transparency: t } });
        if (b.s === "Left") ops.push({ t: "rect", shape: "rect", x: op.x, y: op.y, w: wIn, h: op.h, fill: { color: b.c!.hex, transparency: t } });
        if (b.s === "Right") ops.push({ t: "rect", shape: "rect", x: op.x + op.w - wIn, y: op.y, w: wIn, h: op.h, fill: { color: b.c!.hex, transparency: t } });
      }
    }
    // backdrop for descendants: composite the fill, then a gradient's mid
    // stop as an approximation of what now sits behind the text.
    let next = fill ? blendHex(fill.hex, fill.a * opacity, backdrop) : backdrop;
    const gmid = gradientSolid(st.backgroundImage);
    if (gmid) next = blendHex(gmid.hex, gmid.a * opacity * 0.6, next);
    return next;
  }

  // Split a text node into its RENDERED lines: [start, end) character
  // offsets + the line's client rect. PowerPoint re-wraps text with its own
  // font metrics (and substitutes missing fonts), so a multi-line box never
  // breaks where the browser broke it — exporting each rendered line as its
  // own non-wrapping shape pins the layout exactly.
  function renderedLines(node: Text): { s: number; e: number; rect: DOMRect }[] {
    const len = (node.nodeValue ?? "").length;
    const r = document.createRange();
    const lines: { s: number; e: number; rect: DOMRect }[] = [];
    let s = 0;
    while (s < len) {
      // grow [s, e) while it still occupies a single line fragment
      let lo = s + 1, hi = len, fit = s + 1;
      const rectsAt = (e: number) => {
        r.setStart(node, s); r.setEnd(node, e);
        return r.getClientRects().length;
      };
      if (rectsAt(len) <= 1) { fit = len; }
      else {
        while (lo <= hi) {
          const mid = (lo + hi) >> 1;
          if (rectsAt(mid) <= 1) { fit = mid; lo = mid + 1; } else { hi = mid - 1; }
        }
      }
      // Shrink to the glyphs: measure the rect WITHOUT edge whitespace, so a
      // box's edges sit exactly on ink. Otherwise a fragment ending in a
      // space exports a box one space wider than its (trimmed) text, and
      // right-aligned glyphs slide into the gap — adjacent fragments like
      // "אסטרטגיה" + "2026" end up touching.
      const txt = node.nodeValue ?? "";
      let gs = s, ge = fit;
      while (gs < ge && /\s/.test(txt[gs])) gs++;
      while (ge > gs && /\s/.test(txt[ge - 1])) ge--;
      if (ge > gs) {
        r.setStart(node, gs); r.setEnd(node, ge);
        lines.push({ s: gs, e: ge, rect: r.getBoundingClientRect() });
      }
      s = fit;
      while (s < len && /\s/.test(txt[s])) s++;
    }
    return lines;
  }

  function emitTextNode(node: Text, parentEl: Element, st: CSSStyleDeclaration, opacity: number, backdrop: string) {
    const raw = node.nodeValue ?? "";
    if (!raw.trim()) return;

    // AutoFit shrinks a slide via `transform: scale()`. That scales the
    // measured box but NOT getComputedStyle's font-size — so font sizes
    // must be multiplied by the same factor or dense slides export too large.
    let scale = 1;
    const peh = (parentEl as HTMLElement).offsetHeight;
    if (peh > 0) {
      const rh = parentEl.getBoundingClientRect().height;
      if (rh > 0) scale = Math.max(0.05, Math.min(1.2, rh / peh));
    }

    // colour — fall back to text-stroke colour for outlined titles.
    let col = parseColor(st.color);
    if (!col) {
      const strokeC = st.getPropertyValue("-webkit-text-stroke-color");
      const strokeW = parseFloat(st.getPropertyValue("-webkit-text-stroke-width")) || 0;
      if (strokeW > 0) col = parseColor(strokeC);
    }
    if (!col) return;

    const sizePx = parseFloat(st.fontSize) || 16;
    const lsPx = parseFloat(st.letterSpacing);
    const rtl = st.direction === "rtl";
    const align = mapAlign(st, rtl);

    for (const ln of renderedLines(node)) {
      // ln boundaries are already whitespace-trimmed to match the glyph rect.
      const text = applyTransform(raw.slice(ln.s, ln.e).replace(/\s+/g, " "), st.textTransform);
      if (!text) continue;
      if (ln.rect.width <= 0.5 || ln.rect.height <= 0.5) continue;
      const op = rel(ln.rect);
      // Wrapping is off, so a wider-metric substitute font extends the line
      // instead of re-breaking it. Give the box slack on the open side(s) so
      // the text stays anchored at its aligned edge and never re-fits:
      // right-aligned text keeps its right edge and may grow left, etc.
      const SLACK = Math.min(2, op.w * 0.6 + 0.15);
      let x = op.x, w = op.w;
      if (align === "right") { x -= SLACK; w += SLACK; }
      else if (align === "left") { w += SLACK; }
      else { x -= SLACK / 2; w += SLACK; }
      ops.push({
        t: "text",
        x,
        // Vertical calibration: PowerPoint/LibreOffice set the first baseline
        // from the font's Win metrics, Chrome centres glyphs in the CSS line
        // box — rendered side-by-side, exported text sits ~0.11em LOWER than
        // the browser's ink for the same box. Measured across a 21-slide deck
        // (median per font size, 7–62px) and corrected here so ink tops align.
        y: op.y - 0.012 - 0.11 * sizePx * scale * PX2IN,
        w,
        h: op.h + 0.04,
        text,
        // Pre-blend translucent text against its backdrop instead of writing
        // an <a:alpha> on the run colour — text-colour transparency breaks
        // RTL layout in several renderers (LibreOffice reverses the line;
        // older PowerPoint builds mis-handle it too). Solid colour, same look.
        color: col.a * opacity >= 0.999 ? col.hex : blendHex(col.hex, col.a * opacity, backdrop),
        size: sizePx * PX2PT * scale,
        bold: (parseInt(st.fontWeight, 10) || 400) >= 600,
        italic: st.fontStyle === "italic",
        face: firstFace(st.fontFamily),
        align,
        rtl,
        charSpacing: (Number.isFinite(lsPx) ? lsPx * PX2PT : 0) * scale,
      });
    }
  }

  function recurse(el: Element, opacity: number, backdrop: string) {
    const st = getComputedStyle(el);
    if (isHidden(st)) return;
    const eff = opacity * (parseFloat(st.opacity || "1") || 1);
    const r = rel(el.getBoundingClientRect());

    if (el instanceof SVGElement) {
      if (r.w > 0.01 && r.h > 0.01) svgTasks.push({ el, x: r.x, y: r.y, w: r.w, h: r.h });
      return;
    }

    const innerBackdrop = emitBox(el as HTMLElement, st, r, eff, backdrop);

    // Emit each direct text node where the browser placed it, and recurse
    // into element children. Per-fragment emission keeps multi-colour lines
    // (value + unit) and RTL ordering exactly as laid out.
    for (const child of Array.from(el.childNodes)) {
      if (child.nodeType === Node.TEXT_NODE) {
        emitTextNode(child as Text, el, st, eff, innerBackdrop);
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        recurse(child as Element, eff, innerBackdrop);
      }
    }
  }

  recurse(root, 1, "ffffff");
  return { ops, svgTasks, gradTasks, bg };
}

// ── CSS gradient rasteriser ───────────────────────────────────────────
// PowerPoint shapes can't carry CSS gradients, and dropping them flattens
// the designs (Midnight's glow, Gradient's canvas). All gradient layers of
// a slide are painted into ONE full-slide PNG that sits just above the base
// background — text, cards and rules stay native and editable above it.

// Split a backgroundImage list on top-level commas.
function splitLayers(s: string): string[] {
  const out: string[] = [];
  let depth = 0, cur = "";
  for (const ch of s) {
    if (ch === "(") depth++;
    if (ch === ")") depth--;
    if (ch === "," && depth === 0) { out.push(cur.trim()); cur = ""; continue; }
    cur += ch;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}
// Split a gradient's argument list on top-level commas.
function splitArgs(s: string): string[] {
  return splitLayers(s);
}
type Stop = { color: string; pos?: number };
function parseStops(args: string[]): Stop[] {
  const stops: Stop[] = [];
  for (const a of args) {
    const m = a.match(/^(.*?)\s+(-?[\d.]+)%$/);
    if (m) stops.push({ color: m[1].trim(), pos: parseFloat(m[2]) / 100 });
    else stops.push({ color: a.trim() });
  }
  // distribute missing positions evenly
  if (stops.length) {
    if (stops[0].pos === undefined) stops[0].pos = 0;
    if (stops[stops.length - 1].pos === undefined) stops[stops.length - 1].pos = 1;
    for (let i = 1; i < stops.length - 1; i++) {
      if (stops[i].pos === undefined) {
        let j = i;
        while (stops[j].pos === undefined) j++;
        const prev = stops[i - 1].pos!, next = stops[j].pos!;
        for (let k = i; k < j; k++) stops[k].pos = prev + ((next - prev) * (k - i + 1)) / (j - i + 1);
      }
    }
  }
  return stops;
}

function paintGradient(cx: CanvasRenderingContext2D, layer: string, x: number, y: number, w: number, h: number) {
  const lin = layer.match(/^linear-gradient\((.*)\)$/s);
  const rad = layer.match(/^radial-gradient\((.*)\)$/s);
  if (lin) {
    const args = splitArgs(lin[1]);
    let angle = 180; // CSS default: to bottom
    if (/^-?[\d.]+deg$/.test(args[0])) angle = parseFloat(args.shift()!);
    else if (/^to\s/.test(args[0])) {
      const dir = args.shift()!;
      angle = dir.includes("right") ? 90 : dir.includes("left") ? 270 : dir.includes("top") ? 0 : 180;
    }
    const stops = parseStops(args);
    const radians = (angle * Math.PI) / 180;
    const dx = Math.sin(radians), dy = -Math.cos(radians);
    const L = Math.abs(w * dx) + Math.abs(h * dy);
    const cxm = x + w / 2, cym = y + h / 2;
    const g = cx.createLinearGradient(cxm - (dx * L) / 2, cym - (dy * L) / 2, cxm + (dx * L) / 2, cym + (dy * L) / 2);
    for (const s of stops) { try { g.addColorStop(Math.max(0, Math.min(1, s.pos ?? 0)), s.color); } catch { /* skip bad stop */ } }
    cx.fillStyle = g;
    cx.fillRect(x, y, w, h);
  } else if (rad) {
    const args = splitArgs(rad[1]);
    // forms used by the designs: "circle at 30% 30%, …" / "120% 120% at 80% -10%, …" / "circle, …"
    let fx = 0.5, fy = 0.5, rr = 0.75 * Math.max(w, h);
    if (/(circle|ellipse|at|%)/.test(args[0]) && !args[0].match(/^(rgba?\(|#|transparent)/)) {
      const head = args.shift()!;
      const at = head.match(/at\s+(-?[\d.]+)%\s+(-?[\d.]+)%/);
      if (at) { fx = parseFloat(at[1]) / 100; fy = parseFloat(at[2]) / 100; }
      const size = head.match(/^(-?[\d.]+)%\s+(-?[\d.]+)%/);
      if (size) rr = Math.max((parseFloat(size[1]) / 100) * w, (parseFloat(size[2]) / 100) * h) / 2 * 1.6;
    }
    const stops = parseStops(args);
    const g = cx.createRadialGradient(x + fx * w, y + fy * h, 0, x + fx * w, y + fy * h, Math.max(1, rr));
    for (const s of stops) { try { g.addColorStop(Math.max(0, Math.min(1, s.pos ?? 0)), s.color); } catch { /* skip bad stop */ } }
    cx.fillStyle = g;
    cx.fillRect(x, y, w, h);
  }
}

// Rasterise all gradient layers of a slide into one full-slide PNG.
function gradientsToPng(tasks: GradTask[]): string | null {
  try {
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = PXW * scale;
    canvas.height = PXH * scale;
    const cx = canvas.getContext("2d");
    if (!cx) return null;
    cx.scale(scale, scale);
    for (const t of tasks) {
      // CSS paints the LAST layer first (bottom); reverse for canvas order.
      const layers = splitLayers(t.image).filter((l) => l.includes("gradient("));
      for (const layer of layers.reverse()) paintGradient(cx, layer, t.xPx, t.yPx, t.wPx, t.hPx);
    }
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

// Rasterise an inline <svg> (decorative corner shapes etc.) to a PNG so it
// survives into the slide. Best-effort: on any failure the shape is skipped.
async function svgToPng(el: SVGElement, wIn: number, hIn: number): Promise<string | null> {
  try {
    const clone = el.cloneNode(true) as SVGElement;
    if (!clone.getAttribute("xmlns")) clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    const wPx = Math.max(1, Math.round(wIn / PX2IN));
    const hPx = Math.max(1, Math.round(hIn / PX2IN));
    clone.setAttribute("width", String(wPx));
    clone.setAttribute("height", String(hPx));
    const xml = new XMLSerializer().serializeToString(clone);
    const url = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(xml);
    const img = new Image();
    img.decoding = "sync";
    await new Promise<void>((res, rej) => {
      img.onload = () => res();
      img.onerror = () => rej(new Error("svg load"));
      img.src = url;
    });
    const scale = 2;
    const canvas = document.createElement("canvas");
    canvas.width = wPx * scale;
    canvas.height = hPx * scale;
    const cx = canvas.getContext("2d");
    if (!cx) return null;
    cx.scale(scale, scale);
    cx.drawImage(img, 0, 0, wPx, hPx);
    return canvas.toDataURL("image/png");
  } catch {
    return null;
  }
}

function paintSlide(slide: PSlide, ops: Op[], bg: string) {
  slide.background = { color: bg };
  for (const op of ops) {
    if (op.t === "rect") {
      slide.addShape(op.shape, {
        x: op.x, y: op.y, w: op.w, h: op.h,
        fill: op.fill ? { color: op.fill.color, transparency: op.fill.transparency } : { type: "none" },
        line: op.line
          ? { color: op.line.color, width: Math.max(0.25, op.line.width), transparency: op.line.transparency }
          : { type: "none" },
        ...(op.shape === "roundRect" && op.radius ? { rectRadius: op.radius } : {}),
      });
    } else if (op.t === "image") {
      slide.addImage({ data: op.data, x: op.x, y: op.y, w: op.w, h: op.h });
    } else {
      // One shape per rendered LINE. The box carries generous width slack on
      // its open side, so even a wider-metric substitute font stays on one
      // line — wrap stays ON because wrap="none" triggers a bidi-reversal
      // bug in some renderers (LibreOffice) for RTL paragraphs.
      slide.addText(op.text, {
        x: op.x, y: op.y, w: op.w, h: op.h,
        color: op.color,
        fontSize: op.size,
        bold: op.bold,
        italic: op.italic,
        fontFace: op.face,
        align: op.align,
        rtlMode: op.rtl,
        valign: "middle",
        margin: 0,
        charSpacing: op.charSpacing || undefined,
        wrap: true,
        fit: "none",
      });
    }
  }
}

// Render one <SlideView> off-screen and wait for fonts + AutoFit to settle.
function nextFrame(): Promise<void> {
  return new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));
}

export async function renderDeckPptx(doc: StrategyDeck, lang: Lang): Promise<void> {
  const PptxGenJS = (await import("pptxgenjs")).default;
  const prs: Pptx = new PptxGenJS();
  // Built-in 16:9 layout is exactly 10 × 5.625in — same frame, but a known-good
  // master/layout pair (a custom defineLayout risks a layout PowerPoint rejects).
  prs.layout = "LAYOUT_16x9";
  prs.author = doc.company || "Integrate AI";
  prs.title = doc.planTitle || doc.company || "Strategy Deck";

  const theme: DeckTheme = DECK_THEMES.find((t) => t.id === doc.theme) ?? DECK_THEMES[0];

  // Off-screen host — laid out (not display:none) so geometry is real.
  const host = document.createElement("div");
  host.style.cssText = `position:fixed;left:-100000px;top:0;width:${PXW}px;height:${PXH}px;overflow:hidden;background:#fff;z-index:-1;pointer-events:none;`;
  document.body.appendChild(host);
  const root: Root = createRoot(host);

  try {
    await (document as Document & { fonts?: { ready?: Promise<unknown> } }).fonts?.ready;

    for (let i = 0; i < doc.slides.length; i++) {
      const slide = doc.slides[i];
      await new Promise<void>((resolve) => {
        root.render(
          // Interactive (with an inert onChange) so the rendered tree — and
          // therefore the measured geometry — is IDENTICAL to the editor
          // canvas: empty optional fields keep their placeholder space.
          // Placeholder text lives in a ::before pseudo-element, which the
          // DOM walk never emits, so nothing editing-related is exported.
          createElement(SlideView, {
            slide,
            theme,
            doc,
            interactive: true,
            onChange: () => {},
            pageNumber: i + 1,
            totalPages: doc.slides.length,
          }),
        );
        // commit + paint
        requestAnimationFrame(() => resolve());
      });
      await nextFrame();
      // give AutoFit's ResizeObserver / fonts.ready a beat to re-fit
      await new Promise((r) => setTimeout(r, 40));
      await nextFrame();

      const rootEl = host.firstElementChild as HTMLElement | null;
      if (!rootEl) continue;
      const { ops, svgTasks, gradTasks, bg } = buildOps(rootEl);

      // Gradient layers (canvas glows, fading rules) → one full-slide PNG
      // slotted right above the base background rect, below everything else.
      if (gradTasks.length) {
        const data = gradientsToPng(gradTasks);
        if (data) {
          const at = ops.length && ops[0].t === "rect" ? 1 : 0;
          ops.splice(at, 0, { t: "image", x: 0, y: 0, w: INW, h: INH, data });
        }
      }

      // Rasterise any decorative SVGs and lay them behind the rest (corner
      // shapes etc. paint first in the DOM, so they sit at the back).
      const images = await Promise.all(svgTasks.map((s) => svgToPng(s.el, s.w, s.h)));
      const withImages: Op[] = [];
      svgTasks.forEach((s, idx) => {
        const data = images[idx];
        if (data) withImages.push({ t: "image", x: s.x, y: s.y, w: s.w, h: s.h, data });
      });

      const pslide = prs.addSlide();
      paintSlide(pslide, [...withImages, ...ops], bg);
    }

    await prs.writeFile({ fileName: `${(doc.company || "deck").replace(/\s+/g, "_")}.pptx` });
  } finally {
    root.unmount();
    host.remove();
  }
}
