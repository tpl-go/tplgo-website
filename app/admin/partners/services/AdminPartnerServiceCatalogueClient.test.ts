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
  expect(clientSource).toContain('pendingChanges > 0 ? <SummaryChip label={pendingChanges === 1 ? "Pending Change" : "Pending Changes"} value={String(pendingChanges)} highlight /> : null');
  expect(clientSource).toContain("catalogueStatusLabel(state, pendingChanges, Boolean(data.published.items.length))");
  expect(clientSource).not.toContain("Draft v${data.draftVersion}");
  expect(clientSource).not.toContain("Published v${data.publishedVersion}");
});

test("Service Catalogue home removes duplicate request and audit navigation rows", () => {
  const headerStart = clientSource.indexOf("function CatalogueHeader");
  const domainsStart = clientSource.indexOf("function AllDomainsView");
  const headerSource = clientSource.slice(headerStart, domainsStart);

  expect(headerSource).not.toContain("catalogueNavRow");
  expect(headerSource).not.toContain("Requested Services");
  expect(headerSource).not.toContain("Versions & Audit");
  expect(headerSource).not.toContain("grid-cols-3");
  expect(clientSource).not.toContain("function RequestedServicesView");
  expect(clientSource).not.toContain("function VersionsAuditView");
  expect(clientSource).toContain('href="/admin/website-experience/service-requests"');
  expect(clientSource).toContain('href="/admin/website-experience/versions-audit?source=service_catalogue"');
});

test("Service Catalogue domain home has one Add Domain entry point and no row action clusters", () => {
  const allDomainsStart = clientSource.indexOf("function AllDomainsView");
  const detailStart = clientSource.indexOf("function DomainDetailView");
  const allDomainsSource = clientSource.slice(allDomainsStart, detailStart);

  expect(allDomainsSource).toContain("Add Domain");
  expect(allDomainsSource.match(/Add Domain/g)?.length).toBe(1);
  expect(allDomainsSource).toContain("props.canManage ? <Link");
  expect(allDomainsSource).toContain("props.addDomainHref");
  expect(clientSource).toContain('addDomainHref="/admin/website-experience/pages/partner/service-catalogue/domains/new"');
  expect(allDomainsSource).toContain("onClick={() => props.onOpen(domain)}");
  expect(allDomainsSource).toContain("flex min-h-20 w-full flex-col");
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
  expect(clientSource).toContain('"Published with Draft Changes"');
  expect(clientSource).toContain("No matching domains");
  expect(clientSource).toContain("No domains have been added yet.");
  expect(clientSource).toContain('normalize([domain.title, domain.description, domain.aliases.join(" ")].join(" "))');
  expect(clientSource).not.toContain('normalize([domain.title, domain.id, domain.description].join(" "))');
});

test("Service Catalogue home derives truthful statuses without per-domain workflow fabrication", () => {
  expect(clientSource).toContain('type DomainStatusLabel = "Draft" | "In Review" | "Changes Requested" | "Approved" | "Scheduled" | "Published" | "Published with Draft Changes" | "Archived";');
  expect(clientSource).toContain('if (status === "archived") return "Archived";');
  expect(clientSource).toContain('if (draftCount > 0 && hasPublishedContent) return "Published with Draft Changes";');
  expect(clientSource).toContain('return hasPublishedContent ? "Published" : "Draft";');
  expect(clientSource).toContain('const status = domainItems.length === 0 ? "inactive"');
  expect(clientSource).toContain('if (pendingChanges > 0 && hasPublishedContent) return "Published with Draft Changes";');
  expect(clientSource).toContain('return state === "draft" && pendingChanges > 0 ? "Draft" : "Published";');
  expect(clientSource).not.toContain("sectionDomain");
  expect(clientSource).not.toContain("exactScope");
  expect(clientSource).not.toContain("Draft-only service Domain");
});

