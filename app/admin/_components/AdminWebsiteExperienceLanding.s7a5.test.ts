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
].map((path) => ({ path, source: readFileSync(join(process.cwd(), path), "utf8") }));

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
  for (const routeFile of websiteExperienceRouteFiles) {
    const expectedTitle = routeFile.path.endsWith("/versions-audit/page.tsx") ? '<AdminShell title="History">' : '<AdminShell title="Website Experience">';
    expect(routeFile.source).toContain(expectedTitle);
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

test("S7A5.4 removes local workflow, audit, security and unrelated intake clutter", () => {
  const forbidden = [
    "Publication schedules",
    "Item workflow",
    "More Actions",
    "Recent Others Service Suggestions",
    "Security Boundary",
    "Recent Audit",
    "recorded in central History",
    "presentation-only media",
    "safe Partner Application presentation fields",
    "Step 4 preview source",
    "authenticationRoutes",
    "otpProvider",
    "msg91Configuration",
    "googleClientSecret",
    "emailProviderCredentials",
    "privateR2Credentials",
    "9 editable fields",
  ];
  for (const text of forbidden) {
    expect(managerSource).not.toContain(text);
  }
  expect(managerSource).toContain("Preview, then save as Draft.");
  expect(managerSource).toContain("Saved image");
  expect(managerSource).not.toContain("<PartnerRegistrationIntakes");
  expect(managerSource).not.toContain("<LockedSecurity");
  expect(managerSource).not.toContain("<AuditList");
});

test("S7A5.4 Partner Application editors render selected-section fields without duplicate technical panels", () => {
  const editorSlice = managerSource.slice(managerSource.indexOf("function PartnerApplicationTreeEditor"), managerSource.indexOf("function isAgreementTemplateEditor"));
  expect(editorSlice).toContain("partnerApplicationDisplayLabel(selectedNode.id, selectedNode.label)");
  expect(editorSlice).toContain("LocalStepEditorActions");
  expect(editorSlice).not.toContain("lockedFields");
  expect(editorSlice).not.toContain("editableFields.length");
  expect(editorSlice).not.toContain("Step 4 preview source");
  expect(editorSlice).not.toContain("Website Experience &gt; Pages &gt; Partner &gt; Partner Application");
  expect(managerSource).toContain("Application Overview");
  expect(managerSource).not.toContain("Application Shell");
});

test("S7A5.5 Partner Application inner editors use compact operator metadata", () => {
  const statusStripSlice = managerSource.slice(managerSource.indexOf("function ItemStatusStrip"), managerSource.indexOf("function WorkflowQueueView"));
  expect(statusStripSlice).toContain("Draft v${activeRow.draftVersion}");
  expect(statusStripSlice).toContain("publishedVersionLabel(activeRow.publishedVersion)");
  expect(statusStripSlice).toContain("Last modified");
  expect(statusStripSlice).not.toContain("workflowLabel(activeRow.workflowState");
  expect(statusStripSlice).not.toContain("Published v${activeRow.publishedVersion}");
  expect(managerSource).toContain('return version && version > 0 ? `Published v${version}` : "Not published";');
});

test("S7A5.5 Partner Application editors keep one concise preview/save instruction", () => {
  const localActionSlice = managerSource.slice(managerSource.indexOf("function LocalStepEditorActions"), managerSource.indexOf("const stepSevenUnits"));
  const previewPanelSlice = managerSource.slice(managerSource.indexOf("function PreviewPanel"), managerSource.indexOf("function PromoPreview"));
  expect((localActionSlice.match(/Preview, then save as Draft\./g) ?? []).length).toBe(1);
  expect(localActionSlice).toContain("Preview");
  expect(localActionSlice).toContain("Save as Draft");
  expect(managerSource).not.toContain("Preview your changes, then save a draft.");
  expect(previewPanelSlice).not.toContain("Preview Changes shows the current editor draft and never publishes content.");
});

test("S7A5.5 Step 4 CTA editor labels are human-readable while preserving content keys", () => {
  const editorSlice = managerSource.slice(managerSource.indexOf("function PartnerApplicationTreeEditor"), managerSource.indexOf("function isAgreementTemplateEditor"));
  expect(editorSlice).toContain("stepFourCtaLabel(key)");
  expect(managerSource).toContain('if (normalized === "continue") return "Continue button";');
  expect(managerSource).toContain('if (normalized === "savedraft") return "Save Draft button";');
  expect(managerSource).toContain('if (normalized === "requestanotherservice") return "Request another service button";');
  expect(editorSlice).toContain("[key]: value");
  expect(managerSource).not.toContain("CTA:");
  expect(managerSource).not.toContain("CTA: CONTINUE");
  expect(managerSource).not.toContain("CTA: SAVEDRAFT");
  expect(managerSource).not.toContain("CTA: REQUESTANOTHERSERVICE");
});

test("S7A5.5 Step 7 landing and content editor remove redundant helper copy", () => {
  const stepSevenSlice = managerSource.slice(managerSource.indexOf("function StepSevenContentUnits"), managerSource.indexOf("type AgreementTemplateDraftState"));
  expect(stepSevenSlice).toContain("Choose an area to edit.");
  expect(stepSevenSlice).not.toContain("Choose one area to edit. Each item opens on its own page.");
  expect(stepSevenSlice).not.toContain("Edit this content area.");
  expect(stepSevenSlice).toContain('<h3 className="text-lg font-semibold text-slate-950">{stepSevenUnitTitles[activeUnit]}</h3>');
  expect(stepSevenSlice).toContain('data-step7-content-unit-row={id}');
  expect(stepSevenSlice).toContain('data-step7-content-unit-editor={activeUnit}');
});

test("S7A5.4 Partner Application preview follows the selected section", () => {
  const previewSlice = managerSource.slice(managerSource.indexOf("function PromoPreview"), managerSource.indexOf("function StatusChip"));
  expect(previewSlice).toContain("selectedNodeId");
  expect(previewSlice).toContain('content.applicationTree.children.find((node) => node.id === selectedNodeId)');
  expect(previewSlice).toContain('content.applicationTree.children.find((node) => node.id === "application-shell")');
  expect(previewSlice).not.toContain('node.id === "step-4-services"');
  expect(previewSlice).not.toContain("stepFour");
});

test("S7A5.4 Agreement Template editor is not composed with generic Step 7 editor content", () => {
  const templatePanel = managerSource.slice(managerSource.indexOf("function AgreementTemplateDraftPanel"), managerSource.indexOf("const defaultAgreementPlaceholders"));
  expect(templatePanel).toContain("Upload template document");
  expect(templatePanel).toContain("Replace file");
  expect(templatePanel).toContain("Remove file");
  expect(templatePanel).toContain("Open saved Draft");
  expect(templatePanel).toContain("Company details added automatically");
  expect(templatePanel).not.toContain("Step 7 Partner Agreement</h4>");
  expect(templatePanel).not.toContain("Page Content");
  expect(templatePanel).not.toContain("Recent Audit");
  expect(templatePanel).not.toContain("Version History");
  const stepSevenSlice = managerSource.slice(managerSource.indexOf("function StepSevenContentUnits"), managerSource.indexOf("type AgreementTemplateDraftState"));
  expect(stepSevenSlice).toContain('activeUnit === "agreement-templates" && templateId ? null');
});

test("S7A5.4.1 Awaiting Approval Review stays on the central dashboard item", () => {
  const queueItemSlice = landingSource.slice(landingSource.indexOf("function CentralWorkflowQueueItem"), landingSource.indexOf("function buildCentralWorkflowItems"));
  expect(queueItemSlice).toContain('const hasCentralReview = item.stage === "in_review" && item.workflowContext && item.contentType === "website_experience";');
  expect(queueItemSlice).toContain("data-central-review-inline-action={item.workflowContext}");
  expect(queueItemSlice).toContain("data-central-review-surface={item.workflowContext}");
  expect(queueItemSlice).toContain("Review");
  expect(queueItemSlice).not.toContain('href="/admin/website-experience/login-signup"');
});

test("S7A5.4.1 central review exposes authorized Approve and Request Changes only from the central surface", () => {
  const centralReviewSlice = landingSource.slice(landingSource.indexOf('data-central-review-surface={item.workflowContext}'), landingSource.indexOf("function buildCentralWorkflowItems"));
  expect(centralReviewSlice).toContain("Approve");
  expect(centralReviewSlice).toContain("Request Changes");
  expect(centralReviewSlice).toContain("data-central-review-note=\"true\"");
  expect(centralReviewSlice).toContain("Review note");
  expect(centralReviewSlice).toContain("disabled={!item.canApprove");
  expect(centralReviewSlice).toContain("Your role can view this review but cannot approve or request changes.");
  const localActionSlice = managerSource.slice(managerSource.indexOf("function LocalStepEditorActions"), managerSource.indexOf("const stepSevenUnits"));
  expect(localActionSlice).not.toContain("Approve");
  expect(localActionSlice).not.toContain("Request Changes");
  expect(localActionSlice).not.toContain("Review note");
});

test("S7A5.4.1 central review reuses existing Website Experience approval contracts and identity", () => {
  expect(landingSource).toContain("approveAdminWebsiteExperienceDraft");
  expect(landingSource).toContain("requestAdminWebsiteExperienceChanges");
  expect(landingSource).toContain('approveAdminWebsiteExperienceDraft(item.workflowContext, note)');
  expect(landingSource).toContain('requestAdminWebsiteExperienceChanges(item.workflowContext, note)');
  expect(landingSource).toContain("workflowContext: row.context");
  expect(landingSource).toContain("data-central-review-version={item.draftVersion}");
  expect(landingSource).toContain("Submitted draft version: {item.draftVersion}");
});

test("S7A5.4.1 central review validates notes, surfaces safe errors and refreshes workflow counts", () => {
  expect(landingSource).toContain('action === "request-changes" && !note');
  expect(landingSource).toContain("Add a review note before requesting changes.");
  expect(landingSource).toContain("setTransitionMessage({ itemId: item.id, tone: \"error\", text: result.error.message })");
  expect(landingSource).toContain("refreshDashboard();");
  expect(landingSource).toContain("loadWebsiteExperience(active);");
  expect(landingSource).toContain("loadCatalogueSummary(active);");
  expect(landingSource).toContain("loadPolicyWorkflowSummary(active);");
});

test("S7A5.4.1 central stages retain reachable next actions", () => {
  expect(managerSource).toContain("WorkflowDraftDetailView");
  expect(managerSource).toContain("Send for Approval");
  expect(landingSource).toContain("Open Draft");
  expect(landingSource).toContain("Preview");
  expect(landingSource).toContain("Publish or Schedule");
  expect(landingSource).toContain("Manage Schedule");
  expect(landingSource).toContain("Reschedule or cancel from Scheduled");
  expect(landingSource).toContain("View Published");
  expect(landingSource).toContain("History");
});

test("S7A5.4.1 Agreement Template saved-state action group is deduplicated", () => {
  const templatePanel = managerSource.slice(managerSource.indexOf("function AgreementTemplateDraftPanel"), managerSource.indexOf("const defaultAgreementPlaceholders"));
  const handoffSlice = templatePanel.slice(templatePanel.indexOf('data-agreement-template-central-draft-handoff="ready"'), templatePanel.indexOf('<div className="flex flex-wrap gap-3">'));
  expect(handoffSlice).toContain("Draft saved");
  expect((handoffSlice.match(/Open saved Draft/g) ?? []).length).toBe(1);
  expect(handoffSlice).not.toContain(">Open Draft<");
  expect(handoffSlice).not.toContain("Open saved draft");
  expect(handoffSlice).not.toContain("Continue Editing");
  expect(handoffSlice).not.toContain("This saved Draft is missing its direct agreement-template link.");
  expect(templatePanel).toContain("href={savedDraftRoute}");
});

test("S7A5.4.1 Agreement Template breadcrumb resolves the existing template name dynamically", () => {
  const breadcrumbSlice = managerSource.slice(managerSource.indexOf("function Breadcrumbs"), managerSource.indexOf("function HierarchyBreadcrumb"));
  const routeTitleSlice = managerSource.slice(managerSource.indexOf("function partnerApplicationRouteTitle"), managerSource.length);
  const templatePanelStart = managerSource.indexOf("function AgreementTemplateDraftPanel");
  const templateLoadSlice = managerSource.slice(templatePanelStart, managerSource.indexOf("const updateDraft", templatePanelStart));
  expect(managerSource).toContain("resolvedAgreementTemplateTitle");
  expect(managerSource).toContain("onAgreementTemplateTitleResolved={setResolvedAgreementTemplateTitle}");
  expect(templateLoadSlice).toContain("onTitleResolved?.(selected.title)");
  expect(managerSource).toContain("onTitleResolved?.(result.data.template.title)");
  expect(routeTitleSlice).toContain('resolvedTemplateTitle || content.agreementTemplateDraft?.title || "Agreement Template"');
  expect(breadcrumbSlice).toContain('activeBlock || "Agreement Template"');
  expect(breadcrumbSlice).toContain('partnerAgreementTemplateId === "new" ? "Add Agreement Template" : activeBlock || "Agreement Template"');
  expect(managerSource).not.toContain('templateId === "new" ? "Add Agreement Template" : "Edit Agreement Template"');
});

test("S7A5.4.2 Agreement Template breadcrumb keeps direct URL and central Draft Edit routes equivalent", () => {
  const routeFileSource = readFileSync(
    join(process.cwd(), "app/admin/website-experience/pages/partner/application/[node]/[unit]/[templateId]/page.tsx"),
    "utf8",
  );
  const draftDetailSlice = managerSource.slice(managerSource.indexOf("function WorkflowDraftDetailView"), managerSource.indexOf("function DraftDetailLine"));
  expect(routeFileSource).toContain("const { node, unit, templateId } = await params;");
  expect(routeFileSource).toContain("partnerAgreementTemplateId={templateId}");
  expect(routeFileSource).toContain('mode="partner-application"');
  expect(draftDetailSlice).toContain('`${stepSevenUnitHref("agreement-templates")}/${encodeURIComponent(marker.templateId)}`');
  expect(draftDetailSlice).toContain("marker?.templateId");
  expect(managerSource).toContain("onAgreementTemplateTitleResolved={setResolvedAgreementTemplateTitle}");
});

test("S7A5.4.2 Agreement Template breadcrumb supports new-template mode without stale edit wording", () => {
  const breadcrumbSlice = managerSource.slice(managerSource.indexOf("function Breadcrumbs"), managerSource.indexOf("function HierarchyBreadcrumb"));
  const templatePanelStart = managerSource.indexOf("function AgreementTemplateDraftPanel");
  const templateLoadSlice = managerSource.slice(templatePanelStart, managerSource.indexOf("const updateDraft", templatePanelStart));
  expect(breadcrumbSlice).toContain('partnerAgreementTemplateId === "new" ? "Add Agreement Template"');
  expect(templateLoadSlice).toContain('onTitleResolved?.("Add Agreement Template")');
  expect(breadcrumbSlice).not.toContain("Edit Agreement Template");
});

test("S7A5.4.2 breadcrumb title updates do not remount or reset Agreement Template editing state", () => {
  const breadcrumbRenderSlice = managerSource.slice(managerSource.indexOf("<Breadcrumbs"), managerSource.indexOf("<BlockEditor"));
  const editorRenderSlice = managerSource.slice(managerSource.indexOf("<BlockEditor"), managerSource.indexOf("</main>"));
  const templatePanelStart = managerSource.indexOf("function AgreementTemplateDraftPanel");
  const templatePanelSlice = managerSource.slice(templatePanelStart, managerSource.indexOf("const updateDraft", templatePanelStart));
  expect(breadcrumbRenderSlice).toContain("activeBlock={mode === \"partner-application\" ? partnerApplicationRouteTitle");
  expect(editorRenderSlice).toContain("onAgreementTemplateTitleResolved={setResolvedAgreementTemplateTitle}");
  expect(editorRenderSlice).not.toContain("key={resolvedAgreementTemplateTitle}");
  expect(templatePanelSlice).toContain("const [draft, setDraft]");
  expect(templatePanelSlice).toContain("const [uploadState, setUploadState]");
  expect(templatePanelSlice).not.toContain("resolvedAgreementTemplateTitle");
});

test("S7A5.4.1 Agreement Template preserves central Draft URL and uploaded PDF metadata", () => {
  expect(managerSource).toContain("centralDraftRouteFromTemplate");
  expect(managerSource).toContain("route.startsWith(\"/admin/\") ? route : agreementTemplateCentralDraftRoute(template.id)");
  expect(managerSource).toContain("agreement_template:${templateId}");
  expect(managerSource).toContain("sourceDocument: draft.sourceDocument ?? null");
  expect(managerSource).toContain("storageReference: result.data.storageReference");
  expect(managerSource).toContain("filename: result.data.filename");
  expect(managerSource).toContain("verified: result.data.verified");
  expect(managerSource).toContain("Replace file");
  expect(managerSource).toContain("Remove file");
});
