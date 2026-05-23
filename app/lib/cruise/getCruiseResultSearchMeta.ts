import { CruiseResultSearchMeta } from "./cruiseResultTypes";

export function getCruiseResultSearchMeta(
  searchParams: Record<string, string | string[] | undefined>
): CruiseResultSearchMeta {
  const getString = (key: string) => {
    const value = searchParams[key];

    if (typeof value === "string") return value;
    if (Array.isArray(value) && typeof value[0] === "string") return value[0];

    return null;
  };

  const getNumber = (key: string, fallback: number) => {
    const raw = getString(key);
    const parsed = raw ? Number(raw) : NaN;
    return Number.isFinite(parsed) ? parsed : fallback;
  };

  return {
    destinationId: getString("destination"),
    departurePortId: getString("port"),
    sailingDate: getString("date"),
    sailingMonth: getString("month"),
    durationId: getString("duration"),
    adults: getNumber("adults", 2),
    children: getNumber("children", 0),
    infants: getNumber("infants", 0),
  };
}