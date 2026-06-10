"use client";

import { create } from "zustand";
import type { Artifact } from "./app-store";
import type { DocDesign } from "./themes/doc-themes";
import type { LocalizedLabel } from "./user-designs";
import {
  newProjectDocId,
  newProjectId,
  type Project,
  type ProjectDoc,
  type ProjectSource,
} from "./projects";
import { SEEDED_PROJECTS } from "../data/projects";

const PROJECTS_KEY  = "integrate-ai.projects.v1";
const PROJECT_DOCS_KEY = "integrate-ai.project-docs.v1";
const SEEDS_APPLIED_KEY = "integrate-ai.projects-seeds-applied.v1";

const isBrowser = () => typeof window !== "undefined";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try { return JSON.parse(raw) as T; } catch { return fallback; }
}

function writeProjects(list: Project[]) {
  if (!isBrowser()) return;
  try { window.localStorage.setItem(PROJECTS_KEY, JSON.stringify(list)); } catch { /* quota */ }
}
function writeDocs(map: Record<string, ProjectDoc>) {
  if (!isBrowser()) return;
  try { window.localStorage.setItem(PROJECT_DOCS_KEY, JSON.stringify(map)); } catch { /* quota */ }
}

type State = {
  projects: Project[];
  docs: Record<string, ProjectDoc>;
  hydrated: boolean;

  hydrate: () => void;

  // ─── Project CRUD ──────────────────────────────────────────────
  createProject: (name: LocalizedLabel, slug: string) => Project;
  updateProject: (id: string, patch: Partial<Omit<Project, "id" | "createdAt">>) => void;
  deleteProject: (id: string) => void;
  duplicateProject: (id: string) => Project | undefined;
  findBySlug: (slug: string) => Project | undefined;

  // ─── Sources ───────────────────────────────────────────────────
  addSource: (projectId: string, src: Omit<ProjectSource, "id">) => void;
  updateSource: (projectId: string, sourceId: string, patch: Partial<ProjectSource>) => void;
  removeSource: (projectId: string, sourceId: string) => void;

  // ─── Project docs ──────────────────────────────────────────────
  /**
   * Snapshot the current editor state into the project. Returns the new doc.
   * If `docId` is provided, updates that doc in place; otherwise creates new.
   */
  saveDoc: (params: {
    projectId: string;
    artifact: Artifact;
    name: LocalizedLabel;
    doc: unknown;
    design: DocDesign;
    docId?: string;
  }) => ProjectDoc;
  deleteDoc: (projectId: string, docId: string) => void;
  getDoc: (docId: string) => ProjectDoc | undefined;
  docsFor: (projectId: string) => ProjectDoc[];
};

