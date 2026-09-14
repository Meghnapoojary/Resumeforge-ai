import { CanvasFactory, getData } from "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

// pdf-parse v2 needs an explicit worker in serverless/Next.js environments.
// Without this, Vercel can fail with: ERR_INVALID_URL (input: '').
PDFParse.setWorker(getData());
import mammoth from "mammoth";

/** Extracts plain text from a PDF buffer. */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const parser = new PDFParse({ data: buffer, CanvasFactory });
  try {
    const result = await parser.getText();
    return result.text;
  } finally {
    await parser.destroy();
  }
}

/** Extracts plain text from a DOCX buffer. */
export async function parseDocxBuffer(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value;
}

/** Routes a file to the right parser based on its name/type. Returns "" for unsupported types. */
export async function parseUploadedFile(buffer: Buffer, filename: string): Promise<string> {
  const lower = filename.toLowerCase();
  if (lower.endsWith(".pdf")) return parsePdfBuffer(buffer);
  if (lower.endsWith(".docx")) return parseDocxBuffer(buffer);
  if (lower.endsWith(".txt") || lower.endsWith(".md")) return buffer.toString("utf-8");
  throw new Error("Unsupported file type. Upload a PDF, DOCX, TXT, or MD file.");
}
