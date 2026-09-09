import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const landingSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");
const managerSource = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");
const adminShellSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminShell.tsx"), "utf8");
const websiteExperienceRouteFiles = [
  "app/admin/website-experience/page.tsx",
  "app/admin/website-experience/global/page.tsx",
  "app/admin/website-experience/pages/page.tsx",
  "app/admin/website-experience/login-signup/page.tsx",
  "app/admin/website-experience/pages/partner/page.tsx",
  "app/admin/website-experience/pages/partner/application/page.tsx",
  "app/admin/website-experience/pages/partner/application/[node]/page.tsx",
  "app/admin/website-experience/pages/partner/application/[node]/[unit]/page.tsx",
  "app/admin/website-experience/pages/partner/application/[node]/[unit]/[templateId]/page.tsx",
  "app/admin/website-experience/versions-audit/page.tsx",
].map((path) => readFileSync(join(process.cwd(), path), "utf8"));

test("S7A5 central dashboard uses authoritative Website Experience data sources", () => {
  expect(landingSource).toContain("getAdminWebsiteExperienceLoginSignup");
  expect(landingSource).toContain("getAdminPartnerServiceCatalogue");
  expect(landingSource).toContain("getAdminVerificationPolicyWorkflow");
  expect(landingSource).toContain('data-central-workflow-dashboard="real-data"');
  expect(landingSource).toContain("buildCentralWorkflowItems");
  expect(landingSource).not.toContain("staticWorkflowRecords");
});

test("S7A5 dashboard renders real summary counts and stage filters", () => {
  expect(landingSource).toContain("DashboardCountCard");
  expect(landingSource).toContain("countCentralWorkflowStages");
  expect(landingSource).toContain('data-authoritative-workflow-overview="true"');
  for (const label of ["Published", "Drafts", "Awaiting Approval", "Changes Requested", "Approved", "Scheduled", "Archived", "History"]) {
    expect(landingSource).toContain(label);
  }
  expect(landingSource).toContain("publishedContent");
  expect(landingSource).not.toContain('label="Published" value={`${counts.published}`}');
  expect(landingSource).not.toContain("3/4");
  expect(landingSource).not.toContain("3/3");
  expect(landingSource).toContain('data-central-workflow-filters="true"');
  expect(landingSource).toContain("Clear Filters");
  expect(landingSource).toContain("Search by content, page, template or editor");
});

test("S7A5.1 consolidates old duplicate workflow navigation into one dashboard", () => {
  expect((landingSource.match(/data-central-workflow-dashboard="real-data"/g) ?? []).length).toBe(1);
  expect(landingSource).toContain('data-compact-website-experience-navigation="true"');
  expect(landingSource).not.toContain("<StatusSummary");
  expect(landingSource).not.toContain('title="Work Queue"');
  expect(landingSource).not.toContain('title="Records"');
  expect(landingSource).not.toContain('title="Drafts" detail="Continue editing saved changes."');
  expect(landingSource).not.toContain('title="Published Content" detail="View content currently published."');
});

test("S7A5 dashboard queue shows human-readable target details and actions", () => {
  expect(landingSource).toContain('data-central-workflow-queue="authoritative"');
  expect(landingSource).toContain("CentralWorkflowQueueItem");
  expect(landingSource).toContain("contentTypeLabel");
  expect(landingSource).toContain("readinessForStage");
  expect(landingSource).toContain("History");
  expect(landingSource).toContain("Open Draft");
  expect(landingSource).toContain("Publish or Schedule");
  expect(landingSource).toContain("Reschedule or cancel from Scheduled");
  expect(landingSource).toContain('selectedStage === "published"');
  expect(landingSource).toContain("Published {item.publishedVersion}");
  expect(landingSource).not.toContain("Ready to preview and prepare for approval");
});

test("S7A5.1 fixes wording, count semantics and raw actor display", () => {
  expect(landingSource).toContain("CentralWorkflowCounts");
  expect(landingSource).toContain("displayActor");
  expect(landingSource).toContain("System administrator");
  expect(landingSource).not.toContain("Recorded in audit");
  expect(landingSource).toContain("publishedInventory");
  expect(landingSource).toContain('items.filter((item) => item.publishedInventory).length');
  expect(landingSource).not.toContain("Readys");
  expect(landingSource).not.toContain("Scheduleds");
  expect(landingSource).not.toContain("changedBy: catalogue.review?.changedByAdminId");
});

