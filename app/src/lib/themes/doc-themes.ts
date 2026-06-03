import { getPalette, PALETTES, type PaletteId } from "./deck-themes";

export type HeadingStyle = "classic" | "minimal" | "bold" | "editorial" | "modern" | "magazine";

export type DocTheme = {
  id: string;
  name_he: string;
  name_en: string;
  palette: PaletteId;
  headingStyle: HeadingStyle;
  dark?: boolean;
};

export const DOC_THEMES: DocTheme[] = [
  // Navy
  { id: "navy-classic",     name_he: "כחול קלאסי",        name_en: "Navy Classic",           palette: "corporate-navy",  headingStyle: "classic" },
  { id: "navy-minimal",     name_he: "כחול מינימלי",       name_en: "Navy Minimal",           palette: "corporate-navy",  headingStyle: "minimal" },
  { id: "navy-bold",        name_he: "כחול מודגש",         name_en: "Navy Bold",              palette: "corporate-navy",  headingStyle: "bold" },
  { id: "navy-editorial",   name_he: "כחול עיתונאי",       name_en: "Navy Editorial",         palette: "corporate-navy",  headingStyle: "editorial" },
  // Violet
  { id: "violet-classic",   name_he: "סגול קלאסי",         name_en: "Violet Classic",         palette: "midnight-violet", headingStyle: "classic" },
  { id: "violet-editorial", name_he: "סגול עיתונאי",       name_en: "Violet Editorial",       palette: "midnight-violet", headingStyle: "editorial" },
  { id: "violet-modern",    name_he: "סגול מודרני",         name_en: "Violet Modern",          palette: "midnight-violet", headingStyle: "modern" },
  { id: "violet-magazine",  name_he: "סגול מגזין",          name_en: "Violet Magazine",        palette: "midnight-violet", headingStyle: "magazine" },
  // Forest
  { id: "forest-classic",   name_he: "יער קלאסי",          name_en: "Forest Classic",         palette: "deep-forest",     headingStyle: "classic" },
  { id: "forest-bold",      name_he: "יער מודגש",           name_en: "Forest Bold",            palette: "deep-forest",     headingStyle: "bold" },
  { id: "forest-editorial", name_he: "יער עיתונאי",        name_en: "Forest Editorial",       palette: "deep-forest",     headingStyle: "editorial" },
  // Wine
  { id: "wine-classic",     name_he: "יין קלאסי",           name_en: "Wine Classic",           palette: "wine",            headingStyle: "classic" },
  { id: "wine-magazine",    name_he: "יין מגזין",            name_en: "Wine Magazine",          palette: "wine",            headingStyle: "magazine" },
  { id: "wine-minimal",     name_he: "יין מינימלי",          name_en: "Wine Minimal",           palette: "wine",            headingStyle: "minimal" },
  // Dark
  { id: "obsidian-modern",  name_he: "כהה מודרני",          name_en: "Dark Modern",            palette: "obsidian",        headingStyle: "modern",    dark: true },
  { id: "obsidian-classic", name_he: "כהה קלאסי",           name_en: "Dark Classic",           palette: "obsidian",        headingStyle: "classic",   dark: true },
  // Tech
  { id: "tech-minimal",     name_he: "טכנולוגי מינימלי",   name_en: "Tech Minimal",           palette: "tech-cyan",       headingStyle: "minimal" },
  { id: "tech-bold",        name_he: "טכנולוגי מודגש",     name_en: "Tech Bold",              palette: "tech-cyan",       headingStyle: "bold" },
  // Slate
  { id: "slate-classic",    name_he: "אפור קלאסי",          name_en: "Slate Classic",          palette: "muted-slate",     headingStyle: "classic" },
  { id: "slate-editorial",  name_he: "אפור עיתונאי",        name_en: "Slate Editorial",        palette: "muted-slate",     headingStyle: "editorial" },
  // Cream
  { id: "cream-classic",    name_he: "קרם קלאסי",           name_en: "Cream Classic",          palette: "soft-cream",      headingStyle: "classic" },
  { id: "cream-editorial",  name_he: "קרם עיתונאי",         name_en: "Cream Editorial",        palette: "soft-cream",      headingStyle: "editorial" },
  // Paper
  { id: "paper-minimal",    name_he: "נייר מינימלי",        name_en: "Paper Minimal",          palette: "minimal-paper",   headingStyle: "minimal" },
  { id: "paper-classic",    name_he: "נייר קלאסי",          name_en: "Paper Classic",          palette: "minimal-paper",   headingStyle: "classic" },
  // Terracotta
  { id: "terra-classic",    name_he: "טרקוטה קלאסי",       name_en: "Terracotta Classic",     palette: "warm-terracotta", headingStyle: "classic" },
  { id: "terra-bold",       name_he: "טרקוטה מודגש",       name_en: "Terracotta Bold",        palette: "warm-terracotta", headingStyle: "bold" },
  // Earth
  { id: "earth-classic",    name_he: "אדמה קלאסי",          name_en: "Earth Classic",          palette: "earth",           headingStyle: "classic" },
  { id: "earth-editorial",  name_he: "אדמה עיתונאי",        name_en: "Earth Editorial",        palette: "earth",           headingStyle: "editorial" },
  // Arctic
  { id: "arctic-minimal",   name_he: "ארקטי מינימלי",       name_en: "Arctic Minimal",         palette: "arctic",          headingStyle: "minimal" },
  { id: "arctic-editorial", name_he: "ארקטי עיתונאי",       name_en: "Arctic Editorial",       palette: "arctic",          headingStyle: "editorial" },
  // Mono
  { id: "mono-classic",     name_he: "מונוכרום קלאסי",      name_en: "Mono Classic",           palette: "monochrome",      headingStyle: "classic" },
  { id: "mono-bold",        name_he: "מונוכרום מודגש",      name_en: "Mono Bold",              palette: "monochrome",      headingStyle: "bold" },
  // Blush
  { id: "blush-classic",    name_he: "ורוד קלאסי",           name_en: "Blush Classic",          palette: "blush",           headingStyle: "classic" },
  { id: "blush-magazine",   name_he: "ורוד מגזין",            name_en: "Blush Magazine",         palette: "blush",           headingStyle: "magazine" },
  // Sunset
  { id: "sunset-magazine",  name_he: "שקיעה מגזין",          name_en: "Sunset Magazine",        palette: "sunset",          headingStyle: "magazine" },
  { id: "sunset-bold",      name_he: "שקיעה מודגש",          name_en: "Sunset Bold",            palette: "sunset",          headingStyle: "bold" },
  // Fresh Green
  { id: "green-classic",    name_he: "ירוק קלאסי",            name_en: "Green Classic",          palette: "fresh-green",     headingStyle: "classic" },
  { id: "green-editorial",  name_he: "ירוק עיתונאי",          name_en: "Green Editorial",        palette: "fresh-green",     headingStyle: "editorial" },
];

