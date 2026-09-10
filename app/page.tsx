"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowRight, UploadCloud, Sparkles, FileCheck2, Wand2 } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { status } = useSession();
  const [keywords, setKeywords] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [uploadedText, setUploadedText] = useState<string | undefined>(undefined);
  const [parsing, setParsing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setError(null);
    setUploadedText(undefined);

    const isPlainText = file.name.endsWith(".txt") || file.name.endsWith(".md");
    if (isPlainText) {
      setUploadedText(await file.text());
      return;
    }

    // PDF/DOCX are parsed server-side (pdf-parse / mammoth).
    setParsing(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/parse-upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Couldn't read that file.");
      setUploadedText(data.text);
    } catch (err: any) {
      setError(err.message);
      setFileName(null);
    } finally {
      setParsing(false);
    }
  }

  async function handleGenerate() {
    setError(null);
    if (!keywords.trim()) {
      setError("Add a few keywords about your background first.");
      return;
    }
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keywords, uploadedText }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Something went wrong.");
      router.push(`/builder/${data.id}`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-paper dark:bg-ink">
      {/* Hero */}
      <section className="mx-auto max-w-3xl px-6 pt-20 pb-12 text-center">
        <p className="font-body text-sm font-medium text-accent">Free, forever</p>
        <h1 className="mt-3 font-display text-5xl font-semibold leading-[1.1] text-ink dark:text-paper sm:text-6xl">
          Type a few keywords.
          <br />
          Get a finished resume.
        </h1>
        <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-ink-soft dark:text-paper/70">
          Skip the blank form. Drop in fragments of your background — the AI writes a complete,
          polished, ATS-ready draft. Then fine-tune it with the tools below until it's exactly
          right.
        </p>
      </section>

      {/* Input card — the cakewalk moment */}
      <section className="mx-auto max-w-2xl px-6">
        <div className="rounded-sm border border-rule bg-white p-6 shadow-paper dark:border-ink-soft dark:bg-ink dark:text-paper sm:p-8">
          <label htmlFor="keywords" className="font-display text-lg font-semibold text-ink dark:text-paper">
            What's your background?
          </label>
          <p className="mt-1 text-sm text-ink-faint">
            A few fragments are enough — "react dev, 3 yrs, fintech, led team of 4, cut load
            time 40%"
          </p>
          <textarea
            id="keywords"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            rows={5}
            placeholder="Paste keywords, rough bullet points, or a career summary..."
            className="mt-3 w-full resize-none rounded-sm border border-rule bg-paper/40 p-3 text-[15px] leading-relaxed text-ink placeholder:text-ink-faint focus:border-accent focus:bg-white focus:outline-none dark:border-ink-soft dark:bg-transparent dark:text-paper dark:focus:bg-transparent"
          />

          <div className="mt-4 flex items-center justify-between gap-3 border-t border-rule pt-4 dark:border-ink-soft">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft hover:text-ink dark:text-paper/70 dark:hover:text-paper">
              {parsing ? (
                <Sparkles size={18} className="animate-pulse" />
              ) : (
                <UploadCloud size={18} />
              )}
              <span>
                {parsing
                  ? `Reading ${fileName}...`
                  : fileName && uploadedText
                  ? `${fileName} — loaded ✓`
                  : "Upload an existing resume (optional) — PDF, DOCX, TXT, or MD"}
              </span>
              <input
                type="file"
                accept=".txt,.md,.pdf,.docx"
                className="hidden"
                onChange={handleFile}
                disabled={parsing}
              />
            </label>
          </div>

          {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

          <button
            onClick={handleGenerate}
            disabled={loading || parsing}
            className="mt-5 flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 font-body text-[15px] font-medium text-white transition hover:bg-accent-deep disabled:opacity-60"
          >
            {loading ? (
              <>
                <Sparkles size={18} className="animate-pulse" /> Writing your resume...
              </>
            ) : status === "unauthenticated" ? (
              <>
                Sign in to generate <ArrowRight size={18} />
              </>
            ) : (
              <>
                Generate my resume <ArrowRight size={18} />
              </>
            )}
          </button>
        </div>
      </section>

      {/* What happens next / feature strip */}
      <section className="mx-auto mt-16 max-w-4xl px-6 pb-24">
        <div className="grid gap-8 sm:grid-cols-3">
          <Feature
            icon={<Sparkles size={20} />}
            title="AI writes the first draft"
            body="Fragments become full, quantified achievement bullets and a real summary — not a blank template."
          />
          <Feature
            icon={<Wand2 size={20} />}
            title="Humanize with one click"
            body="Dial your resume from polished-and-professional to natural-and-human, whenever it reads too much like AI."
          />
          <Feature
            icon={<FileCheck2 size={20} />}
            title="Tailor and score"
            body="Match any job description, close keyword gaps, and check your ATS score before you apply."
          />
        </div>
      </section>
    </main>
  );
}

function Feature({
  icon,
  title,
  body,
}: {
  icon: React.ReactNode;
  title: string;
  body: string;
}) {
  return (
    <div>
      <div className="text-accent">{icon}</div>
      <h3 className="mt-3 font-display text-base font-semibold text-ink dark:text-paper">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-soft dark:text-paper/70">{body}</p>
    </div>
  );
}
