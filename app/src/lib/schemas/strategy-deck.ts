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
// Empty string / null = use theme default.
export const DeckFormatting = z.object({
  titleFont: z.string().default(""),    // e.g. "Georgia, serif" — overrides theme.font.display
  bodyFont: z.string().default(""),     // overrides theme.font.body
  accentColor: z.string().default(""),  // hex — overrides palette.accent
  titleScale: z.number().default(1),    // 0.8..1.3
  bodyScale: z.number().default(1),     // 0.8..1.3
});
export type DeckFormatting = z.infer<typeof DeckFormatting>;

export const StrategyDeck = z.object({
  company: z.string().default(""),
  horizon: z.string().default(""),
  planTitle: z.string().default(""),
  headlineTarget: z.string().default(""),
  date: z.string().default(""),
  theme: z.string().default("navy-classic"),
  formatting: DeckFormatting.default(() => ({
    titleFont: "", bodyFont: "", accentColor: "", titleScale: 1, bodyScale: 1,
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
  accentColor: "",
  titleScale: 1,
  bodyScale: 1,
});
