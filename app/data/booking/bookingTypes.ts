export type BookingStatus =
  | "INITIATED"
  | "REVIEWED"
  | "PAYMENT_PENDING"
  | "PAYMENT_SUCCESS"
  | "PAYMENT_FAILED"
  | "BOOKING_CONFIRMED"
  | "BOOKING_EXPIRED";

export type PaymentStatus =
  | "NOT_STARTED"
  | "PENDING"
  | "SUCCESS"
  | "FAILED";

export function generateBookingId(serial: number) {
  const padded = String(serial).padStart(5, "0");
  const year = new Date().getFullYear();
  return `TPL-BOOK-${year}-${padded}`;
}