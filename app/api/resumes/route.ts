import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Resume } from "@/lib/models/Resume";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const resumes = await Resume.find({ userId: (session.user as any).id })
    .sort({ updatedAt: -1 })
    .select("title updatedAt templateId")
    .lean();
  return NextResponse.json({ resumes });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const body = await req.json().catch(() => ({}));
  const resume = await Resume.create({
    userId: (session.user as any).id,
    title: body.title || "Untitled resume",
  });
  return NextResponse.json({ id: resume._id.toString() });
}
