import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import PartnerModuleSection from "./PartnerModuleSection";
import PartnerAdminNavigation from "./PartnerAdminNavigation";
import PartnerSidebarViews from "./PartnerSidebarViews";
import { partnerAdminNavigation, partnerModuleViews, type PartnerModuleKey } from "./partnerAdminRoutes";

vi.mock("next/dynamic", () => ({ default: (loader: () => unknown) => () => createElement("h3", null, loader.toString().includes("PartnerServicesDashboard") ? "Services" : loader.toString().includes("PartnerRevenueDashboard") ? "Revenue" : loader.toString().includes("PartnerPerformanceDashboard") ? "Performance" : "Summary") }));

let pathname = "/admin/partners";
let query = "";
vi.mock("next/navigation", () => ({ usePathname: () => pathname, useSearchParams: () => new URLSearchParams(query) }));

test("four module sections render their default view without data or actions", () => {
  query = "";
  const sections = ["overview", "applications", "partners", "reports"] as const;
  sections.forEach((section, index) => {
    const html = renderToStaticMarkup(createElement(PartnerModuleSection, { section }));
    expect(html).toContain(`>${partnerAdminNavigation[index].label}</h2>`);
    if (section !== "overview") expect(html).toContain("This view will be set up next.");
    expect(html).toContain(`>${partnerModuleViews[section][0].label}</h3>`);
    expect(html).not.toMatch(/<(button|input|table|form|canvas)\b/);
  });
});

test("every view has its own stable URL and active empty heading; invalid view defaults safely", () => {
  for (const section of Object.keys(partnerModuleViews) as PartnerModuleKey[]) {
    for (const view of partnerModuleViews[section]) {
      query = `view=${view.key}`;
      const html = renderToStaticMarkup(createElement(PartnerModuleSection, { section }));
      expect(html.match(/aria-current="page"/g)).toHaveLength(1);
      expect(html).toContain(`?view=${view.key}`);
      expect(html).toContain(`>${view.label.replaceAll("&", "&amp;")}</h3>`);
    }
    query = "view=unknown";
    expect(renderToStaticMarkup(createElement(PartnerModuleSection, { section }))).toContain(`>${partnerModuleViews[section][0].label}</h3>`);
  }
  query = "";
});

test("sidebar reuses the four main routes with one active child and no nested views", () => {
  for (const route of partnerAdminNavigation) {
    pathname = route.href;
    const html = renderToStaticMarkup(createElement(PartnerSidebarViews, { permissions: ["partner_application.read"] }));
    expect([...html.matchAll(/<a[^>]*>([^<]+)<\/a>/g)].map(match => match[1])).toEqual(["Overview", "Applications", "All Partners", "Reports"]);
    expect(html.match(/aria-current="page"/g)).toHaveLength(1);
  }
  expect(renderToStaticMarkup(createElement(PartnerSidebarViews, { permissions: [] }))).not.toContain("<a");
  pathname = "/admin/customers";
  expect(renderToStaticMarkup(createElement(PartnerSidebarViews, { permissions: ["partner_application.read"] }))).toBe("");
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
