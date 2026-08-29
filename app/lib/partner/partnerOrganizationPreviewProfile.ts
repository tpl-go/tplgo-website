export const PARTNER_ORGANIZATION_PREVIEW_PROFILE_STORAGE_KEY = "tpl.partnerPreview.organizationProfile.v1";

export const organizationTypeOptions = [
  "Individual Professional",
  "Individual / Proprietor",
  "Partnership",
  "LLP",
  "Private Limited",
  "Public Limited",
  "Trust / Society",
  "Other",
] as const;

export type PartnerOrganizationType = (typeof organizationTypeOptions)[number];

export type PartnerOrganizationPreviewProfile = {
  businessName: string;
  legalName: string;
  organizationType: PartnerOrganizationType | "";
  description: string;
  contactName: string;
  contactRole: string;
  businessMobile: string;
  businessEmail: string;
  businessMobileVerificationStatus: "verification-required" | "verified" | "unavailable";
  businessMobileVerifiedValue: string;
  businessEmailVerificationStatus: "verification-required" | "verified" | "unavailable";
  businessEmailVerifiedValue: string;
  sameAsTplAccount: boolean;
  addressLine1: string;
  addressLine2: string;
  city: string;
  stateRegion: string;
  postalCode: string;
  country: string;
  pan: string;
  gstin: string;
  gstNotApplicable: boolean;
  registrationNumber: string;
  yearEstablished: string;
  website: string;
  socialPage: string;
  publicDescription: string;
  operatingLocations: string[];
  logoPreviewName: string;
  savedForPreview: boolean;
};

export type PartnerOrganizationPreviewStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export type PartnerOrganizationProfileErrors = Partial<Record<keyof PartnerOrganizationPreviewProfile, string>>;

export const emptyPartnerOrganizationPreviewProfile: PartnerOrganizationPreviewProfile = {
  businessName: "",
  legalName: "",
  organizationType: "",
  description: "",
  contactName: "",
  contactRole: "",
  businessMobile: "",
  businessEmail: "",
  businessMobileVerificationStatus: "verification-required",
  businessMobileVerifiedValue: "",
  businessEmailVerificationStatus: "unavailable",
  businessEmailVerifiedValue: "",
  sameAsTplAccount: false,
  addressLine1: "",
  addressLine2: "",
  city: "",
  stateRegion: "",
  postalCode: "",
  country: "India",
  pan: "",
  gstin: "",
  gstNotApplicable: false,
  registrationNumber: "",
  yearEstablished: "",
  website: "",
  socialPage: "",
  publicDescription: "",
  operatingLocations: [],
  logoPreviewName: "",
  savedForPreview: false,
};

export const samplePartnerOrganizationPreviewProfile: PartnerOrganizationPreviewProfile = {
  ...emptyPartnerOrganizationPreviewProfile,
  businessName: "Himalayan Adventures",
  legalName: "Himalayan Adventures & Hospitality Pvt Ltd",
  organizationType: "Private Limited",
  description: "Travel, stay, and local experience operator serving leisure and family travellers.",
  contactName: "Aarav Sharma",
  contactRole: "Operations Director",
  businessMobile: "+919876543210",
  businessEmail: "partner@example.com",
  addressLine1: "12 Residency Road",
  city: "Srinagar",
  stateRegion: "Jammu and Kashmir",
  postalCode: "190001",
  country: "India",
  pan: "ABCDE1234F",
  gstin: "01ABCDE1234F1Z5",
  registrationNumber: "U55101JK2024PTC000001",
  yearEstablished: "2024",
  website: "https://example.com",
  socialPage: "https://instagram.com/example-partner",
  publicDescription: "A local travel business offering stays, transfers, and curated activities.",
  operatingLocations: ["Srinagar", "Gulmarg", "Pahalgam"],
  logoPreviewName: "himalayan-hospitality-logo.png",
};

