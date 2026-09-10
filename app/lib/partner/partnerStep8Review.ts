import type {
  PartnerApplicationDeclarationDefinition,
  PartnerApplicationReadiness,
  PartnerApplicationStatus,
  PartnerApplicationStepKey,
  PartnerApplicationStepReadiness,
  PartnerApplicationSubmissionSummary,
  PartnerApplicationSubmitInput,
} from "./partnerApiClient";
import type { PartnerApplicationStepId, PartnerApplicationStepStatus } from "./partnerApplicationCenter";

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
  if (status === "SUBMITTED") return "Submitted";
  if (status === "UNDER_REVIEW" || status === "RESUBMITTED") return "Under review";
  if (status === "CHANGES_REQUESTED") return "Changes requested";
  if (status === "NOT_APPROVED") return "Not approved";
  if (status === "APPROVED") return "Approved";
  if (status === "READY_TO_SUBMIT" || submissionReady) return "Ready to submit";
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

export function partnerStep8NavigationStatusOverrides(readiness: PartnerApplicationReadiness | null): Partial<Record<PartnerApplicationStepId, PartnerApplicationStepStatus>> {
  if (!readiness) return {};
  const overrides: Partial<Record<PartnerApplicationStepId, PartnerApplicationStepStatus>> = {};
  for (const step of readiness.steps) {
    overrides[workspaceStepIdForStep8Key(step.step)] = workspaceStatusForStep8Status(step.status);
  }
  overrides.review_submit = reviewSubmitWorkspaceStatus(readiness);
  return overrides;
}

export function partnerStep8ReadOnlyStepOverrides(readiness: PartnerApplicationReadiness | null): Partial<Record<PartnerApplicationStepId, boolean>> {
  if (!readiness) return {};
  const readOnly: Partial<Record<PartnerApplicationStepId, boolean>> = {};
  for (const step of readiness.steps) {
    const stepId = workspaceStepIdForStep8Key(step.step);
    readOnly[stepId] = partnerStep8StepIsReadOnly(readiness, stepId);
  }
  return readOnly;
}

export function partnerStep8StepIsReadOnly(readiness: PartnerApplicationReadiness | null, stepId: PartnerApplicationStepId): boolean {
  if (!readiness || stepId === "review_submit") return false;
  if (readiness.applicationStatus === "CHANGES_REQUESTED") {
    return !readiness.steps.some((step) => workspaceStepIdForStep8Key(step.step) === stepId && step.status === "NEEDS_ATTENTION");
  }
  return isSubmittedPartnerApplicationState(readiness.applicationStatus);
}

export function partnerStep8HeaderMetadata(
  readiness: PartnerApplicationReadiness | null,
  latestSubmission: PartnerApplicationSubmissionSummary | null,
  draftText: string,
): string {
  if (!readiness) return draftText;
  const reference = visibleSubmissionReference(latestSubmission);
  const submittedAt = latestSubmission?.submittedAt ? formatStep8MetadataDate(latestSubmission.submittedAt) : null;
  const suffix = [reference, submittedAt].filter(Boolean).join(" · ");
  if (readiness.applicationStatus === "SUBMITTED" || readiness.applicationStatus === "UNDER_REVIEW" || readiness.applicationStatus === "RESUBMITTED") {
    return suffix ? `Submitted · ${suffix}` : "Submitted";
  }
  if (readiness.applicationStatus === "CHANGES_REQUESTED") return suffix ? `Changes requested · ${suffix}` : "Changes requested";
  if (readiness.applicationStatus === "NOT_APPROVED") return suffix ? `Not approved · ${suffix}` : "Not approved";
  if (readiness.applicationStatus === "APPROVED") return suffix ? `Approved · ${suffix}` : "Approved";
  if (readiness.applicationStatus === "READY_TO_SUBMIT" || readiness.submissionReady) return `Ready to submit · Revision ${readiness.applicationRevision}`;
  return draftText;
}

export function partnerStep8NavigationLabel(
  readiness: PartnerApplicationReadiness | null,
  stepId: PartnerApplicationStepId,
  status: PartnerApplicationStepStatus,
): string {
  if (readiness && stepId === "review_submit") {
    if (readiness.applicationStatus === "APPROVED") return "Approved";
    if (readiness.applicationStatus === "NOT_APPROVED") return "Not Approved";
    if (readiness.applicationStatus === "CHANGES_REQUESTED") return "Changes Required";
    if (readiness.applicationStatus === "SUBMITTED" || readiness.applicationStatus === "UNDER_REVIEW" || readiness.applicationStatus === "RESUBMITTED") return "Under Review";
    if (readiness.applicationStatus === "READY_TO_SUBMIT" || readiness.submissionReady) return "In Progress";
  }
  const label = workspaceNavigationStatusLabel(status);
  if (!readiness) return label;
  const canEditCompletedStep = stepId !== "review_submit" && status === "completed" && !partnerStep8StepIsReadOnly(readiness, stepId);
  return canEditCompletedStep ? `${label} · Edit` : label;
}

export function partnerStep8ShowsPreSubmissionIssues(readiness: PartnerApplicationReadiness): boolean {
  return readiness.applicationStatus === "DRAFT_INCOMPLETE" || readiness.applicationStatus === "READY_TO_SUBMIT" || readiness.applicationStatus === "CHANGES_REQUESTED";
}

export function partnerStep8IssuesTitle(readiness: PartnerApplicationReadiness): string {
  return readiness.applicationStatus === "CHANGES_REQUESTED" ? "Must fix before resubmission" : "Must fix before submission";
}

export function isSubmittedPartnerApplicationState(status: PartnerApplicationStatus): boolean {
  return status === "SUBMITTED" || status === "UNDER_REVIEW" || status === "RESUBMITTED" || status === "NOT_APPROVED" || status === "APPROVED";
}

function workspaceStepIdForStep8Key(step: PartnerApplicationStepKey): PartnerApplicationStepId {
  return step === "verification_compliance" ? "documents_compliance" : step;
}

function workspaceStatusForStep8Status(status: PartnerApplicationStepReadiness["status"]): PartnerApplicationStepStatus {
  if (status === "COMPLETE") return "completed";
  if (status === "UNDER_REVIEW") return "under-review";
  if (status === "UNAVAILABLE") return "locked";
  return "needs-attention";
}

function reviewSubmitWorkspaceStatus(readiness: PartnerApplicationReadiness): PartnerApplicationStepStatus {
  if (readiness.applicationStatus === "APPROVED") return "completed";
  if (readiness.applicationStatus === "SUBMITTED" || readiness.applicationStatus === "UNDER_REVIEW" || readiness.applicationStatus === "RESUBMITTED") return "under-review";
  if (readiness.applicationStatus === "CHANGES_REQUESTED" || readiness.applicationStatus === "NOT_APPROVED") return "needs-attention";
  return readiness.submissionReady ? "in-progress" : "needs-attention";
}

function workspaceNavigationStatusLabel(status: PartnerApplicationStepStatus): string {
  if (status === "completed") return "Complete";
  if (status === "needs-attention") return "Needs Attention";
  if (status === "under-review") return "Under Review";
  if (status === "locked") return "Locked";
  if (status === "in-progress") return "In Progress";
  return "Not Started";
}

function formatStep8MetadataDate(value: string): string | null {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
