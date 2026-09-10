import { TemplateProps } from "./types";
import AdditionalSections from "./AdditionalSections";

export default function MinimalTemplate({ resume, accent = "#2255D8", density = "comfortable" }: TemplateProps) {
  const { contact, summary, experience, education, skills } = resume || {};
  const tight = density === "compact";

  return (
    <div
      id="resume-print-area"
      className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper"
      style={{ minHeight: "11in", padding: tight ? "0.6in 0.7in" : "0.85in" }}
    >
      <header className="text-center">
        {resume.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resume.photo}
            alt=""
            className="mx-auto mb-3 h-20 w-20 rounded-full object-cover"
            style={{ border: `2px solid ${accent}` }}
          />
        )}
        <h1 className="font-body text-3xl font-semibold tracking-tight text-ink">
          {contact?.name || "Your Name"}
        </h1>
        {contact?.title && <p className="mt-1 text-sm text-ink-soft">{contact.title}</p>}
        <p className="mt-2 text-xs text-ink-faint">
          {[contact?.email, contact?.phone, contact?.location].filter(Boolean).join("   ")}
        </p>
        <div className="mx-auto mt-4 h-px w-16" style={{ backgroundColor: accent }} />
      </header>

      {summary && (
        <section className={tight ? "mt-4 text-center" : "mt-6 text-center"}>
          <p className="mx-auto max-w-lg text-[14px] leading-relaxed text-ink-soft">{summary}</p>
        </section>
      )}

      {!!experience?.length && (
        <section className={tight ? "mt-6" : "mt-9"}>
          <p
            className="text-center text-[11px] font-semibold tracking-[0.2em]"
            style={{ color: accent }}
          >
            EXPERIENCE
          </p>
          <div className={tight ? "mt-3 space-y-3" : "mt-4 space-y-5"}>
            {experience.map((exp, i) => (
              <div key={i} className="text-center">
                <p className="text-[14px] font-medium text-ink">
                  {exp.role} <span className="text-ink-faint">·</span> {exp.company}
                </p>
                <p className="text-[11px] text-ink-faint">
                  {exp.startDate} – {exp.endDate}
                </p>
                {!!exp.bullets?.length && (
                  <ul className="mx-auto mt-1.5 max-w-md space-y-1 text-[13px] leading-relaxed text-ink-soft">
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
        <section className={tight ? "mt-6" : "mt-9"}>
          <p
            className="text-center text-[11px] font-semibold tracking-[0.2em]"
            style={{ color: accent }}
          >
            EDUCATION
          </p>
          <div className={tight ? "mt-3 space-y-1" : "mt-4 space-y-1.5"}>
            {education.map((ed, i) => (
              <p key={i} className="text-center text-[13px] text-ink-soft">
                {ed.degree} {ed.field} — {ed.school} ({ed.endDate})
              </p>
            ))}
          </div>
        </section>
      )}

      {!!skills?.length && (
        <section className={tight ? "mt-6" : "mt-9"}>
          <p
            className="text-center text-[11px] font-semibold tracking-[0.2em]"
            style={{ color: accent }}
          >
            SKILLS
          </p>
          <p className="mx-auto mt-3 max-w-lg text-center text-[13px] leading-relaxed text-ink-soft">
            {skills.map((g) => (g.items || []).join(", ")).join("   ·   ")}
          </p>
        </section>
      )}

      <AdditionalSections resume={resume} accent={accent} density={density} />
    </div>
  );
}
