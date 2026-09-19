import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import PartnerModuleSection from "./PartnerModuleSection";
import PartnerAdminNavigation from "./PartnerAdminNavigation";
import { partnerAdminNavigation } from "./partnerAdminRoutes";

let pathname = "/admin/partners";
vi.mock("next/navigation", () => ({ usePathname: () => pathname, useSearchParams: () => new URLSearchParams() }));

test("four module sections render only their named empty shell", () => {
  const sections = ["overview", "applications", "partners", "reports"] as const;
  sections.forEach((section, index) => {
    const html = renderToStaticMarkup(createElement(PartnerModuleSection, { section }));
    expect(html).toContain(`>${partnerAdminNavigation[index].label}</h2>`);
    expect(html).toContain("This section will be set up next.");
    expect(html).not.toMatch(/<(button|input|table|form|canvas)\b/);
    expect(html).not.toMatch(/KYC|Documents|Services|Bookings|Payments|Settlement|Ledger|Activity Log/);
  });
});

test("every module route renders exactly four ordered tabs and one current tab", () => {
  for (const route of partnerAdminNavigation) {
    pathname = route.href;
    const html = renderToStaticMarkup(createElement(PartnerAdminNavigation, { permissions: ["partner_application.read"] }));
    const nav = html.match(/<nav aria-label="Partner navigation"[\s\S]*?<\/nav>/)?.[0] ?? "";
    expect([...nav.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(match => match[1])).toEqual(["Overview", "Applications", "All Partners", "Reports"]);
    expect(nav.match(/aria-current="page"/g)).toHaveLength(1);
    expect(nav).toContain(`href="${route.href}"`);
    expect(html).toContain(">Partners</h1>");
  }
});
