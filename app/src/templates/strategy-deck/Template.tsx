"use client";

import { type CSSProperties } from "react";
import { strings } from "@/lib/i18n";
import { useAppStore } from "@/lib/app-store";
import { useStrategyDeckStore } from "@/lib/strategy-deck-store";
import { FONT_CSS } from "@/lib/formatting";
import { Editable } from "@/components/Editable";
import styles from "../kpis/Template.module.css";

export function StrategyDeckTemplate() {
  const lang = useAppStore((s) => s.lang);
  const fmt = useAppStore((s) => s.formatting);
  const t = strings[lang];
  const td = t.deck;
  const doc = useStrategyDeckStore((s) => s.doc);
  const st = useStrategyDeckStore();

  const tableClass = styles[`table_${fmt.tableStyle}` as keyof typeof styles] ?? "";
  const docStyle = {
    "--doc-font-body": FONT_CSS[fmt.fontFamily],
    "--doc-font-display": FONT_CSS[fmt.fontFamily],
    "--doc-accent": fmt.headingColor,
    fontSize: `${fmt.fontSize}pt`,
  } as CSSProperties;

  return (
    <article className={`${styles.doc} ${tableClass}`} lang={lang} dir={t.dir} style={docStyle}>
      <h1 className={styles.h1}>{td.docTitle}</h1>

      <EditField label={td.company} value={doc.company} onChange={(v) => st.setField("company", v)} />
      <EditField label={td.horizon} value={doc.horizon} onChange={(v) => st.setField("horizon", v)} />
      <EditField label={td.planTitle} value={doc.planTitle} onChange={(v) => st.setField("planTitle", v)} />
      <EditField label={td.headlineTarget} value={doc.headlineTarget} onChange={(v) => st.setField("headlineTarget", v)} />
      <EditField label={td.date} value={doc.date} onChange={(v) => st.setField("date", v)} />

      <h2 className={styles.h2}>{td.slidesHeading}</h2>
      <p className={styles.guidance}>{td.slidesGuidance}</p>

      {doc.slides.map((s, si) => (
        <div key={si} className={styles.kpiBlock}>
          <div className={styles.kpiBlockHeader}>
            <div className={styles.kpiIndex}>{td.slideLabel(si)}</div>
            {doc.slides.length > 1 && <button type="button" onClick={() => st.removeSlide(si)} className={styles.removeBtn}>×</button>}
          </div>
          <EditField label={td.slideTitle} value={s.title} onChange={(v) => st.setSlide(si, { title: v })} inline />
          <div className={styles.fieldInline}>
            <strong>{td.bullets}:</strong>
            <ul style={{ margin: "0.4rem 0 0", paddingInlineStart: "1.2rem" }}>
              {s.bullets.map((b, bi) => (
                <li key={bi} style={{ marginBottom: "0.25rem" }}>
                  <Editable value={b} onChange={(v) => st.setBullet(si, bi, v)} />
                  {s.bullets.length > 1 && <button type="button" onClick={() => st.removeBullet(si, bi)} className={styles.removeBtn}>×</button>}
                </li>
              ))}
            </ul>
            <button type="button" onClick={() => st.addBullet(si)} className={styles.addBtn}>{td.addBullet}</button>
          </div>
        </div>
      ))}
      <button type="button" onClick={st.addSlide} className={styles.addBtn}>{td.addSlide}</button>
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
