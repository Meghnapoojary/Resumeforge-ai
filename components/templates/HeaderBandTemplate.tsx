import { TemplateProps } from "./types";
import AdditionalSections from "./AdditionalSections";

export default function HeaderBandTemplate({ resume, accent = "#2255D8", density = "comfortable" }: TemplateProps) {
  const { contact, summary, experience, education, skills } = resume || {};
  const tight = density === "compact";

  return (
    <div
      id="resume-print-area"
      className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper"
      style={{ minHeight: "11in" }}
    >
      {/* Header band */}
      <header
        className="flex items-center justify-between gap-4 text-white"
        style={{ backgroundColor: accent, padding: tight ? "0.5in 0.55in" : "0.6in 0.65in" }}
      >
        <div>
          <h1 className="font-display text-3xl font-semibold tracking-tight">
            {contact?.name || "Your Name"}
          </h1>
          {contact?.title && <p className="mt-1 text-sm font-medium text-white/85">{contact.title}</p>}
          <p className="mt-2 text-xs text-white/75">
            {[contact?.email, contact?.phone, contact?.location].filter(Boolean).join("   ·   ")}
          </p>
        </div>
        {resume.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resume.photo}
            alt=""
            className="h-20 w-20 shrink-0 rounded-full object-cover"
            style={{ border: "3px solid rgba(255,255,255,0.7)" }}
          />
        )}
      </header>

      {/* Body: two columns */}
      <div
        className="grid grid-cols-[1fr_1.6fr] gap-8"
        style={{ padding: tight ? "0.5in 0.55in" : "0.6in 0.65in" }}
      >
        {/* Side column */}
        <div className="space-y-6">
          {summary && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
                Profile
              </p>
              <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{summary}</p>
            </section>
          )}

          {!!skills?.length && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
                Skills
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {skills.flatMap((g) => g.items || []).map((item, i) => (
                  <span
                    key={i}
                    className="rounded-full border px-2.5 py-0.5 text-[11px] text-ink-soft"
                    style={{ borderColor: accent }}
                  >
                    {item}
                  </span>
                ))}
              </div>
            </section>
          )}

          {!!education?.length && (
            <section>
              <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
                Education
              </p>
              <div className="mt-2 space-y-2">
                {education.map((ed, i) => (
                  <div key={i}>
                    <p className="text-[13px] font-medium text-ink">
                      {ed.degree} {ed.field}
                    </p>
                    <p className="text-[12px] text-ink-soft">{ed.school}</p>
                    <p className="text-[11px] text-ink-faint">
                      {ed.startDate} – {ed.endDate}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Main column */}
        {!!experience?.length && (
          <section>
            <p className="text-[11px] font-semibold uppercase tracking-widest" style={{ color: accent }}>
              Experience
            </p>
            <div className={tight ? "mt-2 space-y-3" : "mt-3 space-y-4"}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-[14px] font-semibold text-ink">{exp.role}</p>
                    <p className="text-[11px] text-ink-faint whitespace-nowrap">
                      {exp.startDate} – {exp.endDate}
                    </p>
                  </div>
                  <p className="text-[13px] text-ink-soft">{exp.company}</p>
                  {!!exp.bullets?.length && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px] leading-relaxed text-ink-soft">
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

        <AdditionalSections resume={resume} accent={accent} density={density} />
      </div>
    </div>
  );
}
