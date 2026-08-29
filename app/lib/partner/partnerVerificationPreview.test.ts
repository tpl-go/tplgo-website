import assert from "node:assert/strict";
import test from "node:test";
import {
  buildPartnerVerificationRequirements,
  calculateVerificationReadiness,
  emptyPartnerVerificationPreviewState,
  fictionalPreviewDocuments,
  findReusableDocuments,
  linkDocumentToRequirement,
} from "./partnerVerificationPreview";
import {
  sampleIndividualGuidePreviewProfile,
  samplePartnerOrganizationPreviewProfile,
} from "./partnerOrganizationPreviewProfile";
import { selectedPartnerServices } from "./partnerPreviewSelection";

test("company multi-service requirements attach to correct entity owners", () => {
  const services = selectedPartnerServices(["hotels-resorts", "cab-taxi", "activities"]);
  const requirements = buildPartnerVerificationRequirements(samplePartnerOrganizationPreviewProfile, services, fictionalPreviewDocuments);

  assert.equal(requirements.find((item) => item.title === "Company PAN")?.ownerType, "ORGANIZATION");
  assert.equal(requirements.find((item) => item.title === "Fire & Safety Compliance")?.ownerType, "PROPERTY");
  assert.equal(requirements.find((item) => item.title === "Driver Licence")?.ownerType, "DRIVER");
  assert.equal(requirements.find((item) => item.title === "Vehicle Registration")?.ownerType, "VEHICLE");
  assert.equal(requirements.find((item) => item.title === "Scuba Professional Certification")?.ownerType, "PROFESSIONAL");
});

test("individual professional avoids corporate-only registration requirements", () => {
  const services = selectedPartnerServices(["guides"]);
  const requirements = buildPartnerVerificationRequirements(sampleIndividualGuidePreviewProfile, services, []);
  const titles = requirements.map((requirement) => requirement.title);

  assert.equal(titles.includes("Company PAN"), false);
  assert.equal(titles.includes("Company Registration"), false);
  assert.equal(titles.includes("Guide Licence"), true);
  assert.equal(requirements.find((item) => item.title === "Guide Licence")?.ownerType, "PROFESSIONAL");
});

test("duplicate document reuse is offered before upload and requires explicit linking", () => {
  const services = selectedPartnerServices(["activities"]);
  const requirements = buildPartnerVerificationRequirements(sampleIndividualGuidePreviewProfile, services, fictionalPreviewDocuments);
  const professionalRequirement = requirements.find((requirement) => requirement.title === "Scuba Professional Certification");

  assert.ok(professionalRequirement);
  const reusable = findReusableDocuments(professionalRequirement, [
    {
      ...fictionalPreviewDocuments[0],
      id: "doc-existing-professional",
      documentType: "Professional licence",
      linkedRequirementIds: [],
    },
  ]);

  assert.equal(reusable.length, 1);
  const linked = linkDocumentToRequirement(
    { ...emptyPartnerVerificationPreviewState, documents: reusable },
    "doc-existing-professional",
    professionalRequirement.id
  );
  assert.deepEqual(linked.documents[0].linkedRequirementIds, [professionalRequirement.id]);
});

test("mandatory submitted requirements are not treated as verified readiness", () => {
  const services = selectedPartnerServices(["cab-taxi"]);
  const requirements = buildPartnerVerificationRequirements(samplePartnerOrganizationPreviewProfile, services, [
    {
      id: "doc-driver-under-review",
      filename: "FICTIONAL-DRIVER-LICENCE.pdf",
      documentType: "Driver licence",
      uploadDate: "2026-08-26",
      status: "Under review",
      safePreviewAvailable: false,
      fictional: true,
      linkedRequirementIds: ["cab-taxi-driver-licence"],
    },
  ]);
  const readiness = calculateVerificationReadiness(samplePartnerOrganizationPreviewProfile, services, requirements, []);

  assert.equal(requirements.find((item) => item.id === "cab-taxi-driver-licence")?.status, "Under review");
  assert.equal(readiness.blockingRequirements.some((item) => item.id === "cab-taxi-driver-licence"), true);
});
