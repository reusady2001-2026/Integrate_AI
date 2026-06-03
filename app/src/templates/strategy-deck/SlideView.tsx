"use client";

import { type CSSProperties, type ReactNode } from "react";
import { Editable } from "@/components/Editable";
import { useAppStore } from "@/lib/app-store";
import { strings } from "@/lib/i18n";
import type { Slide, StrategyDeck } from "@/lib/schemas/strategy-deck";
import {
  type DeckTheme,
  type Palette,
  type FontPair,
  getPalette,
  getFont,
} from "@/lib/themes/deck-themes";

// 16:9 reference resolution. SlideView always renders at this exact size,
// the caller scales it via CSS transform.
export const SLIDE_W = 960;
export const SLIDE_H = 540;

// Effective theme — applies per-deck formatting overrides on top of theme defaults.
type Effective = {
  palette: Palette;
  font: FontPair;
  titleScale: number;
  bodyScale: number;
  accent: string;
};

export function resolveTheme(theme: DeckTheme, doc: StrategyDeck): Effective {
  const paletteId = (doc.paletteOverride || theme.palette) as Parameters<typeof getPalette>[0];
  const palette = getPalette(paletteId);
  const baseFont = getFont(theme.font);
  const fmt = doc.formatting;
  const font: FontPair = {
    ...baseFont,
    display: fmt.titleFont || baseFont.display,
    body: fmt.bodyFont || baseFont.body,
  };
  return {
    palette: { ...palette, accent: fmt.accentColor || palette.accent },
    font,
    titleScale: (theme.titleScale ?? 1) * (fmt.titleScale ?? 1),
    bodyScale: (theme.bodyScale ?? 1) * (fmt.bodyScale ?? 1),
    accent: fmt.accentColor || palette.accent,
  };
}

interface SlideViewProps {
  slide: Slide;
  theme: DeckTheme;
  doc: StrategyDeck;
  interactive?: boolean;
  onChange?: (patch: Partial<Slide>) => void;
  onBulletChange?: (bi: number, v: string) => void;
  onAddBullet?: () => void;
  onRemoveBullet?: (bi: number) => void;
}

export function SlideView(props: SlideViewProps) {
  const { slide, theme, doc, interactive = false } = props;
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang];
  const isRtl = t.dir === "rtl";
  const eff = resolveTheme(theme, doc);
  const isCoverOrSection = slide.layout === "cover" || slide.layout === "section";
  const text = isCoverOrSection ? eff.palette.coverText : eff.palette.text;

  const containerStyle: CSSProperties = {
    width: SLIDE_W,
    height: SLIDE_H,
    background: isCoverOrSection
      ? `${eff.palette.coverGradient}, ${eff.palette.coverBg}`
      : `${eff.palette.bgGradient}, ${eff.palette.bg}`,
    backgroundColor: isCoverOrSection ? eff.palette.coverBg : eff.palette.bg,
    color: text,
    fontFamily: eff.font.body,
    position: "relative",
    overflow: "hidden",
    boxSizing: "border-box",
    userSelect: interactive ? "auto" : "none",
    pointerEvents: interactive ? "auto" : "none",
    direction: t.dir,
    letterSpacing: eff.font.letterSpacing,
  };

  const ctx: RenderCtx = {
    slide,
    theme,
    eff,
    interactive,
    isRtl,
    lang,
    t: t.deck,
    company: doc.company,
    date: doc.date,
    handlers: {
      onChange: props.onChange,
      onBulletChange: props.onBulletChange,
      onAddBullet: props.onAddBullet,
      onRemoveBullet: props.onRemoveBullet,
    },
  };

  return (
    <div style={containerStyle}>
      {isCoverOrSection && <CoverDepth ctx={ctx} />}
      {!isCoverOrSection && <ContentDepth ctx={ctx} />}
      {slide.layout === "cover" && renderCover(ctx)}
      {slide.layout === "section" && renderSection(ctx)}
      {slide.layout === "quote" && renderQuote(ctx)}
      {slide.layout === "content" && renderContent(ctx)}
    </div>
  );
}

// ─────────────────────── Depth / decoration layers ───────────────────────

