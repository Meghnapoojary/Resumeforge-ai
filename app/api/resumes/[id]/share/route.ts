import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { nanoid } from "nanoid";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Resume } from "@/lib/models/Resume";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const resume = await Resume.findById(params.id);
  if (!resume) return NextResponse.json({ error: "Resume not found" }, { status: 404 });
  if (String(resume.userId) !== String((session.user as any).id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { makePublic } = await req.json();

  resume.isPublic = !!makePublic;
  if (makePublic && !resume.shareSlug) {
    resume.shareSlug = nanoid(10);
  }
  await resume.save();

  return NextResponse.json({ isPublic: resume.isPublic, shareSlug: resume.shareSlug });
}
