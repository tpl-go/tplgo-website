import type {
  CabResultFiltersState,
  CabResultItem,
  CabResultSearchMeta,
} from "./cabResultTypes";

export function parseCabResultSearchParams(
  searchParams: Record<string, string | string[] | undefined>
): CabResultSearchMeta {
  return {
    rideType:
      (searchParams.rideType as CabResultSearchMeta["rideType"]) ||
      "outstationOneWay",
    from: typeof searchParams.from === "string" ? searchParams.from : "",
    to: typeof searchParams.to === "string" ? searchParams.to : "",
    pickup: typeof searchParams.pickup === "string" ? searchParams.pickup : "",
    drop: typeof searchParams.drop === "string" ? searchParams.drop : "",
    departureDate:
      typeof searchParams.departureDate === "string"
        ? searchParams.departureDate
        : "",
    returnDate:
      typeof searchParams.returnDate === "string" ? searchParams.returnDate : "",
    pickupDate:
      typeof searchParams.pickupDate === "string" ? searchParams.pickupDate : "",
    pickupTime:
      typeof searchParams.pickupTime === "string" ? searchParams.pickupTime : "",
    dropTime:
      typeof searchParams.dropTime === "string" ? searchParams.dropTime : "",
    rentalPackage:
      typeof searchParams.rentalPackage === "string"
        ? searchParams.rentalPackage
        : "",
    rentalVehicleType:
      typeof searchParams.rentalVehicleType === "string"
        ? searchParams.rentalVehicleType
        : "",
    stops:
      typeof searchParams.stops === "string"
        ? searchParams.stops.split(",").filter(Boolean)
        : [],
  };
}

export function getDefaultCabResultFilters(
  items: CabResultItem[]
): CabResultFiltersState {
  const prices = items.map((item) => item.finalPrice);
  const min = prices.length ? Math.min(...prices) : 0;
  const max = prices.length ? Math.max(...prices) : 10000;

  return {
    vehicleTypes: [],
    brands: [],
    fuelTypes: [],
    transmissions: [],
    seats: [],
    priceRange: [min, max],
    minRating: null,
  };
}

export function filterCabResultItems(
  items: CabResultItem[],
  filters: CabResultFiltersState
) {
  return items.filter((item) => {
    if (
      filters.vehicleTypes.length > 0 &&
      !filters.vehicleTypes.includes(item.vehicleType)
    ) {
      return false;
    }

    if (filters.brands.length > 0 && !filters.brands.includes(item.brand)) {
      return false;
    }

    if (
      filters.fuelTypes.length > 0 &&
      (!item.fuelType || !filters.fuelTypes.includes(item.fuelType))
    ) {
      return false;
    }

    if (
      filters.transmissions.length > 0 &&
      (!item.transmission ||
        !filters.transmissions.includes(item.transmission))
    ) {
      return false;
    }

    if (
      filters.seats.length > 0 &&
      (!item.seats || !filters.seats.includes(String(item.seats)))
    ) {
      return false;
    }

    if (
      item.finalPrice < filters.priceRange[0] ||
      item.finalPrice > filters.priceRange[1]
    ) {
      return false;
    }

    if (filters.minRating && item.rating < filters.minRating) {
      return false;
    }

    return true;
  });
}