// Soft layered orbs + glow behind cover content. Renders behind everything.
function CoverDepth({ ctx }: { ctx: RenderCtx }) {
  const { eff, isRtl } = ctx;
  const isDark = eff.palette.dark;
  // Two soft orbs (opposite corners) + a wide diagonal sheen
  return (
    <>
      <div style={{
        position: "absolute",
        [isRtl ? "left" : "right"]: -160, top: -160,
        width: 540, height: 540, borderRadius: "50%",
        background: `radial-gradient(circle, ${eff.palette.glow} 0%, transparent 65%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute",
        [isRtl ? "right" : "left"]: -120, bottom: -180,
        width: 460, height: 460, borderRadius: "50%",
        background: `radial-gradient(circle, ${eff.accent}${isDark ? "33" : "1c"} 0%, transparent 70%)`,
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: 0,
        background: isDark
          ? "linear-gradient(135deg, rgba(255,255,255,0.04) 0%, transparent 40%, rgba(0,0,0,0.18) 100%)"
          : "linear-gradient(135deg, rgba(255,255,255,0.06) 0%, transparent 40%, rgba(0,0,0,0.10) 100%)",
        pointerEvents: "none",
      }} />
    </>
  );
}

// Subtle soft accent blob in a corner of content slides (for depth).
function ContentDepth({ ctx }: { ctx: RenderCtx }) {
  const { eff, isRtl } = ctx;
  return (
    <div style={{
      position: "absolute",
      [isRtl ? "left" : "right"]: -200, bottom: -200,
      width: 480, height: 480, borderRadius: "50%",
      background: `radial-gradient(circle, ${eff.palette.glow} 0%, transparent 65%)`,
      pointerEvents: "none",
      opacity: 0.7,
    }} />
  );
}

// Gradient accent bar. Use anywhere a flat eff.accent bar was used for decoration.
function GradientBar({ ctx, style }: { ctx: RenderCtx; style: CSSProperties }) {
  return (
    <div style={{
      ...style,
      background: ctx.eff.palette.accentGradient,
    }} />
  );
}

// A rounded glowing dot — used as default bullet marker for richer look.
function GlowDot({ ctx, size = 9 }: { ctx: RenderCtx; size?: number }) {
  return (
    <span style={{
      width: size, height: size, borderRadius: "50%",
      background: ctx.eff.palette.accentGradient,
      boxShadow: `0 0 0 3px ${ctx.eff.palette.glow}`,
      display: "block",
    }} />
  );
}

// ─────────────────────── Render context ───────────────────────

type RenderCtx = {
  slide: Slide;
  theme: DeckTheme;
  eff: Effective;
  interactive: boolean;
  isRtl: boolean;
  lang: "he" | "en";
  t: typeof strings.he.deck;
  company: string;
  date: string;
  handlers: {
    onChange?: (patch: Partial<Slide>) => void;
    onBulletChange?: (bi: number, v: string) => void;
    onAddBullet?: () => void;
    onRemoveBullet?: (bi: number) => void;
  };
};

// ─────────────────────── Editable text helper ───────────────────────

function Text({
  value, ctx, onCh, placeholder, multiline, fontSize, style, fontFamily, weight,
}: {
  value: string;
  ctx: RenderCtx;
  onCh?: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  fontSize?: number;
  fontFamily?: string;
  weight?: number;
  style?: CSSProperties;
}) {
  const baseStyle: CSSProperties = {
    fontFamily,
    fontSize,
    fontWeight: weight,
    display: multiline ? "block" : "inline",
    whiteSpace: multiline ? "pre-wrap" : "normal",
    ...style,
  };
  if (!ctx.interactive || !onCh) {
    return <span style={baseStyle}>{value || ""}</span>;
  }
  return (
    <Editable
      value={value}
      onChange={onCh}
      placeholder={placeholder}
      block={multiline}
      style={baseStyle}
    />
  );
}

// ─────────────────────── COVER renderers ───────────────────────

function renderCover(ctx: RenderCtx): ReactNode {
  const { theme } = ctx;
  switch (theme.cover) {
    case "left-bar-strong":   return CoverLeftBar(ctx);
    case "centered-bold":     return CoverCentered(ctx);
    case "split-half":        return CoverSplit(ctx);
    case "framed-thin":       return CoverFramed(ctx);
    case "gradient-diagonal": return CoverGradient(ctx);
    case "minimal-bottom":    return CoverMinimalBottom(ctx);
    case "big-number-corner": return CoverBigNumber(ctx);
    case "circle-accent":     return CoverCircle(ctx);
    case "stripes-side":      return CoverStripes(ctx);
    case "horizon-line":      return CoverHorizon(ctx);
    case "duotone-block":     return CoverDuotone(ctx);
    case "outlined-title":    return CoverOutlined(ctx);
    case "card-center":       return CoverCard(ctx);
    case "label-strip":       return CoverLabel(ctx);
    case "geometric-corner":  return CoverGeometric(ctx);
    case "underline-title":   return CoverUnderline(ctx);
    default:                  return CoverLeftBar(ctx);
  }
}

function CoverTitleBlock(ctx: RenderCtx, style?: CSSProperties) {
  return (
    <>
      <Text
        value={ctx.slide.title}
        ctx={ctx}
        onCh={(v) => ctx.handlers.onChange?.({ title: v })}
        placeholder={ctx.t.coverTitle}
        multiline
        fontFamily={ctx.eff.font.display}
        fontSize={56 * ctx.eff.titleScale}
        weight={ctx.eff.font.titleWeight ?? 700}
        style={{ color: ctx.eff.palette.coverText, lineHeight: 1.12, marginBottom: 20, ...style }}
      />
      <Text
        value={ctx.slide.subtitle}
        ctx={ctx}
        onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })}
        placeholder={ctx.t.coverSubtitle}
        fontFamily={ctx.eff.font.body}
        fontSize={24 * ctx.eff.bodyScale}
        style={{ color: ctx.eff.palette.coverText, opacity: 0.82, lineHeight: 1.4 }}
      />
    </>
  );
}

function CoverLeftBar(ctx: RenderCtx) {
  const { isRtl, eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: 14, background: eff.palette.accentGradient, boxShadow: `0 0 24px ${eff.palette.glow}` }} />
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-55%)", insetInlineStart: 64, insetInlineEnd: 48 }}>
        {CoverTitleBlock(ctx)}
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverCentered(ctx: RenderCtx) {
  return (
    <>
      <CoverMeta ctx={ctx} position="top-center" />
      <div style={{ position: "absolute", top: "50%", left: "8%", right: "8%", transform: "translateY(-55%)", textAlign: "center" }}>
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.coverTitle}
          multiline fontFamily={ctx.eff.font.display} fontSize={64 * ctx.eff.titleScale}
          weight={ctx.eff.font.titleWeight ?? 800}
          style={{ color: ctx.eff.palette.coverText, lineHeight: 1.1, marginBottom: 24, textAlign: "center" }}
        />
        <div style={{ width: 80, height: 3, background: ctx.eff.palette.accentGradient, margin: "0 auto 24px", borderRadius: 2 }} />
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={22 * ctx.eff.bodyScale}
          style={{ color: ctx.eff.palette.coverText, opacity: 0.82, textAlign: "center" }}
        />
      </div>
      <CoverMeta ctx={ctx} position="bottom-center" />
    </>
  );
}

function CoverSplit(ctx: RenderCtx) {
  const { isRtl, eff } = ctx;
  return (
    <>
      {/* colored half */}
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: "44%", background: eff.palette.accentGradient, boxShadow: `inset 0 0 80px ${eff.palette.glow}` }} />
      {/* title in colored half */}
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "right" : "left"]: 48, width: "36%" }}>
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.coverTitle}
          multiline fontFamily={ctx.eff.font.display} fontSize={48 * ctx.eff.titleScale}
          weight={ctx.eff.font.titleWeight ?? 700}
          style={{ color: "#fff", lineHeight: 1.1, marginBottom: 16 }}
        />
      </div>
      {/* subtitle in non-colored half */}
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", [isRtl ? "left" : "right"]: 48, width: "44%" }}>
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={22 * ctx.eff.bodyScale}
          style={{ color: eff.palette.coverText, opacity: 0.92, lineHeight: 1.55 }}
        />
        {ctx.company && (
          <div style={{ marginTop: 24, fontSize: 12, opacity: 0.55, letterSpacing: "0.06em", color: eff.palette.coverText }}>{ctx.company}</div>
        )}
      </div>
    </>
  );
}

function CoverFramed(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", inset: 24, border: `2px solid transparent`, borderImage: `${eff.palette.accentGradient} 1`, boxShadow: `inset 0 0 80px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: 56, [ctx.isRtl ? "right" : "left"]: 64, fontSize: 13, color: eff.palette.coverText, opacity: 0.6, letterSpacing: "0.1em", textTransform: "uppercase" }}>
        {ctx.company}
      </div>
      <div style={{ position: "absolute", top: "50%", left: "10%", right: "10%", transform: "translateY(-50%)", textAlign: "center" }}>
        {CoverTitleBlock(ctx, { textAlign: "center" })}
      </div>
      <div style={{ position: "absolute", bottom: 56, [ctx.isRtl ? "right" : "left"]: 64, fontSize: 12, color: eff.palette.coverText, opacity: 0.5 }}>{ctx.date}</div>
    </>
  );
}

