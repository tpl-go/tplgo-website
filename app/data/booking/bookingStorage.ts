import type { BookingRecord } from "./bookingSchema";

const BOOKING_STORAGE_KEY = "tplActiveBookingRecord";

export function saveBookingRecord(booking: BookingRecord) {
  if (typeof window === "undefined") return;

  sessionStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(booking));
}

export function getBookingRecord(): BookingRecord | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem(BOOKING_STORAGE_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw) as BookingRecord;
  } catch (error) {
    console.error("Failed to parse booking record from storage:", error);
    return null;
  }
}

export function clearBookingRecord() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(BOOKING_STORAGE_KEY);
}