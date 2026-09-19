"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { ArrowLeft, ChevronRight } from "lucide-react";
import { canAccessPartnerModule, partnerAdminNavigation, partnerAdminRoute, partnerQueueReturn, visiblePartnerAdminNavigation } from "./partnerAdminRoutes";

export default function PartnerAdminNavigation({ permissions }: { permissions: readonly string[] }) {
  const pathname = usePathname();
  const query = useSearchParams();
  const current = partnerAdminRoute(pathname);
  const activeLink = useRef<HTMLAnchorElement>(null);
  useEffect(() => { activeLink.current?.scrollIntoView({ block: "nearest", inline: "nearest" }); }, [pathname, permissions]);
  if (!current) return null;
  const rules = pathname === "/admin/partner-verification/rules";
  const detail = !rules && (pathname !== current.href || query.has("organizationId") || query.has("submission"));
  const title = rules ? "Verification Rules" : current.label;
  const moduleRoot = partnerAdminNavigation.some((item) => item.href === pathname);
  const canRead = permissions.includes(current.permission);
  const returnHref = partnerQueueReturn(pathname, query.toString());
  const returnRoute = partnerAdminRoute(returnHref) ?? current;
  return <header className="mb-5 min-w-0 border-b border-sky-300/15 pb-1" data-partner-admin-header>
    <nav aria-label="Partner breadcrumbs" className="flex flex-wrap items-center gap-2 text-sm text-slate-400">
      {canAccessPartnerModule(permissions) ? <Link href="/admin/partners" className="rounded focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300">Partners</Link> : <span>Partners</span>}
      <ChevronRight size={14} aria-hidden="true" />
      {(rules || detail) && canRead ? <><Link href={current.href}>{current.label}</Link><ChevronRight size={14} aria-hidden="true" /></> : null}
      <span aria-current="page">{rules ? "Rules" : detail ? "Review record" : current.label}</span>
    </nav>
    <h1 className="mt-4 text-3xl font-semibold tracking-tight text-white">{moduleRoot ? "Partners" : title}</h1>
    {moduleRoot ? <p className="mt-3 text-sm leading-6 text-slate-400">Your workspace for partner management.</p> : null}
    {current.label === "Service Catalogue" ? <Link href="/admin/website-experience/pages/partner" className="mt-1 inline-block text-sm text-sky-200">Website Experience / Partner</Link> : null}
    {(rules || detail) && canRead && permissions.includes(returnRoute.permission) ? <Link href={returnHref} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded text-sm text-sky-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300"><ArrowLeft size={16} />Back to {returnRoute.label}</Link> : null}
    <nav aria-label="Partner navigation" className="mt-7 flex max-w-full gap-1 overflow-x-auto pb-2 sm:gap-4">
      {visiblePartnerAdminNavigation(permissions).map((item) => <Link key={item.href} href={item.href} prefetch={false} ref={item.href === current.href ? activeLink : undefined} aria-current={item.href === current.href ? "page" : undefined} className={`inline-flex min-h-11 shrink-0 items-center justify-center border-b-2 px-2.5 py-3 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 sm:px-5 ${item.href === current.href ? "border-sky-400 bg-sky-400/5 text-sky-200" : "border-transparent text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>{item.label}</Link>)}
    </nav>
  </header>;
}
