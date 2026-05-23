export type CombinedTimeBucket =
  | "before6"
  | "6to12"
  | "12to18"
  | "after18";

export type CombinedLegFilter = {
  stops: string[];
  departureTime: CombinedTimeBucket[];
  arrivalTime: CombinedTimeBucket[];
};

export type MultiCityCombinedFiltersState = {
  checkInBaggage: boolean;

  popular: string[];
  priceRange: [number, number];
  durationRange: [number, number];

  airlines: string[];
  layoverAirports: string[];
  layoverDurationRange: [number, number];

  legFilters: Record<number, CombinedLegFilter>;
};

export const createDefaultCombinedLegFilter =
  (): CombinedLegFilter => ({
    stops: [],
    departureTime: [],
    arrivalTime: [],
  });

export const createDefaultCombinedFiltersState = (
  legCount: number,
  minPrice = 0,
  maxPrice = 0,
  minDuration = 0,
  maxDuration = 0,
  minLayoverDuration = 0,
  maxLayoverDuration = 0
): MultiCityCombinedFiltersState => {
  const legFilters: Record<number, CombinedLegFilter> = {};

  for (let i = 0; i < legCount; i += 1) {
    legFilters[i] = createDefaultCombinedLegFilter();
  }

  return {
    checkInBaggage: false,
    popular: [],
    priceRange: [minPrice, maxPrice],
    durationRange: [minDuration, maxDuration],
    airlines: [],
    layoverAirports: [],
    layoverDurationRange: [minLayoverDuration, maxLayoverDuration],
    legFilters,
  };
};