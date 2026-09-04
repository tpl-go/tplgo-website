import type { PartnerServiceDefinition } from "./partnerServiceCatalogRuntime";

export const PARTNER_PREVIEW_SELECTED_SERVICES_STORAGE_KEY = "tpl.partnerPreview.selectedServices.v1";

export type PartnerPreviewSelectionState = {
  selectedServiceIds: string[];
  completedStep: "choose-services" | "business-profile" | "verification-preview";
};

export type PartnerPreviewStorage = {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
};

export const emptyPartnerPreviewSelection: PartnerPreviewSelectionState = {
  selectedServiceIds: [],
  completedStep: "choose-services",
};

export const qaPartnerPreviewServices: PartnerServiceDefinition[] = [
  { id: "hotels-resorts", label: "Hotels & Resorts", keywords: ["hotels", "resorts", "stay", "accommodation"] },
  { id: "cab-taxi", label: "Cab / Taxi", keywords: ["cab", "taxi", "transport", "driver"] },
  { id: "activities", label: "Activities", keywords: ["activities", "experiences", "adventure", "scuba"] },
  { id: "guides", label: "Guides", keywords: ["guide", "tour guide", "local expert"] },
];

export function toggleServiceSelection(selectedServiceIds: string[], serviceId: string): string[] {
  if (selectedServiceIds.includes(serviceId)) {
    return selectedServiceIds.filter((currentId) => currentId !== serviceId);
  }
  return [...selectedServiceIds, serviceId];
}

export function deselectService(selectedServiceIds: string[], serviceId: string): string[] {
  return selectedServiceIds.filter((currentId) => currentId !== serviceId);
}

export function clearServiceSelection(): string[] {
  return [];
}

export function canContinuePartnerPreview(selectedServiceIds: string[]): boolean {
  return selectedServiceIds.length > 0;
}

export function selectedServicesLabel(count: number): string {
  return `${count} ${count === 1 ? "service" : "services"} selected`;
}

export function selectedPartnerServices(
  selectedServiceIds: string[],
  services: PartnerServiceDefinition[] = []
): PartnerServiceDefinition[] {
  const selectedIds = new Set(selectedServiceIds);
  return services.filter((serviceItem) => selectedIds.has(serviceItem.id));
}

export function selectedPartnerServicesForQaPreview(selectedServiceIds: string[]): PartnerServiceDefinition[] {
  return selectedPartnerServices(selectedServiceIds, qaPartnerPreviewServices);
}

export function readPartnerPreviewSelection(storage: PartnerPreviewStorage): PartnerPreviewSelectionState {
  const rawValue = storage.getItem(PARTNER_PREVIEW_SELECTED_SERVICES_STORAGE_KEY);
  if (!rawValue) return emptyPartnerPreviewSelection;

  try {
    const parsed = JSON.parse(rawValue) as Partial<PartnerPreviewSelectionState>;
    return {
      selectedServiceIds: Array.isArray(parsed.selectedServiceIds)
        ? parsed.selectedServiceIds.filter((item): item is string => typeof item === "string")
        : [],
      completedStep: parseCompletedStep(parsed.completedStep),
    };
  } catch {
    return emptyPartnerPreviewSelection;
  }
}

export function writePartnerPreviewSelection(
  storage: PartnerPreviewStorage,
  state: PartnerPreviewSelectionState
): void {
  storage.setItem(PARTNER_PREVIEW_SELECTED_SERVICES_STORAGE_KEY, JSON.stringify(state));
}

export function resetPartnerPreviewSelection(storage: PartnerPreviewStorage): void {
  storage.removeItem(PARTNER_PREVIEW_SELECTED_SERVICES_STORAGE_KEY);
}

function parseCompletedStep(value: unknown): PartnerPreviewSelectionState["completedStep"] {
  if (value === "business-profile" || value === "business-profile-preview") return "business-profile";
  if (value === "verification-preview") return "verification-preview";
  return "choose-services";
}
