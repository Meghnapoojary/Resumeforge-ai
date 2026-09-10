import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/lib/models/JobApplication";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const applications = await JobApplication.find({ userId: (session.user as any).id })
    .sort({ createdAt: -1 })
    .lean();
  return NextResponse.json({ applications });
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  if (!body.jobTitle || !body.company) {
    return NextResponse.json({ error: "Job title and company are required." }, { status: 400 });
  }

  await connectToDatabase();
  const application = await JobApplication.create({
    userId: (session.user as any).id,
    resumeId: body.resumeId || undefined,
    jobTitle: body.jobTitle,
    company: body.company,
    jobDescriptionText: body.jobDescriptionText || "",
    coverLetterText: body.coverLetterText || "",
    status: body.status || "applied",
  });

  return NextResponse.json({ application });
}
