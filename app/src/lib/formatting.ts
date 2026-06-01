export type FontFamily = "david" | "heebo" | "frank-ruhl" | "arial" | "times";

export type TableStyle =
  | "plain"
  | "lines"
  | "grid"
  | "classic"
  | "striped"
  | "minimal"
  | "dark-header"
  | "colored-header"
  | "accent-alt"
  | "professional"
  | "bordered"
  | "elegant";

export type Formatting = {
  fontFamily: FontFamily;
  fontSize: number;
  headingColor: string;
  tableStyle: TableStyle;
};

export const FONT_LABELS: Record<FontFamily, string> = {
  david: "David",
  heebo: "Heebo",
  "frank-ruhl": "Frank Ruhl Libre",
  arial: "Arial",
  times: "Times New Roman",
};

export const FONT_CSS: Record<FontFamily, string> = {
  david: `var(--font-body), "David Libre", "David", serif`,
  heebo: `var(--font-ui), "Heebo", system-ui, sans-serif`,
  "frank-ruhl": `var(--font-display), "Frank Ruhl Libre", serif`,
  arial: `Arial, "Helvetica Neue", Helvetica, sans-serif`,
  times: `"Times New Roman", Times, serif`,
};

export const FONT_DOCX: Record<FontFamily, string> = {
  david: "David",
  heebo: "Heebo",
  "frank-ruhl": "Frank Ruhl Libre",
  arial: "Arial",
  times: "Times New Roman",
};

export type TableStyleDef = {
  nameHe: string;
  nameEn: string;
  // Visual properties for SVG preview and CSS/docx rendering
  headerBg: "white" | "light" | "medium" | "accent" | "dark";
  headerFg: "dark" | "white";
  altRows: boolean;
  altBg: "light" | "accent-light" | "none";
  outerBorder: "none" | "thin" | "normal" | "thick";
  innerH: "none" | "thin" | "normal";
  innerV: "none" | "thin" | "normal";
  headerBottomBold: boolean;
};

export const TABLE_STYLE_DEFS: Record<TableStyle, TableStyleDef> = {
  plain: {
    nameHe: "ללא מסגרת",
    nameEn: "No border",
    headerBg: "light",
    headerFg: "dark",
    altRows: false,
    altBg: "none",
    outerBorder: "none",
    innerH: "none",
    innerV: "none",
    headerBottomBold: false,
  },
  lines: {
    nameHe: "קווים אופקיים",
    nameEn: "Horizontal lines",
    headerBg: "white",
    headerFg: "dark",
    altRows: false,
    altBg: "none",
    outerBorder: "none",
    innerH: "thin",
    innerV: "none",
    headerBottomBold: true,
  },
  grid: {
    nameHe: "רשת",
    nameEn: "Grid",
    headerBg: "white",
    headerFg: "dark",
    altRows: false,
    altBg: "none",
    outerBorder: "thin",
    innerH: "thin",
    innerV: "thin",
    headerBottomBold: false,
  },
  classic: {
    nameHe: "קלאסי",
    nameEn: "Classic",
    headerBg: "light",
    headerFg: "dark",
    altRows: false,
    altBg: "none",
    outerBorder: "normal",
    innerH: "normal",
    innerV: "normal",
    headerBottomBold: false,
  },
  striped: {
    nameHe: "פסים",
    nameEn: "Striped",
    headerBg: "medium",
    headerFg: "dark",
    altRows: true,
    altBg: "light",
    outerBorder: "thin",
    innerH: "thin",
    innerV: "thin",
    headerBottomBold: false,
  },
  minimal: {
    nameHe: "מינימלי",
    nameEn: "Minimal",
    headerBg: "white",
    headerFg: "dark",
    altRows: false,
    altBg: "none",
    outerBorder: "none",
    innerH: "thin",
    innerV: "none",
    headerBottomBold: true,
  },
  "dark-header": {
    nameHe: "כותרת כהה",
    nameEn: "Dark header",
    headerBg: "dark",
    headerFg: "white",
    altRows: false,
    altBg: "none",
    outerBorder: "normal",
    innerH: "normal",
    innerV: "none",
    headerBottomBold: false,
  },
  "colored-header": {
    nameHe: "כותרת צבעונית",
    nameEn: "Colored header",
    headerBg: "accent",
    headerFg: "white",
    altRows: false,
    altBg: "none",
    outerBorder: "normal",
    innerH: "normal",
    innerV: "normal",
    headerBottomBold: false,
  },
  "accent-alt": {
    nameHe: "צבעוני עם פסים",
    nameEn: "Accent striped",
    headerBg: "accent",
    headerFg: "white",
    altRows: true,
    altBg: "accent-light",
    outerBorder: "thin",
    innerH: "thin",
    innerV: "thin",
    headerBottomBold: false,
  },
  professional: {
    nameHe: "מקצועי",
    nameEn: "Professional",
    headerBg: "white",
    headerFg: "dark",
    altRows: false,
    altBg: "none",
    outerBorder: "thick",
    innerH: "thin",
    innerV: "none",
    headerBottomBold: true,
  },
  bordered: {
    nameHe: "מסגרת מודגשת",
    nameEn: "Bordered",
    headerBg: "medium",
    headerFg: "dark",
    altRows: false,
    altBg: "none",
    outerBorder: "thick",
    innerH: "normal",
    innerV: "normal",
    headerBottomBold: false,
  },
  elegant: {
    nameHe: "אלגנטי",
    nameEn: "Elegant",
    headerBg: "white",
    headerFg: "dark",
    altRows: true,
    altBg: "light",
    outerBorder: "none",
    innerH: "thin",
    innerV: "none",
    headerBottomBold: true,
  },
};

export const defaultFormatting = (): Formatting => ({
  fontFamily: "david",
  fontSize: 11,
  headingColor: "#1a1a1a",
  tableStyle: "classic",
});
