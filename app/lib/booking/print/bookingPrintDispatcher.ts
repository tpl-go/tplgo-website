"use client";

import type { BookingItem } from "@/app/lib/booking/bookingStorage";
import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { printFlightTicketFromConfirmation } from "@/app/lib/booking/print/flightTicketPrint";
import { printGenericVoucherFromBooking } from "@/app/lib/booking/print/genericVoucherPrint";

type AnyObj = Record<string, any>;

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
    if (!payload) {
      alert("Ticket payload not found.");
      return;
    }

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