"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore, type Artifact } from "@/lib/app-store";
import { useStrategyDeckStore } from "@/lib/strategy-deck-store";
import { strings } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { DECK_THEMES, PALETTES, type PaletteId } from "@/lib/themes/deck-themes";
import type { SlideLayout } from "@/lib/schemas/strategy-deck";
import { SlideView, SLIDE_W, SLIDE_H } from "./SlideView";
import styles from "./DeckEditor.module.css";

const THUMB_W = 172;
const THUMB_SCALE = THUMB_W / SLIDE_W;

const LAYOUTS: SlideLayout[] = ["cover", "content", "section", "quote"];
const ARTIFACTS_FOR_DROPDOWN: Artifact[] = [
  "kpi", "job-description", "strategy-document", "strategy-deck", "org-structure", "workflow",
];

export function DeckEditor() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [canvasScale, setCanvasScale] = useState(1);
  const [translating, setTranslating] = useState(false);
  const [themePickerOpen, setThemePickerOpen] = useState(false);
  const [palettePickerOpen, setPalettePickerOpen] = useState(false);
  const [formatOpen, setFormatOpen] = useState(false);
  const canvasRef = useRef<HTMLDivElement>(null);
  const themePickerRef = useRef<HTMLDivElement>(null);
  const palettePickerRef = useRef<HTMLDivElement>(null);
  const formatPanelRef = useRef<HTMLDivElement>(null);

  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const artifact = useAppStore((s) => s.artifact);
  const openArtifact = useAppStore((s) => s.openArtifact);
  const goHome = useAppStore((s) => s.goHome);
  const t = strings[lang];

  const st = useStrategyDeckStore();
  const doc = useStrategyDeckStore((s) => s.doc);

  const selectedTheme = DECK_THEMES.find((th) => th.id === doc.theme) ?? DECK_THEMES[0];
  const slideIdx = Math.min(currentSlide, doc.slides.length - 1);
  const slide = doc.slides[slideIdx] ?? doc.slides[0];

  useEffect(() => {
    if (currentSlide >= doc.slides.length) {
      setCurrentSlide(Math.max(0, doc.slides.length - 1));
    }
  }, [doc.slides.length, currentSlide]);

  // Scale canvas to fit container
  useEffect(() => {
    const el = canvasRef.current;
    if (!el) return;
    const update = () => setCanvasScale(el.clientWidth / SLIDE_W);
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Click-outside handlers for the popovers
  useEffect(() => {
    if (!themePickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!themePickerRef.current?.contains(e.target as Node)) setThemePickerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [themePickerOpen]);

  useEffect(() => {
    if (!palettePickerOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!palettePickerRef.current?.contains(e.target as Node)) setPalettePickerOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [palettePickerOpen]);

  useEffect(() => {
    if (!formatOpen) return;
    const onDown = (e: MouseEvent) => {
      if (!formatPanelRef.current?.contains(e.target as Node)) setFormatOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [formatOpen]);

  const switchLang = useCallback(
    async (to: Lang) => {
      if (lang === to) return;
      setTranslating(true);
      await st.translate(lang, to);
      setLang(to);
      setTranslating(false);
    },
    [lang, setLang, st],
  );

  const handleAddSlide = () => {
    st.addSlide("content");
    setCurrentSlide(doc.slides.length);
  };

  const handleRemoveSlide = (i: number) => {
    st.removeSlide(i);
    setCurrentSlide((prev) => Math.max(0, prev >= doc.slides.length - 1 ? doc.slides.length - 2 : prev));
  };

  const handleExportPptx = useCallback(async () => {
    const { renderDeckPptx } = await import("@/lib/export/deck-pptx");
    await renderDeckPptx(doc, lang);
  }, [doc, lang]);

  const handleExportPdf = () => window.print();

  return (
    <>
      <div className={styles.root}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button type="button" onClick={goHome}
              className="text-xs px-2 py-1 rounded hover:bg-neutral-100 text-[color:var(--app-muted)]">
              ← {t.home.title}
            </button>
            <span className={styles.divider}>|</span>
            <select value={artifact}
              onChange={(e) => openArtifact(e.target.value as Artifact)}
              className="font-display text-base bg-transparent border-0 outline-none cursor-pointer hover:opacity-70"
              aria-label="artifact">
              {ARTIFACTS_FOR_DROPDOWN.map((a) => (
                <option key={a} value={a}>{t.artifacts[a].title}</option>
              ))}
            </select>
            <span className={styles.divider}>|</span>
            <button type="button" onClick={st.loadSample}
              className="text-xs px-2 py-1 rounded hover:bg-neutral-100">{t.loadSample}</button>
            <button type="button" onClick={st.reset}
              className="text-xs px-2 py-1 rounded hover:bg-neutral-100">{t.reset}</button>
          </div>

          <div className={styles.headerRight}>
            {/* Theme picker — visual gallery */}
            <div ref={themePickerRef} style={{ position: "relative" }}>
              <button type="button" onClick={() => setThemePickerOpen((o) => !o)}
                className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50">
                {t.deck.themePicker} ({lang === "he" ? selectedTheme.name_he : selectedTheme.name_en})
              </button>
              {themePickerOpen && (
                <div className={styles.themeGallery} dir={t.dir}>
                  <div className={styles.themeGalleryHeader}>{t.deck.themePicker}</div>
                  <div className={styles.themeGrid}>
                    {DECK_THEMES.map((th) => {
                      const p = PALETTES[th.palette];
                      const isSelected = th.id === doc.theme;
                      return (
                        <button
                          key={th.id}
                          type="button"
                          onClick={() => { st.setTheme(th.id); setThemePickerOpen(false); }}
                          className={`${styles.themeCard} ${isSelected ? styles.themeCardSelected : ""}`}
                          title={lang === "he" ? th.name_he : th.name_en}
                        >
                          <div className={styles.themeMiniWrap}>
                            <div className={styles.themeMiniInner} style={{ transform: `scale(${112 / SLIDE_W})` }}>
                              <SlideView
                                slide={{ layout: "content", title: lang === "he" ? "כותרת לדוגמה" : "Sample Title", subtitle: "", bullets: [lang === "he" ? "נקודה ראשונה" : "First point", lang === "he" ? "נקודה שנייה" : "Second point", lang === "he" ? "נקודה שלישית" : "Third point"] }}
                                theme={th}
                                doc={doc}
                                interactive={false}
                              />
                            </div>
                          </div>
                          <div className={styles.themeCardName}>{lang === "he" ? th.name_he : th.name_en}</div>
                          <div className={styles.themeSwatches}>
                            <span style={{ background: p.coverBg }} />
                            <span style={{ background: p.bg, border: "1px solid #ccc" }} />
                            <span style={{ background: p.accent }} />
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Palette override picker */}
            <div ref={palettePickerRef} style={{ position: "relative" }}>
              <button type="button" onClick={() => setPalettePickerOpen((o) => !o)}
                className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
                style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{
                  display: "inline-block", width: 14, height: 14, borderRadius: "50%",
                  background: doc.paletteOverride
                    ? PALETTES[doc.paletteOverride as PaletteId]?.accent
                    : PALETTES[selectedTheme.palette].accent,
                  border: "1px solid rgba(0,0,0,0.15)",
                  flexShrink: 0,
                }} />
                {lang === "he" ? "פלטה" : "Palette"}
                {doc.paletteOverride ? " ✓" : ""}
              </button>
              {palettePickerOpen && (
                <div className={styles.themeGallery} dir={t.dir} style={{ width: 340 }}>
                  <div className={styles.themeGalleryHeader}>{lang === "he" ? "בחר פלטת צבעים" : "Choose colour palette"}</div>
                  <div style={{ marginBottom: 8 }}>
                    <button type="button"
                      onClick={() => { st.setPaletteOverride(""); setPalettePickerOpen(false); }}
                      style={{
                        width: "100%", padding: "6px 12px", fontSize: 11, textAlign: "start",
                        background: !doc.paletteOverride ? "var(--app-accent)" : "transparent",
                        color: !doc.paletteOverride ? "#fff" : "inherit",
                        border: "1px solid var(--app-border)", borderRadius: 4, cursor: "pointer",
                      }}>
                      {lang === "he" ? "ברירת מחדל (לפי עיצוב)" : "Default (from design)"}
                    </button>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {(Object.keys(PALETTES) as PaletteId[]).map((pid) => {
                      const p = PALETTES[pid];
                      const isActive = doc.paletteOverride === pid;
                      const names: Record<PaletteId, { he: string; en: string }> = {
                        "corporate-navy":   { he: "Navy תאגידי",     en: "Corporate Navy" },
                        "midnight-violet":  { he: "סגול לילה",       en: "Midnight Violet" },
                        "deep-forest":      { he: "יער עמוק",        en: "Deep Forest" },
                        "wine":             { he: "יין",             en: "Wine" },
                        "obsidian":         { he: "אבסידיאן",        en: "Obsidian" },
                        "tech-cyan":        { he: "ציאן טכנולוגי",   en: "Tech Cyan" },
                        "muted-slate":      { he: "סלייט אפור",      en: "Muted Slate" },
                        "soft-cream":       { he: "קרם רך",          en: "Soft Cream" },
                        "minimal-paper":    { he: "נייר מינימלי",    en: "Minimal Paper" },
                        "warm-terracotta":  { he: "טראקוטה חמה",     en: "Warm Terracotta" },
                        "fresh-green":      { he: "ירוק טרי",        en: "Fresh Green" },
                        "blush":            { he: "ורוד-סומק",       en: "Blush" },
                        "monochrome":       { he: "מונוכרום",        en: "Monochrome" },
                        "earth":            { he: "אדמה",            en: "Earth" },
                        "arctic":           { he: "ארקטי",           en: "Arctic" },
                        "sunset":           { he: "שקיעה",           en: "Sunset" },
                      };
                      return (
                        <button key={pid} type="button"
                          onClick={() => { st.setPaletteOverride(pid); setPalettePickerOpen(false); }}
                          style={{
                            display: "flex", alignItems: "center", gap: 8, padding: "7px 10px",
                            border: isActive ? "2px solid var(--app-accent)" : "1px solid var(--app-border)",
                            borderRadius: 6, cursor: "pointer",
                            background: isActive ? "rgba(var(--app-accent-rgb),0.06)" : "white",
                            textAlign: "start",
                          }}>
                          {/* mini gradient swatch */}
                          <div style={{
                            width: 36, height: 26, borderRadius: 4, flexShrink: 0, overflow: "hidden",
                            border: "1px solid rgba(0,0,0,0.08)",
                          }}>
                            <div style={{ width: "100%", height: "55%", background: p.coverGradient }} />
                            <div style={{ width: "100%", height: "45%", background: p.bgGradient, display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 3 }}>
                              <span style={{ width: 6, height: 6, borderRadius: "50%", background: p.accent, display: "block" }} />
                            </div>
                          </div>
                          <span style={{ fontSize: 11, lineHeight: 1.3 }}>
                            {lang === "he" ? names[pid].he : names[pid].en}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Per-deck formatting overrides */}
            <div ref={formatPanelRef} style={{ position: "relative" }}>
              <button type="button" onClick={() => setFormatOpen((o) => !o)}
                className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50">
                {t.deck.format}
              </button>
              {formatOpen && (
                <div className={styles.formatPanel} dir={t.dir}>
                  <div className={styles.formatPanelTitle}>{t.deck.format}</div>
                  <div className={styles.formatPanelHint}>{t.deck.formatHint}</div>

                  <Row label={t.deck.titleFont}>
                    <FontSelect value={doc.formatting.titleFont} onChange={(v) => st.setFormatting({ titleFont: v })} />
                  </Row>
                  <Row label={t.deck.bodyFont}>
                    <FontSelect value={doc.formatting.bodyFont} onChange={(v) => st.setFormatting({ bodyFont: v })} />
                  </Row>
                  <Row label={t.deck.accentColor}>
                    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="color"
                        value={doc.formatting.accentColor || PALETTES[selectedTheme.palette].accent}
                        onChange={(e) => st.setFormatting({ accentColor: e.target.value })}
                        style={{ width: 40, height: 28, border: "1px solid #ccc", borderRadius: 4, cursor: "pointer" }}
                      />
                      <button type="button"
                        onClick={() => st.setFormatting({ accentColor: "" })}
                        style={{ fontSize: 11, padding: "4px 8px", border: "1px solid #ddd", borderRadius: 4, background: "white", cursor: "pointer" }}
                      >{t.deck.useTheme}</button>
                    </div>
                  </Row>
                  <Row label={`${t.deck.titleSize} — ×${doc.formatting.titleScale.toFixed(2)}`}>
                    <input type="range" min={0.7} max={1.4} step={0.05}
                      value={doc.formatting.titleScale}
                      onChange={(e) => st.setFormatting({ titleScale: Number(e.target.value) })}
                      style={{ width: "100%" }}
                    />
                  </Row>
                  <Row label={`${t.deck.bodySize} — ×${doc.formatting.bodyScale.toFixed(2)}`}>
                    <input type="range" min={0.7} max={1.4} step={0.05}
                      value={doc.formatting.bodyScale}
                      onChange={(e) => st.setFormatting({ bodyScale: Number(e.target.value) })}
                      style={{ width: "100%" }}
                    />
                  </Row>
                  <button type="button" onClick={st.resetFormatting}
                    className={styles.formatResetBtn}>
                    {t.deck.resetFormat}
                  </button>
                </div>
              )}
            </div>

            <button type="button" onClick={() => switchLang(lang === "he" ? "en" : "he")} disabled={translating}
              className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50 disabled:opacity-50">
              {translating ? t.translating : t.langToggle}
            </button>
            <button type="button" onClick={handleExportPptx}
              className="text-xs px-3 py-1.5 rounded bg-[color:var(--app-accent)] text-white">{t.deck.exportPptx}</button>
            <button type="button" onClick={handleExportPdf}
              className="text-xs px-3 py-1.5 rounded border border-[color:var(--app-border)] hover:bg-neutral-50">{t.deck.exportPdf}</button>
          </div>
        </header>

        {/* Main area */}
        <div className={styles.main}>
          {/* Thumbnail strip */}
          <div className={styles.thumbnailStrip} dir={t.dir}>
            {doc.slides.map((sl, i) => (
              <div key={i} className={styles.thumbItem} onClick={() => setCurrentSlide(i)}>
                <div className={styles.thumbIndex}>{i + 1}</div>
                <div className={`${styles.thumbFrame} ${i === slideIdx ? styles.selected : ""}`}>
                  <div className={styles.thumbInner}
                    style={{ transform: `scale(${THUMB_SCALE})`, width: SLIDE_W, height: SLIDE_H }}>
                    <SlideView slide={sl} theme={selectedTheme} doc={doc} interactive={false} />
                  </div>
                </div>
              </div>
            ))}
            <button type="button" className={styles.addSlideBtn} onClick={handleAddSlide}>
              + {t.deck.addSlide}
            </button>
          </div>

          {/* Canvas + controls */}
          <div className={styles.canvasArea}>
            <div ref={canvasRef} className={styles.canvasOuter}>
              <div className={styles.canvasInner}
                style={{ transform: `scale(${canvasScale})`, width: SLIDE_W, height: SLIDE_H }}>
                <SlideView
                  slide={slide}
                  theme={selectedTheme}
                  doc={doc}
                  interactive
                  onChange={(patch) => st.setSlide(slideIdx, patch)}
                  onBulletChange={(bi, v) => st.setBullet(slideIdx, bi, v)}
                  onAddBullet={() => st.addBullet(slideIdx)}
                  onRemoveBullet={(bi) => st.removeBullet(slideIdx, bi)}
                />
              </div>
            </div>

            <div className={styles.controls} dir={t.dir}>
              <button type="button" className={styles.navBtn} disabled={slideIdx === 0}
                onClick={() => setCurrentSlide(slideIdx - 1)}>{t.dir === "rtl" ? "→" : "←"}</button>
              <span className={styles.slideCounter}>{t.deck.slideCounter(slideIdx + 1, doc.slides.length)}</span>
              <button type="button" className={styles.navBtn} disabled={slideIdx === doc.slides.length - 1}
                onClick={() => setCurrentSlide(slideIdx + 1)}>{t.dir === "rtl" ? "←" : "→"}</button>

              <div className={styles.controlsDivider} />

              {LAYOUTS.map((layout) => {
                const label = { cover: t.deck.layoutCover, content: t.deck.layoutContent, section: t.deck.layoutSection, quote: t.deck.layoutQuote }[layout];
                return (
                  <button key={layout} type="button"
                    className={`${styles.layoutBtn} ${slide.layout === layout ? styles.layoutBtnActive : ""}`}
                    onClick={() => st.setSlide(slideIdx, { layout })}>{label}</button>
                );
              })}

              <div className={styles.controlsDivider} />

              <button type="button" className={styles.layoutBtn}
                onClick={() => { st.duplicateSlide(slideIdx); setCurrentSlide(slideIdx + 1); }}>
                {t.deck.duplicateSlide}
              </button>
              {doc.slides.length > 1 && (
                <button type="button" className={styles.deleteSlideBtn}
                  onClick={() => handleRemoveSlide(slideIdx)}>× {t.deck.removeSlide}</button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Print-only container */}
      <div className={styles.printOnly}>
        {doc.slides.map((sl, i) => (
          <div key={i} className={styles.printPage}>
            <div className={styles.printSlide}>
              <div className={styles.printSlideInner}
                style={{ width: SLIDE_W, height: SLIDE_H, transform: "scale(var(--print-scale, 1))" }}>
                <SlideView slide={sl} theme={selectedTheme} doc={doc} interactive={false} />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

// ─── Helpers for the formatting panel ────────────────────────

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: 12 }}>
      <span style={{ display: "block", fontSize: 11, fontWeight: 700, marginBottom: 6, color: "#374151" }}>{label}</span>
      {children}
    </label>
  );
}

const FONT_OPTIONS: { id: string; label: string; css: string }[] = [
  { id: "",                                  label: "ברירת מחדל / Theme default", css: "" },
  { id: "Georgia, 'David Libre', serif",     label: "Georgia / David",             css: "Georgia, 'David Libre', serif" },
  { id: "'Frank Ruhl Libre', Georgia, serif",label: "Frank Ruhl Libre",            css: "'Frank Ruhl Libre', Georgia, serif" },
  { id: "'David Libre', Georgia, serif",     label: "David Libre",                 css: "'David Libre', Georgia, serif" },
  { id: "'Heebo', Arial, sans-serif",        label: "Heebo",                       css: "'Heebo', Arial, sans-serif" },
  { id: "'Helvetica Neue', Arial, sans-serif", label: "Helvetica / Modern",        css: "'Helvetica Neue', Arial, sans-serif" },
  { id: "Arial, sans-serif",                 label: "Arial",                       css: "Arial, sans-serif" },
  { id: "'Times New Roman', serif",          label: "Times New Roman",             css: "'Times New Roman', serif" },
];

function FontSelect({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)}
      style={{ width: "100%", padding: "5px 8px", fontSize: 12, border: "1px solid #d1d5db", borderRadius: 4, background: "white" }}>
      {FONT_OPTIONS.map((o) => (
        <option key={o.id} value={o.id} style={{ fontFamily: o.css || undefined }}>{o.label}</option>
      ))}
    </select>
  );
}
