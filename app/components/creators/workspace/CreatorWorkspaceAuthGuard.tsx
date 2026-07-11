"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";

export default function CreatorWorkspaceAuthGuard({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isAuthenticated, user, openLoginModal } = useAuth();
  const [authRestored, setAuthRestored] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setAuthRestored(true), 150);
    return () => window.clearTimeout(timer);
  }, []);

  const hasSharedTplSession = Boolean(isAuthenticated && user);

  useEffect(() => {
    if (!authRestored || hasSharedTplSession) return;
    openLoginModal({
      accountType: "personal",
      intent: "generic",
      redirectAfterLogin: pathname || "/creator/dashboard",
    });
  }, [authRestored, hasSharedTplSession, openLoginModal, pathname]);

  if (!authRestored || hasSharedTplSession) return <>{children}</>;

  return (
    <main className="flex min-h-[70vh] items-center justify-center bg-[#f5f3ef] px-4 py-12">
      <section className="w-full max-w-lg rounded-3xl border border-stone-200 bg-white p-6 text-center shadow-sm sm:p-8">
        <span className="inline-flex rounded-full bg-cyan-50 px-3 py-1 text-xs font-black uppercase tracking-[0.14em] text-cyan-800">
          Public Beta
        </span>
        <h1 className="mt-4 text-2xl font-black text-slate-950 sm:text-3xl">Sign in to Creator Studio</h1>
        <p className="mt-3 text-sm font-semibold leading-6 text-slate-600">
          Creator Studio uses your existing TPL account. The sign-in window is ready for you—no separate Creator account is required.
        </p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <button
            type="button"
            onClick={() => openLoginModal({ accountType: "personal", intent: "generic", redirectAfterLogin: pathname || "/creator/dashboard" })}
            className="min-h-11 rounded-full bg-slate-950 px-5 text-sm font-black text-white transition hover:bg-slate-800"
          >
            Sign in with TPL
          </button>
          <Link href="/creators" className="inline-flex min-h-11 items-center justify-center rounded-full border border-stone-300 px-5 text-sm font-black text-slate-700">
            Browse Creator catalog
          </Link>
        </div>
      </section>
    </main>
  );
}
