/** Maps our internal resume shape to the open JSON Resume schema (jsonresume.org). */
export function toJsonResume(resume: any) {
  return {
    basics: {
      name: resume.contact?.name || "",
      label: resume.contact?.title || "",
      image: resume.photo || "",
      email: resume.contact?.email || "",
      phone: resume.contact?.phone || "",
      location: { city: resume.contact?.location || "" },
      summary: resume.summary || "",
    },
    work: (resume.experience || []).map((exp: any) => ({
      name: exp.company || "",
      position: exp.role || "",
      location: exp.location || "",
      startDate: exp.startDate || "",
      endDate: exp.endDate || "",
      highlights: exp.bullets || [],
    })),
    education: (resume.education || []).map((ed: any) => ({
      institution: ed.school || "",
      studyType: ed.degree || "",
      area: ed.field || "",
      startDate: ed.startDate || "",
      endDate: ed.endDate || "",
    })),
    skills: (resume.skills || []).map((s: any) => ({
      name: s.category || "",
      keywords: s.items || [],
    })),
    projects: (resume.projects || []).map((project: any) => ({
      name: project.name || "",
      description: project.description || "",
      highlights: project.bullets || [],
      url: project.link || "",
      image: project.image || "",
    })),
    certificates: (resume.certifications || []).map((raw: any) => {
      const cert = typeof raw === "string" ? { name: raw } : (raw || {});
      return {
        name: cert.name || "",
        issuer: cert.issuer || "",
        date: cert.date || "",
        url: cert.link || "",
      };
    }),
    meta: {
      canonical: "https://jsonresume.org/schema/",
      generated: new Date().toISOString(),
    },
  };
}