test("Service Catalogue loading and error states are employee-facing", () => {
  expect(clientSource).toContain('title={hasDetailContext ? "Loading domain..." : "Loading service catalogue..."}');
  expect(clientSource).toContain('title={hasDetailContext ? "We couldn\'t load this domain." : "We couldn\'t load the service catalogue."}');
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

test("Domain Detail hides Catalogue Home chrome and keeps explicit Back to Service Catalogue", () => {
  const detailStart = clientSource.indexOf("function DomainDetailView");
  const serviceStart = clientSource.indexOf("function ServiceFocusedView");
  const detailSource = clientSource.slice(detailStart, serviceStart);

  expect(clientSource).toContain("const showCatalogueHomeHeader = !selectedDomain && !selectedItem;");
  expect(clientSource).toContain("!showCatalogueHomeHeader ? <HideCatalogueRouteChrome /> : null");
  expect(routeSource).toContain("catalogueRouteChrome");
  expect(detailSource).toContain('href="/admin/website-experience/pages/partner/service-catalogue" label="Back to Service Catalogue"');
  expect(detailSource).not.toContain("Back to Partner");
  expect(detailSource).toContain("<DomainBreadcrumb domainName={props.domain.title} />");
});

test("Domain Detail uses complete clickable breadcrumbs without technical identifiers", () => {
  const breadcrumbStart = clientSource.indexOf("function DomainBreadcrumb");
  const statusStart = clientSource.indexOf("function StatusChip");
  const breadcrumbSource = clientSource.slice(breadcrumbStart, statusStart);

  expect(breadcrumbSource).toContain('href="/admin/website-experience"');
  expect(breadcrumbSource).toContain('href="/admin/website-experience/pages"');
  expect(breadcrumbSource).toContain('href="/admin/website-experience/pages/partner"');
  expect(breadcrumbSource).toContain('href="/admin/website-experience/pages/partner/service-catalogue"');
  expect(breadcrumbSource).toContain('aria-current="page"');
  expect(breadcrumbSource).not.toContain("stableCode");
  expect(breadcrumbSource).not.toContain("domain.id");
});

test("Domain Detail prioritizes actions and moves secondary actions under More Actions", () => {
  const detailStart = clientSource.indexOf("function DomainDetailView");
  const serviceStart = clientSource.indexOf("function ServiceFocusedView");
  const detailSource = clientSource.slice(detailStart, serviceStart);

  expect(detailSource).toContain("Add Service");
  expect(detailSource).toContain("Edit Domain");
  expect(detailSource).toContain("props.editDomainHref");
  expect(detailSource).toContain("More Actions");
  expect(detailSource).toContain("Add Category");
  expect(detailSource).toContain("Version History");
  expect(detailSource).toContain("Start Archive");
  expect(detailSource).not.toContain("Delete Domain");
});

test("Domain Detail filters use human labels and keep search inside current domain", () => {
  const detailStart = clientSource.indexOf("function DomainDetailView");
  const serviceStart = clientSource.indexOf("function ServiceFocusedView");
  const detailSource = clientSource.slice(detailStart, serviceStart);

  expect(detailSource).toContain("Search services");
  expect(detailSource).toContain('placeholder="Search services"');
  expect(detailSource).toContain('Select label="Type"');
  expect(detailSource).toContain('Select label="Status"');
  expect(detailSource).toContain("More Filters");
  expect(detailSource).toContain("Application availability");
  expect(detailSource).not.toContain('Select label="Selectable"');
  expect(clientSource).toContain('normalize([item.name, item.shortDescription, item.aliases.join(" ")].join(" "))');
  expect(clientSource).not.toContain("item.stableCode, item.verificationProfileKey");
});

test("Domain Detail service rows are vertical full-row targets without row action clutter", () => {
  const rowStart = clientSource.indexOf("function HierarchyRow");
  const serviceStart = clientSource.indexOf("function ServiceFocusedView");
  const rowSource = clientSource.slice(rowStart, serviceStart);

  expect(clientSource).toContain("const visibleScopedItems = useMemo(() => activeDomain ? scopedItems.filter((item) => !isDomainRootItem(item, activeDomain)) : scopedItems");
  expect(clientSource).toContain('function isDomainRootItem(item: AdminPartnerServiceCatalogueItem, domain: { id: string; title: string })');
  expect(clientSource).toContain('item.stableCode === `${domain.id}-root`');
  expect(clientSource).toContain('const parent = item.parentCode ? domainItems.find((candidate) => candidate.stableCode === item.parentCode) : undefined;');
  expect(rowSource).toContain("flex min-h-20 w-full flex-col");
  expect(rowSource).toContain("onClick={() => onOpenItem?.(node.item)}");
  expect(rowSource).toContain("titleKind(kind)");
  expect(rowSource).toContain("itemStatusLabel(node.item)");
  expect(rowSource).not.toContain("Edit Service");
  expect(rowSource).not.toContain("Add Sub-service");
  expect(rowSource).not.toContain("Archive");
  expect(rowSource).not.toContain("Safe Delete");
  expect(rowSource).not.toContain("Parent:");
  expect(rowSource).not.toContain("Selectable");
});

test("Domain Detail loading empty and error states are human-friendly", () => {
  expect(clientSource).toContain('title={hasDetailContext ? "Loading domain..." : "Loading service catalogue..."}');
  expect(clientSource).toContain('title={hasDetailContext ? "We couldn\'t load this domain." : "We couldn\'t load the service catalogue."}');
  expect(clientSource).toContain("No services have been added to this domain yet.");
  expect(clientSource).toContain("No matching services found.");
  expect(clientSource).toContain("Retry");
});
