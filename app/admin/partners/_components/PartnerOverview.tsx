"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Building2, ClipboardCheck, Clock3, RefreshCcw, ShieldCheck } from "lucide-react";
import { adminApiRequest, readAdminSession, type AdminApiResult } from "@/app/lib/admin/adminApiClient";
import { ApplicationQueue, type QueueResponse } from "../applications/AdminPartnerApplicationsClient";

export const applicationMetrics = [
  { status: "SUBMITTED", label: "New applications", icon: ClipboardCheck },
  { status: "UNDER_REVIEW", label: "In review", icon: ShieldCheck },
  { status: "CHANGES_REQUESTED", label: "Awaiting Partner response", icon: Clock3 },
  { status: "RESUBMITTED", label: "Resubmitted", icon: RefreshCcw },
  { status: "APPROVED", label: "Approved applications", icon: Building2 },
] as const;

export function ApplicationMetrics({ counts }: { counts: Record<string, number> }) {
  return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
    {applicationMetrics.map(({ status, label, icon: Icon }) => <Link key={status} href={`/admin/partners/applications?status=${status}`} className="group rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition hover:border-sky-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600">
      <div className="flex items-start justify-between gap-2"><Icon aria-hidden="true" className="h-5 w-5 text-sky-700" /><ArrowUpRight aria-hidden="true" className="h-4 w-4 text-slate-400 group-hover:text-sky-700" /></div>
      <p className="mt-4 text-3xl font-semibold tabular-nums text-slate-950">{(counts[status] ?? 0).toLocaleString("en-IN")}</p>
      <p className="mt-1 text-sm text-slate-600">{label}</p>
    </Link>)}
  </div>;
}

export function PartnerAvailability({ activeOnly = false }: { activeOnly?: boolean }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-6 text-slate-950 shadow-sm">
    <div className="flex items-start gap-4"><span className="rounded-xl bg-sky-50 p-3 text-sky-700"><Building2 aria-hidden="true" className="h-6 w-6" /></span><div>
      <h2 className="text-lg font-semibold">Active Partners</h2>
      <p className="mt-1 max-w-2xl text-sm leading-6 text-slate-600">The operational Partner directory is not available yet. Application approval, organization activation, service activation and payout readiness are separate checks.</p>
      <p className="mt-3 inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">Activation data unavailable</p>
    </div></div>
    {activeOnly ? <div className="mt-6 grid gap-4 border-t border-slate-100 pt-5 md:grid-cols-3">
      {[
        ["Service & domain views", "Partner service activation must be confirmed before an organization appears here."],
        ["Partner dashboards", "Operational activity and permissions will be shown when the Partner workspace is connected."],
        ["Financial reports", "Transaction and payout reporting is not available in this directory yet."],
      ].map(([title, description]) => <div key={title}><h3 className="text-sm font-semibold">{title}</h3><p className="mt-2 text-sm leading-6 text-slate-500">{description}</p></div>)}
    </div> : null}
  </section>;
}

export default function PartnerOverview() {
  const [result, setResult] = useState<AdminApiResult<QueueResponse> | null>(null);
  const [loading, setLoading] = useState(true);
  const [allowed, setAllowed] = useState(false);
  const request = useRef(0);
  const load = useCallback(async () => {
    const current = ++request.current;
    const canRead = Boolean(readAdminSession()?.admin.permissions.includes("partner_application.read"));
    setAllowed(canRead);
    setResult(null);
    if (!canRead) { setLoading(false); return; }
    setLoading(true);
    const response = await adminApiRequest<QueueResponse>("/api/v1/admin/partner-applications?status=ACTIONABLE");
    if (current !== request.current) return;
    setResult(response);
    setLoading(false);
  }, []);
  useEffect(() => {
    const counter = request;
    const timer = setTimeout(() => { void load(); }, 0);
    return () => { clearTimeout(timer); counter.current++; };
  }, [load]);
  return <div className="min-w-0 space-y-6">
    <section className="flex flex-col justify-between gap-4 rounded-xl border border-sky-300/20 bg-gradient-to-br from-slate-900 to-sky-950 p-6 sm:flex-row sm:items-center">
      <div><p className="text-xs font-semibold uppercase tracking-widest text-sky-200">Partner workspace</p><h2 className="mt-2 text-2xl font-semibold text-white">Applications, reviews and readiness</h2><p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Follow each application from submission to a review decision. Manage specialist evidence from the existing review workspaces.</p></div>
      <button type="button" onClick={() => void load()} disabled={loading} className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-600 disabled:opacity-50"><RefreshCcw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button>
    </section>
    {loading ? <p role="status" className="rounded-xl bg-white p-6 text-sm text-slate-600">Loading application overview…</p> : !allowed ? <p className="rounded-xl bg-white p-6 text-sm text-slate-600">Application overview requires application review access. Your available specialist workspaces remain in the navigation.</p> : result && !result.ok ? <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-5 text-sm text-amber-800">Application overview is unavailable. Refresh to try again.</p> : result?.ok ? <>
      <ApplicationMetrics counts={result.data.counts} />
      <p className="text-xs text-slate-400">Counts represent submitted application records, including resubmission revisions. They are not counts of activated Partners.</p>
      <section className="space-y-3"><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-lg font-semibold text-white">Needs review</h2><Link href="/admin/partners/applications" className="text-sm font-medium text-sky-200 underline-offset-4 hover:underline">View all applications →</Link></div><ApplicationQueue rows={result.data.rows.slice(0, 5)} selectedId="" qa={false} /></section>
    </> : null}
    <PartnerAvailability />
    <section className="rounded-xl border border-slate-200 bg-white p-6"><h2 className="text-lg font-semibold text-slate-950">Review workflow</h2><ol className="mt-4 grid gap-3 md:grid-cols-3">{["Employee Review", "Senior Review", "Final Senior Approval"].map((label, index) => <li key={label} className="flex items-center gap-3 rounded-lg bg-slate-50 p-4 text-sm font-medium text-slate-700"><span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white">{index + 1}</span>{label}</li>)}</ol><p className="mt-4 text-sm leading-6 text-slate-500">Planned application workflow — not yet enabled. Existing specialist review and application permissions continue to apply. CEO email and message notifications are pending configuration; no delivery is claimed.</p></section>
  </div>;
}
