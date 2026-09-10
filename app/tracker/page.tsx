"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Trash2, Loader2, X } from "lucide-react";

interface Application {
  _id: string;
  jobTitle: string;
  company: string;
  status: "applied" | "interviewing" | "offer" | "rejected";
  resumeId?: string;
  jobDescriptionText?: string;
  createdAt: string;
}

const COLUMNS: { key: Application["status"]; label: string }[] = [
  { key: "applied", label: "Applied" },
  { key: "interviewing", label: "Interviewing" },
  { key: "offer", label: "Offer" },
  { key: "rejected", label: "Rejected" },
];

export default function TrackerPage() {
  const { status } = useSession();
  const router = useRouter();
  const [applications, setApplications] = useState<Application[] | null>(null);
  const [resumes, setResumes] = useState<{ _id: string; title: string }[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ jobTitle: "", company: "", resumeId: "", jobDescriptionText: "" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") router.push("/login");
  }, [status, router]);

  useEffect(() => {
    if (status !== "authenticated") return;
    fetch("/api/applications")
      .then((r) => r.json())
      .then((d) => setApplications(d.applications || []));
    fetch("/api/resumes")
      .then((r) => r.json())
      .then((d) => setResumes(d.resumes?.map((r: any) => ({ _id: r._id, title: r.title })) || []));
  }, [status]);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!form.jobTitle || !form.company) return;
    setSaving(true);
    try {
      const res = await fetch("/api/applications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      setApplications((prev) => [data.application, ...(prev || [])]);
      setForm({ jobTitle: "", company: "", resumeId: "", jobDescriptionText: "" });
      setShowForm(false);
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, newStatus: Application["status"]) {
    setApplications((prev) => prev?.map((a) => (a._id === id ? { ...a, status: newStatus } : a)) || null);
    await fetch(`/api/applications/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
  }

  async function remove(id: string) {
    await fetch(`/api/applications/${id}`, { method: "DELETE" });
    setApplications((prev) => prev?.filter((a) => a._id !== id) || null);
  }

  if (status !== "authenticated" || applications === null) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center bg-paper text-ink-soft dark:bg-ink dark:text-paper/70">
        <Loader2 className="mr-2 animate-spin" size={18} /> Loading...
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-paper px-6 py-10 dark:bg-ink">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-center justify-between">
          <h1 className="font-display text-3xl font-semibold text-ink dark:text-paper">
            Application tracker
          </h1>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-1.5 rounded-sm bg-accent px-3 py-2 text-sm text-white hover:bg-accent-deep"
          >
            <Plus size={15} /> Add application
          </button>
        </div>

        {showForm && (
          <form
            onSubmit={handleAdd}
            className="relative mt-5 rounded-sm border border-rule bg-white p-5 shadow-paper dark:border-ink-soft dark:bg-ink"
          >
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="absolute right-4 top-4 text-ink-faint hover:text-ink"
            >
              <X size={16} />
            </button>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                value={form.jobTitle}
                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                placeholder="Job title"
                required
                className="rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent dark:text-paper"
              />
              <input
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                placeholder="Company"
                required
                className="rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent dark:text-paper"
              />
              <select
                value={form.resumeId}
                onChange={(e) => setForm({ ...form, resumeId: e.target.value })}
                className="rounded-sm border border-rule px-3 py-2 text-sm dark:border-ink-soft dark:bg-transparent dark:text-paper"
              >
                <option value="">Link a resume (optional)</option>
                {resumes.map((r) => (
                  <option key={r._id} value={r._id}>
                    {r.title}
                  </option>
                ))}
              </select>
            </div>
            <textarea
              value={form.jobDescriptionText}
              onChange={(e) => setForm({ ...form, jobDescriptionText: e.target.value })}
              placeholder="Paste the job description (optional)"
              rows={3}
              className="mt-3 w-full resize-none rounded-sm border border-rule px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft dark:bg-transparent dark:text-paper"
            />
            <button
              type="submit"
              disabled={saving}
              className="mt-3 rounded-sm bg-ink px-4 py-2 text-sm text-paper hover:bg-ink-soft dark:bg-accent"
            >
              {saving ? "Saving..." : "Add to tracker"}
            </button>
          </form>
        )}

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COLUMNS.map((col) => (
            <div key={col.key}>
              <h2 className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-soft dark:text-paper/60">
                {col.label} ({applications.filter((a) => a.status === col.key).length})
              </h2>
              <div className="space-y-2">
                {applications
                  .filter((a) => a.status === col.key)
                  .map((a) => (
                    <div
                      key={a._id}
                      className="rounded-sm border border-rule bg-white p-3 text-sm shadow-paper dark:border-ink-soft dark:bg-ink dark:text-paper"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <p className="font-medium text-ink dark:text-paper">{a.jobTitle}</p>
                          <p className="text-xs text-ink-soft dark:text-paper/60">{a.company}</p>
                        </div>
                        <button onClick={() => remove(a._id)} className="text-ink-faint hover:text-red-600">
                          <Trash2 size={14} />
                        </button>
                      </div>
                      {a.resumeId && (
                        <Link
                          href={`/builder/${a.resumeId}`}
                          className="mt-1 inline-block text-xs text-accent hover:underline"
                        >
                          View linked resume
                        </Link>
                      )}
                      <select
                        value={a.status}
                        onChange={(e) => updateStatus(a._id, e.target.value as Application["status"])}
                        className="mt-2 w-full rounded-sm border border-rule bg-paper px-2 py-1 text-xs dark:border-ink-soft dark:bg-transparent"
                      >
                        {COLUMNS.map((c) => (
                          <option key={c.key} value={c.key}>
                            {c.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}
