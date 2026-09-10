"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      if (mode === "signup") {
        const res = await fetch("/api/auth/signup", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name, email, password }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
      }

      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) throw new Error("Incorrect email or password.");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-[80vh] items-center justify-center bg-paper px-6 dark:bg-ink">
      <div className="w-full max-w-sm rounded-sm border border-rule bg-white p-7 shadow-paper dark:border-ink-soft dark:bg-ink dark:text-paper">
        <h1 className="font-display text-2xl font-semibold text-ink dark:text-paper">
          {mode === "login" ? "Welcome back" : "Create your account"}
        </h1>
        <p className="mt-1 text-sm text-ink-soft dark:text-paper/70">
          {mode === "login"
            ? "Sign in to keep working on your resumes."
            : "It's free — no credit card, ever."}
        </p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-3">
          {mode === "signup" && (
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Full name"
              required
              className="w-full rounded-sm border border-rule bg-transparent px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft"
            />
          )}
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            type="email"
            placeholder="Email"
            required
            className="w-full rounded-sm border border-rule bg-transparent px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft"
          />
          <input
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type="password"
            placeholder="Password"
            required
            minLength={8}
            className="w-full rounded-sm border border-rule bg-transparent px-3 py-2 text-sm focus:border-accent focus:outline-none dark:border-ink-soft"
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-sm bg-accent px-4 py-2.5 text-sm font-medium text-white hover:bg-accent-deep disabled:opacity-60"
          >
            {loading && <Loader2 size={15} className="animate-spin" />}
            {mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <button
          onClick={() => {
            setMode(mode === "login" ? "signup" : "login");
            setError(null);
          }}
          className="mt-4 text-sm text-ink-soft underline hover:text-ink dark:text-paper/70 dark:hover:text-paper"
        >
          {mode === "login" ? "New here? Create an account" : "Already have an account? Sign in"}
        </button>
      </div>
    </main>
  );
}
