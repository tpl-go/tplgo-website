import type {
  FlightTrackingResult,
  FlightTrackingStatus,
} from "./flightTrackingTypes";

export function getFlightStatusStyle(status: FlightTrackingStatus) {
  if (status === "On Time") {
    return "bg-green-100 text-green-700 border-green-200";
  }

  if (status === "Delayed") {
    return "bg-orange-100 text-orange-700 border-orange-200";
  }

  if (status === "Boarding") {
    return "bg-blue-100 text-blue-700 border-blue-200";
  }

  if (status === "Departed") {
    return "bg-purple-100 text-purple-700 border-purple-200";
  }

  if (status === "Cancelled") {
    return "bg-red-100 text-red-700 border-red-200";
  }

  return "bg-gray-100 text-gray-700 border-gray-200";
}

export function filterFlightsByFlightNumber(
  results: FlightTrackingResult[],
  flightNumber: string
) {
  const query = flightNumber.trim().toLowerCase();

  if (!query) return results;

  return results.filter((item) =>
    item.flightNumber.toLowerCase().includes(query)
  );
}

export function filterFlightsByRoute(
  results: FlightTrackingResult[],
  fromCity: string,
  toCity: string
) {
  const from = fromCity.trim().toLowerCase();
  const to = toCity.trim().toLowerCase();

  return results.filter((item) => {
    const matchFrom = from
      ? item.from.toLowerCase().includes(from)
      : true;

    const matchTo = to ? item.to.toLowerCase().includes(to) : true;

    return matchFrom && matchTo;
  });
}