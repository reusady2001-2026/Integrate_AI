"use client";

import type { KpiDocument } from "@/lib/schemas/kpis";
import styles from "./Template.module.css";

export function KpiTemplate({ doc }: { doc: KpiDocument }) {
  return (
    <article className={styles.doc} lang="he" dir="rtl">
      <h1 className={styles.h1}>
        מדדי ביצוע <span className={styles.gloss}>· KPIs &amp; Metrics</span>
      </h1>

      <p className={styles.intro}>
        מסמך זה מגדיר את מערך המדדים — ברמת הארגון, החטיבה או התפקיד. מלאו את
        השדות בקו תחתון. שמרו על מספר מדדים קטן שמניע החלטות (לא מדדי יוקרה).
      </p>

      <Field label="שם החברה" gloss="Company" value={doc.company} />
      <Field
        label="רמת המדידה"
        gloss="Level"
        hint="ארגון / חטיבה / תפקיד"
        value={doc.level}
      />
      <Field label="תאריך" gloss="Date" value={doc.date} />
      <Field
        label="סיווג"
        gloss="Classification"
        value={doc.classification}
      />

      <hr className={styles.rule} />

      <Section
        number="1"
        title="מסגרת המדידה"
        gloss="Measurement Framework"
        guidance="כיצד המדדים מאורגנים (לפי ציר אסטרטגי / לפי פונקציה / לפי תפקיד) ומהו קצב הסקירה (לדוגמה: תפעולי חודשי, דירקטוריון רבעוני)."
      >
        <Field
          label="לוגיקת המדידה"
          gloss="Logic"
          value={doc.framework.logic}
          multiline
        />
        <Field
          label="קצב סקירה"
          gloss="Review cadence"
          value={doc.framework.cadence}
          multiline
        />
      </Section>

      <hr className={styles.rule} />

      <Section
        number="2"
        title="הגדרות מדדים"
        gloss="KPI Definitions"
        guidance={
          <>
            בלוק אחד לכל מדד. <strong>נוסחה</strong> חייבת להיות חד-משמעית.
            ה<strong>ספים</strong> קובעים את סטטוס הרמזור (ירוק / צהוב / אדום).
            לכל מדד חייב להיות בעלים יחיד ומקור נתונים.
          </>
        }
      >
        <h3 className={styles.h3}>
          מדדים <span className={styles.gloss}>· KPI&apos;s</span> :
        </h3>

        {doc.kpis.map((k, i) => (
          <div key={i} className={styles.kpiBlock}>
            {doc.kpis.length > 1 && (
              <div className={styles.kpiIndex}>מדד {i + 1}</div>
            )}
            <Field label="שם" gloss="Name" value={k.name} />
            <Field
              label="הגדרה (מה הוא מודד, בפשטות)"
              gloss="Definition"
              value={k.definition}
              multiline
            />
            <Field label="נוסחה" gloss="Formula" value={k.formula} multiline />
            <Field
              label="בעלים (תפקיד יחיד)"
              gloss="Owner"
              value={k.owner}
            />
            <Field label="מקור נתונים" gloss="Data source" value={k.dataSource} />
            <Field label="תדירות" gloss="Cadence" value={k.cadence} />
            <Field label="בסיס היום" gloss="Baseline" value={k.baseline} />
            <Field
              label="יעדים: T+1 / T+2 / T+5"
              gloss="Targets"
              value={k.targets}
            />
            <Field
              label="ספים — 🟢 ירוק / 🟡 צהוב / 🔴 אדום"
              gloss="Thresholds"
              value={k.thresholds}
              multiline
            />
          </div>
        ))}

        <p className={styles.note}>
          (שכפלו את הבלוק לעיל עבור כל מדד נוסף.)
        </p>
      </Section>

      <hr className={styles.rule} />

      <Section
        number="3"
        title="כרטיס מדדים"
        gloss="Scorecard"
        guidance="טבלת סיכום של כל המדדים שלמעלה במבט אחד."
      >
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>מדד · KPI</th>
                <th>בעלים · Owner</th>
                <th>בסיס · Baseline</th>
                <th>יעד · Target</th>
                <th>תדירות · Cadence</th>
                <th>סטטוס</th>
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
                  <td className={styles.statusCell}>{r.status || <FillLine />}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <hr className={styles.rule} />

      <Section
        number="4"
        title="ממשל המדידה"
        gloss="KPI Governance"
        optional
        guidance="מי סוקר מה ומתי, ואיזו פעולה מפעיל סטטוס אדום."
      >
        <Field
          label="פורום — תדירות — זכויות החלטה"
          gloss="Forum · Frequency · Decision rights"
          value={doc.governance}
          multiline
        />
      </Section>
    </article>
  );
}

function Field({
  label,
  gloss,
  hint,
  value,
  multiline,
}: {
  label: string;
  gloss: string;
  hint?: string;
  value: string;
  multiline?: boolean;
}) {
  return (
    <div className={styles.field}>
      <div className={styles.fieldLabel}>
        <strong>
          {label} <span className={styles.gloss}>/ {gloss}</span>
        </strong>
        {hint && <span className={styles.hint}> — {hint}</span>}
      </div>
      <div className={multiline ? styles.valueMulti : styles.value}>
        {value ? value : <FillLine />}
      </div>
    </div>
  );
}

function Section({
  number,
  title,
  gloss,
  guidance,
  optional,
  children,
}: {
  number: string;
  title: string;
  gloss: string;
  guidance: React.ReactNode;
  optional?: boolean;
  children: React.ReactNode;
}) {
  return (
    <section className={styles.section}>
      <h2 className={styles.h2}>
        {number}. {title} <span className={styles.gloss}>· {gloss}</span>
        {optional && <span className={styles.optional}> (אופציונלי / optional)</span>}
      </h2>
      <p className={styles.guidance}>
        <span className={styles.guidanceLabel}>מה למלא:</span> {guidance}
      </p>
      {children}
    </section>
  );
}

function FillLine() {
  return <span className={styles.fillLine} aria-hidden="true" />;
}
