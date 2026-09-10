"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Moon, Sun, LayoutGrid, ListChecks } from "lucide-react";

export default function NavBar() {
  const { data: session, status } = useSession();
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem("theme");
    const isDark = stored === "dark";
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
  }, []);

  function toggleDark() {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("theme", next ? "dark" : "light");
  }

  return (
    <nav className="sticky top-0 z-20 flex items-center justify-between border-b border-rule bg-paper/95 px-6 py-3 backdrop-blur dark:border-ink-soft dark:bg-ink print:hidden">
      <Link href="/" className="font-display text-lg font-semibold text-ink dark:text-paper">
        ResumeForge
      </Link>

      <div className="flex items-center gap-4">
        {status === "authenticated" && (
          <>
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink dark:text-paper/70 dark:hover:text-paper"
            >
              <LayoutGrid size={16} /> Dashboard
            </Link>
            <Link
              href="/tracker"
              className="flex items-center gap-1.5 text-sm text-ink-soft hover:text-ink dark:text-paper/70 dark:hover:text-paper"
            >
              <ListChecks size={16} /> Tracker
            </Link>
          </>
        )}

        <button
          onClick={toggleDark}
          aria-label="Toggle dark mode"
          className="rounded-sm p-1.5 text-ink-soft hover:text-ink dark:text-paper/70 dark:hover:text-paper"
        >
          {dark ? <Sun size={16} /> : <Moon size={16} />}
        </button>

        {status === "authenticated" ? (
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="rounded-sm border border-ink px-3 py-1.5 text-sm text-ink hover:bg-ink hover:text-paper dark:border-paper dark:text-paper dark:hover:bg-paper dark:hover:text-ink"
          >
            Sign out
          </button>
        ) : status === "unauthenticated" ? (
          <Link
            href="/login"
            className="rounded-sm bg-ink px-3 py-1.5 text-sm text-paper hover:bg-ink-soft dark:bg-accent dark:hover:bg-accent-deep"
          >
            Sign in
          </Link>
        ) : null}
      </div>
    </nav>
  );
}
