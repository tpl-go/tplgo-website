import { getActiveBooking } from "./getActiveBooking";
import { saveBookingRecord } from "./bookingStorage";
import { updateBookingStatus } from "./updateBookingRecord";

export function confirmBooking() {
  const booking = getActiveBooking();
  if (!booking) return null;

  const confirmedBooking = updateBookingStatus(
    booking,
    "BOOKING_CONFIRMED"
  );

  saveBookingRecord(confirmedBooking);

  return confirmedBooking;
}