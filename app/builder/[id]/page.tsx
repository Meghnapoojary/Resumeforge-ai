"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import {
  Wand2,
  Sparkles,
  RefreshCw,
  Printer,
  Save,
  Target,
  FileText,
  FileDown,
  FileJson,
  Loader2,
  Palette,
  History,
  Share2,
  Copy,
  Linkedin,
  MessageCircleQuestion,
  SpellCheck2,
  Gauge,
  ListChecks,
} from "lucide-react";
import TemplateRenderer, { TEMPLATES } from "@/components/TemplateRenderer";
import { ACCENT_PRESETS } from "@/components/templates/types";
import { resumeToPlainText } from "@/lib/resumeText";
import { resizeImageFile } from "@/lib/imageResize";

type Resume = any;

export default function BuilderPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { status } = useSession();

  const [resume, setResume] = useState<Resume | null>(null);
  const [notFoundOrForbidden, setNotFoundOrForbidden] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<Date | null>(null);
  const [humanizeStyle, setHumanizeStyle] = useState<"polished" | "natural">("natural");
  const [toneLevel, setToneLevel] = useState("senior");
  const [busyKey, setBusyKey] = useState<string | null>(null);

  const [jobTitle, setJobTitle] = useState("");
  const [company, setCompany] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [matchResult, setMatchResult] = useState<any>(null);
  const [atsResult, setAtsResult] = useState<any>(null);
  const [coverLetter, setCoverLetter] = useState<string>("");
  const [trackerSaved, setTrackerSaved] = useState(false);

  const [linkedinAbout, setLinkedinAbout] = useState("");
  const [interviewQuestions, setInterviewQuestions] = useState<string[]>([]);
  const [grammarIssues, setGrammarIssues] = useState<{ issue: string; suggestion: string }[] | null>(null);
  const [quantifyQuestions, setQuantifyQuestions] = useState<string[] | null>(null);

  const [showHistory, setShowHistory] = useState(false);
  const [shareInfo, setShareInfo] = useState<{ isPublic: boolean; shareSlug?: string } | null>(null);
  const [photoUploading, setPhotoUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<"score" | "tailor" | "more">("score");
  // Keep comma-separated skill text local so typing remains smooth (arrays can otherwise reset the cursor).
  const [skillText, setSkillText] = useState<Record<number, string>>({});

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setPhotoUploading(true);
    try {
      const dataUrl = await resizeImageFile(file);
      updateField(["photo"], dataUrl);
    } catch (err: any) {
      alert(err.message || "Couldn't process that image.");
    } finally {
      setPhotoUploading(false);
    }
  }

  async function handleInlineImageUpload(e: React.ChangeEvent<HTMLInputElement>, path: string[], label: string) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file);
      updateField(path, dataUrl);
    } catch (err: any) {
      alert(err.message || `Couldn't process that ${label} image.`);
    } finally {
      e.target.value = "";
    }
  }

  function normalizedCertificate(cert: any) {
    return typeof cert === "string" ? { name: cert, issuer: "", date: "", link: "", image: "" } : (cert || { name: "", issuer: "", date: "", link: "", image: "" });
  }

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch(`/api/resumes/${id}`)
      .then(async (r) => {
        if (!r.ok) {
          setNotFoundOrForbidden(true);
          return null;
        }
        return r.json();
      })
      .then((data) => {
        if (data?.resume) {
          setResume(data.resume);
          setShareInfo({ isPublic: data.resume.isPublic, shareSlug: data.resume.shareSlug });
        }
      })
      .finally(() => setLoading(false));
  }, [id, status]);

  async function save(next: Resume = resume) {
    setSaving(true);
    try {
      const res = await fetch(`/api/resumes/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(next),
      });
      const data = await res.json();
      setResume(data.resume);
      setSavedAt(new Date());
    } finally {
      setSaving(false);
    }
  }

  async function callAi(action: string, payload: object, key: string) {
    setBusyKey(key);
    try {
      const res = await fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, ...payload }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      return data.result;
    } catch (err: any) {
      alert(err.message || "That tool hit an error. Try again.");
      return null;
    } finally {
      setBusyKey(null);
    }
  }

  function updateExperience(index: number, patch: any) {
    const next = [...(resume.experience || [])];
    next[index] = { ...next[index], ...patch };
    updateField(["experience"], next);
  }

  function updateEducation(index: number, patch: any) {
    const next = [...(resume.education || [])];
    next[index] = { ...next[index], ...patch };
    updateField(["education"], next);
  }

  function updateSkillItems(index: number, text: string) {
    setSkillText((prev) => ({ ...prev, [index]: text }));
    const next = [...(resume.skills || [])];
    next[index] = {
      ...next[index],
      items: text.split(",").map((item) => item.trim()).filter(Boolean),
    };
    updateField(["skills"], next);
  }

  function updateField(path: string[], value: any) {
    setResume((prev: Resume) => {
      const next = structuredClone(prev);
      let obj = next;
      for (let i = 0; i < path.length - 1; i++) {
        const key = path[i];
        const nextKey = path[i + 1];
        if (obj[key] == null) obj[key] = /^\d+$/.test(nextKey) ? [] : {};
        obj = obj[key];
      }
      obj[path[path.length - 1]] = value;
      return next;
    });
  }

  async function handleRewriteBullet(expIndex: number, bulletIndex: number) {
    const bullet = resume.experience[expIndex].bullets[bulletIndex];
    const result = await callAi("rewrite-bullet", { bullet }, `rewrite-${expIndex}-${bulletIndex}`);
    if (result) {
      const bullets = [...resume.experience[expIndex].bullets];
      bullets[bulletIndex] = result;
      const next = [...resume.experience];
      next[expIndex] = { ...next[expIndex], bullets };
      updateField(["experience"], next);
    }
  }

  async function handleHumanizeSummary() {
    const result = await callAi("humanize", { text: resume.summary, style: humanizeStyle }, "humanize-summary");
    if (result) updateField(["summary"], result);
  }

  async function handleAdjustTone() {
    const result = await callAi("adjust-tone", { text: resume.summary, level: toneLevel }, "adjust-tone");
    if (result) updateField(["summary"], result);
  }

  async function handleAtsScore() {
    const text = resumeToPlainText(resume);
    const result = await callAi("ats-score", { resumeText: text }, "ats-score");
    if (result) setAtsResult(result);
  }

  async function handleGrammarCheck() {
    const text = resumeToPlainText(resume);
    const result = await callAi("grammar-check", { resumeText: text }, "grammar-check");
    if (result) setGrammarIssues(result);
  }

  async function handleQuantifySuggestions() {
    const text = resumeToPlainText(resume);
    const result = await callAi("quantify-suggestions", { resumeText: text }, "quantify");
    if (result) setQuantifyQuestions(result);
  }

  async function handleLinkedInAbout() {
    const text = resumeToPlainText(resume);
    const result = await callAi("linkedin-about", { resumeText: text }, "linkedin");
    if (result) setLinkedinAbout(result);
  }

  async function handleInterviewQuestions() {
    const text = resumeToPlainText(resume);
    const result = await callAi(
      "interview-questions",
      { resumeText: text, jobDescription },
      "interview-questions"
    );
    if (result) setInterviewQuestions(result);
  }

  async function handleJobMatch() {
    if (!jobDescription.trim()) return;
    const text = resumeToPlainText(resume);
    const result = await callAi("match-job", { resumeText: text, jobDescription }, "job-match");
    if (result) setMatchResult(result);
  }

  async function handleCoverLetter() {
    if (!jobDescription.trim()) return;
    const text = resumeToPlainText(resume);
    const result = await callAi("cover-letter", { resumeText: text, jobDescription, companyName: company }, "cover-letter");
    if (result) setCoverLetter(result);
  }

  async function handleSaveToTracker() {
    if (!jobTitle.trim() || !company.trim()) {
      alert("Add a job title and company first.");
      return;
    }
    await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jobTitle,
        company,
        resumeId: id,
        jobDescriptionText: jobDescription,
        coverLetterText: coverLetter,
      }),
    });
    setTrackerSaved(true);
    setTimeout(() => setTrackerSaved(false), 3000);
  }

  async function handleToggleShare() {
    const makePublic = !shareInfo?.isPublic;
    const res = await fetch(`/api/resumes/${id}/share`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ makePublic }),
    });
    const data = await res.json();
    setShareInfo(data);
  }

  function restoreVersion(snapshot: any) {
    if (!confirm("Restore this version? Your current edits will be saved as a new snapshot first.")) return;
    setResume(snapshot);
    save(snapshot);
    setShowHistory(false);
  }

  if (status !== "authenticated" || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink-soft dark:bg-ink dark:text-paper/70">
        <Loader2 className="mr-2 animate-spin" size={18} /> Loading your resume...
      </div>
    );
  }

  if (notFoundOrForbidden || !resume) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-paper text-ink-soft dark:bg-ink dark:text-paper/70">
        Resume not found, or you don't have access to it.
      </div>
    );
  }

  const shareUrl = shareInfo?.shareSlug && typeof window !== "undefined"
    ? `${window.location.origin}/r/${shareInfo.shareSlug}`
    : "";

  return (
    <div className="min-h-screen bg-paper dark:bg-ink">
      {/* Top bar */}
      <div className="sticky top-[49px] z-10 flex flex-wrap items-center justify-between gap-2 border-b border-rule bg-paper/95 px-6 py-3 backdrop-blur dark:border-ink-soft dark:bg-ink/95 print:hidden">
        <p className="font-display text-lg font-semibold text-ink dark:text-paper">
          {resume.contact?.name ? `${resume.contact.name}'s resume` : "Your resume"}
        </p>
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-faint">{saving ? "Saving..." : savedAt ? "Saved" : ""}</span>
          <button
            onClick={() => setShowHistory(true)}
            className="flex items-center gap-1.5 rounded-sm border border-rule px-3 py-1.5 text-sm text-ink-soft hover:border-ink hover:text-ink dark:border-ink-soft dark:text-paper/70"
          >
            <History size={15} /> History
          </button>
          <button
            onClick={handleToggleShare}
            className="flex items-center gap-1.5 rounded-sm border border-rule px-3 py-1.5 text-sm text-ink-soft hover:border-ink hover:text-ink dark:border-ink-soft dark:text-paper/70"
          >
            <Share2 size={15} /> {shareInfo?.isPublic ? "Public" : "Share"}
          </button>
          <button
            onClick={() => save()}
            className="flex items-center gap-1.5 rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
          >
            <Save size={15} /> Save
          </button>
          <a
            href={`/api/resumes/${id}/export-json`}
            className="flex items-center gap-1.5 rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
          >
            <FileJson size={15} /> JSON
          </a>
          <a
            href={`/api/resumes/${id}/export-docx`}
            className="flex items-center gap-1.5 rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
          >
            <FileDown size={15} /> DOCX
          </a>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 rounded-sm bg-accent px-3 py-1.5 text-sm text-white hover:bg-accent-deep"
          >
            <Printer size={15} /> PDF
          </button>
        </div>
      </div>

      {shareInfo?.isPublic && shareUrl && (
        <div className="mx-6 mt-3 flex items-center justify-between gap-2 rounded-sm border border-accent/30 bg-accent/5 px-4 py-2 text-sm text-ink dark:text-paper print:hidden">
          <span className="truncate">{shareUrl}</span>
          <button
            onClick={() => navigator.clipboard.writeText(shareUrl)}
            className="flex shrink-0 items-center gap-1 text-accent hover:underline"
          >
            <Copy size={13} /> Copy link
          </button>
        </div>
      )}

      {/* History drawer */}
      {showHistory && (
        <div className="fixed inset-0 z-30 flex justify-end bg-black/30 print:hidden" onClick={() => setShowHistory(false)}>
          <div
            className="h-full w-full max-w-md overflow-y-auto bg-white p-6 dark:bg-ink dark:text-paper"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 className="font-display text-lg font-semibold">Version history</h2>
            <p className="mt-1 text-sm text-ink-soft dark:text-paper/60">
              Last {resume.versions?.length || 0} saves. Restoring saves your current state first.
            </p>
            <div className="mt-4 space-y-2">
              {(resume.versions || []).slice().reverse().map((v: any, i: number) => (
                <div key={i} className="flex items-center justify-between rounded-sm border border-rule px-3 py-2 text-sm dark:border-ink-soft">
                  <span>{new Date(v.savedAt).toLocaleString()}</span>
                  <button onClick={() => restoreVersion(v.snapshot)} className="text-accent hover:underline">
                    Restore
                  </button>
                </div>
              ))}
              {!resume.versions?.length && <p className="text-sm text-ink-faint">No earlier versions yet.</p>}
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-8 px-6 py-8 lg:grid-cols-[1fr_420px]">
        {/* Left: editable form + live preview */}
        <div className="space-y-8 builder-editor">
          {/* Template & theme */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center gap-2">
              <Palette size={16} className="text-accent" />
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">
                Template & theme
              </h2>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {TEMPLATES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => updateField(["templateId"], t.id)}
                  className={`rounded-sm border px-3 py-1.5 text-sm ${
                    resume.templateId === t.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-rule text-ink-soft hover:border-ink dark:border-ink-soft dark:text-paper/70"
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <div className="flex gap-1.5">
                {ACCENT_PRESETS.map((c) => (
                  <button
                    key={c.value}
                    onClick={() => updateField(["theme", "accent"], c.value)}
                    title={c.name}
                    className="h-6 w-6 rounded-full border-2"
                    style={{
                      backgroundColor: c.value,
                      borderColor: resume.theme?.accent === c.value ? "#0E1B33" : "transparent",
                    }}
                  />
                ))}
              </div>
              <select
                value={resume.theme?.density || "comfortable"}
                onChange={(e) => updateField(["theme", "density"], e.target.value)}
                className="rounded-sm border border-rule px-2 py-1 text-xs dark:border-ink-soft dark:bg-transparent"
              >
                <option value="comfortable">Comfortable spacing</option>
                <option value="compact">Compact spacing</option>
              </select>
            </div>
          </section>

          {/* Contact */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">
              Contact
            </h2>
            <div className="mt-3 flex items-center gap-4">
              {resume.photo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={resume.photo} alt="" className="h-16 w-16 rounded-full object-cover" />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-dashed border-rule text-[10px] text-ink-faint dark:border-ink-soft">
                  No photo
                </div>
              )}
              <div className="flex items-center gap-2">
                <label className="cursor-pointer rounded-sm border border-rule px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink dark:border-ink-soft dark:text-paper/70">
                  {photoUploading ? "Uploading..." : resume.photo ? "Change photo" : "Add photo"}
                  <input type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} disabled={photoUploading} />
                </label>
                {resume.photo && (
                  <button
                    onClick={() => updateField(["photo"], "")}
                    className="text-xs text-ink-faint hover:text-red-600"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {["name", "title", "email", "phone", "location"].map((f) => (
                <input
                  key={f}
                  value={resume.contact?.[f] || ""}
                  placeholder={f}
                  onChange={(e) => updateField(["contact", f], e.target.value)}
                  className="rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent"
                />
              ))}
            </div>
          </section>

          {/* Summary */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">
                Summary
              </h2>
              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={humanizeStyle}
                  onChange={(e) => setHumanizeStyle(e.target.value as any)}
                  className="rounded-sm border border-rule bg-white px-2 py-1 text-xs text-ink-soft dark:border-ink-soft dark:bg-transparent"
                >
                  <option value="natural">More human</option>
                  <option value="polished">More polished</option>
                </select>
                <button
                  onClick={handleHumanizeSummary}
                  disabled={busyKey === "humanize-summary"}
                  className="flex items-center gap-1 rounded-sm bg-accent/90 px-2.5 py-1 text-xs font-medium text-white hover:bg-accent"
                >
                  {busyKey === "humanize-summary" ? <Loader2 size={13} className="animate-spin" /> : <Wand2 size={13} />}
                  Humanize
                </button>
                <select
                  value={toneLevel}
                  onChange={(e) => setToneLevel(e.target.value)}
                  className="rounded-sm border border-rule bg-white px-2 py-1 text-xs text-ink-soft dark:border-ink-soft dark:bg-transparent"
                >
                  <option value="entry-level">Entry-level tone</option>
                  <option value="mid-level">Mid-level tone</option>
                  <option value="senior">Senior tone</option>
                  <option value="executive">Executive tone</option>
                </select>
                <button
                  onClick={handleAdjustTone}
                  disabled={busyKey === "adjust-tone"}
                  className="flex items-center gap-1 rounded-sm border border-ink px-2.5 py-1 text-xs font-medium text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
                >
                  {busyKey === "adjust-tone" ? <Loader2 size={13} className="animate-spin" /> : <Gauge size={13} />}
                  Adjust tone
                </button>
              </div>
            </div>
            <textarea
              value={resume.summary || ""}
              onChange={(e) => updateField(["summary"], e.target.value)}
              rows={3}
              className="mt-3 w-full resize-none rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent"
            />
          </section>

          {/* Experience */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">Experience</h2>
              <button onClick={() => updateField(["experience"], [...(resume.experience || []), { role: "", company: "", location: "", startDate: "", endDate: "", bullets: [""] }])} className="rounded-sm border border-accent px-2.5 py-1 text-xs text-accent hover:bg-accent hover:text-white">+ Add experience</button>
            </div>
            <div className="mt-3 space-y-5">
              {(resume.experience || []).map((exp: any, i: number) => (
                <div key={i} className="border-b border-rule pb-4 last:border-0 last:pb-0 dark:border-ink-soft">
                  <div className="grid grid-cols-2 gap-2">
                    {["role", "company", "location", "startDate", "endDate"].map((f) => (
                      <input
                        key={f}
                        value={exp[f] || ""}
                        placeholder={f}
                        onChange={(e) => {
                          const next = [...resume.experience];
                          next[i] = { ...next[i], [f]: e.target.value };
                          updateField(["experience"], next);
                        }}
                        className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent"
                      />
                    ))}
                  </div>
                  <div className="mt-2 space-y-1.5">
                    {(exp.bullets || []).map((bullet: string, j: number) => (
                      <div key={j} className="flex items-start gap-2">
                        <textarea
                          value={bullet}
                          rows={2}
                          onChange={(e) => {
                            const bullets = [...exp.bullets];
                            bullets[j] = e.target.value;
                            const next = [...resume.experience];
                            next[i] = { ...next[i], bullets };
                            updateField(["experience"], next);
                          }}
                          className="flex-1 resize-none rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent"
                        />
                        <button
                          onClick={() => handleRewriteBullet(i, j)}
                          disabled={busyKey === `rewrite-${i}-${j}`}
                          title="Rewrite with AI"
                          className="mt-1 shrink-0 rounded-sm border border-rule p-1.5 text-ink-soft hover:border-ink hover:text-ink dark:border-ink-soft dark:text-paper/70"
                        >
                          {busyKey === `rewrite-${i}-${j}` ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
                        </button>
                      </div>
                    ))}
                  </div>
                  <button onClick={() => updateField(["experience"], resume.experience.filter((_: any, index: number) => index !== i))} className="mt-2 text-xs text-red-600 hover:underline">Remove experience</button>
                </div>
              ))}
            </div>
          </section>

          {/* Education */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">Education</h2>
              <button onClick={() => updateField(["education"], [...(resume.education || []), { school: "", degree: "", field: "", startDate: "", endDate: "" }])} className="rounded-sm border border-accent px-2.5 py-1 text-xs text-accent hover:bg-accent hover:text-white">+ Add education</button>
            </div>
            <div className="mt-3 space-y-4">
              {(resume.education || []).map((ed: any, i: number) => (
                <div key={i} className="border-b border-rule pb-4 last:border-0">
                  <div className="grid grid-cols-2 gap-2">
                    {["school", "degree", "field", "startDate", "endDate"].map((f) => (
                      <input key={f} value={ed[f] || ""} placeholder={f} onChange={(e) => updateEducation(i, { [f]: e.target.value })} className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                    ))}
                  </div>
                  <button onClick={() => updateField(["education"], resume.education.filter((_: any, index: number) => index !== i))} className="mt-2 text-xs text-red-600 hover:underline">Remove education</button>
                </div>
              ))}
            </div>
          </section>

          {/* Skills */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">Skills</h2>
              <button onClick={() => updateField(["skills"], [...(resume.skills || []), { category: "", items: [] }])} className="rounded-sm border border-accent px-2.5 py-1 text-xs text-accent hover:bg-accent hover:text-white">+ Add skill group</button>
            </div>
            <div className="mt-3 space-y-4">
              {(resume.skills || []).map((skill: any, i: number) => (
                <div key={i} className="border-b border-rule pb-4 last:border-0">
                  <input value={skill.category || ""} placeholder="Category (e.g. Languages)" onChange={(e) => { const next=[...(resume.skills || [])]; next[i]={...next[i],category:e.target.value}; updateField(["skills"],next); }} className="w-full rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                  <input value={skillText[i] ?? (skill.items || []).join(", ")} placeholder="Skills, separated by commas" onChange={(e) => updateSkillItems(i, e.target.value)} className="mt-2 w-full rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                  <button onClick={() => updateField(["skills"], resume.skills.filter((_: any, index: number) => index !== i))} className="mt-2 text-xs text-red-600 hover:underline">Remove skill group</button>
                </div>
              ))}
            </div>
          </section>

          {/* Projects */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">Projects</h2>
              <button onClick={() => updateField(["projects"], [...(resume.projects || []), { name: "", description: "", bullets: [""], link: "", image: "" }])} className="rounded-sm border border-accent px-2.5 py-1 text-xs text-accent hover:bg-accent hover:text-white">+ Add project</button>
            </div>
            <div className="mt-3 space-y-5">
              {(resume.projects || []).map((project: any, i: number) => (
                <div key={i} className="border-b border-rule pb-4 last:border-0 last:pb-0 dark:border-ink-soft">
                  <div className="grid grid-cols-2 gap-2">
                    <input value={project.name || ""} placeholder="Project name" onChange={(e) => updateField(["projects", String(i), "name"], e.target.value)} className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                    <input value={project.link || ""} placeholder="Project / GitHub / demo link" onChange={(e) => updateField(["projects", String(i), "link"], e.target.value)} className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                  </div>
                  <textarea value={project.description || ""} placeholder="Brief project description" rows={3} onChange={(e) => updateField(["projects", String(i), "description"], e.target.value)} className="mt-2 w-full resize-none rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                  <div className="mt-2 space-y-1.5">
                    {(project.bullets || []).map((bullet: string, j: number) => (
                      <div key={j} className="flex gap-2">
                        <input value={bullet} placeholder="Achievement / technology / contribution" onChange={(e) => { const bullets=[...(project.bullets || [])]; bullets[j]=e.target.value; const next=[...(resume.projects || [])]; next[i]={...next[i], bullets}; updateField(["projects"], next); }} className="flex-1 rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                        <button onClick={() => { const bullets=(project.bullets || []).filter((_: any, index: number) => index !== j); const next=[...(resume.projects || [])]; next[i]={...next[i], bullets}; updateField(["projects"], next); }} className="text-xs text-red-600 hover:underline">Remove</button>
                      </div>
                    ))}
                    <button onClick={() => { const next=[...(resume.projects || [])]; next[i]={...next[i], bullets:[...(next[i].bullets || []), ""]}; updateField(["projects"], next); }} className="text-xs text-accent hover:underline">+ Add project bullet</button>
                  </div>
                  <div className="mt-3 flex items-center gap-3">
                    {project.image ? <img src={project.image} alt="" className="h-16 w-24 rounded-sm border border-rule object-cover dark:border-ink-soft" /> : <div className="flex h-16 w-24 items-center justify-center rounded-sm border border-dashed border-rule text-[10px] text-ink-faint dark:border-ink-soft">No image</div>}
                    <label className="cursor-pointer rounded-sm border border-rule px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink dark:border-ink-soft dark:text-paper/70">
                      {project.image ? "Change image" : "Add project image"}
                      <input type="file" accept="image/*" className="hidden" onChange={(e) => handleInlineImageUpload(e, ["projects", String(i), "image"], "project")} />
                    </label>
                    {project.image && <button onClick={() => updateField(["projects", String(i), "image"], "")} className="text-xs text-ink-faint hover:text-red-600">Remove image</button>}
                  </div>
                  <button onClick={() => updateField(["projects"], resume.projects.filter((_: any, index: number) => index !== i))} className="mt-3 text-xs text-red-600 hover:underline">Remove project</button>
                </div>
              ))}
            </div>
          </section>

          {/* Certifications */}
          <section className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70">Certificates</h2>
              <button onClick={() => updateField(["certifications"], [...(resume.certifications || []), { name: "", issuer: "", date: "", link: "", image: "" }])} className="rounded-sm border border-accent px-2.5 py-1 text-xs text-accent hover:bg-accent hover:text-white">+ Add certificate</button>
            </div>
            <div className="mt-3 space-y-5">
              {(resume.certifications || []).map((raw: any, i: number) => {
                const cert = normalizedCertificate(raw);
                return (
                  <div key={i} className="border-b border-rule pb-4 last:border-0 last:pb-0 dark:border-ink-soft">
                    <div className="grid grid-cols-2 gap-2">
                      <input value={cert.name || ""} placeholder="Certificate name" onChange={(e) => { const next=[...(resume.certifications || [])]; next[i]={...cert, name:e.target.value}; updateField(["certifications"], next); }} className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                      <input value={cert.issuer || ""} placeholder="Issuing organization" onChange={(e) => { const next=[...(resume.certifications || [])]; next[i]={...cert, issuer:e.target.value}; updateField(["certifications"], next); }} className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                      <input value={cert.date || ""} placeholder="Date / year" onChange={(e) => { const next=[...(resume.certifications || [])]; next[i]={...cert, date:e.target.value}; updateField(["certifications"], next); }} className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                      <input value={cert.link || ""} placeholder="Certificate / verification link" onChange={(e) => { const next=[...(resume.certifications || [])]; next[i]={...cert, link:e.target.value}; updateField(["certifications"], next); }} className="rounded-sm border border-rule px-2 py-1.5 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent" />
                    </div>
                    <div className="mt-3 flex items-center gap-3">
                      {cert.image ? <img src={cert.image} alt="" className="h-16 w-24 rounded-sm border border-rule object-cover dark:border-ink-soft" /> : <div className="flex h-16 w-24 items-center justify-center rounded-sm border border-dashed border-rule text-[10px] text-ink-faint dark:border-ink-soft">No image</div>}
                      <label className="cursor-pointer rounded-sm border border-rule px-3 py-1.5 text-xs text-ink-soft hover:border-ink hover:text-ink dark:border-ink-soft dark:text-paper/70">
                        {cert.image ? "Change image" : "Add certificate image"}
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => handleInlineImageUpload(e, ["certifications", String(i), "image"], "certificate")} />
                      </label>
                      {cert.image && <button onClick={() => updateField(["certifications", String(i), "image"], "")} className="text-xs text-ink-faint hover:text-red-600">Remove image</button>}
                    </div>
                    <button onClick={() => updateField(["certifications"], resume.certifications.filter((_: any, index: number) => index !== i))} className="mt-3 text-xs text-red-600 hover:underline">Remove certificate</button>
                  </div>
                );
              })}
            </div>
          </section>

          {/* Live preview */}
          <section className="resume-preview">
            <h2 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/70 print:hidden">
              Live preview
            </h2>
            <div className="overflow-hidden rounded-sm">
              <TemplateRenderer
                templateId={resume.templateId}
                resume={resume}
                accent={resume.theme?.accent}
                density={resume.theme?.density}
              />
            </div>
          </section>
        </div>

        {/* Right: AI tools sidebar */}
        <aside className="space-y-4 print:hidden">
          {/* Tab nav */}
          <div className="flex gap-1 rounded-sm border border-rule bg-white p-1 dark:border-ink-soft dark:bg-ink">
            {(
              [
                { key: "score", label: "Score & Polish" },
                { key: "tailor", label: "Tailor to Job" },
                { key: "more", label: "More Tools" },
              ] as const
            ).map((t) => (
              <button
                key={t.key}
                onClick={() => setActiveTab(t.key)}
                className={`flex-1 rounded-sm px-2 py-1.5 text-xs font-medium transition ${
                  activeTab === t.key
                    ? "bg-accent text-white"
                    : "text-ink-soft hover:text-ink dark:text-paper/60 dark:hover:text-paper"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {activeTab === "score" && (
            <>
          {/* ATS score */}
          <div className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center gap-2">
              <Target size={16} className="text-accent" />
              <h3 className="font-display text-sm font-semibold">ATS score</h3>
            </div>
            <button
              onClick={handleAtsScore}
              disabled={busyKey === "ats-score"}
              className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-sm bg-ink px-3 py-2 text-sm text-paper hover:bg-ink-soft dark:bg-accent"
            >
              {busyKey === "ats-score" ? <Loader2 size={14} className="animate-spin" /> : <Sparkles size={14} />}
              Check my score
            </button>
            {atsResult && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-semibold text-ink dark:text-paper">Overall: {atsResult.overallScore}/100</p>
                <p className="text-ink-soft dark:text-paper/70">Formatting: {atsResult.formattingScore}/100</p>
                <p className="text-ink-soft dark:text-paper/70">Content: {atsResult.contentScore}/100</p>
                {!!atsResult.issues?.length && (
                  <div>
                    <p className="font-medium text-ink dark:text-paper">To improve</p>
                    <ul className="list-disc pl-4 text-ink-soft dark:text-paper/70">
                      {atsResult.issues.map((i: string, idx: number) => (
                        <li key={idx}>{i}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Grammar & quantify */}
          <div className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center gap-2">
              <SpellCheck2 size={16} className="text-accent" />
              <h3 className="font-display text-sm font-semibold">Proofread & quantify</h3>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                onClick={handleGrammarCheck}
                disabled={busyKey === "grammar-check"}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-ink px-2 py-2 text-xs text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
              >
                {busyKey === "grammar-check" ? <Loader2 size={13} className="animate-spin" /> : null}
                Grammar pass
              </button>
              <button
                onClick={handleQuantifySuggestions}
                disabled={busyKey === "quantify"}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-ink px-2 py-2 text-xs text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
              >
                {busyKey === "quantify" ? <Loader2 size={13} className="animate-spin" /> : null}
                Missing numbers
              </button>
            </div>
            {grammarIssues && (
              <div className="mt-3 space-y-1.5 text-sm">
                {grammarIssues.length === 0 ? (
                  <p className="text-ink-soft dark:text-paper/70">No issues found — looks clean.</p>
                ) : (
                  grammarIssues.map((g, i) => (
                    <div key={i} className="border-l-2 border-accent pl-2">
                      <p className="text-ink dark:text-paper">{g.issue}</p>
                      <p className="text-xs text-ink-soft dark:text-paper/60">→ {g.suggestion}</p>
                    </div>
                  ))
                )}
              </div>
            )}
            {quantifyQuestions && (
              <div className="mt-3 space-y-1 text-sm">
                {quantifyQuestions.length === 0 ? (
                  <p className="text-ink-soft dark:text-paper/70">Your bullets are already well quantified.</p>
                ) : (
                  <ul className="list-disc space-y-1 pl-4 text-ink-soft dark:text-paper/70">
                    {quantifyQuestions.map((q, i) => (
                      <li key={i}>{q}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </div>

            </>
          )}

          {activeTab === "tailor" && (
            <>
          {/* Job match + cover letter + tracker */}
          <div className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-accent" />
              <h3 className="font-display text-sm font-semibold">Tailor to a job</h3>
            </div>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <input
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Job title"
                className="rounded-sm border border-rule px-2 py-1.5 text-sm dark:border-ink-soft dark:bg-transparent"
              />
              <input
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                placeholder="Company"
                className="rounded-sm border border-rule px-2 py-1.5 text-sm dark:border-ink-soft dark:bg-transparent"
              />
            </div>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description..."
              rows={5}
              className="mt-2 w-full resize-none rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent"
            />
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={handleJobMatch}
                disabled={busyKey === "job-match"}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-ink px-3 py-2 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
              >
                {busyKey === "job-match" ? <Loader2 size={14} className="animate-spin" /> : null}
                Match & score
              </button>
              <button
                onClick={handleCoverLetter}
                disabled={busyKey === "cover-letter"}
                className="flex items-center justify-center gap-1.5 rounded-sm border border-ink px-3 py-2 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
              >
                {busyKey === "cover-letter" ? <Loader2 size={14} className="animate-spin" /> : null}
                Cover letter
              </button>
            </div>
            <button
              onClick={handleSaveToTracker}
              className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-sm bg-accent px-3 py-2 text-sm text-white hover:bg-accent-deep"
            >
              <ListChecks size={14} /> {trackerSaved ? "Saved to tracker ✓" : "Save to tracker"}
            </button>

            {matchResult && (
              <div className="mt-3 space-y-2 text-sm">
                <p className="font-semibold text-ink dark:text-paper">Estimated match: {matchResult.atsScore}/100</p>
                {!!matchResult.missingKeywords?.length && (
                  <div>
                    <p className="font-medium text-ink dark:text-paper">Missing keywords</p>
                    <p className="text-ink-soft dark:text-paper/70">{matchResult.missingKeywords.join(", ")}</p>
                  </div>
                )}
                {!!matchResult.suggestions?.length && (
                  <div>
                    <p className="font-medium text-ink dark:text-paper">Suggestions</p>
                    <ul className="list-disc pl-4 text-ink-soft dark:text-paper/70">
                      {matchResult.suggestions.map((s: string, idx: number) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {coverLetter && (
              <div className="mt-3">
                <p className="mb-1 text-sm font-medium text-ink dark:text-paper">Cover letter draft</p>
                <textarea
                  value={coverLetter}
                  onChange={(e) => setCoverLetter(e.target.value)}
                  rows={10}
                  className="w-full resize-none rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent"
                />
              </div>
            )}
          </div>

            </>
          )}

          {activeTab === "more" && (
            <>
          {/* More tools: LinkedIn + interview prep */}
          <div className="rounded-sm border border-rule bg-white p-5 dark:border-ink-soft dark:bg-ink dark:text-paper">
            <h3 className="font-display text-sm font-semibold">More tools</h3>
            <div className="mt-3 space-y-2">
              <button
                onClick={handleLinkedInAbout}
                disabled={busyKey === "linkedin"}
                className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-ink px-3 py-2 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
              >
                {busyKey === "linkedin" ? <Loader2 size={14} className="animate-spin" /> : <Linkedin size={14} />}
                Generate LinkedIn About
              </button>
              {linkedinAbout && (
                <textarea
                  value={linkedinAbout}
                  onChange={(e) => setLinkedinAbout(e.target.value)}
                  rows={6}
                  className="w-full resize-none rounded-sm border border-rule px-3 py-2 text-sm dark:border-ink-soft dark:bg-transparent"
                />
              )}

              <button
                onClick={handleInterviewQuestions}
                disabled={busyKey === "interview-questions"}
                className="flex w-full items-center justify-center gap-1.5 rounded-sm border border-ink px-3 py-2 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper"
              >
                {busyKey === "interview-questions" ? (
                  <Loader2 size={14} className="animate-spin" />
                ) : (
                  <MessageCircleQuestion size={14} />
                )}
                Predict interview questions
              </button>
              {!!interviewQuestions.length && (
                <ol className="list-decimal space-y-1 pl-4 text-sm text-ink-soft dark:text-paper/70">
                  {interviewQuestions.map((q, i) => (
                    <li key={i}>{q}</li>
                  ))}
                </ol>
              )}
            </div>
          </div>
            </>
          )}
        </aside>
      </div>
    </div>
  );
}
