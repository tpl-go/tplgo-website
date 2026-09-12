"use client";

import Link from "next/link";
import { HelpCircle, LogOut, RefreshCw, ShieldCheck } from "lucide-react";

type PartnerAccessShellProps = {
  title: string;
  displayName?: string | null;
  authenticated: boolean;
  onUseAnotherLogin: () => void;
  onLogout: () => void;
  children: React.ReactNode;
};

export default function PartnerAccessShell({
  title,
  displayName,
  authenticated,
  onUseAnotherLogin,
  onLogout,
  children,
}: PartnerAccessShellProps) {
  const safeDisplayName = displayName?.trim().slice(0, 80) || "Partner account";

  return (
    <div data-partner-access-shell="true" className="min-h-screen bg-[#07111a] text-white">
      <header className="border-b border-white/10 bg-[#09141f]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-5 py-4 lg:min-h-20 lg:flex-row lg:items-center lg:justify-between lg:gap-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#f97316,#ea580c)] text-sm font-black shadow-[0_12px_32px_rgba(249,115,22,0.3)]">
              TPL
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-black tracking-wide">TPL GO Partner</p>
              <p className="truncate text-xs font-semibold text-slate-400">{title}</p>
            </div>
          </div>

          <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:justify-end">
            {authenticated ? (
              <p className="min-w-0 truncate text-sm font-semibold text-slate-300" aria-label={`Signed in as ${safeDisplayName}`}>
                {safeDisplayName}
              </p>
            ) : null}
            <nav aria-label="Partner account actions" className="flex flex-wrap items-center gap-2">
              <Link href="/customer-support" className={secondaryActionClass}>
                <HelpCircle aria-hidden="true" className="h-4 w-4" />
                Help
              </Link>
              {authenticated ? (
                <>
                  <button type="button" onClick={onUseAnotherLogin} className={secondaryActionClass}>
                    <RefreshCw aria-hidden="true" className="h-4 w-4" />
                    Use another Partner login
                  </button>
                  <button type="button" onClick={onLogout} className={secondaryActionClass}>
                    <LogOut aria-hidden="true" className="h-4 w-4" />
                    Logout
                  </button>
                </>
              ) : null}
            </nav>
          </div>
        </div>
      </header>

      <div className="mx-auto flex min-h-[calc(100vh-81px)] w-full max-w-6xl items-start justify-center px-5 py-10 sm:py-14 lg:px-8 lg:py-16">
        <section className="w-full max-w-4xl rounded-[28px] border border-white/10 bg-[linear-gradient(145deg,rgba(18,31,44,0.98),rgba(10,20,30,0.98))] p-6 shadow-[0_28px_90px_rgba(0,0,0,0.34)] sm:p-8 lg:p-10">
          <div className="mb-7 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-orange-300">
            <ShieldCheck aria-hidden="true" className="h-4 w-4" />
            Secure Partner workspace
          </div>
          {children}
        </section>
      </div>
    </div>
  );
}

const secondaryActionClass =
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-slate-200 transition hover:border-orange-400/60 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400";
