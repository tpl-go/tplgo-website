"use client";

import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";

type ManageSection = "seats-addons" | "update";

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

function getBusBookingById(bookingId: string) {
  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === "bus"
  );
}

export function getQuote({ bookingId }: QuoteParams) {
  const booking = getBusBookingById(bookingId);

  if (!booking?.payloadStorageKey) {
    return {
      totalAmount: 0,
      currency: "INR",
      settlementMode: "save",
    };
  }

  const payload = getBookingPayload<any>(booking.payloadStorageKey);
  const draft = payload?.manageDraft || {};
  const seatQuote = draft?.seatQuote || {};

  const difference = Number(seatQuote?.difference || 0);

  let settlementMode: "payment" | "wallet_credit" | "save" = "save";

  if (difference > 0) {
    settlementMode = "payment";
  } else if (difference < 0) {
    settlementMode = "wallet_credit";
  }

  return {
    totalAmount: difference,
    currency: "INR",
    settlementMode,
  };
}

export function finalize({ bookingId, payment }: FinalizeParams) {
  const booking = getBusBookingById(bookingId);

  if (!booking) {
    throw new Error("Bus booking not found");
  }

  const payloadStorageKey = booking.payloadStorageKey;

  const payload = getBookingPayload<any>(payloadStorageKey);

  if (!payload) {
    throw new Error("Booking payload not found");
  }

  const draft = payload?.manageDraft || {};

  const seatSelections = Array.isArray(draft?.seatSelections)
    ? draft.seatSelections
    : [];

  const currentTravellers = Array.isArray(payload?.travellers)
    ? payload.travellers
    : [];

  payload.travellers = currentTravellers.map(
    (traveller: any, index: number) => {
      const travellerId =
        traveller?.id ||
        traveller?.travellerId ||
        `passenger-${index + 1}`;

      const matchedSeat = seatSelections.find(
        (item: any) => item?.travellerId === travellerId
      );

      if (!matchedSeat) return traveller;

      return {
        ...traveller,
        id: travellerId,

        seatNo:
          matchedSeat.newSeatNo ||
          traveller?.seatNo ||
          traveller?.seatNumber ||
          "",

        seatNumber:
          matchedSeat.newSeatNo ||
          traveller?.seatNumber ||
          traveller?.seatNo ||
          "",

        seatPrice: Number(matchedSeat.newPrice || 0),
      };
    }
  );

  const bookingPayload = payload?.bookingPayload || {};

  const selectedSeats = Array.isArray(bookingPayload?.selectedSeats)
    ? bookingPayload.selectedSeats
    : [];

  payload.bookingPayload = {
    ...bookingPayload,

    selectedSeats: selectedSeats.map((seat: any) => {
      const currentSeatNo =
        seat?.seatNumber ||
        seat?.seatNo ||
        seat?.number ||
        seat?.label ||
        "";

      const matchedSeat = seatSelections.find(
        (item: any) =>
          String(item?.oldSeatNo || "").trim().toUpperCase() ===
          String(currentSeatNo || "").trim().toUpperCase()
      );

      if (!matchedSeat) return seat;

      return {
        ...seat,

        seatNumber: matchedSeat.newSeatNo,
        seatNo: matchedSeat.newSeatNo,
        number: matchedSeat.newSeatNo,
        label: matchedSeat.newSeatNo,

        price: Number(matchedSeat.newPrice || 0),
        fare: Number(matchedSeat.newPrice || 0),
        amount: Number(matchedSeat.newPrice || 0),
      };
    }),
  };

  const fare = payload?.fare || {};
  const seatQuote = draft?.seatQuote || {};

  const difference = Number(seatQuote?.difference || 0);

  const previousTotal = Number(
    fare?.totalPaid ||
      fare?.totalAmount ||
      booking.amount ||
      0
  );

  const settlementMode =
    difference > 0
      ? "payment"
      : difference < 0
      ? "wallet_credit"
      : "save";

  const refundCredit =
    settlementMode === "wallet_credit"
      ? Math.abs(difference)
      : 0;

  const payableAmount =
    settlementMode === "payment"
      ? difference
      : 0;

  const finalAmount =
    settlementMode === "payment"
      ? previousTotal + payableAmount
      : settlementMode === "wallet_credit"
      ? Math.max(previousTotal - refundCredit, 0)
      : previousTotal;

  payload.fare = {
    ...fare,

    seatChangeDifference: difference,

    seatUpgradeTotal:
      Number(fare?.seatUpgradeTotal || 0) + difference,

    totalAmount: finalAmount,

    totalPaid: finalAmount,

    walletBreakdown: {
      ...(fare?.walletBreakdown || {}),
      managePromoUsed: 0,
      manageEarnedUsed: 0,
      manageRefundUsed: Number(payment?.refundUsed || 0),
      manageTotalWalletUsed: Number(payment?.totalWalletUsed || 0),
      manageRefundCredit: refundCredit,
    },
  };

  payload.managePayment = {
    method: payment?.method || "",

    paidAmount:
      settlementMode === "payment"
        ? Number(payment?.paidAmount || payableAmount)
        : 0,

    promoUsed: Number(payment?.promoUsed || 0),
    earnedUsed: Number(payment?.earnedUsed || 0),
    refundUsed: Number(payment?.refundUsed || 0),
    totalWalletUsed: Number(payment?.totalWalletUsed || 0),

    refundCredit,

    settlementMode,

    updatedTotalAmount: finalAmount,

    paidAt: new Date().toISOString(),
  };

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