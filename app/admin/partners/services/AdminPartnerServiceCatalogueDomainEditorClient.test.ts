import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const editorSource = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueDomainEditorClient.tsx"), "utf8");
const addRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/service-catalogue/domains/new/page.tsx"), "utf8");
const editRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/service-catalogue/domains/[domainId]/edit/page.tsx"), "utf8");
const queueSource = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");

test("Add and Edit Domain use dedicated protected pages", () => {
  expect(addRouteSource).toContain('requiredPermissions={["partner_service_catalogue.manage"]}');
  expect(addRouteSource).toContain('<AdminPartnerServiceCatalogueDomainEditorClient mode="new" />');
  expect(editRouteSource).toContain('requiredPermissions={["partner_service_catalogue.manage"]}');
  expect(editRouteSource).toContain('mode="edit"');
  expect(editRouteSource).toContain("decodeURIComponent(domainId)");
});

test("Domain editor has explicit Back and full human breadcrumbs", () => {
  expect(editorSource).toContain('label={mode === "edit" ? `Back to ${domainName}` : "Back to Service Catalogue"}');
  expect(editorSource).toContain('href: "/admin/website-experience"');
  expect(editorSource).toContain('href: "/admin/website-experience/pages"');
  expect(editorSource).toContain('href: "/admin/website-experience/pages/partner"');
  expect(editorSource).toContain('label: "Service Catalogue"');
  expect(editorSource).toContain('label: mode === "new" ? "Add Domain" : "Edit"');
  expect(editorSource).not.toContain("router.back");
});

test("Domain editor supports preview before saving and preserves values on return", () => {
  expect(editorSource).toContain("Preview Changes");
  expect(editorSource).toContain("Not Live");
  expect(editorSource).toContain("Back to Editing");
  expect(editorSource).toContain("setPreview(false)");
  expect(editorSource).toContain("onSave={saveDraft}");
});

test("Domain editor verifies Save as Draft and keeps next action visible", () => {
  expect(editorSource).toContain("saveAdminPartnerServiceCatalogueDraft");
  expect(editorSource).toContain("getAdminPartnerServiceCatalogue()");
  expect(editorSource).toContain("We couldn't confirm this draft in the catalogue");
  expect(editorSource).toContain("Domain draft saved.");
  expect(editorSource).toContain("Next action: Send for Approval.");
  expect(editorSource).toContain("submitAdminPartnerServiceCatalogueApproval");
});

test("Domain editor uses state-driven workflow actions without exposing developer fields", () => {
  expect(editorSource).toContain("Waiting for Review");
  expect(editorSource).toContain("Approve");
  expect(editorSource).toContain("Request Changes");
  expect(editorSource).toContain("Publish Now");
  expect(editorSource).toContain("Delete Draft");
  expect(editorSource).toContain("Publishing uses the approved Service Catalogue snapshot");
  for (const term of ["stableCode", "applicationSelectable", "verificationProfileKey", "API", "schema", "backend"]) {
    const visibleTextSource = editorSource.replace(/function buildDomainRootItem[\\s\\S]*?function validateForm/, "");
    expect(visibleTextSource).not.toContain(`>${term}<`);
  }
});

test("Common workflow queues can deep-link Service Catalogue domain drafts", () => {
  expect(queueSource).toContain("getAdminPartnerServiceCatalogue");
  expect(queueSource).toContain("catalogueWorkflowRow");
  expect(queueSource).toContain("/admin/website-experience/pages/partner/service-catalogue/domains/");
  expect(queueSource).toContain("Domain changes");
  expect(queueSource).toContain("Open/Edit");
});
