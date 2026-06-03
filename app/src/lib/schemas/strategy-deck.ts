import { z } from "zod";

export const Slide = z.object({
  title: z.string().default(""),
  bullets: z.array(z.string()).default([]),
});
export type Slide = z.infer<typeof Slide>;

export const StrategyDeck = z.object({
  company: z.string().default(""),
  horizon: z.string().default(""),
  planTitle: z.string().default(""),
  headlineTarget: z.string().default(""),
  date: z.string().default(""),
  slides: z.array(Slide).default([]),
});
export type StrategyDeck = z.infer<typeof StrategyDeck>;

export const emptySlide = (): Slide => ({ title: "", bullets: [""] });

export const emptyStrategyDeck = (): StrategyDeck => ({
  company: "",
  horizon: "",
  planTitle: "",
  headlineTarget: "",
  date: "",
  slides: [emptySlide()],
});
