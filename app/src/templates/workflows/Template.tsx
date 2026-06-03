"use client";

import { type CSSProperties } from "react";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { useWorkflowStore } from "@/lib/workflow-store";
import { FONT_CSS } from "@/lib/formatting";
import { Editable } from "@/components/Editable";
import styles from "../kpis/Template.module.css";

export function WorkflowTemplate() {
  const lang = useAppStore((s) => s.lang);
  const fmt = useAppStore((s) => s.formatting);
  const t = strings[lang];
  const tw = t.workflow;
  const doc = useWorkflowStore((s) => s.doc);
  const st = useWorkflowStore();

  const tableClass = styles[`table_${fmt.tableStyle}` as keyof typeof styles] ?? "";
  const docStyle = {
    "--doc-font-body": FONT_CSS[fmt.fontFamily],
    "--doc-font-display": FONT_CSS[fmt.fontFamily],
    "--doc-accent": fmt.headingColor,
    fontSize: `${fmt.fontSize}pt`,
  } as CSSProperties;

  return (
    <article className={`${styles.doc} ${tableClass}`} lang={lang} dir={t.dir} style={docStyle}>
      <h1 className={styles.h1}>{tw.docTitle}</h1>

      <EditField label={tw.name} value={doc.name} onChange={(v) => st.setField("name", v)} />
      <EditField label={tw.owner} hint={tw.ownerHint} value={doc.owner} onChange={(v) => st.setField("owner", v)} />
      <EditField label={tw.purpose} value={doc.purpose} onChange={(v) => st.setField("purpose", v)} />
      <EditField label={tw.scope} hint={tw.scopeHint} value={doc.scope} onChange={(v) => st.setField("scope", v)} />
      <EditField label={tw.trigger} hint={tw.triggerHint} value={doc.trigger} onChange={(v) => st.setField("trigger", v)} />
      <EditField label={tw.frequency} value={doc.frequency} onChange={(v) => st.setField("frequency", v)} />
      <EditField label={tw.version} value={doc.version} onChange={(v) => st.setField("version", v)} />

      <h2 className={styles.h2}>{tw.ioHeading}</h2>
      <div className={styles.fieldInline}><strong>{tw.inputs}:</strong></div>
      <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {doc.inputs.map((x, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={x} onChange={(v) => st.setInput(i, v)} />
            {doc.inputs.length > 1 && <button type="button" onClick={() => st.removeInput(i)} className={styles.removeBtn}>×</button>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={st.addInput} className={styles.addBtn}>{tw.addInput}</button>

      <div className={styles.fieldInline} style={{ marginTop: "0.75rem" }}><strong>{tw.outputs}:</strong></div>
      <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
        {doc.outputs.map((x, i) => (
          <li key={i} style={{ marginBottom: "0.25rem" }}>
            <Editable value={x} onChange={(v) => st.setOutput(i, v)} />
            {doc.outputs.length > 1 && <button type="button" onClick={() => st.removeOutput(i)} className={styles.removeBtn}>×</button>}
          </li>
        ))}
      </ul>
      <button type="button" onClick={st.addOutput} className={styles.addBtn}>{tw.addOutput}</button>

      <h2 className={styles.h2}>{tw.stepsHeading}</h2>
      <p className={styles.guidance}>{tw.stepsGuidance}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{tw.colStep}</th><th>{tw.colWhat}</th><th>{tw.colWho}</th><th>{tw.colOutput}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.steps.map((r, i) => (
              <tr key={i}>
                <td style={{ textAlign: "center" }}>{i + 1}</td>
                <td><Editable value={r.what} onChange={(v) => st.setStep(i, { what: v })} /></td>
                <td><Editable value={r.who} onChange={(v) => st.setStep(i, { who: v })} /></td>
                <td><Editable value={r.output} onChange={(v) => st.setStep(i, { output: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.steps.length > 1 && <button type="button" onClick={() => st.removeStep(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addStep} className={styles.addBtn}>{tw.addStep}</button>

      <h2 className={styles.h2}>{tw.raciHeading}</h2>
      <p className={styles.guidance}>{tw.raciGuidance}</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>{tw.colActivity}</th><th>{tw.colR}</th><th>{tw.colA}</th><th>{tw.colC}</th><th>{tw.colI}</th>
              <th className={styles.tableCtrlCol}></th>
            </tr>
          </thead>
          <tbody>
            {doc.raci.map((r, i) => (
              <tr key={i}>
                <td><Editable value={r.activity} onChange={(v) => st.setRaci(i, { activity: v })} /></td>
                <td><Editable value={r.r} onChange={(v) => st.setRaci(i, { r: v })} /></td>
                <td><Editable value={r.a} onChange={(v) => st.setRaci(i, { a: v })} /></td>
                <td><Editable value={r.c} onChange={(v) => st.setRaci(i, { c: v })} /></td>
                <td><Editable value={r.i} onChange={(v) => st.setRaci(i, { i: v })} /></td>
                <td className={styles.tableCtrlCol}>
                  {doc.raci.length > 1 && <button type="button" onClick={() => st.removeRaci(i)} className={styles.removeBtn}>×</button>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <button type="button" onClick={st.addRaci} className={styles.addBtn}>{tw.addRaci}</button>

      <h2 className={styles.h2}>{tw.controlsHeading}</h2>
      <p className={styles.guidance}>{tw.controlsGuidance}</p>
      <Editable
        value={doc.controls}
        onChange={(v) => st.setField("controls", v)}
        block
        className={styles.value}
        style={{ whiteSpace: "pre-wrap", borderBottom: 0, minHeight: "3em" }}
      />
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
