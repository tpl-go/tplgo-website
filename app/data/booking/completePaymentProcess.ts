import { getActiveBooking } from "./getActiveBooking";
import { saveBookingRecord } from "./bookingStorage";
import {
  updateBookingStatus,
  updatePaymentStatus,
} from "./updateBookingRecord";

export function handlePaymentSuccess() {
  const booking = getActiveBooking();
  if (!booking) return null;

  const paymentDone = updatePaymentStatus(booking, "SUCCESS");
  const bookingDone = updateBookingStatus(paymentDone, "PAYMENT_SUCCESS");

  saveBookingRecord(bookingDone);

  return bookingDone;
}

export function handlePaymentFailure() {
  const booking = getActiveBooking();
  if (!booking) return null;

  const paymentFailed = updatePaymentStatus(booking, "FAILED");
  const bookingFailed = updateBookingStatus(paymentFailed, "PAYMENT_FAILED");

  saveBookingRecord(bookingFailed);

  return bookingFailed;
}