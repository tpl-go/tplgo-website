import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";
import {
  buildAuditRows,
  filterHistoryRows,
  historyActionLabel,
  historyEventType,
} from "./AdminWebsiteExperienceHistoryPresentation";
import type { AdminPartnerServiceCatalogueResponse, WebsiteExperienceAdminResponse } from "../../lib/admin/adminApiClient";

const centralSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceCentralizedQueues.tsx"), "utf8");
const presentationSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceHistoryPresentation.ts"), "utf8");
const landingSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");
const catalogueSource = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueClient.tsx"), "utf8");
const requestRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/service-requests/page.tsx"), "utf8");
const auditRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/versions-audit/page.tsx"), "utf8");

const emptyContentTree = { id: "root", label: "Root", fields: [], children: [] };

function websiteFixture(recentAudit: WebsiteExperienceAdminResponse["recentAudit"]): WebsiteExperienceAdminResponse {
  return {
    contexts: [],
    permissions: { canRead: true, canWrite: true, canPublish: true },
    schema: { contexts: [], mediaSlots: [], editableFields: [], lockedSecurityFields: [], allowedMediaTypes: [], maxBenefits: 0, maxMediaBytes: 0 },
    recentMedia: [],
    recentAudit,
    partnerRegistrationIntakes: [],
  } as unknown as WebsiteExperienceAdminResponse;
}

function catalogueFixture(
  audit: AdminPartnerServiceCatalogueResponse["audit"],
  versions: AdminPartnerServiceCatalogueResponse["versions"] = [],
): AdminPartnerServiceCatalogueResponse {
  return {
    draft: {
      items: [{ id: "hotel-item", stableCode: "hotel", name: "Hotel" }],
      contentTree: emptyContentTree,
    },
    published: {
      items: [{ id: "hotel-item", stableCode: "hotel", name: "Hotel" }],
      contentTree: emptyContentTree,
    },
    preview: {
      items: [{ id: "hotel-item", stableCode: "hotel", name: "Hotel" }],
      contentTree: emptyContentTree,
    },
    draftVersion: 4,
    publishedVersion: 12,
    status: "draft",
    permissions: { canRead: true, canManage: true, canPublish: true },
    scheduling: { supported: false, reason: "" },
    versions,
    audit,
    requestedServices: [],
    schema: { statuses: [], capabilities: [], editableFields: [], lockedFields: [], lifecycleActions: [], resolutionActions: [] },
  } as unknown as AdminPartnerServiceCatalogueResponse;
}

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
  expect(presentationSource).toContain("catalogue.audit.map");
  expect(presentationSource).toContain("catalogue.versions");
  expect(presentationSource).toContain(".filter((row) => !pairedVersionIds.has(row.id))");
  expect(presentationSource).toContain("website.recentAudit.map");
  expect(centralSource).toContain('<option value="service_catalogue">Service Catalogue</option>');
  expect(centralSource).toContain('label="Back to History"');
  expect(centralSource).toContain('label="Back to Website Experience"');
});

test("central History maps internal event codes to operator labels", () => {
  expect(presentationSource).toContain('draft: "Draft saved"');
  expect(presentationSource).toContain('draft_saved: "Draft saved"');
  expect(presentationSource).toContain('submitted: "Sent for approval"');
  expect(presentationSource).toContain('approved: "Approved"');
  expect(presentationSource).toContain('changes_requested: "Changes requested"');
  expect(presentationSource).toContain('scheduled: "Scheduled"');
  expect(presentationSource).toContain('schedule_cancelled: "Schedule cancelled"');
  expect(presentationSource).toContain('published: "Published"');
  expect(presentationSource).toContain('archived: "Archived"');
  expect(presentationSource).toContain('baseline: "Initial version created"');
  expect(presentationSource).toContain("normalizedHistoryAction(value)");
});

