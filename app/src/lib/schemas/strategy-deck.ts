import { z } from "zod";

// ──────────────────────────────────────────────────────────────────────
// Slide layout primitives.
// ──────────────────────────────────────────────────────────────────────
// `layout` controls the structural slide chrome (cover / content / section /
// quote). `kind` opts a content slide into one of the richer board-deck
// layouts (stats grid, horizon cards, tracks, table, etc.). Both fall back
// to legacy bullet rendering when not specified.
export const SlideLayout = z.enum(["cover", "content", "section", "quote"]);
export type SlideLayout = z.infer<typeof SlideLayout>;

export const SlideKind = z.enum([
  "bullets",   // default — title + subtitle + bullet list (legacy)
  "cover",     // BSRE-style cover (dark navy gradient, big title, teal accents)
  "stats",     // hero stat-card row (oversized numbers, gradient cards)
  "horizons",  // 3-column horizon cards (base / milestone / target)
  "grid",      // numbered 4-card grid (01/02/03/04)
  "tracks",    // 3 numbered tracks with chip footers
  "toc",       // numbered TOC (two-column)
  "table",     // data table; optional severity chips on the right
  "compare",   // 2-column comparison (left light + right dark, or both)
  "donts",     // "what we will NOT do" 6-grid with × icons
  "summary",   // full-bleed dark closing quote with chip footer
  "kpi-card",  // single big hero stat-card + body text
]);
export type SlideKind = z.infer<typeof SlideKind>;

// ──────────────────────────────────────────────────────────────────────
// Rich content sub-shapes — only used when `kind` opts a slide into them.
// All fields default to safe empty values so backward compatibility holds.
// ──────────────────────────────────────────────────────────────────────

// One oversized stat tile. `variant` picks a visual treatment.
export const StatItem = z.object({
  value: z.string().default(""),      // "117", "9.5", "ilAA", "700+"
  unit: z.string().default(""),       // "מיליארד ₪", "אלף מ\"ר", "+ מ' ₪"
  label: z.string().default(""),      // "נכסים מניבים"
  caption: z.string().default(""),    // small line under the value
  variant: z.enum(["teal", "navy", "blue", "white", "gradient-teal", "gradient-navy"]).default("white"),
});
export type StatItem = z.infer<typeof StatItem>;

// One column in a horizons slide (2026 · בסיס, 2028 · אבן דרך, 2030 · יעד מלא).
export const HorizonRow = z.object({
  label: z.string().default(""),  // "NOI"
  value: z.string().default(""),  // "~430 מ' ש"
});
export type HorizonRow = z.infer<typeof HorizonRow>;

export const HorizonCard = z.object({
  eyebrow: z.string().default(""),     // "2026 · בסיס"
  bigText: z.string().default(""),     // "2026"
  caption: z.string().default(""),     // single-line description
  rows: z.array(HorizonRow).default([]),
  variant: z.enum(["teal", "white", "navy"]).default("white"),
});
export type HorizonCard = z.infer<typeof HorizonCard>;

// One card in a numbered grid (the "4 advantages" / "principles" slide).
export const GridCard = z.object({
  index: z.string().default(""),       // "01"
  title: z.string().default(""),
  description: z.string().default(""),
});
export type GridCard = z.infer<typeof GridCard>;

// One track in a "3 tracks" slide (with chip footer).
export const Track = z.object({
  index: z.string().default(""),       // "01"
  eyebrow: z.string().default(""),     // "ציר חדש" / "פעיל" / "בייזום"
  title: z.string().default(""),
  description: z.string().default(""),
  chip: z.string().default(""),        // bottom tag
  variant: z.enum(["teal", "navy", "blue", "white"]).default("teal"),
});
export type Track = z.infer<typeof Track>;

// One row in a numbered TOC (two-column layout).
export const TocItem = z.object({
  index: z.string().default(""),       // "01"
  title: z.string().default(""),
  subtitle: z.string().default(""),
});
export type TocItem = z.infer<typeof TocItem>;

// One row in a data table. `chip` shows on the right edge with severity
// coloring; `emphasize` highlights the row (e.g. for "us" in a peer table).
export const TableRow = z.object({
  cells: z.array(z.string()).default([]),
  chip: z.string().optional(),
  chipVariant: z.enum(["high", "med", "low", "neutral"]).optional(),
  emphasize: z.boolean().optional(),
});
export type TableRow = z.infer<typeof TableRow>;

