import type { PartnerOrganizationBundle, PartnerVerificationStatus } from "./partnerApiClient";
import type { PartnerOrganizationPreviewProfile } from "./partnerOrganizationPreviewProfile";
import { findPartnerCatalogueItem, partnerServiceEligibleForApplication, type PartnerServiceDefinition } from "./partnerServiceCatalog";

export type PartnerApplicationStepId =
  | "account_contact"
  | "business_identity"
  | "business_location"
  | "services"
  | "documents_compliance"
  | "payout_tax"
  | "partner_agreement"
  | "review_submit";
export type PartnerApplicationStepStatus = "completed" | "in-progress" | "not-started" | "needs-attention" | "under-review" | "locked";
export type PartnerApplicationOverallStatus =
  | "not-started"
  | "in-progress"
  | "under-review"
  | "changes-required"
  | "rejected"
  | "approved";

export type PartnerApplicationStep = {
  id: PartnerApplicationStepId;
  name: string;
  description: string;
  status: PartnerApplicationStepStatus;
  actionLabel: string;
  enabled: boolean;
};

export type PartnerApplicationCenterReadModel = {
  organizationName: string;
  overallStatus: PartnerApplicationOverallStatus;
  statusLabel: string;
  progressCompleted: number;
  progressTotal: number;
  progressPercent: number;
  nextAction: {
    title: string;
    description: string;
    stepId: PartnerApplicationStepId | "approved";
    actionLabel: string;
  };
  steps: PartnerApplicationStep[];
  reviewNote?: string | null;
  submittedAt?: string | null;
  approved: boolean;
};

const STEP_TOTAL = 8;

export function buildPartnerApplicationCenterReadModel(input: {
  bundle?: PartnerOrganizationBundle | null;
  profile: PartnerOrganizationPreviewProfile;
  selectedServices: PartnerServiceDefinition[];
}): PartnerApplicationCenterReadModel {
  const { bundle, profile, selectedServices } = input;
  const organizationName = getOrganizationName(bundle, profile);
  const reviewStatus = bundle?.review?.status ?? "NOT_SUBMITTED";
  const approved = Boolean(bundle && (bundle.organization.status === "active" || reviewStatus === "VERIFIED"));
  const metadataApplication = readApplicationMetadata(bundle);
  const contactDone = Boolean(metadataApplication.stepCompletion.account_contact) || (hasVerifiedContact(bundle, "mobile", profile) && hasVerifiedContact(bundle, "email", profile));
  const businessDone = Boolean(metadataApplication.stepCompletion.business_identity) || hasBusinessInformation(bundle, profile);
  const locationDone = Boolean(metadataApplication.stepCompletion.business_location);
  const servicesDone = hasEligibleApplicationService(bundle, selectedServices);
  const documentsDone = hasDocumentsReady(bundle);
  const payoutDone = Boolean(metadataApplication.stepCompletion.payout_tax);
  const agreementDone = Boolean(metadataApplication.stepCompletion.partner_agreement);
  const reviewDone = reviewStatus === "SUBMITTED" || reviewStatus === "UNDER_REVIEW" || reviewStatus === "VERIFIED";
  const reviewNeedsAttention = reviewStatus === "CHANGES_REQUIRED" || hasBlockingRequirement(bundle);
  const overallStatus = resolveOverallStatus(bundle, reviewStatus, approved, reviewNeedsAttention);

  const steps: PartnerApplicationStep[] = [
    {
      id: "account_contact",
      name: "Account & Contact",
      description: "Tell us who we should contact about your application.",
      status: contactDone ? "completed" : "in-progress",
      actionLabel: contactDone ? "View" : "Continue",
      enabled: true,
    },
    {
      id: "business_identity",
      name: "Business Identity",
      description: "Add legal business details in the next step.",
      status: businessDone ? "completed" : contactDone ? "in-progress" : "not-started",
      actionLabel: businessDone ? "Review" : contactDone ? "Continue" : "Start",
      enabled: contactDone,
    },
    {
      id: "business_location",
      name: "Business Location",
      description: "Add your registered or operating location.",
      status: locationDone ? "completed" : businessDone ? "in-progress" : "locked",
      actionLabel: locationDone ? "Review" : "Start",
      enabled: businessDone,
    },
    {
      id: "services",
      name: "Services",
      description: "Choose the services your business wants to offer.",
      status: servicesDone ? "completed" : locationDone ? "in-progress" : "locked",
      actionLabel: servicesDone ? "Review" : "Start",
      enabled: locationDone,
    },
    {
      id: "documents_compliance",
      name: "Verification & Compliance",
      description: "Upload the documents TPL GO needs for review.",
      status: documentsDone ? "completed" : reviewDone ? "under-review" : servicesDone ? "in-progress" : "not-started",
      actionLabel: documentsDone ? "Review" : "Continue",
      enabled: servicesDone || Boolean(bundle),
    },
    {
      id: "payout_tax",
      name: "Payout & Tax",
      description: "Add payout details after documents are ready.",
      status: payoutDone ? "completed" : documentsDone ? "in-progress" : "locked",
      actionLabel: payoutDone ? "Review" : "Start",
      enabled: documentsDone,
    },
    {
      id: "partner_agreement",
      name: "Partner Agreement",
      description: "Review agreement details after payout setup.",
      status: agreementDone ? "completed" : payoutDone ? "in-progress" : "locked",
      actionLabel: agreementDone ? "Review" : "Start",
      enabled: payoutDone,
    },
    {
      id: "review_submit",
      name: "Review & Submit",
      description: "Check your application before sending it to TPL GO.",
      status: reviewStatusToStepStatus(reviewStatus, contactDone && businessDone && locationDone && servicesDone && documentsDone && payoutDone && agreementDone),
      actionLabel: reviewDone ? "View Status" : "Review",
      enabled: contactDone && businessDone && locationDone && servicesDone && documentsDone && payoutDone && agreementDone,
    },
  ];

  const completedCount = steps.filter((step) => step.status === "completed" || step.status === "under-review").length;
  const nextAction = resolveNextAction(steps, overallStatus);

  return {
    organizationName,
    overallStatus,
    statusLabel: statusLabel(overallStatus),
    progressCompleted: completedCount,
    progressTotal: STEP_TOTAL,
    progressPercent: Math.round((completedCount / STEP_TOTAL) * 100),
    nextAction,
    steps,
    reviewNote: latestReviewNote(bundle),
    submittedAt: bundle?.review?.submittedAt ?? null,
    approved,
  };
}

