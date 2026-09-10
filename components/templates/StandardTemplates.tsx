import type { ReactNode } from "react";
import { TemplateProps } from "./types";
import AdditionalSections from "./AdditionalSections";

type Variant = "classic" | "harvard" | "corporate" | "compact" | "elegant" | "chronological" | "ats-classic" | "executive" | "academic" | "clean";

interface StandardTemplateProps extends TemplateProps {
  variant: Variant;
}

const config: Record<Variant, {
  name: string;
  headingClass: string;
  border: boolean;
  headerRule: boolean;
  sidebar: boolean;
  serifName: boolean;
}> = {
  classic: { name: "Classic", headingClass: "tracking-[0.16em]", border: true, headerRule: true, sidebar: false, serifName: true },
  harvard: { name: "Harvard", headingClass: "tracking-[0.08em]", border: false, headerRule: true, sidebar: false, serifName: true },
  corporate: { name: "Corporate", headingClass: "tracking-[0.14em]", border: true, headerRule: false, sidebar: false, serifName: false },
  compact: { name: "Compact", headingClass: "tracking-[0.12em]", border: true, headerRule: true, sidebar: false, serifName: false },
  elegant: { name: "Elegant", headingClass: "tracking-[0.2em]", border: false, headerRule: true, sidebar: false, serifName: true },
  chronological: { name: "Chronological", headingClass: "tracking-[0.1em]", border: true, headerRule: true, sidebar: false, serifName: false },
  "ats-classic": { name: "ATS Classic", headingClass: "tracking-[0.12em]", border: false, headerRule: false, sidebar: false, serifName: false },
  executive: { name: "Executive", headingClass: "tracking-[0.16em]", border: false, headerRule: true, sidebar: false, serifName: true },
  academic: { name: "Academic", headingClass: "tracking-[0.1em]", border: false, headerRule: false, sidebar: false, serifName: true },
  clean: { name: "Clean", headingClass: "tracking-[0.08em]", border: false, headerRule: true, sidebar: false, serifName: false },
};

function SectionTitle({ children, accent, variant }: { children: ReactNode; accent: string; variant: Variant }) {
  const c = config[variant];
  return (
    <h2
      className={`text-[11px] font-bold uppercase ${c.headingClass} ${c.border ? "border-b pb-1" : ""}`}
      style={{ color: accent, borderColor: `${accent}55` }}
    >
      {children}
    </h2>
  );
}

