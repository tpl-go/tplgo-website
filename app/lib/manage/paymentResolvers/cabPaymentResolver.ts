"use client";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";

type ManageSection = "cab-addons" | "update";

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

function getCabBookingById(bookingId: string) {
  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === "cab"
  );
}

export function getQuote({ bookingId }: QuoteParams) {
  const booking = getCabBookingById(bookingId);

  if (!booking?.payloadStorageKey) {
    return {
      totalAmount: 0,
      currency: "INR",
      settlementMode: "save",
    };
  }

  const payload = getBookingPayload<any>(booking.payloadStorageKey);
  const draft = payload?.manageDraft || {};
  const cabQuote = draft?.cabQuote || {};

  const difference = Number(cabQuote?.difference || 0);

  let settlementMode: "payment" | "wallet_credit" | "save" = "save";

  if (difference > 0) settlementMode = "payment";
  else if (difference < 0) settlementMode = "wallet_credit";

  return {
    totalAmount: Math.abs(difference),
    currency: "INR",
    settlementMode,
  };
}

export function finalize({ bookingId, payment }: FinalizeParams) {
  const booking = getCabBookingById(bookingId);

  if (!booking) {
    throw new Error("Cab booking not found");
  }

  const payloadStorageKey = booking.payloadStorageKey;
  const payload = getBookingPayload<any>(payloadStorageKey);

  if (!payload) {
    throw new Error("Booking payload not found");
  }

  const draft = payload?.manageDraft || {};
  const selectedVariant = draft?.selectedVariant;
  const cabQuote = draft?.cabQuote || {};
  const difference = Number(cabQuote?.difference || 0);

  if (selectedVariant) {
    payload.cab = {
      ...(payload.cab || {}),
      id: selectedVariant.id || payload?.cab?.id,
      name: selectedVariant.name || payload?.cab?.name,
      brand: selectedVariant.name || payload?.cab?.brand,
      vehicleType:
        selectedVariant.vehicleType ||
        selectedVariant.cabType ||
        payload?.cab?.vehicleType,
      cabType:
        selectedVariant.cabType ||
        selectedVariant.vehicleType ||
        payload?.cab?.cabType,
      seats: selectedVariant.seats || payload?.cab?.seats,
      luggage: selectedVariant.luggage || payload?.cab?.luggage,
      fuelType: selectedVariant.fuelType || payload?.cab?.fuelType,
      features: selectedVariant.features || payload?.cab?.features || [],
    };

    payload.cabId = selectedVariant.id || payload?.cabId;
    payload.vehicleId = selectedVariant.id || payload?.vehicleId;
    payload.cabName = selectedVariant.name || payload?.cabName;
    payload.vehicleName = selectedVariant.name || payload?.vehicleName;
    payload.cabType =
      selectedVariant.cabType || selectedVariant.vehicleType || payload?.cabType;
    payload.vehicleType =
      selectedVariant.vehicleType || selectedVariant.cabType || payload?.vehicleType;
  }

  const fare = payload?.fare || {};

  const previousTotal = Number(
    fare?.totalPaid ||
      fare?.totalAmount ||
      fare?.totalPayable ||
      booking.amount ||
      0
  );

  const updatedTotalAmount = Math.max(previousTotal + difference, 0);

  payload.fare = {
    ...fare,
    baseFare:
      selectedVariant?.price !== undefined
        ? Number(selectedVariant.price || 0)
        : Number(fare?.baseFare || 0),
    gst:
      selectedVariant?.taxes !== undefined
        ? Number(selectedVariant.taxes || 0)
        : Number(fare?.gst || fare?.taxesAndFees || 0),
    taxesAndFees:
      selectedVariant?.taxes !== undefined
        ? Number(selectedVariant.taxes || 0)
        : Number(fare?.taxesAndFees || fare?.gst || 0),
    totalAmount: updatedTotalAmount,
    totalPaid: updatedTotalAmount,
    totalPayable: updatedTotalAmount,
    cabChangeDifference: difference,
  };

  payload.managePayment = {
    method: payment?.method || "",
    paidAmount: Number(payment?.paidAmount || 0),
    promoUsed: Number(payment?.promoUsed || 0),
    earnedUsed: Number(payment?.earnedUsed || 0),
    refundUsed: Number(payment?.refundUsed || 0),
    totalWalletUsed: Number(payment?.totalWalletUsed || 0),
    refundCredit: Number(payment?.refundCredit || 0),
    updatedTotalAmount,
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