import { expect, test } from "vitest";
import { partnerApplicationPreviewHref, partnerSubmittedDestination } from "./partnerSubmittedDestination";
import { partnerAccessDestination } from "./partnerAccess";

test.each(["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "NOT_APPROVED"])("%s opens existing status instead of Step 8", status => {
  expect(partnerSubmittedDestination(status, null, true)).toBe("/partner-access");
  expect(partnerSubmittedDestination(status, "application", true)).toBeNull();
  expect(partnerSubmittedDestination(status, null, false)).toBeNull();
});
test.each([undefined, "DRAFT_INCOMPLETE", "READY_TO_SUBMIT", "CHANGES_REQUESTED", "APPROVED", "ACTIVE"])("%s keeps its existing lifecycle flow", status => {
  expect(partnerSubmittedDestination(status, null, true)).toBeNull();
});
test("preview targets only the selected organization; fresh login stays on the status authority", () => {
  expect(partnerApplicationPreviewHref("synthetic-org")).toBe("/partner-preview?step=review_submit&organizationId=synthetic-org&view=application");
  expect(partnerAccessDestination({ outcome: "APPLICATION_STATUS", organizationId: "synthetic-org", step: "review_submit" })).toBeNull();
});