export const useProjectsStore = create<State>((set, get) => ({
  projects: [],
  docs: {},
  hydrated: false,

  hydrate: () => {
    if (get().hydrated) return;
    if (!isBrowser()) { set({ hydrated: true }); return; }

    let projects = safeParse<Project[]>(window.localStorage.getItem(PROJECTS_KEY), []);
    const docs   = safeParse<Record<string, ProjectDoc>>(window.localStorage.getItem(PROJECT_DOCS_KEY), {});

    // Seeds-applied tracking. Old format was a string[] (slug list); new
    // format is {[slug]: version} so we can detect when the agent bumps
    // the seed and re-apply, overwriting any old copy in localStorage.
    const rawSeeds = safeParse<unknown>(window.localStorage.getItem(SEEDS_APPLIED_KEY), {});
    const seedsAppliedMap: Record<string, number> = Array.isArray(rawSeeds)
      ? Object.fromEntries((rawSeeds as string[]).map((slug) => [slug, 1]))
      : (rawSeeds as Record<string, number>) ?? {};

    let mutated = false;

    for (const seed of SEEDED_PROJECTS) {
      const wantedVersion = seed.version ?? 1;
      const appliedVersion = seedsAppliedMap[seed.project.slug];
      if (appliedVersion === wantedVersion) continue;

      // If a previous version of this seed exists in localStorage, remove
      // it (and its docs) before applying the new version. This is
      // intentionally destructive — user edits made to a seeded project
      // since the last apply will be replaced.
      const oldSeeded = projects.find((p) => p.seededFrom === seed.project.slug);
      if (oldSeeded) {
        for (const docId of oldSeeded.docIds) delete docs[docId];
        projects = projects.filter((p) => p !== oldSeeded);
      }

      const now = Date.now();
      const projectId = newProjectId(seed.project.slug);
      const seededDocs: ProjectDoc[] = seed.docs.map((d) => ({
        ...d,
        projectId,
        createdAt: now,
        updatedAt: now,
      }));
      const project: Project = {
        ...seed.project,
        id: projectId,
        seededFrom: seed.project.slug,
        docIds: seededDocs.map((d) => d.id),
        createdAt: now,
        updatedAt: now,
      };
      projects.push(project);
      for (const d of seededDocs) docs[d.id] = d;
      seedsAppliedMap[seed.project.slug] = wantedVersion;
      mutated = true;
    }

    if (mutated) {
      writeProjects(projects);
      writeDocs(docs);
      try { window.localStorage.setItem(SEEDS_APPLIED_KEY, JSON.stringify(seedsAppliedMap)); } catch { /* */ }
    }

    set({ projects, docs, hydrated: true });
  },

  createProject: (name, slug) => {
    const now = Date.now();
    const id = newProjectId(slug);
    const project: Project = {
      id, slug, name,
      sources: [],
      docIds: [],
      createdAt: now,
      updatedAt: now,
    };
    const next = [...get().projects, project];
    writeProjects(next);
    set({ projects: next });
    return project;
  },

  updateProject: (id, patch) => {
    const next = get().projects.map((p) =>
      p.id === id ? { ...p, ...patch, updatedAt: Date.now() } : p,
    );
    writeProjects(next);
    set({ projects: next });
  },

  deleteProject: (id) => {
    const docs = { ...get().docs };
    const project = get().projects.find((p) => p.id === id);
    if (project) {
      for (const docId of project.docIds) delete docs[docId];
    }
    const next = get().projects.filter((p) => p.id !== id);
    writeProjects(next);
    writeDocs(docs);
    set({ projects: next, docs });
  },

  duplicateProject: (id) => {
    const orig = get().projects.find((p) => p.id === id);
    if (!orig) return undefined;
    const now = Date.now();
    const newId = newProjectId(`${orig.slug}-copy`);
    const docs = { ...get().docs };
    const newDocIds: string[] = [];
    for (const oldDocId of orig.docIds) {
      const oldDoc = docs[oldDocId];
      if (!oldDoc) continue;
      const newDocId = newProjectDocId(oldDoc.artifact);
      const cloned: ProjectDoc = JSON.parse(JSON.stringify(oldDoc));
      cloned.id = newDocId;
      cloned.projectId = newId;
      cloned.createdAt = now;
      cloned.updatedAt = now;
      docs[newDocId] = cloned;
      newDocIds.push(newDocId);
    }
    const copy: Project = {
      ...JSON.parse(JSON.stringify(orig)),
      id: newId,
      slug: `${orig.slug}-copy`,
      docIds: newDocIds,
      seededFrom: undefined,
      createdAt: now,
      updatedAt: now,
    };
    const next = [...get().projects, copy];
    writeProjects(next);
    writeDocs(docs);
    set({ projects: next, docs });
    return copy;
  },

  findBySlug: (slug) => get().projects.find((p) => p.slug === slug),

  addSource: (projectId, src) => {
    get().updateProject(projectId, {
      sources: [...(get().projects.find((p) => p.id === projectId)?.sources ?? []),
                { ...src, id: `src_${Date.now().toString(36)}_${Math.random().toString(36).slice(2,5)}` }],
    });
  },
  updateSource: (projectId, sourceId, patch) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;
    get().updateProject(projectId, {
      sources: project.sources.map((s) => s.id === sourceId ? { ...s, ...patch } : s),
    });
  },
  removeSource: (projectId, sourceId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return;
    get().updateProject(projectId, {
      sources: project.sources.filter((s) => s.id !== sourceId),
    });
  },

  saveDoc: ({ projectId, artifact, name, doc, design, docId }) => {
    const now = Date.now();
    const docs = { ...get().docs };
    const id = docId ?? newProjectDocId(artifact);
    const existing = docId ? docs[docId] : undefined;
    const projectDoc: ProjectDoc = existing
      ? { ...existing, name, doc, design, updatedAt: now }
      : { id, projectId, artifact, name, doc, design, createdAt: now, updatedAt: now };
    docs[id] = projectDoc;
    writeDocs(docs);
    set({ docs });
    if (!existing) {
      const projects = get().projects.map((p) =>
        p.id === projectId
          ? { ...p, docIds: [...p.docIds, id], updatedAt: now }
          : p,
      );
      writeProjects(projects);
      set({ projects });
    }
    return projectDoc;
  },

  deleteDoc: (projectId, docId) => {
    const docs = { ...get().docs };
    delete docs[docId];
    const projects = get().projects.map((p) =>
      p.id === projectId
        ? { ...p, docIds: p.docIds.filter((id) => id !== docId), updatedAt: Date.now() }
        : p,
    );
    writeProjects(projects);
    writeDocs(docs);
    set({ projects, docs });
  },

  getDoc: (docId) => get().docs[docId],
  docsFor: (projectId) => {
    const project = get().projects.find((p) => p.id === projectId);
    if (!project) return [];
    return project.docIds.map((id) => get().docs[id]).filter(Boolean);
  },
}));
