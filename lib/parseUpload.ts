import mammoth from "mammoth";

/**
 * Load pdf-parse only at runtime. Its v2 dependency tree includes a native
 * @napi-rs/canvas .node binary. A normal static import makes Next/Webpack
 * try to parse that binary during `next build`, which fails on Vercel.
 * Using a runtime require keeps the native dependency out of the build graph
 * while still allowing the Node.js serverless function to load it at runtime.
 */
function loadPdfParser(): { PDFParse: any; CanvasFactory: any; getData: () => any } {
  // Intentionally dynamic so Webpack cannot statically traverse pdf-parse's
  // native canvas dependency during the Next.js build.
  const runtimeRequire = eval("require") as NodeRequire;
  const pdfParse = runtimeRequire(["pdf", "-parse"].join(""));
  const worker = runtimeRequire(["pdf", "-parse", "/worker"].join(""));
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
