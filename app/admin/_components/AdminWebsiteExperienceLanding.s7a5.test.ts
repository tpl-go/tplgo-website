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
  for (const label of ["Drafts", "Awaiting Approval", "Changes Requested", "Approved", "Scheduled", "Published"]) {
    expect(landingSource).toContain(label);
  }
  expect(landingSource).toContain('data-central-workflow-filters="true"');
  expect(landingSource).toContain("Clear Filters");
  expect(landingSource).toContain("Search by content, page, template or editor");
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
