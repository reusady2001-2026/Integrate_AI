"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { useAppStore, type Artifact } from "@/lib/app-store";
import { useStrategyDeckStore } from "@/lib/strategy-deck-store";
import { strings } from "@/lib/i18n";
import type { Lang } from "@/lib/i18n";
import { DECK_THEMES } from "@/lib/themes/deck-themes";
import type { SlideLayout } from "@/lib/schemas/strategy-deck";
import { SlideView } from "./SlideView";
import styles from "./DeckEditor.module.css";

const SLIDE_W = 960;
const SLIDE_H = 540;
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
  const canvasRef = useRef<HTMLDivElement>(null);

  const lang = useAppStore((s) => s.lang);
  const setLang = useAppStore((s) => s.setLang);
  const artifact = useAppStore((s) => s.artifact);
  const openArtifact = useAppStore((s) => s.openArtifact);
  const goHome = useAppStore((s) => s.goHome);
  const t = strings[lang];

  const st = useStrategyDeckStore();
  const doc = useStrategyDeckStore((s) => s.doc);

  const selectedTheme = DECK_THEMES.find((th) => th.id === doc.theme) ?? DECK_THEMES[0];
  const slide = doc.slides[Math.min(currentSlide, doc.slides.length - 1)] ?? doc.slides[0];
  const slideIdx = Math.min(currentSlide, doc.slides.length - 1);

  // Clamp current slide when slides are removed
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
    setCurrentSlide(doc.slides.length); // new slide will be at current length (before add)
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
      {/* ─── Main Editor UI ─── */}
      <div className={styles.root}>
        {/* Header */}
        <header className={styles.header}>
          <div className={styles.headerLeft}>
            <button
              type="button"
              onClick={goHome}
              className="text-xs px-2 py-1 rounded hover:bg-neutral-100 text-[color:var(--app-muted)]"
            >
              ← {t.home.title}
            </button>
            <span className={styles.divider}>|</span>
            <select
              value={artifact}
              onChange={(e) => openArtifact(e.target.value as Artifact)}
              className="font-display text-base bg-transparent border-0 outline-none cursor-pointer hover:opacity-70"
              aria-label="artifact"
            >
              {ARTIFACTS_FOR_DROPDOWN.map((a) => (
                <option key={a} value={a}>{t.artifacts[a].title}</option>
              ))}
            </select>
            <span className={styles.divider}>|</span>
            <button type="button" onClick={st.loadSample} className="btn-secondary text-xs px-2 py-1 rounded hover:bg-neutral-100">
              {t.loadSample}
            </button>
            <button type="button" onClick={st.reset} className="btn-secondary text-xs px-2 py-1 rounded hover:bg-neutral-100">
              {t.reset}
            </button>
          </div>

          <div className={styles.headerRight}>
            <label className="flex items-center gap-2 text-xs text-[color:var(--app-muted)]">
              <span>{t.deck.themePicker}</span>
              <select
                value={doc.theme}
                onChange={(e) => st.setTheme(e.target.value)}
                className="text-xs bg-white border border-[color:var(--app-border)] rounded px-2 py-1"
              >
                {DECK_THEMES.map((th) => (
                  <option key={th.id} value={th.id}>
                    {lang === "he" ? th.name_he : th.name_en}
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              onClick={() => switchLang(lang === "he" ? "en" : "he")}
              disabled={translating}
              className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50 disabled:opacity-50"
            >
              {translating ? t.translating : t.langToggle}
            </button>
            <button
              type="button"
              onClick={handleExportPptx}
              className="text-xs px-3 py-1.5 rounded bg-[color:var(--app-accent)] text-white"
            >
              {t.deck.exportPptx}
            </button>
            <button
              type="button"
              onClick={handleExportPdf}
              className="text-xs px-3 py-1.5 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
            >
              {t.deck.exportPdf}
            </button>
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
                  <div
                    className={styles.thumbInner}
                    style={{ transform: `scale(${THUMB_SCALE})`, width: SLIDE_W, height: SLIDE_H }}
                  >
                    <SlideView
                      slide={sl}
                      theme={selectedTheme}
                      company={doc.company}
                      date={doc.date}
                      interactive={false}
                    />
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
            {/* Main slide canvas */}
            <div ref={canvasRef} className={styles.canvasOuter}>
              <div
                className={styles.canvasInner}
                style={{ transform: `scale(${canvasScale})`, width: SLIDE_W, height: SLIDE_H }}
              >
                <SlideView
                  slide={slide}
                  theme={selectedTheme}
                  company={doc.company}
                  date={doc.date}
                  interactive
                  onChange={(patch) => st.setSlide(slideIdx, patch)}
                  onBulletChange={(bi, v) => st.setBullet(slideIdx, bi, v)}
                  onAddBullet={() => st.addBullet(slideIdx)}
                  onRemoveBullet={(bi) => st.removeBullet(slideIdx, bi)}
                />
              </div>
            </div>

            {/* Controls bar */}
            <div className={styles.controls} dir={t.dir}>
              {/* Nav */}
              <button
                type="button"
                className={styles.navBtn}
                disabled={slideIdx === 0}
                onClick={() => setCurrentSlide(slideIdx - 1)}
              >
                {t.dir === "rtl" ? "→" : "←"}
              </button>
              <span className={styles.slideCounter}>
                {t.deck.slideCounter(slideIdx + 1, doc.slides.length)}
              </span>
              <button
                type="button"
                className={styles.navBtn}
                disabled={slideIdx === doc.slides.length - 1}
                onClick={() => setCurrentSlide(slideIdx + 1)}
              >
                {t.dir === "rtl" ? "←" : "→"}
              </button>

              <div className={styles.controlsDivider} />

              {/* Layout picker */}
              {LAYOUTS.map((layout) => {
                const label = {
                  cover: t.deck.layoutCover,
                  content: t.deck.layoutContent,
                  section: t.deck.layoutSection,
                  quote: t.deck.layoutQuote,
                }[layout];
                return (
                  <button
                    key={layout}
                    type="button"
                    className={`${styles.layoutBtn} ${slide.layout === layout ? styles.layoutBtnActive : ""}`}
                    onClick={() => st.setSlide(slideIdx, { layout })}
                  >
                    {label}
                  </button>
                );
              })}

              <div className={styles.controlsDivider} />

              {/* Delete slide */}
              {doc.slides.length > 1 && (
                <button
                  type="button"
                  className={styles.deleteSlideBtn}
                  onClick={() => handleRemoveSlide(slideIdx)}
                >
                  × {t.deck.removeSlide}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ─── Print-only container (all slides) ─── */}
      <div className={styles.printOnly}>
        {doc.slides.map((sl, i) => (
          <div key={i} className={styles.printPage}>
            <div className={styles.printSlide}>
              <div
                className={styles.printSlideInner}
                style={{
                  width: SLIDE_W,
                  height: SLIDE_H,
                  transform: "scale(var(--print-scale, 1))",
                }}
              >
                <SlideView
                  slide={sl}
                  theme={selectedTheme}
                  company={doc.company}
                  date={doc.date}
                  interactive={false}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}
