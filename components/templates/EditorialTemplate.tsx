import { TemplateProps } from "./types";
import AdditionalSections from "./AdditionalSections";

export default function EditorialTemplate({ resume, accent = "#2255D8", density = "comfortable" }: TemplateProps) {
  const { contact, summary, experience, education, skills } = resume || {};
  const tight = density === "compact";

  return (
    <div
      id="resume-print-area"
      className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper"
      style={{ minHeight: "11in", padding: tight ? "0.5in" : "0.65in" }}
    >
      <header className="flex items-start justify-between gap-4 border-b-2 pb-4" style={{ borderColor: "#0E1B33" }}>
        <div>
          <h1 className="font-display text-4xl font-semibold tracking-tight">
            {contact?.name || "Your Name"}
          </h1>
          {contact?.title && (
            <p className="mt-1 font-display text-lg" style={{ color: accent }}>
              {contact.title}
            </p>
          )}
          <p className="mt-2 text-sm text-ink-soft">
            {[contact?.email, contact?.phone, contact?.location].filter(Boolean).join("  ·  ")}
          </p>
        </div>
        {resume.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resume.photo}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover"
            style={{ border: `2px solid ${accent}` }}
          />
        )}
      </header>

      {summary && (
        <section className={tight ? "mt-3" : "mt-5"}>
          <p className="text-[15px] leading-relaxed text-ink-soft">{summary}</p>
        </section>
      )}

      {!!experience?.length && (
        <section className={tight ? "mt-4" : "mt-6"}>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink border-b border-rule pb-1">
            Experience
          </h2>
          <div className={tight ? "mt-2 space-y-2.5" : "mt-3 space-y-4"}>
            {experience.map((exp, i) => (
              <div key={i}>
                <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                  <p className="font-semibold text-[15px]">
                    {exp.role} <span className="text-ink-soft font-normal">— {exp.company}</span>
                  </p>
                  <p className="text-xs text-ink-faint whitespace-nowrap">
                    {exp.startDate} – {exp.endDate}
                    {exp.location ? `  ·  ${exp.location}` : ""}
                  </p>
                </div>
                {!!exp.bullets?.length && (
                  <ul className="mt-1.5 list-disc space-y-1 pl-5 text-[14px] leading-relaxed text-ink-soft">
                    {exp.bullets.map((b, j) => (
                      <li key={j}>{b}</li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {!!education?.length && (
        <section className={tight ? "mt-4" : "mt-6"}>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink border-b border-rule pb-1">
            Education
          </h2>
          <div className={tight ? "mt-2 space-y-1.5" : "mt-3 space-y-2"}>
            {education.map((ed, i) => (
              <div key={i} className="flex flex-wrap items-baseline justify-between gap-x-3">
                <p className="font-semibold text-[15px]">
                  {ed.degree} {ed.field ? `in ${ed.field}` : ""}{" "}
                  <span className="text-ink-soft font-normal">— {ed.school}</span>
                </p>
                <p className="text-xs text-ink-faint whitespace-nowrap">
                  {ed.startDate} – {ed.endDate}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!skills?.length && (
        <section className={tight ? "mt-4" : "mt-6"}>
          <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink border-b border-rule pb-1">
            Skills
          </h2>
          <div className={tight ? "mt-2 space-y-1" : "mt-3 space-y-1.5"}>
            {skills.map((group, i) => (
              <p key={i} className="text-[14px] text-ink-soft">
                <span className="font-semibold text-ink">{group.category}: </span>
                {(group.items || []).join(", ")}
              </p>
            ))}
          </div>
        </section>
      )}

      <AdditionalSections resume={resume} accent={accent} density={density} />
    </div>
  );
}
