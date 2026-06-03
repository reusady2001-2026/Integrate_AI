"use client";

import { type CSSProperties } from "react";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { useJobStore } from "@/lib/job-store";
import { resolveDocTheme, buildDocPresentation } from "@/lib/themes/doc-themes";
import { Editable } from "@/components/Editable";
import styles from "../kpis/Template.module.css";

export function JobTemplate() {
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang];
  const tj = t.job;
  const doc = useJobStore((s) => s.doc);
  const design = useJobStore((s) => s.design);
  const {
    setField, setArea, addArea, removeArea,
    setDuty, addDuty, removeDuty,
    setInterface, addInterface, removeInterface,
    toggleSection,
  } = useJobStore();

  const eff = resolveDocTheme(design.theme, design);
  const { className: docClasses, style: docStyle } = buildDocPresentation(eff, styles);

  return (
    <article className={docClasses} lang={lang} dir={t.dir} style={docStyle as CSSProperties}>
      <h1 className={styles.h1}>{tj.docTitle}</h1>

      <EditField label={tj.title} value={doc.title} onChange={(v) => setField("title", v)} />
      <EditField label={tj.positioning} hint={tj.positioningHint} value={doc.positioning} onChange={(v) => setField("positioning", v)} />
      <EditField label={tj.reportsTo} value={doc.reportsTo} onChange={(v) => setField("reportsTo", v)} />
      <EditField label={tj.directReports} value={doc.directReports} onChange={(v) => setField("directReports", v)} />
      <EditField label={tj.division} value={doc.division} onChange={(v) => setField("division", v)} />
      <EditField label={tj.date} value={doc.date} onChange={(v) => setField("date", v)} />

      <h2 className={styles.h2}>{tj.purposeHeading}</h2>
      <p className={styles.guidance}>{tj.purposeGuidance}</p>
      <Editable
        value={doc.purpose}
        onChange={(v) => setField("purpose", v)}
        block
        placeholder="…"
        className={styles.value}
        style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }}
      />

      <h2 className={styles.h2}>{tj.areasHeading}</h2>
      <p className={styles.guidance}>{tj.areasGuidance}</p>

      {doc.areas.map((a, ai) => (
        <div key={ai} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>{tj.areaLabel(ai)}</div>
            {doc.areas.length > 1 && (
              <button type="button" onClick={() => removeArea(ai)} className={styles.removeBtn} title={t.remove}>×</button>
            )}
          </div>
          <EditField label={tj.areaName} value={a.name} onChange={(v) => setArea(ai, { name: v })} inline />
          <div className={styles.fieldInline}>
            <strong>{tj.duties}:</strong>
            <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
              {a.duties.map((d, di) => (
                <li key={di} style={{ marginBottom: "0.25rem" }}>
                  <Editable value={d} onChange={(v) => setDuty(ai, di, v)} />
                  {a.duties.length > 1 && (
                    <button type="button" onClick={() => removeDuty(ai, di)} className={styles.removeBtn}>×</button>
                  )}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => addDuty(ai)} className={styles.addBtn}>{tj.addDuty}</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={addArea} className={styles.addBtn}>{tj.addArea}</button>

      {doc.enabled.interfaces ? (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "2rem" }}>
            <h2 className={styles.h2} style={{ flex: 1, margin: 0 }}>{tj.interfacesHeading}</h2>
            <button type="button" onClick={() => toggleSection("interfaces")} className={styles.removeBtn} title={t.remove}>×</button>
          </div>
          <p className={styles.guidance}>{tj.interfacesGuidance}</p>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{tj.colParty}</th>
                  <th>{tj.colKind}</th>
                  <th>{tj.colPurpose}</th>
                  <th className={styles.tableCtrlCol}></th>
                </tr>
              </thead>
              <tbody>
                {doc.interfaces.map((iface, ii) => (
                  <tr key={ii}>
                    <td><Editable value={iface.party} onChange={(v) => setInterface(ii, { party: v })} /></td>
                    <td><Editable value={iface.kind} onChange={(v) => setInterface(ii, { kind: v })} /></td>
                    <td><Editable value={iface.purpose} onChange={(v) => setInterface(ii, { purpose: v })} /></td>
                    <td className={styles.tableCtrlCol}>
                      {doc.interfaces.length > 1 && (
                        <button type="button" onClick={() => removeInterface(ii)} className={styles.removeBtn}>×</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={addInterface} className={styles.addBtn}>{tj.addInterface}</button>
        </>
      ) : (
        <button type="button" onClick={() => toggleSection("interfaces")} className={styles.addSectionBtn}>
          + {tj.sec_interfaces}
        </button>
      )}

      {doc.enabled.successMetrics ? (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "2rem" }}>
            <h2 className={styles.h2} style={{ flex: 1, margin: 0 }}>{tj.metricsHeading}</h2>
            <button type="button" onClick={() => toggleSection("successMetrics")} className={styles.removeBtn} title={t.remove}>×</button>
          </div>
          <p className={styles.guidance}>{tj.metricsGuidance}</p>
          <Editable
            value={doc.successMetrics}
            onChange={(v) => setField("successMetrics", v)}
            block
            placeholder="…"
            className={styles.value}
            style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "2em" }}
          />
        </>
      ) : (
        <button type="button" onClick={() => toggleSection("successMetrics")} className={styles.addSectionBtn}>
          + {tj.sec_successMetrics}
        </button>
      )}

      {doc.enabled.qualifications ? (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "2rem" }}>
            <h2 className={styles.h2} style={{ flex: 1, margin: 0 }}>{tj.qualificationsHeading}</h2>
            <button type="button" onClick={() => toggleSection("qualifications")} className={styles.removeBtn} title={t.remove}>×</button>
          </div>
          <p className={styles.guidance}>{tj.qualificationsGuidance}</p>
          <EditField label={tj.required} value={doc.required} onChange={(v) => setField("required", v)} inline />
          <EditField label={tj.advantage} value={doc.advantage} onChange={(v) => setField("advantage", v)} inline />
        </>
      ) : (
        <button type="button" onClick={() => toggleSection("qualifications")} className={styles.addSectionBtn}>
          + {tj.sec_qualifications}
        </button>
      )}

      {doc.enabled.authority ? (
        <>
          <div style={{ display: "flex", alignItems: "flex-start", gap: "0.5rem", marginTop: "2rem" }}>
            <h2 className={styles.h2} style={{ flex: 1, margin: 0 }}>{tj.authorityHeading}</h2>
            <button type="button" onClick={() => toggleSection("authority")} className={styles.removeBtn} title={t.remove}>×</button>
          </div>
          <p className={styles.guidance}>{tj.authorityGuidance}</p>
          <EditField label={tj.decides} value={doc.decides} onChange={(v) => setField("decides", v)} inline />
          <EditField label={tj.recommends} value={doc.recommends} onChange={(v) => setField("recommends", v)} inline />
          <EditField label={tj.escalates} value={doc.escalates} onChange={(v) => setField("escalates", v)} inline />
        </>
      ) : (
        <button type="button" onClick={() => toggleSection("authority")} className={styles.addSectionBtn}>
          + {tj.sec_authority}
        </button>
      )}
    </article>
  );
}

function EditField({
  label, hint, value, onChange, inline,
}: {
  label: string; hint?: string;
  value: string; onChange: (v: string) => void; inline?: boolean;
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
