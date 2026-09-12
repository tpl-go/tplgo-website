import { expect, test } from "vitest";
import { parsePartnerAccess, partnerAccessDestination } from "./partnerAccess";

test("validates every server outcome without accepting arbitrary destinations", () => {
  for (const outcome of ["APPLICATION_STATUS", "CORRECTIONS", "SETUP_PENDING", "ACTIVE", "RESTRICTED", "SELECTION_REQUIRED", "NO_LINKED_PROFILE"] as const) {
    const value = parsePartnerAccess({ outcome, organizationId: "test-org", step: "review_submit", url: "https://untrusted.example.test" });
    expect(value).not.toHaveProperty("url");
    expect(partnerAccessDestination(value)).toBe(["APPLICATION_STATUS", "CORRECTIONS"].includes(outcome) ? "/partner-preview?step=review_submit&organizationId=test-org" : null);
  }
  expect(partnerAccessDestination(parsePartnerAccess({ outcome: "APPLICATION", organizationId: "test-org", step: "verification_compliance" }))).toBe("/partner-preview?step=documents_compliance&organizationId=test-org");
});
test("unknown or malformed authority fails closed", () => {
  for (const value of [null, {}, { outcome: "APPROVED" }, { outcome: "APPLICATION", organizationId: "test", step: "//external" }, { outcome: "APPLICATION", organizationId: null, step: "services" }, { outcome: "APPLICATION", organizationId: "test", step: null }]) expect(() => parsePartnerAccess(value)).toThrow();
});

test("selection summaries accept only the public profile contract", () => {
  const organizationId = "11111111-1111-4111-8111-111111111111";
  const access = parsePartnerAccess({ outcome: "SELECTION_REQUIRED", organizationId: null, step: null, profiles: [{ organizationId, displayName: "Test Partner", reference: "APP-1-12345678", status: "CHANGES_REQUESTED", destinationType: "CORRECTIONS", updatedAt: "2026-09-12T00:00:00.000Z", selectable: true, restrictedReason: null }] });
  expect(access.profiles).toHaveLength(1);
  expect(Object.keys(access.profiles![0]!).sort()).toEqual(["destinationType", "displayName", "organizationId", "reference", "restrictedReason", "selectable", "status", "updatedAt"].sort());
  expect(() => parsePartnerAccess({ outcome: "SELECTION_REQUIRED", organizationId: null, step: null, profiles: [{ organizationId, displayName: "Test", reference: null, status: "APPROVED", destinationType: "ACTIVE", updatedAt: "2026-09-12T00:00:00Z", selectable: true, restrictedReason: null, email: "hidden@example.test" }] })).toThrow();
  expect(() => parsePartnerAccess({ outcome: "SELECTION_REQUIRED", organizationId: null, step: null, profiles: [{ organizationId, displayName: "Test", reference: null, status: "APPROVED", destinationType: "ACTIVE", updatedAt: "invalid", selectable: true, restrictedReason: null }] })).toThrow();
});
