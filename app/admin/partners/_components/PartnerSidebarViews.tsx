"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { partnerAdminRoute, visiblePartnerAdminNavigation } from "./partnerAdminRoutes";

export default function PartnerSidebarViews({ permissions }: { permissions: readonly string[] }) {
  const current = partnerAdminRoute(usePathname());
  if (!current) return null;
  return <nav aria-label="Partners sidebar sections" className="ml-5 space-y-1 border-l border-sky-300/15 pl-3 pt-2">
    {visiblePartnerAdminNavigation(permissions).map((item) => <Link key={item.href} href={item.href} prefetch={false} aria-current={current.href === item.href ? "page" : undefined} className={`flex min-h-10 items-center rounded-md px-3 py-2 text-sm transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-sky-300 ${current.href === item.href ? "bg-sky-400/10 font-medium text-sky-200" : "text-slate-400 hover:bg-white/5 hover:text-slate-100"}`}>{item.label}</Link>)}
  </nav>;
}
