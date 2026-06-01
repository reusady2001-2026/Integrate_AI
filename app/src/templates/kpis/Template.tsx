"use client";

import type { KpiDocument } from "@/lib/schemas/kpis";
import styles from "./Template.module.css";

export function KpiTemplate({ doc }: { doc: KpiDocument }) {
  return (
    <article className={styles.doc} lang="he" dir="rtl">
      <h1 className={styles.h1}>
        מדדי ביצוע <span className={styles.gloss}>· KPIs &amp; Metrics</span>
      </h1>

      <Field label="שם החברה" gloss="Company" value={doc.company} />
      <Field
        label="רמת המדידה"
        gloss="Level"
        hint="ארגון / חטיבה / תפקיד"
        value={doc.level}
      />
      <Field label="תאריך" gloss="Date" value={doc.date} />

      <h2 className={styles.h2}>
        הגדרות מדדים <span className={styles.gloss}>· KPI Definitions</span>
      </h2>
      <p className={styles.guidance}>
        מה למלא: &quot;נוסחה&quot; חייבת להיות חד-משמעית. ה&quot;ספים&quot; קובעים את סטטוס הרמזור (ירוק/צהוב/אדום). לכל מדד חייב להיות בעלים יחיד ומקור נתונים.
      </p>

      <h3 className={styles.h3}>
        מדדים <span className={styles.gloss}>/ KPI&apos;s</span> :
      </h3>

      {doc.kpis.map((k, i) => (
        <div key={i} className={styles.kpiBlock}>
          {doc.kpis.length > 1 && (
            <div className={styles.kpiIndex}>מדד {i + 1}</div>
          )}
          <Field label="שם" gloss="Name" value={k.name} inline />
          <Field label="הגדרה (מה הוא מודד, בפשטות)" gloss="Definition" value={k.definition} inline />
          <Field label="נוסחה" gloss="Formula" value={k.formula} inline />
          <Field label="בעלים (תפקיד יחיד)" gloss="Owner" value={k.owner} inline />
          <Field label="מקור נתונים" gloss="Data source" value={k.dataSource} inline />
          <Field label="תדירות" gloss="Cadence" value={k.cadence} inline />
          <Field label="בסיס היום" gloss="Baseline" value={k.baseline} inline />
          <Field label="יעדים: T+1 / T+2 / T+5" gloss="Targets" value={k.targets} inline />
        </div>
      ))}

      <h2 className={styles.h2}>
        כרטיס מדדים <span className={styles.gloss}>· Scorecard</span>
      </h2>
      <p className={styles.guidance}>
        מה למלא: טבלת סיכום של כל המדדים שלמעלה במבט אחד.
      </p>

      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>מדד / KPI</th>
              <th>בעלים / Owner</th>
              <th>בסיס / Baseline</th>
              <th>יעד / Target</th>
              <th>תדירות / Cadence</th>
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
  gloss: string;
  hint?: string;
  value: string;
  inline?: boolean;
}) {
  const fill = value || null;
  return (
    <div className={inline ? styles.fieldInline : styles.field}>
      <strong>
        {label} <span className={styles.gloss}>/ {gloss}</span>
      </strong>
      {hint && <span className={styles.hint}> — {hint}</span>}
      {": "}
      <span className={inline ? styles.valueInline : styles.value}>
        {fill ?? <FillLine />}
      </span>
    </div>
  );
}

function FillLine() {
  return <span className={styles.fillLine} aria-hidden="true" />;
}