function CoverGradient(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{
        position: "absolute", inset: 0,
        background: `linear-gradient(135deg, ${eff.palette.coverBg} 0%, ${eff.accent} 200%)`,
      }} />
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-55%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        {CoverTitleBlock(ctx)}
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverMinimalBottom(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{ position: "absolute", bottom: 90, [isRtl ? "right" : "left"]: 64, [isRtl ? "left" : "right"]: 64 }}>
        <div style={{ width: 56, height: 3, background: eff.palette.accentGradient, marginBottom: 24, borderRadius: 2 }} />
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.coverTitle}
          multiline fontFamily={ctx.eff.font.display} fontSize={44 * ctx.eff.titleScale}
          weight={ctx.eff.font.titleWeight ?? 700}
          style={{ color: eff.palette.coverText, lineHeight: 1.15, marginBottom: 16 }}
        />
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={18 * ctx.eff.bodyScale}
          style={{ color: eff.palette.coverText, opacity: 0.7 }}
        />
      </div>
      <CoverMeta ctx={ctx} position="top" />
    </>
  );
}

function CoverBigNumber(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  // Pull a year-like token from horizon/date
  const year = (ctx.slide.subtitle.match(/\d{4}/) ?? ["2030"])[0];
  return (
    <>
      <div style={{
        position: "absolute",
        [isRtl ? "left" : "right"]: -40,
        bottom: -100,
        fontSize: 460,
        fontWeight: 900,
        fontFamily: eff.font.display,
        color: eff.accent,
        opacity: 0.18,
        lineHeight: 0.9,
        userSelect: "none",
      }}>
        {year}
      </div>
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        {CoverTitleBlock(ctx)}
      </div>
    </>
  );
}

function CoverCircle(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{
        position: "absolute",
        [isRtl ? "left" : "right"]: -180, top: -180,
        width: 540, height: 540,
        borderRadius: "50%",
        background: `radial-gradient(circle at 30% 30%, ${eff.accent}66 0%, ${eff.accent}22 50%, transparent 75%)`,
      }} />
      <div style={{
        position: "absolute",
        [isRtl ? "left" : "right"]: -80, bottom: -240,
        width: 360, height: 360,
        borderRadius: "50%",
        border: `3px solid ${eff.accent}`,
        opacity: 0.55,
        boxShadow: `0 0 60px ${eff.palette.glow}`,
      }} />
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-55%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        {CoverTitleBlock(ctx)}
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverStripes(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: 8, background: eff.palette.accentGradient, boxShadow: `0 0 24px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 18, width: 3, background: eff.palette.accentGradient, opacity: 0.7 }} />
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 28, width: 1, background: eff.palette.accentGradient, opacity: 0.45 }} />
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-55%)", [isRtl ? "right" : "left"]: 80, insetInlineEnd: 48 }}>
        {CoverTitleBlock(ctx)}
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverHorizon(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", insetInlineStart: 64, insetInlineEnd: 64, top: 100, height: 2, background: eff.palette.accentGradient, opacity: 0.85, borderRadius: 1 }} />
      <div style={{ position: "absolute", insetInlineStart: 64, insetInlineEnd: 64, bottom: 100, height: 1, background: eff.palette.accentGradient, opacity: 0.55 }} />
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        {CoverTitleBlock(ctx)}
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverDuotone(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", background: eff.palette.coverGradient }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "45%", background: eff.palette.accentGradient, boxShadow: `inset 0 60px 80px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: "55%", transform: "translateY(-100%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.coverTitle}
          multiline fontFamily={ctx.eff.font.display} fontSize={52 * ctx.eff.titleScale}
          weight={ctx.eff.font.titleWeight ?? 800}
          style={{ color: eff.palette.coverText, lineHeight: 1.1, marginBottom: 16 }}
        />
      </div>
      <div style={{ position: "absolute", top: "55%", insetInlineStart: 64, insetInlineEnd: 64, paddingTop: 28 }}>
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={22 * ctx.eff.bodyScale}
          style={{ color: "#fff", opacity: 0.95, lineHeight: 1.4 }}
        />
      </div>
    </>
  );
}

