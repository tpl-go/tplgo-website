import { expect, test } from "vitest";
import { buildPartnerApplicationCenterReadModel } from "./partnerApplicationCenter";
import type { PartnerOrganizationBundle, PartnerVerificationStatus } from "./partnerApiClient";
import { emptyPartnerOrganizationPreviewProfile } from "./partnerOrganizationPreviewProfile";
import { selectedPartnerServices } from "./partnerPreviewSelection";
import { getAllPartnerServices, partnerServiceCatalogue } from "./partnerServiceCatalog";

test("new partner starts in the application center without fake progress", () => {
  const model = buildPartnerApplicationCenterReadModel({
    profile: emptyPartnerOrganizationPreviewProfile,
    selectedServices: [],
  });

  expect(model.overallStatus).toBe("not-started");
  expect(model.progressCompleted).toBe(0);
  expect(model.nextAction.stepId).toBe("account_contact");
});

test("incomplete partner maps real contact, business, and service progress", () => {
  const model = buildPartnerApplicationCenterReadModel({
    bundle: bundleFixture({
      contactsVerified: true,
      serviceCount: 1,
      requirements: true,
      blockingRequirements: 1,
    }),
    profile: emptyPartnerOrganizationPreviewProfile,
    selectedServices: selectedPartnerServices(["hotel"], getAllPartnerServices()),
    catalogueItems: partnerServiceCatalogue,
  });

  expect(model.steps.find((step) => step.id === "account_contact")?.status).toBe("completed");
  expect(model.steps.find((step) => step.id === "business_identity")?.status).toBe("completed");
  expect(model.steps.find((step) => step.id === "services")?.status).toBe("completed");
  expect(model.steps.find((step) => step.id === "documents_compliance")?.status).toBe("in-progress");
});

test("legacy service scopes stay readable but do not complete Step 4", () => {
  const model = buildPartnerApplicationCenterReadModel({
    bundle: bundleFixture({
      contactsVerified: true,
      serviceCodes: ["legacy-service-code"],
      requirements: true,
      blockingRequirements: 1,
    }),
    profile: emptyPartnerOrganizationPreviewProfile,
    selectedServices: [],
    catalogueItems: partnerServiceCatalogue,
  });

  expect(model.steps.find((step) => step.id === "services")?.status).toBe("locked");
  expect(model.steps.find((step) => step.id === "documents_compliance")?.status).toBe("not-started");
});

test("submitted partner shows under review instead of editable-start state", () => {
  const model = buildPartnerApplicationCenterReadModel({
    bundle: bundleFixture({
      contactsVerified: true,
      serviceCount: 1,
      requirements: true,
      reviewStatus: "UNDER_REVIEW",
    }),
    profile: emptyPartnerOrganizationPreviewProfile,
    selectedServices: [],
    catalogueItems: partnerServiceCatalogue,
  });

  expect(model.overallStatus).toBe("under-review");
  expect(model.nextAction.title).toBe("Application submitted");
  expect(model.steps.find((step) => step.id === "review_submit")?.status).toBe("under-review");
});

test("changes required remains actionable and human readable", () => {
  const model = buildPartnerApplicationCenterReadModel({
    bundle: bundleFixture({
      contactsVerified: true,
      serviceCount: 1,
      requirements: true,
      reviewStatus: "CHANGES_REQUIRED",
      blockingRequirements: 1,
    }),
    profile: emptyPartnerOrganizationPreviewProfile,
    selectedServices: [],
    catalogueItems: partnerServiceCatalogue,
  });

  expect(model.overallStatus).toBe("changes-required");
  expect(model.statusLabel).toBe("Action required");
  expect(model.nextAction.stepId).toBe("review_submit");
});

test("approved partner is detected without exposing the pre-approval center as final destination", () => {
  const model = buildPartnerApplicationCenterReadModel({
    bundle: bundleFixture({
      contactsVerified: true,
      serviceCount: 2,
      requirements: true,
      reviewStatus: "VERIFIED",
      organizationStatus: "active",
    }),
    profile: emptyPartnerOrganizationPreviewProfile,
    selectedServices: [],
    catalogueItems: partnerServiceCatalogue,
  });

  expect(model.approved).toBe(true);
  expect(model.overallStatus).toBe("approved");
  expect(model.nextAction.stepId).toBe("approved");
});

function bundleFixture(options: {
  contactsVerified?: boolean;
  serviceCount?: number;
  serviceCodes?: string[];
  requirements?: boolean;
  blockingRequirements?: number;
  reviewStatus?: PartnerVerificationStatus;
  organizationStatus?: string;
} = {}): PartnerOrganizationBundle {
  const serviceCodes = options.serviceCodes ?? Array.from({ length: options.serviceCount ?? 0 }, (_, index) => index === 0 ? "hotel" : "cab-taxi-operator");
  const serviceCount = serviceCodes.length;
  const reviewStatus = options.reviewStatus ?? "NOT_SUBMITTED";
  return {
    organization: {
      id: "org-1",
      legalName: "TPL QA Partner",
      brandName: null,
      organizationType: "Private Limited",
      status: options.organizationStatus ?? "draft",
      businessMobile: "+917728895548",
      businessEmail: "partner@example.com",
      addressLine1: "QA House",
      addressLine2: null,
      city: "Jaipur",
      stateRegion: "Rajasthan",
      postalCode: "302001",
      country: "India",
      metadata: {},
    },
    members: [],
    contacts: options.contactsVerified
      ? [
          {
            id: "contact-mobile",
            channel: "mobile",
            value: "+917728895548",
            normalizedValue: "+917728895548",
            verificationStatus: "verified",
            isPrimary: true,
          },
          {
            id: "contact-email",
            channel: "email",
            value: "partner@example.com",
            normalizedValue: "partner@example.com",
            verificationStatus: "verified",
            isPrimary: true,
          },
        ]
      : [],
    serviceScopes: Array.from({ length: serviceCount }, (_, index) => ({
      id: `scope-${index}`,
      serviceCode: serviceCodes[index]!,
      serviceLabel: index === 0 ? "Hotel" : "Cab / Taxi Operator",
      status: "draft",
    })),
    requirements: options.requirements
      ? [
          {
            id: "req-1",
            ownerEntityType: "ORGANIZATION",
            requirementCode: "business-proof",
            title: "Business proof",
            description: "Upload business proof.",
            priority: "MANDATORY",
            status: options.blockingRequirements ? "CHANGES_REQUIRED" : "VERIFIED",
          },
        ]
      : [],
    documents: [],
    review:
      reviewStatus === "NOT_SUBMITTED"
        ? null
        : {
            id: "review-1",
            status: reviewStatus,
            submittedAt: "2026-08-30T10:00:00.000Z",
            completedAt: reviewStatus === "VERIFIED" ? "2026-08-30T10:30:00.000Z" : null,
          },
    events: [],
    readiness: {
      contactVerified: Boolean(options.contactsVerified),
      organizationVerified: false,
      identityVerified: Boolean(options.contactsVerified),
      overallVerificationStatus: reviewStatus,
      blockingRequirements: Array.from({ length: options.blockingRequirements ?? 0 }, (_, index) => ({
        id: `blocking-${index}`,
        title: "Business proof",
        status: "CHANGES_REQUIRED",
        priority: "MANDATORY",
      })),
      expiringCredentials: [],
      serviceComplianceStatus: [],
    },
  };
}
