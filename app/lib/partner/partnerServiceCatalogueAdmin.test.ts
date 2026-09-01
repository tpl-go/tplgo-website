import { expect, test } from "vitest";
import {
  buildPartnerServiceCatalogueAdminView,
  filterPartnerCatalogueAdminServices,
  validateDraftCatalogueItem,
} from "./partnerServiceCatalogueAdmin";

test("admin catalogue view exposes all service domains and requested-service queue", () => {
  const view = buildPartnerServiceCatalogueAdminView([
    "partner_service_catalogue.read",
    "partner_service_catalogue.manage",
    "partner_service_catalogue.publish",
  ]);

  expect(view.domains.map((domain) => domain.title)).toContain("Stay & Accommodation");
  expect(view.domains.map((domain) => domain.title)).toContain("Other / Emerging");
  expect(view.requestedServices.length).toBeGreaterThan(0);
  expect(view.workflow.canManage).toBe(true);
  expect(view.workflow.canPublish).toBe(true);
});

test("admin filters cover hierarchy, state, country, entity, selectable, and verification profile", () => {
  const view = buildPartnerServiceCatalogueAdminView();
  const medical = filterPartnerCatalogueAdminServices(view.services, {
    query: "doctor",
    domain: "medical-tourism-healthcare",
    status: "active",
    published: "true",
    country: "IN",
    entity: "individual",
    selectable: "true",
    verificationProfile: "medical_professional",
  });

  expect(medical.map((service) => service.stableCode)).toContain("doctor-medical-professional");
  expect(medical.every((service) => service.domain === "medical-tourism-healthcare")).toBe(true);
});

test("admin draft validation blocks duplicate or unstable service identity", () => {
  expect(validateDraftCatalogueItem({
    stableCode: "hotel",
    name: "Hotel renamed",
    domain: "stay-accommodation",
    displayOrder: 1,
  })).toContain("Stable code already exists.");

  expect(validateDraftCatalogueItem({
    stableCode: "New Service",
    name: "",
    domain: "stay-accommodation",
    displayOrder: 0,
  }).length).toBeGreaterThan(1);
});