test("central History classifies staging-shaped Agreement Template draft save variants as Draft changes", () => {
  const website = websiteFixture([
    {
      id: "agreement-draft",
      context: "partner_application",
      entityId: "agreement_template:qa-template",
      action: "draft",
      actorAdminId: "operator@example.com",
      changeSummary: "Saved agreement template draft: QA Agreement Upload Test",
      createdAt: "2026-09-10T06:01:12.000Z",
    },
    {
      id: "agreement-saved",
      context: "partner_application",
      entityId: "agreement_template:qa-template",
      action: "agreement_template.saved",
      actorAdminId: "operator@example.com",
      changeSummary: "Saved agreement template draft: QA Agreement Upload Test",
      createdAt: "2026-09-10T06:02:12.000Z",
    },
    {
      id: "agreement-dotted-draft-saved",
      context: "partner_application",
      entityId: "agreement_template:qa-template",
      action: "Website Experience.draft_saved",
      actorAdminId: "operator@example.com",
      changeSummary: "Saved agreement template draft: QA Agreement Upload Test",
      createdAt: "2026-09-10T06:03:12.000Z",
    },
  ]);
  const rows = buildAuditRows(website, catalogueFixture([]));
  const draftRows = filterHistoryRows(rows, { search: "", source: "agreement_template", eventType: "draft_changes" });

  expect(historyActionLabel("Website Experience.draft_saved")).toBe("Draft saved");
  expect(historyEventType("Website Experience.draft_saved")).toBe("draft_changes");
  expect(draftRows).toHaveLength(3);
  expect(draftRows.every((row) => row.actionLabel === "Draft saved")).toBe(true);
});

test("central History cleans only confirmed workflow prefixes from Agreement Template titles", () => {
  const rows = buildAuditRows(
    websiteFixture([
      {
        id: "prefixed-title",
        context: "partner_application",
        entityId: "agreement_template:qa-template",
        action: "draft",
        actorAdminId: "operator@example.com",
        changeSummary: "Saved agreement template draft: QA Agreement Upload Test",
        createdAt: "2026-09-10T06:01:12.000Z",
      },
      {
        id: "legitimate-colon-title",
        context: "partner_application",
        entityId: "agreement_template:colon-title",
        action: "saved",
        actorAdminId: "operator@example.com",
        changeSummary: "Saved agreement template Package: Agency Terms",
        createdAt: "2026-09-10T06:02:12.000Z",
      },
    ]),
    catalogueFixture([]),
  );

  expect(rows.find((row) => row.id === "website:prefixed-title")?.itemTitle).toBe("QA Agreement Upload Test");
  expect(rows.find((row) => row.id === "website:legitimate-colon-title")?.itemTitle).toBe("Package: Agency Terms");
});

test("central History keeps Service Catalogue and Agreement Template area metadata distinct", () => {
  const rows = buildAuditRows(
    websiteFixture([
      {
        id: "agreement-area",
        context: "partner_application",
        entityId: "agreement_template:qa-template",
        action: "draft",
        actorAdminId: "operator@example.com",
        changeSummary: "Saved agreement template draft: QA Agreement Upload Test",
        createdAt: "2026-09-10T06:01:12.000Z",
      },
    ]),
    catalogueFixture([
      {
        id: "hotel-draft",
        action: "draft",
        entityId: "hotel",
        actorAdminId: "operator@example.com",
        changeSummary: "Partner Service Catalogue.draft Saved",
        createdAt: "2026-09-10T06:01:12.000Z",
      },
    ]),
  );

  expect(rows.find((row) => row.id === "catalogue-audit:hotel-draft")).toMatchObject({
    itemTitle: "Hotel",
    contentType: "Service Catalogue",
    contentArea: "Service Catalogue",
  });
  expect(rows.find((row) => row.id === "website:agreement-area")).toMatchObject({
    contentType: "Agreement Template",
    contentArea: "Partner Application",
  });
});