function CoverOutlined(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-55%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.coverTitle}
          multiline fontFamily={ctx.eff.font.display} fontSize={70 * ctx.eff.titleScale}
          weight={900}
          style={{
            color: "transparent",
            WebkitTextStroke: `2px ${eff.palette.coverText}`,
            lineHeight: 1.05, marginBottom: 24,
          }}
        />
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={22 * ctx.eff.bodyScale}
          style={{ color: eff.palette.coverText, opacity: 0.85, lineHeight: 1.4 }}
        />
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverCard(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{
        position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
        width: "72%", maxWidth: 680,
        padding: "52px 56px",
        background: eff.palette.bg,
        color: eff.palette.text,
        boxShadow: `0 24px 80px rgba(0,0,0,0.45), 0 0 0 1px ${eff.palette.cardBorder}, 0 0 60px ${eff.palette.glow}`,
        borderRadius: 4,
      }}>
        <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: eff.palette.accentGradient, borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
        <div style={{ fontSize: 12, opacity: 0.55, letterSpacing: "0.1em", marginBottom: 20, textTransform: "uppercase", color: eff.palette.text }}>
          {ctx.company}
        </div>
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.coverTitle}
          multiline fontFamily={ctx.eff.font.display} fontSize={42 * ctx.eff.titleScale}
          weight={ctx.eff.font.titleWeight ?? 700}
          style={{ color: eff.palette.text, lineHeight: 1.15, marginBottom: 16 }}
        />
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={18 * ctx.eff.bodyScale}
          style={{ color: eff.palette.textMuted, lineHeight: 1.5 }}
        />
      </div>
    </>
  );
}

function CoverLabel(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 96, insetInlineStart: 64, insetInlineEnd: 64, height: 34, background: eff.palette.accentGradient, display: "flex", alignItems: "center", paddingInline: 16, fontSize: 13, color: "#fff", letterSpacing: "0.08em", textTransform: "uppercase", boxShadow: `0 4px 24px ${eff.palette.glow}`, borderRadius: 2 }}>
          {ctx.company}
        </div>
      <div style={{ position: "absolute", top: 180, insetInlineStart: 64, insetInlineEnd: 64 }}>
        {CoverTitleBlock(ctx)}
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverGeometric(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <svg width="320" height="320" style={{ position: "absolute", top: -60, [isRtl ? "left" : "right"]: -60, opacity: 0.95, filter: `drop-shadow(0 8px 32px ${eff.palette.glow})` }}>
        <defs>
          <linearGradient id={`grad-cg-${isRtl ? "r" : "l"}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor={eff.accent} stopOpacity="1" />
            <stop offset="100%" stopColor={eff.palette.accent2} stopOpacity="0.7" />
          </linearGradient>
        </defs>
        <polygon points="320,0 320,320 0,320" fill={`url(#grad-cg-${isRtl ? "r" : "l"})`} />
      </svg>
      <svg width="200" height="200" style={{ position: "absolute", bottom: -50, [isRtl ? "right" : "left"]: -50, opacity: 0.45 }}>
        <circle cx="100" cy="100" r="100" fill={eff.accent} />
      </svg>
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-50%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        {CoverTitleBlock(ctx)}
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

function CoverUnderline(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <CoverMeta ctx={ctx} position="top" />
      <div style={{ position: "absolute", top: "50%", transform: "translateY(-55%)", insetInlineStart: 64, insetInlineEnd: 64 }}>
        <span style={{ display: "inline-block", paddingBottom: 14, marginBottom: 24, position: "relative", borderImage: `${eff.palette.accentGradient} 1`, borderBottomWidth: 4, borderBottomStyle: "solid" }}>
          <Text
            value={ctx.slide.title} ctx={ctx}
            onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.coverTitle}
            multiline fontFamily={ctx.eff.font.display} fontSize={56 * ctx.eff.titleScale}
            weight={ctx.eff.font.titleWeight ?? 700}
            style={{ color: eff.palette.coverText, lineHeight: 1.1 }}
          />
        </span>
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={22 * ctx.eff.bodyScale}
          style={{ color: eff.palette.coverText, opacity: 0.82, lineHeight: 1.4 }}
        />
      </div>
      <CoverMeta ctx={ctx} position="bottom" />
    </>
  );
}

// Cover meta (company top, date bottom) — used by multiple cover layouts
function CoverMeta({ ctx, position }: { ctx: RenderCtx; position: "top" | "bottom" | "top-center" | "bottom-center" }) {
  const { eff, isRtl } = ctx;
  const align = position.endsWith("center") ? "center" : (isRtl ? "right" : "left");
  if (position.startsWith("top")) {
    return (
      <div style={{
        position: "absolute", top: 40,
        insetInlineStart: 64, insetInlineEnd: 64,
        fontSize: 13, color: eff.palette.coverText, opacity: 0.55,
        letterSpacing: "0.06em",
        textAlign: align as "left" | "right" | "center",
      }}>
        {ctx.company}
      </div>
    );
  }
  return (
    <div style={{
      position: "absolute", bottom: 36,
      insetInlineStart: 64, insetInlineEnd: 64,
      fontSize: 13, color: eff.palette.coverText, opacity: 0.5,
      textAlign: align as "left" | "right" | "center",
    }}>
      {ctx.date}
    </div>
  );
}

// ─────────────────────── SECTION ───────────────────────

function renderSection(ctx: RenderCtx) {
  const { eff } = ctx;
  // Section uses centered cover-like layout with strong accent
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 6, background: eff.palette.accentGradient, boxShadow: `0 6px 24px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 6, background: eff.palette.accentGradient, boxShadow: `0 -6px 24px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: "50%", left: "10%", right: "10%", transform: "translateY(-50%)", textAlign: "center" }}>
        <div style={{ fontSize: 14, color: eff.accent, letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 28 }}>
          {ctx.company}
        </div>
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.sectionTitle}
          multiline fontFamily={ctx.eff.font.display} fontSize={56 * ctx.eff.titleScale}
          weight={ctx.eff.font.titleWeight ?? 700}
          style={{ color: eff.palette.coverText, lineHeight: 1.15, marginBottom: 20, textAlign: "center" }}
        />
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
          fontFamily={ctx.eff.font.body} fontSize={22 * ctx.eff.bodyScale}
          style={{ color: eff.palette.coverText, opacity: 0.78, lineHeight: 1.5, textAlign: "center" }}
        />
      </div>
    </>
  );
}

