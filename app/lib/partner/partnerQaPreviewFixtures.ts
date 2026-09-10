import type {
  PartnerApplicationReadiness,
  PartnerApplicationStatus,
  PartnerApplicationStepKey,
  PartnerApplicationStepReadiness,
  PartnerApplicationSubmissionSummary,
  PartnerOrganizationBundle,
  PartnerVerificationStatus,
} from "./partnerApiClient";

export type PartnerQaPreviewState = "new" | "incomplete" | "ready" | "under-review" | "changes-required" | "rejected" | "approved";

export const partnerQaPreviewStates: Array<{ id: PartnerQaPreviewState; label: string }> = [
  { id: "new", label: "New Partner" },
  { id: "incomplete", label: "Application in Progress" },
  { id: "ready", label: "Ready to Submit" },
  { id: "under-review", label: "Under Review" },
  { id: "changes-required", label: "Changes Required" },
  { id: "rejected", label: "Application Not Approved" },
  { id: "approved", label: "Approved Partner" },
];

export function buildPartnerQaPreviewBundle(state: PartnerQaPreviewState): PartnerOrganizationBundle | null {
  if (state === "new") return null;
  if (state === "incomplete") {
    return createFixtureBundle({
      organizationStatus: "draft",
      reviewStatus: "NOT_SUBMITTED",
      contactsVerified: true,
      serviceCount: 1,
      requirementsReady: false,
      blockingRequirements: 2,
    });
  }
  if (state === "ready") {
    return createFixtureBundle({
      organizationStatus: "draft",
      reviewStatus: "NOT_SUBMITTED",
      contactsVerified: true,
      serviceCount: 2,
      requirementsReady: true,
    });
  }
  if (state === "under-review") {
    return createFixtureBundle({
      organizationStatus: "submitted",
      reviewStatus: "UNDER_REVIEW",
      contactsVerified: true,
      serviceCount: 2,
      requirementsReady: true,
      submittedAt: "2026-08-30T12:00:00.000Z",
    });
  }
  if (state === "changes-required") {
    return createFixtureBundle({
      organizationStatus: "changes_required",
      reviewStatus: "CHANGES_REQUIRED",
      contactsVerified: true,
      serviceCount: 2,
      requirementsReady: false,
      blockingRequirements: 1,
      reviewNote: "Please upload a clearer business address document.",
      submittedAt: "2026-08-29T12:00:00.000Z",
    });
  }
  if (state === "rejected") {
    return createFixtureBundle({
      organizationStatus: "rejected",
      reviewStatus: "REJECTED",
      contactsVerified: true,
      serviceCount: 1,
      requirementsReady: false,
      blockingRequirements: 1,
      reviewNote: "The application could not be approved with the current documents.",
      submittedAt: "2026-08-28T12:00:00.000Z",
    });
  }
  return createFixtureBundle({
    organizationStatus: "active",
    reviewStatus: "VERIFIED",
    contactsVerified: true,
    serviceCount: 3,
    requirementsReady: true,
    submittedAt: "2026-08-27T12:00:00.000Z",
    completedAt: "2026-08-29T12:00:00.000Z",
  });
}

export function buildPartnerQaPreviewReadiness(state: PartnerQaPreviewState): PartnerApplicationReadiness {
  const bundle = buildPartnerQaPreviewBundle(state);
  const completeSteps = stepKeys.map((step) => qaStep(step, "COMPLETE", "Ready for final review."));
  const incompleteSteps = stepKeys.map((step, index) => qaStep(
    step,
    index < 3 ? "COMPLETE" : index === 4 ? "UNDER_REVIEW" : "NEEDS_ATTENTION",
    index < 3 ? "Information has been added." : index === 4 ? "Evidence is submitted for TPL review." : "Finish this section before submitting.",
  ));
  const changesRequestedSteps = stepKeys.map((step) => qaStep(
    step,
    step === "verification_compliance" ? "NEEDS_ATTENTION" : "COMPLETE",
    step === "verification_compliance" ? "Upload a clearer address document." : "No change requested.",
  ));

  if (state === "new") return qaReadiness({ bundle, status: "DRAFT_INCOMPLETE", submissionReady: false, steps: stepKeys.map((step) => qaStep(step, "NEEDS_ATTENTION", "Start this section.")), blockers: ["APPLICATION_NOT_STARTED"], declarations: [] });
  if (state === "incomplete") return qaReadiness({ bundle, status: "DRAFT_INCOMPLETE", submissionReady: false, steps: incompleteSteps, blockers: ["READINESS_BLOCKER"], declarations: [qaFinalSubmissionDeclaration] });
  if (state === "ready") return qaReadiness({ bundle, status: "READY_TO_SUBMIT", submissionReady: true, steps: completeSteps, blockers: [], declarations: [qaFinalSubmissionDeclaration] });
  if (state === "under-review") return qaReadiness({ bundle, status: "UNDER_REVIEW", submissionReady: false, steps: completeSteps, blockers: [], declarations: [qaFinalSubmissionDeclaration], latestSubmission: buildPartnerQaPreviewSubmission(state) });
  if (state === "changes-required") return qaReadiness({ bundle, status: "CHANGES_REQUESTED", submissionReady: false, steps: changesRequestedSteps, blockers: ["CHANGES_REQUESTED"], declarations: [qaFinalSubmissionDeclaration], latestSubmission: buildPartnerQaPreviewSubmission(state), warnings: ["TPL review requested an update."] });
  if (state === "rejected") return qaReadiness({ bundle, status: "NOT_APPROVED", submissionReady: false, steps: completeSteps, blockers: ["APPLICATION_NOT_APPROVED"], declarations: [qaFinalSubmissionDeclaration], latestSubmission: buildPartnerQaPreviewSubmission(state) });
  return qaReadiness({ bundle, status: "APPROVED", submissionReady: false, steps: completeSteps, blockers: [], declarations: [qaFinalSubmissionDeclaration], latestSubmission: buildPartnerQaPreviewSubmission(state) });
}

