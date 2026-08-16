import assert from "node:assert/strict";
import test from "node:test";
import {
  addOperatingLocation,
  calculateBusinessProfileCompletion,
  emptyPartnerOrganizationPreviewProfile,
  isRegistrationNumberRecommended,
  readPartnerOrganizationPreviewProfile,
  removeOperatingLocation,
  samplePartnerOrganizationPreviewProfile,
  validatePartnerOrganizationProfile,
  writePartnerOrganizationPreviewProfile,
  type PartnerOrganizationPreviewStorage,
} from "./partnerOrganizationPreviewProfile";

function createStorage(): PartnerOrganizationPreviewStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => values.delete(key),
  };
}

test("organization profile persistence stores and restores preview state", () => {
  const storage = createStorage();
  writePartnerOrganizationPreviewProfile(storage, {
    ...samplePartnerOrganizationPreviewProfile,
    savedForPreview: true,
  });

  const restored = readPartnerOrganizationPreviewProfile(storage);

  assert.equal(restored.businessName, "Himalayan Hospitality");
  assert.equal(restored.organizationType, "Private Limited");
  assert.equal(restored.savedForPreview, true);
  assert.deepEqual(restored.operatingLocations, ["Srinagar", "Gulmarg", "Pahalgam"]);
});

test("sample business profile is valid and mostly complete", () => {
  const errors = validatePartnerOrganizationProfile(samplePartnerOrganizationPreviewProfile);
  const completion = calculateBusinessProfileCompletion(samplePartnerOrganizationPreviewProfile);

  assert.deepEqual(errors, {});
  assert.equal(completion, 100);
});

test("clear form resets required profile values", () => {
  const completion = calculateBusinessProfileCompletion(emptyPartnerOrganizationPreviewProfile);
  const errors = validatePartnerOrganizationProfile(emptyPartnerOrganizationPreviewProfile);

  assert.equal(completion, 11);
  assert.equal(errors.businessName, "Enter your business name.");
  assert.equal(errors.organizationType, "Select organization type.");
  assert.equal(errors.businessEmail, "Enter a valid business email.");
});

test("required field and email validation returns partner-facing messages", () => {
  const profile = {
    ...emptyPartnerOrganizationPreviewProfile,
    businessName: "TPL Test Partner",
    organizationType: "Partnership" as const,
    contactName: "Test User",
    businessMobile: "123",
    businessEmail: "not-an-email",
    addressLine1: "Main Road",
    city: "Jaipur",
    stateRegion: "Rajasthan",
  };

  const errors = validatePartnerOrganizationProfile(profile);

  assert.equal(errors.businessMobile, "Enter a valid mobile number.");
  assert.equal(errors.businessEmail, "Enter a valid business email.");
});

test("registration number recommendation follows organization type", () => {
  assert.equal(isRegistrationNumberRecommended("Individual / Proprietor"), false);
  assert.equal(isRegistrationNumberRecommended("Private Limited"), true);
  assert.equal(isRegistrationNumberRecommended("LLP"), true);
});

test("operating locations can be added, de-duplicated, and removed", () => {
  const locations = addOperatingLocation(["Srinagar"], "Gulmarg");
  const duplicate = addOperatingLocation(locations, "srinagar");
  const removed = removeOperatingLocation(duplicate, "Gulmarg");

  assert.deepEqual(locations, ["Srinagar", "Gulmarg"]);
  assert.deepEqual(duplicate, ["Srinagar", "Gulmarg"]);
  assert.deepEqual(removed, ["Srinagar"]);
});
