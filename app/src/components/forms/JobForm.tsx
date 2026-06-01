"use client";

import { useJobStore } from "@/lib/job-store";
import { useAppStore } from "@/lib/app-store";
import { strings } from "@/lib/i18n";
import type { JobDocument } from "@/lib/schemas/job-description";

export function JobForm() {
  const doc = useJobStore((s) => s.doc);
  const lang = useAppStore((s) => s.lang);
  const t = strings[lang].job;
  const tRoot = strings[lang];

  const {
    setField,
    setArea,
    addArea,
    removeArea,
    setDuty,
    addDuty,
    removeDuty,
    setInterface,
    addInterface,
    removeInterface,
    toggleSection,
    loadSample,
    reset,
  } = useJobStore();

  return (
    <div className="space-y-5 text-sm" dir={tRoot.dir}>
      <div className="flex items-center gap-2 pb-3 border-b border-[color:var(--app-border)]">
        <button type="button" onClick={loadSample} className="btn-secondary">
          {tRoot.loadSample}
        </button>
        <button type="button" onClick={reset} className="btn-secondary">
          {tRoot.reset}
        </button>
      </div>

      <FormSection title={t.docTitle}>
        <TextInput label={t.title} value={doc.title} onChange={(v) => setField("title", v)} />
        <TextArea
          label={t.positioning}
          value={doc.positioning}
          onChange={(v) => setField("positioning", v)}
          placeholder={t.positioningHint}
        />
        <div className="grid grid-cols-2 gap-2">
          <TextInput label={t.reportsTo} value={doc.reportsTo} onChange={(v) => setField("reportsTo", v)} />
          <TextInput label={t.division} value={doc.division} onChange={(v) => setField("division", v)} />
        </div>
        <TextInput label={t.directReports} value={doc.directReports} onChange={(v) => setField("directReports", v)} />
        <TextInput label={t.date} value={doc.date} onChange={(v) => setField("date", v)} />
      </FormSection>

      <FormSection title={t.purposeHeading}>
        <TextArea label={t.purposeHeading} value={doc.purpose} onChange={(v) => setField("purpose", v)} rows={4} />
      </FormSection>

      <FormSection
        title={t.areasHeading}
        action={
          <button type="button" onClick={addArea} className="btn-tiny">
            {t.addArea}
          </button>
        }
      >
        {doc.areas.map((a, ai) => (
          <div key={ai} className="rounded border border-[color:var(--app-border)] p-3 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-[color:var(--app-muted)]">{t.areaLabel(ai)}</span>
              {doc.areas.length > 1 && (
                <button type="button" onClick={() => removeArea(ai)} className="text-xs text-red-700 hover:underline">
                  {tRoot.remove}
                </button>
              )}
            </div>
            <TextInput label={t.areaName} value={a.name} onChange={(v) => setArea(ai, { name: v })} />
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="block text-xs font-bold">{t.duties}</span>
                <button type="button" onClick={() => addDuty(ai)} className="btn-tiny">
                  {t.addDuty}
                </button>
              </div>
              <div className="space-y-1.5">
                {a.duties.map((d, di) => (
                  <div key={di} className="flex items-start gap-1">
                    <textarea
                      value={d}
                      onChange={(e) => setDuty(ai, di, e.target.value)}
                      rows={2}
                      className="block flex-1 px-2 py-1 text-sm bg-white border border-[color:var(--app-border)] rounded resize-y focus:outline-none focus:border-[color:var(--app-accent)]"
                    />
                    {a.duties.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeDuty(ai, di)}
                        className="text-xs text-red-700 px-1 hover:underline self-center"
                      >
                        ×
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </FormSection>

      <fieldset className="rounded border border-[color:var(--app-border)] p-3 space-y-2">
        <legend className="px-1 text-xs font-bold">{t.optionalSections}</legend>
        {(
          [
            ["interfaces", t.sec_interfaces],
            ["successMetrics", t.sec_successMetrics],
            ["qualifications", t.sec_qualifications],
            ["authority", t.sec_authority],
          ] as [keyof JobDocument["enabled"], string][]
        ).map(([key, label]) => (
          <label key={key} className="flex items-center gap-2 text-xs cursor-pointer">
            <input
              type="checkbox"
              checked={doc.enabled[key]}
              onChange={() => toggleSection(key)}
              className="cursor-pointer"
            />
            <span>{label}</span>
          </label>
        ))}
      </fieldset>

      {doc.enabled.interfaces && (
        <FormSection
          title={t.interfacesHeading}
          action={
            <button type="button" onClick={addInterface} className="btn-tiny">
              {t.addInterface}
            </button>
          }
        >
          {doc.interfaces.map((iface, ii) => (
            <div key={ii} className="rounded border border-[color:var(--app-border)] p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[color:var(--app-muted)]">{ii + 1}</span>
                {doc.interfaces.length > 1 && (
                  <button type="button" onClick={() => removeInterface(ii)} className="text-xs text-red-700 hover:underline">
                    {tRoot.remove}
                  </button>
                )}
              </div>
              <TextInput label={t.colParty} value={iface.party} onChange={(v) => setInterface(ii, { party: v })} />
              <TextInput label={t.colKind} value={iface.kind} onChange={(v) => setInterface(ii, { kind: v })} />
              <TextInput label={t.colPurpose} value={iface.purpose} onChange={(v) => setInterface(ii, { purpose: v })} />
            </div>
          ))}
        </FormSection>
      )}

      {doc.enabled.successMetrics && (
        <FormSection title={t.metricsHeading}>
          <TextArea
            label={t.metricsHeading}
            value={doc.successMetrics}
            onChange={(v) => setField("successMetrics", v)}
            rows={3}
          />
        </FormSection>
      )}

      {doc.enabled.qualifications && (
        <FormSection title={t.qualificationsHeading}>
          <TextArea label={t.required} value={doc.required} onChange={(v) => setField("required", v)} rows={3} />
          <TextArea label={t.advantage} value={doc.advantage} onChange={(v) => setField("advantage", v)} rows={2} />
        </FormSection>
      )}

      {doc.enabled.authority && (
        <FormSection title={t.authorityHeading}>
          <TextArea label={t.decides} value={doc.decides} onChange={(v) => setField("decides", v)} rows={2} />
          <TextArea label={t.recommends} value={doc.recommends} onChange={(v) => setField("recommends", v)} rows={2} />
          <TextArea label={t.escalates} value={doc.escalates} onChange={(v) => setField("escalates", v)} rows={2} />
        </FormSection>
      )}
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
        <legend className="font-display text-sm font-bold">{title}</legend>
        {action}
      </div>
      <div className="space-y-2.5">{children}</div>
    </fieldset>
  );
}

function TextInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold mb-1">{label}</span>
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
  value,
  onChange,
  placeholder,
  rows = 2,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  rows?: number;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-bold mb-1">{label}</span>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className="block w-full px-2 py-1 text-sm bg-white border border-[color:var(--app-border)] rounded resize-y focus:outline-none focus:border-[color:var(--app-accent)]"
      />
    </label>
  );
}
