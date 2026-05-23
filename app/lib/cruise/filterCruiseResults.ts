import { CruiseFilterState, CruiseResultItem } from "./cruiseResultTypes";

export const initialCruiseFilterState: CruiseFilterState = {
  sailingMonths: [],
  priceRanges: [],
  durations: [],
  destinations: [],
  departurePorts: [],
  cruiseLines: [],
  cruiseShips: [],
  arrivalPorts: [],
  cabinOccupancy: [],
};

function getLowestVisibleFare(item: CruiseResultItem) {
  return (
    item.lowestRates.inside ??
    item.lowestRates.outside ??
    item.lowestRates.balcony ??
    item.lowestRates.suite ??
    Number.MAX_SAFE_INTEGER
  );
}

export function filterCruiseResults(
  items: CruiseResultItem[],
  filters: CruiseFilterState
): CruiseResultItem[] {
  let filtered = [...items];

  if (filters.sailingMonths.length) {
    filtered = filtered.filter((item) =>
      item.sailingDates.some((sailing) =>
        filters.sailingMonths.includes(sailing.monthKey)
      )
    );
  }

  if (filters.priceRanges.length) {
    filtered = filtered.filter((item) => {
      const price = getLowestVisibleFare(item);

      return filters.priceRanges.some((range) =>
        range === "under-25000"
          ? price < 25000
          : range === "25000-40000"
          ? price >= 25000 && price <= 40000
          : range === "40001-60000"
          ? price >= 40001 && price <= 60000
          : range === "above-60000"
          ? price > 60000
          : false
      );
    });
  }

  if (filters.durations.length) {
    filtered = filtered.filter((item) =>
      filters.durations.some((duration) =>
        duration === "1-3"
          ? item.durationNights >= 1 && item.durationNights <= 3
          : duration === "4-6"
          ? item.durationNights >= 4 && item.durationNights <= 6
          : duration === "7-9"
          ? item.durationNights >= 7 && item.durationNights <= 9
          : duration === "10-13"
          ? item.durationNights >= 10 && item.durationNights <= 13
          : duration === "14plus"
          ? item.durationNights >= 14
          : false
      )
    );
  }

  if (filters.destinations.length) {
    filtered = filtered.filter((item) =>
      filters.destinations.includes(item.regionLabel)
    );
  }

  if (filters.departurePorts.length) {
    filtered = filtered.filter((item) =>
      filters.departurePorts.includes(item.departurePort)
    );
  }

  if (filters.cruiseLines.length) {
    filtered = filtered.filter((item) =>
      filters.cruiseLines.includes(item.cruiseLine)
    );
  }

  if (filters.cruiseShips.length) {
    filtered = filtered.filter((item) =>
      filters.cruiseShips.includes(item.shipName)
    );
  }

  if (filters.arrivalPorts.length) {
    filtered = filtered.filter((item) =>
      filters.arrivalPorts.includes(item.arrivalPort)
    );
  }

  if (filters.cabinOccupancy.length) {
    filtered = filtered.filter((item) =>
      filters.cabinOccupancy.some((occupancy) =>
        occupancy === "suite"
          ? !!item.lowestRates.suite
          : occupancy === "double"
          ? true
          : occupancy === "family"
          ? item.durationNights >= 3
          : false
      )
    );
  }

  return filtered;
}