export default function StandardTemplate({ resume, accent = "#2255D8", density = "comfortable", variant }: StandardTemplateProps) {
  const c = config[variant];
  const tight = density === "compact" || variant === "compact";
  const contact = resume?.contact || {};
  const experience = resume?.experience || [];
  const education = resume?.education || [];
  const skills = resume?.skills || [];
  const topPad = tight ? "0.42in" : "0.58in";
  const sidePad = tight ? "0.55in" : "0.65in";

  if (variant === "ats-classic") {
    return (
      <div id="resume-print-area" className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper" style={{ minHeight: "11in" }}>
        <header className="px-[0.68in] pt-[0.58in] pb-4 text-center">
          <h1 className="text-[29px] font-bold leading-none">{contact.name || "Your Name"}</h1>
          {contact.title && <p className="mt-1.5 text-[12px] font-medium">{contact.title}</p>}
          {(contact.email || contact.phone || contact.location) && <p className="mt-1.5 text-[10.5px] text-ink-soft">{[contact.email, contact.phone, contact.location].filter(Boolean).join("  |  ")}</p>}
          <div className="mt-3 border-b border-ink" />
        </header>
        <main className="px-[0.68in] pb-10">
          {resume.summary && <section><h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em]">Professional Summary</h2><p className="mt-1.5 text-[12px] leading-relaxed text-ink-soft">{resume.summary}</p></section>}
          {!!experience.length && <section className="mt-5"><h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em]">Experience</h2><div className="mt-2.5 space-y-3.5">{experience.map((exp,i)=><article key={i} className="break-inside-avoid"><div className="flex flex-wrap items-baseline justify-between gap-x-4"><h3 className="text-[13px] font-bold">{exp.role || "Role"}</h3><span className="text-[10px] text-ink-faint">{exp.startDate} – {exp.endDate}</span></div><p className="text-[11.5px] font-medium text-ink-soft">{exp.company}{exp.location ? `, ${exp.location}` : ""}</p>{!!exp.bullets?.filter(Boolean).length && <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[11.5px] leading-relaxed text-ink-soft">{exp.bullets.filter(Boolean).map((b,j)=><li key={j}>{b}</li>)}</ul>}</article>)}</div></section>}
          {!!education.length && <section className="mt-5"><h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em]">Education</h2><div className="mt-2.5 space-y-2.5">{education.map((ed,i)=><article key={i} className="flex items-baseline justify-between gap-4 break-inside-avoid"><div><h3 className="text-[12.5px] font-semibold">{[ed.degree,ed.field].filter(Boolean).join(" — ") || "Degree"}</h3><p className="text-[11.5px] text-ink-soft">{ed.school}</p></div><span className="shrink-0 text-[10px] text-ink-faint">{ed.startDate} – {ed.endDate}</span></article>)}</div></section>}
          {!!skills.length && <section className="mt-5"><h2 className="text-[10.5px] font-bold uppercase tracking-[0.14em]">Skills</h2><div className="mt-2 space-y-1">{skills.map((g,i)=><p key={i} className="text-[11.5px] leading-relaxed text-ink-soft"><span className="font-semibold text-ink">{g.category}:</span> {(g.items||[]).join(", ")}</p>)}</div></section>}
          <AdditionalSections resume={resume} accent={accent} density={tight ? "compact" : density} />
        </main>
      </div>
    );
  }

  if (variant === "executive") {
    return (
      <div id="resume-print-area" className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper" style={{ minHeight: "11in" }}>
        <header className="px-[0.68in] pt-[0.62in] pb-5">
          <div className="flex items-end justify-between gap-8 border-b pb-4" style={{ borderColor: `${accent}88` }}><div><p className="text-[10px] font-semibold uppercase tracking-[0.22em]" style={{color:accent}}>Professional Resume</p><h1 className="mt-2 font-display text-[31px] font-semibold leading-none">{contact.name || "Your Name"}</h1>{contact.title && <p className="mt-2 text-[13px] text-ink-soft">{contact.title}</p>}</div>{resume.photo && <img src={resume.photo} alt="" className="h-20 w-20 rounded-full object-cover" style={{border:`2px solid ${accent}66`}} />}</div>
          {(contact.email || contact.phone || contact.location) && <p className="mt-2 text-[10.5px] text-ink-soft">{[contact.email,contact.phone,contact.location].filter(Boolean).join("  •  ")}</p>}
        </header>
        <main className="px-[0.68in] pb-12">
          {resume.summary && <section><SectionTitle accent={accent} variant={variant}>Executive Profile</SectionTitle><p className="mt-2 text-[12.5px] leading-relaxed text-ink-soft">{resume.summary}</p></section>}
          {!!experience.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Professional Experience</SectionTitle><div className="mt-3 space-y-4">{experience.map((exp,i)=><article key={i} className="break-inside-avoid"><div className="flex items-baseline justify-between gap-4"><div><h3 className="text-[14px] font-semibold">{exp.role || "Role"}</h3><p className="text-[11.5px] font-medium text-ink-soft">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p></div><span className="shrink-0 text-[10px] text-ink-faint">{exp.startDate} – {exp.endDate}</span></div>{!!exp.bullets?.filter(Boolean).length && <ul className="mt-1.5 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-ink-soft">{exp.bullets.filter(Boolean).map((b,j)=><li key={j}>{b}</li>)}</ul>}</article>)}</div></section>}
          {!!education.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Education</SectionTitle><div className="mt-3 space-y-3">{education.map((ed,i)=><article key={i} className="flex items-baseline justify-between gap-4 break-inside-avoid"><div><h3 className="text-[13px] font-semibold">{[ed.degree,ed.field].filter(Boolean).join(" — ") || "Degree"}</h3><p className="text-[11.5px] text-ink-soft">{ed.school}</p></div><span className="text-[10px] text-ink-faint">{ed.startDate} – {ed.endDate}</span></article>)}</div></section>}
          {!!skills.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Core Skills</SectionTitle><div className="mt-2.5 grid grid-cols-2 gap-4">{skills.map((g,i)=><p key={i} className="text-[11.5px] text-ink-soft"><span className="font-semibold text-ink">{g.category}:</span> {(g.items||[]).join(", ")}</p>)}</div></section>}
          <AdditionalSections resume={resume} accent={accent} density={density} />
        </main>
      </div>
    );
  }

  if (variant === "academic") {
    return (
      <div id="resume-print-area" className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper" style={{ minHeight: "11in" }}>
        <header className="px-[0.78in] pt-[0.7in] pb-5 text-center"><h1 className="font-display text-[29px] font-semibold tracking-tight">{contact.name || "Your Name"}</h1>{contact.title && <p className="mt-1 text-[12px]" style={{color:accent}}>{contact.title}</p>}{(contact.email || contact.phone || contact.location) && <p className="mt-1.5 text-[10.5px] text-ink-soft">{[contact.email,contact.phone,contact.location].filter(Boolean).join("  |  ")}</p>}<div className="mx-auto mt-4 h-px w-24" style={{backgroundColor:accent}} /></header>
        <main className="px-[0.78in] pb-12">
          {resume.summary && <section><SectionTitle accent={accent} variant={variant}>Profile</SectionTitle><p className="mt-2 text-center text-[12px] leading-relaxed text-ink-soft">{resume.summary}</p></section>}
          {!!education.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Education</SectionTitle><div className="mt-3 space-y-3.5">{education.map((ed,i)=><article key={i} className="flex items-baseline justify-between gap-4 break-inside-avoid"><div><h3 className="text-[13px] font-semibold">{[ed.degree,ed.field].filter(Boolean).join(", ") || "Degree"}</h3><p className="text-[11.5px] text-ink-soft">{ed.school}</p></div><span className="text-[10px] text-ink-faint">{ed.startDate} – {ed.endDate}</span></article>)}</div></section>}
          {!!experience.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Experience</SectionTitle><div className="mt-3 space-y-4">{experience.map((exp,i)=><article key={i} className="break-inside-avoid"><h3 className="text-[13px] font-semibold">{exp.role || "Role"}</h3><div className="flex items-baseline justify-between gap-4 text-[11.5px] text-ink-soft"><span>{exp.company}{exp.location ? `, ${exp.location}` : ""}</span><span className="text-[10px] text-ink-faint">{exp.startDate} – {exp.endDate}</span></div>{!!exp.bullets?.filter(Boolean).length && <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-ink-soft">{exp.bullets.filter(Boolean).map((b,j)=><li key={j}>{b}</li>)}</ul>}</article>)}</div></section>}
          {!!skills.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Skills</SectionTitle><div className="mt-2 space-y-1.5">{skills.map((g,i)=><p key={i} className="text-[11.5px] text-ink-soft"><span className="font-semibold text-ink">{g.category}:</span> {(g.items||[]).join(", ")}</p>)}</div></section>}
          <AdditionalSections resume={resume} accent={accent} density={density} />
        </main>
      </div>
    );
  }

  if (variant === "clean") {
    return (
      <div id="resume-print-area" className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper" style={{ minHeight: "11in" }}>
        <header className="px-[0.72in] pt-[0.65in] pb-4"><div className="flex items-start justify-between gap-8"><div><h1 className="text-[30px] font-semibold tracking-[-0.03em]">{contact.name || "Your Name"}</h1>{contact.title && <p className="mt-1 text-[12.5px] text-ink-soft">{contact.title}</p>}</div>{resume.photo && <img src={resume.photo} alt="" className="h-16 w-16 rounded object-cover" />}</div>{(contact.email || contact.phone || contact.location) && <p className="mt-2 text-[10.5px] text-ink-soft">{[contact.email,contact.phone,contact.location].filter(Boolean).join("  •  ")}</p>}<div className="mt-4 border-t" style={{borderColor:`${accent}55`}} /></header>
        <main className="px-[0.72in] pb-12">
          {resume.summary && <section><SectionTitle accent={accent} variant={variant}>Summary</SectionTitle><p className="mt-2 text-[12px] leading-relaxed text-ink-soft">{resume.summary}</p></section>}
          {!!experience.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Experience</SectionTitle><div className="mt-3 space-y-4">{experience.map((exp,i)=><article key={i} className="break-inside-avoid"><div className="flex flex-wrap items-baseline justify-between gap-x-4"><h3 className="text-[13.5px] font-semibold">{exp.role || "Role"}</h3><span className="text-[10px] text-ink-faint">{exp.startDate} – {exp.endDate}</span></div><p className="text-[11.5px] text-ink-soft">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</p>{!!exp.bullets?.filter(Boolean).length && <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-ink-soft">{exp.bullets.filter(Boolean).map((b,j)=><li key={j}>{b}</li>)}</ul>}</article>)}</div></section>}
          {!!education.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Education</SectionTitle><div className="mt-2.5 space-y-2.5">{education.map((ed,i)=><article key={i} className="flex items-baseline justify-between gap-4 break-inside-avoid"><div><h3 className="text-[12.5px] font-semibold">{[ed.degree,ed.field].filter(Boolean).join(" — ") || "Degree"}</h3><p className="text-[11.5px] text-ink-soft">{ed.school}</p></div><span className="text-[10px] text-ink-faint">{ed.startDate} – {ed.endDate}</span></article>)}</div></section>}
          {!!skills.length && <section className="mt-5"><SectionTitle accent={accent} variant={variant}>Skills</SectionTitle><div className="mt-2.5 grid grid-cols-2 gap-4">{skills.map((g,i)=><p key={i} className="text-[11.5px] text-ink-soft"><span className="font-semibold text-ink">{g.category}:</span> {(g.items||[]).join(", ")}</p>)}</div></section>}
          <AdditionalSections resume={resume} accent={accent} density={density} />
        </main>
      </div>
    );
  }

  return (
    <div
      id="resume-print-area"
      className="mx-auto w-full max-w-[8.5in] bg-white text-ink shadow-paper"
      style={{ minHeight: "11in" }}
    >
      <header
        className={`${c.headerRule ? "border-b" : ""} px-[0.65in] pb-5`}
        style={{ paddingTop: topPad, borderColor: `${accent}55` }}
      >
        <div className="flex items-start justify-between gap-5">
          <div className="min-w-0 flex-1">
            <h1 className={`${c.serifName ? "font-display" : "font-body"} text-[30px] font-semibold leading-none`}>
              {contact.name || "Your Name"}
            </h1>
            {contact.title && <p className="mt-2 text-[13px] font-medium" style={{ color: accent }}>{contact.title}</p>}
            {(contact.email || contact.phone || contact.location) && (
              <p className="mt-2 text-[11px] leading-relaxed text-ink-soft">
                {[contact.email, contact.phone, contact.location].filter(Boolean).join("  •  ")}
              </p>
            )}
          </div>
          {resume.photo && variant !== "harvard" && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={resume.photo} alt="" className="h-20 w-20 shrink-0 rounded-sm object-cover" style={{ border: `2px solid ${accent}55` }} />
          )}
        </div>
      </header>

      <main className="px-[0.65in] pb-10" style={{ paddingTop: tight ? "0.25in" : "0.35in" }}>
        {resume.summary && (
          <section>
            <SectionTitle accent={accent} variant={variant}>Profile</SectionTitle>
            <p className="mt-2 text-[13px] leading-relaxed text-ink-soft">{resume.summary}</p>
          </section>
        )}

        {!!experience.length && (
          <section className="mt-5">
            <SectionTitle accent={accent} variant={variant}>Experience</SectionTitle>
            <div className={tight ? "mt-2.5 space-y-3" : "mt-3 space-y-4"}>
              {experience.map((exp, i) => (
                <article key={i} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
                    <h3 className="text-[14px] font-semibold">{exp.role || "Role"}</h3>
                    <span className="text-[10px] text-ink-faint whitespace-nowrap">{exp.startDate} – {exp.endDate}</span>
                  </div>
                  <div className="text-[12px] font-medium text-ink-soft">{exp.company}{exp.location ? ` · ${exp.location}` : ""}</div>
                  {!!exp.bullets?.filter(Boolean).length && (
                    <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[12px] leading-relaxed text-ink-soft">
                      {exp.bullets.filter(Boolean).map((b, j) => <li key={j}>{b}</li>)}
                    </ul>
                  )}
                </article>
              ))}
            </div>
          </section>
        )}

        {!!education.length && (
          <section className="mt-5">
            <SectionTitle accent={accent} variant={variant}>Education</SectionTitle>
            <div className={tight ? "mt-2.5 space-y-2.5" : "mt-3 space-y-3"}>
              {education.map((ed, i) => (
                <article key={i} className="break-inside-avoid">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                    <h3 className="text-[13px] font-semibold">{[ed.degree, ed.field].filter(Boolean).join(" — ") || "Degree"}</h3>
                    <span className="text-[10px] text-ink-faint">{ed.startDate} – {ed.endDate}</span>
                  </div>
                  <p className="text-[12px] text-ink-soft">{ed.school}</p>
                </article>
              ))}
            </div>
          </section>
        )}

        {!!skills.length && (
          <section className="mt-5">
            <SectionTitle accent={accent} variant={variant}>Skills</SectionTitle>
            <div className="mt-2.5 space-y-1.5">
              {skills.map((group, i) => (
                <p key={i} className="text-[12px] leading-relaxed text-ink-soft">
                  <span className="font-semibold text-ink">{group.category || "Skills"}:</span> {(group.items || []).join(", ")}
                </p>
              ))}
            </div>
          </section>
        )}

        <AdditionalSections resume={resume} accent={accent} density={tight ? "compact" : density} />
      </main>
    </div>
  );
}

export type { Variant };
