import type { PartnerOrganizationBundle, PartnerVerificationStatus } from "./partnerApiClient";

export type PartnerQaPreviewState = "new" | "incomplete" | "under-review" | "changes-required" | "rejected" | "approved";

export const partnerQaPreviewStates: Array<{ id: PartnerQaPreviewState; label: string }> = [
  { id: "new", label: "New Partner" },
  { id: "incomplete", label: "Application in Progress" },
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
