// Presentation of the existing PartnerService.requireOwnedOrganization policy.
// This does not grant write authority; the server still checks every mutation.
type ReviewAuthority = {
  organization: { id: string };
  review?: { status: string } | null;
};
type ApplicationAuthority = {
  organizationId: string | null;
  applicationStatus: string;
  latestSubmission?: { correctionSections?: string[] | null } | null;
};

export const SPECIALIST_REVIEW_LOCK_MESSAGE = "These details are locked while verification is under review. You can still view your saved details and continue with the remaining steps.";

export function partnerReviewLockReason(readiness: ApplicationAuthority | null, bundle: ReviewAuthority | null, step: string): string {
  // A genuinely new application may create Step 1 through the existing flow.
  if (readiness?.applicationStatus === "DRAFT_INCOMPLETE" && readiness.organizationId === null && bundle === null && step === "account_contact") return "";
  if (!readiness || !bundle || readiness.organizationId !== bundle.organization.id || !Object.hasOwn(bundle, "review")) return "Application permissions are unavailable. Refresh before making changes.";
  const review = bundle.review?.status;
  if (review === "REJECTED") return "This application cannot be edited. Contact Partner support for help.";
  if (["SUBMITTED", "UNDER_REVIEW", "RESUBMITTED", "APPROVED", "NOT_APPROVED"].includes(readiness.applicationStatus)) return "This application is read-only. Any requested corrections will appear here.";
  const key = step === "documents_compliance" ? "verification_compliance" : step;
  if (readiness.applicationStatus === "CHANGES_REQUESTED") return readiness.latestSubmission?.correctionSections?.includes(key) ? "" : "Only the sections requested for correction can be edited.";
  if (review && !["NOT_SUBMITTED", "SUBMITTED", "UNDER_REVIEW", "VERIFIED", "CHANGES_REQUIRED", "EXPIRING_SOON", "EXPIRED"].includes(review)) return "Application permissions are unavailable. Refresh before making changes.";
  return ["SUBMITTED", "UNDER_REVIEW", "VERIFIED"].includes(review ?? "") && ["account_contact", "business_identity", "business_location", "services", "verification_compliance"].includes(key) ? SPECIALIST_REVIEW_LOCK_MESSAGE : "";
}

export function partnerMutationLockMessage(code?: string): string | null {
  if (code === "PARTNER_APPLICATION_LOCKED") return SPECIALIST_REVIEW_LOCK_MESSAGE;
  if (code === "PARTNER_APPLICATION_UNDER_REVIEW_LOCKED") return "This application is read-only while it is under final review.";
  if (code === "PARTNER_APPLICATION_CORRECTION_SECTION_LOCKED") return "Only the sections requested for correction can be edited.";
  if (code === "PARTNER_APPLICATION_REJECTED_LOCKED") return "This application cannot be edited. Contact Partner support for help.";
  return null;
}