// ─────────────────────── QUOTE ───────────────────────

function renderQuote(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{
        position: "absolute",
        [isRtl ? "right" : "left"]: 56, top: 36,
        fontSize: 220, lineHeight: 0.85,
        color: eff.accent, opacity: 0.18,
        fontFamily: eff.font.display,
        userSelect: "none",
      }}>
        {isRtl ? "״" : "\""}
      </div>
      <div style={{ position: "absolute", top: "44%", transform: "translateY(-50%)", left: "10%", right: "10%", textAlign: "center" }}>
        <Text
          value={ctx.slide.title} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.quoteText}
          multiline fontFamily={ctx.eff.font.display} fontSize={32 * ctx.eff.titleScale}
          weight={ctx.eff.font.titleWeight ?? 600}
          style={{ color: eff.palette.text, fontStyle: "italic", lineHeight: 1.55, marginBottom: 32, textAlign: "center" }}
        />
        <div style={{ width: 72, height: 3, background: eff.palette.accentGradient, margin: "0 auto 20px", borderRadius: 2 }} />
        <Text
          value={ctx.slide.subtitle} ctx={ctx}
          onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.quoteAttribution}
          fontFamily={ctx.eff.font.body} fontSize={18 * ctx.eff.bodyScale}
          style={{ color: eff.palette.textMuted, textAlign: "center" }}
        />
      </div>
    </>
  );
}

// ─────────────────────── CONTENT renderers ───────────────────────

function renderContent(ctx: RenderCtx) {
  const { theme } = ctx;
  switch (theme.content) {
    case "classic-top":    return ContentClassic(ctx);
    case "side-band":      return ContentSideBand(ctx);
    case "header-block":   return ContentHeaderBlock(ctx);
    case "half-color":     return ContentHalfColor(ctx);
    case "numbered-list":  return ContentNumbered(ctx);
    case "two-column":     return ContentTwoColumn(ctx);
    case "dot-grid":       return ContentDotGrid(ctx);
    case "framed":         return ContentFramed(ctx);
    case "footer-band":    return ContentFooterBand(ctx);
    case "minimal-line":   return ContentMinimalLine(ctx);
    case "magazine":       return ContentMagazine(ctx);
    case "circle-bullets": return ContentCircleBullets(ctx);
    case "stripe-cards":   return ContentStripeCards(ctx);
    case "corner-accent":  return ContentCornerAccent(ctx);
    case "left-rule":      return ContentLeftRule(ctx);
    case "card-stack":     return ContentCardStack(ctx);
    default:               return ContentClassic(ctx);
  }
}

// Renders the slide's title bar; variant-controlled via opts
function TitleBar(ctx: RenderCtx, opts?: {
  fontSize?: number;
  underline?: boolean;
  color?: string;
}) {
  return (
    <Text
      value={ctx.slide.title} ctx={ctx}
      onCh={(v) => ctx.handlers.onChange?.({ title: v })} placeholder={ctx.t.slideTitle}
      fontFamily={ctx.eff.font.display}
      fontSize={(opts?.fontSize ?? 30) * ctx.eff.titleScale}
      weight={ctx.eff.font.titleWeight ?? 700}
      style={{
        color: opts?.color ?? ctx.eff.palette.text,
        lineHeight: 1.2,
        display: "block",
        ...(opts?.underline ? { borderBottom: `2px solid ${ctx.eff.accent}`, paddingBottom: 10 } : {}),
      }}
    />
  );
}

