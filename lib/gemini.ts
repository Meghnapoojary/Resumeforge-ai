import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;

function getClient() {
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it to your .env.local — see .env.example. " +
        "Get a free key at https://aistudio.google.com/app/apikey"
    );
  }
  return new GoogleGenAI({ apiKey });
}

// Gemini 3.6 Flash: Google's current stable, generally-available Flash model
// (as of this writing, gemini-2.5-flash and everything in the 1.5/2.0 lines
// have been retired for new API keys). If you ever hit a 404 "model not
// available" error again, check https://ai.google.dev/gemini-api/docs/models
// for the current name and swap it in here — Google renames/retires these
// fairly often, and the error message it returns usually names the
// replacement directly.
const MODEL = "gemini-3.6-flash";

/** Runs a single prompt through Gemini and returns the raw text response. */
async function generate(prompt: string): Promise<string> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: MODEL,
    contents: prompt,
  });
  return response.text ?? "";
}

/** Strips ```json fences etc. and parses a JSON response defensively. */
function parseJson<T>(text: string): T {
  const cleaned = text
    .trim()
    .replace(/^```json/i, "")
    .replace(/^```/, "")
    .replace(/```$/, "")
    .trim();
  return JSON.parse(cleaned) as T;
}

export interface GeneratedResume {
  contact: {
    name: string;
    title: string;
    email: string;
    phone: string;
    location: string;
  };
  summary: string;
  experience: {
    company: string;
    role: string;
    location: string;
    startDate: string;
    endDate: string;
    bullets: string[];
  }[];
  education: {
    school: string;
    degree: string;
    field: string;
    startDate: string;
    endDate: string;
  }[];
  skills: { category: string; items: string[] }[];
}

/**
 * The "cakewalk" flagship feature: turn a handful of keywords/fragments
 * (optionally plus text extracted from an uploaded resume) into a complete,
 * well-written, structured resume draft.
 */
export async function generateResumeFromKeywords(
  keywords: string,
  uploadedText?: string
): Promise<GeneratedResume> {
  const prompt = `You are a senior professional resume writer who has written resumes for candidates who got hired at top companies. A user gave you rough keywords and fragments describing their background. Turn this into a complete, polished, ATS-friendly resume that reads like it was written by an expert — not generic AI filler.

Writing rules (follow strictly):
- Every experience bullet MUST start with a strong past-tense action verb (e.g. "Led", "Built", "Reduced", "Negotiated", "Launched") — never start with "Responsible for" or "Worked on".
- Every bullet should describe a concrete outcome or scope, not just a duty. Where the user implied impact but gave no number, use a bracketed placeholder like "[X]%" or "[X] team members" rather than inventing a fake specific statistic — but where the user DID give a number, use it exactly.
- Avoid generic corporate filler phrases ("results-driven", "team player", "detail-oriented", "hardworking individual", "go-getter") — show those qualities through specifics instead of naming them.
- Keep bullets to one line each, concrete and specific, no vague statements like "helped improve processes".
- The professional summary (2-3 sentences) should read like a specific pitch for this exact person — their role, years/level implied by their background, and their strongest concrete strength — not a template that could apply to anyone.
- Group skills sensibly (e.g. "Languages", "Frameworks", "Tools") and only include skills implied by what the user gave you — don't pad with unrelated buzzwords.
- If dates aren't given, use reasonable placeholders like "20XX".
- Return ONLY valid JSON, no markdown fences, no commentary, matching exactly this shape:

{
  "contact": {"name": "", "title": "", "email": "", "phone": "", "location": ""},
  "summary": "",
  "experience": [{"company": "", "role": "", "location": "", "startDate": "", "endDate": "", "bullets": [""]}],
  "education": [{"school": "", "degree": "", "field": "", "startDate": "", "endDate": ""}],
  "skills": [{"category": "", "items": [""]}]
}

User's keywords/fragments:
"""
${keywords}
"""

${uploadedText ? `Additional context extracted from an uploaded document:\n"""\n${uploadedText.slice(0, 6000)}\n"""` : ""}
`;

  const text = await generate(prompt);
  return parseJson<GeneratedResume>(text);
}

/** Rewrites a single bullet point to be stronger and more quantified. */
export async function rewriteBullet(bullet: string, targetLevel?: string): Promise<string> {
  const prompt = `Rewrite this resume bullet point to be stronger: start with a strong past-tense action verb (never "Responsible for" or "Worked on"), focus on concrete impact/outcome over duties, and keep it to one line. Avoid generic filler phrases. If it implies impact but gives no number, use a bracketed placeholder like "[X]%" rather than inventing a fake statistic. ${
    targetLevel ? `Tune the seniority/tone for a ${targetLevel} candidate.` : ""
  } Return ONLY the rewritten bullet text, nothing else.

Bullet: "${bullet}"`;
  const text = await generate(prompt);
  return text.trim();
}

/**
 * Humanizer: rewrites resume text along a spectrum from polished/professional
 * to natural/human-sounding, so the user can dial in how "AI" it reads.
 */
export async function humanizeText(
  text: string,
  style: "polished" | "natural" = "natural"
): Promise<string> {
  const instructions =
    style === "natural"
      ? "Rewrite this so it sounds like a real person wrote it: vary sentence rhythm, avoid stiff corporate-speak and repetitive AI phrasing (e.g. avoid words like 'leverage', 'utilize', 'spearheaded' if overused), keep it professional but warm and specific."
      : "Rewrite this to sound crisp, polished, and professional — precise corporate resume language, still natural, not robotic.";
  const prompt = `${instructions} Keep the same facts and meaning. Keep it to roughly the same length. Return ONLY the rewritten text, nothing else.

Text: "${text}"`;
  const result = await generate(prompt);
  return result.trim();
}

/** Generates a professional summary from the rest of the resume content. */
export async function generateSummary(resume: Partial<GeneratedResume>): Promise<string> {
  const prompt = `Write a concise, compelling 2-3 sentence professional summary for a resume, based on this data. Return ONLY the summary text.

${JSON.stringify(resume)}`;
  const result = await generate(prompt);
  return result.trim();
}

/** Rewrites text to a target seniority/tone level (entry, mid, senior, executive). */
export async function adjustTone(text: string, level: string): Promise<string> {
  const prompt = `Rewrite this resume text to match a "${level}" level candidate's tone and vocabulary — adjust confidence, scope, and word choice accordingly, without changing the underlying facts. Return ONLY the rewritten text.

Text: "${text}"`;
  const result = await generate(prompt);
  return result.trim();
}

export interface GrammarIssue {
  issue: string;
  suggestion: string;
}

/** Read-only grammar/clarity pass over the whole resume: lists issues, doesn't auto-edit. */
export async function grammarCheck(resumeText: string): Promise<GrammarIssue[]> {
  const prompt = `Proofread this resume text for grammar, clarity, punctuation, tense-consistency, and word-choice issues. Return ONLY a JSON array (no markdown fences), each item shaped {"issue": "", "suggestion": ""}. If there are no issues, return [].

RESUME:
"""
${resumeText.slice(0, 6000)}
"""`;
  const text = await generate(prompt);
  return parseJson<GrammarIssue[]>(text);
}

/** Suggests clarifying questions to help the user add missing metrics/numbers to their bullets. */
export async function quantifySuggestions(resumeText: string): Promise<string[]> {
  const prompt = `Look at this resume's experience bullets. For any bullet that implies impact but lacks a number (team size, percentage, revenue, time saved, users, etc.), write a short clarifying question that would help quantify it. Return ONLY a JSON array of strings (no markdown fences), max 6 questions. If everything is already well-quantified, return [].

RESUME:
"""
${resumeText.slice(0, 6000)}
"""`;
  const text = await generate(prompt);
  return parseJson<string[]>(text);
}

/** Turns resume content into a LinkedIn "About" section. */
export async function generateLinkedInAbout(resumeText: string): Promise<string> {
  const prompt = `Rewrite this resume's content as a first-person LinkedIn "About" section: 3-5 short paragraphs, conversational but professional, no headers or bullet points. Return ONLY the About text.

RESUME:
"""
${resumeText.slice(0, 6000)}
"""`;
  const result = await generate(prompt);
  return result.trim();
}

/** Predicts likely interview questions based on the resume and (optionally) a target job description. */
export async function predictInterviewQuestions(
  resumeText: string,
  jobDescription?: string
): Promise<string[]> {
  const prompt = `Based on this resume${
    jobDescription ? " and the target job description" : ""
  }, list 8 likely interview questions the candidate should prepare for — a mix of behavioral and role-specific technical questions. Return ONLY a JSON array of strings (no markdown fences).

RESUME:
"""
${resumeText.slice(0, 6000)}
"""
${jobDescription ? `\nJOB DESCRIPTION:\n"""\n${jobDescription.slice(0, 4000)}\n"""` : ""}`;
  const text = await generate(prompt);
  return parseJson<string[]>(text);
}

export interface JobMatchResult {
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
  atsScore: number;
}

/** Compares a resume against a job description: keyword gaps + suggestions. */
export async function matchJobDescription(
  resumeText: string,
  jobDescription: string
): Promise<JobMatchResult> {
  const prompt = `Compare this resume against the job description. Identify important keywords/skills from the job description that ARE present in the resume ("matchedKeywords"), important ones that are MISSING ("missingKeywords"), give 3-5 short actionable "suggestions" to improve alignment, and an overall "atsScore" from 0-100 estimating how well this resume would match an ATS keyword scan for this job.

Return ONLY valid JSON matching exactly this shape:
{"matchedKeywords": [""], "missingKeywords": [""], "suggestions": [""], "atsScore": 0}

RESUME:
"""
${resumeText.slice(0, 6000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 6000)}
"""`;
  const text = await generate(prompt);
  return parseJson<JobMatchResult>(text);
}

export interface AtsScoreResult {
  overallScore: number;
  formattingScore: number;
  contentScore: number;
  issues: string[];
  strengths: string[];
}

/** General ATS parseability + content-quality score, independent of any specific job. */
export async function scoreAts(resumeText: string): Promise<AtsScoreResult> {
  const prompt = `Act as an ATS (applicant tracking system) and resume-quality auditor. Evaluate this resume's plain text for: formatting/parseability concerns you can infer from structure, use of action verbs, quantified achievements, length, and clarity.

Return ONLY valid JSON matching exactly this shape:
{"overallScore": 0, "formattingScore": 0, "contentScore": 0, "issues": [""], "strengths": [""]}

RESUME:
"""
${resumeText.slice(0, 6000)}
"""`;
  const text = await generate(prompt);
  return parseJson<AtsScoreResult>(text);
}

/** Generates a cover letter matched to a resume + job description. */
export async function generateCoverLetter(
  resumeText: string,
  jobDescription: string,
  companyName?: string
): Promise<string> {
  const prompt = `Write a concise, specific, non-generic cover letter (3-4 short paragraphs) based on this resume, tailored to the job description below${
    companyName ? ` for ${companyName}` : ""
  }. Avoid clichés like "I am excited to apply". Return ONLY the letter text.

RESUME:
"""
${resumeText.slice(0, 6000)}
"""

JOB DESCRIPTION:
"""
${jobDescription.slice(0, 6000)}
"""`;
  const result = await generate(prompt);
  return result.trim();
}
