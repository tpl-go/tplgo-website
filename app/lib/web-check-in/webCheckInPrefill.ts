import {
  getBookingById,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";

import { getBookingResolvedPayload } from "@/app/lib/booking/bookingActionHelpers";

import {
  formatPassengerLastName,
  formatWebCheckInPnr,
} from "./webCheckInHelpers";

export type WebCheckInPrefillData = {
  booking: BookingItem | null;
  pnr: string;
  lastName: string;
  airline: string;
  departureCity: string;
  source: "booking" | "manual";
};

function getLastName(fullName?: string) {
  const parts = String(fullName || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts[parts.length - 1] || "";
}

function resolveAirlineCode(payload: any) {
  const airline =
    payload?.reviewData?.selectedFlight?.airline ||
    payload?.reviewData?.flight?.airline ||
    payload?.flight?.airline ||
    payload?.selectedFlight?.airline ||
    "";

  const text = String(airline).toLowerCase();

  if (text.includes("indigo") || text.includes("6e")) return "6E";
  if (text.includes("air india") || text.includes("ai")) return "AI";
  if (text.includes("vistara") || text.includes("uk")) return "UK";

  return "";
}

function resolveDepartureCity(payload: any) {
  return (
    payload?.reviewData?.route?.from ||
    payload?.reviewData?.searchMeta?.from ||
    payload?.reviewData?.searchData?.from ||
    payload?.searchMeta?.from ||
    payload?.searchData?.from ||
    payload?.from ||
    ""
  );
}

export function getWebCheckInPrefillFromBookingId(
  bookingId?: string | null
): WebCheckInPrefillData {
  if (!bookingId) {
    return {
      booking: null,
      pnr: "",
      lastName: "",
      airline: "6E",
      departureCity: "",
      source: "manual",
    };
  }

  const booking = getBookingById(bookingId);

  if (!booking || booking.type !== "flight") {
    return {
      booking: null,
      pnr: "",
      lastName: "",
      airline: "6E",
      departureCity: "",
      source: "manual",
    };
  }

  const payload = getBookingResolvedPayload<any>(booking);

  return {
    booking,
    pnr: formatWebCheckInPnr(booking.id),
    lastName: formatPassengerLastName(
      getLastName(booking.leadTraveller?.name)
    ),
    airline: resolveAirlineCode(payload) || "6E",
    departureCity: resolveDepartureCity(payload),
    source: "booking",
  };
}