import { z } from "zod";

export const Interface = z.object({
  party: z.string(),
  kind: z.string(),
  purpose: z.string(),
});
export type Interface = z.infer<typeof Interface>;

export const ResponsibilityArea = z.object({
  name: z.string(),
  duties: z.array(z.string()),
});
export type ResponsibilityArea = z.infer<typeof ResponsibilityArea>;

export const JobDocument = z.object({
  title: z.string(),
  positioning: z.string(),
  reportsTo: z.string(),
  directReports: z.string(),
  division: z.string(),
  date: z.string(),
  purpose: z.string(),
  areas: z.array(ResponsibilityArea),
  interfaces: z.array(Interface),
  successMetrics: z.string(),
  required: z.string(),
  advantage: z.string(),
  decides: z.string(),
  recommends: z.string(),
  escalates: z.string(),
  enabled: z.object({
    interfaces: z.boolean(),
    successMetrics: z.boolean(),
    qualifications: z.boolean(),
    authority: z.boolean(),
  }),
});
export type JobDocument = z.infer<typeof JobDocument>;

export const emptyArea = (): ResponsibilityArea => ({
  name: "",
  duties: [""],
});

export const emptyInterface = (): Interface => ({
  party: "",
  kind: "",
  purpose: "",
});

export const emptyJobDocument = (): JobDocument => ({
  title: "",
  positioning: "",
  reportsTo: "",
  directReports: "",
  division: "",
  date: "",
  purpose: "",
  areas: [emptyArea()],
  interfaces: [emptyInterface()],
  successMetrics: "",
  required: "",
  advantage: "",
  decides: "",
  recommends: "",
  escalates: "",
  enabled: {
    interfaces: false,
    successMetrics: false,
    qualifications: false,
    authority: false,
  },
});
