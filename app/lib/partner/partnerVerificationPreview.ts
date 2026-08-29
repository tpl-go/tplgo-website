import type { PartnerOrganizationPreviewProfile, PartnerOrganizationType } from "./partnerOrganizationPreviewProfile";
import type { PartnerServiceDefinition } from "./partnerServiceCatalog";

export const PARTNER_VERIFICATION_PREVIEW_STORAGE_KEY = "tpl.partnerPreview.verification.v1";

export type VerificationOwnerType =
  | "PERSON"
  | "ORGANIZATION"
  | "PROPERTY"
  | "VEHICLE"
  | "DRIVER"
  | "PROFESSIONAL"
  | "SERVICE"
  | "LOCATION"
  | "EQUIPMENT_ASSET";

export type VerificationRequirementPriority = "Mandatory" | "Conditional" | "Recommended" | "Optional";
export type VerificationStatus = "Action required" | "Submitted" | "Under review" | "Verified" | "Changes needed" | "Expiring soon" | "Expired";

export type PartnerVerificationRequirement = {
  id: string;
  version: string;
  effectiveDate: string;
  deprecated: boolean;
  title: string;
  what: string;
  why: string;
  appliesTo: string;
  ownerType: VerificationOwnerType;
  entityLabel: string;
  priority: VerificationRequirementPriority;
  status: VerificationStatus;
  expires: boolean;
  jurisdiction: {
    country: string;
    stateRegion?: string;
    city?: string;
    localAuthority?: string;
  };
  serviceIds: string[];
  documentType: string;
  reusableDocumentTypes: string[];
};

export type PartnerPreviewDocument = {
  id: string;
  filename: string;
  documentType: string;
  uploadDate: string;
  status: VerificationStatus;
  issueDate?: string;
  expiryDate?: string;
  safePreviewAvailable: boolean;
  fictional: boolean;
  linkedRequirementIds: string[];
};

export type PartnerVerificationPreviewState = {
  documents: PartnerPreviewDocument[];
  expandedGroupIds: string[];
  reviewStatus: "draft" | "preview-submitted" | "under-review";
};

export type PartnerVerificationPreviewStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type VerificationReadinessOutput = {
  organizationVerified: boolean;
  identityVerified: boolean;
  serviceComplianceStatus: Array<{ serviceId: string; serviceLabel: string; status: VerificationStatus; blockingRequirements: string[] }>;
  blockingRequirements: PartnerVerificationRequirement[];
  expiringCredentials: PartnerPreviewDocument[];
  overallVerificationStatus: "Action required" | "Submitted" | "Under review" | "Verified" | "Changes needed";
};

export const emptyPartnerVerificationPreviewState: PartnerVerificationPreviewState = {
  documents: [],
  expandedGroupIds: ["identity-contact", "business-verification", "service-compliance"],
  reviewStatus: "draft",
};

export const fictionalPreviewDocuments: PartnerPreviewDocument[] = [
  {
    id: "doc-sample-company-pan",
    filename: "FICTIONAL-HAAH-PAN.pdf",
    documentType: "PAN",
    uploadDate: "2026-08-20",
    status: "Verified",
    issueDate: "2024-04-01",
    safePreviewAvailable: false,
    fictional: true,
    linkedRequirementIds: ["org-pan"],
  },
  {
    id: "doc-sample-address",
    filename: "FICTIONAL-ADDRESS-DECLARATION.pdf",
    documentType: "Address proof",
    uploadDate: "2026-08-21",
    status: "Under review",
    safePreviewAvailable: false,
    fictional: true,
    linkedRequirementIds: ["org-address"],
  },
];

export function readPartnerVerificationPreviewState(
  storage: PartnerVerificationPreviewStorage
): PartnerVerificationPreviewState {
  const rawValue = storage.getItem(PARTNER_VERIFICATION_PREVIEW_STORAGE_KEY);
  if (!rawValue) return emptyPartnerVerificationPreviewState;

  try {
    const parsed = JSON.parse(rawValue) as Partial<PartnerVerificationPreviewState>;
    return {
      documents: Array.isArray(parsed.documents) ? parsed.documents.filter(isPreviewDocument) : [],
      expandedGroupIds: Array.isArray(parsed.expandedGroupIds)
        ? parsed.expandedGroupIds.filter((item): item is string => typeof item === "string")
        : emptyPartnerVerificationPreviewState.expandedGroupIds,
      reviewStatus: parsed.reviewStatus === "preview-submitted" || parsed.reviewStatus === "under-review" ? parsed.reviewStatus : "draft",
    };
  } catch {
    return emptyPartnerVerificationPreviewState;
  }
}

