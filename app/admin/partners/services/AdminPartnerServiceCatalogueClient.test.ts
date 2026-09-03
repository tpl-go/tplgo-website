import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const clientSource = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueClient.tsx"), "utf8");
const routeSource = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/service-catalogue/page.tsx"), "utf8");
const partnerListingSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");

test("Service Catalogue route keeps explicit Back to Partner and complete clickable breadcrumbs", () => {
  expect(routeSource).toContain('href="/admin/website-experience/pages/partner" label="Back to Partner"');
  expect(routeSource).toContain('aria-label="Website Experience breadcrumbs"');
  expect(routeSource).toContain('href="/admin/website-experience"');
  expect(routeSource).toContain('href="/admin/website-experience/pages"');
  expect(routeSource).toContain('href="/admin/website-experience/pages/partner"');
  expect(routeSource).toContain('aria-current="page"');
  expect(routeSource).toContain("Service Catalogue");
  expect(routeSource).not.toContain("router.back");
});

test("Service Catalogue home uses compact human header and summary chips", () => {
  expect(clientSource).toContain(">Service Catalogue</h2>");
  expect(clientSource).toContain("Manage Partner service domains and services.");
  expect(clientSource).toContain('aria-label="Catalogue summary"');
  expect(clientSource).toContain('<SummaryChip label="Domains" value={String(domains.length)} />');
  expect(clientSource).toContain('<SummaryChip label="Services" value={String(totalServices)} />');
  expect(clientSource).toContain('<SummaryChip label="Pending Changes" value={String(pendingChanges)} highlight={pendingChanges > 0} />');
  expect(clientSource).toContain("catalogueStatusLabel(state, Boolean(data.hasUnpublishedChanges && data.published.items.length))");
  expect(clientSource).not.toContain("Draft v${data.draftVersion}");
  expect(clientSource).not.toContain("Published v${data.publishedVersion}");
});

test("Service Catalogue home keeps three vertical navigation rows with human descriptions", () => {
  const headerStart = clientSource.indexOf("function CatalogueHeader");
  const domainsStart = clientSource.indexOf("function AllDomainsView");
  const headerSource = clientSource.slice(headerStart, domainsStart);

  expect(headerSource).toContain("catalogueNavRow");
  expect(headerSource).toContain("Domains");
  expect(headerSource).toContain("Manage service domains and their services.");
  expect(headerSource).toContain("Requested Services");
  expect(headerSource).toContain("Review services requested by Partners.");
  expect(headerSource).toContain("Versions & Audit");
  expect(headerSource).toContain("View catalogue versions and activity history.");
  expect(headerSource).not.toContain("grid-cols-3");
});

test("Service Catalogue domain home has one Add Domain entry point and no row action clusters", () => {
  const allDomainsStart = clientSource.indexOf("function AllDomainsView");
  const detailStart = clientSource.indexOf("function DomainDetailView");
  const allDomainsSource = clientSource.slice(allDomainsStart, detailStart);

  expect(allDomainsSource).toContain("Add Domain");
  expect(allDomainsSource.match(/Add Domain/g)?.length).toBe(1);
  expect(allDomainsSource).toContain("props.canManage ? <button");
  expect(allDomainsSource).toContain("onClick={props.onAddDomain}");
  expect(allDomainsSource).toContain("onClick={() => props.onOpen(domain)}");
  expect(allDomainsSource).toContain("flex min-h-24 w-full flex-col");
  expect(allDomainsSource).not.toContain("Edit Domain");
  expect(allDomainsSource).not.toContain("Archive Domain");
  expect(allDomainsSource).not.toContain("Reactivate Domain");
  expect(allDomainsSource).not.toContain("Delete");
});

test("Service Catalogue domain search and filter use human-safe fields and empty states", () => {
  expect(clientSource).toContain("Search Domains");
  expect(clientSource).toContain('placeholder="Search domains"');
  expect(clientSource).toContain("Status Filter");
  expect(clientSource).toContain("domainStatusOptions");
  expect(clientSource).toContain('"Published · Draft Changes"');
  expect(clientSource).toContain("No matching domains");
  expect(clientSource).toContain("No domains have been added yet.");
  expect(clientSource).toContain('normalize([domain.title, domain.description, domain.aliases.join(" ")].join(" "))');
  expect(clientSource).not.toContain('normalize([domain.title, domain.id, domain.description].join(" "))');
});

test("Service Catalogue home derives truthful statuses without per-domain workflow fabrication", () => {
  expect(clientSource).toContain('type DomainStatusLabel = "Draft" | "In Review" | "Changes Requested" | "Approved" | "Scheduled" | "Published" | "Published · Draft Changes" | "Archived";');
  expect(clientSource).toContain('if (status === "archived") return "Archived";');
  expect(clientSource).toContain('if (draftCount > 0 && hasPublishedContent) return "Published · Draft Changes";');
  expect(clientSource).toContain('return hasPublishedContent ? "Published" : "Draft";');
  expect(clientSource).toContain('const status = domainItems.length === 0 ? "inactive"');
  expect(clientSource).not.toContain("sectionDomain");
  expect(clientSource).not.toContain("exactScope");
  expect(clientSource).not.toContain("Draft-only service Domain");
});

test("Service Catalogue loading and error states are employee-facing", () => {
  expect(clientSource).toContain('title="Loading service catalogue..."');
  expect(clientSource).toContain("title=\"We couldn't load the service catalogue.\"");
  expect(clientSource).toContain("Retry");
  expect(clientSource).not.toContain("staging API");
  expect(clientSource).not.toContain("API health");
  expect(clientSource).not.toContain("HTTP response");
});

test("Service Catalogue home removes developer-facing presentation language", () => {
  const forbiddenTerms = [
    "S4A",
    "S4B",
    "S4D",
    "runtime catalogue authority",
    "DB-backed catalogue",
    "published config source",
    "stable code",
    "verification profile key",
    "capabilities metadata",
    "immutable snapshot",
    "backend",
    "frontend",
    "schema/configuration",
    "policy engine",
    "staging workspace",
    "deployment fingerprints",
    "Website Experience / Pages / Partner",
    "central Partner page context",
  ];
  const homeStart = clientSource.indexOf("function CatalogueHeader");
  const detailStart = clientSource.indexOf("function DomainDetailView");
  const homeSource = clientSource.slice(homeStart, detailStart);
  for (const term of forbiddenTerms) {
    expect(homeSource).not.toContain(term);
  }
});

test("Partner listing remains unchanged for Service Catalogue destination and copy", () => {
  expect(partnerListingSource).toContain('title="Partner"');
  expect(partnerListingSource).toContain('detail="Choose a Partner area to manage."');
  expect(partnerListingSource).toContain('title="Service Catalogue" detail="Manage Partner service domains and services."');
  expect(partnerListingSource).toContain('href="/admin/website-experience/pages/partner/service-catalogue"');
});
