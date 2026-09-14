import mammoth from "mammoth";
import { createRequire } from "node:module";

/**
 * pdf-parse v2 is a server-only dependency and includes native canvas code.
 * Keep it external to Next/Webpack (see next.config.mjs) and load it with a
 * normal runtime require so Next's output file tracer can still detect the
 * package and include it in the Vercel serverless function.
 */
const require = createRequire(import.meta.url);

function loadPdfParser(): { PDFParse: any; CanvasFactory: any; getData: () => any } {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const pdfParse = require("pdf-parse");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const worker = require("pdf-parse/worker");

  return {
    PDFParse: pdfParse.PDFParse,
    CanvasFactory: worker.CanvasFactory,
    getData: worker.getData,
  };
}

/** Extracts plain text from a PDF buffer. */
export async function parsePdfBuffer(buffer: Buffer): Promise<string> {
  const { PDFParse, CanvasFactory, getData } = loadPdfParser();
  PDFParse.setWorker(getData());
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
