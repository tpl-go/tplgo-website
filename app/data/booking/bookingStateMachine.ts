import type { BookingStatus, PaymentStatus } from "./bookingTypes";

export const bookingStatusFlow: Record<BookingStatus, BookingStatus[]> = {
  INITIATED: ["REVIEWED", "PAYMENT_PENDING", "BOOKING_EXPIRED"],
  REVIEWED: ["PAYMENT_PENDING", "BOOKING_EXPIRED"],
  PAYMENT_PENDING: ["PAYMENT_SUCCESS", "PAYMENT_FAILED", "BOOKING_EXPIRED"],
  PAYMENT_SUCCESS: ["BOOKING_CONFIRMED"],
  PAYMENT_FAILED: ["PAYMENT_PENDING", "BOOKING_EXPIRED"],
  BOOKING_CONFIRMED: [],
  BOOKING_EXPIRED: [],
};

export const paymentStatusFlow: Record<PaymentStatus, PaymentStatus[]> = {
  NOT_STARTED: ["PENDING"],
  PENDING: ["SUCCESS", "FAILED"],
  SUCCESS: [],
  FAILED: ["PENDING"],
};

export function canMoveBookingStatus(
  current: BookingStatus,
  next: BookingStatus
) {
  return bookingStatusFlow[current].includes(next);
}

export function canMovePaymentStatus(
  current: PaymentStatus,
  next: PaymentStatus
) {
  return paymentStatusFlow[current].includes(next);
}