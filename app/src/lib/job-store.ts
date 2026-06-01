"use client";

import { create } from "zustand";
import type { Lang } from "./i18n";
import { translateJobDoc } from "./translate";
import {
  emptyArea,
  emptyInterface,
  emptyJobDocument,
  type Interface,
  type JobDocument,
  type ResponsibilityArea,
} from "./schemas/job-description";

type JobState = {
  doc: JobDocument;
  setField: <K extends keyof JobDocument>(key: K, value: JobDocument[K]) => void;
  setArea: (i: number, patch: Partial<ResponsibilityArea>) => void;
  addArea: () => void;
  removeArea: (i: number) => void;
  setDuty: (areaIdx: number, dutyIdx: number, value: string) => void;
  addDuty: (areaIdx: number) => void;
  removeDuty: (areaIdx: number, dutyIdx: number) => void;
  setInterface: (i: number, patch: Partial<Interface>) => void;
  addInterface: () => void;
  removeInterface: (i: number) => void;
  toggleSection: (key: keyof JobDocument["enabled"]) => void;
  loadSample: () => void;
  reset: () => void;
  translate: (from: Lang, to: Lang) => Promise<void>;
};

export const useJobStore = create<JobState>((set, get) => ({
  doc: emptyJobDocument(),

  setField: (key, value) => set((s) => ({ doc: { ...s.doc, [key]: value } })),

  setArea: (i, patch) =>
    set((s) => ({
      doc: {
        ...s.doc,
        areas: s.doc.areas.map((a, idx) => (idx === i ? { ...a, ...patch } : a)),
      },
    })),
  addArea: () =>
    set((s) => ({ doc: { ...s.doc, areas: [...s.doc.areas, emptyArea()] } })),
  removeArea: (i) =>
    set((s) => ({
      doc: {
        ...s.doc,
        areas: s.doc.areas.length > 1 ? s.doc.areas.filter((_, idx) => idx !== i) : s.doc.areas,
      },
    })),

  setDuty: (areaIdx, dutyIdx, value) =>
    set((s) => ({
      doc: {
        ...s.doc,
        areas: s.doc.areas.map((a, ai) =>
          ai === areaIdx
            ? { ...a, duties: a.duties.map((d, di) => (di === dutyIdx ? value : d)) }
            : a,
        ),
      },
    })),
  addDuty: (areaIdx) =>
    set((s) => ({
      doc: {
        ...s.doc,
        areas: s.doc.areas.map((a, ai) =>
          ai === areaIdx ? { ...a, duties: [...a.duties, ""] } : a,
        ),
      },
    })),
  removeDuty: (areaIdx, dutyIdx) =>
    set((s) => ({
      doc: {
        ...s.doc,
        areas: s.doc.areas.map((a, ai) =>
          ai === areaIdx && a.duties.length > 1
            ? { ...a, duties: a.duties.filter((_, di) => di !== dutyIdx) }
            : a,
        ),
      },
    })),

  setInterface: (i, patch) =>
    set((s) => ({
      doc: {
        ...s.doc,
        interfaces: s.doc.interfaces.map((iface, idx) => (idx === i ? { ...iface, ...patch } : iface)),
      },
    })),
  addInterface: () =>
    set((s) => ({ doc: { ...s.doc, interfaces: [...s.doc.interfaces, emptyInterface()] } })),
  removeInterface: (i) =>
    set((s) => ({
      doc: {
        ...s.doc,
        interfaces:
          s.doc.interfaces.length > 1
            ? s.doc.interfaces.filter((_, idx) => idx !== i)
            : s.doc.interfaces,
      },
    })),

  toggleSection: (key) =>
    set((s) => ({
      doc: { ...s.doc, enabled: { ...s.doc.enabled, [key]: !s.doc.enabled[key] } },
    })),

  loadSample: () => set({ doc: sampleJob() }),
  reset: () => set({ doc: emptyJobDocument() }),
  translate: async (from, to) => {
    const translated = await translateJobDoc(get().doc, from, to);
    set({ doc: translated });
  },
}));

function sampleJob(): JobDocument {
  return {
    title: "סמנכ\"ל כספים (CFO)",
    positioning: "מוביל את הזרוע הפיננסית והבקרה התקציבית מקצה לקצה.",
    reportsTo: "מנכ\"ל",
    directReports: "חשבת ראשית, מנהל תקציבים, יחס משקיעים",
    division: "כספים",
    date: "1 ביוני 2026",
    purpose:
      "אחראי על ניהול הכספים, התכנון הפיננסי, ניהול הסיכונים והדיווח הפיננסי. עובד בשיתוף הדוק עם המנכ\"ל והדירקטוריון על מבנה ההון, חלוקת הון, ויחסי משקיעים.",
    areas: [
      {
        name: "ניהול פיננסי שוטף",
        duties: [
          "ניהול הדיווח החודשי, הרבעוני והשנתי בהתאם ל-IFRS.",
          "בקרה תקציבית מול ביצועים ודיווח חריגות להנהלה.",
          "ניהול תזרים המזומנים והקשר עם הבנקים.",
        ],
      },
      {
        name: "תכנון פיננסי אסטרטגי",
        duties: [
          "בניית תכנית עבודה שנתית ותחזיות רב-שנתיות.",
          "ניתוח רכישות, מיזוגים והשקעות.",
        ],
      },
    ],
    interfaces: [
      { party: "דירקטוריון", kind: "פנימי", purpose: "דיווח רבעוני ואישור תקציב" },
      { party: "רואי חשבון חיצוניים", kind: "חיצוני", purpose: "ביקורת שנתית ודוחות" },
    ],
    successMetrics:
      "סגירה חודשית עד יום 5 לכל חודש; דיוק תחזית מול ביצוע ±3%; דירוג אשראי A ומעלה.",
    required:
      "תואר ראשון בכלכלה/חשבונאות, ניסיון 10+ שנים בתפקידי כספים בכירים, רישיון רו\"ח, ניסיון בחברה ציבורית.",
    advantage: "MBA, ניסיון ב-IPO או גיוסי הון, אנגלית ברמת שפת אם.",
    decides: "תקציב פנימי של חטיבת הכספים, גיוסים בחטיבה, החלטות בנקאיות יומיומיות.",
    recommends: "מבנה הון, חלוקת דיבידנד, השקעות אסטרטגיות.",
    escalates: "כל החלטה הדורשת אישור דירקטוריון או חריגה תקציבית מעל 5%.",
    enabled: {
      interfaces: true,
      successMetrics: true,
      qualifications: true,
      authority: true,
    },
  };
}
