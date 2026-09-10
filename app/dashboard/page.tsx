"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, FileText, Loader2 } from "lucide-react";

interface ResumeSummary {
  _id: string;
  title: string;
  updatedAt: string;
  templateId?: string;
}

export default function DashboardPage() {
  const { status } = useSession();
  const router = useRouter();
  const [resumes, setResumes] = useState<ResumeSummary[] | null>(null);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((data) => setResumes(data.resumes || []));
  }, [status]);

  async function handleCreateBlank() {
    setCreating(true);
    try {
      const res = await fetch("/api/resumes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: "Untitled resume" }),
      });
      const data = await res.json();
      router.push(`/builder/${data.id}`);
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Delete this resume? This can't be undone.")) return;
    await fetch(`/api/resumes/${id}`, { method: "DELETE" });
    setResumes((prev) => prev?.filter((r) => r._id !== id) || null);
  }

  if (status !== "authenticated" || resumes === null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper text-ink-soft dark:bg-ink dark:text-paper/70">
        <Loader2 className="mr-2 animate-spin" size={18} /> Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10 dark:bg-ink">
      <div className="mx-auto max-w-4xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-paper">
            Your resumes
          </h1>
          <div className="flex gap-2">
            <Link
              href="/"
              className="rounded-sm border border-accent px-3 py-2 text-sm font-medium text-accent hover:bg-accent hover:text-white"
            >
              Generate from keywords
            </Link>
            <button
              onClick={handleCreateBlank}
              disabled={creating}
              className="flex items-center gap-1.5 rounded-sm bg-ink px-3 py-2 text-sm text-paper hover:bg-ink-soft dark:bg-accent"
            >
              {creating ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
              New blank resume
            </button>
          </div>
        </div>

        {resumes.length === 0 ? (
          <div className="mt-10 rounded-sm border border-dashed border-rule p-10 text-center text-ink-soft dark:border-ink-soft dark:text-paper/60">
            <FileText className="mx-auto mb-3 text-ink-faint" size={28} />
            No resumes yet. Generate your first one from a few keywords.
          </div>
        ) : (
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {resumes.map((r) => (
              <div
                key={r._id}
                className="group relative rounded-sm border border-rule bg-white p-5 shadow-paper transition hover:border-accent dark:border-ink-soft dark:bg-ink dark:text-paper"
              >
                <Link href={`/builder/${r._id}`}>
                  <p className="font-display text-lg font-semibold text-ink dark:text-paper">
                    {r.title || "Untitled resume"}
                  </p>
                  <p className="mt-1 text-xs text-ink-faint">
                    Updated {new Date(r.updatedAt).toLocaleDateString()}
                  </p>
                  <p className="mt-1 text-xs capitalize text-accent">{r.templateId || "editorial"} template</p>
                </Link>
                <button
                  onClick={() => handleDelete(r._id)}
                  className="absolute right-4 top-4 text-ink-faint opacity-0 hover:text-red-600 group-hover:opacity-100"
                  aria-label="Delete resume"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
