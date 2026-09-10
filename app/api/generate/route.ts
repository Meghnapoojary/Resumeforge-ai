import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Resume } from "@/lib/models/Resume";
import { generateResumeFromKeywords } from "@/lib/gemini";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Sign in to generate a resume." }, { status: 401 });
    }

    const { keywords, uploadedText } = await req.json();

    if (!keywords || typeof keywords !== "string" || keywords.trim().length === 0) {
      return NextResponse.json(
        { error: "Add a few keywords describing your background first." },
        { status: 400 }
      );
    }

    const draft = await generateResumeFromKeywords(keywords, uploadedText);

    await connectToDatabase();
    const resume = await Resume.create({
      userId: (session.user as any).id,
      title: draft.contact?.name ? `${draft.contact.name}'s resume` : "Untitled resume",
      contact: draft.contact,
      summary: draft.summary,
      experience: draft.experience,
      education: draft.education,
      skills: draft.skills,
    });

    return NextResponse.json({ id: resume._id.toString() });
  } catch (err: any) {
    console.error("generate route error:", err);
    return NextResponse.json(
      { error: err.message || "Something went wrong generating your resume." },
      { status: 500 }
    );
  }
}
