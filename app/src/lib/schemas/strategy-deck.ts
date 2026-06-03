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

export const StrategyDeck = z.object({
  company: z.string().default(""),
  horizon: z.string().default(""),
  planTitle: z.string().default(""),
  headlineTarget: z.string().default(""),
  date: z.string().default(""),
  theme: z.string().default("corporate"),
  slides: z.array(Slide).default([]),
});
export type StrategyDeck = z.infer<typeof StrategyDeck>;

export const emptySlide = (layout: SlideLayout = "content"): Slide => ({
  layout,
  title: "",
  subtitle: "",
  bullets: layout === "content" ? [""] : [],
});
