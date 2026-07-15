"use client";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";

import { getAllBookings } from "@/app/lib/booking/bookingStorage";

type ManageSection =
  | "seat-addons"
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

function getTrainBookingById(
  bookingId: string
) {
  return getAllBookings().find(
    (item) =>
      item.id === bookingId &&
      item.type === "train"
  );
}

/**
 * QUOTE
 */
export function getQuote({
  bookingId,
}: QuoteParams) {
  const booking =
    getTrainBookingById(
      bookingId
    );

  if (
    !booking?.payloadStorageKey
  ) {
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
    payload?.manageDraft ||
    {};

  const seatQuote =
    draft?.seatQuote || {};

  const difference = Number(
    seatQuote?.difference ||
      0
  );

  let settlementMode:
    | "payment"
    | "wallet_credit"
    | "save" = "save";

  if (difference > 0)
    settlementMode =
      "payment";
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
 * FINALIZE
 */
export function finalize({
  bookingId,
  payment,
}: FinalizeParams) {
  const booking =
    getTrainBookingById(
      bookingId
    );

  if (!booking) {
    throw new Error(
      "Train booking not found"
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
    payload?.manageDraft ||
    {};

  const selectedSeat =
    draft?.selectedSeat;

  if (selectedSeat) {
    payload.selectedSeat =
      selectedSeat;

    payload.coachClass =
      selectedSeat?.className ||
      payload.coachClass;

    payload.travelClass =
      selectedSeat?.className ||
      payload.travelClass;
  }

  const travellerCount =
    Array.isArray(
      payload?.travellers
    )
      ? payload.travellers
          .length || 1
      : 1;

  const baseFare =
    Number(
      selectedSeat?.price ||
        payload?.fare
          ?.baseFare ||
        0
    ) * travellerCount;

  const taxes =
    Number(
      selectedSeat?.taxes ||
        payload?.fare?.tax ||
        0
    ) * travellerCount;

  const reservationCharge =
    Number(
      payload?.fare
        ?.reservationCharge ||
        0
    );

  const superfastCharge =
    Number(
      payload?.fare
        ?.superfastCharge ||
        0
    );

  const otherCharges =
    Number(
      payload?.fare
        ?.otherCharges ||
        0
    );

  const insuranceAmount =
    Number(
      payload?.fare
        ?.insuranceAmount ||
        0
    );

  const foodAmount =
    Number(
      payload?.fare
        ?.foodAmount ||
        0
    );

  const tplCredit =
    Number(
      payload?.fare
        ?.tplCredit || 0
    );

  const appliedOffer =
    Number(
      payload?.fare
        ?.appliedOffer ||
        0
    );

  const finalAmount =
    Math.max(
      baseFare +
        taxes +
        reservationCharge +
        superfastCharge +
        otherCharges +
        insuranceAmount +
        foodAmount -
        tplCredit -
        appliedOffer,
      0
    );

  /**
   * Fare Update
   */
  payload.fare = {
    ...(payload?.fare ||
      {}),

    baseFare,

    tax: taxes,

    reservationCharge,

    superfastCharge,

    otherCharges,

    insuranceAmount,

    foodAmount,

    totalAmount:
      finalAmount,

    totalPaid:
      finalAmount,
  };

  /**
   * Payment Store
   */
  payload.managePayment = {
    method:
      payment?.method || "",

    paidAmount: Number(
      payment?.paidAmount ||
        0
    ),

    promoUsed: Number(
      payment?.promoUsed ||
        0
    ),

    earnedUsed: Number(
      payment?.earnedUsed ||
        0
    ),

    refundUsed: Number(
      payment?.refundUsed ||
        0
    ),

    totalWalletUsed:
      Number(
        payment?.totalWalletUsed ||
          0
      ),

    refundCredit: Number(
      payment?.refundCredit ||
        0
    ),

    updatedTotalAmount:
      finalAmount,

    paidAt:
      new Date().toISOString(),
  };

  /**
   * Cleanup
   */
  if (payload.manageDraft) {
    delete payload.manageDraft;
  }

  localStorage.setItem(
    payloadStorageKey || "",
    JSON.stringify(payload)
  );

  return {
    success: true,
  };
}
