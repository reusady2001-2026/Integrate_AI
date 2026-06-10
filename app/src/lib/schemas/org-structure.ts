import { z } from "zod";

export const GovernanceRow = z.object({
  body: z.string().default(""),
  mandate: z.string().default(""),
  composition: z.string().default(""),
});
export type GovernanceRow = z.infer<typeof GovernanceRow>;

export const Division = z.object({
  name: z.string().default(""),
  head: z.string().default(""),
  scope: z.string().default(""),
  kpis: z.string().default(""),
});
export type Division = z.infer<typeof Division>;

export const AuthorityRow = z.object({
  decision: z.string().default(""),
  decides: z.string().default(""),
  recommends: z.string().default(""),
  executes: z.string().default(""),
});
export type AuthorityRow = z.infer<typeof AuthorityRow>;

export const OrgStructure = z.object({
  company: z.string().default(""),
  date: z.string().default(""),
  principles: z.array(z.string()).default([]),
  governance: z.array(GovernanceRow).default([]),
  chart: z.string().default(""),
  divisions: z.array(Division).default([]),
  authority: z.array(AuthorityRow).default([]),
});
export type OrgStructure = z.infer<typeof OrgStructure>;

export const emptyGovernanceRow = (): GovernanceRow => ({ body: "", mandate: "", composition: "" });
export const emptyDivision = (): Division => ({ name: "", head: "", scope: "", kpis: "" });
export const emptyAuthorityRow = (): AuthorityRow => ({ decision: "", decides: "", recommends: "", executes: "" });

export const emptyOrgStructure = (): OrgStructure => ({
  company: "",
  date: "",
  principles: [""],
  governance: [emptyGovernanceRow()],
  chart: "",
  divisions: [emptyDivision()],
  authority: [emptyAuthorityRow()],
});