function getOrganizationName(bundle: PartnerOrganizationBundle | null | undefined, profile: PartnerOrganizationPreviewProfile): string {
  return bundle?.organization.brandName || bundle?.organization.legalName || profile.businessName || profile.legalName || "Partner";
}

function hasVerifiedContact(
  bundle: PartnerOrganizationBundle | null | undefined,
  channel: "mobile" | "email",
  profile: PartnerOrganizationPreviewProfile
): boolean {
  if (bundle?.contacts.some((contact) => contact.channel === channel && contact.verificationStatus === "verified")) return true;
  return channel === "mobile"
    ? profile.businessMobileVerificationStatus === "verified"
    : profile.businessEmailVerificationStatus === "verified";
}

function hasBusinessInformation(bundle: PartnerOrganizationBundle | null | undefined, profile: PartnerOrganizationPreviewProfile): boolean {
  const organization = bundle?.organization;
  const values = organization
    ? [organization.legalName, organization.organizationType, organization.addressLine1, organization.city, organization.stateRegion, organization.country]
    : [profile.legalName, profile.organizationType, profile.addressLine1, profile.city, profile.stateRegion, profile.country];
  return values.every((value) => String(value ?? "").trim().length > 0);
}

function hasDocumentsReady(bundle: PartnerOrganizationBundle | null | undefined): boolean {
  if (!bundle) return false;
  if (bundle.requirements.length === 0) return false;
  return bundle.readiness.blockingRequirements.length === 0;
}

