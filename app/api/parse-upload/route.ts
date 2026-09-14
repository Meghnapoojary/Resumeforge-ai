import { NextRequest, NextResponse } from "next/server";
import { parsePdfBuffer, parsePdfWithGemini, parseUploadedFile } from "@/lib/parseUpload";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    let text = await parseUploadedFile(buffer, file.name);

    // Browser/OS "Print to PDF" can produce image-only PDFs. When the normal
    // text-layer parser returns nothing, use the app's existing Gemini key as
    // a server-side vision/OCR fallback instead of rejecting the upload.
    if (!text.trim() && file.name.toLowerCase().endsWith(".pdf")) {
      text = await parsePdfWithGemini(buffer);
    }

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Couldn't find any readable text in that file. If this is a scanned or image-only PDF, make sure GEMINI_API_KEY is configured." },
        { status: 422 }
      );
    }

    return NextResponse.json({ text });
  } catch (err: any) {
    console.error("parse-upload route error:", err);
    return NextResponse.json(
      { error: err.message || "Couldn't read that file." },
      { status: 500 }
    );
  }
}
