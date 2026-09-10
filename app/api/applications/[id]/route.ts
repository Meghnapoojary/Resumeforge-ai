import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { JobApplication } from "@/lib/models/JobApplication";

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const application = await JobApplication.findById(params.id);
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(application.userId) !== String((session.user as any).id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const updates = await req.json();
  Object.assign(application, updates);
  await application.save();

  return NextResponse.json({ application });
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectToDatabase();
  const application = await JobApplication.findById(params.id);
  if (!application) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(application.userId) !== String((session.user as any).id)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  await JobApplication.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