export type DocCustomPalette = {
  bg: string;
  accent: string;
  accent2: string;
  text: string;
};

export const emptyDocCustomPalette = (): DocCustomPalette => ({ bg: "", accent: "", accent2: "", text: "" });

// ─── Form variants ───────────────────────────────────────────────────
// Each "form" is a discrete visual treatment for one element type.
// Empty string ("") means "follow the theme/base default".

export const H1_STYLES = ["", "thinLine", "thickBar", "none", "filled", "centered", "smallCaps"] as const;
export type H1Style = typeof H1_STYLES[number];

export const H3_STYLES = ["", "italic", "bulleted", "thinUnderline", "accentColor"] as const;
export type H3Style = typeof H3_STYLES[number];

export const BODY_STYLES = ["", "tight", "loose"] as const;
export type BodyStyle = typeof BODY_STYLES[number];

export const GUIDANCE_STYLES = ["", "bar", "box", "italic", "accentBar", "corner"] as const;
export type GuidanceStyle = typeof GUIDANCE_STYLES[number];

export const FIELD_STYLES = ["", "thick", "dashed", "none", "boxed"] as const;
export type FieldStyle = typeof FIELD_STYLES[number];

export const LIST_STYLES = ["", "diamond", "arrow", "dash", "square", "circle"] as const;
export type ListStyle = typeof LIST_STYLES[number];

