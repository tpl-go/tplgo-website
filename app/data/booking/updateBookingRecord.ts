import type { BookingRecord } from "./bookingSchema";
import type { BookingStatus, PaymentStatus } from "./bookingTypes";
import {
  canMoveBookingStatus,
  canMovePaymentStatus,
} from "./bookingStateMachine";

export function updateBookingStatus(
  booking: BookingRecord,
  nextStatus: BookingStatus
): BookingRecord {
  if (!canMoveBookingStatus(booking.bookingStatus, nextStatus)) {
    throw new Error(
      `Invalid booking status transition: ${booking.bookingStatus} -> ${nextStatus}`
    );
  }

  return {
    ...booking,
    bookingStatus: nextStatus,
  };
}

export function updatePaymentStatus(
  booking: BookingRecord,
  nextStatus: PaymentStatus
): BookingRecord {
  if (!canMovePaymentStatus(booking.paymentStatus, nextStatus)) {
    throw new Error(
      `Invalid payment status transition: ${booking.paymentStatus} -> ${nextStatus}`
    );
  }

  return {
    ...booking,
    paymentStatus: nextStatus,
  };
}

export function updatePaymentMethod(
  booking: BookingRecord,
  paymentMethod: string
): BookingRecord {
  return {
    ...booking,
    paymentMethod,
  };
}