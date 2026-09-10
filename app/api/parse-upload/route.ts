import { NextRequest, NextResponse } from "next/server";
import { parseUploadedFile } from "@/lib/parseUpload";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file provided." }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const text = await parseUploadedFile(buffer, file.name);

    if (!text.trim()) {
      return NextResponse.json(
        { error: "Couldn't find any readable text in that file." },
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
