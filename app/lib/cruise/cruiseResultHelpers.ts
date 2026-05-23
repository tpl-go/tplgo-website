import {
  CruiseFilterOption,
  CruiseFilterSectionConfig,
  CruiseResultItem,
  CruiseSortKey,
} from "./cruiseResultTypes";
import { cruiseFilterSectionsSeed } from "./cruiseFilterConfig";

function buildOptionsWithCounts(values: string[]): CruiseFilterOption[] {
  const map = new Map<string, number>();

  values.forEach((value) => {
    if (!value) return;
    map.set(value, (map.get(value) || 0) + 1);
  });

  return Array.from(map.entries())
    .map(([value, count]) => ({
      id: value,
      label: value,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function getLowestVisibleFare(item: CruiseResultItem) {
  return (
    item.lowestRates.inside ??
    item.lowestRates.outside ??
    item.lowestRates.balcony ??
    item.lowestRates.suite ??
    Number.MAX_SAFE_INTEGER
  );
}

function getHighestVisibleFare(item: CruiseResultItem) {
  return Math.max(
    item.lowestRates.inside ?? 0,
    item.lowestRates.outside ?? 0,
    item.lowestRates.balcony ?? 0,
    item.lowestRates.suite ?? 0
  );
}

export function buildCruiseFilterSections(
  items: CruiseResultItem[]
): CruiseFilterSectionConfig[] {
  const sailingMonths = buildOptionsWithCounts(
    items.flatMap((item) => item.sailingDates.map((s) => s.monthKey))
  );

  const durations: CruiseFilterOption[] = [
    {
      id: "1-3",
      label: "1 to 3 nights",
      count: items.filter(
        (item) => item.durationNights >= 1 && item.durationNights <= 3
      ).length,
    },
    {
      id: "4-6",
      label: "4 to 6 nights",
      count: items.filter(
        (item) => item.durationNights >= 4 && item.durationNights <= 6
      ).length,
    },
    {
      id: "7-9",
      label: "7 to 9 nights",
      count: items.filter(
        (item) => item.durationNights >= 7 && item.durationNights <= 9
      ).length,
    },
    {
      id: "10-13",
      label: "10 to 13 nights",
      count: items.filter(
        (item) => item.durationNights >= 10 && item.durationNights <= 13
      ).length,
    },
    {
      id: "14plus",
      label: "14 and more nights",
      count: items.filter((item) => item.durationNights >= 14).length,
    },
  ].filter((item) => item.count > 0);

  const destinations = buildOptionsWithCounts(
    items.map((item) => item.regionLabel)
  );
  const departurePorts = buildOptionsWithCounts(
    items.map((item) => item.departurePort)
  );
  const cruiseLines = buildOptionsWithCounts(
    items.map((item) => item.cruiseLine)
  );
  const cruiseShips = buildOptionsWithCounts(
    items.map((item) => item.shipName)
  );
  const arrivalPorts = buildOptionsWithCounts(
    items.map((item) => item.arrivalPort)
  );

  const priceRanges: CruiseFilterOption[] = [
    {
      id: "under-25000",
      label: "Under ₹25,000",
      count: items.filter((item) => getLowestVisibleFare(item) < 25000).length,
    },
    {
      id: "25000-40000",
      label: "₹25,000 - ₹40,000",
      count: items.filter((item) => {
        const price = getLowestVisibleFare(item);
        return price >= 25000 && price <= 40000;
      }).length,
    },
    {
      id: "40001-60000",
      label: "₹40,001 - ₹60,000",
      count: items.filter((item) => {
        const price = getLowestVisibleFare(item);
        return price >= 40001 && price <= 60000;
      }).length,
    },
    {
      id: "above-60000",
      label: "Above ₹60,000",
      count: items.filter((item) => getLowestVisibleFare(item) > 60000).length,
    },
  ].filter((item) => item.count > 0);

  const cabinOccupancy: CruiseFilterOption[] = [
    { id: "double", label: "Double Occupancy", count: items.length },
    {
      id: "family",
      label: "Family Friendly",
      count: Math.max(0, Math.floor(items.length / 2)),
    },
    {
      id: "suite",
      label: "Suite Category Available",
      count: items.filter((item) => !!item.lowestRates.suite).length,
    },
  ].filter((item) => item.count > 0);

  return cruiseFilterSectionsSeed.map((section) => {
    if (section.key === "sailingMonths")
      return { ...section, options: sailingMonths };
    if (section.key === "priceRanges")
      return { ...section, options: priceRanges };
    if (section.key === "durations")
      return { ...section, options: durations };
    if (section.key === "destinations")
      return { ...section, options: destinations };
    if (section.key === "departurePorts")
      return { ...section, options: departurePorts };
    if (section.key === "cruiseLines")
      return { ...section, options: cruiseLines };
    if (section.key === "cruiseShips")
      return { ...section, options: cruiseShips };
    if (section.key === "arrivalPorts")
      return { ...section, options: arrivalPorts };
    if (section.key === "cabinOccupancy")
      return { ...section, options: cabinOccupancy };
    return section;
  });
}

export function sortCruiseResults(
  items: CruiseResultItem[],
  sortKey: CruiseSortKey
) {
  const sorted = [...items];

  sorted.sort((a, b) => {
    if (sortKey === "price-low-high") {
      return (
        getLowestVisibleFare(a) - getLowestVisibleFare(b) ||
        a.durationNights - b.durationNights ||
        a.cruiseLine.localeCompare(b.cruiseLine)
      );
    }

    if (sortKey === "price-high-low") {
      return (
        getHighestVisibleFare(b) - getHighestVisibleFare(a) ||
        b.durationNights - a.durationNights ||
        a.cruiseLine.localeCompare(b.cruiseLine)
      );
    }

    if (sortKey === "duration-low-high") {
      return (
        a.durationNights - b.durationNights ||
        getLowestVisibleFare(a) - getLowestVisibleFare(b) ||
        a.cruiseLine.localeCompare(b.cruiseLine)
      );
    }

    if (sortKey === "duration-high-low") {
      return (
        b.durationNights - a.durationNights ||
        getLowestVisibleFare(a) - getLowestVisibleFare(b) ||
        a.cruiseLine.localeCompare(b.cruiseLine)
      );
    }

    if (sortKey === "departure-az") {
      return (
        a.departurePort.localeCompare(b.departurePort) ||
        getLowestVisibleFare(a) - getLowestVisibleFare(b) ||
        a.cruiseLine.localeCompare(b.cruiseLine)
      );
    }

    if (sortKey === "departure-za") {
      return (
        b.departurePort.localeCompare(a.departurePort) ||
        getLowestVisibleFare(a) - getLowestVisibleFare(b) ||
        a.cruiseLine.localeCompare(b.cruiseLine)
      );
    }

    if (sortKey === "line-az") {
      return (
        a.cruiseLine.localeCompare(b.cruiseLine) ||
        getLowestVisibleFare(a) - getLowestVisibleFare(b) ||
        a.shipName.localeCompare(b.shipName)
      );
    }

    if (sortKey === "ship-az") {
      return (
        a.shipName.localeCompare(b.shipName) ||
        getLowestVisibleFare(a) - getLowestVisibleFare(b) ||
        a.cruiseLine.localeCompare(b.cruiseLine)
      );
    }

    return getLowestVisibleFare(a) - getLowestVisibleFare(b);
  });

  return sorted;
}