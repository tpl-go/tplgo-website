import {
  FlightMealOption,
  FlightSeatOption,
  SeatMealStatus,
  TravellerMealSelection,
  TravellerSeatSelection,
} from "./ancillaryTypes";

export function buildTravellerIds(count: number) {
  return Array.from({ length: count }, (_, index) => `traveller-${index + 1}`);
}

export function getSeatStatus(
  selections: TravellerSeatSelection[],
  travellerCount: number
): SeatMealStatus {
  if (travellerCount === 0) return "pending";
  if (selections.length !== travellerCount) return "pending";
  if (selections.every((item) => item.skipped)) return "skipped";
  return "selected";
}

export function getMealStatus(
  selections: TravellerMealSelection[],
  travellerCount: number
): SeatMealStatus {
  if (travellerCount === 0) return "pending";
  if (selections.length !== travellerCount) return "pending";
  if (selections.every((item) => item.skipped)) return "skipped";
  return "selected";
}

export function assignSeatToTraveller(params: {
  current: TravellerSeatSelection[];
  travellerIds: string[];
  travellerId: string;
  seat: FlightSeatOption;
}) {
  const { current, travellerIds, travellerId, seat } = params;

  const usedByOtherTraveller = current.some(
    (item) => item.travellerId !== travellerId && item.newSeatCode === seat.seatCode
  );

  if (usedByOtherTraveller) return current;

  return [
    ...current.filter((item) => item.travellerId !== travellerId),
    {
      travellerId,
      oldSeatCode: current.find((item) => item.travellerId === travellerId)?.oldSeatCode ?? null,
      oldPrice: current.find((item) => item.travellerId === travellerId)?.oldPrice ?? 0,
      newSeatCode: seat.seatCode,
      newPrice: seat.price,
      skipped: false,
    },
  ].sort(
    (a, b) => travellerIds.indexOf(a.travellerId) - travellerIds.indexOf(b.travellerId)
  );
}

export function skipSeatForTraveller(params: {
  current: TravellerSeatSelection[];
  travellerIds: string[];
  travellerId: string;
}) {
  const { current, travellerIds, travellerId } = params;
  const existing = current.find((item) => item.travellerId === travellerId);

  return [
    ...current.filter((item) => item.travellerId !== travellerId),
    {
      travellerId,
      oldSeatCode: existing?.oldSeatCode ?? null,
      oldPrice: existing?.oldPrice ?? 0,
      newSeatCode: null,
      newPrice: 0,
      skipped: true,
    },
  ].sort(
    (a, b) => travellerIds.indexOf(a.travellerId) - travellerIds.indexOf(b.travellerId)
  );
}

export function assignMealToTraveller(params: {
  current: TravellerMealSelection[];
  travellerIds: string[];
  travellerId: string;
  meal: FlightMealOption;
}) {
  const { current, travellerIds, travellerId, meal } = params;
  const existing = current.find((item) => item.travellerId === travellerId);

  return [
    ...current.filter((item) => item.travellerId !== travellerId),
    {
      travellerId,
      oldMealId: existing?.oldMealId ?? null,
      oldPrice: existing?.oldPrice ?? 0,
      newMealId: meal.id,
      newPrice: meal.price,
      skipped: false,
    },
  ].sort(
    (a, b) => travellerIds.indexOf(a.travellerId) - travellerIds.indexOf(b.travellerId)
  );
}

export function skipMealForTraveller(params: {
  current: TravellerMealSelection[];
  travellerIds: string[];
  travellerId: string;
}) {
  const { current, travellerIds, travellerId } = params;
  const existing = current.find((item) => item.travellerId === travellerId);

  return [
    ...current.filter((item) => item.travellerId !== travellerId),
    {
      travellerId,
      oldMealId: existing?.oldMealId ?? null,
      oldPrice: existing?.oldPrice ?? 0,
      newMealId: null,
      newPrice: 0,
      skipped: true,
    },
  ].sort(
    (a, b) => travellerIds.indexOf(a.travellerId) - travellerIds.indexOf(b.travellerId)
  );
}