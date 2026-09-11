export const partnerAdminNavigation = [
  { href: "/admin/partners", label: "Overview", permission: "partner_verification.read" },
  { href: "/admin/partners/applications", label: "Applications", permission: "partner_application.read" },
  { href: "/admin/partner-verification", label: "Verification", permission: "partner_verification.read" },
  { href: "/admin/partners/organizations", label: "Organizations", permission: "partner_verification.read" },
  { href: "/admin/website-experience/pages/partner/service-catalogue", label: "Service Catalogue", permission: "partner_service_catalogue.read" },
  { href: "/admin/partners/documents-compliance", label: "Documents & Compliance", permission: "partner_verification.read" },
  { href: "/admin/partners/payout-tax", label: "Payout & Tax", permission: "partner_payout_tax.read" },
  { href: "/admin/partners/agreements", label: "Agreements", permission: "partner_agreement.read" },
];

export function partnerAdminRoute(path: string) {
  const pathname = path.split("?")[0].replace(/\/$/, "");
  return partnerAdminNavigation.find((item) => pathname === item.href || (item.href !== "/admin/partners" && pathname.startsWith(`${item.href}/`)));
}

export function visiblePartnerAdminNavigation(permissions: readonly string[]) {
  return partnerAdminNavigation.filter((item) => permissions.includes(item.permission));
}

export function partnerQueueReturn(path: string, query: string): string {
  let route = partnerAdminRoute(path);
  if (!route) return "/admin/partners";
  const params = new URLSearchParams(query);
  const from = params.get("from");
  if (["organizations", "documents-compliance", "applications"].includes(from ?? "")) {
    route = partnerAdminNavigation.find((item) => item.href === `/admin/partners/${from}`) ?? route;
  }
  // Keep queue filters, never record selectors, foreign destinations or document URLs.
  const allowed = ["qa", "status", "search", "service", "country", "entityType", "verification", "payoutTax", "agreement", "reviewer", "tab", "state", "submittedAfter"];
  const kept = new URLSearchParams();
  for (const key of allowed) if (params.has(key)) kept.set(key, params.get(key)!);
  return route.href + (kept.size ? `?${kept}` : "");
}
