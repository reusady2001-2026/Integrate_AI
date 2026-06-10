"use client";

import { type CSSProperties } from "react";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { useKpiStore } from "@/lib/store";
import { resolveDocTheme, buildDocPresentation } from "@/lib/themes/doc-themes";
import { Editable } from "@/components/Editable";
import styles from "./Template.module.css";

export function KpiTemplate() {
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang];
  const doc = useKpiStore((s) => s.doc);
  const design = useKpiStore((s) => s.design);
  const { setField, setKpi, addKpi, removeKpi } = useKpiStore();

  const eff = resolveDocTheme(design.theme, design);
  const { className: docClasses, style: docStyle } = buildDocPresentation(eff, styles);

  return (
    <article className={docClasses} lang={lang} dir={t.dir} style={docStyle as CSSProperties}>
      <h1 className={styles.h1}>{t.docTitle}</h1>

      <EditField label={t.company} gloss={t.companyGloss} value={doc.company} onChange={(v) => setField("company", v)} />
      <EditField label={t.role} gloss={t.roleGloss} hint={t.roleHint} value={doc.role} onChange={(v) => setField("role", v)} />
      <EditField label={t.date} gloss={t.dateGloss} value={doc.date} onChange={(v) => setField("date", v)} />

      <h2 className={styles.h2}>{t.kpiDefsHeading}</h2>
      <p className={styles.guidance}>{t.kpiDefsGuidance}</p>
      <h3 className={styles.h3}>{t.kpisSubheading}</h3>

      {doc.kpis.map((k, i) => (
        <div key={i} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>{t.kpiLabel(i)}</div>
            <button type="button" onClick={() => removeKpi(i)} className={styles.removeBtn} title={t.remove}>×</button>
          </div>
          <EditField label={t.kpiName} gloss={t.kpiNameGloss} value={k.name} onChange={(v) => setKpi(i, { name: v })} inline />
          <EditField label={t.kpiDef} gloss={t.kpiDefGloss} value={k.definition} onChange={(v) => setKpi(i, { definition: v })} inline />
          <EditField label={t.kpiFormula} gloss={t.kpiFormulaGloss} value={k.formula} onChange={(v) => setKpi(i, { formula: v })} inline />
          <EditField label={t.kpiOwner} gloss={t.kpiOwnerGloss} value={k.owner} onChange={(v) => setKpi(i, { owner: v })} inline />
          <EditField label={t.kpiDataSource} gloss={t.kpiDataSourceGloss} value={k.dataSource} onChange={(v) => setKpi(i, { dataSource: v })} inline />
          <EditField label={t.kpiCadence} gloss={t.kpiCadenceGloss} value={k.cadence} onChange={(v) => setKpi(i, { cadence: v })} inline />
          <EditField label={t.kpiBaseline} gloss={t.kpiBaselineGloss} value={k.baseline} onChange={(v) => setKpi(i, { baseline: v })} inline />
          <EditField label={t.kpiTargets} gloss={t.kpiTargetsGloss} value={k.targets} onChange={(v) => setKpi(i, { targets: v })} inline />
        </div>
      ))}
      <button type="button" onClick={addKpi} className={styles.addBtn}>{t.addKpi}</button>

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
            {doc.kpis.map((k, i) => (
              <tr key={i}>
                <td>{k.name || "—"}</td>
                <td>{k.owner || "—"}</td>
                <td>{k.baseline || "—"}</td>
                <td>{k.targets || "—"}</td>
                <td>{k.cadence || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </article>
  );
}

function EditField({
  label, gloss, hint, value, onChange, inline,
}: {
  label: string; gloss?: string; hint?: string;
  value: string; onChange: (v: string) => void; inline?: boolean;
}) {
  return (
    <div className={inline ? styles.fieldInline : styles.field}>
      <strong>
        {label}
        {gloss && <span className={styles.gloss}> / {gloss}</span>}
      </strong>
      {hint && <span className={styles.hint}> — {hint}</span>}
      {": "}
      <Editable value={value} onChange={onChange} className={inline ? styles.valueInline : styles.value} />
    </div>
  );
}
