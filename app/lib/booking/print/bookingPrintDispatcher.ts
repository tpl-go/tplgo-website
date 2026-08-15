"use client";

import type { BookingItem } from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { printFlightTicketFromConfirmation } from "@/app/lib/booking/print/flightTicketPrint";
import { printGenericVoucherFromBooking } from "@/app/lib/booking/print/genericVoucherPrint";

type AnyObj = Record<string, any>;

type BookingDocumentAvailability = {
  available: boolean;
  label: string;
  reason?: string;
};

function buildFlightPriceBreakup(payload: AnyObj) {
  const reviewData = payload?.reviewData || {};
  const paymentData = payload?.paymentData || {};
  const seatMealData = payload?.seatMealData || {};
  const cabData = payload?.cabData || {};
  const insuranceData = payload?.insuranceData || {};
  const addonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;

  const pricing = reviewData?.pricing || {};

  const passengerCount =
    (reviewData?.passengers?.adults || 0) +
    (reviewData?.passengers?.children || 0) +
    (reviewData?.passengers?.infants || 0);

  const totalAmount =
    payload?.managePayment?.updatedTotalAmount ||
    paymentData?.totalPaid ||
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
    );

  return {
    baseFare: (pricing.perAdultBaseFare || 0) * passengerCount,
    tax: pricing.tax || 0,
    surcharge: pricing.surcharge || 0,
    seatTotal: seatMealData?.seatTotal || 0,
    mealTotal: seatMealData?.mealTotal || 0,
    cabTotal: cabData?.cabPrice || 0,
    insuranceTotal: insuranceData?.insurancePrice || 0,
    addonsTotal: addonsData?.addonsPrice || 0,
    appliedOffer: offerData?.discountAmount || 0,
    discount: pricing.discount || 0,
    tplCredit: pricing.tplCredit || 0,
    totalAmount,
  };
}

export function printBookingDocument(booking: BookingItem) {
  const payload = booking.payloadStorageKey
    ? getBookingPayload<AnyObj>(booking.payloadStorageKey)
    : null;

  if (booking.type === "flight") {
    const availability = getBookingDocumentAvailability(booking, payload);
    if (!availability.available) {
      alert(availability.reason || "Ticket not issued yet.");
      return;
    }

    const ticketUrl = getFlightTicketUrl(booking, payload);
    if (ticketUrl) {
      window.open(ticketUrl, "_blank", "noopener,noreferrer");
      return;
    }

    if (!payload) return;

    printFlightTicketFromConfirmation({
      bookingId: booking.id,
      data: {
        ...payload,
        bookingId: booking.id,
      },
      priceBreakup: buildFlightPriceBreakup(payload),
    });

    return;
  }

  printGenericVoucherFromBooking({
    booking,
    payload,
  });
}

export function getBookingDocumentAvailability(
  booking: BookingItem,
  payload: AnyObj | null = booking.payloadStorageKey
    ? getBookingPayload<AnyObj>(booking.payloadStorageKey)
    : null
): BookingDocumentAvailability {
  if (booking.type !== "flight") {
    return {
      available: true,
      label: booking.type === "hotel" ? "Download Voucher" : "Download Document",
    };
  }

  if (getFlightTicketUrl(booking, payload)) {
    return {
      available: true,
      label: "Download Ticket",
    };
  }

  if (isTestFlightBooking(booking, payload)) {
    return {
      available: false,
      label: "Ticket Not Issued",
      reason: "Ticket unavailable in TEST mode. Supplier PNR and ticket are not issued.",
    };
  }

  if (!payload) {
    return {
      available: false,
      label: "Ticket Not Issued",
      reason: "Ticket not issued yet. No authoritative supplier ticket payload is available for this booking.",
    };
  }

  if (!hasIssuedFlightTicket(payload)) {
    return {
      available: false,
      label: "Ticket Not Issued",
      reason: "Ticket not issued yet. Download will be available after supplier ticketing is complete.",
    };
  }

  return {
    available: true,
    label: "Download Ticket",
  };
}

function getFlightTicketUrl(booking: BookingItem, payload: AnyObj | null) {
  const candidate =
    booking.ticketUrl ||
    payload?.ticketUrl ||
    payload?.ticket?.url ||
    payload?.supplierTicket?.url;
  return typeof candidate === "string" && candidate.trim() ? candidate.trim() : "";
}

function hasIssuedFlightTicket(payload: AnyObj) {
  if (payload?.ticketingAllowed === false) return false;
  if (payload?.supplierBookingDisabled === true) return false;
  if (payload?.safetyFlags?.supplierBookingDisabled === true) return false;

  return Boolean(
    safeText(payload?.ticketNumber) ||
      safeText(payload?.ticket?.number) ||
      safeText(payload?.supplierTicket?.ticketNumber) ||
      safeText(payload?.pnr) ||
      safeText(payload?.supplierPnr)
  );
}

function isTestFlightBooking(booking: BookingItem, payload: AnyObj | null) {
  const safetyFlags = payload?.safetyFlags || {};
  return Boolean(
    payload?.supplierBookingDisabled === true ||
      safetyFlags?.supplierBookingDisabled === true ||
      payload?.backendTestPaymentConfirmation ||
      payload?.backendSimulation ||
      payload?.testStatus === "TPL_TEST_BOOKING_CONFIRMED" ||
      booking.bookingStatus === "TPL_TEST_BOOKING_CONFIRMED"
  );
}

function safeText(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}