export function writePartnerVerificationPreviewState(
  storage: PartnerVerificationPreviewStorage,
  state: PartnerVerificationPreviewState
): void {
  storage.setItem(PARTNER_VERIFICATION_PREVIEW_STORAGE_KEY, JSON.stringify(state));
}

export function seedFictionalPreviewDocuments(state: PartnerVerificationPreviewState): PartnerVerificationPreviewState {
  if (state.documents.length > 0) return state;
  return { ...state, documents: fictionalPreviewDocuments };
}

export function buildPartnerVerificationRequirements(
  profile: PartnerOrganizationPreviewProfile,
  services: PartnerServiceDefinition[],
  documents: PartnerPreviewDocument[]
): PartnerVerificationRequirement[] {
  const base = baseRequirements(profile);
  const serviceRequirements = services.flatMap((service) => requirementsForService(service, profile));
  const requirements = [...base, ...serviceRequirements];
  return requirements.map((requirement) => ({
    ...requirement,
    status: resolveRequirementStatus(requirement, documents),
  }));
}

export function groupVerificationRequirements(requirements: PartnerVerificationRequirement[]) {
  return [
    {
      id: "identity-contact",
      title: "Identity & Contact",
      requirements: requirements.filter((item) => item.ownerType === "PERSON" || item.id.startsWith("contact-")),
    },
    {
      id: "business-verification",
      title: "Business Verification",
      requirements: requirements.filter((item) => item.ownerType === "ORGANIZATION" && !item.id.startsWith("contact-")),
    },
    {
      id: "service-compliance",
      title: "Service Compliance",
      requirements: requirements.filter((item) => !["PERSON", "ORGANIZATION"].includes(item.ownerType)),
    },
  ].filter((group) => group.requirements.length > 0);
}

export function findReusableDocuments(
  requirement: PartnerVerificationRequirement,
  documents: PartnerPreviewDocument[]
): PartnerPreviewDocument[] {
  return documents.filter((document) =>
    requirement.reusableDocumentTypes.includes(document.documentType) &&
    !document.linkedRequirementIds.includes(requirement.id) &&
    document.status !== "Expired" &&
    document.status !== "Changes needed"
  );
}

export function linkDocumentToRequirement(
  state: PartnerVerificationPreviewState,
  documentId: string,
  requirementId: string
): PartnerVerificationPreviewState {
  return {
    ...state,
    documents: state.documents.map((document) =>
      document.id === documentId && !document.linkedRequirementIds.includes(requirementId)
        ? { ...document, linkedRequirementIds: [...document.linkedRequirementIds, requirementId] }
        : document
    ),
  };
}

export function addPreviewDocumentForRequirement(
  state: PartnerVerificationPreviewState,
  requirement: PartnerVerificationRequirement,
  filename: string,
  issueDate?: string,
  expiryDate?: string
): PartnerVerificationPreviewState {
  const normalizedFilename = filename.trim() || `FICTIONAL-${requirement.documentType.toUpperCase().replace(/[^A-Z0-9]+/g, "-")}.pdf`;
  return {
    ...state,
    documents: [
      ...state.documents,
      {
        id: `doc-preview-${Date.now()}`,
        filename: normalizedFilename,
        documentType: requirement.documentType,
        uploadDate: "2026-08-26",
        status: "Submitted",
        issueDate,
        expiryDate,
        safePreviewAvailable: false,
        fictional: true,
        linkedRequirementIds: [requirement.id],
      },
    ],
  };
}

