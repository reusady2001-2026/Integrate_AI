import { z } from "zod";

export const Step = z.object({
  what: z.string().default(""),
  who: z.string().default(""),
  output: z.string().default(""),
});
export type Step = z.infer<typeof Step>;

export const RaciRow = z.object({
  activity: z.string().default(""),
  r: z.string().default(""),
  a: z.string().default(""),
  c: z.string().default(""),
  i: z.string().default(""),
});
export type RaciRow = z.infer<typeof RaciRow>;

export const Workflow = z.object({
  name: z.string().default(""),
  owner: z.string().default(""),
  purpose: z.string().default(""),
  scope: z.string().default(""),
  trigger: z.string().default(""),
  frequency: z.string().default(""),
  version: z.string().default(""),
  inputs: z.array(z.string()).default([]),
  outputs: z.array(z.string()).default([]),
  steps: z.array(Step).default([]),
  raci: z.array(RaciRow).default([]),
  controls: z.string().default(""),
});
export type Workflow = z.infer<typeof Workflow>;

export const emptyStep = (): Step => ({ what: "", who: "", output: "" });
export const emptyRaciRow = (): RaciRow => ({ activity: "", r: "", a: "", c: "", i: "" });

export const emptyWorkflow = (): Workflow => ({
  name: "", owner: "", purpose: "", scope: "", trigger: "", frequency: "", version: "",
  inputs: [""],
  outputs: [""],
  steps: [emptyStep()],
  raci: [emptyRaciRow()],
  controls: "",
});