export const GROUP_STYLES = ["", "thick", "shadow", "sideAccent", "grayBg", "accentHeader"] as const;
export type GroupStyle = typeof GROUP_STYLES[number];

export const DIVIDER_STYLES = ["", "dashed", "double", "thick", "dotted"] as const;
export type DividerStyle = typeof DIVIDER_STYLES[number];

export const DOC_PADDINGS = ["", "compact", "spacious"] as const;
export type DocPadding = typeof DOC_PADDINGS[number];

export const DOC_RADII = ["", "sharp", "medium", "large"] as const;
export type DocRadius = typeof DOC_RADII[number];

export type DocDesign = {
  theme: string;
  paletteOverride: string;
  customPalette: DocCustomPalette;
  titleFont: string;
  bodyFont: string;
  fontSize: number;
  titleScale: number;
  bodyScale: number;
  tableStyle: string;
  // ─── new form variants (all optional, "" = theme default) ──────────
  headingStyleOverride?: HeadingStyle | "";
  h1Style?: H1Style;
  h3Style?: H3Style;
  bodyStyle?: BodyStyle;
  guidanceStyle?: GuidanceStyle;
  fieldStyle?: FieldStyle;
  listStyle?: ListStyle;
  groupStyle?: GroupStyle;
  dividerStyle?: DividerStyle;
  docPadding?: DocPadding;
  docRadius?: DocRadius;
};

export const defaultDocDesign = (): DocDesign => ({
  theme: "navy-classic",
  paletteOverride: "",
  customPalette: emptyDocCustomPalette(),
  titleFont: "",
  bodyFont: "",
  fontSize: 11,
  titleScale: 1,
  bodyScale: 1,
  tableStyle: "classic",
  headingStyleOverride: "",
  h1Style: "",
  h3Style: "",
  bodyStyle: "",
  guidanceStyle: "",
  fieldStyle: "",
  listStyle: "",
  groupStyle: "",
  dividerStyle: "",
  docPadding: "",
  docRadius: "",
});

export type EffectiveDocDesign = {
  surface: string;
  fg: string;
  muted: string;
  border: string;
  borderSoft: string;
  accent: string;
  accent2: string;
  fontDisplay: string;
  fontBody: string;
  fontSize: number;
  headingStyle: HeadingStyle;
  tableStyle: string;
  dark: boolean;
  h1Style: H1Style;
  h3Style: H3Style;
  bodyStyle: BodyStyle;
  guidanceStyle: GuidanceStyle;
  fieldStyle: FieldStyle;
  listStyle: ListStyle;
  groupStyle: GroupStyle;
  dividerStyle: DividerStyle;
  docPadding: DocPadding;
  docRadius: DocRadius;
};

