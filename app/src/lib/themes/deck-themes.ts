export type DeckTheme = {
  id: string;
  name_he: string;
  name_en: string;
  dark: boolean;
  css: {
    bg: string;
    coverBg: string;
    coverText: string;
    title: string;
    body: string;
    accent: string;
    subtle: string;
  };
  pptx: {
    bg: string;
    coverBg: string;
    coverText: string;
    title: string;
    body: string;
    accent: string;
  };
};

export const DECK_THEMES: DeckTheme[] = [
  {
    id: "corporate",
    name_he: "תאגידי",
    name_en: "Corporate",
    dark: true,
    css: { bg: "#0f1f3d", coverBg: "#0a1628", coverText: "#ffffff", title: "#ffffff", body: "#c8d8f0", accent: "#f0b429", subtle: "#3a5278" },
    pptx: { bg: "0f1f3d", coverBg: "0a1628", coverText: "ffffff", title: "ffffff", body: "c8d8f0", accent: "f0b429" },
  },
  {
    id: "slate",
    name_he: "אפרורי",
    name_en: "Slate",
    dark: true,
    css: { bg: "#1e293b", coverBg: "#0f172a", coverText: "#f1f5f9", title: "#f1f5f9", body: "#94a3b8", accent: "#38bdf8", subtle: "#334155" },
    pptx: { bg: "1e293b", coverBg: "0f172a", coverText: "f1f5f9", title: "f1f5f9", body: "94a3b8", accent: "38bdf8" },
  },
  {
    id: "midnight",
    name_he: "חצות",
    name_en: "Midnight",
    dark: true,
    css: { bg: "#1a0a2e", coverBg: "#2d1b69", coverText: "#ffffff", title: "#e0d7ff", body: "#b4a6d8", accent: "#a78bfa", subtle: "#4c2885" },
    pptx: { bg: "1a0a2e", coverBg: "2d1b69", coverText: "ffffff", title: "e0d7ff", body: "b4a6d8", accent: "a78bfa" },
  },
  {
    id: "forest",
    name_he: "יער",
    name_en: "Forest",
    dark: true,
    css: { bg: "#0d2818", coverBg: "#163a24", coverText: "#ffffff", title: "#d4f0e4", body: "#86c5a3", accent: "#4ade80", subtle: "#1a4a2e" },
    pptx: { bg: "0d2818", coverBg: "163a24", coverText: "ffffff", title: "d4f0e4", body: "86c5a3", accent: "4ade80" },
  },
  {
    id: "crimson",
    name_he: "ארגמן",
    name_en: "Crimson",
    dark: true,
    css: { bg: "#2d0a0a", coverBg: "#7f1d1d", coverText: "#ffffff", title: "#fecaca", body: "#fca5a5", accent: "#f87171", subtle: "#5a1010" },
    pptx: { bg: "2d0a0a", coverBg: "7f1d1d", coverText: "ffffff", title: "fecaca", body: "fca5a5", accent: "f87171" },
  },
  {
    id: "executive",
    name_he: "מנהלתי",
    name_en: "Executive",
    dark: true,
    css: { bg: "#1c1c1e", coverBg: "#000000", coverText: "#ffffff", title: "#ffffff", body: "#a1a1aa", accent: "#d4a843", subtle: "#3f3f46" },
    pptx: { bg: "1c1c1e", coverBg: "000000", coverText: "ffffff", title: "ffffff", body: "a1a1aa", accent: "d4a843" },
  },
  {
    id: "clean",
    name_he: "נקי",
    name_en: "Clean",
    dark: false,
    css: { bg: "#ffffff", coverBg: "#1e3a5f", coverText: "#ffffff", title: "#1e3a5f", body: "#374151", accent: "#2563eb", subtle: "#e5e7eb" },
    pptx: { bg: "ffffff", coverBg: "1e3a5f", coverText: "ffffff", title: "1e3a5f", body: "374151", accent: "2563eb" },
  },
  {
    id: "cream",
    name_he: "קרם",
    name_en: "Cream",
    dark: false,
    css: { bg: "#fdf8f3", coverBg: "#7c3a2d", coverText: "#ffffff", title: "#44200e", body: "#6b4226", accent: "#c9592a", subtle: "#e8d5c4" },
    pptx: { bg: "fdf8f3", coverBg: "7c3a2d", coverText: "ffffff", title: "44200e", body: "6b4226", accent: "c9592a" },
  },
  {
    id: "minimal",
    name_he: "מינימל",
    name_en: "Minimal",
    dark: false,
    css: { bg: "#f8fafc", coverBg: "#64748b", coverText: "#ffffff", title: "#0f172a", body: "#475569", accent: "#334155", subtle: "#e2e8f0" },
    pptx: { bg: "f8fafc", coverBg: "64748b", coverText: "ffffff", title: "0f172a", body: "475569", accent: "334155" },
  },
  {
    id: "warm",
    name_he: "חמים",
    name_en: "Warm",
    dark: false,
    css: { bg: "#fffbf5", coverBg: "#ea580c", coverText: "#ffffff", title: "#431407", body: "#7c2d12", accent: "#ea580c", subtle: "#fed7aa" },
    pptx: { bg: "fffbf5", coverBg: "ea580c", coverText: "ffffff", title: "431407", body: "7c2d12", accent: "ea580c" },
  },
  {
    id: "bold-black",
    name_he: "שחור בולט",
    name_en: "Bold Black",
    dark: true,
    css: { bg: "#000000", coverBg: "#111111", coverText: "#ffffff", title: "#ffffff", body: "#a3a3a3", accent: "#facc15", subtle: "#262626" },
    pptx: { bg: "000000", coverBg: "111111", coverText: "ffffff", title: "ffffff", body: "a3a3a3", accent: "facc15" },
  },
  {
    id: "sky",
    name_he: "שמיים",
    name_en: "Sky",
    dark: true,
    css: { bg: "#1e3a5f", coverBg: "#0f1f3d", coverText: "#ffffff", title: "#ffffff", body: "#bfdbfe", accent: "#60a5fa", subtle: "#1e40af" },
    pptx: { bg: "1e3a5f", coverBg: "0f1f3d", coverText: "ffffff", title: "ffffff", body: "bfdbfe", accent: "60a5fa" },
  },
  {
    id: "night-violet",
    name_he: "לילה סגול",
    name_en: "Night Violet",
    dark: true,
    css: { bg: "#09090b", coverBg: "#1a0a2e", coverText: "#ffffff", title: "#e8e0ff", body: "#9e86e8", accent: "#818cf8", subtle: "#1e1b4b" },
    pptx: { bg: "09090b", coverBg: "1a0a2e", coverText: "ffffff", title: "e8e0ff", body: "9e86e8", accent: "818cf8" },
  },
  {
    id: "dawn",
    name_he: "שחר",
    name_en: "Dawn",
    dark: true,
    css: { bg: "#1a1a2e", coverBg: "#9e2a2b", coverText: "#ffffff", title: "#ffe4e4", body: "#fca5a5", accent: "#fb7185", subtle: "#450a0a" },
    pptx: { bg: "1a1a2e", coverBg: "9e2a2b", coverText: "ffffff", title: "ffe4e4", body: "fca5a5", accent: "fb7185" },
  },
  {
    id: "tech",
    name_he: "טכנולוגי",
    name_en: "Tech",
    dark: true,
    css: { bg: "#020617", coverBg: "#0f172a", coverText: "#ffffff", title: "#e2e8f0", body: "#64748b", accent: "#22d3ee", subtle: "#0c1426" },
    pptx: { bg: "020617", coverBg: "0f172a", coverText: "ffffff", title: "e2e8f0", body: "64748b", accent: "22d3ee" },
  },
  {
    id: "editorial",
    name_he: "עריכה",
    name_en: "Editorial",
    dark: false,
    css: { bg: "#ffffff", coverBg: "#111827", coverText: "#ffffff", title: "#111827", body: "#374151", accent: "#111827", subtle: "#d1d5db" },
    pptx: { bg: "ffffff", coverBg: "111827", coverText: "ffffff", title: "111827", body: "374151", accent: "111827" },
  },
];
