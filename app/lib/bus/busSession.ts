import { SelectedBusBookingPayload } from "./busTypes";

const BUS_BOOKING_KEY = "tplBusBookingData";

export function setBusBookingSession(payload: SelectedBusBookingPayload) {
  sessionStorage.setItem(BUS_BOOKING_KEY, JSON.stringify(payload));
}

export function getBusBookingSession(): SelectedBusBookingPayload | null {
  const raw = sessionStorage.getItem(BUS_BOOKING_KEY);
  if (!raw) return null;

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

export function clearBusBookingSession() {
  sessionStorage.removeItem(BUS_BOOKING_KEY);
}