function hasEligibleApplicationService(
  bundle: PartnerOrganizationBundle | null | undefined,
  selectedServices: PartnerServiceDefinition[]
): boolean {
  const country = bundle?.organization.country ?? "IN";
  const businessType = bundle?.organization.organizationType ?? "";
  const scopeCodes = bundle?.serviceScopes
    .filter((scope) => scope.status !== "disabled")
    .map((scope) => scope.serviceCode);
  const serviceCodes = scopeCodes?.length ? scopeCodes : selectedServices.map((service) => service.id);
  return serviceCodes.some((code) => {
    const item = findPartnerCatalogueItem(code);
    return item ? partnerServiceEligibleForApplication(item, country, businessType) : false;
  });
}

function hasBlockingRequirement(bundle: PartnerOrganizationBundle | null | undefined): boolean {
  return Boolean(bundle?.readiness.blockingRequirements.length);
}

function resolveOverallStatus(
  bundle: PartnerOrganizationBundle | null | undefined,
  reviewStatus: PartnerVerificationStatus,
  approved: boolean,
  reviewNeedsAttention: boolean
): PartnerApplicationOverallStatus {
  if (approved) return "approved";
  if (reviewStatus === "REJECTED") return "rejected";
  if (reviewStatus === "CHANGES_REQUIRED" || reviewNeedsAttention) return "changes-required";
  if (reviewStatus === "SUBMITTED" || reviewStatus === "UNDER_REVIEW") return "under-review";
  if (!bundle) return "not-started";
  return "in-progress";
}

function reviewStatusToStepStatus(reviewStatus: PartnerVerificationStatus, readyToSubmit: boolean): PartnerApplicationStepStatus {
  if (reviewStatus === "VERIFIED") return "completed";
  if (reviewStatus === "SUBMITTED" || reviewStatus === "UNDER_REVIEW") return "under-review";
  if (reviewStatus === "CHANGES_REQUIRED" || reviewStatus === "REJECTED") return "needs-attention";
  return readyToSubmit ? "in-progress" : "locked";
}

function statusLabel(status: PartnerApplicationOverallStatus): string {
  if (status === "approved") return "Approved";
  if (status === "rejected") return "Application not approved";
  if (status === "changes-required") return "Action required";
  if (status === "under-review") return "Under review";
  if (status === "in-progress") return "In progress";
  return "Not started";
}

function resolveNextAction(
  steps: PartnerApplicationStep[],
  status: PartnerApplicationOverallStatus
): PartnerApplicationCenterReadModel["nextAction"] {
  if (status === "approved") {
    return {
      title: "Your Partner account is ready",
      description: "Verified Partner tools will open in the Business Desk.",
      stepId: "approved",
      actionLabel: "View Status",
    };
  }
  if (status === "under-review") {
    return {
      title: "Application submitted",
      description: "TPL GO is reviewing your application.",
      stepId: "review_submit",
      actionLabel: "View Status",
    };
  }
  if (status === "rejected") {
    return {
      title: "Application not approved",
      description: "Review the decision and contact support if you need help.",
      stepId: "review_submit",
      actionLabel: "View Details",
    };
  }
  const nextStep =
    steps.find((step) => step.status === "needs-attention") ??
    steps.find((step) => step.enabled && step.status !== "completed" && step.status !== "under-review") ??
    steps[0];
  return {
    title: nextStep.status === "needs-attention" ? `Update ${nextStep.name}` : `Complete ${nextStep.name}`,
    description: nextStep.description,
    stepId: nextStep.id,
    actionLabel: nextStep.actionLabel,
  };
}

function latestReviewNote(bundle: PartnerOrganizationBundle | null | undefined): string | null {
  return bundle?.documents.find((document) => document.reviewNote)?.reviewNote ?? null;
}

function readApplicationMetadata(bundle: PartnerOrganizationBundle | null | undefined): {
  stepCompletion: Record<string, boolean>;
} {
  const metadata = bundle?.organization.metadata;
  const application = metadata && typeof metadata.application === "object" && !Array.isArray(metadata.application)
    ? metadata.application as Record<string, unknown>
    : {};
  const stepCompletion = application.stepCompletion && typeof application.stepCompletion === "object" && !Array.isArray(application.stepCompletion)
    ? application.stepCompletion as Record<string, boolean>
    : {};
  return { stepCompletion };
}
