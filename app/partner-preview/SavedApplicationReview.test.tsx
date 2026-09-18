import { renderToStaticMarkup } from "react-dom/server";
import { expect, test } from "vitest";
import { buildPartnerQaPreviewBundle } from "../lib/partner/partnerQaPreviewFixtures";
import { savedApplicationReviewRows } from "../lib/partner/partnerSavedApplicationReview";
import { SavedApplicationReview } from "./SavedApplicationReview";

function fixture() {
  const bundle = buildPartnerQaPreviewBundle("ready")!;
  bundle.organization.metadata = { application: {
    accountContact: { contactPersonFullName: "Synthetic Reviewer", designation: "Owner", businessMobile: "+12025550123", businessEmail: "qa@example.test", authorizedRepresentative: true },
    businessIdentity: { legalName: "QA Legal LLC", brandName: "QA Brand", description: "Saved description", registrationNumber: "TEST-REG-987654", registrationDate: "2024-02-29" },
    businessLocation: { primaryLocation: { country: "Test country", city: "Test city", addressLine1: "Synthetic address" }, sameAsOperating: true, serviceAreas: [{ country: "Test country", coverageLevel: "national" }] },
    secretUnknown: "NEVER_RENDER_METADATA",
  } };
  bundle.contacts = [{ id: "synthetic-contact", channel: "email", value: "qa@example.test", verificationStatus: "verified", isPrimary: true }];
  return bundle;
}

test("renders canonical saved fields without using editable form state", () => {
  const bundle = fixture();
  const html = renderToStaticMarkup(<SavedApplicationReview bundle={bundle} organizationId={bundle.organization.id} step="business_identity" />);
  expect(html).toContain("View saved details");
  expect(html).toContain("QA Legal LLC");
  expect(html).toContain("Saved description");
  expect(html).toContain("2024-02-29");
  expect(html).not.toContain("TEST-REG-987654");
  expect(html).not.toContain("NEVER_RENDER_METADATA");
  expect(html).not.toContain("<input");
  expect(html).toContain("<details");
  expect(html).toContain("<summary");
});

test("missing or different organization cannot expose a stale bundle", () => {
  const bundle = fixture();
  for (const owner of [null, "other-synthetic-organization"]) {
    const html = renderToStaticMarkup(<SavedApplicationReview bundle={bundle} organizationId={owner} step="business_identity" />);
    expect(html).toContain("Saved details are unavailable");
    expect(html).not.toContain("QA Legal LLC");
  }
  expect(renderToStaticMarkup(<SavedApplicationReview bundle={null} organizationId="synthetic" step="account_contact" />)).toContain("unavailable");
});

test("contacts are masked and verification belongs to the exact saved contact", () => {
  const bundle = fixture();
  const rows = savedApplicationReviewRows(bundle, "account_contact");
  expect(rows.find(item => item.label === "Business email")?.value).toBe("q••••@example.test · Verified");
  expect(rows.find(item => item.label === "Business mobile")?.value).toContain("Verification not confirmed");
  expect(JSON.stringify(rows)).not.toContain("+12025550123");
  bundle.contacts[0].value = "different@example.test";
  expect(savedApplicationReviewRows(bundle, "account_contact").find(item => item.label === "Business email")?.value).toContain("Verification not confirmed");
});

test("locations and selected services use only saved values", () => {
  const bundle = fixture();
  expect(savedApplicationReviewRows(bundle, "business_location")).toContainEqual({ label: "Operating address", value: "Same as primary address" });
  bundle.serviceScopes = [{ id: "scope-one", serviceCode: "QA", serviceLabel: "Saved service", status: "active" }, { id: "scope-two", serviceCode: "DISABLED", serviceLabel: "Disabled service", status: "disabled" }];
  expect(savedApplicationReviewRows(bundle, "services")).toEqual([{ label: "Service 1", value: "Saved service" }]);
  bundle.organization.metadata = {};
  bundle.organization.country = "";
  bundle.organization.addressLine1 = "";
  bundle.organization.city = "";
  bundle.organization.stateRegion = "";
  bundle.organization.postalCode = "";
  expect(JSON.stringify(savedApplicationReviewRows(bundle, "business_location"))).not.toContain("India");
});

