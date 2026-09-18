import type { PartnerApplicationStepKey, PartnerOrganizationBundle } from "./partnerApiClient";

export type SavedReviewRow = { label: string; value: string };
const record = (value: unknown): Record<string, unknown> => value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
const text = (value: unknown): string => typeof value === "string" ? value.trim() : typeof value === "number" && Number.isFinite(value) ? String(value) : "";
const label = (value: unknown): string => text(value).replace(/_/g, " ").toLowerCase().replace(/^./, (first) => first.toUpperCase());
const row = (name: string, value: unknown): SavedReviewRow => ({ label: name, value: text(value) || "Not provided" });
const joined = (values: unknown[]) => values.map(text).filter(Boolean).join(", ");
function masked(value: unknown, channel: "mobile" | "email" | "identifier") {
  const raw = text(value);
  if (!raw) return "";
  if (channel === "email") {
    const at = raw.lastIndexOf("@");
    return at > 0 ? `${raw[0]}••••${raw.slice(at)}` : "Provided";
  }
  const clean = channel === "mobile" ? raw.replace(/\D/g, "") : raw;
  return clean.length > 4 ? `•••• ${clean.slice(-4)}` : "Provided";
}
function address(value: Record<string, unknown>) {
  return joined([value.addressLine1, value.addressLine2, value.landmark, value.city, value.stateRegion, value.postalCode, value.country || value.countryCode]);
}

// Display only allowlisted saved fields. Never serialize metadata, document URLs,
// identity IDs, provider references or unmasked financial identifiers.
export function savedApplicationReviewRows(bundle: PartnerOrganizationBundle, step: PartnerApplicationStepKey): SavedReviewRow[] {
  const org = bundle.organization;
  const application = record(record(org.metadata).application);
  const contact = record(application.accountContact);
  const business = record(application.businessIdentity);
  const location = record(application.businessLocation);
  if (step === "account_contact") {
    return [row("Responsible person", contact.contactPersonFullName), row("Designation", contact.designation), ...(text(contact.roleOther) ? [row("Other designation", contact.roleOther)] : []), ...(["mobile", "email"] as const).map((channel) => {
      const target = text(channel === "mobile" ? contact.businessMobile ?? org.businessMobile : contact.businessEmail ?? org.businessEmail);
      const matches = bundle.contacts.filter((item) => item.channel === channel && (item.value === target || item.normalizedValue === target));
      const status = matches.length === 1 ? label(matches[0].verificationStatus) : "Verification not confirmed";
      return row(`Business ${channel}`, target ? `${masked(target, channel)} · ${status}` : "");
    }), row("Authorized representative", typeof contact.authorizedRepresentative === "boolean" ? contact.authorizedRepresentative ? "Confirmed" : "Not confirmed" : "")];
  }
  if (step === "business_identity") return [
    row("Legal name", business.legalName ?? org.legalName), row("Brand name", business.brandName ?? org.brandName), row("Business type", label(business.organizationType ?? org.organizationType)),
    ...(text(business.organizationTypeOther) ? [row("Other business type", business.organizationTypeOther)] : []), row("Description", business.description), row("Year established", business.yearEstablished),
    row("Registration type", label(business.registrationType)), row("Registration number", masked(business.registrationNumber, "identifier")), row("Registration date", business.registrationDate),
  ];
  if (step === "business_location") {
    const primary = record(location.primaryLocation);
    const areas = Array.isArray(location.serviceAreas) ? location.serviceAreas.map(record) : [];
    return [row("Primary address", address(Object.keys(primary).length ? primary : org)), row("Operating address", location.sameAsOperating === true ? "Same as primary address" : address(record(location.operatingLocation))), ...areas.map((area, index) => row(`Service area ${index + 1}`, joined([label(area.coverageLevel), area.localArea, area.cityDestination, area.stateRegion, area.country || area.countryCode])))];
  }
  if (step === "services") {
    const scopes = bundle.serviceScopes.filter((scope) => scope.status !== "disabled");
    return scopes.length ? scopes.map((scope, index) => row(`Service ${index + 1}`, scope.serviceLabel)) : [row("Selected services", "None saved")];
  }
  if (step === "verification_compliance") return bundle.requirements.length ? bundle.requirements.map((requirement) => {
    const linked = (bundle.links ?? []).filter((link) => link.status === "active" && link.requirementId === requirement.id && bundle.documents.some((doc) => doc.id === link.documentId));
    const stage = requirement.metadata?.requirementStage;
    const timing = stage === "BEFORE_ACTIVATION" ? "Before activation" : stage === "IF_APPLICABLE" ? "If applicable" : stage === "REQUIRED_NOW" ? "Required now" : "";
    return row(requirement.title, [label(requirement.status), timing, `${linked.length} linked document${linked.length === 1 ? "" : "s"}`].filter(Boolean).join(" · "));
  }) : [row("Document requirements", "None returned")];
  if (step === "payout_tax") {
    const payout = bundle.payoutProfile, tax = bundle.taxProfile;
    return [row("Beneficiary", payout?.beneficiaryLegalName), row("Beneficiary type", label(payout?.beneficiaryType)), row("Payout country", payout?.payoutCountry), row("Currency", payout?.settlementCurrency), row("Bank", payout?.bankName), row("Bank country", payout?.bankCountry), row("Account", masked(payout?.bankAccountMasked, "identifier")), row("Bank review", label(payout?.bankVerificationStatus)), row("Tax legal name", tax?.legalTaxName), row("Tax residency", tax?.taxResidencyCountries.join(", ")), row("Taxpayer type", label(tax?.taxpayerType)), row("Tax identifier", masked(tax?.taxIdentifierMasked ?? tax?.indiaPanMasked ?? tax?.foreignTaxIdentifierMasked, "identifier")), row("GST identifier", masked(tax?.indiaGstinMasked, "identifier")), row("Tax review", label(tax?.manualReviewStatus))];
  }
  const agreement = bundle.agreement;
  return [row("Signer", agreement?.signerName), row("Role or designation", agreement?.signerRole), row("Authority basis", agreement?.signerAuthorityBasis), row("Signing method", agreement?.signingMethod === "authenticated_acceptance" ? "Authenticated electronic acceptance" : agreement?.signingMethod === "manual_signed_document" ? "Signed document" : agreement?.signingMethod === "esign_provider" ? "Electronic signing provider" : ""), row("Agreement version", agreement?.templateVersion), row("Agreement status", label(agreement?.status)), row("TPL review", label(agreement?.tplReviewStatus))];
}
