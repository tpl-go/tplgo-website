"use client";

export type BookingType =
  | "flight"
  | "hotel"
  | "homestay"
  | "package"
  | "bus"
  | "train"
  | "cab"
  | "cruise"
  | "visa"
  | "insurance";

export type BookingStatus = "upcoming" | "completed" | "cancelled";
export type RefundStatus = "processing" | "processed" | "failed";

export type BookingItem = {
  id: string;
  type: BookingType;
  title: string;
  bookingDate: string;
  travelDate: string;
  travellers: string;
  amount: number;
  status: BookingStatus;
  mobile: string;
  leadTraveller: {
    name: string;
    mobile: string;
    email?: string;
  };
  ticketType?: BookingType;
  ticketUrl?: string;
  voucherUrl?: string;
  detailRoute?: string;
  payloadStorageKey?: string;

  cancelMeta?: {
    canCancel: boolean;
    cancellationPolicyText: string;
    refundableAmount: number;
    cancellationCharge: number;
    cancelledAt?: string;
    cancelReason?: string;
  };

  refund?: {
    amount: number;
    status: RefundStatus;
    initiatedAt?: string;
    completedAt?: string;
  };
};

const BOOKING_STORAGE_KEY = "tpl_bookings_v1";
export const BOOKING_UPDATED_EVENT = "tpl_booking_updated_event";

function generateBookingId(type: BookingType) {
  const prefixMap: Record<BookingType, string> = {
    flight: "FLT",
    hotel: "HTL",
    homestay: "HMS",
    package: "PKG",
    bus: "BUS",
    train: "TRN",
    cab: "CAB",
    cruise: "CRS",
    visa: "VSA",
    insurance: "INS",
  };

  const random = Math.floor(1000 + Math.random() * 9000);
  return `TPL-${prefixMap[type]}-${Date.now()}-${random}`;
}

function dispatchBookingUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
}

function isJourneyCompleted(travelDate: string) {
  const date = new Date(travelDate);
  if (Number.isNaN(date.getTime())) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  date.setHours(0, 0, 0, 0);

  return date < today;
}

function calculatePayloadAmount(payload: any) {
  const reviewData = payload?.reviewData || {};
  const seatMealData = payload?.seatMealData || {};
  const cabData = payload?.cabData || {};
  const insuranceData = payload?.insuranceData || {};
  const addonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;
  const paymentData = payload?.paymentData || {};

  const pricing = reviewData?.pricing || {};

  const passengerCount =
    (reviewData?.passengers?.adults || 0) +
    (reviewData?.passengers?.children || 0) +
    (reviewData?.passengers?.infants || 0);

  return (
    paymentData?.totalPaid ||
    payload?.fare?.totalPaid ||
    payload?.fare?.totalAmount ||
    payload?.fareBreakup?.finalTotal ||
    payload?.finalTotal ||
    Math.max(
      (pricing.perAdultBaseFare || 0) * passengerCount +
        (pricing.tax || 0) +
        (pricing.surcharge || 0) +
        (seatMealData?.seatTotal || 0) +
        (seatMealData?.mealTotal || 0) +
        (cabData?.cabPrice || 0) +
        (insuranceData?.insurancePrice || 0) +
        (addonsData?.addonsPrice || 0) -
        (offerData?.discountAmount || 0) -
        (pricing.discount || 0) -
        (pricing.tplCredit || 0),
      0
    )
  );
}

function syncDerivedBookingState(bookings: BookingItem[]) {
  return bookings.map((booking) => {
    if (booking.status === "cancelled") {
      return {
        ...booking,
        cancelMeta: booking.cancelMeta
          ? {
              ...booking.cancelMeta,
              canCancel: false,
            }
          : booking.cancelMeta,
      };
    }

    const nextStatus: BookingStatus = isJourneyCompleted(booking.travelDate)
      ? "completed"
      : "upcoming";

    return {
      ...booking,
      status: nextStatus,
      cancelMeta: booking.cancelMeta
        ? {
            ...booking.cancelMeta,
            canCancel: nextStatus === "upcoming",
          }
        : booking.cancelMeta,
      voucherUrl:
        nextStatus === "completed"
          ? booking.voucherUrl || `/voucher/${booking.id}.pdf`
          : booking.voucherUrl,
    };
  });
}

function resolveBookingAmountFromPayload(booking: BookingItem) {
  if (typeof window === "undefined") return booking.amount;
  if (!booking.payloadStorageKey) return booking.amount;

  try {
    const payloadRaw = localStorage.getItem(booking.payloadStorageKey);
    if (!payloadRaw) return booking.amount;

    const payload = JSON.parse(payloadRaw);
    const payloadAmount = calculatePayloadAmount(payload);

    return payloadAmount || booking.amount || 0;
  } catch {
    return booking.amount;
  }
}

function saveAllBookings(bookings: BookingItem[]) {
  if (typeof window === "undefined") return;

  const synced = syncDerivedBookingState(bookings);
  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(synced));
  dispatchBookingUpdate();
}

export function getAllBookings(): BookingItem[] {
  if (typeof window === "undefined") return [];

  try {
    const raw = localStorage.getItem(BOOKING_STORAGE_KEY);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as BookingItem[];

    const synced = syncDerivedBookingState(parsed);

    const final = synced.map((booking) => {
      const amount = resolveBookingAmountFromPayload(booking);

      return {
        ...booking,
        amount,
      };
    });

    localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(final));

    return final;
  } catch {
    return [];
  }
}