test("documents show actual requirement/link status without raw file identifiers or URLs", () => {
  const bundle = fixture();
  bundle.requirements = [{ id: "requirement-secret-id", title: "Synthetic evidence", requirementCode: "TEST", ownerEntityType: "organization", description: "", priority: "MANDATORY", status: "SUBMITTED", metadata: { requirementStage: "REQUIRED_NOW" } }];
  bundle.documents = [{ id: "doc-secret-id", documentCategory: "TEST", documentType: "TEST", originalFilename: "PRIVATE_FILENAME.pdf", mimeType: "application/pdf", sizeBytes: 100, status: "SUBMITTED" }];
  bundle.links = [{ id: "link-secret-id", organizationId: bundle.organization.id, requirementId: "requirement-secret-id", documentId: "doc-secret-id", status: "active" }];
  const rows = savedApplicationReviewRows(bundle, "verification_compliance");
  expect(rows[0].value).toBe("Submitted · Required now · 1 linked document");
  expect(JSON.stringify(rows)).not.toMatch(/secret-id|PRIVATE_FILENAME/);
  bundle.links[0].status = "revoked";
  expect(savedApplicationReviewRows(bundle, "verification_compliance")[0].value).toContain("0 linked documents");
});

test("financial identifiers stay masked and arbitrary nested metadata is not rendered", () => {
  const bundle = fixture();
  bundle.payoutProfile = { id: "payout-secret", organizationId: bundle.organization.id, payoutCountry: "US", settlementCurrency: "USD", beneficiaryType: "business", beneficiaryLegalName: "Synthetic beneficiary", bankCountry: "US", bankAccountMasked: "123456789012", bankVerificationStatus: "SUBMITTED", manualReviewStatus: "SUBMITTED", routingInfo: { secret: "PRIVATE_ROUTING" } };
  const rows = savedApplicationReviewRows(bundle, "payout_tax");
  expect(rows).toContainEqual({ label: "Account", value: "•••• 9012" });
  expect(JSON.stringify(rows)).not.toMatch(/123456789012|PRIVATE_ROUTING|payout-secret/);
});

test("agreement state is reported without implying Admin approval or changing acceptance", () => {
  const bundle = fixture();
  bundle.agreement = { id: "agreement-secret", organizationId: bundle.organization.id, country: "US", legalEntityType: "organization", agreementType: "partner", templateVersion: 3, snapshotHash: "PRIVATE_HASH", serviceScheduleRefs: [], signingMethod: "authenticated_acceptance", signerName: "Synthetic Signer", status: "PARTNER_ACCEPTED", tplReviewStatus: "UNDER_REVIEW", currentStage: "PARTNER_ACCEPTED", version: 1 };
  const before = JSON.stringify(bundle);
  const rows = savedApplicationReviewRows(bundle, "partner_agreement");
  expect(rows).toContainEqual({ label: "Agreement status", value: "Partner accepted" });
  expect(rows).toContainEqual({ label: "TPL review", value: "Under review" });
  expect(JSON.stringify(rows)).not.toMatch(/PRIVATE_HASH|agreement-secret/);
  expect(JSON.stringify(bundle)).toBe(before);
});

test("customer text is escaped and long text can wrap without raw HTML", () => {
  const bundle = fixture();
  bundle.organization.legalName = "<script>unsafe()</script>";
  bundle.organization.metadata = {};
  const html = renderToStaticMarkup(<SavedApplicationReview bundle={bundle} organizationId={bundle.organization.id} step="business_identity" />);
  expect(html).not.toContain("<script>");
  expect(html).toContain("&lt;script&gt;");
  expect(html).toContain("overflow-wrap:anywhere");
});