// Renders one bullet line; takes a custom marker render fn
type Marker = (i: number) => ReactNode;
function BulletList(ctx: RenderCtx, marker?: Marker, opts?: {
  fontSize?: number;
  gap?: number;
  itemStyle?: CSSProperties;
}) {
  const { eff } = ctx;
  const fontSize = (opts?.fontSize ?? 19) * ctx.eff.bodyScale;
  const gap = opts?.gap ?? 14;
  return (
    <div>
      {ctx.slide.bullets.map((b, bi) => (
        <div
          key={bi}
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 14,
            marginBottom: gap,
            flexDirection: "row",
            ...opts?.itemStyle,
          }}
        >
          <span style={{ flexShrink: 0, marginTop: marker ? 0 : "0.5em" }}>
            {marker ? marker(bi) : <GlowDot ctx={ctx} />}
          </span>
          <div style={{ flex: 1, fontSize, lineHeight: 1.5, color: eff.palette.text }}>
            {ctx.interactive ? (
              <Editable
                value={b}
                onChange={(v) => ctx.handlers.onBulletChange?.(bi, v)}
                placeholder={ctx.t.bullets}
                style={{ display: "block", color: "inherit", fontFamily: ctx.eff.font.body }}
              />
            ) : (
              <span style={{ fontFamily: ctx.eff.font.body }}>{b}</span>
            )}
          </div>
          {ctx.interactive && ctx.slide.bullets.length > 1 && (
            <button
              type="button"
              onClick={() => ctx.handlers.onRemoveBullet?.(bi)}
              style={{ flexShrink: 0, background: "none", border: "none", color: eff.palette.textMuted, cursor: "pointer", fontSize: 14, opacity: 0.5, padding: "0 4px", marginTop: "0.2em" }}
            >×</button>
          )}
        </div>
      ))}
      {ctx.interactive && (
        <button
          type="button"
          onClick={ctx.handlers.onAddBullet}
          style={{ background: "none", border: `1px dashed ${eff.palette.textMuted}`, borderRadius: 4, color: eff.palette.textMuted, cursor: "pointer", fontSize: 13, padding: "4px 12px", marginTop: 4, fontFamily: ctx.eff.font.body }}
        >
          + {ctx.t.addBullet}
        </button>
      )}
    </div>
  );
}

// Subtitle below title (small caption)
function Subtitle(ctx: RenderCtx, color?: string) {
  if (!ctx.slide.subtitle && !ctx.interactive) return null;
  return (
    <Text
      value={ctx.slide.subtitle} ctx={ctx}
      onCh={(v) => ctx.handlers.onChange?.({ subtitle: v })} placeholder={ctx.t.coverSubtitle}
      fontFamily={ctx.eff.font.body} fontSize={15 * ctx.eff.bodyScale}
      style={{ color: color ?? ctx.eff.palette.textMuted, lineHeight: 1.4, fontStyle: "italic", display: "block", marginTop: 6 }}
    />
  );
}

// ─── content variants ───────────────────────────────────────

function ContentClassic(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: eff.palette.accentGradient, boxShadow: `0 4px 18px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { underline: true })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 140, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36 }}>
        {BulletList(ctx)}
      </div>
    </>
  );
}

function ContentSideBand(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: 86, background: eff.palette.accentGradient, boxShadow: `inset 0 0 60px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: 56, [isRtl ? "right" : "left"]: 120, [isRtl ? "left" : "right"]: 56 }}>
        {TitleBar(ctx, { fontSize: 28 })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 150, [isRtl ? "right" : "left"]: 120, [isRtl ? "left" : "right"]: 56, bottom: 40 }}>
        {BulletList(ctx)}
      </div>
    </>
  );
}

function ContentHeaderBlock(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 130, background: eff.palette.coverGradient, color: eff.palette.coverText, padding: "32px 56px", boxSizing: "border-box", boxShadow: `0 8px 32px ${eff.palette.glow}` }}>
        {TitleBar(ctx, { fontSize: 28, color: eff.palette.coverText })}
        {Subtitle(ctx, eff.palette.coverText + "cc")}
      </div>
      <div style={{ position: "absolute", top: 130, height: 6, left: 0, right: 0, background: eff.palette.accentGradient }} />
      <div style={{ position: "absolute", top: 170, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36 }}>
        {BulletList(ctx)}
      </div>
    </>
  );
}

function ContentHalfColor(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 0, bottom: 0, [isRtl ? "right" : "left"]: 0, width: "38%", background: eff.palette.coverGradient, padding: 40, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", boxShadow: `inset 0 0 80px ${eff.palette.glow}` }}>
        <div style={{ width: 44, height: 3, background: eff.palette.accentGradient, marginBottom: 20, borderRadius: 2 }} />
        {TitleBar(ctx, { fontSize: 28, color: eff.palette.coverText })}
        {Subtitle(ctx, eff.palette.coverText + "cc")}
      </div>
      <div style={{ position: "absolute", top: 40, bottom: 40, [isRtl ? "left" : "right"]: 48, [isRtl ? "right" : "left"]: "44%" }}>
        {BulletList(ctx, undefined, { fontSize: 18 })}
      </div>
    </>
  );
}

function ContentNumbered(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { underline: true })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 140, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36 }}>
        {BulletList(ctx, (i) => (
          <span style={{
            display: "inline-flex",
            width: 34, height: 34,
            borderRadius: "50%",
            background: eff.palette.accentGradient,
            color: "#fff",
            alignItems: "center", justifyContent: "center",
            fontSize: 14, fontWeight: 700,
            fontFamily: eff.font.display,
            boxShadow: `0 4px 14px ${eff.palette.glow}`,
          }}>{i + 1}</span>
        ), { fontSize: 18, gap: 18 })}
      </div>
    </>
  );
}

