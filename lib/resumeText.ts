export function resumeToPlainText(resume: any): string {
  if (!resume) return "";
  const lines: string[] = [];

  if (resume.contact?.name) lines.push(resume.contact.name);
  if (resume.contact?.title) lines.push(resume.contact.title);
  const contactLine = [resume.contact?.email, resume.contact?.phone, resume.contact?.location]
    .filter(Boolean)
    .join(" | ");
  if (contactLine) lines.push(contactLine);

  if (resume.summary) {
    lines.push("", "SUMMARY", resume.summary);
  }

  if (resume.experience?.length) {
    lines.push("", "EXPERIENCE");
    for (const exp of resume.experience) {
      lines.push(
        `${exp.role || ""} — ${exp.company || ""} (${exp.startDate || ""} - ${exp.endDate || ""})`
      );
      for (const b of exp.bullets || []) lines.push(`- ${b}`);
    }
  }

  if (resume.education?.length) {
    lines.push("", "EDUCATION");
    for (const ed of resume.education) {
      lines.push(`${ed.degree || ""} ${ed.field || ""} — ${ed.school || ""} (${ed.endDate || ""})`);
    }
  }

  if (resume.skills?.length) {
    lines.push("", "SKILLS");
    for (const group of resume.skills) {
      lines.push(`${group.category || ""}: ${(group.items || []).join(", ")}`);
    }
  }

  if (resume.projects?.length) {
    lines.push("", "PROJECTS");
    for (const project of resume.projects) {
      if (project.name || project.link) lines.push(`${project.name || ""}${project.link ? ` — ${project.link}` : ""}`);
      if (project.description) lines.push(project.description);
      for (const bullet of project.bullets || []) if (bullet) lines.push(`- ${bullet}`);
    }
  }

  if (resume.certifications?.length) {
    lines.push("", "CERTIFICATIONS");
    for (const raw of resume.certifications) {
      const cert = typeof raw === "string" ? { name: raw } : (raw || {});
      lines.push(`${cert.name || ""}${cert.issuer ? ` — ${cert.issuer}` : ""}${cert.date ? ` (${cert.date})` : ""}${cert.link ? ` — ${cert.link}` : ""}`);
    }
  }

  return lines.join("\n");
}
