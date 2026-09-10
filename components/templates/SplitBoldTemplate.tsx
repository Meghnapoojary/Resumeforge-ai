import { TemplateProps } from "./types";
import AdditionalSections from "./AdditionalSections";

export default function SplitBoldTemplate({ resume, accent = "#2255D8", density = "comfortable" }: TemplateProps) {
  const { contact, summary, experience, education, skills } = resume || {};
  const tight = density === "compact";

  return (
    <div
      id="resume-print-area"
      className="mx-auto grid w-full max-w-[8.5in] grid-cols-[2.3in_1fr] bg-white text-ink shadow-paper"
      style={{ minHeight: "11in" }}
    >
      {/* Tinted left block */}
      <aside
        style={{
          backgroundColor: `${accent}14`,
          borderRight: `4px solid ${accent}`,
          padding: tight ? "0.55in 0.35in" : "0.7in 0.4in",
        }}
      >
        {resume.photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resume.photo}
            alt=""
            className="h-24 w-24 rounded-2xl object-cover"
            style={{ border: `3px solid ${accent}` }}
          />
        )}
        <h1 className="mt-4 font-display text-2xl font-semibold leading-tight text-ink">
          {contact?.name || "Your Name"}
        </h1>
        {contact?.title && (
          <p className="mt-1 text-sm font-medium" style={{ color: accent }}>
            {contact.title}
          </p>
        )}

        <div className="mt-5 space-y-1 text-[11px] text-ink-soft">
          {contact?.email && <p className="break-all">{contact.email}</p>}
          {contact?.phone && <p>{contact.phone}</p>}
          {contact?.location && <p>{contact.location}</p>}
        </div>

        {!!skills?.length && (
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink">Skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.flatMap((g) => g.items || []).map((item, i) => (
                <span
                  key={i}
                  className="rounded-sm bg-white px-2 py-0.5 text-[10px] text-ink-soft"
                  style={{ border: `1px solid ${accent}66` }}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {!!education?.length && (
          <div className="mt-6">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-ink">Education</p>
            <div className="mt-2 space-y-2">
              {education.map((ed, i) => (
                <div key={i}>
                  <p className="text-[11px] font-semibold text-ink">
                    {ed.degree} {ed.field}
                  </p>
                  <p className="text-[11px] text-ink-soft">{ed.school}</p>
                  <p className="text-[10px] text-ink-faint">
                    {ed.startDate} – {ed.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </aside>

      {/* Main content */}
      <main style={{ padding: tight ? "0.55in 0.45in" : "0.7in 0.55in" }}>
        {summary && (
          <section>
            <p className="text-[15px] leading-relaxed text-ink-soft">{summary}</p>
          </section>
        )}

        {!!experience?.length && (
          <section className={tight ? "mt-5" : "mt-7"}>
            <h2
              className="inline-block text-xs font-semibold uppercase tracking-widest"
              style={{ color: accent, borderBottom: `2px solid ${accent}`, paddingBottom: 2 }}
            >
              Experience
            </h2>
            <div className={tight ? "mt-3 space-y-3" : "mt-4 space-y-5"}>
              {experience.map((exp, i) => (
                <div key={i}>
                  <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                    <p className="text-[14px] font-semibold text-ink">
                      {exp.role} <span className="font-normal text-ink-soft">— {exp.company}</span>
                    </p>
                    <p className="text-[11px] text-ink-faint whitespace-nowrap">
                      {exp.startDate} – {exp.endDate}
                    </p>
                  </div>
                  {!!exp.bullets?.length && (
                    <ul className="mt-1.5 list-disc space-y-1 pl-4 text-[13px] leading-relaxed text-ink-soft">
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
