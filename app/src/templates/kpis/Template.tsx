"use client";

import type { CSSProperties } from "react";
import type { KpiDocument } from "@/lib/schemas/kpis";
import { strings } from "@/lib/i18n";
import { useKpiStore } from "@/lib/store";
import { FONT_CSS } from "@/lib/formatting";
import styles from "./Template.module.css";

export function KpiTemplate({ doc }: { doc: KpiDocument }) {
  const lang = useKpiStore((s) => s.lang);
  const fmt = useKpiStore((s) => s.formatting);
  const t = strings[lang];

  const tableClass = styles[`table_${fmt.tableStyle}` as keyof typeof styles] ?? "";
  const docStyle = {
    "--doc-font-body": FONT_CSS[fmt.fontFamily],
    "--doc-font-display": FONT_CSS[fmt.fontFamily],
    "--doc-accent": fmt.headingColor,
    fontSize: `${fmt.fontSize}pt`,
  } as CSSProperties;

  return (
    <article
      className={`${styles.doc} ${tableClass}`}
      lang={lang}
      dir={t.dir}
      style={docStyle}
    >
      <h1 className={styles.h1}>{t.docTitle}</h1>

      <Field label={t.company} gloss={t.companyGloss} hint={undefined} value={doc.company} />
      <Field label={t.role} gloss={t.roleGloss} hint={t.roleHint} value={doc.role} />
      <Field label={t.date} gloss={t.dateGloss} hint={undefined} value={doc.date} />

      <h2 className={styles.h2}>{t.kpiDefsHeading}</h2>
      <p className={styles.guidance}>{t.kpiDefsGuidance}</p>

      <h3 className={styles.h3}>{t.kpisSubheading}</h3>

      {doc.kpis.map((k, i) => (
        <div key={i} className={styles.kpiBlock}>
          {doc.kpis.length > 1 && (
            <div className={styles.kpiIndex}>{t.kpiLabel(i)}</div>
          )}
          <Field label={t.kpiName} gloss={t.kpiNameGloss} value={k.name} inline />
          <Field label={t.kpiDef} gloss={t.kpiDefGloss} value={k.definition} inline />
          <Field label={t.kpiFormula} gloss={t.kpiFormulaGloss} value={k.formula} inline />
          <Field label={t.kpiOwner} gloss={t.kpiOwnerGloss} value={k.owner} inline />
          <Field label={t.kpiDataSource} gloss={t.kpiDataSourceGloss} value={k.dataSource} inline />
          <Field label={t.kpiCadence} gloss={t.kpiCadenceGloss} value={k.cadence} inline />
          <Field label={t.kpiBaseline} gloss={t.kpiBaselineGloss} value={k.baseline} inline />
          <Field label={t.kpiTargets} gloss={t.kpiTargetsGloss} value={k.targets} inline />
        </div>
      ))}

      <h2 className={styles.h2}>{t.scorecardHeading}</h2>
      <p className={styles.guidance}>{t.scorecardGuidance}</p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{t.colKpi}</th>
              <th>{t.colOwner}</th>
              <th>{t.colBaseline}</th>
              <th>{t.colTarget}</th>
              <th>{t.colCadence}</th>
            </tr>
          </thead>
          <tbody>
            {doc.scorecard.map((r, i) => (
              <tr key={i}>
                <td>{r.kpi || <FillLine />}</td>
                <td>{r.owner || <FillLine />}</td>
                <td>{r.baseline || <FillLine />}</td>
                <td>{r.target || <FillLine />}</td>
                <td>{r.cadence || <FillLine />}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function Field({
  label,
  gloss,
  hint,
  value,
  inline,
}: {
  label: string;
  gloss?: string;
  hint?: string;
  value: string;
  inline?: boolean;
}) {
  return (
    <div className={inline ? styles.fieldInline : styles.field}>
      <strong>
        {label}
        {gloss && <span className={styles.gloss}> / {gloss}</span>}
      </strong>
      {hint && <span className={styles.hint}> — {hint}</span>}
      {": "}
      <span className={inline ? styles.valueInline : styles.value}>
        {value || <FillLine />}
      </span>
    </div>
  );
}

function FillLine() {
  return <span className={styles.fillLine} aria-hidden="true" />;
}