export const sampleIndividualGuidePreviewProfile: PartnerOrganizationPreviewProfile = {
  ...emptyPartnerOrganizationPreviewProfile,
  businessName: "",
  legalName: "Arjun Mehta",
  organizationType: "Individual Professional",
  description: "Fictional independent guide profile for Preview QA.",
  contactName: "Arjun Mehta",
  contactRole: "Guide",
  businessMobile: "+919900001111",
  businessEmail: "arjun.guide@example.invalid",
  addressLine1: "Sample House 7",
  city: "Jaipur",
  stateRegion: "Rajasthan",
  country: "India",
  operatingLocations: ["Jaipur", "Amer"],
};

export function readPartnerOrganizationPreviewProfile(
  storage: PartnerOrganizationPreviewStorage
): PartnerOrganizationPreviewProfile {
  const rawValue = storage.getItem(PARTNER_ORGANIZATION_PREVIEW_PROFILE_STORAGE_KEY);
  if (!rawValue) return emptyPartnerOrganizationPreviewProfile;

  try {
    const parsed = JSON.parse(rawValue) as Partial<PartnerOrganizationPreviewProfile>;
    return normalizePartnerOrganizationPreviewProfile(parsed);
  } catch {
    return emptyPartnerOrganizationPreviewProfile;
  }
}

export function writePartnerOrganizationPreviewProfile(
  storage: PartnerOrganizationPreviewStorage,
  profile: PartnerOrganizationPreviewProfile
): void {
  storage.setItem(PARTNER_ORGANIZATION_PREVIEW_PROFILE_STORAGE_KEY, JSON.stringify(profile));
}

export function resetPartnerOrganizationPreviewProfile(storage: PartnerOrganizationPreviewStorage): void {
  storage.removeItem(PARTNER_ORGANIZATION_PREVIEW_PROFILE_STORAGE_KEY);
}

export function addOperatingLocation(
  locations: string[],
  location: string
): string[] {
  const normalizedLocation = location.trim();
  if (!normalizedLocation) return locations;
  if (locations.some((item) => item.toLowerCase() === normalizedLocation.toLowerCase())) return locations;
  return [...locations, normalizedLocation];
}

export function removeOperatingLocation(locations: string[], location: string): string[] {
  return locations.filter((item) => item !== location);
}

export function calculateBusinessProfileCompletion(profile: PartnerOrganizationPreviewProfile): number {
  const requiredValues = [
    profile.legalName,
    profile.organizationType,
    profile.contactName,
    profile.businessMobile,
    profile.businessEmail,
    profile.addressLine1,
    profile.city,
    profile.stateRegion,
    profile.country,
  ];
  const completedCount = requiredValues.filter((value) => value.trim().length > 0).length;
  return Math.round((completedCount / requiredValues.length) * 100);
}

export function validatePartnerOrganizationProfile(
  profile: PartnerOrganizationPreviewProfile
): PartnerOrganizationProfileErrors {
  const errors: PartnerOrganizationProfileErrors = {};

  if (!profile.legalName.trim()) errors.legalName = "Enter legal name.";
  if (!profile.organizationType) errors.organizationType = "Select organization type.";
  if (!profile.contactName.trim()) errors.contactName = "Enter contact person name.";
  if (!isValidBusinessMobile(profile.businessMobile)) errors.businessMobile = "Enter a valid mobile number.";
  if (!isValidBusinessEmail(profile.businessEmail)) errors.businessEmail = "Enter a valid business email.";
  if (!profile.addressLine1.trim()) errors.addressLine1 = "Enter address line 1.";
  if (!profile.city.trim()) errors.city = "Enter city.";
  if (!profile.stateRegion.trim()) errors.stateRegion = "Enter state or region.";
  if (!profile.country.trim()) errors.country = "Enter country.";
  if (profile.pan.trim() && !isValidPanFormat(profile.pan)) errors.pan = "PAN format appears invalid.";
  if (!profile.gstNotApplicable && profile.gstin.trim() && !isValidGstinFormat(profile.gstin)) {
    errors.gstin = "GSTIN format appears invalid.";
  }
  if (profile.yearEstablished.trim() && !isValidYearEstablished(profile.yearEstablished)) {
    errors.yearEstablished = "Enter a valid year.";
  }

  return errors;
}

