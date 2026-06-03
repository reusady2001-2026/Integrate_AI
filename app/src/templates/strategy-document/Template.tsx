"use client";

import { type CSSProperties } from "react";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { useStrategyDocStore } from "@/lib/strategy-doc-store";
import { resolveDocTheme } from "@/lib/themes/doc-themes";
import { Editable } from "@/components/Editable";
import styles from "../kpis/Template.module.css";

export function StrategyDocumentTemplate() {
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang];
  const ts = t.strategy;
  const doc = useStrategyDocStore((s) => s.doc);
  const design = useStrategyDocStore((s) => s.design);
  const st = useStrategyDocStore();

  const eff = resolveDocTheme(design.theme, design);
  const tableClass = styles[`table_${eff.tableStyle}` as keyof typeof styles] ?? "";
  const hsClass = styles[`hs_${eff.headingStyle}` as keyof typeof styles] ?? styles.hs_classic ?? "";
  const docStyle = {
    "--doc-font-body": eff.fontBody,
    "--doc-font-display": eff.fontDisplay,
    "--doc-accent": eff.accent,
    "--doc-accent2": eff.accent2,
    "--doc-surface": eff.surface,
    "--doc-fg": eff.fg,
    "--doc-muted": eff.muted,
    "--doc-border": eff.border,
    "--doc-border-soft": eff.borderSoft,
    fontSize: `${eff.fontSize}pt`,
  } as CSSProperties;

  return (
    <article className={`${styles.doc} ${hsClass} ${tableClass}`} lang={lang} dir={t.dir} style={docStyle}>
      <h1 className={styles.h1}>{ts.docTitle}</h1>

      <EditField label={ts.company} value={doc.company} onChange={(v) => st.setField("company", v)} />
      <EditField label={ts.docType} hint={ts.docTypeHint} value={doc.docType} onChange={(v) => st.setField("docType", v)} />
      <EditField label={ts.horizon} hint={ts.horizonHint} value={doc.horizon} onChange={(v) => st.setField("horizon", v)} />
      <EditField label={ts.date} value={doc.date} onChange={(v) => st.setField("date", v)} />

      <h2 className={styles.h2}>{ts.partAHeading}</h2>

      <h3 className={styles.h3}>{ts.identityHeading}</h3>
      <p className={styles.guidance}>{ts.identityGuidance}</p>
      <EditField label={ts.founding} value={doc.founding} onChange={(v) => st.setField("founding", v)} inline />
      <EditField label={ts.ownership} value={doc.ownership} onChange={(v) => st.setField("ownership", v)} inline />
      <EditField label={ts.listing} value={doc.listing} onChange={(v) => st.setField("listing", v)} inline />
      <EditField label={ts.rating} value={doc.rating} onChange={(v) => st.setField("rating", v)} inline />
      <EditField label={ts.officers} value={doc.officers} onChange={(v) => st.setField("officers", v)} inline />

      <h3 className={styles.h3}>{ts.portfolioHeading}</h3>
      <p className={styles.guidance}>{ts.portfolioGuidance}</p>
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
      <p className={styles.guidance}>{ts.financeGuidance}</p>
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

      <h3 className={styles.h3}>{ts.challengesHeading}</h3>
      <p className={styles.guidance}>{ts.challengesGuidance}</p>
      <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {doc.challenges.map((c, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={c} onChange={(v) => st.setChallenge(i, v)} />
            {doc.challenges.length > 1 && <button type="button" onClick={() => st.removeChallenge(i)} className={styles.removeBtn}>×</button>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={st.addChallenge} className={styles.addBtn}>{ts.addChallenge}</button>

      <h2 className={styles.h2}>{ts.partBHeading}</h2>

      <h3 className={styles.h3}>{ts.thesisHeading}</h3>
      <p className={styles.guidance}>{ts.thesisGuidance}</p>
      <Editable value={doc.thesis} onChange={(v) => st.setField("thesis", v)} block className={styles.value} style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }} />

      <h3 className={styles.h3}>{ts.tradeoffsHeading}</h3>
      <p className={styles.guidance}>{ts.tradeoffsGuidance}</p>
      <div className={styles.fieldInline}><strong>{ts.willDo}:</strong></div>
      <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {doc.willDo.map((c, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={c} onChange={(v) => st.setWillDo(i, v)} />
            {doc.willDo.length > 1 && <button type="button" onClick={() => st.removeWillDo(i)} className={styles.removeBtn}>×</button>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={st.addWillDo} className={styles.addBtn}>+</button>

      <div className={styles.fieldInline} style={{ marginTop: "0.75rem" }}><strong>{ts.wontDo}:</strong></div>
      <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {doc.wontDo.map((c, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={c} onChange={(v) => st.setWontDo(i, v)} />
            {doc.wontDo.length > 1 && <button type="button" onClick={() => st.removeWontDo(i)} className={styles.removeBtn}>×</button>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={st.addWontDo} className={styles.addBtn}>+</button>

      <h3 className={styles.h3}>{ts.enginesHeading}</h3>
      <p className={styles.guidance}>{ts.enginesGuidance}</p>
      {doc.engines.map((e, i) => (
        <div key={i} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>{ts.engineLabel(i)}</div>
            {doc.engines.length > 1 && <button type="button" onClick={() => st.removeEngine(i)} className={styles.removeBtn}>×</button>}
          </div>
          <EditField label={ts.engineName} value={e.name} onChange={(v) => st.setEngine(i, { name: v })} inline />
          <EditField label={ts.engineOpportunity} value={e.opportunity} onChange={(v) => st.setEngine(i, { opportunity: v })} inline />
          <EditField label={ts.engineLandscape} value={e.landscape} onChange={(v) => st.setEngine(i, { landscape: v })} inline />
          <EditField label={ts.engineModel} value={e.model} onChange={(v) => st.setEngine(i, { model: v })} inline />
          <EditField label={ts.engineEntry} value={e.entryPath} onChange={(v) => st.setEngine(i, { entryPath: v })} inline />
        </div>
      ))}
      <button type="button" onClick={st.addEngine} className={styles.addBtn}>{ts.addEngine}</button>

      <h3 className={styles.h3}>{ts.baseHeading}</h3>
      <p className={styles.guidance}>{ts.baseGuidance}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{ts.colBaseSegment}</th><th>{ts.colBaseStatus}</th><th>{ts.colBaseRisk}</th><th>{ts.colBaseAction}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.base.map((r, i) => (
              <tr key={i}>
                <td><Editable value={r.segment} onChange={(v) => st.setBase(i, { segment: v })} /></td>
                <td><Editable value={r.status} onChange={(v) => st.setBase(i, { status: v })} /></td>
                <td><Editable value={r.risk} onChange={(v) => st.setBase(i, { risk: v })} /></td>
                <td><Editable value={r.action} onChange={(v) => st.setBase(i, { action: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.base.length > 1 && <button type="button" onClick={() => st.removeBase(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addBase} className={styles.addBtn}>{ts.addBaseRow}</button>

      <h3 className={styles.h3}>{ts.risksHeading}</h3>
      <p className={styles.guidance}>{ts.risksGuidance}</p>
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

      <h3 className={styles.h3}>{ts.summaryHeading}</h3>
      <p className={styles.guidance}>{ts.summaryGuidance}</p>
      <Editable value={doc.summary} onChange={(v) => st.setField("summary", v)} block className={styles.value} style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }} />
    </article>
  );
}

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
