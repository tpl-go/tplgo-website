"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Loader2, LogOut } from "lucide-react";
import { selectPartnerProfile, type PartnerAccess, type PartnerProfile } from "../lib/partner/partnerAccess";

const labels: Record<string, string> = { DRAFT_INCOMPLETE: "Draft", READY_TO_SUBMIT: "Ready to submit", SUBMITTED: "Submitted", UNDER_REVIEW: "Under review", RESUBMITTED: "Resubmitted", CHANGES_REQUESTED: "Changes requested", NOT_APPROVED: "Not approved", APPROVED: "Approved - setup pending", ACTIVE: "Active", RESTRICTED: "Access restricted" };
const actions: Record<string, string> = { APPLICATION: "Continue Application", CORRECTIONS: "Continue Application", APPLICATION_STATUS: "View Status", SETUP_PENDING: "Complete Setup", ACTIVE: "Open Partner Dashboard" };

export default function PartnerProfileChooser({ profiles, onSelected, onSignOut }: { profiles: PartnerProfile[]; onSelected: (access: PartnerAccess) => void; onSignOut: () => void }) {
  const busy = useRef(false);
  const [pending, setPending] = useState<string | null>(null);
  const [error, setError] = useState("");
  async function select(profile: PartnerProfile) {
    if (busy.current || !profile.selectable) return;
    busy.current = true; setPending(profile.organizationId); setError("");
    try { onSelected(await selectPartnerProfile(profile.organizationId)); }
    catch { setError("Your profile could not be opened. Please retry or contact Support."); }
    finally { busy.current = false; setPending(null); }
  }
  return <section aria-label="Partner profiles" className="mt-5">
    <p className="text-sm text-gray-600">Select the application or organization you want to continue with.</p>
    {error && <p role="alert" className="mt-4 text-sm text-red-700">{error}</p>}
    {!profiles.length && <p role="status" className="mt-5 text-sm">Your profiles could not be loaded. Contact Support to continue.</p>}
    <div className="mt-6 grid gap-4 sm:grid-cols-2">
      {profiles.map((profile) => <article key={profile.organizationId} className="flex min-w-0 flex-col rounded-lg border border-gray-200 p-5">
        <Building2 aria-hidden="true" className="mb-3 h-5 w-5 text-emerald-800" />
        <h2 className="break-words text-lg font-semibold">{profile.displayName}</h2>
        {profile.reference && <p className="mt-1 break-words text-xs text-gray-500">{profile.reference}</p>}
        <p className="mt-3"><span className={`inline-block rounded px-2 py-1 text-xs font-medium ${profile.selectable ? "bg-sky-50 text-sky-900" : "bg-red-50 text-red-800"}`}>{labels[profile.status]}</span></p>
        <p className="mb-5 mt-3 text-xs text-gray-500">Updated <time dateTime={profile.updatedAt}>{new Date(profile.updatedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" })}</time></p>
        {profile.selectable ? <button type="button" disabled={pending !== null} onClick={() => void select(profile)} aria-label={`${actions[profile.destinationType]}: ${profile.displayName}`} className="mt-auto flex min-h-11 items-center justify-center gap-2 rounded bg-emerald-800 px-3 py-3 text-sm font-semibold text-white disabled:opacity-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-800">
          {pending === profile.organizationId ? <><Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />Opening...</> : <>{actions[profile.destinationType]}<ArrowRight aria-hidden="true" className="h-4 w-4 shrink-0" /></>}
        </button> : <Link href="/customer-support" className="mt-auto inline-flex min-h-11 items-center justify-center rounded border border-gray-300 px-3 py-3 text-sm font-semibold">Contact Support</Link>}
      </article>)}
    </div>
    <nav aria-label="Partner profile help" className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
      <Link href="/" className="py-3">Back</Link><Link href="/customer-support" className="py-3">Support</Link>
      <button type="button" disabled={pending !== null} onClick={onSignOut} className="flex items-center gap-2 py-3 disabled:opacity-50"><LogOut aria-hidden="true" className="h-4 w-4" />Switch login</button>
    </nav>
  </section>;
}