test("S7A5.2 root dashboard defaults to Published inventory through URL state", () => {
  expect(landingSource).toContain('centralWorkflowStageFromValue(searchParams.get("view")) ?? "published"');
  expect(landingSource).toContain('params.set("view", centralWorkflowStageToUrlValue(nextStage))');
  expect(landingSource).not.toContain('setDashboardStage("published")');
  expect(landingSource).toContain('selected={stage === "published"}');
  expect(landingSource).not.toContain('useState<CentralWorkflowStage>("all")');
  expect(landingSource).not.toContain('<option value="all">All statuses</option>');
});

test("S7A5.2 Published inventory is independent from active workflow stage", () => {
  expect(landingSource).toContain('dashboardStage === "published" ? item.publishedInventory : item.stage === dashboardStage');
  expect(landingSource).toContain("publishedInventory: row.publishedVersion > 0");
  expect(landingSource).toContain("publishedInventory: catalogue.publishedVersion > 0");
  expect(landingSource).toContain("publishedInventory: Boolean(policy.published.version)");
  expect(landingSource).toContain('selectedStage === "published" && item.stage !== "published" ? `New version: ${item.status} ${item.draftVersion}` : ""');
});

test("S7A5.2 Published route shows published inventory even with newer workflow versions", () => {
  expect(managerSource).toContain('if (view === "published") return context.publishedVersion > 0;');
  expect(managerSource).toContain('view === "published" ? catalogue.publishedVersion > 0');
  expect(managerSource).not.toContain('if (view === "published") return context.publishedVersion > 0 && state === "published";');
});

test("S7A5.2 removes unnecessary Home dashboard copy", () => {
  expect(landingSource).not.toContain("Central workflow dashboard");
  expect(landingSource).not.toContain("Draft, approval and publishing operations");
  expect(landingSource).not.toContain("One operational view for saved Drafts, review, approval, scheduled publication, published content and activity.");
  expect(landingSource).not.toContain("Manage content from Draft to approval, publication, scheduling and central history.");
  expect(landingSource).not.toContain("Open History");
  expect(landingSource).not.toContain("Compact access to editing areas, publication schedule and central history.");
});

test("S7A5.3 canonical workflow tabs replace duplicate status controls", () => {
  expect(landingSource).toContain('centralWorkflowStageToUrlValue(nextStage)');
  expect(landingSource).toContain('if (value === "in_review") return "awaiting-approval";');
  expect(landingSource).toContain('if (value === "changes_requested") return "changes-requested";');
  expect(landingSource).not.toContain("Filter by status");
  expect(landingSource).not.toContain("Draft: {item.draftVersion}");
  expect(landingSource).not.toContain('href="/admin/website-experience/versions-audit" className="inline-flex min-h-9');
  expect(landingSource).toContain('search.trim() || contentType !== "all"');
  expect(landingSource).not.toContain('disabled={!search.trim() && contentType === "all"}');
});

test("S7A5.3 legacy workflow lists redirect to the canonical root dashboard", () => {
  expect(managerSource).toContain("shouldRedirectCanonicalWorkflow");
  expect(managerSource).toContain('`/admin/website-experience?view=${canonicalWorkflowViewMap[routeWorkflowView]}`');
  expect(managerSource).toContain('backHref="/admin/website-experience?view=drafts"');
  expect(managerSource).toContain('workflowView === "drafts" && routeWorkflowDraftId');
  expect(managerSource).not.toContain('backHref="/admin/website-experience/login-signup?workflow=drafts"');
});

test("S7A5.3 Draft detail removes developer-facing labels", () => {
  const draftDetailSlice = managerSource.slice(managerSource.indexOf("function WorkflowDraftDetailView"), managerSource.indexOf("function DraftDetailLine"));
  expect(draftDetailSlice).toContain("const draftTitle = marker?.title?.trim() || row.label;");
  expect(draftDetailSlice).toContain('breadcrumb={<WorkflowBreadcrumb current={draftTitle} />}');
  expect(draftDetailSlice).toContain("title={draftTitle}");
  expect(draftDetailSlice).toContain("Partner Application > Step 7 Partner Agreement > Agreement Templates");
  expect(draftDetailSlice).toContain('label="Draft version"');
  expect(draftDetailSlice).toContain('label="Saved"');
  expect(draftDetailSlice).toContain('label="Readiness"');
  expect(draftDetailSlice).toContain("displaySafeActor");
  expect(draftDetailSlice).not.toContain("title={targetLabel}");
  expect(draftDetailSlice).not.toContain("Human-readable target");
  expect(draftDetailSlice).not.toContain("Last editor recorded in audit");
  expect(draftDetailSlice).not.toContain("Recorded in audit");
});

