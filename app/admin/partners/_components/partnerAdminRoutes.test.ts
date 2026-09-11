import { expect, test } from "vitest";
import { partnerAdminNavigation, partnerAdminRoute, partnerQueueReturn, visiblePartnerAdminNavigation } from "./partnerAdminRoutes";

test.each(partnerAdminNavigation)("$label is active for its canonical and query route", (item: typeof partnerAdminNavigation[number]) => {
  expect(partnerAdminRoute(item.href)).toEqual(item);
  expect(partnerAdminRoute(`${item.href}?status=SUBMITTED`)).toEqual(item);
  if (item.label !== "Overview") expect(partnerAdminRoute(`${item.href}/record`)).toEqual(item);
});
test("Verification Rules remains inside Verification", () => {
  expect(partnerAdminRoute("/admin/partner-verification/rules")?.label).toBe("Verification");
  expect(partnerAdminRoute("/admin/partners-other")).toBeUndefined();
});
test("Service Catalogue keeps Website Experience ownership", () => {
  expect(partnerAdminNavigation.find((item) => item.label === "Service Catalogue")?.href).toBe("/admin/website-experience/pages/partner/service-catalogue");
});
test("both navigation surfaces can fail closed on missing permissions", () => {
  expect(visiblePartnerAdminNavigation([])).toEqual([]);
  expect(visiblePartnerAdminNavigation(["partner_application.read"]).map((item) => item.label)).toEqual(["Applications"]);
  expect(visiblePartnerAdminNavigation(partnerAdminNavigation.map((item) => item.permission))).toHaveLength(8);
});
test("queue return preserves filters without record selectors or external destinations", () => {
  expect(partnerQueueReturn("/admin/partners/applications/record", "status=SUBMITTED&search=demo&submission=record&returnTo=https://example.test&token=discard")).toBe("/admin/partners/applications?status=SUBMITTED&search=demo");
  expect(partnerQueueReturn("/admin/partner-verification/rules", "tab=all&organizationId=record")).toBe("/admin/partner-verification?tab=all");
  expect(partnerQueueReturn("/admin/partner-verification", "from=organizations&search=demo&organizationId=record")).toBe("/admin/partners/organizations?search=demo");
  expect(partnerQueueReturn("/admin/partner-verification", "from=documents-compliance&status=SUBMITTED&organizationId=record")).toBe("/admin/partners/documents-compliance?status=SUBMITTED");
});
