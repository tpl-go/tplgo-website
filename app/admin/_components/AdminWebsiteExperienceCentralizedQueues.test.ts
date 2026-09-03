import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const centralSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceCentralizedQueues.tsx"), "utf8");
const landingSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");
const catalogueSource = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueClient.tsx"), "utf8");
const requestRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/service-requests/page.tsx"), "utf8");
const auditRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/versions-audit/page.tsx"), "utf8");

test("Website Experience Home centralizes Service Requests in Work Queue", () => {
  expect(landingSource).toContain('title="Service Requests"');
  expect(landingSource).toContain('detail="Review services requested by Partners."');
  expect(landingSource).toContain('href="/admin/website-experience/service-requests"');
  expect(landingSource).toContain("serviceRequestLabel");
  expect(landingSource).toContain("catalogue.requestedServices.filter");
  expect(landingSource).toContain("Work Queue");
  expect(landingSource).toContain("VerticalEntry");
});

test("central Service Requests route has human header, breadcrumbs, and Back hierarchy", () => {
  expect(existsSync(join(process.cwd(), "app/admin/website-experience/service-requests/page.tsx"))).toBe(true);
  expect(requestRouteSource).toContain('requiredPermissions={["partner_service_catalogue.read"]}');
  expect(requestRouteSource).toContain('AdminShell title="Service Requests"');
  expect(centralSource).toContain('label="Back to Website Experience"');
  expect(centralSource).toContain('title="Service Requests" subtitle="Review services requested by Partners."');
  expect(centralSource).toContain('{ label: "Website Experience", href: "/admin/website-experience" }');
  expect(centralSource).toContain('{ label: "Service Requests", href: "/admin/website-experience/service-requests" }');
  expect(centralSource).toContain('label="Back to Service Requests"');
});

test("central Service Requests list uses human statuses and preserves explicit actions", () => {
  expect(centralSource).toContain('"New"');
  expect(centralSource).toContain('"Under Review"');
  expect(centralSource).toContain('"Mapped"');
  expect(centralSource).toContain('"Draft Created"');
  expect(centralSource).toContain('"Rejected"');
  expect(centralSource).toContain('"Closed"');
  expect(centralSource).toContain("Map to Existing Service");
  expect(centralSource).toContain("Create Draft Service");
  expect(centralSource).toContain("Reject");
  expect(centralSource).toContain("Close");
  expect(centralSource).toContain("resolveAdminPartnerRequestedService");
  expect(centralSource).toContain("saveAdminPartnerServiceCatalogueDraft");
  expect(centralSource).not.toContain("publishAdminPartnerServiceCatalogue");
});

test("Service Catalogue Home no longer stacks requested service or audit content", () => {
  const headerStart = catalogueSource.indexOf("function CatalogueHeader");
  const detailStart = catalogueSource.indexOf("function DomainDetailView");
  const homeSource = catalogueSource.slice(headerStart, detailStart);

  expect(catalogueSource).not.toContain("function RequestedServicesView");
  expect(catalogueSource).not.toContain("function VersionsAuditView");
  expect(homeSource).not.toContain("catalogueNavRow");
  expect(homeSource).not.toContain("Requested Services");
  expect(homeSource).not.toContain("Versions & Audit");
  expect(homeSource).toContain("Search Domains");
  expect(homeSource).toContain("Status Filter");
  expect(homeSource).toContain("Add Domain");
  expect(homeSource).toContain("flex min-h-20 w-full flex-col");
});

test("Service Catalogue summary prevents zero-pending draft contradiction", () => {
  expect(catalogueSource).toContain('pendingChanges > 0 ? <SummaryChip label={pendingChanges === 1 ? "Pending Change" : "Pending Changes"} value={String(pendingChanges)} highlight /> : null');
  expect(catalogueSource).toContain('if (pendingChanges > 0 && hasPublishedContent) return "Published with Draft Changes";');
  expect(catalogueSource).toContain('return state === "draft" && pendingChanges > 0 ? "Draft" : "Published";');
  expect(catalogueSource).not.toContain("0 Pending Changes");
  expect(catalogueSource).not.toContain("Published · Draft Changes");
});

test("central Versions & Audit route combines Website Experience and Service Catalogue history", () => {
  expect(existsSync(join(process.cwd(), "app/admin/website-experience/versions-audit/page.tsx"))).toBe(true);
  expect(auditRouteSource).toContain('AdminShell title="Versions & Audit"');
  expect(centralSource).toContain("buildAuditRows(state.website, state.catalogue)");
  expect(centralSource).toContain("catalogue.audit.map");
  expect(centralSource).toContain("catalogue.versions.map");
  expect(centralSource).toContain("website.recentAudit.map");
  expect(centralSource).toContain('<option value="service_catalogue">Service Catalogue</option>');
  expect(centralSource).toContain('label="Back to Versions & Audit"');
  expect(centralSource).toContain('label="Back to Website Experience"');
});

test("centralization keeps production/data safety boundaries in source", () => {
  expect(centralSource).not.toContain("router.back");
  expect(centralSource).not.toContain("archive/delete");
  expect(centralSource).not.toContain("auto-publish");
  expect(centralSource).not.toContain("deployment fingerprint");
  expect(centralSource).not.toContain("DB-backed catalogue");
});
