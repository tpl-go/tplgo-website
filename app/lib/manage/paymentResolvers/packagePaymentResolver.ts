"use client";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";

type ManageSection = "package-addons" | "update";

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

function getPackageBookingById(bookingId: string) {
  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === "package"
  );
}

/**
 * ✅ QUOTE
 */
export function getQuote({ bookingId }: QuoteParams) {
  const booking = getPackageBookingById(bookingId);

  if (!booking?.payloadStorageKey) {
    return {
      totalAmount: 0,
      currency: "INR",
      settlementMode: "save",
    };
  }

  const payload = getBookingPayload<any>(booking.payloadStorageKey);
  const draft = payload?.manageDraft || {};
  const addOnQuote = draft?.addOnQuote || {};

  const difference = Number(addOnQuote?.difference || 0);

  let settlementMode: "payment" | "wallet_credit" | "save" = "save";

  if (difference > 0) settlementMode = "payment";
  else if (difference < 0) settlementMode = "wallet_credit";

  return {
    totalAmount: Math.abs(difference),
    currency: "INR",
    settlementMode,
  };
}

/**
 * ✅ FINALIZE
 */
export function finalize({ bookingId, payment }: FinalizeParams) {
  const booking = getPackageBookingById(bookingId);

  if (!booking) {
    throw new Error("Package booking not found");
  }

  const payloadStorageKey = booking.payloadStorageKey;
  const payload = getBookingPayload<any>(payloadStorageKey);

  if (!payload) {
    throw new Error("Booking payload not found");
  }

  const draft = payload?.manageDraft || {};
  const selectedAddOns = draft?.selectedAddOns || [];

  /**
   * 👉 Update add-ons in payload
   */
  payload.addOn = {
    ...(payload?.addOn || {}),
    selectedAddOns,
    totalAmount: selectedAddOns.reduce(
      (sum: number, item: any) => sum + Number(item?.price || 0),
      0
    ),
  };

  /**
   * 👉 Fare recalculation
   */
  const fare = payload?.fare || {};

  const basePrice = Number(fare?.basePrice || 0);
  const upgradedDiffTotal = Number(fare?.upgradedDiffTotal || 0);
  const feesAndTaxes = Number(fare?.feesAndTaxes || 0);
  const insuranceAmount = Number(fare?.insuranceAmount || 0);
  const couponDiscount = Number(fare?.couponDiscount || 0);
  const tplCreditUsed = Number(fare?.tplCreditUsed || 0);

  const addOnTotal = Number(payload?.addOn?.totalAmount || 0);

  const finalAmount = Math.max(
    basePrice +
      upgradedDiffTotal +
      feesAndTaxes +
      insuranceAmount +
      addOnTotal -
      couponDiscount -
      tplCreditUsed,
    0
  );

  payload.fare = {
    ...fare,
    addOnTotal,
    finalPayableAmount: finalAmount,
    grandTotal: finalAmount,
  };

  /**
   * 👉 Payment store (aligned)
   */
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

  /**
   * 👉 Draft cleanup
   */
  if (payload.manageDraft) {
    delete payload.manageDraft;
  }

  localStorage.setItem(payloadStorageKey, JSON.stringify(payload));

  return {
    success: true,
  };
}