export function isRegistrationNumberRecommended(organizationType: PartnerOrganizationType | ""): boolean {
  return organizationType === "LLP" || organizationType === "Private Limited" || organizationType === "Public Limited";
}

export function getDisplayNameForProfile(profile: PartnerOrganizationPreviewProfile): string {
  return profile.businessName.trim() || profile.legalName.trim();
}

export function applyBusinessContactChange<K extends "businessMobile" | "businessEmail">(
  profile: PartnerOrganizationPreviewProfile,
  field: K,
  value: string
): PartnerOrganizationPreviewProfile {
  if (field === "businessMobile") {
    const unchanged = profile.businessMobile === value;
    return {
      ...profile,
      businessMobile: value,
      businessMobileVerificationStatus: unchanged
        ? profile.businessMobileVerificationStatus
        : "verification-required",
      businessMobileVerifiedValue: unchanged ? profile.businessMobileVerifiedValue : "",
      savedForPreview: false,
    };
  }

  const unchanged = profile.businessEmail === value;
  return {
    ...profile,
    businessEmail: value,
    businessEmailVerificationStatus: unchanged ? profile.businessEmailVerificationStatus : "unavailable",
    businessEmailVerifiedValue: unchanged ? profile.businessEmailVerifiedValue : "",
    savedForPreview: false,
  };
}

export function markBusinessMobileVerifiedForPreview(
  profile: PartnerOrganizationPreviewProfile
): PartnerOrganizationPreviewProfile {
  return {
    ...profile,
    businessMobileVerificationStatus: "verified",
    businessMobileVerifiedValue: profile.businessMobile,
    savedForPreview: false,
  };
}

export function isValidBusinessEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

export function isValidBusinessMobile(value: string): boolean {
  return /^\+?[0-9][0-9\s-]{7,17}$/.test(value.trim());
}

export function isValidPanFormat(value: string): boolean {
  return /^[A-Z]{5}[0-9]{4}[A-Z]$/i.test(value.trim());
}

export function isValidGstinFormat(value: string): boolean {
  return /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/i.test(value.trim());
}

function isValidYearEstablished(value: string): boolean {
  const year = Number(value);
  const currentYear = new Date().getFullYear();
  return Number.isInteger(year) && year >= 1800 && year <= currentYear;
}

function normalizePartnerOrganizationPreviewProfile(
  parsed: Partial<PartnerOrganizationPreviewProfile>
): PartnerOrganizationPreviewProfile {
  const organizationType = organizationTypeOptions.includes(parsed.organizationType as PartnerOrganizationType)
    ? (parsed.organizationType as PartnerOrganizationType)
    : "";

  return {
    ...emptyPartnerOrganizationPreviewProfile,
    ...parsed,
    organizationType,
    operatingLocations: Array.isArray(parsed.operatingLocations)
      ? parsed.operatingLocations.filter((item): item is string => typeof item === "string")
      : [],
    savedForPreview: Boolean(parsed.savedForPreview),
    sameAsTplAccount: Boolean(parsed.sameAsTplAccount),
    gstNotApplicable: Boolean(parsed.gstNotApplicable),
    businessMobileVerificationStatus: parseContactVerificationStatus(parsed.businessMobileVerificationStatus, "verification-required"),
    businessMobileVerifiedValue: typeof parsed.businessMobileVerifiedValue === "string" ? parsed.businessMobileVerifiedValue : "",
    businessEmailVerificationStatus: parseContactVerificationStatus(parsed.businessEmailVerificationStatus, "unavailable"),
    businessEmailVerifiedValue: typeof parsed.businessEmailVerifiedValue === "string" ? parsed.businessEmailVerifiedValue : "",
  };
}

function parseContactVerificationStatus(
  value: unknown,
  fallback: PartnerOrganizationPreviewProfile["businessMobileVerificationStatus"]
): PartnerOrganizationPreviewProfile["businessMobileVerificationStatus"] {
  if (value === "verification-required" || value === "verified" || value === "unavailable") return value;
  return fallback;
}
