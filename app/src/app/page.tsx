import { Shell } from "@/components/Shell";

export default function HomePage() {
  return (
    <Shell
      artifactTitle="Integrate AI — Phase 1 scaffold"
      form={<FormPlaceholder />}
      preview={<PreviewPlaceholder />}
    />
  );
}

function FormPlaceholder() {
  return (
    <div className="space-y-3 text-sm">
      <p className="text-[color:var(--app-muted)]">
        כאן יופיע הטופס לפי הסכמה של התוצר הנבחר.
      </p>
      <p className="text-[color:var(--app-muted)]">
        Phase 2 onwards: a Zod-driven form panel.
      </p>
    </div>
  );
}

function PreviewPlaceholder() {
  return (
    <article
      className="space-y-4"
      style={{
        background: "var(--surface, #ffffff)",
        color: "var(--fg, #1a1a1a)",
        fontFamily: "var(--font-body, inherit)",
        padding: "1rem",
        borderRadius: "var(--radius, 0)",
      }}
    >
      <h2 style={{ fontFamily: "var(--font-display, inherit)", fontSize: "1.5rem" }}>
        שלום
      </h2>
      <p>
        זוהי תצוגה מקדימה של מסמך הדוגמה. החלפת סגנון העיצוב בכותרת מחליפה רק את
        טוקני העיצוב של המסמך — מעטפת היישום נשארת ניטרלית.
      </p>
      <p style={{ color: "var(--muted, #6b6b6b)" }}>
        Token preview: <code>--accent</code> ={" "}
        <span
          style={{
            display: "inline-block",
            width: "1.5em",
            height: "1em",
            verticalAlign: "middle",
            background: "var(--accent, #1a1a1a)",
            borderRadius: 2,
          }}
        />
      </p>
    </article>
  );
}
