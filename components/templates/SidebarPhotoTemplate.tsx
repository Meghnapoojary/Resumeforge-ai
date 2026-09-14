import { TemplateProps } from "./types";
import AdditionalSections from "./AdditionalSections";

export default function SidebarPhotoTemplate({ resume, accent = "#2255D8", density = "comfortable" }: TemplateProps) {
  const { contact, summary, experience, education, skills } = resume || {};
  const tight = density === "compact";

  return (
    <div
      id="resume-print-area"
      className="mx-auto grid w-full max-w-[8.5in] grid-cols-[2.5in_1fr] bg-white text-ink shadow-paper"
      style={{ minHeight: "11in" }}
    >
      {/* Colored sidebar */}
      <aside
        className="relative overflow-hidden text-white"
        style={{ backgroundColor: accent, padding: tight ? "0.5in 0.35in" : "0.6in 0.4in", printColorAdjust: "exact", WebkitPrintColorAdjust: "exact" as any }}
      >
        {/* SVG fallback keeps the colored sidebar visible in browser PDF/print even when
            the browser's background-graphics preference is disabled. */}
        <svg
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1 1"
          preserveAspectRatio="none"
          focusable="false"
        >
          <rect width="1" height="1" fill={accent} />
        </svg>
        <div className="relative z-[1]">
        {resume.photo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={resume.photo}
            alt=""
            className="mx-auto h-24 w-24 rounded-full object-cover"
            style={{ border: "3px solid rgba(255,255,255,0.6)" }}
          />
        ) : null}

        <h1 className="mt-4 text-center font-display text-xl font-semibold leading-tight">
          {contact?.name || "Your Name"}
        </h1>
        {contact?.title && <p className="mt-1 text-center text-xs text-white/80">{contact.title}</p>}

        <div className="mt-6 space-y-1.5 border-t border-white/25 pt-4 text-[11px] text-white/85">
          {contact?.email && <p className="break-all">{contact.email}</p>}
          {contact?.phone && <p>{contact.phone}</p>}
          {contact?.location && <p>{contact.location}</p>}
        </div>

        {!!skills?.length && (
          <div className="mt-6 border-t border-white/25 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Skills</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {skills.flatMap((g) => g.items || []).map((item, i) => (
                <span key={i} className="rounded-full bg-white/15 px-2 py-0.5 text-[10px] text-white">
                  {item}
                </span>
              ))}
            </div>
          </div>
        )}

        {!!education?.length && (
          <div className="mt-6 border-t border-white/25 pt-4">
            <p className="text-[11px] font-semibold uppercase tracking-widest text-white/70">Education</p>
            <div className="mt-2 space-y-2">
              {education.map((ed, i) => (
                <div key={i}>
                  <p className="text-[11px] font-semibold text-white">
                    {ed.degree} {ed.field}
                  </p>
                  <p className="text-[11px] text-white/75">{ed.school}</p>
                  <p className="text-[10px] text-white/60">
                    {ed.startDate} – {ed.endDate}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
        </div>
      </aside>

      {/* Main content */}
      <main style={{ padding: tight ? "0.5in 0.4in" : "0.6in 0.5in" }}>
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