function ContentTwoColumn(ctx: RenderCtx) {
  const { eff } = ctx;
  const bullets = ctx.slide.bullets;
  const mid = Math.ceil(bullets.length / 2);
  const left = bullets.slice(0, mid);
  const right = bullets.slice(mid);
  return (
    <>
      <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 5, background: eff.palette.accentGradient, boxShadow: `0 4px 18px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { underline: true })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 140, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        <ColumnList ctx={ctx} items={left} startIndex={0} />
        <ColumnList ctx={ctx} items={right} startIndex={mid} />
      </div>
    </>
  );
}

function ColumnList({ ctx, items, startIndex }: { ctx: RenderCtx; items: string[]; startIndex: number }) {
  const { eff } = ctx;
  return (
    <div>
      {items.map((b, j) => {
        const bi = startIndex + j;
        return (
          <div key={bi} style={{ display: "flex", alignItems: "flex-start", gap: 10, marginBottom: 12, flexDirection: "row" }}>
            <span style={{ width: 7, height: 7, borderRadius: "50%", background: eff.palette.accentGradient, boxShadow: `0 0 0 2px ${eff.palette.glow}`, flexShrink: 0, marginTop: "0.55em" }} />
            <div style={{ flex: 1, fontSize: 16 * ctx.eff.bodyScale, lineHeight: 1.5, color: eff.palette.text }}>
              {ctx.interactive ? (
                <Editable
                  value={b}
                  onChange={(v) => ctx.handlers.onBulletChange?.(bi, v)}
                  placeholder={ctx.t.bullets}
                  style={{ display: "block", color: "inherit", fontFamily: eff.font.body }}
                />
              ) : (
                <span style={{ fontFamily: eff.font.body }}>{b}</span>
              )}
            </div>
          </div>
        );
      })}
      {ctx.interactive && startIndex === 0 && (
        <button
          type="button"
          onClick={ctx.handlers.onAddBullet}
          style={{ background: "none", border: `1px dashed ${eff.palette.textMuted}`, borderRadius: 4, color: eff.palette.textMuted, cursor: "pointer", fontSize: 12, padding: "4px 10px", marginTop: 4 }}
        >+ {ctx.t.addBullet}</button>
      )}
    </div>
  );
}

function ContentDotGrid(ctx: RenderCtx) {
  const { eff } = ctx;
  // Subtle dot grid bg using radial gradient pattern
  return (
    <>
      <div style={{
        position: "absolute", inset: 0,
        backgroundImage: `radial-gradient(${eff.palette.textMuted}33 1px, transparent 1px)`,
        backgroundSize: "24px 24px",
      }} />
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { underline: true })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 140, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36 }}>
        {BulletList(ctx, (i) => (
          <span style={{ display: "inline-block", width: 10, height: 10, background: eff.accent, transform: "rotate(45deg)", marginTop: "0.5em" }} />
        ))}
      </div>
    </>
  );
}

function ContentFramed(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", inset: 24, border: `2px solid transparent`, borderImage: `${eff.palette.accentGradient} 1` }} />
      <div style={{ position: "absolute", top: 56, insetInlineStart: 76, insetInlineEnd: 76 }}>
        {TitleBar(ctx, { fontSize: 28 })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 150, insetInlineStart: 76, insetInlineEnd: 76, bottom: 56 }}>
        {BulletList(ctx)}
      </div>
    </>
  );
}

function ContentFooterBand(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { underline: true })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 140, insetInlineStart: 56, insetInlineEnd: 56, bottom: 80 }}>
        {BulletList(ctx)}
      </div>
      <div style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: 60, background: eff.palette.accentGradient, color: "#fff", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 32px", fontSize: 13, letterSpacing: "0.06em", boxShadow: `0 -4px 18px ${eff.palette.glow}` }}>
        <span>{ctx.company}</span>
        <span>{ctx.date}</span>
      </div>
    </>
  );
}

function ContentMinimalLine(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 64, insetInlineStart: 64, insetInlineEnd: 64 }}>
        {TitleBar(ctx, { fontSize: 28 })}
        <div style={{ width: 56, height: 2, background: eff.palette.accentGradient, marginTop: 16, marginBottom: 10, borderRadius: 1 }} />
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 180, insetInlineStart: 64, insetInlineEnd: 64, bottom: 60 }}>
        {BulletList(ctx)}
      </div>
    </>
  );
}

function ContentMagazine(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 56, [isRtl ? "right" : "left"]: 64, width: "32%" }}>
        <div style={{ fontSize: 11, letterSpacing: "0.12em", color: eff.accent, textTransform: "uppercase", marginBottom: 14 }}>
          {ctx.company}
        </div>
        {TitleBar(ctx, { fontSize: 32 })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 56, bottom: 56, [isRtl ? "right" : "left"]: "40%", [isRtl ? "left" : "right"]: 64 }}>
        <div style={{ width: 1, height: "100%", background: eff.palette.textMuted, opacity: 0.3, position: "absolute", [isRtl ? "right" : "left"]: -24, top: 0 }} />
        {BulletList(ctx, undefined, { fontSize: 17, gap: 16 })}
      </div>
    </>
  );
}

function ContentCircleBullets(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { underline: true })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 140, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36 }}>
        {BulletList(ctx, (i) => (
          <span style={{
            display: "inline-flex", width: 28, height: 28, borderRadius: "50%",
            border: `2px solid ${eff.accent}`,
            color: eff.accent, alignItems: "center", justifyContent: "center",
            fontSize: 13, fontWeight: 700, fontFamily: eff.font.display, background: "transparent",
          }}>{i + 1}</span>
        ), { fontSize: 18, gap: 16 })}
      </div>
    </>
  );
}

function ContentStripeCards(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { fontSize: 26 })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 130, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36 }}>
        {ctx.slide.bullets.map((b, bi) => (
          <div key={bi} style={{
            display: "flex",
            alignItems: "stretch",
            marginBottom: 10,
            flexDirection: "row",
            background: eff.palette.cardBg,
            border: `1px solid ${eff.palette.cardBorder}`,
            borderRadius: 6,
            overflow: "hidden",
            boxShadow: `0 2px 12px ${eff.palette.glow}`,
          }}>
            <div style={{ width: 6, background: eff.palette.accentGradient, flexShrink: 0 }} />
            <div style={{ flex: 1, padding: "12px 18px", fontSize: 17 * ctx.eff.bodyScale, lineHeight: 1.5, color: eff.palette.text, fontFamily: eff.font.body }}>
              {ctx.interactive ? (
                <Editable value={b} onChange={(v) => ctx.handlers.onBulletChange?.(bi, v)} placeholder={ctx.t.bullets} style={{ display: "block", color: "inherit", fontFamily: eff.font.body }} />
              ) : (
                <span>{b}</span>
              )}
            </div>
            {ctx.interactive && ctx.slide.bullets.length > 1 && (
              <button type="button" onClick={() => ctx.handlers.onRemoveBullet?.(bi)}
                style={{ background: "none", border: "none", color: eff.palette.textMuted, cursor: "pointer", fontSize: 14, opacity: 0.5, padding: "0 12px" }}>×</button>
            )}
          </div>
        ))}
        {ctx.interactive && (
          <button type="button" onClick={ctx.handlers.onAddBullet}
            style={{ background: "none", border: `1px dashed ${eff.palette.textMuted}`, borderRadius: 4, color: eff.palette.textMuted, cursor: "pointer", fontSize: 13, padding: "4px 12px", marginTop: 4 }}>
            + {ctx.t.addBullet}
          </button>
        )}
      </div>
    </>
  );
}

function ContentCornerAccent(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <svg width="200" height="200" style={{ position: "absolute", top: 0, [isRtl ? "left" : "right"]: 0, opacity: 0.85 }}>
        <polygon points="200,0 200,200 0,0" fill={eff.accent} />
      </svg>
      <div style={{ position: "absolute", top: 36, [isRtl ? "right" : "left"]: 56, width: "55%" }}>
        {TitleBar(ctx, { fontSize: 28 })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 150, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36 }}>
        {BulletList(ctx)}
      </div>
    </>
  );
}

function ContentLeftRule(ctx: RenderCtx) {
  const { eff, isRtl } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 64, bottom: 64, [isRtl ? "right" : "left"]: 56, width: 4, background: eff.palette.accentGradient, borderRadius: 2, boxShadow: `0 0 18px ${eff.palette.glow}` }} />
      <div style={{ position: "absolute", top: 64, [isRtl ? "right" : "left"]: 80, [isRtl ? "left" : "right"]: 56 }}>
        {TitleBar(ctx, { fontSize: 28 })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 170, [isRtl ? "right" : "left"]: 80, [isRtl ? "left" : "right"]: 56, bottom: 64 }}>
        {BulletList(ctx)}
      </div>
    </>
  );
}

function ContentCardStack(ctx: RenderCtx) {
  const { eff } = ctx;
  return (
    <>
      <div style={{ position: "absolute", top: 36, insetInlineStart: 56, insetInlineEnd: 56 }}>
        {TitleBar(ctx, { fontSize: 26 })}
        {Subtitle(ctx)}
      </div>
      <div style={{ position: "absolute", top: 130, insetInlineStart: 56, insetInlineEnd: 56, bottom: 36, display: "flex", flexDirection: "column", gap: 8 }}>
        {ctx.slide.bullets.map((b, bi) => (
          <div key={bi} style={{
            display: "flex", alignItems: "center", gap: 14, padding: "14px 18px",
            background: eff.palette.cardBg,
            border: `1px solid ${eff.palette.cardBorder}`,
            borderRadius: 8,
            position: "relative",
            flexDirection: "row",
            boxShadow: `0 3px 14px ${eff.palette.glow}`,
          }}>
            <div style={{ position: "absolute", top: 0, left: 0, right: 0, height: 3, background: eff.palette.accentGradient, borderTopLeftRadius: 8, borderTopRightRadius: 8 }} />
            <span style={{ fontSize: 22, fontWeight: 700, fontFamily: eff.font.display, color: eff.accent, minWidth: 24 }}>{String(bi + 1).padStart(2, "0")}</span>
            <div style={{ flex: 1, fontSize: 16 * ctx.eff.bodyScale, lineHeight: 1.5, color: eff.palette.text, fontFamily: eff.font.body }}>
              {ctx.interactive ? (
                <Editable value={b} onChange={(v) => ctx.handlers.onBulletChange?.(bi, v)} placeholder={ctx.t.bullets} style={{ display: "block", color: "inherit", fontFamily: eff.font.body }} />
              ) : (
                <span>{b}</span>
              )}
            </div>
            {ctx.interactive && ctx.slide.bullets.length > 1 && (
              <button type="button" onClick={() => ctx.handlers.onRemoveBullet?.(bi)}
                style={{ background: "none", border: "none", color: eff.palette.textMuted, cursor: "pointer", fontSize: 14, opacity: 0.5 }}>×</button>
            )}
          </div>
        ))}
        {ctx.interactive && (
          <button type="button" onClick={ctx.handlers.onAddBullet}
            style={{ background: "none", border: `1px dashed ${eff.palette.textMuted}`, borderRadius: 4, color: eff.palette.textMuted, cursor: "pointer", fontSize: 13, padding: "6px 12px", alignSelf: "flex-start" }}>
            + {ctx.t.addBullet}
          </button>
        )}
      </div>
    </>
  );
}
