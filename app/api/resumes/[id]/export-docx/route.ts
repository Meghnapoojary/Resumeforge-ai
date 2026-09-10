import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Resume } from "@/lib/models/Resume";
import { resumeToDocxBuffer } from "@/lib/docxExport";

export const runtime = "nodejs";

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const resume = await Resume.findById(params.id).lean();
  if (!resume) {
    return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  }
  if (String((resume as any).userId) !== String((session.user as any).id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const buffer = await resumeToDocxBuffer(resume);
  const filename = `${(resume as any).contact?.name || "resume"}.docx`.replace(/\s+/g, "-");

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
