import { renderToStaticMarkup } from "react-dom/server";
import { expect, test, vi } from "vitest";
import { ReadOnlyStepNotice, ReadOnlyStepFooter } from "./PartnerApplicationWorkspaceClient";
import { SPECIALIST_REVIEW_LOCK_MESSAGE } from "../lib/partner/partnerReviewLock";
import { buildPartnerQaPreviewBundle, buildPartnerQaPreviewReadiness } from "../lib/partner/partnerQaPreviewFixtures";
import { canEditPartnerStep, partnerStepAccess } from "../lib/partner/partnerStepAccess";
vi.mock("../hooks/useAuth", () => ({ useAuth: () => ({ user: null }) }));

test("actual notice/footer show specialist reason, keep navigation, and have no save action", () => {
  const html = renderToStaticMarkup(<><ReadOnlyStepNotice reason={SPECIALIST_REVIEW_LOCK_MESSAGE} /><ReadOnlyStepFooter reason={SPECIALIST_REVIEW_LOCK_MESSAGE} previousStep="business_identity" onPrevious={() => {}} /></>);
  expect(html).toContain("verification is under review");
  expect(html).toContain("Previous");
  expect(html).not.toContain("Save as Draft");
  expect(html).not.toContain("status is ready to submit");
});

test("workspace access keeps saved steps viewable while denying edits from matching review bundle", () => {
  const readiness = buildPartnerQaPreviewReadiness("new");
  const bundle = buildPartnerQaPreviewBundle("ready")!;
  readiness.organizationId = bundle.organization.id;
  readiness.applicationStatus = "READY_TO_SUBMIT";
  readiness.latestSubmission = null;
  readiness.steps = readiness.steps.map(step => ({ ...step, status: "COMPLETE", blockerCodes: [] }));
  bundle.review = { id: "synthetic-review", status: "SUBMITTED" };
  expect(partnerStepAccess(readiness, bundle).steps.every(step => step.accessible)).toBe(true);
  expect(canEditPartnerStep(readiness, "business_identity", bundle)).toBe(false);
  expect(canEditPartnerStep(readiness, "payout_tax", bundle)).toBe(true);
  expect(canEditPartnerStep(readiness, "business_identity", null)).toBe(false);
});