export function calculateVerificationReadiness(
  profile: PartnerOrganizationPreviewProfile,
  services: PartnerServiceDefinition[],
  requirements: PartnerVerificationRequirement[],
  documents: PartnerPreviewDocument[]
): VerificationReadinessOutput {
  const blockingRequirements = requirements.filter((requirement) =>
    isBlockingRequirement(requirement) && requirement.status !== "Verified"
  );
  const expiringCredentials = documents.filter((document) => document.status === "Expiring soon" || document.status === "Expired");
  const organizationRequirements = requirements.filter((requirement) => requirement.ownerType === "ORGANIZATION" && isBlockingRequirement(requirement));
  const identityRequirements = requirements.filter((requirement) => requirement.ownerType === "PERSON" && isBlockingRequirement(requirement));

  const serviceComplianceStatus = services.map((service) => {
    const serviceBlocking = requirements.filter((requirement) =>
      requirement.serviceIds.includes(service.id) && isBlockingRequirement(requirement) && requirement.status !== "Verified"
    );
    return {
      serviceId: service.id,
      serviceLabel: service.label,
      status: serviceBlocking.length > 0 ? "Action required" as const : "Verified" as const,
      blockingRequirements: serviceBlocking.map((requirement) => requirement.title),
    };
  });

  return {
    organizationVerified: organizationRequirements.length > 0 && organizationRequirements.every((requirement) => requirement.status === "Verified"),
    identityVerified: identityRequirements.length > 0 && identityRequirements.every((requirement) => requirement.status === "Verified"),
    serviceComplianceStatus,
    blockingRequirements,
    expiringCredentials,
    overallVerificationStatus: blockingRequirements.length > 0 ? "Action required" : "Submitted",
  };
}

export function getPrimaryVerificationCta(readiness: VerificationReadinessOutput, reviewStatus: PartnerVerificationPreviewState["reviewStatus"]): string {
  if (reviewStatus === "under-review") return "Review in progress";
  if (readiness.blockingRequirements.some((requirement) => requirement.status === "Changes needed")) return "Fix required items";
  if (readiness.blockingRequirements.length > 0) return "Complete required checks";
  return "Preview review submission";
}

export function isBlockingRequirement(requirement: PartnerVerificationRequirement): boolean {
  return requirement.priority === "Mandatory" || requirement.priority === "Conditional";
}

function baseRequirements(profile: PartnerOrganizationPreviewProfile): PartnerVerificationRequirement[] {
  const isIndividual = isIndividualProfessional(profile.organizationType);
  const organizationLabel = profile.legalName || "Organization";
  const common = [
    requirement("contact-mobile", "Mobile Number Verification", "PERSON", "Primary contact", "Mobile verification", "Mandatory", {
      what: "Verify the business mobile number through the TPL WhatsApp OTP flow where backend OTP is available.",
      why: "TPL uses verified contacts for account security and verification follow-up.",
      expires: false,
      status: profile.businessMobileVerificationStatus === "verified" && profile.businessMobileVerifiedValue === profile.businessMobile ? "Verified" : "Action required",
    }),
    requirement("contact-email", "Business Email Verification", "PERSON", "Primary contact", "Email verification", "Recommended", {
      what: "Verify the exact business email used for compliance communication.",
      why: "Email verification helps TPL send document and review updates to the right contact.",
      expires: false,
      status: profile.businessEmailVerificationStatus === "verified" && profile.businessEmailVerifiedValue === profile.businessEmail ? "Verified" : "Action required",
    }),
    requirement("identity-proof", isIndividual ? "Personal Identity Document" : "Authorized Representative Identity", "PERSON", "Primary contact", "Identity document", "Mandatory", {
      what: "Upload a fictional Preview identity document for the person responsible for this Partner profile.",
      why: "TPL needs a traceable representative for verification and admin review.",
      expires: true,
    }),
  ];

  if (isIndividual) {
    return [
      ...common,
      requirement("professional-credential", "Professional Credential", "PROFESSIONAL", profile.legalName || "Individual Professional", "Professional licence", "Conditional", {
        what: "Upload the guide, instructor, doctor, or professional credential applicable to the selected service.",
        why: "Some services depend on a person's qualification rather than company paperwork.",
        expires: true,
      }),
    ];
  }

  return [
    ...common,
    requirement("org-pan", "Company PAN", "ORGANIZATION", organizationLabel, "PAN", "Mandatory", {
      what: "Upload the organization's fictional PAN document.",
      why: "TPL asks for business tax identity where applicable to the organization type.",
      expires: false,
    }),
    requirement("org-address", "Business Address Proof", "ORGANIZATION", organizationLabel, "Address proof", "Mandatory", {
      what: "Upload proof for the registered or operating business address.",
      why: "TPL needs a contactable business location for review and partner operations.",
      expires: false,
    }),
    requirement("org-registration", "Company Registration", "ORGANIZATION", organizationLabel, "Company registration", "Conditional", {
      what: "Upload company, LLP, trust, or society registration only where the organization type requires it.",
      why: "TPL uses this to confirm the registered business entity, not the brand logo.",
      expires: false,
    }),
  ];
}

