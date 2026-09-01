import { tplApiRequest, type TplApiResult } from "../api/tplApiClient";
import type { PartnerOrganizationPreviewProfile } from "./partnerOrganizationPreviewProfile";
import type { PartnerServiceDefinition } from "./partnerServiceCatalog";

export type PartnerVerificationStatus =
  | "NOT_SUBMITTED"
  | "SUBMITTED"
  | "UNDER_REVIEW"
  | "VERIFIED"
  | "CHANGES_REQUIRED"
  | "REJECTED"
  | "EXPIRING_SOON"
  | "EXPIRED";

export type PartnerOrganization = {
  id: string;
  legalName: string;
  brandName?: string | null;
  organizationType: string;
  status: string;
  businessMobile?: string | null;
  businessEmail?: string | null;
  addressLine1?: string | null;
  addressLine2?: string | null;
  city?: string | null;
  stateRegion?: string | null;
  postalCode?: string | null;
  country: string;
  metadata?: Record<string, unknown>;
  updatedAt?: string;
};

export type PartnerContact = {
  id: string;
  channel: "mobile" | "email";
  value: string;
  normalizedValue?: string;
  verificationStatus: "verification_required" | "verified" | "delivery_unavailable";
  verifiedAt?: string | null;
  isPrimary: boolean;
};

export type PartnerServiceScope = {
  id: string;
  serviceCode: string;
  serviceLabel: string;
  status: string;
  metadata?: Record<string, unknown>;
};

export type PartnerMember = {
  id: string;
  organizationId: string;
  userId: string;
  role: string;
  status: string;
};

export type PartnerRequirement = {
  id: string;
  serviceScopeId?: string | null;
  ownerEntityType: string;
  requirementCode: string;
  title: string;
  description: string;
  priority: "MANDATORY" | "CONDITIONAL" | "RECOMMENDED" | "OPTIONAL";
  status: PartnerVerificationStatus;
};

export type PartnerDocument = {
  id: string;
  ownerEntityType?: string;
  ownerEntityId?: string | null;
  documentCategory: string;
  documentType: string;
  originalFilename: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256?: string | null;
  issueDate?: string | null;
  expiryDate?: string | null;
  noExpiry?: boolean;
  status: PartnerVerificationStatus;
  reviewNote?: string | null;
};

export type PartnerPresignedUrl = {
  url: string;
  method: "GET" | "PUT";
  key: string;
  bucket: string;
  expiresAt: string;
  supported: boolean;
};

export type PartnerDocumentUploadSession = {
  uploadSessionId: string;
  storageReference: string;
  storageProvider: string;
  uploadMode: "signed_url" | "provider_required";
  upload?: PartnerPresignedUrl;
  publicUrl: null;
  expiresAt: string;
  executionStatus: "READY" | "PARTNER_PRIVATE_STORAGE_DISABLED" | "PARTNER_PRIVATE_STORAGE_NOT_STAGING_SAFE";
};

export type PartnerReview = {
  id: string;
  status: PartnerVerificationStatus;
  submittedAt?: string | null;
  completedAt?: string | null;
};

export type PartnerVerificationEvent = {
  id: string;
  action: string;
  reason?: string | null;
  newStatus?: string | null;
  createdAt: string;
};

export type PartnerReadiness = {
  contactVerified: boolean;
  organizationVerified: boolean;
  identityVerified: boolean;
  overallVerificationStatus: PartnerVerificationStatus;
  blockingRequirements: Array<{ id: string; title: string; status: PartnerVerificationStatus; priority: string }>;
  expiringCredentials: Array<{ id: string; documentType: string; expiryDate: string | null; status: PartnerVerificationStatus }>;
  serviceComplianceStatus: Array<{
    serviceScopeId: string;
    serviceCode: string;
    serviceLabel: string;
    status: PartnerVerificationStatus;
    blockingRequirements: string[];
  }>;
};

export type PartnerOrganizationBundle = {
  organization: PartnerOrganization;
  members: PartnerMember[];
  contacts: PartnerContact[];
  serviceScopes: PartnerServiceScope[];
  requirements: PartnerRequirement[];
  documents: PartnerDocument[];
  review?: PartnerReview | null;
  events: PartnerVerificationEvent[];
  readiness: PartnerReadiness;
};

export type PartnerMobileChallenge = {
  status: "otp_sent";
  challengeId: string;
  expiresAt: string;
  otpLength?: number;
  deliveryChannel?: "sms" | "whatsapp" | "voice" | "none" | string;
  deliveryStatus?: "sent" | "skipped" | "dry_run" | "not_connected" | string;
  deliveryConfirmed?: boolean;
  developmentOtp?: string;
};

