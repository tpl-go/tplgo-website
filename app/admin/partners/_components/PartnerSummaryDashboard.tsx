"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, ArrowUpRight, Building2, CalendarDays, CheckCircle2, CircleDollarSign, ClipboardList, CreditCard, RefreshCcw, Search, Wallet } from "lucide-react";
import { adminApiRequest, readAdminSession } from "@/app/lib/admin/adminApiClient";

export type SummaryCounts = Record<string, number | null>;
export type PartnerSummaryData = {
  asOf: string; monthStart: string; timezone: string; maxAgeSeconds: number;
  partners: SummaryCounts; applications: SummaryCounts; business: SummaryCounts; financial: SummaryCounts; attention: SummaryCounts;
  domains: { rows: Array<{ key: string; name: string; partners: number; bookings: number | null; gmv: number | null; revenue: number | null }>; nextCursor: string | null; available: boolean; restricted: boolean };
  coverage: { applications: boolean; finance: boolean; bookings: boolean; inactive: boolean; kyc: boolean };
  currency?: string;
};
export function isPartnerSummaryData(value: unknown): value is PartnerSummaryData {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  if (typeof v.asOf !== "string" || !Number.isFinite(Date.parse(v.asOf))) return false;
  for (const key of ["partners", "applications", "business", "financial", "attention", "coverage"]) if (!v[key] || typeof v[key] !== "object" || Array.isArray(v[key])) return false;
  const domains = v.domains as PartnerSummaryData["domains"] | undefined;
  return !!domains && Array.isArray(domains.rows) && domains.rows.length <= 20 && domains.rows.every(row => row && typeof row.key === "string" && /^[a-zA-Z0-9_-]{1,160}$/.test(row.key) && typeof row.name === "string" && row.name.length <= 180 && Number.isSafeInteger(row.partners) && row.partners >= 0) && (domains.nextCursor === null || typeof domains.nextCursor === "string");
}
export const summaryLinks = {
  active: "/admin/partners/organizations?view=active",
  inactive: "/admin/partners/organizations?view=inactive",
  suspended: "/admin/partners/organizations?view=suspended",
  underReview: "/admin/partners/organizations?view=all&status=UNDER_REVIEW",
  pendingApplications: "/admin/partners/applications?view=under-review&status=ACTIONABLE",
  applications: "/admin/partners/applications?view=all",
  revenue: "/admin/partners?view=revenue",
  settlements: "/admin/partners?view=revenue&focus=pending-settlement",
  alerts: (focus: string) => `/admin/partners?view=alerts-actions&focus=${encodeURIComponent(focus)}`,
  domain: (key: string) => `/admin/partners?view=services&domain=${encodeURIComponent(key)}`,
};
export function summaryCount(value: number | null | undefined) { return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? new Intl.NumberFormat("en-IN").format(value) : "—"; }
export function summaryMoney(value: number | null | undefined, currency?: string) {
  if (typeof value !== "number" || !Number.isSafeInteger(value) || !currency || !/^[A-Z]{3}$/.test(currency)) return "—";
  try { return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(value / 100); } catch { return "—"; }
}
const card = "rounded-xl border border-slate-700/55 bg-[#0c1625]";
const focus = "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300";
const sections = [
  ["Total Applications", "total", "all"], ["New", "new", "new"], ["Under Review", "underReview", "under-review"],
  ["Documents Pending", "documentsPending", "documents-pending"], ["Approved", "approved", "approved"], ["Rejected", "rejected", "rejected"],
] as const;
function Section({ title, note, children, aside }: { title: string; note?: string; children: ReactNode; aside?: ReactNode }) {
  return <section className={`${card} p-5 sm:p-6`} aria-label={title}><div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-base font-semibold text-slate-100">{title}</h3>{note ? <p className="mt-1 text-xs leading-5 text-slate-400">{note}</p> : null}</div>{aside}</div>{children}</section>;
}
function Value({ value, loading, money, currency }: { value: number | null | undefined; loading: boolean; money?: boolean; currency?: string }) {
  if (loading) return <span className="inline-block h-7 w-20 animate-pulse rounded bg-slate-700/50" aria-label="Loading" />;
  return <span className="tabular-nums">{money ? summaryMoney(value, currency) : summaryCount(value)}</span>;
}
function SmallLink({ label, value, href, loading, tone = "bg-slate-500" }: { label: string; value: number | null | undefined; href: string; loading: boolean; tone?: string }) {
  return <Link href={href} prefetch={false} className={`group flex min-h-20 items-center justify-between gap-3 rounded-lg border border-slate-700/40 px-4 py-3 hover:border-sky-400/50 hover:bg-white/[.02] ${focus}`}><div><p className="flex items-center gap-2 text-xs text-slate-400"><span aria-hidden="true" className={`h-1.5 w-1.5 rounded-full ${tone}`} />{label}</p><p className="mt-2 text-xl font-semibold text-slate-100"><Value value={value} loading={loading} /></p></div><ArrowUpRight aria-hidden="true" className="h-4 w-4 text-slate-500 group-hover:text-sky-300" /></Link>;
}
export default function PartnerSummaryDashboard() {
  const [data, setData] = useState<PartnerSummaryData | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error" | "forbidden">("loading");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("");
  const [cursor, setCursor] = useState("");
  const [previous, setPrevious] = useState<string[]>([]);
  const sequence = useRef(0);
  const load = useCallback(async () => {
    const ticket = ++sequence.current;
    const session = readAdminSession();
    if (!session?.admin.permissions.includes("partner_verification.read")) { setData(null); setState("forbidden"); return; }
    const owner = session.admin.id, token = session.session.token;
    setState("loading"); setData(null);
    const query = new URLSearchParams({ limit: "8", search: filter, after: cursor });
    const result = await adminApiRequest<PartnerSummaryData>(`/api/v1/admin/partners/summary?${query}`);
    const current = readAdminSession();
    if (ticket !== sequence.current) return;
    if (!current || current.admin.id !== owner || current.session.token !== token) { setData(null); setState("forbidden"); return; }
    if (result.ok && isPartnerSummaryData(result.data)) { setData(result.data); setState("ready"); }
    else { setData(null); setState(result.status === 401 || result.status === 403 ? "forbidden" : "error"); }
  }, [filter, cursor]);
  useEffect(() => { const counter = sequence; const timer = setTimeout(() => void load(), 0); return () => { clearTimeout(timer); counter.current++; }; }, [load]);
  const loading = state === "loading";
  const count = (group: "partners" | "applications" | "business" | "financial" | "attention", key: string) => data?.[group]?.[key];
  const kpis = [
    { label: "Total Partners", value: count("partners", "total"), note: "Registered organizations · includes drafts", icon: Building2, href: "/admin/partners/organizations?view=all" },
    { label: "Active Partners", value: count("partners", "active"), note: "Currently active organizations", icon: CheckCircle2, href: summaryLinks.active },
    { label: "New Partners", value: count("partners", "new"), note: "Registered this month · UTC", icon: CalendarDays, href: "/admin/partners/organizations?view=all&period=this-month" },
    { label: "Pending Applications", value: count("applications", "pending"), note: "New, resubmitted or under review", icon: ClipboardList, href: summaryLinks.pendingApplications },
    { label: "Total Bookings", value: count("business", "total"), note: "Partner-attributed bookings", icon: CalendarDays, href: "/admin/partners?view=performance&focus=bookings" },
    { label: "Total GMV / Business Value", value: count("financial", "gmv"), note: "Gross Partner business value", icon: CircleDollarSign, href: summaryLinks.revenue, money: true },
    { label: "TPL Revenue", value: count("financial", "revenue"), note: "TPL commission and revenue", icon: CreditCard, href: summaryLinks.revenue, money: true },
    { label: "Partner Payable", value: count("financial", "payable"), note: "Current amount due to Partners", icon: Wallet, href: summaryLinks.settlements, money: true },
  ];
  if (state === "forbidden") return <div role="alert" className={`${card} p-6 text-sm text-slate-300`}>Partner summary requires Partner review access. Sign in with an authorised Admin account.</div>;
  return <div data-partner-summary className="min-w-0 space-y-6 pb-6">
    <div className="flex flex-wrap items-start justify-between gap-4"><div><h2 className="text-xl font-semibold text-white">Summary</h2><p className="mt-1 text-sm text-slate-400">Your Partner ecosystem at a glance.</p><p className="mt-2 text-xs text-slate-500" role="status">{loading ? "Updating summary…" : data ? `Updated ${new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short", timeZone: "UTC" }).format(new Date(data.asOf))} UTC · refreshes on request` : "Latest summary unavailable"}</p></div><button type="button" onClick={() => void load()} disabled={loading} className={`inline-flex min-h-10 items-center gap-2 rounded-lg border border-slate-600 px-4 text-sm text-slate-200 hover:bg-white/5 disabled:opacity-50 ${focus}`}><RefreshCcw aria-hidden="true" className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />Refresh</button></div>
    {state === "error" ? <p role="alert" className="rounded-lg border border-amber-400/25 bg-amber-400/5 p-4 text-sm text-amber-100">The latest summary could not be loaded. Refresh to try again. No previous figures are shown.</p> : null}
    <div className="grid grid-cols-1 gap-3 min-[380px]:grid-cols-2 xl:grid-cols-4" aria-label="Key metrics">{kpis.map(({ label, value, note, icon: Icon, href, money }) => <Link key={label} href={href} prefetch={false} className={`${card} group flex min-h-36 flex-col p-4 transition hover:border-sky-400/50 sm:p-5 ${focus}`}><div className="flex items-start justify-between gap-2"><p className="text-xs font-medium leading-5 text-slate-300">{label}</p><Icon aria-hidden="true" className="h-4 w-4 shrink-0 text-slate-500" /></div><p className="my-3 break-words text-2xl font-semibold tracking-tight text-white sm:text-3xl"><Value value={value} loading={loading} money={money} currency={data?.currency} /></p><p className="mt-auto text-[11px] leading-4 text-slate-500">{!loading && value == null ? "Not available yet" : note}</p></Link>)}</div>
    <p className="text-xs leading-5 text-slate-500">— means unavailable, not zero. Application approval does not activate a Partner or payouts. Detailed destination views are being built separately.</p>
    <Section title="Partner Health" note="Organization status; review counts can overlap with other stages."><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">{[["Active", "active", summaryLinks.active, "bg-emerald-400"], ["Inactive", "inactive", summaryLinks.inactive, "bg-slate-500"], ["Suspended", "suspended", summaryLinks.suspended, "bg-rose-400"], ["Under Review", "underReview", summaryLinks.underReview, "bg-amber-400"]].map(([label, key, href, tone]) => <SmallLink key={key} label={label} value={count("partners", key)} loading={loading} href={href} tone={tone} />)}</div></Section>
    <Section title="Applications" note="Latest submitted application per organization. Resubmissions count once." aside={<Link href={summaryLinks.applications} className={`text-xs text-sky-300 ${focus}`}>View applications →</Link>}><div className="grid grid-cols-2 gap-3 lg:grid-cols-3 2xl:grid-cols-6">{sections.map(([label, key, view]) => <SmallLink key={key} label={label} value={count("applications", key)} loading={loading} href={`/admin/partners/applications?view=${view}`} />)}</div>{data && !data.coverage.applications ? <p className="mt-3 text-xs text-slate-400">Application counts require application-review access.</p> : null}</Section>
    <Section title="Business Snapshot" note="Partner-attributed booking totals; detailed trends belong in Performance."><div className="grid grid-cols-2 gap-4 md:grid-cols-5">{[["Total Bookings", "total"], ["Completed", "completed"], ["Pending", "pending"], ["Cancelled", "cancelled"], ["Total GMV", "gmv"]].map(([label, key]) => <div key={key} className="border-l border-slate-700 pl-4"><p className="text-xs text-slate-400">{label}</p><p className="mt-3 text-xl font-semibold text-slate-100"><Value value={count("business", key)} loading={loading} money={key === "gmv"} currency={data?.currency} /></p></div>)}</div><p className="mt-5 text-xs text-slate-500">Partner booking and business-value reporting is not connected yet.</p></Section>
    <Section title="Domain Performance" note="Published domains · Domain → Service → Partner. Partner counts include selected draft and active services; not activation totals.">
      <form className="mb-4 flex max-w-md gap-2" onSubmit={event => { event.preventDefault(); setCursor(""); setPrevious([]); setFilter(search.trim()); }}><label htmlFor="summary-domain-search" className="sr-only">Search domains</label><div className="relative min-w-0 flex-1"><Search aria-hidden="true" className="absolute left-3 top-3 h-4 w-4 text-slate-500" /><input id="summary-domain-search" maxLength={80} value={search} onChange={e => setSearch(e.target.value)} placeholder="Search domains" className={`h-10 w-full rounded-lg border border-slate-700 bg-slate-950/60 pl-9 pr-3 text-sm text-slate-200 ${focus}`} /></div><button disabled={loading} className={`rounded-lg border border-slate-600 px-4 text-sm text-slate-200 disabled:opacity-50 ${focus}`}>Search</button></form>
      <div className="max-h-[420px] overflow-auto rounded-lg border border-slate-700/50" tabIndex={0} role="region" aria-label="Domain performance table"><table className="w-full min-w-[650px] text-left text-sm"><thead className="sticky top-0 bg-[#142033] text-[11px] uppercase tracking-wide text-slate-400"><tr>{["Domain Name", "Partners", "Bookings", "GMV", "TPL Revenue", "View"].map(label => <th key={label} className="px-4 py-3 font-medium">{label}</th>)}</tr></thead><tbody className="divide-y divide-slate-800">{data?.domains.rows.map(row => <tr key={row.key} className="hover:bg-white/[.02]"><th scope="row" className="max-w-64 px-4 py-4 font-medium text-slate-200"><Link prefetch={false} href={summaryLinks.domain(row.key)} className={`hover:text-sky-200 ${focus}`}>{row.name}</Link></th><td className="px-4 py-4 tabular-nums text-slate-300">{summaryCount(row.partners)}</td><td className="px-4 py-4 text-slate-500">{summaryCount(row.bookings)}</td><td className="px-4 py-4 text-slate-500">{summaryMoney(row.gmv, data.currency)}</td><td className="px-4 py-4 text-slate-500">{summaryMoney(row.revenue, data.currency)}</td><td className="px-4 py-4"><Link prefetch={false} href={summaryLinks.domain(row.key)} aria-label={`View ${row.name} services`} className={`inline-flex min-h-9 items-center gap-1 text-sky-300 ${focus}`}>View<ArrowUpRight aria-hidden="true" className="h-3 w-3" /></Link></td></tr>)}{!data?.domains.rows.length ? <tr><td colSpan={6} className="p-6 text-center text-sm text-slate-400">{loading ? "Loading domains…" : state === "error" ? "Domains could not be loaded." : data?.domains.restricted ? "Domain access requires catalogue read permission." : !data?.domains.available ? "Published domain catalogue is not available yet." : "No domains match this search."}</td></tr> : null}</tbody></table></div>
      <div className="mt-4 flex items-center justify-between gap-3 text-xs text-slate-400"><span>Up to 8 domains per page</span><div className="flex gap-2"><button type="button" disabled={loading || !previous.length} onClick={() => { setCursor(previous.at(-1) ?? ""); setPrevious(previous.slice(0, -1)); }} className={`min-h-10 rounded border border-slate-700 px-3 disabled:opacity-40 ${focus}`}>Previous</button><button type="button" disabled={loading || !data?.domains.nextCursor} onClick={() => { if (data?.domains.nextCursor) { setPrevious([...previous, cursor]); setCursor(data.domains.nextCursor); } }} className={`min-h-10 rounded border border-slate-700 px-3 disabled:opacity-40 ${focus}`}>Next</button></div></div>
    </Section>
    <Section title="Financial Snapshot" note="Consistent currency totals will appear when Partner financial reporting is connected." aside={<Link href={summaryLinks.revenue} className={`text-xs text-sky-300 ${focus}`}>Revenue analysis →</Link>}><div className="grid grid-cols-2 gap-4 md:grid-cols-5">{[["GMV", "gmv"], ["TPL Revenue", "revenue"], ["Partner Payable", "payable"], ["Settled", "settled"], ["Pending Settlement", "pendingSettlement"]].map(([label, key], i) => <Link key={key} href={key === "pendingSettlement" ? summaryLinks.settlements : summaryLinks.revenue} className={`rounded-lg border border-slate-700/40 p-3 hover:border-sky-400/50 ${focus}`}><p className="flex items-center justify-between gap-2 text-xs text-slate-400">{label}{i < 4 ? <ArrowRight aria-hidden="true" className="h-3 w-3 shrink-0" /> : null}</p><p className="mt-3 break-words text-xl font-semibold text-white"><Value value={count("financial", key)} loading={loading} money currency={data?.currency} /></p></Link>)}</div></Section>
    <Section title="Attention Required" note="Important signals only. Review details in Alerts & Actions."><div className="grid grid-cols-2 gap-3 lg:grid-cols-5">{[["KYC Pending", "kyc", "kyc-pending"], ["Payment Issues", "paymentIssues", "payment-issues"], ["Settlements Due", "settlementsDue", "settlements-due"], ["Documents Expiring", "documentsExpiring", "documents-expiring"], ["Suspended Partners", "suspended", "suspended-partners"]].map(([label, key, target]) => <SmallLink key={key} label={label} value={count("attention", key)} loading={loading} href={summaryLinks.alerts(target)} />)}</div><p className="mt-4 text-xs text-slate-500">Expiring documents: today through the next 30 days, UTC. KYC, payment issues and settlements need their respective reporting sources.</p></Section>
  </div>;
}
