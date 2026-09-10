import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Resume } from "@/lib/models/Resume";

async function assertOwnership(id: string, userId: string) {
  const resume = await Resume.findById(id);
  if (!resume) return { error: NextResponse.json({ error: "Resume not found" }, { status: 404 }) };
  if (String(resume.userId) !== String(userId)) {
    return { error: NextResponse.json({ error: "Forbidden" }, { status: 403 }) };
  }
  return { resume };
}

export async function GET(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const { resume, error } = await assertOwnership(params.id, (session.user as any).id);
  if (error) return error;

  return NextResponse.json({ resume: resume!.toObject() });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const { resume: existing, error } = await assertOwnership(params.id, (session.user as any).id);
  if (error) return error;

  const updates = await req.json();

  // Push a lightweight version snapshot before overwriting, so edits are recoverable.
  existing!.versions = existing!.versions || [];
  existing!.versions.push({ savedAt: new Date(), snapshot: existing!.toObject() });
  if (existing!.versions.length > 20) existing!.versions.shift();

  Object.assign(existing!, updates);
  await existing!.save();

  return NextResponse.json({ resume: existing!.toObject() });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const { error } = await assertOwnership(params.id, (session.user as any).id);
  if (error) return error;

  await Resume.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
