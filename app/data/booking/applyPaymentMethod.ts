import { getActiveBooking } from "./getActiveBooking";
import { saveBookingRecord } from "./bookingStorage";
import { updatePaymentMethod } from "./updateBookingRecord";

export function applyPaymentMethod(paymentMethod: string) {
  const booking = getActiveBooking();

  if (!booking) return null;

  const updatedBooking = updatePaymentMethod(booking, paymentMethod);
  saveBookingRecord(updatedBooking);

  return updatedBooking;
}