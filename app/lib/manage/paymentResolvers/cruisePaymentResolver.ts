"use client";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";

type ManageSection =
  | "cabin-addons"
  | "update";

type QuoteParams = {
  bookingId: string;
  section?: ManageSection | string;
};

type FinalizeParams = {
  bookingId: string;
  section?: ManageSection | string;

  payment?: {
    method?: string;
    paidAmount?: number;
    promoUsed?: number;
    earnedUsed?: number;
    refundUsed?: number;
    totalWalletUsed?: number;
    refundCredit?: number;
  };
};

function getCruiseBookingById(
  bookingId: string
) {
  return getAllBookings().find(
    (item) =>
      item.id === bookingId &&
      item.type === "cruise"
  );
}

/**
 * ✅ QUOTE
 */
export function getQuote({
  bookingId,
}: QuoteParams) {
  const booking =
    getCruiseBookingById(
      bookingId
    );

  if (!booking?.payloadStorageKey) {
    return {
      totalAmount: 0,
      currency: "INR",
      settlementMode: "save",
    };
  }

  const payload =
    getBookingPayload<any>(
      booking.payloadStorageKey
    );

  const draft =
    payload?.manageDraft || {};

  const cabinQuote =
    draft?.cabinQuote || {};

  const difference = Number(
    cabinQuote?.difference || 0
  );

  let settlementMode:
    | "payment"
    | "wallet_credit"
    | "save" = "save";

  if (difference > 0)
    settlementMode = "payment";
  else if (difference < 0)
    settlementMode =
      "wallet_credit";

  return {
    totalAmount:
      Math.abs(difference),
    currency: "INR",
    settlementMode,
  };
}

/**
 * ✅ FINALIZE
 */
export function finalize({
  bookingId,
  payment,
}: FinalizeParams) {
  const booking =
    getCruiseBookingById(
      bookingId
    );

  if (!booking) {
    throw new Error(
      "Cruise booking not found"
    );
  }

  const payloadStorageKey =
    booking.payloadStorageKey;

  const payload =
    getBookingPayload<any>(
      payloadStorageKey
    );

  if (!payload) {
    throw new Error(
      "Booking payload not found"
    );
  }

  const draft =
    payload?.manageDraft || {};

  const selectedCabin =
    draft?.selectedCabin;

  if (selectedCabin) {
    payload.selectedCabin =
      selectedCabin;
  }

  const pricingSummary =
    payload?.cabins
      ?.pricingSummary || {};

  const cabins = Number(
    pricingSummary?.cabinsCount ||
      1
  );

  const nights = Number(
    payload?.cruise?.nights ||
      payload?.cruise
        ?.durationNights ||
      1
  );

  const cabinBase =
    Number(
      selectedCabin?.price || 0
    ) *
    cabins *
    nights;

  const cabinTaxes =
    Number(
      selectedCabin?.taxes || 0
    ) *
    cabins *
    nights;

  const portCharges = Number(
    pricingSummary?.portCharges ||
      0
  );

  const gratuityCharges =
    Number(
      pricingSummary?.gratuityCharges ||
        0
    );

  const addonsTotal = Number(
    pricingSummary?.addonsTotal ||
      0
  );

  const insuranceTotal = Number(
    payload?.paymentData
      ?.insuranceAmount || 0
  );

  const tplCredit = Number(
    payload?.paymentData
      ?.tplCredit || 0
  );

  const appliedOffer = Number(
    payload?.offer
      ?.discountAmount || 0
  );

  const finalAmount = Math.max(
    cabinBase +
      cabinTaxes +
      portCharges +
      gratuityCharges +
      addonsTotal +
      insuranceTotal -
      tplCredit -
      appliedOffer,
    0
  );

  /**
   * ✅ Pricing summary update
   */
  payload.cabins = {
    ...(payload?.cabins || {}),

    pricingSummary: {
      ...(pricingSummary || {}),

      cabinsTotal: cabinBase,
      taxesAndFees:
        cabinTaxes,
      grandTotal: finalAmount,
    },
  };

  /**
   * ✅ Manage payment
   */
  payload.managePayment = {
    method:
      payment?.method || "",

    paidAmount: Number(
      payment?.paidAmount || 0
    ),

    promoUsed: Number(
      payment?.promoUsed || 0
    ),

    earnedUsed: Number(
      payment?.earnedUsed || 0
    ),

    refundUsed: Number(
      payment?.refundUsed || 0
    ),

    totalWalletUsed: Number(
      payment?.totalWalletUsed ||
        0
    ),

    refundCredit: Number(
      payment?.refundCredit || 0
    ),

    paidAt:
      new Date().toISOString(),
  };

  /**
   * ✅ Draft cleanup
   */
  if (payload.manageDraft) {
    delete payload.manageDraft;
  }

  localStorage.setItem(
    payloadStorageKey,
    JSON.stringify(payload)
  );

  return {
    success: true,
  };
}