export type PartnerMobileVerificationRequest =
  | PartnerMobileChallenge
  | {
    status: "verified_via_tpl_identity";
    contact?: PartnerContact | null;
  };

export type PartnerAccountContactDraftInput = {
  organizationId?: string;
  contactPersonFullName?: string;
  designation?: string;
  roleOther?: string;
  businessMobile?: string;
  businessEmail?: string;
  authorizedRepresentative?: boolean;
};

export type PartnerRequirementClassification =
  | "REQUIRED_FOR_APPLICATION"
  | "CONDITIONAL_BY_ENTITY"
  | "CONDITIONAL_BY_COUNTRY"
  | "CONDITIONAL_BY_SERVICE"
  | "REQUIRED_BEFORE_GO_LIVE"
  | "OPTIONAL";

export type PartnerBusinessIdentityDraftInput = {
  organizationId?: string;
  legalName?: string;
  brandName?: string;
  organizationType?: string;
  organizationTypeOther?: string;
  description?: string;
  yearEstablished?: string;
  registrationType?: string;
  registrationNumber?: string;
  registrationDate?: string;
  registrationVerification?: Record<string, unknown>;
  requirementClassifications?: Record<string, PartnerRequirementClassification>;
};

export type PartnerLocationAddressInput = {
  country?: string;
  countryCode?: string;
  addressLine1?: string;
  addressLine2?: string;
  city?: string;
  stateRegion?: string;
  postalCode?: string;
  landmark?: string;
  latitude?: string;
  longitude?: string;
  verificationStatus?: string;
};

export type PartnerServiceAreaInput = {
  id?: string;
  coverageLevel?: string;
  country?: string;
  countryCode?: string;
  stateRegion?: string;
  cityDestination?: string;
  localArea?: string;
};

export type PartnerBusinessLocationDraftInput = {
  organizationId?: string;
  primaryLocation?: PartnerLocationAddressInput;
  sameAsOperating?: boolean;
  operatingLocation?: PartnerLocationAddressInput;
  serviceAreas?: PartnerServiceAreaInput[];
};

export type PartnerRequestedServiceInput = {
  requestedName?: string;
  description?: string;
  closestDomain?: string;
  closestCategoryCode?: string;
};

export type PartnerServicesDraftInput = {
  organizationId?: string;
  selectedServiceCodes?: string[];
  requestedServices?: PartnerRequestedServiceInput[];
};

export function fetchPartnerApplicationDraft(): Promise<TplApiResult<PartnerOrganizationBundle | null>> {
  return tplApiRequest<PartnerOrganizationBundle | null>("/api/v1/partner/application/draft");
}

export function savePartnerAccountContactDraft(input: PartnerAccountContactDraftInput): Promise<TplApiResult<PartnerOrganizationBundle>> {
  return tplApiRequest<PartnerOrganizationBundle>("/api/v1/partner/application/draft/account-contact", {
    method: "POST",
    body: input,
  });
}

export function savePartnerBusinessIdentityDraft(input: PartnerBusinessIdentityDraftInput): Promise<TplApiResult<PartnerOrganizationBundle>> {
  return tplApiRequest<PartnerOrganizationBundle>("/api/v1/partner/application/draft/business-identity", {
    method: "POST",
    body: input,
  });
}

export function savePartnerBusinessLocationDraft(input: PartnerBusinessLocationDraftInput): Promise<TplApiResult<PartnerOrganizationBundle>> {
  return tplApiRequest<PartnerOrganizationBundle>("/api/v1/partner/application/draft/business-location", {
    method: "POST",
    body: input,
  });
}

export function savePartnerServicesDraft(input: PartnerServicesDraftInput): Promise<TplApiResult<PartnerOrganizationBundle>> {
  return tplApiRequest<PartnerOrganizationBundle>("/api/v1/partner/application/draft/services", {
    method: "POST",
    body: input,
  });
}

export function savePartnerOrganizationToBackend(
  profile: PartnerOrganizationPreviewProfile,
  services: PartnerServiceDefinition[]
): Promise<TplApiResult<PartnerOrganizationBundle>> {
  return tplApiRequest<PartnerOrganizationBundle>("/api/v1/partner/organizations", {
    method: "POST",
    body: buildPartnerOrganizationPayload(profile, services),
  });
}

export function fetchPartnerOrganizations(): Promise<TplApiResult<PartnerOrganizationBundle[]>> {
  return tplApiRequest<PartnerOrganizationBundle[]>("/api/v1/partner/organizations");
}

