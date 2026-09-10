import type {
  PartnerApplicationDeclarationDefinition,
  PartnerApplicationReadiness,
  PartnerApplicationStatus,
  PartnerApplicationStepKey,
  PartnerApplicationStepReadiness,
  PartnerApplicationSubmissionSummary,
  PartnerApplicationSubmitInput,
} from "./partnerApiClient";

export const step8StepRoutes: Record<PartnerApplicationStepKey, string> = {
  account_contact: "/partner-preview?step=account_contact",
  business_identity: "/partner-preview?step=business_identity",
  business_location: "/partner-preview?step=business_location",
  services: "/partner-preview?step=services",
  verification_compliance: "/partner-preview?step=documents_compliance",
  payout_tax: "/partner-preview?step=payout_tax",
  partner_agreement: "/partner-preview?step=partner_agreement",
};

export type PartnerStep8StateLabel =
  | "Needs attention"
  | "Ready to submit"
  | "Submitted"
  | "Under review"
  | "Changes requested"
  | "Not approved"
  | "Approved";

export type PartnerStep8StepLabel = "Complete" | "Needs attention" | "Under review" | "Unavailable";

export type PartnerStep8ErrorCode =
  | "FINAL_DECLARATIONS_NOT_CONFIGURED"
  | "STALE_APPLICATION_REVISION"
  | "IDEMPOTENCY_CONFLICT"
  | "APPLICATION_NOT_READY"
  | "MISSING_DECLARATION"
  | "INACTIVE_DECLARATION"
  | "WRONG_DECLARATION_VERSION"
  | "ALREADY_SUBMITTED"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NETWORK"
  | "UNKNOWN";

export function partnerStep8StateLabel(status: PartnerApplicationStatus, submissionReady: boolean): PartnerStep8StateLabel {
  if (status === "READY_TO_SUBMIT" || submissionReady) return "Ready to submit";
  if (status === "SUBMITTED") return "Submitted";
  if (status === "UNDER_REVIEW" || status === "RESUBMITTED") return "Under review";
  if (status === "CHANGES_REQUESTED") return "Changes requested";
  if (status === "NOT_APPROVED") return "Not approved";
  if (status === "APPROVED") return "Approved";
  return "Needs attention";
}

export function partnerStep8StepStatusLabel(status: PartnerApplicationStepReadiness["status"]): PartnerStep8StepLabel {
  if (status === "COMPLETE") return "Complete";
  if (status === "UNDER_REVIEW") return "Under review";
  if (status === "UNAVAILABLE") return "Unavailable";
  return "Needs attention";
}

export function partnerStep8ActionLabel(step: PartnerApplicationStepReadiness): "Review" | "Fix" {
  return step.status === "NEEDS_ATTENTION" ? "Fix" : "Review";
}

export function partnerStep8CorrectionRoute(step: PartnerApplicationStepReadiness): string {
  return step.correctionRoute || step8StepRoutes[step.step];
}

export function hasFinalDeclarationConfiguration(readiness: PartnerApplicationReadiness): boolean {
  return readiness.activeDeclarations.some((item) => item.active && item.required) && !readiness.submissionBlockers.includes("FINAL_DECLARATIONS_NOT_CONFIGURED");
}

export function requiredFinalDeclarations(readiness: PartnerApplicationReadiness): PartnerApplicationDeclarationDefinition[] {
  return readiness.activeDeclarations.filter((item) => item.active && item.required && item.appliesTo === "final_submission");
}

export function acceptedDeclarationPayload(
  declarations: PartnerApplicationDeclarationDefinition[],
  acceptedById: Record<string, boolean>,
): PartnerApplicationSubmitInput["declarationAcceptances"] {
  return declarations.map((item) => ({
    declarationId: item.id,
    version: item.version,
    accepted: acceptedById[declarationAcceptanceKey(item)] === true,
  }));
}

export function declarationAcceptanceKey(declaration: PartnerApplicationDeclarationDefinition): string {
  return `${declaration.id}:v${declaration.version}`;
}

