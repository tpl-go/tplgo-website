import { expect, test } from "vitest";
import { parsePartnerAccess, partnerAccessDestination } from "./partnerAccess";

test("validates every server outcome without accepting arbitrary destinations", () => {
  for (const outcome of ["APPLICATION_STATUS", "CORRECTIONS", "SETUP_PENDING", "ACTIVE", "RESTRICTED", "SELECTION_REQUIRED", "NO_LINKED_PROFILE"] as const) {
    const value = parsePartnerAccess({ outcome, organizationId: "test-org", step: "review_submit", url: "https://untrusted.example.test" });
    expect(value).not.toHaveProperty("url");
    expect(partnerAccessDestination(value)).toBe(["APPLICATION_STATUS", "CORRECTIONS"].includes(outcome) ? "/partner-preview?step=review_submit" : null);
  }
  expect(partnerAccessDestination(parsePartnerAccess({ outcome: "APPLICATION", organizationId: "test-org", step: "verification_compliance" }))).toBe("/partner-preview?step=documents_compliance");
});
test("unknown or malformed authority fails closed", () => {
  for (const value of [null, {}, { outcome: "APPROVED" }, { outcome: "APPLICATION", organizationId: "test", step: "//external" }, { outcome: "APPLICATION", organizationId: null, step: "services" }, { outcome: "APPLICATION", organizationId: "test", step: null }]) expect(() => parsePartnerAccess(value)).toThrow();
});
