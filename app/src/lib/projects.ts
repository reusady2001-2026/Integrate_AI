/**
 * Project = a workspace tied to one organization. It groups together
 * the documents (filled-out artifacts) generated for that company,
 * along with the source disclosures they were drafted from.
 *
 * Two flavours of provenance:
 *   • "seeded"  — shipped in the repo under data/projects/<slug>/. These
 *                 are projects pre-drafted by the agent (Claude Code, in
 *                 a chat session) and committed; users can edit them.
 *                 Edits land in localStorage and shadow the seed.
 *   • "user"    — created in-app, fully owned by the local browser.
 *
 * A project doc carries a full snapshot of an artifact's editor state
 * ({ doc, design }) — opening it loads the snapshot into the matching
 * store; saving back to the project re-serializes the store.
 */

import type { Artifact } from "./app-store";
import type { DocDesign } from "./themes/doc-themes";
import type { LocalizedLabel } from "./user-designs";

export type ProjectSourceKind =
  | "annual-report"
  | "quarterly"
  | "investor-deck"
  | "prospectus"
  | "filing"
  | "press-release"
  | "other";

export type ProjectSource = {
  id: string;
  kind: ProjectSourceKind;
  title: string;
  publisher?: string;
  url?: string;
  publishedAt?: string;
  retrievedAt?: string;
  notes?: string;
};

/**
 * One document inside a project. `doc` and `design` are the full
 * editor-state snapshot for the artifact type — shape depends on
 * `artifact`. We deliberately keep `doc` typed as `unknown` here
 * to avoid widening every store into this file; the call site that
 * loads a project doc into a store does the cast.
 */
export type ProjectDoc = {
  id: string;
  projectId: string;
  artifact: Artifact;
  name: LocalizedLabel;
  doc: unknown;
  design: DocDesign;
  createdAt: number;
  updatedAt: number;
};

export type Project = {
  id: string;
  slug: string;
  name: LocalizedLabel;
  description?: LocalizedLabel;
  industry?: string;
  ticker?: string;
  sources: ProjectSource[];
  docIds: string[];
  createdAt: number;
  updatedAt: number;
  seededFrom?: string;
};

export const newProjectId = (slug: string): string =>
  `prj_${slug}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

export const newProjectDocId = (artifact: string): string =>
  `pd_${artifact}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

export const newSourceId = (): string =>
  `src_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 5)}`;

export type SeededProjectFile = {
  project: Omit<Project, "id" | "createdAt" | "updatedAt" | "docIds" | "seededFrom"> & {
    docIds?: string[];
  };
  docs: Array<Omit<ProjectDoc, "projectId" | "createdAt" | "updatedAt">>;
};
