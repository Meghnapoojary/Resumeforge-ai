import { TemplateProps } from "./types";
import AdditionalSections from "./AdditionalSections";

export default function ModernTemplate({ resume, accent = "#2255D8", density = "comfortable" }: TemplateProps) {
  const { contact, summary, experience, education, skills } = resume || {};
  const tight = density === "compact";

  return (
    <div
      id="resume-print-area"
      className="mx-auto grid w-full max-w-[8.5in] grid-cols-[2.4in_1fr] bg-white text-ink shadow-paper"
      style={{ minHeight: "11in" }}
    >
      {/* Sidebar */}
      <aside className="text-white" style={{ backgroundColor: "#0E1B33", padding: tight ? "0.5in 0.35in" : "0.65in 0.4in" }}>
        {resume.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resume.photo}
            alt=""
            className="mb-4 h-20 w-20 rounded-full object-cover"
            style={{ border: `2px solid ${accent}` }}
          />
        )}
        <h1 className="font-display text-2xl font-semibold leading-tight">
          {contact?.name || "Your Name"}
        </h1>
        {contact?.title && (
          <p className="mt-1 text-sm font-medium" style={{ color: accent, filter: "brightness(1.6)" }}>
            {contact.title}
          </p>
        )}

        <div className="mt-6 space-y-1 text-xs text-white/70">
          {contact?.email && <p>{contact.email}</p>}
          {contact?.phone && <p>{contact.phone}</p>}
          {contact?.location && <p>{contact.location}</p>}
        </div>

        {!!skills?.length && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/60">Skills</h2>
            <div className="mt-3 space-y-3">
              {skills.map((group, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-white/90">{group.category}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/70">
                    {(group.items || []).join(", ")}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {!!education?.length && (
          <div className="mt-8">
            <h2 className="text-xs font-semibold uppercase tracking-widest text-white/60">Education</h2>
            <div className="mt-3 space-y-3">
              {education.map((ed, i) => (
                <div key={i}>
                  <p className="text-xs font-semibold text-white/90">
                    {ed.degree} {ed.field}
                  </p>
                  <p className="text-xs text-white/70">{ed.school}</p>
                  <p className="text-[11px] text-white/50">
                    {ed.startDate} – {ed.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ padding: tight ? "0.5in 0.4in" : "0.65in 0.5in" }}>
        {summary && (
          <section>
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
              Profile
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-ink-soft">{summary}</p>
          </section>
        )}

        {!!experience?.length && (
          <section className={tight ? "mt-4" : "mt-6"}>
            <h2 className="text-xs font-semibold uppercase tracking-widest" style={{ color: accent }}>
              Experience
            </h2>
            <div className={tight ? "mt-2 space-y-3" : "mt-3 space-y-4"}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <p className="text-[14px] font-semibold text-ink">{exp.role}</p>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-[13px] text-ink-soft">{exp.company}</p>
                    <p className="text-[11px] text-ink-faint whitespace-nowrap">
                      {exp.startDate} – {exp.endDate}
                    </p>
                  </div>
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
      </main>
    </div>
  );
}
