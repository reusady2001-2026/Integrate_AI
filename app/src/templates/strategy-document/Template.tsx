"use client";

import { type CSSProperties } from "react";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { useStrategyDocStore } from "@/lib/strategy-doc-store";
import { resolveDocTheme, buildDocPresentation } from "@/lib/themes/doc-themes";
import { Editable } from "@/components/Editable";
import styles from "../kpis/Template.module.css";

/**
 * Strategy Document template — 11-section structure modeled on the
 * board-grade strategy paper:
 *   1. Executive summary (narrative paragraphs)
 *   2. Who we are — current state (identity / portfolio / financial state)
 *   3. Strategic diagnosis (opening + relative advantage + peer positioning)
 *   4. Focus principle: what to avoid
 *   5. Strategic growth focuses (engines with sub-sections)
 *   6. Managing the existing cashflow base (narrative + recommendations)
 *   7. Building organizational capabilities & capital-market engine
 *   8. 2026 action plan & priorities
 *   9. Success metrics & target horizons (with base / milestone / target table)
 *  10. Risk management
 *  11. Strategic summary (narrative paragraphs)
 */
export function StrategyDocumentTemplate() {
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang];
  const ts = t.strategy;
  const doc = useStrategyDocStore((s) => s.doc);
  const design = useStrategyDocStore((s) => s.design);
  const st = useStrategyDocStore();

  const eff = resolveDocTheme(design.theme, design);
  const { className: docClasses, style: docStyle } = buildDocPresentation(eff, styles);

  return (
    <article className={docClasses} lang={lang} dir={t.dir} style={docStyle as CSSProperties}>
      {/* Header */}
      <h1 className={styles.h1}>{ts.docTitle}</h1>

      <EditField label={ts.company} value={doc.company} onChange={(v) => st.setField("company", v)} />
      <EditField label={ts.docType} hint={ts.docTypeHint} value={doc.docType} onChange={(v) => st.setField("docType", v)} />
      <EditField label={ts.horizon} hint={ts.horizonHint} value={doc.horizon} onChange={(v) => st.setField("horizon", v)} />
      <EditField label={ts.date} value={doc.date} onChange={(v) => st.setField("date", v)} />

      {/* ════════ Section 1 — Executive Summary ════════ */}
      <h2 className={styles.h2}>{ts.execSummaryHeading}</h2>
      <p className={styles.guidance}>{ts.execSummaryGuidance}</p>
      <ParagraphList
        paragraphs={doc.executiveSummary}
        onChange={(i, v) => st.setExecutiveSummary(i, v)}
        onAdd={st.addExecutiveSummary}
        onRemove={st.removeExecutiveSummary}
        addLabel={ts.addParagraph}
      />

      {/* ════════ Section 2 — Who We Are ════════ */}
      <h2 className={styles.h2}>{ts.situationHeading}</h2>

      <h3 className={styles.h3}>{ts.identityHeading}</h3>
      <p className={styles.guidance}>{ts.identityGuidance}</p>
      <EditField label={ts.founding} value={doc.founding} onChange={(v) => st.setField("founding", v)} inline />
      <EditField label={ts.ownership} value={doc.ownership} onChange={(v) => st.setField("ownership", v)} inline />
      <EditField label={ts.listing} value={doc.listing} onChange={(v) => st.setField("listing", v)} inline />
      <EditField label={ts.rating} value={doc.rating} onChange={(v) => st.setField("rating", v)} inline />
      <EditField label={ts.officers} value={doc.officers} onChange={(v) => st.setField("officers", v)} inline />

      <h3 className={styles.h3}>{ts.portfolioHeading}</h3>
      <BlockEdit label={ts.portfolioNarrativeLabel}
        value={doc.portfolioNarrative}
        onChange={(v) => st.setField("portfolioNarrative", v)} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{ts.colSegment}</th><th>{ts.colScale}</th><th>{ts.colValue}</th>
              <th>{ts.colNoi}</th><th>{ts.colOccupancy}</th><th>{ts.colNotes}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.portfolio.map((r, i) => (
              <tr key={i}>
                <td><Editable value={r.segment} onChange={(v) => st.setPortfolio(i, { segment: v })} /></td>
                <td><Editable value={r.scale} onChange={(v) => st.setPortfolio(i, { scale: v })} /></td>
                <td><Editable value={r.value} onChange={(v) => st.setPortfolio(i, { value: v })} /></td>
                <td><Editable value={r.noi} onChange={(v) => st.setPortfolio(i, { noi: v })} /></td>
                <td><Editable value={r.occupancy} onChange={(v) => st.setPortfolio(i, { occupancy: v })} /></td>
                <td><Editable value={r.notes} onChange={(v) => st.setPortfolio(i, { notes: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.portfolio.length > 1 && <button type="button" onClick={() => st.removePortfolio(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addPortfolio} className={styles.addBtn}>{ts.addSegment}</button>

      <h3 className={styles.h3}>{ts.financeHeading}</h3>
      <BlockEdit label={ts.financeNarrativeLabel}
        value={doc.financeNarrative}
        onChange={(v) => st.setField("financeNarrative", v)} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{ts.colMetric}</th><th>{ts.colMetricValue}</th><th>{ts.colMetricNote}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.finance.map((r, i) => (
              <tr key={i}>
                <td><Editable value={r.metric} onChange={(v) => st.setFinance(i, { metric: v })} /></td>
                <td><Editable value={r.value} onChange={(v) => st.setFinance(i, { value: v })} /></td>
                <td><Editable value={r.note} onChange={(v) => st.setFinance(i, { note: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.finance.length > 1 && <button type="button" onClick={() => st.removeFinance(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addFinance} className={styles.addBtn}>{ts.addFinanceRow}</button>
      <BlockEdit label={ts.financeImplicationLabel}
        value={doc.financeImplication}
        onChange={(v) => st.setField("financeImplication", v)} />

      {/* ════════ Section 3 — Strategic Diagnosis ════════ */}
      <h2 className={styles.h2}>{ts.diagnosisHeading}</h2>
      <BlockEdit label={ts.diagnosisIntroLabel}
        value={doc.diagnosisIntro}
        onChange={(v) => st.setField("diagnosisIntro", v)} />
      <h3 className={styles.h3}>{ts.relativeAdvantageLabel}</h3>
      <Editable value={doc.relativeAdvantage} onChange={(v) => st.setField("relativeAdvantage", v)}
        block className={styles.value}
        style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }} />
      <h3 className={styles.h3}>{ts.peerPositioningLabel}</h3>
      <Editable value={doc.peerPositioning} onChange={(v) => st.setField("peerPositioning", v)}
        block className={styles.value}
        style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }} />

      {/* ════════ Section 4 — Focus Principle ════════ */}
      <h2 className={styles.h2}>{ts.focusPrincipleHeading}</h2>
      <BlockEdit label={ts.focusPrincipleIntroLabel}
        value={doc.focusPrincipleIntro}
        onChange={(v) => st.setField("focusPrincipleIntro", v)} />
      <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {doc.wontDo.map((c, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={c} onChange={(v) => st.setWontDo(i, v)} />
            {doc.wontDo.length > 1 && <button type="button" onClick={() => st.removeWontDo(i)} className={styles.removeBtn}>×</button>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={st.addWontDo} className={styles.addBtn}>+</button>

      {/* ════════ Section 5 — Strategic Growth Focuses ════════ */}
      <h2 className={styles.h2}>{ts.growthFocusHeading}</h2>
      <BlockEdit label={ts.growthFocusIntroLabel}
        value={doc.growthEnginesIntro}
        onChange={(v) => st.setField("growthEnginesIntro", v)} />
      {doc.engines.map((e, i) => (
        <div key={i} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>5.{i + 1} {e.name || ts.engineLabel(i)}</div>
            {doc.engines.length > 1 && (
              <button type="button" onClick={() => st.removeEngine(i)} className={styles.removeBtn}>×</button>
            )}
          </div>
          <EditField label={ts.engineName} value={e.name} onChange={(v) => st.setEngine(i, { name: v })} inline />
          <BlockEdit label={ts.engineDescriptionLabel}
            value={e.description}
            onChange={(v) => st.setEngine(i, { description: v })} />
          {/* Sub-sections */}
          {e.subSections.map((ss, si) => (
            <div key={si} style={{ margin: "0.6rem 0 0.4rem", paddingInlineStart: "0.8rem", borderInlineStart: `2px solid ${eff.accent2 || eff.accent}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.2rem" }}>
                <strong style={{ fontSize: "0.95em", color: eff.accent }}>
                  ◆ <Editable value={ss.heading} onChange={(v) => st.setEngineSubSection(i, si, { heading: v })} />
                </strong>
                <button type="button" onClick={() => st.removeEngineSubSection(i, si)} className={styles.removeBtn} title="הסר תת-סעיף">×</button>
              </div>
              <Editable value={ss.body} onChange={(v) => st.setEngineSubSection(i, si, { body: v })}
                block className={styles.value}
                style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "2em" }} />
              {ss.bullets.length > 0 && (
                <ul style={{ margin: "0.3rem 0 0", paddingInlineStart: "1.2rem" }}>
                  {ss.bullets.map((b, bi) => (
                    <li key={bi} style={{ marginBottom: "0.15rem" }}>
                      <Editable value={b} onChange={(v) => st.setEngineSubSectionBullet(i, si, bi, v)} />
                      <button type="button" onClick={() => st.removeEngineSubSectionBullet(i, si, bi)} className={styles.removeBtn}>×</button>
                    </li>
                  ))}
                </ul>
              )}
              <button type="button" onClick={() => st.addEngineSubSectionBullet(i, si)} className={styles.addBtn} style={{ fontSize: "0.78em" }}>+ נקודה</button>
            </div>
          ))}
          <button type="button" onClick={() => st.addEngineSubSection(i)} className={styles.addBtn}>{ts.addSubSection}</button>
        </div>
      ))}
      <button type="button" onClick={st.addEngine} className={styles.addBtn}>{ts.addEngine}</button>

      {/* ════════ Section 6 — Managing the Cashflow Base ════════ */}
      <h2 className={styles.h2}>{ts.cashflowBaseHeading}</h2>
      <BlockEdit label={ts.cashflowBaseIntroLabel}
        value={doc.cashflowBaseIntro}
        onChange={(v) => st.setField("cashflowBaseIntro", v)} />
      {doc.base.map((b, i) => (
        <div key={i} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>{b.segment || `מחלקה ${i + 1}`}</div>
            {doc.base.length > 1 && (
              <button type="button" onClick={() => st.removeBase(i)} className={styles.removeBtn}>×</button>
            )}
          </div>
          <EditField label="שם המחלקה" value={b.segment} onChange={(v) => st.setBase(i, { segment: v })} inline />
          <BlockEdit label={ts.baseNarrativeLabel}
            value={b.narrative}
            onChange={(v) => st.setBase(i, { narrative: v })} />
          {b.recommendations.length > 0 && (
            <>
              <div className={styles.fieldInline} style={{ marginTop: "0.3rem" }}>
                <strong>{ts.baseRecommendationsLabel}:</strong>
              </div>
              <ul style={{ margin: "0.2rem 0 0", paddingInlineStart: "1.2rem" }}>
                {b.recommendations.map((r, ri) => (
                  <li key={ri} style={{ marginBottom: "0.15rem" }}>
                    <Editable value={r} onChange={(v) => st.setBaseRecommendation(i, ri, v)} />
                    <button type="button" onClick={() => st.removeBaseRecommendation(i, ri)} className={styles.removeBtn}>×</button>
                  </li>
                ))}
              </ul>
            </>
          )}
          <button type="button" onClick={() => st.addBaseRecommendation(i)} className={styles.addBtn} style={{ fontSize: "0.82em" }}>+ המלצה</button>
        </div>
      ))}
      <button type="button" onClick={st.addBase} className={styles.addBtn}>{ts.addBaseRow}</button>

      {/* ════════ Section 7 — Building Capabilities ════════ */}
      <h2 className={styles.h2}>{ts.capabilitiesHeading}</h2>
      <p className={styles.guidance}>{ts.capabilitiesGuidance}</p>
      <ParagraphList
        paragraphs={doc.capabilities}
        onChange={(i, v) => st.setCapability(i, v)}
        onAdd={st.addCapability}
        onRemove={st.removeCapability}
        addLabel={ts.addParagraph}
      />

      {/* ════════ Section 8 — 2026 Action Plan ════════ */}
      <h2 className={styles.h2}>{ts.actionPlanHeading}</h2>
      <BlockEdit label={ts.actionPlanIntroLabel}
        value={doc.actionPlanIntro}
        onChange={(v) => st.setField("actionPlanIntro", v)} />
      <BlockEdit label={ts.actionPlanRhythmLabel}
        value={doc.actionPlanRhythm}
        onChange={(v) => st.setField("actionPlanRhythm", v)} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{ts.actionMoveTitle}</th>
              <th>{ts.actionMoveDescription}</th>
              <th>{ts.actionMoveOwner}</th>
              <th>{ts.actionMoveSuccessMetric}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.actionMoves.map((m, i) => (
              <tr key={i}>
                <td><Editable value={m.title} onChange={(v) => st.setActionMove(i, { title: v })} /></td>
                <td><Editable value={m.description} onChange={(v) => st.setActionMove(i, { description: v })} /></td>
                <td><Editable value={m.owner} onChange={(v) => st.setActionMove(i, { owner: v })} /></td>
                <td><Editable value={m.successMetric} onChange={(v) => st.setActionMove(i, { successMetric: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.actionMoves.length > 1 && (
                    <button type="button" onClick={() => st.removeActionMove(i)} className={styles.removeBtn}>×</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addActionMove} className={styles.addBtn}>{ts.addActionMove}</button>

      {/* ════════ Section 9 — Success Metrics & Target Horizons ════════ */}
      <h2 className={styles.h2}>{ts.successMetricsHeading}</h2>
      <BlockEdit label={ts.successMetricsIntroLabel}
        value={doc.successMetricsIntro}
        onChange={(v) => st.setField("successMetricsIntro", v)} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{ts.colTargetMetric}</th><th>{ts.colTargetBase}</th>
              <th>{ts.colTargetMilestone}</th><th>{ts.colTargetTarget}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.targetHorizons.map((th, i) => (
              <tr key={i}>
                <td><Editable value={th.metric} onChange={(v) => st.setTargetHorizon(i, { metric: v })} /></td>
                <td><Editable value={th.base2026} onChange={(v) => st.setTargetHorizon(i, { base2026: v })} /></td>
                <td><Editable value={th.milestone2028} onChange={(v) => st.setTargetHorizon(i, { milestone2028: v })} /></td>
                <td><Editable value={th.target2030} onChange={(v) => st.setTargetHorizon(i, { target2030: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.targetHorizons.length > 1 && <button type="button" onClick={() => st.removeTargetHorizon(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addTargetHorizon} className={styles.addBtn}>{ts.addTargetHorizon}</button>

      {/* ════════ Section 10 — Risk Management ════════ */}
      <h2 className={styles.h2}>{ts.risksHeadingNumbered}</h2>
      <BlockEdit label={ts.risksIntroLabel}
        value={doc.risksIntro}
        onChange={(v) => st.setField("risksIntro", v)} />
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{ts.colRisk}</th><th>{ts.colResponse}</th><th>{ts.colOwner}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.risks.map((r, i) => (
              <tr key={i}>
                <td><Editable value={r.risk} onChange={(v) => st.setRisk(i, { risk: v })} /></td>
                <td><Editable value={r.response} onChange={(v) => st.setRisk(i, { response: v })} /></td>
                <td><Editable value={r.owner} onChange={(v) => st.setRisk(i, { owner: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.risks.length > 1 && <button type="button" onClick={() => st.removeRisk(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addRisk} className={styles.addBtn}>{ts.addRisk}</button>

      {/* ════════ Section 11 — Strategic Summary ════════ */}
      <h2 className={styles.h2}>{ts.summaryHeadingNumbered}</h2>
      <ParagraphList
        paragraphs={doc.summaryParagraphs}
        onChange={(i, v) => st.setSummaryParagraph(i, v)}
        onAdd={st.addSummaryParagraph}
        onRemove={st.removeSummaryParagraph}
        addLabel={ts.addParagraph}
      />
    </article>
  );
}

// ─── Sub-components ────────────────────────────────────────────────

function EditField({ label, hint, value, onChange, inline }: {
  label: string; hint?: string; value: string; onChange: (v: string) => void; inline?: boolean;
}) {
  return (
    <div className={inline ? styles.fieldInline : styles.field}>
      <strong>{label}</strong>
      {hint && <span className={styles.hint}> — {hint}</span>}
      {": "}
      <Editable value={value} onChange={onChange} className={inline ? styles.valueInline : styles.value} />
    </div>
  );
}

function BlockEdit({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBlock: "0.4rem 0.5rem" }}>
      {label && <div className={styles.fieldLabel}><strong>{label}</strong></div>}
      <Editable value={value} onChange={onChange} block className={styles.value}
        style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "2.5em" }} />
    </div>
  );
}

function ParagraphList({ paragraphs, onChange, onAdd, onRemove, addLabel }: {
  paragraphs: string[];
  onChange: (i: number, v: string) => void;
  onAdd: () => void;
  onRemove: (i: number) => void;
  addLabel: string;
}) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <div key={i} style={{ position: "relative", marginBottom: "0.7rem" }}>
          <Editable value={p} onChange={(v) => onChange(i, v)} block className={styles.value}
            style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }} />
          {paragraphs.length > 1 && (
            <button type="button" onClick={() => onRemove(i)}
              className={styles.removeBtn}
              style={{ position: "absolute", top: 0, insetInlineEnd: 0 }}>×</button>
          )}
        </div>
      ))}
      <button type="button" onClick={onAdd} className={styles.addBtn}>{addLabel}</button>
    </>
  );
}
