/**
 * Seeded projects shipped in the repo. The agent (Claude Code, in a
 * chat session) researches a real company, drafts its documents, and
 * commits a folder under this directory matching SeededProjectFile.
 * The projects store applies each new seed once on first hydrate,
 * after which user edits live in localStorage and shadow the seed.
 *
 * To add a project, create ./<slug>/index.ts that default-exports a
 * SeededProjectFile and append it to the array below.
 */

import type { SeededProjectFile } from "../../lib/projects";
import dorAlon from "./dor-alon";
import rivuaNadlan from "./rivua-nadlan";

export const SEEDED_PROJECTS: SeededProjectFile[] = [
  dorAlon,
  rivuaNadlan,
];