function requirementsForService(service: PartnerServiceDefinition, profile: PartnerOrganizationPreviewProfile): PartnerVerificationRequirement[] {
  const serviceId = service.id;
  const jurisdiction = { country: profile.country || "India", stateRegion: profile.stateRegion || undefined, city: profile.city || undefined };
  const scoped = (item: PartnerVerificationRequirement) => ({ ...item, serviceIds: [serviceId], jurisdiction });

  if (serviceId === "hotels-resorts" || serviceId === "homestays" || serviceId === "wedding-hotels-resorts" || serviceId === "shooting-accommodation") {
    return [
      scoped(requirement(`${serviceId}-property-registration`, "Property Licence", "PROPERTY", `${service.label} Property 1`, "Property licence", "Conditional", {
        what: "Upload the property registration, trade licence, or configured local authority document for this Preview jurisdiction.",
        why: "Accommodation compliance applies to the property, not only the company.",
        expires: true,
      })),
      scoped(requirement(`${serviceId}-fire-safety`, "Fire & Safety Compliance", "PROPERTY", `${service.label} Property 1`, "Fire safety certificate", "Conditional", {
        what: "Upload configured fire and safety compliance metadata where applicable.",
        why: "Guest safety requirements can vary by property and local authority.",
        expires: true,
      })),
    ];
  }

  if (serviceId === "cab-taxi" || serviceId === "self-drive-car-rental" || serviceId === "airport-station-transfers" || serviceId === "shooting-transport") {
    return [
      scoped(requirement(`${serviceId}-vehicle-registration`, "Vehicle Registration", "VEHICLE", `${service.label} Vehicle 1`, "Vehicle registration", "Mandatory", {
        what: "Upload vehicle registration for each operating vehicle.",
        why: "Transport compliance belongs to each vehicle.",
        expires: true,
      })),
      scoped(requirement(`${serviceId}-driver-licence`, "Driver Licence", "DRIVER", `${service.label} Driver 1`, "Driver licence", "Mandatory", {
        what: "Upload the driver's current licence.",
        why: "Driver eligibility is reviewed separately from organization identity.",
        expires: true,
      })),
    ];
  }

  if (serviceId === "activities" || serviceId === "adventure") {
    return [
      scoped(requirement(`${serviceId}-activity-safety`, "Activity Safety Declaration", "SERVICE", service.label, "Safety declaration", "Mandatory", {
        what: "Provide configured safety and risk-control metadata for the activity.",
        why: "Activity readiness depends on the service being offered.",
        expires: false,
      })),
      scoped(requirement(`${serviceId}-scuba-professional`, "Scuba Professional Certification", "PROFESSIONAL", "Scuba Instructor / Professional", "Professional licence", "Conditional", {
        what: "Upload instructor certification when scuba diving is offered.",
        why: "Qualification belongs to the professional delivering the activity.",
        expires: true,
      })),
    ];
  }

  if (serviceId === "guides") {
    return [scoped(requirement("guides-professional-licence", "Guide Licence", "PROFESSIONAL", "Guide / Professional", "Professional licence", "Mandatory", {
      what: "Upload the configured guide licence or professional credential.",
      why: "Guide verification applies to the professional, not a company logo.",
      expires: true,
    }))];
  }

  if (serviceId === "medical-tourism") {
    return [
      scoped(requirement("medical-facility-registration", "Facility Registration", "PROPERTY", "Medical Facility", "Facility registration", "Mandatory", {
        what: "Upload configured facility registration for the healthcare location.",
        why: "Medical service readiness depends on facility-level verification.",
        expires: true,
      })),
      scoped(requirement("medical-professional-credential", "Doctor / Professional Credential", "PROFESSIONAL", "Doctor / Professional", "Professional licence", "Mandatory", {
        what: "Upload the fictional credential metadata for the treating professional.",
        why: "Professional qualifications are reviewed separately from facility documents.",
        expires: true,
      })),
    ];
  }

  if (serviceId === "shooting-locations" || serviceId === "permissions-support") {
    return [scoped(requirement(`${serviceId}-location-authorization`, "Shooting Location Authorization", "LOCATION", "Configured shooting location", "Location authorization", "Conditional", {
      what: "Upload location or permission authorization configured for this Preview jurisdiction.",
      why: "Shooting approvals attach to a location or local authority.",
      expires: true,
    }))];
  }

  if (serviceId === "marketplace-seller") {
    return [scoped(requirement("marketplace-seller-product-compliance", "Seller Product Compliance", "SERVICE", "Marketplace Seller", "Seller compliance", "Recommended", {
      what: "Provide category-specific product compliance metadata where relevant.",
      why: "Recommended checks improve seller readiness without blocking all onboarding.",
      expires: false,
    }))];
  }

  return [scoped(requirement(`${serviceId}-service-declaration`, `${service.label} Service Declaration`, "SERVICE", service.label, "Service declaration", "Recommended", {
    what: "Provide configured service compliance metadata for this service.",
    why: "Jurisdiction and service rules can change, so requirements are configured by rule version.",
    expires: false,
  }))];
}

