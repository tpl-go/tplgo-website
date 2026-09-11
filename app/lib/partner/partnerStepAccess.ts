import type { PartnerApplicationReadiness } from "./partnerApiClient";
import type { PartnerApplicationStepId } from "./partnerApplicationCenter";
import { isSubmittedPartnerApplicationState, partnerStep8StepIsReadOnly } from "./partnerStep8Review";

export const applicationStepOrder: PartnerApplicationStepId[] = [
  "account_contact", "business_identity", "business_location", "services",
  "documents_compliance", "payout_tax", "partner_agreement", "review_submit",
];

export function partnerStepAccess(readiness: PartnerApplicationReadiness | null) {
  let prerequisitesComplete = true;
  const reviewing = Boolean(readiness && (isSubmittedPartnerApplicationState(readiness.applicationStatus) || readiness.applicationStatus === "CHANGES_REQUESTED"));
  const steps = applicationStepOrder.map((id) => {
    const key = id === "documents_compliance" ? "verification_compliance" : id;
    const authority = readiness?.steps.find((step) => step.step === key);
    const complete = Boolean(authority && (authority.status === "COMPLETE" || authority.status === "UNDER_REVIEW") && authority.blockerCodes.length === 0);
    const accessible = reviewing || (id === "account_contact" || Boolean(readiness && prerequisitesComplete));
    const editable = accessible && Boolean(readiness) && id !== "review_submit" && !partnerStep8StepIsReadOnly(readiness, id);
    const reason = !accessible ? "Complete the earlier steps before opening this step." : !readiness ? "Application permissions are loading." : !editable && id !== "review_submit" ? "Editing is locked for this application section." : "";
    prerequisitesComplete = prerequisitesComplete && complete;
    return { id, accessible, editable, complete, reason };
  });
  const latestAccessible = reviewing ? "review_submit" : steps.filter((step) => step.accessible).at(-1)!.id;
  return { steps, latestAccessible };
}

export function resolvePartnerStep(requested: unknown, readiness: PartnerApplicationReadiness | null): PartnerApplicationStepId {
  const policy = partnerStepAccess(readiness);
  return policy.steps.find((step) => step.id === requested && step.accessible)?.id ?? policy.latestAccessible;
}

export function canEditPartnerStep(readiness: PartnerApplicationReadiness | null, step: PartnerApplicationStepId): boolean {
  return partnerStepAccess(readiness).steps.some((item) => item.id === step && item.editable);
}