test("S7A5.3.1 Draft detail breadcrumb uses Website Experience > Drafts > item name", () => {
  const breadcrumbSlice = managerSource.slice(managerSource.indexOf("function WorkflowBreadcrumb"), managerSource.indexOf("function BlockEditor"));
  expect(breadcrumbSlice).toContain("Website Experience");
  expect(breadcrumbSlice).toContain('href="/admin/website-experience?view=drafts"');
  expect(breadcrumbSlice).toContain("Drafts");
  expect(managerSource).toContain('backHref="/admin/website-experience?view=drafts"');
  expect(managerSource).toContain("workflowDraftIdForContext(item) === draftId");
  expect(managerSource).toContain("agreement_template:${templateId}");
});

test("S7A5.3.1 Partner Application overview removes duplicate headings and technical row copy", () => {
  const overviewSlice = managerSource.slice(
    managerSource.indexOf('mode === "partner-application" && !partnerApplicationNodeId'),
    managerSource.indexOf("return (", managerSource.indexOf("function PartnerApplicationTreeEditor")),
  );
  expect(overviewSlice).toContain('title="Partner Application"');
  expect(overviewSlice).toContain('detail=""');
  expect(overviewSlice).toContain("PartnerApplicationSectionList");
  const sectionListSlice = managerSource.slice(managerSource.indexOf("function PartnerApplicationSectionList"), managerSource.indexOf("function PartnerApplicationTreeEditor"));
  expect(sectionListSlice).toContain('data-partner-application-section-list="operator"');
  expect(sectionListSlice).toContain("partnerApplicationDisplayLabel");
  expect(sectionListSlice).not.toContain("editable presentation fields");
  expect(sectionListSlice).not.toContain("Open one Partner Application section");
  expect(sectionListSlice).not.toContain("Open one application section at a time");
  expect(managerSource).toContain("Application Overview");
  expect(managerSource).not.toContain("Application shell, progress and shared guidance.");
  expect(managerSource).not.toContain("9 editable presentation fields");
});

test("S7A5.3.1 Website Experience routes use module shell title and hide duplicate staging subtitle", () => {
  for (const routeSource of websiteExperienceRouteFiles) {
    expect(routeSource).toContain('<AdminShell title="Website Experience">');
  }
  expect(adminShellSource).toContain('pathname.startsWith("/admin/website-experience")');
  expect(adminShellSource).toContain("!isWebsiteExperienceRoute");
  expect(adminShellSource).toContain("Staging console");
  expect(adminShellSource).toContain("Staging workspace");
});

test("S7A5.3.1 Clear Filters is visible only for active filters and preserves selected workflow tab", () => {
  const dashboardSlice = landingSource.slice(landingSource.indexOf("function CentralWorkflowDashboard"), landingSource.indexOf("function DashboardCountCard"));
  expect(dashboardSlice).toContain('search.trim() || contentType !== "all"');
  expect(dashboardSlice).toContain("Clear Filters");
  expect(dashboardSlice).not.toContain('disabled={!search.trim() && contentType === "all"}');
  const onClearSlice = landingSource.slice(landingSource.indexOf("onClear={() =>"), landingSource.indexOf("}}", landingSource.indexOf("onClear={() =>")) + 2);
  expect(onClearSlice).toContain('setDashboardSearch("")');
  expect(onClearSlice).toContain('setDashboardType("all")');
  expect(onClearSlice).not.toContain("setDashboardStage");
});

test("S7A5 preserves exact Agreement Template draft routing and reactive navigation", () => {
  expect(landingSource).toContain("agreement_template:${marker.templateId}");
  expect(landingSource).toContain("marker?.centralDraftRoute?.startsWith(\"/admin/\")");
  expect(managerSource).toContain("routeWorkflowDraftId");
  expect(managerSource).toContain("workflowView === \"drafts\" && routeWorkflowDraftId");
  expect(managerSource).toContain("centralDraftHrefForRow");
  expect(managerSource).toContain("data-central-draft-open-edit={workflowDraftIdForContext(row)}");
});

test("S7A5 keeps local editors limited to Preview and Save as Draft", () => {
  const localActionSlice = managerSource.slice(managerSource.indexOf("function LocalStepEditorActions"), managerSource.indexOf("const stepSevenUnits"));
  expect(localActionSlice).toContain("Preview");
  expect(localActionSlice).toContain("Save as Draft");
  expect(localActionSlice).not.toContain("Publish");
  expect(localActionSlice).not.toContain("Schedule");
  expect(localActionSlice).not.toContain("History");
});
