import { z } from "zod";

export const SlideLayout = z.enum(["cover", "content", "section", "quote"]);
export type SlideLayout = z.infer<typeof SlideLayout>;

export const Slide = z.object({
  layout: SlideLayout.default("content"),
  title: z.string().default(""),
  subtitle: z.string().default(""),
  bullets: z.array(z.string()).default([]),
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
