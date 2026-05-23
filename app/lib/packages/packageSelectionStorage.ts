import type { PackageSelectionState } from "./packageSelectionTypes";

function getKey(packageId: string) {
  return `TPL_PACKAGE_SELECTION_${packageId}`;
}

export function savePackageSelectionState(
  packageId: string,
  state: PackageSelectionState
) {
  if (typeof window === "undefined" || !packageId) return;
  localStorage.setItem(getKey(packageId), JSON.stringify(state));
}

export function getPackageSelectionState(
  packageId: string
): PackageSelectionState | null {
  if (typeof window === "undefined" || !packageId) return null;

  const raw = localStorage.getItem(getKey(packageId));
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw);

    return {
      basePrice: parsed.basePrice || 0,

      selectedFlights: parsed.selectedFlights || [],
      selectedHotels: parsed.selectedHotels || [],
      selectedTransfers: parsed.selectedTransfers || [],
      selectedMeals: parsed.selectedMeals || [],
      selectedActivities: parsed.selectedActivities || [],

      flightFareDiff: parsed.flightFareDiff || 0,
      hotelFareDiff: parsed.hotelFareDiff || 0,
      transferFareDiff: parsed.transferFareDiff || 0,
      mealFareDiff: parsed.mealFareDiff || 0,
      activityFareDiff: parsed.activityFareDiff || 0,

      finalPrice: parsed.finalPrice || parsed.basePrice || 0,
    } as PackageSelectionState;
  } catch {
    return null;
  }
}

export function clearPackageSelectionState(packageId: string) {
  if (typeof window === "undefined" || !packageId) return;
  localStorage.removeItem(getKey(packageId));
}