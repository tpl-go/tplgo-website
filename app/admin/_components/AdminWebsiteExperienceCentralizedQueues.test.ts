import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const centralSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceCentralizedQueues.tsx"), "utf8");
const landingSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");
const catalogueSource = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueClient.tsx"), "utf8");
const requestRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/service-requests/page.tsx"), "utf8");
const auditRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/versions-audit/page.tsx"), "utf8");

test("Website Experience Home exposes central History without the retired Work Queue shell", () => {
  expect(landingSource).toContain('href="/admin/website-experience/versions-audit"');
  expect(landingSource).toContain("History");
  expect(landingSource).toContain('data-central-workflow-dashboard="real-data"');
  expect(landingSource).not.toContain("Versions & Audit");
  expect(landingSource).not.toContain("Work Queue");
  expect(landingSource).not.toContain('title="Service Requests"');
});

test("central Service Requests route has human header, breadcrumbs, and Back hierarchy", () => {
  expect(existsSync(join(process.cwd(), "app/admin/website-experience/service-requests/page.tsx"))).toBe(true);
  expect(requestRouteSource).toContain('requiredPermissions={["partner_service_catalogue.read"]}');
  expect(requestRouteSource).toContain('AdminShell title="Website Experience"');
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

test("central History route combines Website Experience and Service Catalogue history", () => {
  expect(existsSync(join(process.cwd(), "app/admin/website-experience/versions-audit/page.tsx"))).toBe(true);
  expect(auditRouteSource).toContain('AdminShell title="History"');
  expect(centralSource).toContain("buildAuditRows(state.website, state.catalogue)");
  expect(centralSource).toContain("catalogue.audit.map");
  expect(centralSource).toContain("catalogue.versions");
  expect(centralSource).toContain(".filter((row) => !pairedVersionIds.has(row.id))");
  expect(centralSource).toContain("website.recentAudit.map");
  expect(centralSource).toContain('<option value="service_catalogue">Service Catalogue</option>');
  expect(centralSource).toContain('label="Back to History"');
  expect(centralSource).toContain('label="Back to Website Experience"');
});

test("central History maps internal event codes to operator labels", () => {
  expect(centralSource).toContain('draft: "Draft saved"');
  expect(centralSource).toContain('submitted: "Sent for approval"');
  expect(centralSource).toContain('approved: "Approved"');
  expect(centralSource).toContain('changes_requested: "Changes requested"');
  expect(centralSource).toContain('scheduled: "Scheduled"');
  expect(centralSource).toContain('schedule_cancelled: "Schedule cancelled"');
  expect(centralSource).toContain('published: "Published"');
  expect(centralSource).toContain('archived: "Archived"');
  expect(centralSource).toContain('baseline: "Initial version created"');
  expect(centralSource).toContain("normalizedHistoryAction(value)");
});

test("central History presentation avoids raw dotted technical labels", () => {
  expect(centralSource).toContain("historyActionLabel(row.action)");
  expect(centralSource).toContain("cleanHistorySummary(row.changeSummary)");
  expect(centralSource).not.toContain("Website Experience.draft");
  expect(centralSource).not.toContain("Website Experience.submitted");
  expect(centralSource).not.toContain("Partner Service Catalogue.published");
  expect(centralSource).not.toContain("`${record.source}.${record");
});

test("central History identifies exact item, content type, actor, version and state", () => {
  expect(centralSource).toContain("itemTitle: target.title");
  expect(centralSource).toContain('contentType: "Agreement Template"');
  expect(centralSource).toContain('contentType: "Service Catalogue"');
  expect(centralSource).toContain("actor: historyActor(row.actorAdminId)");
  expect(centralSource).toContain("versionLabel: relatedVersion ? `Version ${relatedVersion.version}` : undefined");
  expect(centralSource).toContain("previousState");
  expect(centralSource).toContain("resultingState");
  expect(centralSource).toContain("formatHistoryDateTime(selectedRecord.createdAt)");
});

test("central History keeps Agreement Template events identifiable", () => {
  expect(centralSource).toContain("agreementTemplateTitleFromHistory(entityId, summary)");
  expect(centralSource).toContain('area: "agreement_template"');
  expect(centralSource).toContain('title: agreementTemplateTitle');
  expect(centralSource).toContain('href: templateId ? `/admin/website-experience/pages/partner/application/step-7-partner-agreement/agreement-templates/${encodeURIComponent(templateId)}`');
  expect(centralSource).toContain('<option value="agreement_template">Agreement Templates</option>');
});

test("central History relates audit and version records without timestamp-only collapsing", () => {
  expect(centralSource).toContain("catalogueVersionByRelation.set(version.id, version)");
  expect(centralSource).toContain("catalogueVersionByRelation.set(String(version.version), version)");
  expect(centralSource).toContain("const relatedVersion = row.entityId ? catalogueVersionByRelation.get(row.entityId) : undefined");
  expect(centralSource).toContain("pairedVersionIds.add(relatedVersion.id)");
  expect(centralSource).toContain('.filter((row) => !pairedVersionIds.has(row.id))');
  expect(centralSource).not.toContain("Math.abs(Date.parse");
});

test("central History filters search, content area and activity type together", () => {
  expect(centralSource).toContain('data-history-filters="compact"');
  expect(centralSource).toContain("setSearch(params.get(\"search\") ?? \"\")");
  expect(centralSource).toContain("record.actionLabel");
  expect(centralSource).toContain("record.itemTitle");
  expect(centralSource).toContain("matchesSearch && matchesSource && matchesType");
  expect(centralSource).toContain('<option value="draft_changes">Draft changes</option>');
  expect(centralSource).toContain('<option value="approval">Approval activity</option>');
  expect(centralSource).toContain('<option value="scheduling">Scheduling</option>');
  expect(centralSource).toContain('<option value="publishing">Publishing</option>');
  expect(centralSource).toContain('<option value="versions">Versions</option>');
  expect(centralSource).toContain('No history records match these filters.');
});

test("central History detail and navigation stay operator-facing and safe", () => {
  expect(centralSource).toContain('data-history-detail="operator"');
  for (const label of ["Item", "Content type", "Area", "Actor", "When", "Version", "Previous state", "Resulting state", "Summary"]) {
    expect(centralSource).toContain(`label="${label}"`);
  }
  expect(centralSource).toContain('label: "Open item"');
  expect(centralSource).toContain('data-history-related-target={selectedRecord.id}');
  expect(centralSource).toContain('window.addEventListener("popstate", syncFromUrl)');
  expect(centralSource).toContain('{ label: "History", href: "/admin/website-experience/versions-audit" }');
  expect(centralSource).not.toContain("raw UUID");
  expect(centralSource).not.toContain("storageKey");
});

test("central History responsive layout avoids horizontal overflow", () => {
  expect(centralSource).toContain("sm:grid-cols-2");
  expect(centralSource).toContain("xl:grid-cols-[minmax(14rem,1fr)_14rem_14rem]");
  expect(centralSource).toContain("w-full min-w-0 flex-col");
  expect(centralSource).toContain("break-words");
  expect(centralSource).toContain("flex-wrap");
});

test("centralization keeps production/data safety boundaries in source", () => {
  expect(centralSource).not.toContain("router.back");
  expect(centralSource).not.toContain("archive/delete");
  expect(centralSource).not.toContain("auto-publish");
  expect(centralSource).not.toContain("deployment fingerprint");
  expect(centralSource).not.toContain("DB-backed catalogue");
  expect(centralSource).not.toContain("restore");
});
