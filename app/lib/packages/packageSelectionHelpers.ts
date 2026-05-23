import type {
  PackageSelectionState,
  PackageFlightOption,
  PackageHotelOption,
  PackageTransferOption,
  PackageMealOption,
  PackageActivityOption,
} from "./packageSelectionTypes";

export function getInitialPackageSelectionState(
  basePrice: number
): PackageSelectionState {
  return {
    basePrice,
    selectedFlights: [],
    selectedHotels: [],
    selectedTransfers: [],
    selectedMeals: [],
    selectedActivities: [],
    flightFareDiff: 0,
    hotelFareDiff: 0,
    transferFareDiff: 0,
    mealFareDiff: 0,
    activityFareDiff: 0,
    finalPrice: basePrice,
  };
}

function getFareDiffTotal<T extends { fareDiff: number }>(items: T[]): number {
  return items.reduce((total, item) => total + Number(item.fareDiff || 0), 0);
}

function recalcFinalPrice(state: PackageSelectionState): PackageSelectionState {
  const flightFareDiff = getFareDiffTotal(state.selectedFlights);
  const hotelFareDiff = getFareDiffTotal(state.selectedHotels);
  const transferFareDiff = getFareDiffTotal(state.selectedTransfers);
  const mealFareDiff = getFareDiffTotal(state.selectedMeals);
  const activityFareDiff = getFareDiffTotal(state.selectedActivities);

  const finalPrice =
    Number(state.basePrice || 0) +
    flightFareDiff +
    hotelFareDiff +
    transferFareDiff +
    mealFareDiff +
    activityFareDiff;

  return {
    ...state,
    flightFareDiff,
    hotelFareDiff,
    transferFareDiff,
    mealFareDiff,
    activityFareDiff,
    finalPrice,
  };
}

export function applyFlightSelection(
  state: PackageSelectionState,
  flight: PackageFlightOption,
  index = 0
): PackageSelectionState {
  const nextFlights = [...state.selectedFlights];
  nextFlights[index] = flight;

  return recalcFinalPrice({
    ...state,
    selectedFlights: nextFlights,
  });
}

export function applyHotelSelection(
  state: PackageSelectionState,
  hotel: PackageHotelOption,
  index = 0
): PackageSelectionState {
  const nextHotels = [...state.selectedHotels];
  nextHotels[index] = hotel;

  return recalcFinalPrice({
    ...state,
    selectedHotels: nextHotels,
  });
}

export function applyTransferSelection(
  state: PackageSelectionState,
  transfer: PackageTransferOption,
  index = 0
): PackageSelectionState {
  const nextTransfers = [...state.selectedTransfers];
  nextTransfers[index] = transfer;

  return recalcFinalPrice({
    ...state,
    selectedTransfers: nextTransfers,
  });
}

export function applyMealSelection(
  state: PackageSelectionState,
  meal: PackageMealOption,
  index = 0
): PackageSelectionState {
  const nextMeals = [...state.selectedMeals];
  nextMeals[index] = meal;

  return recalcFinalPrice({
    ...state,
    selectedMeals: nextMeals,
  });
}

export function applyActivitySelection(
  state: PackageSelectionState,
  activity: PackageActivityOption,
  index = 0
): PackageSelectionState {
  const nextActivities = [...state.selectedActivities];
  nextActivities[index] = activity;

  return recalcFinalPrice({
    ...state,
    selectedActivities: nextActivities,
  });
}

export function getTotalPackageAdjustment(
  state: PackageSelectionState
): number {
  return (
    Number(state.flightFareDiff || 0) +
    Number(state.hotelFareDiff || 0) +
    Number(state.transferFareDiff || 0) +
    Number(state.mealFareDiff || 0) +
    Number(state.activityFareDiff || 0)
  );
}