export function buildPartnerQaPreviewSubmission(state: PartnerQaPreviewState): PartnerApplicationSubmissionSummary | null {
  if (!["under-review", "changes-required", "rejected", "approved"].includes(state)) return null;
  const statusByState: Record<Exclude<PartnerQaPreviewState, "new" | "incomplete" | "ready">, PartnerApplicationStatus> = {
    "under-review": "UNDER_REVIEW",
    "changes-required": "CHANGES_REQUESTED",
    rejected: "NOT_APPROVED",
    approved: "APPROVED",
  };
  return {
    id: `qa-preview-submission-${state}`,
    submissionRevision: state === "changes-required" ? 2 : 1,
    workflowStatus: statusByState[state as Exclude<PartnerQaPreviewState, "new" | "incomplete" | "ready">],
    snapshotHash: "qa-preview-safe-hidden-hash",
    submittedAt: state === "approved" ? "2026-08-27T12:00:00.000Z" : "2026-08-30T12:00:00.000Z",
    submittedByUserId: "qa-preview-partner",
  };
}

export const qaFinalSubmissionDeclaration = {
  id: "qa-final-submission-test-declaration",
  version: 1,
  title: "QA-only final submission declaration",
  active: true,
  required: true,
  appliesTo: "final_submission" as const,
};

const stepKeys: PartnerApplicationStepKey[] = [
  "account_contact",
  "business_identity",
  "business_location",
  "services",
  "verification_compliance",
  "payout_tax",
  "partner_agreement",
];

const stepLabels: Record<PartnerApplicationStepKey, string> = {
  account_contact: "Account & Contact",
  business_identity: "Business Identity",
  business_location: "Business Location",
  services: "Services",
  verification_compliance: "Verification & Compliance",
  payout_tax: "Payout & Tax",
  partner_agreement: "Partner Agreement",
};

function qaStep(step: PartnerApplicationStepKey, status: PartnerApplicationStepReadiness["status"], reason: string): PartnerApplicationStepReadiness {
  return {
    step,
    label: stepLabels[step],
    status,
    reason,
    blockerCodes: status === "NEEDS_ATTENTION" ? ["QA_PREVIEW_NEEDS_ATTENTION"] : [],
    warningCodes: status === "UNDER_REVIEW" ? ["QA_PREVIEW_UNDER_REVIEW"] : [],
    correctionRoute: `/partner-preview?qa=1&step=${step === "verification_compliance" ? "documents_compliance" : step}`,
  };
}

function qaReadiness(input: {
  bundle: PartnerOrganizationBundle | null;
  status: PartnerApplicationStatus;
  submissionReady: boolean;
  steps: PartnerApplicationStepReadiness[];
  blockers: string[];
  declarations: PartnerApplicationReadiness["activeDeclarations"];
  latestSubmission?: PartnerApplicationSubmissionSummary | null;
  warnings?: string[];
}): PartnerApplicationReadiness {
  return {
    organizationId: input.bundle?.organization.id ?? null,
    applicationId: input.bundle?.organization.id ?? null,
    organizationName: input.bundle?.organization.brandName || input.bundle?.organization.legalName || "QA Preview Partner",
    organizationStatus: input.bundle?.organization.status ?? null,
    applicationStatus: input.status,
    applicationRevision: input.status === "READY_TO_SUBMIT" ? 7 : 4,
    submissionReady: input.submissionReady,
    approvalReady: input.status === "APPROVED",
    steps: input.steps,
    submissionBlockers: input.blockers,
    approvalBlockers: input.status === "APPROVED" ? [] : ["QA_PREVIEW_APPROVAL_PENDING"],
    warnings: input.warnings ?? [],
    activeDeclarations: input.declarations,
    latestSubmission: input.latestSubmission ?? null,
  };
}

