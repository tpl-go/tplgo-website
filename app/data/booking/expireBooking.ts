import { getActiveBooking } from "./getActiveBooking";
import { saveBookingRecord, clearBookingRecord } from "./bookingStorage";
import { updateBookingStatus } from "./updateBookingRecord";

export function expireBooking() {
  const booking = getActiveBooking();

  if (!booking) {
    clearBookingRecord();
    return null;
  }

  try {
    const expiredBooking = updateBookingStatus(
      booking,
      "BOOKING_EXPIRED"
    );

    saveBookingRecord(expiredBooking);
    return expiredBooking;
  } catch (error) {
    // fallback: force clear if invalid transition
    clearBookingRecord();
    return null;
  }
}