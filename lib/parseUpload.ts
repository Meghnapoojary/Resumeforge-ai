import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";
import { GoogleGenAI } from "@google/genai";

/** Extracts plain text from a PDF text layer. */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
}

/**
 * Falls back to Gemini for image-only PDFs (for example PDFs produced by
 * some browser/OS print-to-PDF drivers that contain images but no text layer).
 */
export async function parsePdfWithGemini(buffer: Buffer): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("This PDF is image-based and has no readable text layer. Add GEMINI_API_KEY to enable image-PDF extraction.");
  }

  const ai = new GoogleGenAI({ apiKey });
  const response = await ai.models.generateContent({
    model: "gemini-3.6-flash",
    contents: [
      {
        inlineData: {
          mimeType: "application/pdf",
          data: buffer.toString("base64"),
        },
      },
      {
        text: `Extract all readable text from this resume PDF. Preserve the wording and facts exactly; do not invent or summarize anything. Return plain text only, with clear line breaks between sections and entries. Include the candidate name, contact details, profile/summary, experience, education, skills, projects, certifications, dates, organizations, URLs, and any other readable resume content.`,
      },
    ],
  });

  return (response.text ?? "").trim();
}

/** Extracts plain text from a DOCX buffer. */
export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/** Routes a file to the right parser based on its name/type. */
export async function parseUploadedFile(buffer: Buffer, filename: string): Promise<string> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return parsePdfBuffer(buffer);
  if (lower.endsWith(".docx")) return parseDocxBuffer(buffer);
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return buffer.toString("utf-8");
  throw new Error("Unsupported file type. Upload a PDF, DOCX, TXT, or MD file.");
}
