export const partnerAdminNavigation = [
  { key: "overview", href: "/admin/partners", label: "Overview", permission: "partner_verification.read" },
  { key: "applications", href: "/admin/partners/applications", label: "Applications", permission: "partner_application.read" },
  { key: "partners", href: "/admin/partners/organizations", label: "All Partners", permission: "partner_verification.read" },
  { key: "reports", href: "/admin/partners/reports", label: "Reports", permission: "partner_verification.read" },
];

export const partnerModuleViews = {
  overview: [
    { key: "summary", label: "Summary" },
    { key: "performance", label: "Performance" },
    { key: "revenue", label: "Revenue" },
    { key: "services", label: "Services" },
    { key: "alerts-actions", label: "Alerts & Actions" },
  ],
  applications: [
    { key: "all", label: "All Applications" },
    { key: "new", label: "New" },
    { key: "under-review", label: "Under Review" },
    { key: "documents-pending", label: "Documents Pending" },
    { key: "approved", label: "Approved" },
    { key: "rejected", label: "Rejected" },
  ],
  partners: [
    { key: "all", label: "All" },
    { key: "active", label: "Active" },
    { key: "inactive", label: "Inactive" },
    { key: "suspended", label: "Suspended" },
  ],
  reports: [
    { key: "partner-performance", label: "Partner Performance" },
    { key: "business-bookings", label: "Business & Bookings" },
    { key: "revenue-commission", label: "Revenue & Commission" },
    { key: "settlement-payments", label: "Settlement & Payments" },
    { key: "domain-service", label: "Domain & Service" },
    { key: "geography", label: "Geography" },
  ],
} as const;

export type PartnerModuleKey = keyof typeof partnerModuleViews;

export function partnerModuleView(section: PartnerModuleKey, requested: string | null) {
  const views = partnerModuleViews[section];
  return views.find((view) => view.key === requested) ?? views[0];
}

// Retain existing specialist/detail routes, but do not expose them as module tabs.
export const partnerAdminLegacyRoutes = [
  { href: "/admin/partners/active", label: "Active Partners", permission: "partner_verification.read" },
  { href: "/admin/partner-verification", label: "Verification", permission: "partner_verification.read" },
  { href: "/admin/website-experience/pages/partner/service-catalogue", label: "Service Catalogue", permission: "partner_service_catalogue.read" },
  { href: "/admin/partners/documents-compliance", label: "Documents & Compliance", permission: "partner_verification.read" },
  { href: "/admin/partners/payout-tax", label: "Payout & Tax", permission: "partner_payout_tax.read" },
  { href: "/admin/partners/agreements", label: "Agreements", permission: "partner_agreement.read" },
];

export function partnerAdminRoute(path: string) {
  const pathname = path.split("?")[0].replace(/\/$/, "");
  return [...partnerAdminNavigation, ...partnerAdminLegacyRoutes].find((item) => pathname === item.href || (item.href !== "/admin/partners" && pathname.startsWith(`${item.href}/`)));
}

export function canAccessPartnerModule(permissions: readonly string[]) {
  return [...partnerAdminNavigation, ...partnerAdminLegacyRoutes].some((item) => permissions.includes(item.permission));
}

export function visiblePartnerAdminNavigation(permissions: readonly string[]) {
  // These four tabs currently contain no business data or actions. Future content
  // retains its own server permissions; module visibility grants no authority.
  return canAccessPartnerModule(permissions) ? partnerAdminNavigation : [];
}

export function partnerQueueReturn(path: string, query: string): string {
  let route = partnerAdminRoute(path);
  if (!route) return "/admin/partners";
  const params = new URLSearchParams(query);
  const from = params.get("from");
  if (["organizations", "documents-compliance", "applications"].includes(from ?? "")) {
    route = [...partnerAdminNavigation, ...partnerAdminLegacyRoutes].find((item) => item.href === `/admin/partners/${from}`) ?? route;
  }
  // Keep queue filters, never record selectors, foreign destinations or document URLs.
  const allowed = ["qa", "status", "search", "service", "country", "entityType", "verification", "payoutTax", "agreement", "reviewer", "tab", "state", "submittedAfter"];
  const kept = new URLSearchParams();
  for (const key of allowed) if (params.has(key)) kept.set(key, params.get(key)!);
  return route.href + (kept.size ? `?${kept}` : "");
}
