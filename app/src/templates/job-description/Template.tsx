"use client";

import type { CSSProperties } from "react";
import type { JobDocument } from "@/lib/schemas/job-description";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { FONT_CSS } from "@/lib/formatting";
import styles from "../kpis/Template.module.css";

export function JobTemplate({ doc }: { doc: JobDocument }) {
  const lang = useAppStore((s) => s.lang);
  const fmt = useAppStore((s) => s.formatting);
  const t = strings[lang];
  const tj = t.job;

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
      <h1 className={styles.h1}>{tj.docTitle}</h1>

      <Field label={tj.title} value={doc.title} />
      <Field label={tj.positioning} hint={tj.positioningHint} value={doc.positioning} />
      <Field label={tj.reportsTo} value={doc.reportsTo} />
      <Field label={tj.directReports} value={doc.directReports} />
      <Field label={tj.division} value={doc.division} />
      <Field label={tj.date} value={doc.date} />

      <h2 className={styles.h2}>{tj.purposeHeading}</h2>
      <p className={styles.guidance}>{tj.purposeGuidance}</p>
      <div className={styles.value} style={{ whiteSpace: "pre-wrap", borderBottom: 0 }}>
        {doc.purpose || <FillLine />}
      </div>

      <h2 className={styles.h2}>{tj.areasHeading}</h2>
      <p className={styles.guidance}>{tj.areasGuidance}</p>

      {doc.areas.map((a, i) => (
        <div key={i} className={styles.kpiBlock}>
          {doc.areas.length > 1 && <div className={styles.kpiIndex}>{tj.areaLabel(i)}</div>}
          <Field label={tj.areaName} value={a.name} inline />
          <div className={styles.fieldInline}>
            <strong>{tj.duties}:</strong>
            <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
              {a.duties.map((d, di) => (
                <li key={di} style={{ marginBottom: "0.25rem" }}>{d || <FillLine />}</li>
              ))}
            </ul>
          </div>
        </div>
      ))}

      {doc.enabled.interfaces && (
        <>
          <h2 className={styles.h2}>{tj.interfacesHeading}</h2>
          <p className={styles.guidance}>{tj.interfacesGuidance}</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{tj.colParty}</th>
                  <th>{tj.colKind}</th>
                  <th>{tj.colPurpose}</th>
                </tr>
              </thead>
              <tbody>
                {doc.interfaces.map((iface, i) => (
                  <tr key={i}>
                    <td>{iface.party || <FillLine />}</td>
                    <td>{iface.kind || <FillLine />}</td>
                    <td>{iface.purpose || <FillLine />}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

      {doc.enabled.successMetrics && (
        <>
          <h2 className={styles.h2}>{tj.metricsHeading}</h2>
          <p className={styles.guidance}>{tj.metricsGuidance}</p>
          <div className={styles.value} style={{ whiteSpace: "pre-wrap", borderBottom: 0 }}>
            {doc.successMetrics || <FillLine />}
          </div>
        </>
      )}

      {doc.enabled.qualifications && (
        <>
          <h2 className={styles.h2}>{tj.qualificationsHeading}</h2>
          <p className={styles.guidance}>{tj.qualificationsGuidance}</p>
          <Field label={tj.required} value={doc.required} inline />
          <Field label={tj.advantage} value={doc.advantage} inline />
        </>
      )}

      {doc.enabled.authority && (
        <>
          <h2 className={styles.h2}>{tj.authorityHeading}</h2>
          <p className={styles.guidance}>{tj.authorityGuidance}</p>
          <Field label={tj.decides} value={doc.decides} inline />
          <Field label={tj.recommends} value={doc.recommends} inline />
          <Field label={tj.escalates} value={doc.escalates} inline />
        </>
      )}
    </article>
  );
}

function Field({
  label,
  hint,
  value,
  inline,
}: {
  label: string;
  hint?: string;
  value: string;
  inline?: boolean;
}) {
  return (
    <div className={inline ? styles.fieldInline : styles.field}>
      <strong>{label}</strong>
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
