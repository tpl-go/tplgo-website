import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { readFileSync } from "node:fs";
import { expect, test, vi } from "vitest";
import PartnerAdminNavigation from "./PartnerAdminNavigation";
import { partnerAdminNavigation } from "./partnerAdminRoutes";

let path = "/admin/partners";
vi.mock("next/navigation", () => ({ usePathname: () => path, useSearchParams: () => new URLSearchParams("search=demo") }));
test("one page title, breadcrumb and contextual nav on each canonical route", () => {
  for (const item of partnerAdminNavigation) {
    path = item.href;
    const html = renderToStaticMarkup(createElement(PartnerAdminNavigation, { permissions: partnerAdminNavigation.map((entry) => entry.permission) }));
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html.match(/aria-label="Partner navigation"/g)).toHaveLength(1);
    expect(html).toContain('aria-label="Partner breadcrumbs"');
    expect(html).toContain('overflow-x-auto');
    expect(html).toContain('min-h-11');
    expect(html).toContain('focus-visible:outline');
  }
});
test("Rules renders a safe same-queue return and no nested shell", () => {
  path = "/admin/partner-verification/rules";
  const html = renderToStaticMarkup(createElement(PartnerAdminNavigation, { permissions: ["partner_verification.read"] }));
  expect(html).toContain("Back to Verification");
  expect(html).toContain("/admin/partner-verification?search=demo");
  const source = readFileSync("app/admin/partner-verification/rules/page.tsx", "utf8");
  expect(source.match(/<AdminShell\b/g)).toHaveLength(1);
  expect(source).not.toContain("<h1");
});
test("unresolved permissions expose no module links", () => {
  path = "/admin/partners/applications";
  const html = renderToStaticMarkup(createElement(PartnerAdminNavigation, { permissions: [] }));
  expect(html).not.toContain("<a");
});
test("page bodies delegate H1 and breadcrumbs to the shared shell", () => {
  for (const file of ["app/admin/partner-verification/page.tsx", "app/admin/partner-verification/rules/page.tsx", "app/admin/partners/applications/AdminPartnerApplicationsClient.tsx", "app/admin/partners/payout-tax/page.tsx", "app/admin/partners/agreements/page.tsx", "app/admin/partners/_components/PartnerAdminReadModel.tsx"]) {
    const source = readFileSync(file, "utf8");
    expect(source).not.toContain("<h1");
    expect(source).not.toContain("`r`n");
    expect(source).not.toContain("Staging Partner operations");
  }
});
