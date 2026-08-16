import assert from "node:assert/strict";
import test from "node:test";
import {
  canContinuePartnerPreview,
  clearServiceSelection,
  deselectService,
  PARTNER_PREVIEW_SELECTED_SERVICES_STORAGE_KEY,
  readPartnerPreviewSelection,
  selectedPartnerServices,
  selectedServicesLabel,
  toggleServiceSelection,
  writePartnerPreviewSelection,
  type PartnerPreviewStorage,
} from "./partnerPreviewSelection";

test("multi-select supports Hotel + Cab + Activities simultaneously", () => {
  let selected: string[] = [];
  selected = toggleServiceSelection(selected, "hotels-resorts");
  selected = toggleServiceSelection(selected, "cab-taxi");
  selected = toggleServiceSelection(selected, "activities");

  assert.deepEqual(selected, ["hotels-resorts", "cab-taxi", "activities"]);
  assert.equal(selectedServicesLabel(selected.length), "3 services selected");
  assert.equal(canContinuePartnerPreview(selected), true);
});

test("deselect and clear all update selected services", () => {
  const selected = ["hotels-resorts", "cab-taxi", "activities"];

  assert.deepEqual(deselectService(selected, "cab-taxi"), ["hotels-resorts", "activities"]);
  assert.deepEqual(toggleServiceSelection(selected, "cab-taxi"), ["hotels-resorts", "activities"]);
  assert.deepEqual(clearServiceSelection(), []);
  assert.equal(canContinuePartnerPreview([]), false);
});

test("selected service read model returns selected definitions", () => {
  const selected = selectedPartnerServices(["hotels-resorts", "cab-taxi", "activities"]);

  assert.deepEqual(selected.map((serviceItem) => serviceItem.label), [
    "Hotels & Resorts",
    "Cab / Taxi",
    "Activities",
  ]);
});

test("preview persistence stores and restores selected services", () => {
  const storage = memoryStorage();
  writePartnerPreviewSelection(storage, {
    selectedServiceIds: ["hotels-resorts", "cab-taxi", "activities"],
    completedStep: "business-profile-preview",
  });

  assert.equal(storage.getItem(PARTNER_PREVIEW_SELECTED_SERVICES_STORAGE_KEY)?.includes("cab-taxi"), true);
  assert.deepEqual(readPartnerPreviewSelection(storage), {
    selectedServiceIds: ["hotels-resorts", "cab-taxi", "activities"],
    completedStep: "business-profile-preview",
  });
});

test("invalid preview persistence safely resets", () => {
  const storage = memoryStorage();
  storage.setItem(PARTNER_PREVIEW_SELECTED_SERVICES_STORAGE_KEY, "{not-json");

  assert.deepEqual(readPartnerPreviewSelection(storage), {
    selectedServiceIds: [],
    completedStep: "choose-services",
  });
});

function memoryStorage(): PartnerPreviewStorage {
  const values = new Map<string, string>();
  return {
    getItem: (key) => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value),
    removeItem: (key) => {
      values.delete(key);
    },
  };
}