export function updatePartnerOrganizationOnBackend(
  organizationId: string,
  profile: PartnerOrganizationPreviewProfile,
  services: PartnerServiceDefinition[]
): Promise<TplApiResult<PartnerOrganizationBundle>> {
  return tplApiRequest<PartnerOrganizationBundle>(`/api/v1/partner/organizations/${encodeURIComponent(organizationId)}`, {
    method: "PUT",
    body: buildPartnerOrganizationPayload(profile, services),
  });
}

export function fetchPartnerOrganizationBundle(organizationId: string): Promise<TplApiResult<PartnerOrganizationBundle>> {
  return tplApiRequest<PartnerOrganizationBundle>(`/api/v1/partner/organizations/${encodeURIComponent(organizationId)}`);
}

export function requestPartnerMobileVerification(
  organizationId: string,
  mobile: string
): Promise<TplApiResult<PartnerMobileVerificationRequest>> {
  return tplApiRequest<PartnerMobileVerificationRequest>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/contact/mobile/request`,
    { method: "POST", body: { value: mobile } }
  );
}

export function verifyPartnerMobile(
  organizationId: string,
  input: { challengeId: string; mobile: string; otp: string }
): Promise<TplApiResult<{ verified: true; verifiedAt: string }>> {
  return tplApiRequest<{ verified: true; verifiedAt: string }>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/contact/mobile/verify`,
    { method: "POST", body: input }
  );
}

export function requestPartnerEmailVerification(organizationId: string, email: string) {
  return tplApiRequest<{ status: string; challengeId: string; expiresAt: string }>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/contact/email/request`,
    { method: "POST", body: { value: email } }
  );
}

export function verifyPartnerEmail(
  organizationId: string,
  input: { challengeId: string; email: string; token: string }
): Promise<TplApiResult<{ verified: true; verifiedAt: string }>> {
  return tplApiRequest<{ verified: true; verifiedAt: string }>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/contact/email/verify`,
    { method: "POST", body: input }
  );
}

export function submitPartnerVerification(organizationId: string): Promise<TplApiResult<PartnerReview>> {
  return tplApiRequest<PartnerReview>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/verification/submit`,
    { method: "POST" }
  );
}

export function createPartnerDocumentUploadSession(
  organizationId: string,
  input: { filename: string; mimeType: string; sizeBytes: number; checksumSha256?: string }
): Promise<TplApiResult<PartnerDocumentUploadSession>> {
  return tplApiRequest<PartnerDocumentUploadSession>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/documents/upload-session`,
    { method: "POST", body: input }
  );
}

export function confirmPartnerDocument(
  organizationId: string,
  input: {
    ownerEntityType: string;
    ownerEntityId?: string | null;
    documentCategory: string;
    documentType: string;
    storageReference: string;
    originalFilename: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256?: string;
    documentNumber?: string;
    issuingAuthority?: string;
    issueDate?: string;
    expiryDate?: string;
    noExpiry?: boolean;
  }
): Promise<TplApiResult<PartnerDocument>> {
  return tplApiRequest<PartnerDocument>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/documents/confirm`,
    { method: "POST", body: input }
  );
}

export function linkPartnerDocumentToRequirement(
  organizationId: string,
  input: { documentId: string; requirementId: string }
) {
  return tplApiRequest<{ id: string }>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/documents/link`,
    { method: "POST", body: input }
  );
}

export function getPartnerDocumentAccess(organizationId: string, documentId: string) {
  return tplApiRequest<{ document: PartnerDocument; access: { download?: PartnerPresignedUrl; publicUrl: null; executionStatus: string } }>(
    `/api/v1/partner/organizations/${encodeURIComponent(organizationId)}/documents/${encodeURIComponent(documentId)}/access`
  );
}

function cleanOptional(value: string): string | undefined {
  const trimmed = value.trim();
  return trimmed ? trimmed : undefined;
}

function buildPartnerOrganizationPayload(profile: PartnerOrganizationPreviewProfile, services: PartnerServiceDefinition[]) {
  return {
    legalName: profile.legalName.trim(),
    brandName: cleanOptional(profile.businessName),
    organizationType: profile.organizationType,
    businessMobile: cleanOptional(profile.businessMobile),
    businessEmail: cleanOptional(profile.businessEmail),
    addressLine1: cleanOptional(profile.addressLine1),
    addressLine2: cleanOptional(profile.addressLine2),
    city: cleanOptional(profile.city),
    stateRegion: cleanOptional(profile.stateRegion),
    postalCode: cleanOptional(profile.postalCode),
    country: cleanOptional(profile.country) || "India",
    services: services.map((service) => ({
      serviceCode: service.id,
      serviceLabel: service.label,
    })),
  };
}
