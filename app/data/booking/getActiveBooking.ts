import { getBookingRecord, clearBookingRecord } from "./bookingStorage";
import { isBookingExpired } from "./bookingSession";

export function getActiveBooking() {
  const booking = getBookingRecord();

  if (!booking) return null;

  if (isBookingExpired(booking.expiresAt)) {
    clearBookingRecord();
    return null;
  }

  return booking;
}