// One pane in a 2-column comparison slide.
export const ComparePane = z.object({
  eyebrow: z.string().default(""),     // small kicker
  chip: z.string().default(""),        // tag at the top corner
  title: z.string().default(""),
  rows: z.array(HorizonRow).default([]),   // label → value rows
  bullets: z.array(z.string()).default([]),
  footnote: z.string().default(""),
  variant: z.enum(["light", "dark", "teal"]).default("light"),
});
export type ComparePane = z.infer<typeof ComparePane>;

// One "× we will NOT do" item.
export const DontItem = z.object({
  title: z.string().default(""),
  description: z.string().default(""),
});
export type DontItem = z.infer<typeof DontItem>;

// ──────────────────────────────────────────────────────────────────────
// Slide — backward compatible. `kind` defaults to "bullets" so existing
// decks (Strauss sample, etc.) continue to render as before.
// ──────────────────────────────────────────────────────────────────────
export const Slide = z.object({
  layout: SlideLayout.default("content"),
  kind: SlideKind.optional(),            // defaults to "bullets" at render
  title: z.string().default(""),
  subtitle: z.string().default(""),
  eyebrow: z.string().optional(),        // small kicker label above title
  bullets: z.array(z.string()).default([]),

  // Layout-specific rich content. Only the fields relevant to `kind` are read.
  // All optional so legacy slides (just title/subtitle/bullets) still type-check.
  stats: z.array(StatItem).optional(),
  horizons: z.array(HorizonCard).optional(),
  gridCards: z.array(GridCard).optional(),
  tracks: z.array(Track).optional(),
  tocItems: z.array(TocItem).optional(),
  tableHeaders: z.array(z.string()).optional(),
  tableRows: z.array(TableRow).optional(),
  leftPane: ComparePane.optional(),
  rightPane: ComparePane.optional(),
  dontItems: z.array(DontItem).optional(),

  // Optional body / sidebar / footer text used by several kinds.
  body: z.string().optional(),           // long-form prose alongside cards
  footnote: z.string().optional(),       // bottom band/strip text
  footnoteChip: z.string().optional(),   // bottom band leading chip
});
export type Slide = z.infer<typeof Slide>;

// Per-deck formatting overrides on top of theme defaults.
// Empty string = use palette/theme default.
export const DeckFormatting = z.object({
  titleFont: z.string().default(""),
  bodyFont: z.string().default(""),
  titleScale: z.number().default(1),
  bodyScale: z.number().default(1),
});
export type DeckFormatting = z.infer<typeof DeckFormatting>;

// Full custom palette — each field is a hex color or empty (= inherit from base palette).
// Together these 5 colors define the complete visual identity of the deck.
export const CustomPalette = z.object({
  coverBg: z.string().default(""),   // cover/section background
  bg: z.string().default(""),        // content slide background
  accent: z.string().default(""),    // primary accent (bars, bullets, glows)
  accent2: z.string().default(""),   // secondary accent
  text: z.string().default(""),      // main text on content slides
});
export type CustomPalette = z.infer<typeof CustomPalette>;

export const emptyCustomPalette = (): CustomPalette => ({
  coverBg: "", bg: "", accent: "", accent2: "", text: "",
});

export const StrategyDeck = z.object({
  company: z.string().default(""),
  horizon: z.string().default(""),
  planTitle: z.string().default(""),
  headlineTarget: z.string().default(""),
  date: z.string().default(""),
  theme: z.string().default("navy-classic"),
  paletteOverride: z.string().default(""),    // PaletteId preset — starting point
  customPalette: CustomPalette.default(emptyCustomPalette), // per-color overrides on top
  formatting: DeckFormatting.default(() => ({
    titleFont: "", bodyFont: "", titleScale: 1, bodyScale: 1,
  })),
  slides: z.array(Slide).default([]),
});
export type StrategyDeck = z.infer<typeof StrategyDeck>;

export const emptySlide = (layout: SlideLayout = "content"): Slide => ({
  layout,
  title: "",
  subtitle: "",
  bullets: layout === "content" ? [""] : [],
});

export const defaultDeckFormatting = (): DeckFormatting => ({
  titleFont: "",
  bodyFont: "",
  titleScale: 1,
  bodyScale: 1,
});
