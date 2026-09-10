import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  ImageRun,
  HeadingLevel,
  AlignmentType,
  BorderStyle,
} from "docx";

const INK = "17233B";
const INK_SOFT = "3A4460";
const GOLD = "B8892B";

function ruleBorder() {
  return {
    bottom: { style: BorderStyle.SINGLE, size: 4, color: "DAD3C2", space: 2 },
  };
}

function sectionHeading(text: string) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    spacing: { before: 280, after: 100 },
    border: ruleBorder(),
    children: [
      new TextRun({ text: text.toUpperCase(), bold: true, size: 20, color: INK, font: "Arial" }),
    ],
  });
}

export function resumeToDocxBuffer(resume: any): Promise<Buffer> {
  const children: Paragraph[] = [];

  // Photo (if present) - base64 data URL like "data:image/jpeg;base64,...."
  if (resume.photo && typeof resume.photo === "string" && resume.photo.startsWith("data:image")) {
    try {
      const base64Data = resume.photo.split(",")[1];
      const imageBuffer = Buffer.from(base64Data, "base64");
      children.push(
        new Paragraph({
          alignment: AlignmentType.LEFT,
          spacing: { after: 120 },
          children: [
            new ImageRun({
              data: imageBuffer,
              transformation: { width: 72, height: 72 },
              type: "jpg",
            }),
          ],
        })
      );
    } catch {
      // If the photo can't be decoded for some reason, skip it rather than fail the whole export.
    }
  }

  // Header
  children.push(
    new Paragraph({
      spacing: { after: 40 },
      children: [
        new TextRun({
          text: resume.contact?.name || "Your Name",
          bold: true,
          size: 48,
          color: INK,
          font: "Georgia",
        }),
      ],
    })
  );
  if (resume.contact?.title) {
    children.push(
      new Paragraph({
        spacing: { after: 80 },
        children: [
          new TextRun({ text: resume.contact.title, italics: true, size: 24, color: GOLD, font: "Georgia" }),
        ],
      })
    );
  }
  const contactLine = [resume.contact?.email, resume.contact?.phone, resume.contact?.location]
    .filter(Boolean)
    .join("   ·   ");
  if (contactLine) {
    children.push(
      new Paragraph({
        border: ruleBorder(),
        spacing: { after: 200 },
        children: [new TextRun({ text: contactLine, size: 20, color: INK_SOFT, font: "Arial" })],
      })
    );
  }

  // Summary
  if (resume.summary) {
    children.push(
      new Paragraph({
        spacing: { after: 200 },
        children: [new TextRun({ text: resume.summary, size: 22, color: INK_SOFT, font: "Arial" })],
      })
    );
  }

  // Experience
  if (resume.experience?.length) {
    children.push(sectionHeading("Experience"));
    for (const exp of resume.experience) {
      children.push(
        new Paragraph({
          spacing: { before: 120, after: 20 },
          children: [
            new TextRun({ text: `${exp.role || ""} — `, bold: true, size: 22, color: INK, font: "Arial" }),
            new TextRun({ text: exp.company || "", size: 22, color: INK_SOFT, font: "Arial" }),
            new TextRun({
              text: `    ${exp.startDate || ""} – ${exp.endDate || ""}`,
              size: 18,
              color: INK_SOFT,
              italics: true,
              font: "Arial",
            }),
          ],
        })
      );
      for (const bullet of exp.bullets || []) {
        children.push(
          new Paragraph({
            bullet: { level: 0 },
            spacing: { after: 40 },
            children: [new TextRun({ text: bullet, size: 20, color: INK_SOFT, font: "Arial" })],
          })
        );
      }
    }
  }

  // Education
  if (resume.education?.length) {
    children.push(sectionHeading("Education"));
    for (const ed of resume.education) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({
              text: `${ed.degree || ""} ${ed.field ? `in ${ed.field}` : ""} — `,
              bold: true,
              size: 22,
              color: INK,
              font: "Arial",
            }),
            new TextRun({ text: ed.school || "", size: 22, color: INK_SOFT, font: "Arial" }),
            new TextRun({
              text: `    ${ed.startDate || ""} – ${ed.endDate || ""}`,
              size: 18,
              italics: true,
              color: INK_SOFT,
              font: "Arial",
            }),
          ],
        })
      );
    }
  }

  // Skills
  if (resume.skills?.length) {
    children.push(sectionHeading("Skills"));
    for (const group of resume.skills) {
      children.push(
        new Paragraph({
          spacing: { after: 60 },
          children: [
            new TextRun({ text: `${group.category}: `, bold: true, size: 20, color: INK, font: "Arial" }),
            new TextRun({ text: (group.items || []).join(", "), size: 20, color: INK_SOFT, font: "Arial" }),
          ],
        })
      );
    }
  }

  // Projects
  if (resume.projects?.length) {
    children.push(sectionHeading("Projects"));
    for (const project of resume.projects) {
      const projectChildren: TextRun[] = [];
      if (project.name) projectChildren.push(new TextRun({ text: project.name, bold: true, size: 22, color: INK, font: "Arial" }));
      if (project.link) projectChildren.push(new TextRun({ text: `  ${project.link}`, size: 18, color: GOLD, font: "Arial" }));
      if (projectChildren.length) children.push(new Paragraph({ spacing: { before: 120, after: 30 }, children: projectChildren }));
      if (project.image && typeof project.image === "string" && project.image.startsWith("data:image")) {
        try {
          const imageBuffer = Buffer.from(project.image.split(",")[1], "base64");
          children.push(new Paragraph({ spacing: { after: 60 }, children: [new ImageRun({ data: imageBuffer, transformation: { width: 120, height: 80 }, type: "jpg" })] }));
        } catch {}
      }
      if (project.description) children.push(new Paragraph({ spacing: { after: 40 }, children: [new TextRun({ text: project.description, size: 20, color: INK_SOFT, font: "Arial" })] }));
      for (const bullet of project.bullets || []) {
        if (!bullet) continue;
        children.push(new Paragraph({ bullet: { level: 0 }, spacing: { after: 30 }, children: [new TextRun({ text: bullet, size: 20, color: INK_SOFT, font: "Arial" })] }));
      }
    }
  }

  // Certifications
  if (resume.certifications?.length) {
    children.push(sectionHeading("Certifications"));
    for (const raw of resume.certifications) {
      const cert = typeof raw === "string" ? { name: raw } : (raw || {});
      children.push(new Paragraph({
        spacing: { after: 50 },
        children: [
          new TextRun({ text: cert.name || "", bold: true, size: 21, color: INK, font: "Arial" }),
          new TextRun({ text: cert.issuer ? ` — ${cert.issuer}` : "", size: 20, color: INK_SOFT, font: "Arial" }),
          new TextRun({ text: cert.date ? ` (${cert.date})` : "", size: 18, color: INK_SOFT, font: "Arial" }),
          new TextRun({ text: cert.link ? `  ${cert.link}` : "", size: 17, color: GOLD, font: "Arial" }),
        ],
      }));
      if (cert.image && typeof cert.image === "string" && cert.image.startsWith("data:image")) {
        try {
          const imageBuffer = Buffer.from(cert.image.split(",")[1], "base64");
          children.push(new Paragraph({ spacing: { after: 70 }, children: [new ImageRun({ data: imageBuffer, transformation: { width: 120, height: 80 }, type: "jpg" })] }));
        } catch {}
      }
    }
  }

  const doc = new Document({
    sections: [
      {
        properties: { page: { margin: { top: 720, bottom: 720, left: 720, right: 720 } } },
        children,
      },
    ],
  });

  return Packer.toBuffer(doc);
}
