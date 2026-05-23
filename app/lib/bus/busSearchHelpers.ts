import {
  BUS_DUMMY_RESULTS,
  generateDummyBusesForRoute,
} from "./busDummyData";
import {
  BusBoardingPoint,
  BusDroppingPoint,
  BusResultItem,
  BusSearchQuery,
} from "./busTypes";

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function timeToMinutes(time: string) {
  const [hh, mm] = time.split(":").map(Number);
  return hh * 60 + mm;
}

function durationToMinutes(duration: string) {
  const normalized = duration.toLowerCase().trim();

  const hourMatch = normalized.match(/(\d+)\s*h/);
  const minuteMatch = normalized.match(/(\d+)\s*m/);

  const hours = hourMatch ? Number(hourMatch[1]) : 0;
  const minutes = minuteMatch ? Number(minuteMatch[1]) : 0;

  return hours * 60 + minutes;
}

export function searchBuses(query: BusSearchQuery): BusResultItem[] {
  const fromCity = query.fromCity?.trim() || "";
  const toCity = query.toCity?.trim() || "";
  const date = query.date || "";

  let results =
    fromCity && toCity && date
      ? generateDummyBusesForRoute({
          fromCity,
          toCity,
          date,
          count: 12,
        })
      : [];

  if (
    query.fromPoint &&
    normalize(query.fromPoint) !== normalize("All Boarding Points")
  ) {
    results = results.filter((item) =>
      item.boardingPoints.some(
        (bp) => normalize(bp.name) === normalize(query.fromPoint || "")
      )
    );
  }

  if (
    query.toPoint &&
    normalize(query.toPoint) !== normalize("All Drop Points")
  ) {
    results = results.filter((item) =>
      item.droppingPoints.some(
        (dp) => normalize(dp.name) === normalize(query.toPoint || "")
      )
    );
  }

  return results;
}

export function getBusById(busId: string) {
  return (
    BUS_DUMMY_RESULTS.find((item) => item.id === busId) || null
  );
}

export function getBusRouteBoardingPoints(
  results: BusResultItem[]
): BusBoardingPoint[] {
  const map = new Map<string, BusBoardingPoint>();

  results.forEach((bus) => {
    bus.boardingPoints.forEach((point) => {
      if (!map.has(point.name)) {
        map.set(point.name, point);
      }
    });
  });

  return Array.from(map.values());
}

export function getBusRouteDroppingPoints(
  results: BusResultItem[]
): BusDroppingPoint[] {
  const map = new Map<string, BusDroppingPoint>();

  results.forEach((bus) => {
    bus.droppingPoints.forEach((point) => {
      if (!map.has(point.name)) {
        map.set(point.name, point);
      }
    });
  });

  return Array.from(map.values());
}

export function sortBusResults(
  results: BusResultItem[],
  sortBy:
    | "relevance"
    | "rating"
    | "price"
    | "fastest"
    | "departure"
    | "arrival" = "relevance"
) {
  const cloned = [...results];

  switch (sortBy) {
    case "relevance":
      return cloned.sort((a, b) => {
        const scoreA =
          a.rating * 20 +
          a.seatsAvailable +
          (a.isAssured ? 15 : 0) +
          (a.isNewBus ? 8 : 0) -
          a.price / 200;

        const scoreB =
          b.rating * 20 +
          b.seatsAvailable +
          (b.isAssured ? 15 : 0) +
          (b.isNewBus ? 8 : 0) -
          b.price / 200;

        return scoreB - scoreA;
      });

    case "rating":
      return cloned.sort((a, b) => b.rating - a.rating);

    case "price":
      return cloned.sort((a, b) => a.price - b.price);

    case "fastest":
      return cloned.sort(
        (a, b) =>
          durationToMinutes(a.duration) - durationToMinutes(b.duration)
      );

    case "departure":
      return cloned.sort(
        (a, b) =>
          timeToMinutes(a.departureTime) - timeToMinutes(b.departureTime)
      );

    case "arrival":
      return cloned.sort(
        (a, b) =>
          timeToMinutes(a.arrivalTime) - timeToMinutes(b.arrivalTime)
      );

    default:
      return cloned;
  }
}