export function getBookingById(id: string) {
  return getAllBookings().find((booking) => booking.id === id) || null;
}

export function getBookingsByMobile(mobile: string): BookingItem[] {
  if (!mobile) return [];
  const all = getAllBookings();
  return all.filter((booking) => booking.mobile === mobile);
}

export function getRefundEstimate(booking: BookingItem) {
  const amount = Number(booking.amount || 0);
  const travelDate = new Date(booking.travelDate);
  const now = new Date();

  const diffMs = travelDate.getTime() - now.getTime();
  const diffDays = diffMs / (1000 * 60 * 60 * 24);

  let refundPercent = 0;

  if (diffDays > 7) refundPercent = 0.8;
  else if (diffDays > 3) refundPercent = 0.5;
  else if (diffDays > 0) refundPercent = 0.2;
  else refundPercent = 0;

  const refundableAmount = Math.max(Math.round(amount * refundPercent), 0);
  const cancellationCharge = Math.max(amount - refundableAmount, 0);

  return {
    refundableAmount,
    cancellationCharge,
    canCancel:
      booking.status === "upcoming" &&
      !isJourneyCompleted(booking.travelDate),
    cancellationPolicyText:
      diffDays > 7
        ? "80% refundable as per current cancellation slab."
        : diffDays > 3
        ? "50% refundable as per current cancellation slab."
        : diffDays > 0
        ? "20% refundable as per current cancellation slab."
        : "This booking is no longer refundable.",
  };
}

export function addBooking(
  booking: Omit<BookingItem, "id" | "bookingDate">
) {
  const existing = getAllBookings();

  const incomingLeadName = String(booking.leadTraveller?.name || "")
  .toLowerCase()
  .trim();

const incomingLeadEmail = String(booking.leadTraveller?.email || "")
  .toLowerCase()
  .trim();

const duplicate = existing.find((item) => {
  const existingLeadName = String(item.leadTraveller?.name || "")
    .toLowerCase()
    .trim();

  const existingLeadEmail = String(item.leadTraveller?.email || "")
    .toLowerCase()
    .trim();

  return (
    item.type === booking.type &&
    item.mobile === booking.mobile &&
    item.title === booking.title &&
    item.travelDate === booking.travelDate &&
    item.amount === booking.amount &&
    existingLeadName === incomingLeadName &&
    existingLeadEmail === incomingLeadEmail
  );
});

  if (duplicate) return duplicate;

  const tempBooking: BookingItem = {
    ...booking,
    id: "temp-id",
    bookingDate: new Date().toISOString(),
  };

  const estimate = getRefundEstimate(tempBooking);

  const newBooking: BookingItem = {
    ...booking,
    id: generateBookingId(booking.type),
    bookingDate: new Date().toISOString(),
    status: isJourneyCompleted(booking.travelDate)
      ? "completed"
      : booking.status,
    cancelMeta: {
      canCancel:
        booking.status !== "cancelled" &&
        !isJourneyCompleted(booking.travelDate) &&
        estimate.canCancel,
      cancellationPolicyText: estimate.cancellationPolicyText,
      refundableAmount: estimate.refundableAmount,
      cancellationCharge: estimate.cancellationCharge,
    },
  };

  const updated = [newBooking, ...existing];
  saveAllBookings(updated);

  return newBooking;
}

export function updateBooking(
  id: string,
  updater: Partial<BookingItem> | ((booking: BookingItem) => BookingItem)
) {
  const bookings = getAllBookings();

  let updatedBooking: BookingItem | null = null;

  const updated = bookings.map((booking) => {
    if (booking.id !== id) return booking;

    const nextBooking =
      typeof updater === "function"
        ? updater(booking)
        : { ...booking, ...updater };

    updatedBooking = nextBooking;
    return nextBooking;
  });

  saveAllBookings(updated);
  return updatedBooking;
}

export function cancelBooking(id: string, reason = "Cancelled by user") {
  const bookings = getAllBookings();

  let cancelledBooking: BookingItem | null = null;

  const updated = bookings.map((booking) => {
    if (booking.id !== id) return booking;

    const estimate = getRefundEstimate(booking);
    const now = new Date().toISOString();

    const nextBooking: BookingItem = {
      ...booking,
      status: "cancelled",
      cancelMeta: {
        canCancel: false,
        cancellationPolicyText: estimate.cancellationPolicyText,
        refundableAmount: estimate.refundableAmount,
        cancellationCharge: estimate.cancellationCharge,
        cancelledAt: now,
        cancelReason: reason,
      },
      refund: {
        amount: estimate.refundableAmount,
        status: "processing",
        initiatedAt: now,
      },
    };

    cancelledBooking = nextBooking;
    return nextBooking;
  });

  saveAllBookings(updated);

  setTimeout(() => {
    const latest = getAllBookings();

    const final = latest.map((booking) => {
      if (booking.id !== id) return booking;
      if (!booking.refund) return booking;

      return {
        ...booking,
        refund: {
          ...booking.refund,
          status: "processed",
          completedAt: new Date().toISOString(),
        },
      };
    });

    saveAllBookings(final);
  }, 5000);

  return cancelledBooking;
}

export function clearAllBookings() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(BOOKING_STORAGE_KEY);
  dispatchBookingUpdate();
}