function shiftHex(hex: string, delta: number): string {
  const h = hex.replace(/^#/, "");
  if (h.length !== 6) return hex;
  const r = Math.min(255, Math.max(0, parseInt(h.slice(0, 2), 16) + delta));
  const g = Math.min(255, Math.max(0, parseInt(h.slice(2, 4), 16) + delta));
  const b = Math.min(255, Math.max(0, parseInt(h.slice(4, 6), 16) + delta));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

export const DOC_FONT_OPTIONS: { id: string; label: string; css: string }[] = [
  { id: "",                                    label: "ברירת מחדל / Default",         css: "" },
  { id: "'Frank Ruhl Libre', Georgia, serif",  label: "Frank Ruhl Libre",             css: "'Frank Ruhl Libre', Georgia, serif" },
  { id: "'David Libre', Georgia, serif",       label: "David Libre",                  css: "'David Libre', Georgia, serif" },
  { id: "Georgia, 'David Libre', serif",       label: "Georgia / David",              css: "Georgia, 'David Libre', serif" },
  { id: "'Heebo', Arial, sans-serif",          label: "Heebo",                        css: "'Heebo', Arial, sans-serif" },
  { id: "'Helvetica Neue', Arial, sans-serif", label: "Helvetica / Modern",           css: "'Helvetica Neue', Arial, sans-serif" },
  { id: "Arial, sans-serif",                   label: "Arial",                        css: "Arial, sans-serif" },
  { id: "'Times New Roman', serif",            label: "Times New Roman",              css: "'Times New Roman', serif" },
];

const DEFAULT_FONT_DISPLAY = "'Frank Ruhl Libre', Georgia, serif";
const DEFAULT_FONT_BODY = "'David Libre', 'David', serif";

export function resolveDocTheme(themeId: string, design: DocDesign): EffectiveDocDesign {
  const theme = DOC_THEMES.find((t) => t.id === themeId) ?? DOC_THEMES[0];
  const paletteId = (design.paletteOverride || theme.palette) as PaletteId;
  const p = getPalette(paletteId);
  const cp = design.customPalette;

  const dark = theme.dark ?? false;
  const surface = cp.bg || p.bg;
  const accent  = cp.accent  || p.accent;
  const accent2 = cp.accent2 || p.accent2;
  const fg      = cp.text    || p.text;
  const muted   = p.textMuted;
  const border     = dark ? shiftHex(surface, 30)  : shiftHex(surface, -20);
  const borderSoft = dark ? shiftHex(surface, 18)  : shiftHex(surface, -10);

  return {
    surface,
    fg,
    muted,
    border,
    borderSoft,
    accent,
    accent2,
    fontDisplay: design.titleFont || DEFAULT_FONT_DISPLAY,
    fontBody:    design.bodyFont  || DEFAULT_FONT_BODY,
    fontSize:    design.fontSize,
    headingStyle: (design.headingStyleOverride || theme.headingStyle) as HeadingStyle,
    tableStyle:  design.tableStyle,
    dark,
    h1Style:        design.h1Style        ?? "",
    h3Style:        design.h3Style        ?? "",
    bodyStyle:      design.bodyStyle      ?? "",
    guidanceStyle:  design.guidanceStyle  ?? "",
    fieldStyle:     design.fieldStyle     ?? "",
    listStyle:      design.listStyle      ?? "",
    groupStyle:     design.groupStyle     ?? "",
    dividerStyle:   design.dividerStyle   ?? "",
    docPadding:     design.docPadding     ?? "",
    docRadius:      design.docRadius      ?? "",
  };
}

export function getDocTheme(id: string): DocTheme {
  return DOC_THEMES.find((t) => t.id === id) ?? DOC_THEMES[0];
}

/**
 * Build the className string for the <article> root, plus the inline CSS
 * variable bag, so every template renders forms identically. Variants set
 * to "" are skipped (theme/base default styling applies).
 */
export function buildDocPresentation(
  eff: EffectiveDocDesign,
  styles: Record<string, string>,
): { className: string; style: Record<string, string | number> } {
  const cls = [
    styles.doc,
    styles[`hs_${eff.headingStyle}`],
    styles[`table_${eff.tableStyle}`],
    eff.h1Style       && styles[`h1_${eff.h1Style}`],
    eff.h3Style       && styles[`h3_${eff.h3Style}`],
    eff.bodyStyle     && styles[`body_${eff.bodyStyle}`],
    eff.guidanceStyle && styles[`guidance_${eff.guidanceStyle}`],
    eff.fieldStyle    && styles[`field_${eff.fieldStyle}`],
    eff.listStyle     && styles[`list_${eff.listStyle}`],
    eff.groupStyle    && styles[`group_${eff.groupStyle}`],
    eff.dividerStyle  && styles[`divider_${eff.dividerStyle}`],
    eff.docPadding    && styles[`pad_${eff.docPadding}`],
    eff.docRadius     && styles[`radius_${eff.docRadius}`],
  ].filter(Boolean).join(" ");
  const style = {
    "--doc-font-body": eff.fontBody,
    "--doc-font-display": eff.fontDisplay,
    "--doc-accent": eff.accent,
    "--doc-accent2": eff.accent2,
    "--doc-surface": eff.surface,
    "--doc-fg": eff.fg,
    "--doc-muted": eff.muted,
    "--doc-border": eff.border,
    "--doc-border-soft": eff.borderSoft,
    fontSize: `${eff.fontSize}pt`,
  };
  return { className: cls, style };
}

export { PALETTES, getPalette };
export type { PaletteId };
