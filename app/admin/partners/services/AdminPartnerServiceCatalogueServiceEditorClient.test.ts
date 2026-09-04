import { readFileSync } from "node:fs";
import { join } from "node:path";
import { expect, test } from "vitest";

const editorSource = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueServiceEditorClient.tsx"), "utf8");
const catalogueSource = readFileSync(join(process.cwd(), "app/admin/partners/services/AdminPartnerServiceCatalogueClient.tsx"), "utf8");
const addRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/service-catalogue/domains/[domainId]/services/new/page.tsx"), "utf8");
const editRouteSource = readFileSync(join(process.cwd(), "app/admin/website-experience/pages/partner/service-catalogue/services/[serviceId]/edit/page.tsx"), "utf8");
const queueSource = readFileSync(join(process.cwd(), "app/admin/_components/WebsiteExperienceManager.tsx"), "utf8");

test("Add and Edit Service use dedicated protected pages", () => {
  expect(addRouteSource).toContain('requiredPermissions={["partner_service_catalogue.manage"]}');
  expect(addRouteSource).toContain('<AdminPartnerServiceCatalogueServiceEditorClient mode="new"');
  expect(addRouteSource).toContain("decodeURIComponent(domainId)");
  expect(editRouteSource).toContain('requiredPermissions={["partner_service_catalogue.manage"]}');
  expect(editRouteSource).toContain('<AdminPartnerServiceCatalogueServiceEditorClient mode="edit"');
  expect(editRouteSource).toContain("decodeURIComponent(serviceId)");
});

test("Domain and Service detail entry points open the dedicated service workflow", () => {
  expect(catalogueSource).toContain("addServiceHref={`/admin/website-experience/pages/partner/service-catalogue/domains/${encodeURIComponent(activeDomain.id)}/services/new`}");
  expect(catalogueSource).toContain("editServiceHref={`/admin/website-experience/pages/partner/service-catalogue/services/${encodeURIComponent(selectedItem.stableCode)}/edit`}");
  expect(catalogueSource).toContain("addSubServiceHref={`/admin/website-experience/pages/partner/service-catalogue/domains/${encodeURIComponent(activeDomain.id)}/services/new?parent=${encodeURIComponent(selectedItem.stableCode)}`}");
  expect(catalogueSource).toContain("<Link href={props.addServiceHref}");
  expect(catalogueSource).toContain("<Link href={props.editServiceHref}");
});

test("Service editor has explicit Back and complete human breadcrumbs", () => {
  expect(editorSource).toContain('label={backLabel}');
  expect(editorSource).toContain('href: "/admin/website-experience"');
  expect(editorSource).toContain('href: "/admin/website-experience/pages"');
  expect(editorSource).toContain('href: "/admin/website-experience/pages/partner"');
  expect(editorSource).toContain('label: "Service Catalogue"');
  expect(editorSource).toContain('label: mode === "new" ? "Add Service" : "Edit"');
  expect(editorSource).not.toContain("router.back");
});

test("Service editor supports unsaved preview and preserves editing values", () => {
  expect(editorSource).toContain("Preview Changes");
  expect(editorSource).toContain("Partner Step 4 service card");
  expect(editorSource).toContain("Not Live");
  expect(editorSource).toContain("Back to Editing");
  expect(editorSource).toContain("setPreview(false)");
  expect(editorSource).toContain("onSave={saveDraft}");
});

test("Service editor verifies draft persistence before showing next action", () => {
  expect(editorSource).toContain("saveAdminPartnerServiceCatalogueDraft");
  expect(editorSource).toContain("getAdminPartnerServiceCatalogue()");
  expect(editorSource).toContain("We couldn't confirm this draft in the catalogue");
  expect(editorSource).toContain("Service draft saved.");
  expect(editorSource).toContain("Next action: Send for Approval.");
  expect(editorSource).toContain("submitAdminPartnerServiceCatalogueApproval");
});

test("Service editor uses item-scoped workflow actions and common queue deep links", () => {
  expect(editorSource).toContain("data.review?.itemCode === form.stableCode");
  expect(editorSource).toContain("Waiting for Review");
  expect(editorSource).toContain("Request Changes");
  expect(editorSource).toContain("Publish Now");
  expect(editorSource).toContain("Publishing uses the approved Service Catalogue snapshot");
  expect(queueSource).toContain('catalogue.review?.scopeType === "item"');
  expect(queueSource).toContain("/admin/website-experience/pages/partner/service-catalogue/services/");
  expect(queueSource).toContain("Service changes");
});

test("Service editor hides normal-user-facing internal identifiers from visible labels", () => {
  for (const term of ["Stable code", "Parent code", "applicationSelectable", "verificationProfileKey", "API", "schema", "backend", "frontend"]) {
    expect(editorSource).not.toContain(`>${term}<`);
  }
  expect(editorSource).toContain("Review profile");
  expect(editorSource).toContain("Enabled capabilities");
  expect(editorSource).toContain("Application availability");
});
