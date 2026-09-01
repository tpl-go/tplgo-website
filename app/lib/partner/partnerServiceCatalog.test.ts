import { expect, test } from "vitest";
import {
  filterEligiblePartnerServiceCatalog,
  filterPartnerServiceCatalog,
  findPartnerCatalogueItem,
  getAllPartnerServices,
  partnerServiceEligibleForApplication,
  partnerServiceCatalogue,
  partnerServiceCatalog,
} from "./partnerServiceCatalog";

test("service catalogue includes all required Partner domains", () => {
  const categoryTitles = partnerServiceCatalog.map((category) => category.title);

  expect(categoryTitles).toEqual([
    "Stay & Accommodation",
    "Travel Agencies, DMC & Tour Operators",
    "Tours, Packages & Journeys",
    "Yatra, Spiritual & Cultural Travel",
    "Transport & Mobility",
    "Experiences, Activities & Adventure",
    "Medical Tourism & Healthcare",
    "Wedding & Events",
    "Film, Shooting & OTT",
    "Marketplace & Local Commerce",
    "Professional & Local Services",
  ]);
});

test("service catalogue stable codes are unique and published for application selection", () => {
  const codes = partnerServiceCatalogue.map((serviceItem) => serviceItem.stableCode);
  expect(new Set(codes).size).toBe(codes.length);
  expect(partnerServiceCatalogue.every((serviceItem) => serviceItem.id.startsWith("svc_"))).toBe(true);
  expect(partnerServiceCatalogue.every((serviceItem) => serviceItem.status !== "archived")).toBe(true);
});

test("service catalogue includes required service modules", () => {
  const labels = getAllPartnerServices().map((serviceItem) => serviceItem.label);

  for (const requiredLabel of [
    "Hotel",
    "Resort",
    "Travel Agency",
    "Holiday Packages",
    "Yatra Operator / Organizer",
    "Cab / Taxi Operator",
    "Tour Guide",
    "Paragliding",
    "Hospital",
    "Diagnostic Centre",
    "Pharmacy",
    "Marketplace Seller",
    "Wedding Planner",
    "Shooting Location",
    "Permissions / Facilitation",
    "Photographer",
  ]) {
    expect(labels, `${requiredLabel} should be visible`).toContain(requiredLabel);
  }
  expect(labels).not.toContain("Request another service");
});

test("service catalogue carries future capability and verification profile metadata", () => {
  expect(findPartnerCatalogueItem("hotel")?.verificationProfileKey).toBe("accommodation_property");
  expect(findPartnerCatalogueItem("doctor-medical-professional")?.verificationProfileKey).toBe("medical_professional");
  expect(findPartnerCatalogueItem("diagnostic-centre")?.verificationProfileKey).toBe("diagnostic_facility");
  expect(findPartnerCatalogueItem("pharmacy")?.verificationProfileKey).toBe("pharmacy_business");
  expect(findPartnerCatalogueItem("individual-driver")?.verificationProfileKey).toBe("driver_transport");
  expect(findPartnerCatalogueItem("cab-taxi-operator")?.verificationProfileKey).toBe("transport_operator");
  expect(findPartnerCatalogueItem("paragliding")?.verificationProfileKey).toBe("adventure_air_individual");
  expect(findPartnerCatalogueItem("yatra-operator-organizer")?.verificationProfileKey).toBe("travel_yatra_operator");
  expect(findPartnerCatalogueItem("marketplace-seller")?.capabilities.includes("orders")).toBe(true);
});

test("search surfaces packages, yatra, healthcare, wedding, shooting, and commerce services", () => {
  assertSearchContains("hotel", ["Hotel"]);
  assertSearchContains("cab", ["Cab / Taxi Operator"]);
  assertSearchContains("package", ["Holiday Packages", "Customized Packages"]);
  assertSearchContains("yatra", ["Yatra Operator / Organizer"]);
  assertSearchContains("medical", ["Medical Tourism Facilitator", "Doctor / Medical Professional"]);
  assertSearchContains("wedding", ["Wedding Planner", "Wedding Venue"]);
  assertSearchContains("shoot", ["Shooting Location", "Production Support"]);
  assertSearchContains("food", ["Local Food Seller", "Restaurant"]);
});

test("eligibility hides non-selectable request foundation while keeping it readable", () => {
  const requestItem = findPartnerCatalogueItem("other-service-request");
  expect(requestItem).toBeTruthy();
  expect(requestItem?.applicationSelectable).toBe(false);
  expect(requestItem ? partnerServiceEligibleForApplication(requestItem, "IN", "Private Limited") : true).toBe(false);

  const eligibleLabels = filterEligiblePartnerServiceCatalog(partnerServiceCatalog, "India", "Private Limited Company")
    .flatMap((category) => category.services.map((service) => service.label));
  expect(eligibleLabels).not.toContain("Request another service");
  expect(eligibleLabels).toContain("Hotel");
});

test("search aliases keep duplicate display labels in distinct domain context", () => {
  const results = filterPartnerServiceCatalog("photographer");
  const contexts = results
    .filter((category) => category.services.some((service) => service.label === "Photographer"))
    .map((category) => category.title);

  expect(contexts).toContain("Wedding & Events");
  expect(contexts).toContain("Professional & Local Services");
});

function assertSearchContains(query: string, labels: string[]) {
  const resultLabels = filterPartnerServiceCatalog(query).flatMap((category) =>
    category.services.map((serviceItem) => serviceItem.label)
  );
  for (const label of labels) {
    expect(resultLabels, `${query} should surface ${label}`).toContain(label);
  }
}
