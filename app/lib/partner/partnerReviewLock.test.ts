import { expect, test } from "vitest";
import { partnerReviewLockReason as reason, partnerMutationLockMessage, SPECIALIST_REVIEW_LOCK_MESSAGE } from "./partnerReviewLock";

const ready = { organizationId: "synthetic-org", applicationStatus: "READY_TO_SUBMIT", latestSubmission: null };
const bundle = { organization: { id: "synthetic-org" }, review: null as { status: string } | null };
const steps = ["account_contact", "business_identity", "business_location", "services", "verification_compliance", "payout_tax", "partner_agreement", "review_submit"];
test("new application retains Step 1 without granting later-step access", () => {
  const fresh = { ...ready, organizationId: null, applicationStatus: "DRAFT_INCOMPLETE" };
  expect(reason(fresh, null, "account_contact")).toBe("");
  expect(reason(fresh, null, "business_identity")).not.toBe("");
});

  test("draft remains editable and warnings are not lock authority", () => {
    for (const step of steps) expect(reason(ready, bundle, step)).toBe("");
  });
  test.each(["SUBMITTED", "UNDER_REVIEW", "VERIFIED"])("%s specialist review locks exactly Steps 1–5, not final submission", (status: string) => {
    const review = { ...bundle, review: { status } };
    expect(steps.map(step => Boolean(reason(ready, review, step)))).toEqual([true,true,true,true,true,false,false,false]);
    expect(reason(ready, review, "documents_compliance")).toBe(SPECIALIST_REVIEW_LOCK_MESSAGE);
  });
  test.each(["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "APPROVED", "NOT_APPROVED"])("%s final workflow locks every mutation", (applicationStatus: string) => {
    expect(steps.every(step => Boolean(reason({ ...ready, applicationStatus }, bundle, step)))).toBe(true);
  });
  test("explicit final correction reopens only the requested section over specialist lock", () => {
    const correction = { ...ready, applicationStatus: "CHANGES_REQUESTED", latestSubmission: { correctionSections: ["business_identity"] } };
    const reviewed = { ...bundle, review: { status: "SUBMITTED" } };
    expect(steps.filter(step => !reason(correction, reviewed, step))).toEqual(["business_identity"]);
    expect(reason(correction, { ...reviewed, review: { status: "REJECTED" } }, "business_identity")).not.toBe("");
    expect(reason({ ...correction, latestSubmission: null }, reviewed, "business_identity")).not.toBe("");
  });
  test("missing, foreign and unknown authority fails closed", () => {
    for(const value of [null, { organization: bundle.organization }, { ...bundle, organization: { id: "foreign-org" } }, { ...bundle, review: { status: "UNKNOWN" } }]) expect(reason(ready, value, "business_identity")).not.toBe("");
    expect(reason(null, bundle, "business_identity")).not.toBe("");
  });
  test.each(["CHANGES_REQUIRED", "EXPIRED", "EXPIRING_SOON", "NOT_SUBMITTED"])("%s follows the existing server guard without adding a new lock", (status: string) => {
    expect(reason(ready, { ...bundle, review: { status } }, "business_identity")).toBe("");
  });
  test("maps known mutation locks to bounded customer copy only", () => {
    expect(partnerMutationLockMessage("PARTNER_APPLICATION_LOCKED")).toBe(SPECIALIST_REVIEW_LOCK_MESSAGE);
    expect(partnerMutationLockMessage("PARTNER_APPLICATION_CORRECTION_SECTION_LOCKED")).toContain("requested for correction");
    expect(partnerMutationLockMessage("unknown private server text")).toBeNull();
  });
