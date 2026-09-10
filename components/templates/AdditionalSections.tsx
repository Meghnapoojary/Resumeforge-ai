import { TemplateProps } from "./types";

function normalizeCertificate(cert: any) {
  return typeof cert === "string"
    ? { name: cert, issuer: "", date: "", link: "", image: "" }
    : cert || {};
}

export default function AdditionalSections({ resume, accent = "#2255D8", density = "comfortable" }: TemplateProps) {
  const projects = resume.projects || [];
  const certifications = resume.certifications || [];
  const tight = density === "compact";

  if (!projects.length && !certifications.length) return null;

  return (
    <>
      {!!projects.length && (
        <section className={tight ? "mt-4" : "mt-6"}>
          <h2 className="text-xs font-semibold uppercase tracking-widest border-b border-rule pb-1" style={{ color: accent }}>
            Projects
          </h2>
          <div className={tight ? "mt-2 space-y-3" : "mt-3 space-y-4"}>
            {projects.map((project: any, i: number) => (
              <div key={i} className="break-inside-avoid">
                <div className="flex gap-3">
                  {project.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={project.image} alt="" className="h-14 w-20 shrink-0 rounded-sm object-cover border border-rule" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[14px] font-semibold text-ink">{project.name}</p>
                      {project.link && (
                        <a href={project.link} target="_blank" rel="noreferrer" className="text-[11px] underline underline-offset-2" style={{ color: accent }}>
                          View project
                        </a>
                      )}
                    </div>
                    {project.description && <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{project.description}</p>}
                    {!!project.bullets?.filter(Boolean).length && (
                      <ul className="mt-1 list-disc space-y-0.5 pl-4 text-[13px] leading-relaxed text-ink-soft">
                        {project.bullets.filter(Boolean).map((bullet: string, j: number) => <li key={j}>{bullet}</li>)}
                      </ul>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {!!certifications.length && (
        <section className={tight ? "mt-4" : "mt-6"}>
          <h2 className="text-xs font-semibold uppercase tracking-widest border-b border-rule pb-1" style={{ color: accent }}>
            Certifications
          </h2>
          <div className={tight ? "mt-2 space-y-2" : "mt-3 space-y-3"}>
            {certifications.map((raw: any, i: number) => {
              const cert = normalizeCertificate(raw);
              return (
                <div key={i} className="flex gap-3 break-inside-avoid">
                  {cert.image && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={cert.image} alt="" className="h-12 w-16 shrink-0 rounded-sm object-cover border border-rule" />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline justify-between gap-2">
                      <p className="text-[13px] font-semibold text-ink">{cert.name}</p>
                      {cert.date && <p className="text-[11px] text-ink-faint">{cert.date}</p>}
                    </div>
                    {cert.issuer && <p className="text-[12px] text-ink-soft">{cert.issuer}</p>}
                    {cert.link && (
                      <a href={cert.link} target="_blank" rel="noreferrer" className="text-[11px] underline underline-offset-2" style={{ color: accent }}>
                        Verify certificate
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}
    </>
  );
}