function requirement(
  id: string,
  title: string,
  ownerType: VerificationOwnerType,
  entityLabel: string,
  documentType: string,
  priority: VerificationRequirementPriority,
  overrides: Partial<Pick<PartnerVerificationRequirement, "what" | "why" | "expires" | "status">>
): PartnerVerificationRequirement {
  return {
    id,
    version: "D28E3C-preview-v1",
    effectiveDate: "2026-08-26",
    deprecated: false,
    title,
    what: overrides.what ?? `Provide ${title}.`,
    why: overrides.why ?? "TPL uses this configured Preview rule to assess verification readiness.",
    appliesTo: ownerType.toLowerCase().replace("_", " "),
    ownerType,
    entityLabel,
    priority,
    status: overrides.status ?? "Action required",
    expires: overrides.expires ?? false,
    jurisdiction: { country: "India" },
    serviceIds: [],
    documentType,
    reusableDocumentTypes: duplicateDocumentTypes(documentType),
  };
}

function duplicateDocumentTypes(documentType: string): string[] {
  if (documentType === "Professional licence") return ["Professional licence", "Identity document"];
  if (documentType === "PAN") return ["PAN"];
  if (documentType === "Address proof") return ["Address proof"];
  return [documentType];
}

function resolveRequirementStatus(
  requirement: PartnerVerificationRequirement,
  documents: PartnerPreviewDocument[]
): VerificationStatus {
  if (requirement.status === "Verified") return "Verified";
  const linkedDocuments = documents.filter((document) => document.linkedRequirementIds.includes(requirement.id));
  if (linkedDocuments.some((document) => document.status === "Verified")) return "Verified";
  if (linkedDocuments.some((document) => document.status === "Expired")) return "Expired";
  if (linkedDocuments.some((document) => document.status === "Changes needed")) return "Changes needed";
  if (linkedDocuments.some((document) => document.status === "Under review")) return "Under review";
  if (linkedDocuments.some((document) => document.status === "Submitted")) return "Submitted";
  return requirement.status;
}

function isIndividualProfessional(organizationType: PartnerOrganizationType | ""): boolean {
  return organizationType === "Individual Professional" || organizationType === "Individual / Proprietor";
}

function isPreviewDocument(value: unknown): value is PartnerPreviewDocument {
  if (!value || typeof value !== "object") return false;
  const document = value as Partial<PartnerPreviewDocument>;
  return typeof document.id === "string" && typeof document.filename === "string" && typeof document.documentType === "string";
}
