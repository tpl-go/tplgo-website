import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const landingSource = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");
const managerSource = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");

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
  for (const label of ["Drafts", "Awaiting Approval", "Changes Requested", "Approved", "Scheduled", "Published content"]) {
    expect(landingSource).toContain(label);
  }
  expect(landingSource).toContain("publishedContent");
  expect(landingSource).not.toContain('label="Published" value={`${counts.published}`}');
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
});

test("S7A5.1 fixes wording, count semantics and raw actor display", () => {
  expect(landingSource).toContain("CentralWorkflowCounts");
  expect(landingSource).toContain("displayActor");
  expect(landingSource).toContain("System administrator");
  expect(landingSource).toContain("Recorded in audit");
  expect(landingSource).toContain("publishedContexts");
  expect(landingSource).not.toContain("Readys");
  expect(landingSource).not.toContain("Scheduleds");
  expect(landingSource).not.toContain("changedBy: catalogue.review?.changedByAdminId");
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
