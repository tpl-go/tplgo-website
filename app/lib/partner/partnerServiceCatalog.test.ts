import assert from "node:assert/strict";
import test from "node:test";
import {
  filterPartnerServiceCatalog,
  getAllPartnerServices,
  partnerServiceCatalog,
} from "./partnerServiceCatalog";

test("service catalog includes all required Partner Desk service categories", () => {
  const categoryTitles = partnerServiceCatalog.map((category) => category.title);

  assert.deepEqual(categoryTitles, [
    "Stay & Hospitality",
    "Transport & Mobility",
    "Tours & Experiences",
    "Special Tourism",
    "Commerce",
    "Destination Wedding",
    "Shooting / Film / OTT",
  ]);
});

test("service catalog includes required service modules", () => {
  const labels = getAllPartnerServices().map((serviceItem) => serviceItem.label);

  for (const requiredLabel of [
    "Hotels & Resorts",
    "Cab / Taxi",
    "Activities",
    "Marketplace Seller",
    "Wedding Planners",
    "Shooting Locations",
    "Permissions Support",
  ]) {
    assert.equal(labels.includes(requiredLabel), true, `${requiredLabel} should be visible`);
  }
});

test("search surfaces hotel, cab, wedding, and shooting services", () => {
  assertSearchContains("hotel", ["Hotels & Resorts", "Wedding Hotels / Resorts"]);
  assertSearchContains("cab", ["Cab / Taxi", "Transport / Logistics"]);
  assertSearchContains("wedding", ["Venues", "Wedding Planners"]);
  assertSearchContains("shoot", ["Shooting Locations", "Production Services"]);
});

function assertSearchContains(query: string, labels: string[]) {
  const resultLabels = filterPartnerServiceCatalog(query).flatMap((category) =>
    category.services.map((serviceItem) => serviceItem.label)
  );
  for (const label of labels) {
    assert.equal(resultLabels.includes(label), true, `${query} should surface ${label}`);
  }
}
