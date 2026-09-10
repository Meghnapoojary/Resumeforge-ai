import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import {
  rewriteBullet,
  humanizeText,
  generateSummary,
  matchJobDescription,
  scoreAts,
  generateCoverLetter,
  adjustTone,
  grammarCheck,
  quantifySuggestions,
  generateLinkedInAbout,
  predictInterviewQuestions,
} from "@/lib/gemini";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to use the AI tools." }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { action } = body;

    switch (action) {
      case "rewrite-bullet": {
        const result = await rewriteBullet(body.bullet, body.targetLevel);
        return NextResponse.json({ result });
      }
      case "humanize": {
        const result = await humanizeText(body.text, body.style || "natural");
        return NextResponse.json({ result });
      }
      case "generate-summary": {
        const result = await generateSummary(body.resume);
        return NextResponse.json({ result });
      }
      case "match-job": {
        const result = await matchJobDescription(body.resumeText, body.jobDescription);
        return NextResponse.json({ result });
      }
      case "ats-score": {
        const result = await scoreAts(body.resumeText);
        return NextResponse.json({ result });
      }
      case "cover-letter": {
        const result = await generateCoverLetter(
          body.resumeText,
          body.jobDescription,
          body.companyName
        );
        return NextResponse.json({ result });
      }
      case "adjust-tone": {
        const result = await adjustTone(body.text, body.level);
        return NextResponse.json({ result });
      }
      case "grammar-check": {
        const result = await grammarCheck(body.resumeText);
        return NextResponse.json({ result });
      }
      case "quantify-suggestions": {
        const result = await quantifySuggestions(body.resumeText);
        return NextResponse.json({ result });
      }
      case "linkedin-about": {
        const result = await generateLinkedInAbout(body.resumeText);
        return NextResponse.json({ result });
      }
      case "interview-questions": {
        const result = await predictInterviewQuestions(body.resumeText, body.jobDescription);
        return NextResponse.json({ result });
      }
      default:
        return NextResponse.json({ error: "Unknown action" }, { status: 400 });
    }
  } catch (err: any) {
    console.error("ai route error:", err);
    return NextResponse.json(
      { error: err.message || "The AI tool hit an error. Try again." },
      { status: 500 }
    );
  }
}
