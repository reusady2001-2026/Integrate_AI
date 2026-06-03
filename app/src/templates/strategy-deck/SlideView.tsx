"use client";

import { type CSSProperties } from "react";
import { Editable } from "@/components/Editable";
import { useAppStore } from "@/lib/app-store";
import { strings } from "@/lib/i18n";
import type { Slide } from "@/lib/schemas/strategy-deck";
import type { DeckTheme } from "@/lib/themes/deck-themes";

interface SlideViewProps {
  slide: Slide;
  theme: DeckTheme;
  company?: string;
  date?: string;
  interactive?: boolean;
  onChange?: (patch: Partial<Slide>) => void;
  onBulletChange?: (bi: number, v: string) => void;
  onAddBullet?: () => void;
  onRemoveBullet?: (bi: number) => void;
}

const SLIDE_W = 960;
const SLIDE_H = 540;

export function SlideView({
  slide, theme, company, date,
  interactive = false,
  onChange, onBulletChange, onAddBullet, onRemoveBullet,
}: SlideViewProps) {
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang];
  const isRtl = t.dir === "rtl";
  const { css } = theme;

  const isCoverOrSection = slide.layout === "cover" || slide.layout === "section";
  const bg = isCoverOrSection ? css.coverBg : css.bg;
  const textColor = isCoverOrSection ? css.coverText : css.body;
  const titleColor = isCoverOrSection ? css.coverText : css.title;

  const base: CSSProperties = {
    width: SLIDE_W,
    height: SLIDE_H,
    background: bg,
    color: textColor,
    fontFamily: "David, 'Noto Serif Hebrew', Calibri, Arial, sans-serif",
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    userSelect: interactive ? "auto" : "none",
    pointerEvents: interactive ? "auto" : "none",
    direction: t.dir,
  };

  // Shared editable style hint
  const editStyle: CSSProperties = interactive
    ? { outline: "1px dashed transparent", borderRadius: 2, padding: "0 2px", transition: "outline-color 0.15s", cursor: "text" }
    : {};

  function EditText({
    value, onCh, placeholder, multiline, fontSize, style,
  }: {
    value: string;
    onCh: (v: string) => void;
    placeholder?: string;
    multiline?: boolean;
    fontSize?: number;
    style?: CSSProperties;
  }) {
    if (!interactive) {
      return (
        <span style={{ ...style, fontSize, display: multiline ? "block" : "inline", whiteSpace: multiline ? "pre-wrap" : "normal" }}>
          {value || ""}
        </span>
      );
    }
    return (
      <Editable
        value={value}
        onChange={onCh}
        placeholder={placeholder}
        block={multiline}
        style={{
          fontSize,
          display: multiline ? "block" : "inline",
          ...editStyle,
          ...style,
        }}
      />
    );
  }

  // ──────────────────────────── COVER ─────────────────────────────
  if (slide.layout === "cover") {
    return (
      <div style={base}>
        {/* Accent bar */}
        <div style={{
          position: "absolute", top: 0, bottom: 0,
          [isRtl ? "right" : "left"]: 0,
          width: 10, background: css.accent,
        }} />
        {/* Company */}
        <div style={{
          position: "absolute", top: 36,
          [isRtl ? "right" : "left"]: isRtl ? 48 : 36,
          fontSize: 16, color: css.coverText, opacity: 0.65,
          letterSpacing: "0.04em",
        }}>
          {company}
        </div>
        {/* Main title + subtitle - vertically centered */}
        <div style={{
          position: "absolute",
          top: "50%", transform: "translateY(-55%)",
          [isRtl ? "right" : "left"]: isRtl ? 48 : 36,
          [isRtl ? "left" : "right"]: 48,
        }}>
          <div style={{ fontSize: 52, fontWeight: 700, color: titleColor, lineHeight: 1.15, marginBottom: 20 }}>
            <EditText
              value={slide.title} onCh={(v) => onChange?.({ title: v })}
              placeholder={t.deck.coverTitle} multiline
              style={{ color: titleColor, minHeight: "1.3em", wordBreak: "break-word" }}
            />
          </div>
          <div style={{ fontSize: 26, color: titleColor, opacity: 0.82, lineHeight: 1.4 }}>
            <EditText
              value={slide.subtitle} onCh={(v) => onChange?.({ subtitle: v })}
              placeholder={t.deck.coverSubtitle}
              style={{ color: "inherit" }}
            />
          </div>
        </div>
        {/* Headline target + date */}
        <div style={{
          position: "absolute", bottom: 32,
          [isRtl ? "right" : "left"]: isRtl ? 48 : 36,
          [isRtl ? "left" : "right"]: 48,
          fontSize: 14, color: css.coverText, opacity: 0.55,
        }}>
          {date}
        </div>
      </div>
    );
  }

  // ──────────────────────────── SECTION ───────────────────────────
  if (slide.layout === "section") {
    return (
      <div style={base}>
        {/* Top accent line */}
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: css.accent }} />
        {/* Centered content */}
        <div style={{
          position: "absolute",
          top: "50%", left: "10%", right: "10%",
          transform: "translateY(-50%)",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 48, fontWeight: 700, color: titleColor, lineHeight: 1.2, marginBottom: 20 }}>
            <EditText
              value={slide.title} onCh={(v) => onChange?.({ title: v })}
              placeholder={t.deck.sectionTitle} multiline
              style={{ color: titleColor, textAlign: "center" }}
            />
          </div>
          {(slide.subtitle || interactive) && (
            <div style={{ fontSize: 22, color: titleColor, opacity: 0.75, lineHeight: 1.5 }}>
              <EditText
                value={slide.subtitle} onCh={(v) => onChange?.({ subtitle: v })}
                placeholder={t.deck.coverSubtitle}
                style={{ color: "inherit", textAlign: "center" }}
              />
            </div>
          )}
        </div>
      </div>
    );
  }

  // ──────────────────────────── QUOTE ─────────────────────────────
  if (slide.layout === "quote") {
    return (
      <div style={base}>
        {/* Decorative quote mark */}
        <div style={{
          position: "absolute",
          [isRtl ? "right" : "left"]: 60,
          top: 40,
          fontSize: 200, lineHeight: 1,
          color: css.accent, opacity: 0.15,
          fontFamily: "Georgia, serif",
          userSelect: "none",
        }}>
          {isRtl ? "״" : "\""}
        </div>
        {/* Quote text */}
        <div style={{
          position: "absolute",
          top: "42%", transform: "translateY(-50%)",
          left: "8%", right: "8%",
          textAlign: "center",
        }}>
          <div style={{ fontSize: 30, fontStyle: "italic", color: titleColor, lineHeight: 1.6, marginBottom: 28 }}>
            <EditText
              value={slide.title} onCh={(v) => onChange?.({ title: v })}
              placeholder={t.deck.quoteText} multiline
              style={{ color: titleColor, fontStyle: "italic", textAlign: "center" }}
            />
          </div>
          {(slide.subtitle || interactive) && (
            <div style={{
              fontSize: 18, color: textColor, opacity: 0.7,
              textAlign: isRtl ? "left" : "right",
            }}>
              — <EditText
                value={slide.subtitle} onCh={(v) => onChange?.({ subtitle: v })}
                placeholder={t.deck.quoteAttribution}
                style={{ color: "inherit" }}
              />
            </div>
          )}
        </div>
        {/* Bottom accent */}
        <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 4, background: css.accent }} />
      </div>
    );
  }

  // ──────────────────────────── CONTENT (default) ─────────────────
  return (
    <div style={base}>
      {/* Top accent line */}
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 4, background: css.accent }} />
      {/* Title */}
      <div style={{
        position: "absolute",
        top: 36,
        [isRtl ? "right" : "left"]: 56,
        [isRtl ? "left" : "right"]: 56,
        fontSize: 32, fontWeight: 700, color: titleColor, lineHeight: 1.2,
        paddingBottom: 12,
        borderBottom: `1px solid ${css.accent}`,
      }}>
        <EditText
          value={slide.title} onCh={(v) => onChange?.({ title: v })}
          placeholder={t.deck.slideTitle}
          style={{ color: titleColor, display: "block" }}
        />
      </div>
      {/* Bullets */}
      <div style={{
        position: "absolute",
        top: 128,
        [isRtl ? "right" : "left"]: 56,
        [isRtl ? "left" : "right"]: 56,
        bottom: interactive ? 68 : 36,
        overflow: "hidden",
      }}>
        {slide.bullets.map((b, bi) => (
          <div
            key={bi}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              marginBottom: 14,
              flexDirection: isRtl ? "row-reverse" : "row",
            }}
          >
            <span style={{
              width: 8, height: 8,
              borderRadius: "50%",
              background: css.accent,
              flexShrink: 0,
              marginTop: "0.45em",
            }} />
            <div style={{ flex: 1, fontSize: 20, lineHeight: 1.55, color: textColor }}>
              {interactive ? (
                <Editable
                  value={b}
                  onChange={(v) => onBulletChange?.(bi, v)}
                  placeholder={t.deck.bullets}
                  style={{ display: "block", color: "inherit", ...editStyle }}
                />
              ) : (
                <span>{b}</span>
              )}
            </div>
            {interactive && slide.bullets.length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveBullet?.(bi)}
                style={{
                  flexShrink: 0,
                  background: "none",
                  border: "none",
                  color: css.subtle,
                  cursor: "pointer",
                  fontSize: 14,
                  opacity: 0.5,
                  padding: "0 4px",
                  marginTop: "0.2em",
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        {interactive && (
          <button
            type="button"
            onClick={onAddBullet}
            style={{
              background: "none",
              border: `1px dashed ${css.subtle}`,
              borderRadius: 4,
              color: css.subtle,
              cursor: "pointer",
              fontSize: 14,
              padding: "4px 12px",
              marginTop: 4,
            }}
          >
            + {t.deck.addBullet}
          </button>
        )}
      </div>
    </div>
  );
}
