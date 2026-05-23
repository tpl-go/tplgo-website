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

function getHotelBookingById(bookingId: string) {
  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === "hotel"
  );
}

export function getQuote({ bookingId }: QuoteParams) {
  const booking = getHotelBookingById(bookingId);

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
  const booking = getHotelBookingById(bookingId);

  if (!booking) {
    throw new Error("Hotel booking not found");
  }

  const payloadStorageKey = booking.payloadStorageKey;
  const payload = getBookingPayload<any>(payloadStorageKey);

  if (!payload) {
    throw new Error("Booking payload not found");
  }

  const draft = payload?.manageDraft || {};
  const selectedVariant = draft?.selectedVariant;

  if (selectedVariant) {
    payload.selectedVariant = selectedVariant;
    payload.roomType =
      selectedVariant?.name ||
      selectedVariant?.roomType ||
      selectedVariant?.title ||
      payload.roomType;
  }

  const previousPaidAmount = Number(
    payload?.fare?.totalPaid ||
      payload?.fare?.totalAmount ||
      booking.amount ||
      0
  );

  const paidAmount = Number(payment?.paidAmount || 0);
  const refundCredit = Number(payment?.refundCredit || 0);

  const finalAmount = Math.max(previousPaidAmount + paidAmount - refundCredit, 0);

  payload.fare = {
    ...(payload?.fare || {}),
    totalAmount: finalAmount,
    totalPaid: finalAmount,
    walletBreakdown: {
      ...(payload?.fare?.walletBreakdown || {}),
      managePromoUsed: 0,
      manageEarnedUsed: 0,
      manageRefundUsed: Number(payment?.refundUsed || 0),
      manageTotalWalletUsed: Number(payment?.totalWalletUsed || 0),
      manageRefundCredit: refundCredit,
    },
  };

  payload.managePayment = {
    method: payment?.method || "",
    paidAmount,
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: Number(payment?.refundUsed || 0),
    totalWalletUsed: Number(payment?.totalWalletUsed || 0),
    refundCredit,
    paidAt: new Date().toISOString(),
  };

  if (payload.manageDraft) {
    delete payload.manageDraft;
  }

  localStorage.setItem(payloadStorageKey, JSON.stringify(payload));

  return {
    success: true,
  };
}