function createFixtureBundle(input: {
  organizationStatus: string;
  reviewStatus: PartnerVerificationStatus;
  contactsVerified: boolean;
  serviceCount: number;
  requirementsReady: boolean;
  blockingRequirements?: number;
  reviewNote?: string;
  submittedAt?: string;
  completedAt?: string;
}): PartnerOrganizationBundle {
  const serviceFixtures = [
    { serviceCode: "hotel", serviceLabel: "Hotel" },
    { serviceCode: "cab-taxi-operator", serviceLabel: "Cab / Taxi Operator" },
    { serviceCode: "activity-provider", serviceLabel: "Activity Provider" },
  ].slice(0, input.serviceCount);
  const blockingCount = input.blockingRequirements ?? 0;
  return {
    organization: {
      id: `qa-preview-${input.reviewStatus.toLowerCase()}`,
      legalName: "TPL QA Preview Partner",
      brandName: "TPL QA Preview",
      organizationType: "Private Limited",
      status: input.organizationStatus,
      businessMobile: "+917728895548",
      businessEmail: "qa.partner@example.invalid",
      addressLine1: "Staging QA House",
      addressLine2: null,
      city: "Jaipur",
      stateRegion: "Rajasthan",
      postalCode: "302001",
      country: "India",
    },
    members: [],
    contacts: input.contactsVerified
      ? [
          {
            id: "qa-contact-mobile",
            channel: "mobile",
            value: "+917728895548",
            verificationStatus: "verified",
            verifiedAt: "2026-08-30T10:00:00.000Z",
            isPrimary: true,
          },
          {
            id: "qa-contact-email",
            channel: "email",
            value: "qa.partner@example.invalid",
            verificationStatus: "verified",
            verifiedAt: "2026-08-30T10:00:00.000Z",
            isPrimary: true,
          },
        ]
      : [],
    serviceScopes: serviceFixtures.map((service, index) => ({
      id: `qa-scope-${index}`,
      serviceCode: service.serviceCode,
      serviceLabel: service.serviceLabel,
      status: input.reviewStatus === "VERIFIED" ? "setup_required" : "draft",
    })),
    requirements: input.requirementsReady || blockingCount > 0
      ? [
          {
            id: "qa-business-proof",
            ownerEntityType: "ORGANIZATION",
            requirementCode: "business-proof",
            title: "Business proof",
            description: "Upload business proof.",
            priority: "MANDATORY",
            status: blockingCount > 0 ? "CHANGES_REQUIRED" : "VERIFIED",
          },
        ]
      : [],
    documents: input.reviewNote
      ? [
          {
            id: "qa-document-review-note",
            documentCategory: "partner_verification",
            documentType: "Address proof",
            originalFilename: "QA-PREVIEW-ADDRESS.pdf",
            mimeType: "application/pdf",
            sizeBytes: 128000,
            status: input.reviewStatus,
            reviewNote: input.reviewNote,
          },
        ]
      : [],
    review: input.reviewStatus === "NOT_SUBMITTED"
      ? null
      : {
          id: "qa-review",
          status: input.reviewStatus,
          submittedAt: input.submittedAt ?? null,
          completedAt: input.completedAt ?? null,
        },
    events: [],
    readiness: {
      contactVerified: input.contactsVerified,
      organizationVerified: input.requirementsReady,
      identityVerified: input.contactsVerified,
      overallVerificationStatus: input.reviewStatus,
      blockingRequirements: Array.from({ length: blockingCount }, (_, index) => ({
        id: `qa-blocking-${index}`,
        title: "Business proof",
        status: "CHANGES_REQUIRED",
        priority: "MANDATORY",
      })),
      expiringCredentials: [],
      serviceComplianceStatus: serviceFixtures.map((service) => ({
        serviceScopeId: service.serviceCode,
        serviceCode: service.serviceCode,
        serviceLabel: service.serviceLabel,
        status: input.requirementsReady ? "VERIFIED" : "CHANGES_REQUIRED",
        blockingRequirements: input.requirementsReady ? [] : ["Business proof"],
      })),
    },
  };
}
