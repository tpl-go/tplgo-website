"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, Building2, CheckCircle2, Clock3, Loader2, ShieldAlert } from "lucide-react";
import { selectPartnerProfile, type PartnerAccess, type PartnerProfile } from "../lib/partner/partnerAccess";
import { cleanPartnerApplicationName, partnerProfileActionLabel, partnerProfileLifecycleLabel } from "../lib/partner/partnerOperatorPresentation";

type PartnerProfileChooserProps = {
  profiles: PartnerProfile[];
  onSelected: (access: PartnerAccess, profile: PartnerProfile) => void;
  onBack: () => void;
};

export default function PartnerProfileChooser({ profiles, onSelected, onBack }: PartnerProfileChooserProps) {
  const busy = useRef(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function select(profile: PartnerProfile) {
    if (busy.current || !profile.selectable) return;
    busy.current = true;
    setPending(profile.organizationId);
    setError("");
    try {
      onSelected(await selectPartnerProfile(profile.organizationId), profile);
    } catch {
      setError("This Partner account could not be opened. Please retry or contact Partner Support.");
    } finally {
      busy.current = false;
      setPending(null);
    }
  }

  return (
    <section aria-label="Partner accounts and applications">
      <div className="max-w-2xl">
        <h1 className="text-3xl font-black tracking-tight text-white sm:text-4xl">Choose a business to continue</h1>
        <p className="mt-3 text-sm font-medium leading-6 text-slate-300 sm:text-base">
          Select the application or Partner account you want to open.
        </p>
      </div>

      {error ? (
        <div role="alert" className="mt-6 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm font-semibold text-red-100">
          {error}
        </div>
      ) : null}

      {!profiles.length ? (
        <div role="status" className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
          No Partner accounts are available right now. Contact Partner Support for help.
        </div>
      ) : null}

      <div className="mt-8 grid gap-5 md:grid-cols-2">
        {profiles.map((profile) => {
          const actionLabel = partnerProfileActionLabel(profile.destinationType, profile.selectable);
          const displayName = cleanPartnerApplicationName(profile.displayName);
          const StatusIcon = profile.selectable
            ? profile.destinationType === "ACTIVE"
              ? CheckCircle2
              : Clock3
            : ShieldAlert;

          return (
            <article key={profile.organizationId} className="group flex min-w-0 flex-col rounded-[22px] border border-white/10 bg-white/[0.055] p-5 shadow-[0_18px_50px_rgba(0,0,0,0.2)] transition hover:-translate-y-0.5 hover:border-orange-400/35 hover:bg-white/[0.075] sm:p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border border-orange-400/20 bg-orange-400/10 text-orange-300">
                  <Building2 aria-hidden="true" className="h-5 w-5" />
                </div>
                <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-black ${profile.selectable ? "border-sky-300/20 bg-sky-300/10 text-sky-100" : "border-amber-300/20 bg-amber-300/10 text-amber-100"}`}>
                  <StatusIcon aria-hidden="true" className="h-3.5 w-3.5" />
                  {partnerProfileLifecycleLabel(profile.status)}
                </span>
              </div>

              <h2 className="mt-5 break-words text-xl font-black text-white">{displayName}</h2>
              {profile.reference ? <p className="mt-1 break-words text-xs font-semibold text-slate-400">{profile.reference}</p> : null}
              <p className="mb-6 mt-4 text-xs font-semibold text-slate-400">
                Last updated <time dateTime={profile.updatedAt}>{formatPartnerDate(profile.updatedAt)}</time>
              </p>

              {profile.selectable && actionLabel !== "Contact support" ? (
                <button
                  type="button"
                  disabled={pending !== null}
                  onClick={() => void select(profile)}
                  aria-label={`${actionLabel}: ${displayName}`}
                  className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(135deg,#f97316,#ea580c)] px-4 py-3 text-sm font-black text-white shadow-[0_12px_28px_rgba(249,115,22,0.24)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400"
                >
                  {pending === profile.organizationId ? (
                    <><Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />Opening…</>
                  ) : (
                    <>{actionLabel}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></>
                  )}
                </button>
              ) : (
                <Link href="/customer-support" className="mt-auto inline-flex min-h-12 items-center justify-center rounded-xl border border-white/15 px-4 py-3 text-sm font-black text-white transition hover:border-orange-400/50 hover:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
                  Contact support
                </Link>
              )}
            </article>
          );
        })}
      </div>

      <button type="button" onClick={onBack} className="mt-8 inline-flex min-h-11 items-center gap-2 rounded-xl px-2 py-2 text-sm font-black text-slate-300 transition hover:text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-orange-400">
        <ArrowLeft aria-hidden="true" className="h-4 w-4" />
        Back
      </button>
    </section>
  );
}

function formatPartnerDate(value: string): string {
  return new Date(value).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
}
