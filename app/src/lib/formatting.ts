export type FontFamily = "david" | "heebo" | "frank-ruhl" | "arial" | "times";
export type TableStyle = "classic" | "minimal" | "striped" | "bordered";

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

export const TABLE_STYLE_LABELS: Record<TableStyle, string> = {
  classic: "קלאסי",
  minimal: "מינימלי",
  striped: "מפוספס",
  bordered: "מסגרת מודגשת",
};

export const TABLE_STYLE_LABELS_EN: Record<TableStyle, string> = {
  classic: "Classic",
  minimal: "Minimal",
  striped: "Striped",
  bordered: "Bordered",
};

export const defaultFormatting = (): Formatting => ({
  fontFamily: "david",
  fontSize: 11,
  headingColor: "#1a1a1a",
  tableStyle: "classic",
});