export function canSubmitPartnerStep8(readiness: PartnerApplicationReadiness, acceptedById: Record<string, boolean>): boolean {
  const declarations = requiredFinalDeclarations(readiness);
  return readiness.submissionReady && declarations.length > 0 && declarations.every((item) => acceptedById[declarationAcceptanceKey(item)] === true);
}

export function step8BlockingReason(readiness: PartnerApplicationReadiness | null, acceptedById: Record<string, boolean>): string {
  if (!readiness) return "Application readiness is still loading.";
  if (!hasFinalDeclarationConfiguration(readiness)) return "The final application declaration is being prepared.";
  if (readiness.submissionBlockers.length > 0 || !readiness.submissionReady) return "Resolve the items marked Needs attention before submitting.";
  if (!canSubmitPartnerStep8(readiness, acceptedById)) return "Accept each required declaration before submitting.";
  return "";
}

export function buildPartnerStep8SubmitInput(
  readiness: PartnerApplicationReadiness,
  acceptedById: Record<string, boolean>,
  idempotencyKey: string,
): PartnerApplicationSubmitInput {
  return {
    expectedApplicationRevision: readiness.applicationRevision,
    declarationAcceptances: acceptedDeclarationPayload(requiredFinalDeclarations(readiness), acceptedById),
    idempotencyKey,
  };
}

export function normalizeStep8ErrorCode(status: number, code: string | undefined): PartnerStep8ErrorCode {
  if (code === "FINAL_DECLARATIONS_NOT_CONFIGURED") return "FINAL_DECLARATIONS_NOT_CONFIGURED";
  if (code === "STALE_APPLICATION_REVISION" || code === "APPLICATION_REVISION_STALE") return "STALE_APPLICATION_REVISION";
  if (code === "IDEMPOTENCY_CONFLICT") return "IDEMPOTENCY_CONFLICT";
  if (code === "APPLICATION_NOT_READY" || code === "READINESS_BLOCKER") return "APPLICATION_NOT_READY";
  if (code === "MISSING_DECLARATION") return "MISSING_DECLARATION";
  if (code === "INACTIVE_DECLARATION") return "INACTIVE_DECLARATION";
  if (code === "WRONG_DECLARATION_VERSION") return "WRONG_DECLARATION_VERSION";
  if (code === "ALREADY_SUBMITTED") return "ALREADY_SUBMITTED";
  if (status === 401 || code === "UNAUTHENTICATED") return "UNAUTHORIZED";
  if (status === 403 || code === "FORBIDDEN") return "FORBIDDEN";
  if (status === 0 || code === "TPL_API_NETWORK_ERROR") return "NETWORK";
  return "UNKNOWN";
}

export function step8SafeErrorMessage(code: PartnerStep8ErrorCode): string {
  if (code === "FINAL_DECLARATIONS_NOT_CONFIGURED") return "The final application declaration is being prepared. You can review your application, but submission is not available yet.";
  if (code === "STALE_APPLICATION_REVISION") return "Application information changed before submission. Refresh the application and review it again.";
  if (code === "IDEMPOTENCY_CONFLICT") return "This submission attempt no longer matches the current application. Refresh before trying again.";
  if (code === "APPLICATION_NOT_READY") return "Some application items still need attention before submission.";
  if (code === "MISSING_DECLARATION") return "Accept each required declaration before submitting.";
  if (code === "INACTIVE_DECLARATION" || code === "WRONG_DECLARATION_VERSION") return "A declaration changed. Refresh the application before submitting.";
  if (code === "ALREADY_SUBMITTED") return "This application has already been submitted for review.";
  if (code === "UNAUTHORIZED") return "Sign in with an authorized Partner account to continue.";
  if (code === "FORBIDDEN") return "Your account is not authorized to submit this Partner application.";
  if (code === "NETWORK") return "TPL GO could not reach the submission service. Please retry.";
  return "Submission is not available right now. Please retry.";
}

export function visibleSubmissionReference(submission: PartnerApplicationSubmissionSummary | null): string | null {
  if (!submission) return null;
  return `Submission ${submission.submissionRevision}`;
}

