import { getActiveBooking } from "./getActiveBooking";
import { saveBookingRecord } from "./bookingStorage";
import {
  updateBookingStatus,
  updatePaymentStatus,
} from "./updateBookingRecord";

export function startPaymentProcess() {
  const booking = getActiveBooking();

  if (!booking) return null;

  const bookingUpdated = updateBookingStatus(booking, "PAYMENT_PENDING");
  const paymentUpdated = updatePaymentStatus(bookingUpdated, "PENDING");

  saveBookingRecord(paymentUpdated);

  return paymentUpdated;
}