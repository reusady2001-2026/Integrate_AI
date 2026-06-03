"use client";

import { type CSSProperties } from "react";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { useOrgStructureStore } from "@/lib/org-structure-store";
import { FONT_CSS } from "@/lib/formatting";
import { Editable } from "@/components/Editable";
import styles from "../kpis/Template.module.css";

export function OrgStructureTemplate() {
  const lang = useAppStore((s) => s.lang);
  const fmt = useAppStore((s) => s.formatting);
  const t = strings[lang];
  const to = t.org;
  const doc = useOrgStructureStore((s) => s.doc);
  const st = useOrgStructureStore();

  const tableClass = styles[`table_${fmt.tableStyle}` as keyof typeof styles] ?? "";
  const docStyle = {
    "--doc-font-body": FONT_CSS[fmt.fontFamily],
    "--doc-font-display": FONT_CSS[fmt.fontFamily],
    "--doc-accent": fmt.headingColor,
    fontSize: `${fmt.fontSize}pt`,
  } as CSSProperties;

  return (
    <article className={`${styles.doc} ${tableClass}`} lang={lang} dir={t.dir} style={docStyle}>
      <h1 className={styles.h1}>{to.docTitle}</h1>

      <EditField label={to.company} value={doc.company} onChange={(v) => st.setField("company", v)} />
      <EditField label={to.date} value={doc.date} onChange={(v) => st.setField("date", v)} />

      <h2 className={styles.h2}>{to.principlesHeading}</h2>
      <p className={styles.guidance}>{to.principlesGuidance}</p>
      <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {doc.principles.map((p, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={p} onChange={(v) => st.setPrinciple(i, v)} />
            {doc.principles.length > 1 && <button type="button" onClick={() => st.removePrinciple(i)} className={styles.removeBtn}>×</button>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={st.addPrinciple} className={styles.addBtn}>{to.addPrinciple}</button>

      <h2 className={styles.h2}>{to.governanceHeading}</h2>
      <p className={styles.guidance}>{to.governanceGuidance}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{to.colBody}</th><th>{to.colMandate}</th><th>{to.colComposition}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.governance.map((r, i) => (
              <tr key={i}>
                <td><Editable value={r.body} onChange={(v) => st.setGovernance(i, { body: v })} /></td>
                <td><Editable value={r.mandate} onChange={(v) => st.setGovernance(i, { mandate: v })} /></td>
                <td><Editable value={r.composition} onChange={(v) => st.setGovernance(i, { composition: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.governance.length > 1 && <button type="button" onClick={() => st.removeGovernance(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addGovernance} className={styles.addBtn}>{to.addGovRow}</button>

      <h2 className={styles.h2}>{to.chartHeading}</h2>
      <p className={styles.guidance}>{to.chartGuidance}</p>
      <Editable
        value={doc.chart}
        onChange={(v) => st.setField("chart", v)}
        block
        className={styles.value}
        style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "5em", fontFamily: "ui-monospace, monospace" }}
      />

      <h2 className={styles.h2}>{to.divisionsHeading}</h2>
      <p className={styles.guidance}>{to.divisionsGuidance}</p>
      {doc.divisions.map((d, i) => (
        <div key={i} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>{to.divisionLabel(i)}</div>
            {doc.divisions.length > 1 && <button type="button" onClick={() => st.removeDivision(i)} className={styles.removeBtn}>×</button>}
          </div>
          <EditField label={to.divisionName} value={d.name} onChange={(v) => st.setDivision(i, { name: v })} inline />
          <EditField label={to.divisionHead} value={d.head} onChange={(v) => st.setDivision(i, { head: v })} inline />
          <EditField label={to.divisionScope} value={d.scope} onChange={(v) => st.setDivision(i, { scope: v })} inline />
          <EditField label={to.divisionKpis} value={d.kpis} onChange={(v) => st.setDivision(i, { kpis: v })} inline />
        </div>
      ))}
      <button type="button" onClick={st.addDivision} className={styles.addBtn}>{to.addDivision}</button>

      <h2 className={styles.h2}>{to.authorityHeading}</h2>
      <p className={styles.guidance}>{to.authorityGuidance}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{to.colDecision}</th><th>{to.colDecides}</th><th>{to.colRecommends}</th><th>{to.colExecutes}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.authority.map((r, i) => (
              <tr key={i}>
                <td><Editable value={r.decision} onChange={(v) => st.setAuthority(i, { decision: v })} /></td>
                <td><Editable value={r.decides} onChange={(v) => st.setAuthority(i, { decides: v })} /></td>
                <td><Editable value={r.recommends} onChange={(v) => st.setAuthority(i, { recommends: v })} /></td>
                <td><Editable value={r.executes} onChange={(v) => st.setAuthority(i, { executes: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.authority.length > 1 && <button type="button" onClick={() => st.removeAuthority(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addAuthority} className={styles.addBtn}>{to.addAuthRow}</button>
    </article>
  );
}

function EditField({ label, value, onChange, inline }: {
  label: string; value: string; onChange: (v: string) => void; inline?: boolean;
}) {
  return (
    <div className={inline ? styles.fieldInline : styles.field}>
      <strong>{label}</strong>
      {": "}
      <Editable value={value} onChange={onChange} className={inline ? styles.valueInline : styles.value} />
    </div>
  );
}