test("central History Versions filter includes only saved versions or proven version-linked workflow records", () => {
  const rows = buildAuditRows(
    websiteFixture([]),
    catalogueFixture(
      [
        {
          id: "hotel-unpaired",
          action: "draft",
          entityId: "hotel",
          actorAdminId: "operator@example.com",
          changeSummary: "Partner Service Catalogue.draft Saved",
          createdAt: "2026-09-10T06:01:12.000Z",
        },
        {
          id: "hotel-linked",
          action: "draft",
          entityId: "catalogue-version:12",
          actorAdminId: "operator@example.com",
          changeSummary: "Partner Service Catalogue.draft Saved",
          createdAt: "2026-09-10T06:01:12.000Z",
        },
      ],
      [
        {
          id: "version-12",
          version: 12,
          status: "draft",
          createdByAdminId: "operator@example.com",
          createdAt: "2026-09-10T06:01:12.000Z",
        },
        {
          id: "version-13",
          version: 13,
          status: "published",
          createdByAdminId: "operator@example.com",
          createdAt: "2026-09-10T06:01:12.000Z",
        },
      ],
    ),
  );
  const versionRows = filterHistoryRows(rows, { search: "", source: "service_catalogue", eventType: "versions" });

  expect(versionRows.map((row) => row.id)).not.toContain("catalogue-audit:hotel-unpaired");
  expect(versionRows.find((row) => row.id === "catalogue-audit:hotel-linked")?.versionLabel).toBe("Version 12");
  expect(versionRows.find((row) => row.id === "catalogue-version:version-13")?.recordKind).toBe("saved_version");
});

test("central History presentation avoids raw dotted technical labels", () => {
  expect(presentationSource).toContain("historyActionLabel(row.action)");
  expect(presentationSource).toContain("cleanHistorySummary(row.changeSummary)");
  expect(centralSource).not.toContain("Website Experience.draft");
  expect(centralSource).not.toContain("Website Experience.submitted");
  expect(centralSource).not.toContain("Partner Service Catalogue.published");
  expect(centralSource).not.toContain("`${record.source}.${record");
});

test("central History identifies exact item, content type, actor, version and state", () => {
  expect(presentationSource).toContain("itemTitle: target.title");
  expect(presentationSource).toContain('contentType: "Agreement Template"');
  expect(presentationSource).toContain('contentType: "Service Catalogue"');
  expect(presentationSource).toContain("actor: historyActor(row.actorAdminId)");
  expect(presentationSource).toContain("versionLabel: relatedVersion ? `Version ${relatedVersion.version}` : undefined");
  expect(presentationSource).toContain("previousState");
  expect(presentationSource).toContain("resultingState");
  expect(centralSource).toContain("formatHistoryDateTime(selectedRecord.createdAt)");
});

test("central History keeps Agreement Template events identifiable", () => {
  expect(presentationSource).toContain("agreementTemplateTitleFromHistory(entityId, summary)");
  expect(presentationSource).toContain('area: "agreement_template"');
  expect(presentationSource).toContain('title: agreementTemplateTitle');
  expect(presentationSource).toContain('href: templateId ? `/admin/website-experience/pages/partner/application/step-7-partner-agreement/agreement-templates/${encodeURIComponent(templateId)}`');
  expect(centralSource).toContain('<option value="agreement_template">Agreement Templates</option>');
});

test("central History relates audit and version records without timestamp-only collapsing", () => {
  expect(presentationSource).toContain("catalogueVersionByRelation.set(version.id, version)");
  expect(presentationSource).toContain("catalogueVersionByRelation.set(String(version.version), version)");
  expect(presentationSource).toContain("const relatedVersion = row.entityId ? catalogueVersionByRelation.get(row.entityId) : undefined");
  expect(presentationSource).toContain("pairedVersionIds.add(relatedVersion.id)");
  expect(presentationSource).toContain('.filter((row) => !pairedVersionIds.has(row.id))');
  expect(presentationSource).not.toContain("Math.abs(Date.parse");
});

test("central History filters search, content area and activity type together", () => {
  expect(centralSource).toContain('data-history-filters="compact"');
  expect(centralSource).toContain("setSearch(params.get(\"search\") ?? \"\")");
  expect(presentationSource).toContain("record.actionLabel");
  expect(presentationSource).toContain("record.itemTitle");
  expect(presentationSource).toContain("matchesSearch && matchesSource && matchesType");
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
  expect(presentationSource).toContain('label: "Open item"');
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
