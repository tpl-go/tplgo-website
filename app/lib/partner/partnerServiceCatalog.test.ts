import { expect, test } from "vitest";
import {
  filterEligiblePartnerServiceCatalog,
  filterPartnerServiceCatalog,
  findPartnerCatalogueItem,
  getAllPartnerServices,
  getEligiblePartnerServiceDomainOptions,
  getEligiblePartnerServicesForDomain,
  groupPartnerServiceCodesByDomain,
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
    "Travel Documentation & Insurance",
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
    "Visa Assistance",
    "Travel Insurance Provider",
    "International Travel Medical Insurance",
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
  expect(findPartnerCatalogueItem("visa-assistance")?.verificationProfileKey).toBe("travel_documentation_provider");
  expect(findPartnerCatalogueItem("travel-insurance-distributor-agent")?.verificationProfileKey).toBe("insurance_intermediary");
  expect(findPartnerCatalogueItem("insurance-claim-assistance")?.capabilities).toContain("claim_assistance_request");
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
  assertSearchContains("visa", ["Visa Assistance", "Tourist Visa Assistance"]);
  assertSearchContains("insurance", ["Travel Insurance Provider", "Medical Insurance Provider"]);
  assertSearchContains("claim assistance", ["Insurance Claim Assistance"]);
});

test("travel documentation and insurance hierarchy uses non-selectable category parents", () => {
  const domain = partnerServiceCatalog.find((category) => category.id === "travel-documentation-insurance");
  expect(domain?.title).toBe("Travel Documentation & Insurance");
  expect(domain?.services.map((service) => service.label)).toContain("Visa Assistance");
  expect(domain?.services.map((service) => service.label)).not.toContain("Visa & Travel Documentation");

  for (const code of ["visa-travel-documentation", "travel-insurance", "medical-travel-health-insurance"]) {
    expect(findPartnerCatalogueItem(code)).toMatchObject({
      domain: "travel-documentation-insurance",
      applicationSelectable: false,
      serviceApprovalRequired: true,
    });
  }

  expect(findPartnerCatalogueItem("medical-tourism-insurance-assistance")).toMatchObject({
    parentCode: "medical-travel-health-insurance",
    verificationProfileKey: "health_insurance_business",
    serviceApprovalRequired: true,
  });
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

test("eligible domain dropdown options can be searched and exclude already-open domains", () => {
  const searched = getEligiblePartnerServiceDomainOptions("IN", "Private Limited Company", { query: "wedding" });
  expect(searched.map((domain) => domain.title)).toEqual(["Wedding & Events"]);

  const remaining = getEligiblePartnerServiceDomainOptions("IN", "Private Limited Company", {
    excludeDomainIds: ["wedding-events", "transport-mobility"],
  }).map((domain) => domain.title);

  expect(remaining).not.toContain("Wedding & Events");
  expect(remaining).not.toContain("Transport & Mobility");
  expect(remaining).toContain("Stay & Accommodation");
  expect(remaining).toContain("Travel Documentation & Insurance");
});

test("selected domain service options are scoped to that domain and searchable by alias", () => {
  const stayServices = getEligiblePartnerServicesForDomain("stay-accommodation", "IN", "Private Limited Company");
  const stayLabels = stayServices.map((serviceItem) => serviceItem.name);

  expect(stayLabels).toContain("Hotel");
  expect(stayLabels).toContain("Homestay");
  expect(stayLabels).not.toContain("Cab / Taxi Operator");

  const cabSearch = getEligiblePartnerServicesForDomain("transport-mobility", "IN", "Private Limited Company", "taxi");
  expect(cabSearch.map((serviceItem) => serviceItem.name)).toContain("Cab / Taxi Operator");
});

test("selected services summary grouping deduplicates services by stable code and ignores legacy codes", () => {
  const groups = groupPartnerServiceCodesByDomain([
    "hotel",
    "hotel",
    "cab-taxi-operator",
    "legacy-service-code",
    "wedding-planner",
  ]);

  expect(groups).toEqual([
    {
      domainId: "stay-accommodation",
      title: "Stay & Accommodation",
      services: [expect.objectContaining({ stableCode: "hotel", name: "Hotel" })],
    },
    {
      domainId: "transport-mobility",
      title: "Transport & Mobility",
      services: [expect.objectContaining({ stableCode: "cab-taxi-operator", name: "Cab / Taxi Operator" })],
    },
    {
      domainId: "wedding-events",
      title: "Wedding & Events",
      services: [expect.objectContaining({ stableCode: "wedding-planner", name: "Wedding Planner" })],
    },
  ]);
});

function assertSearchContains(query: string, labels: string[]) {
  const resultLabels = filterPartnerServiceCatalog(query).flatMap((category) =>
    category.services.map((serviceItem) => serviceItem.label)
  );
  for (const label of labels) {
    expect(resultLabels, `${query} should surface ${label}`).toContain(label);
  }
}
