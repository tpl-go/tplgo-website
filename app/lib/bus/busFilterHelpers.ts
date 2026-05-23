import type { BusResultItem } from "./busTypes";
import type { BusFilters, BusTimeBucket } from "./busFilterTypes";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function timeToMinutes(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return hh * 60 + mm;
}

function inBucket(time: string, bucket: BusTimeBucket) {
  const mins = timeToMinutes(time);

  switch (bucket) {
    case "00-06":
      return mins >= 0 && mins < 360;
    case "06-12":
      return mins >= 360 && mins < 720;
    case "12-18":
      return mins >= 720 && mins < 1080;
    case "18-24":
      return mins >= 1080 && mins < 1440;
    default:
      return true;
  }
}

function resolveBusAcType(bus: BusResultItem) {
  return normalize(bus.busType).includes("non ac") ? "Non-AC" : "AC";
}

function resolveSeatType(bus: BusResultItem) {
  return bus.busLayoutType === "sleeper" ? "Sleeper" : "Seater";
}

export function applyBusFilters(
  results: BusResultItem[],
  filters: BusFilters
): BusResultItem[] {
  return results.filter((bus) => {
    if (
      filters.busAcTypes.length > 0 &&
      !filters.busAcTypes.includes(resolveBusAcType(bus))
    ) {
      return false;
    }

    if (
      filters.seatTypes.length > 0 &&
      !filters.seatTypes.includes(resolveSeatType(bus))
    ) {
      return false;
    }

    if (
      filters.pickupPoints.length > 0 &&
      !bus.boardingPoints.some((point) =>
        filters.pickupPoints.some(
          (selected) => normalize(selected) === normalize(point.name)
        )
      )
    ) {
      return false;
    }

    if (
      filters.pickupTimes.length > 0 &&
      !filters.pickupTimes.some((bucket) =>
        bus.boardingPoints.some((point) => inBucket(point.time, bucket))
      )
    ) {
      return false;
    }

    if (
      filters.operators.length > 0 &&
      !filters.operators.some(
        (selected) => normalize(selected) === normalize(bus.operatorName)
      )
    ) {
      return false;
    }

    if (
      filters.dropPoints.length > 0 &&
      !bus.droppingPoints.some((point) =>
        filters.dropPoints.some(
          (selected) => normalize(selected) === normalize(point.name)
        )
      )
    ) {
      return false;
    }

    if (
      filters.dropTimes.length > 0 &&
      !filters.dropTimes.some((bucket) =>
        bus.droppingPoints.some((point) => inBucket(point.time, bucket))
      )
    ) {
      return false;
    }

    return true;
  });
}

export function getUniqueOperators(results: BusResultItem[]) {
  return Array.from(new Set(results.map((bus) => bus.operatorName))).sort();
}

export function getUniquePickupPoints(results: BusResultItem[]) {
  return Array.from(
    new Set(results.flatMap((bus) => bus.boardingPoints.map((p) => p.name)))
  ).sort();
}

export function getUniqueDropPoints(results: BusResultItem[]) {
  return Array.from(
    new Set(results.flatMap((bus) => bus.droppingPoints.map((p) => p.name)))
  ).sort();
}