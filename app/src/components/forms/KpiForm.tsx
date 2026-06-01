"use client";

import { useKpiStore } from "@/lib/store";
import { strings } from "@/lib/i18n";

export function KpiForm() {
  const doc = useKpiStore((s) => s.doc);
  const lang = useKpiStore((s) => s.lang);
  const {
    setField,
    setKpi,
    addKpi,
    removeKpi,
    setScorecardRow,
    addScorecardRow,
    removeScorecardRow,
    loadSample,
    reset,
  } = useKpiStore();

  const t = strings[lang];

  return (
    <div className="space-y-5 text-sm" dir={t.dir}>
      <div className="flex items-center gap-2 pb-3 border-b border-[color:var(--app-border)]">
        <button
          type="button"
          onClick={loadSample}
          className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
        >
          {t.loadSample}
        </button>
        <button
          type="button"
          onClick={reset}
          className="text-xs px-2 py-1 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
        >
          {t.reset}
        </button>
      </div>

      <FormSection title={t.formHeaderTitle}>
        <TextInput
          label={t.company}
          gloss={t.companyGloss}
          value={doc.company}
          onChange={(v) => setField("company", v)}
        />
        <TextInput
          label={t.level}
          gloss={t.levelGloss}
          value={doc.level}
          onChange={(v) => setField("level", v)}
          placeholder={t.levelHint}
        />
        <TextInput
          label={t.date}
          gloss={t.dateGloss}
          value={doc.date}
          onChange={(v) => setField("date", v)}
        />
      </FormSection>

      <FormSection
        title={t.formKpiTitle}
        action={
          <button
            type="button"
            onClick={addKpi}
            className="text-xs px-2 py-0.5 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
          >
            {t.addKpi}
          </button>
        }
      >
        {doc.kpis.map((k, i) => (
          <div
            key={i}
            className="rounded border border-[color:var(--app-border)] p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[color:var(--app-muted)]">
                {t.kpiLabel(i)}
              </span>
              {doc.kpis.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeKpi(i)}
                  className="text-xs text-red-700 hover:underline"
                >
                  {t.remove}
                </button>
              )}
            </div>
            <TextInput label={t.kpiName} gloss={t.kpiNameGloss} value={k.name} onChange={(v) => setKpi(i, { name: v })} />
            <TextArea label={t.kpiDef} gloss={t.kpiDefGloss} value={k.definition} onChange={(v) => setKpi(i, { definition: v })} />
            <TextArea label={t.kpiFormula} gloss={t.kpiFormulaGloss} value={k.formula} onChange={(v) => setKpi(i, { formula: v })} />
            <TextInput label={t.kpiOwner} gloss={t.kpiOwnerGloss} value={k.owner} onChange={(v) => setKpi(i, { owner: v })} />
            <TextInput label={t.kpiDataSource} gloss={t.kpiDataSourceGloss} value={k.dataSource} onChange={(v) => setKpi(i, { dataSource: v })} />
            <TextInput label={t.kpiCadence} gloss={t.kpiCadenceGloss} value={k.cadence} onChange={(v) => setKpi(i, { cadence: v })} />
            <TextInput label={t.kpiBaseline} gloss={t.kpiBaselineGloss} value={k.baseline} onChange={(v) => setKpi(i, { baseline: v })} />
            <TextInput label={t.kpiTargets} gloss={t.kpiTargetsGloss} value={k.targets} onChange={(v) => setKpi(i, { targets: v })} />
          </div>
        ))}
      </FormSection>

      <FormSection
        title={t.formScorecardTitle}
        action={
          <button
            type="button"
            onClick={addScorecardRow}
            className="text-xs px-2 py-0.5 rounded border border-[color:var(--app-border)] hover:bg-neutral-50"
          >
            {t.addRow}
          </button>
        }
      >
        {doc.scorecard.map((r, i) => (
          <div
            key={i}
            className="rounded border border-[color:var(--app-border)] p-3 space-y-2"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[color:var(--app-muted)]">
                {t.scorecardRowLabel(i)}
              </span>
              {doc.scorecard.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeScorecardRow(i)}
                  className="text-xs text-red-700 hover:underline"
                >
                  {t.remove}
                </button>
              )}
            </div>
            <TextInput label={t.colKpi} gloss="" value={r.kpi} onChange={(v) => setScorecardRow(i, { kpi: v })} />
            <div className="grid grid-cols-2 gap-2">
              <TextInput label={t.colOwner} gloss="" value={r.owner} onChange={(v) => setScorecardRow(i, { owner: v })} />
              <TextInput label={t.colBaseline} gloss="" value={r.baseline} onChange={(v) => setScorecardRow(i, { baseline: v })} />
              <TextInput label={t.colTarget} gloss="" value={r.target} onChange={(v) => setScorecardRow(i, { target: v })} />
              <TextInput label={t.colCadence} gloss="" value={r.cadence} onChange={(v) => setScorecardRow(i, { cadence: v })} />
            </div>
          </div>
        ))}
      </FormSection>
    </div>
  );
}

function FormSection({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <fieldset className="space-y-2.5">
      <div className="flex items-center justify-between">
        <legend className="font-display text-sm font-bold text-[color:var(--app-fg)]">
          {title}
        </legend>
        {action}
      </div>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function Label({ label, gloss }: { label: string; gloss: string }) {
  return (
    <span className="block text-xs font-bold mb-1">
      {label}
      {gloss && (
        <span className="font-normal text-[color:var(--app-muted)]"> / {gloss}</span>
      )}
    </span>
  );
}

function TextInput({
  label,
  gloss,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  gloss: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label label={label} gloss={gloss} />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="block w-full px-2 py-1 text-sm bg-white border border-[color:var(--app-border)] rounded focus:outline-none focus:border-[color:var(--app-accent)]"
      />
    </label>
  );
}

function TextArea({
  label,
  gloss,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  gloss: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <Label label={label} gloss={gloss} />
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={2}
        className="block w-full px-2 py-1 text-sm bg-white border border-[color:var(--app-border)] rounded resize-y focus:outline-none focus:border-[color:var(--app-accent)]"
      />
    </label>
  );
}
