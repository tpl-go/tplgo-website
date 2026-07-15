"use client";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";

type ManageSection = "room-addons" | "update";

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

function getHomestayBookingById(bookingId: string) {
  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === "homestay"
  );
}

export function getQuote({ bookingId }: QuoteParams) {
  const booking = getHomestayBookingById(bookingId);

  if (!booking?.payloadStorageKey) {
    return {
      totalAmount: 0,
      currency: "INR",
      settlementMode: "save",
    };
  }

  const payload = getBookingPayload<any>(booking.payloadStorageKey);
  const draft = payload?.manageDraft || {};
  const roomQuote = draft?.roomQuote || {};

  const difference = Number(roomQuote?.difference || 0);

  let settlementMode: "payment" | "wallet_credit" | "save" = "save";

  if (difference > 0) settlementMode = "payment";
  else if (difference < 0) settlementMode = "wallet_credit";

  return {
    totalAmount: difference,
    currency: "INR",
    settlementMode,
  };
}

export function finalize({ bookingId, payment }: FinalizeParams) {
  const booking = getHomestayBookingById(bookingId);

  if (!booking) {
    throw new Error("Homestay booking not found");
  }

  const payloadStorageKey = booking.payloadStorageKey;
  const payload = getBookingPayload<any>(payloadStorageKey || "");

  if (!payload) {
    throw new Error("Booking payload not found");
  }

  const draft = payload?.manageDraft || {};
  const selectedVariant = draft?.selectedVariant;

  if (selectedVariant) {
    payload.selectedVariant = selectedVariant;
    payload.roomType = selectedVariant?.name || payload.roomType;
  }

  const rooms = Number(payload?.rooms || payload?.searchMeta?.rooms || 1);
  const nights = Number(payload?.nights || 1);

  const stayBase = Number(selectedVariant?.price || 0) * rooms * nights;
  const stayTax = Number(selectedVariant?.taxes || 0) * rooms * nights;

  const tripSecureTotal = Number(payload?.tripSecureData?.amount || 0);
  const cabTotal = Number(payload?.cabData?.amount || 0);
  const addOnsTotal = Number(payload?.addonsData?.amount || 0);

  const tplCredit = Number(payload?.tplCredit || 0);
  const appliedOffer = Number(payload?.appliedOffer || 0);

  const finalAmount = Math.max(
    stayBase +
      stayTax +
      tripSecureTotal +
      cabTotal +
      addOnsTotal -
      tplCredit -
      appliedOffer,
    0
  );

  payload.fare = {
    ...(payload?.fare || {}),
    baseFare: stayBase,
    taxesAndFees: stayTax,
    totalAmount: finalAmount,
    totalPaid: finalAmount,
  };

  payload.managePayment = {
    method: payment?.method || "",
    paidAmount: Number(payment?.paidAmount || 0),
    promoUsed: Number(payment?.promoUsed || 0),
    earnedUsed: Number(payment?.earnedUsed || 0),
    refundUsed: Number(payment?.refundUsed || 0),
    totalWalletUsed: Number(payment?.totalWalletUsed || 0),
    refundCredit: Number(payment?.refundCredit || 0),
    paidAt: new Date().toISOString(),
  };

  if (payload.manageDraft) {
    delete payload.manageDraft;
  }

  localStorage.setItem(payloadStorageKey || "", JSON.stringify(payload));

  return {
    success: true,
  };
}
