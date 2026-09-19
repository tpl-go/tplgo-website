"use client";

import Link from "next/link";
import dynamic from "next/dynamic";
const PartnerSummaryDashboard = dynamic(() => import("./PartnerSummaryDashboard"), { loading: () => <p role="status" className="py-6 text-sm text-slate-400">Loading summary…</p> });
const PartnerPerformanceDashboard = dynamic(() => import("./PartnerPerformanceDashboard"), { loading: () => <p role="status" className="py-6 text-sm text-slate-400">Loading performance…</p> });
const PartnerRevenueDashboard = dynamic(() => import("./PartnerRevenueDashboard"), { loading: () => <p role="status" className="py-6 text-sm text-slate-400">Loading revenue…</p> });
import { useSearchParams } from "next/navigation";
import { partnerAdminNavigation, partnerModuleView, partnerModuleViews, type PartnerModuleKey } from "./partnerAdminRoutes";

const sections = {
  overview: { description: "A clear view of your partner network." },
  applications: { description: "A dedicated space for partner applications." },
  partners: { description: "Your partner directory, in one place." },
  reports: { description: "A dedicated space for partner reporting." },
} as const;

export default function PartnerModuleSection({ section }: { section: PartnerModuleKey }) {
  const query = useSearchParams();
  const content = sections[section];
  const route = partnerAdminNavigation.find((item) => item.key === section)!;
  const activeView = partnerModuleView(section, query.get("view"));
  const isSummary = section === "overview" && activeView.key === "summary";
  const isPerformance = section === "overview" && activeView.key === "performance";
  const isRevenue = section === "overview" && activeView.key === "revenue";
  const filterLabels: Record<string, string> = { UNDER_REVIEW: "Under review", ACTIONABLE: "Pending review", "this-month": "Registered this month", "pending-settlement": "Pending settlement", bookings: "Bookings", "kyc-pending": "KYC pending", "payment-issues": "Payment issues", "settlements-due": "Settlements due", "documents-expiring": "Documents expiring", "suspended-partners": "Suspended Partners" };
  const requestedFilter = query.get("status") ?? query.get("focus") ?? query.get("period") ?? "";
  const domain = query.get("domain") ?? "";
  const contextLabel = filterLabels[requestedFilter] ?? (section === "overview" && activeView.key === "services" && /^[a-zA-Z0-9_-]{1,160}$/.test(domain) ? `Domain: ${domain.replaceAll("-", " ")}` : "");
  return <section aria-labelledby="partner-section-title" data-partner-module-panel className={isSummary || isPerformance || isRevenue ? "min-w-0" : "min-h-72 rounded-xl border border-sky-300/15 bg-[#0b1628] px-6 py-8 sm:min-h-80 sm:px-8"}>
    <h2 id="partner-section-title" className="text-xl font-semibold tracking-tight text-slate-100">{route.label}</h2>
    <p className="mt-3 max-w-xl text-sm leading-6 text-slate-400">{content.description}</p>
    <nav aria-label={`${route.label} views`} className="mt-6 flex flex-wrap gap-2 border-b border-sky-300/10 pb-5">
      {partnerModuleViews[section].map((view) => <Link key={view.key} href={`${route.href}?view=${view.key}`} prefetch={false} scroll={false} aria-current={view.key === activeView.key ? "page" : undefined} className={`inline-flex min-h-11 max-w-full items-center rounded-lg border px-3 py-2 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-300 ${view.key === activeView.key ? "border-sky-400/40 bg-sky-400/10 text-sky-200" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>{view.label}</Link>)}
    </nav>
    {isSummary ? <div className="pt-6"><PartnerSummaryDashboard /></div> : isPerformance ? <div className="pt-6"><PartnerPerformanceDashboard /></div> : isRevenue ? <div className="pt-6"><PartnerRevenueDashboard /></div> : <div className="py-8" aria-labelledby="partner-view-title" data-partner-view>
      <h3 id="partner-view-title" className="text-base font-medium text-slate-200">{activeView.label}</h3>
      {contextLabel ? <p className="mt-3 text-sm text-sky-200">Selected filter: {contextLabel}</p> : null}
      <p className="mt-3 text-sm text-slate-500">This view will be set up next.</p>
    </div>}
  </section>;
}
