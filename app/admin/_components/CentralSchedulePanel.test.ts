import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const panel = readFileSync(join(process.cwd(), "app/admin/_components/CentralSchedulePanel.tsx"), "utf8");
const client = readFileSync(join(process.cwd(), "app/lib/admin/centralSchedules.ts"), "utf8");
const home = readFileSync(join(process.cwd(), "app/admin/_components/AdminWebsiteExperienceLanding.tsx"), "utf8");
const websiteEditor = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");
const rulesEditor = readFileSync(join(process.cwd(), "app/admin/partner-verification/rules/page.tsx"), "utf8");
const catalogueDomainEditor = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueDomainEditorClient.tsx"), "utf8");
const catalogueServiceEditor = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueServiceEditorClient.tsx"), "utf8");

test("central queue client uses one generic API contract for all registered targets", () => {
  expect(client).toContain('ScheduleTarget = "website_experience" | "verification_policy" | "service_catalogue"');
  expect(client).toContain('const base = "/api/v1/admin/central-workflow/schedules"');
  expect(client).toContain("readCentralScheduleHistory");
  expect(client).toContain("changeCentralSchedule");
  expect(client).toContain("revision: row.revision");
});

test("Website Experience Home shows the central scheduled and failed queues", () => {
  expect(home).toContain("<CentralSchedulePanel />");
  expect(panel).toContain("Scheduled");
  expect(panel).toContain("Failed / Needs Attention");
  expect(panel).toContain("Website Experience");
  expect(panel).toContain("Service Catalogue");
  expect(panel).toContain("Verification Rules");
});

test("central panel presents only backend-valid actions with human labels and confirmations", () => {
  expect(panel).toContain("row.actions.map");
  expect(panel).toContain("Open");
  expect(panel).toContain("Cancel publication");
  expect(panel).toContain("Reschedule");
  expect(panel).toContain("Retry publication");
  expect(panel).toContain("View History");
  expect(panel).toContain("Cancel this scheduled publication?");
  expect(panel).toContain("Confirm retry");
  expect(panel).toContain("Save schedule");
  expect(panel).toContain("This schedule changed after you opened it. Refresh and review the latest version.");
  expect(panel).not.toContain("CENTRAL_");
  expect(panel).not.toContain("target_type");
});

test("contextual editors use the same central schedule state", () => {
  expect(websiteEditor).toContain('targetType="website_experience"');
  expect(rulesEditor).toContain('targetType="verification_policy"');
  expect(catalogueDomainEditor).toContain('targetType="service_catalogue"');
  expect(catalogueServiceEditor).toContain('targetType="service_catalogue"');
  expect(rulesEditor).not.toContain("policies/schedule/cancel");
  expect(rulesEditor).not.toContain("policies/schedule/retry");
});

test("central panel uses semantic action colors and backend-confirmed success states", () => {
  expect(panel).toContain("border-sky-300/25");
  expect(panel).toContain("border-amber-300/30");
  expect(panel).toContain("border-red-300/30");
  expect(panel).toContain("text-green-200");
  expect(panel).toContain("text-slate-400");
  expect(panel).toContain("result.ok");
  expect(panel).toContain("result.data.message");
  expect(panel).toContain("Saving...");
  expect(panel).toContain("Retrying...");
  expect(panel).toContain("Action failed");
});
