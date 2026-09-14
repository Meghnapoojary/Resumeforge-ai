import mammoth from "mammoth";
import pdfParse from "pdf-parse/lib/pdf-parse.js";

/** Extracts plain text from a PDF buffer. Uses pdf-parse v1, which is pure JS and avoids native canvas binaries on Vercel. */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const result = await pdfParse(buffer);
  return result.text;
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
