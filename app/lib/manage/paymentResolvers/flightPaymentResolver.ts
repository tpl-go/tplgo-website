import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";
import {
  saveFlightSeatChanges,
  saveFlightMealChanges,
  saveFlightBaggageChanges,
} from "@/app/lib/booking/flightManageUpdate";
import { FLIGHT_ANCILLARY_CATALOG } from "@/app/lib/flights/ancillaries/ancillaryCatalog";

type ManageSection = "seats" | "meals" | "baggage" | "update";

type QuoteParams = {
  bookingId: string;
  section?: ManageSection | string;
};

type FinalizeParams = {
  bookingId: string;
  section?: ManageSection | string;
  seatSelections?: any[];
  mealSelections?: any[];
  baggageSelections?: any[];
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

function round2(value: number) {
  return Number((value || 0).toFixed(2));
}

function calcDiffTotal(items: any[] = []) {
  return round2(
    items.reduce((sum, item) => {
      const oldPrice = Number(item?.oldPrice || 0);
      const newPrice = Number(item?.newPrice || 0);
      return sum + (newPrice - oldPrice);
    }, 0)
  );
}

function getFlightBookingById(bookingId: string) {
  return getAllBookings().find(
    (item) => item.id === bookingId && item.type === "flight"
  );
}

export function getQuote({ bookingId }: QuoteParams) {
  const booking = getFlightBookingById(bookingId);

  if (!booking?.payloadStorageKey) {
    return {
      totalAmount: 0,
      currency: "INR",
      breakdown: {
        seatDiff: 0,
        mealDiff: 0,
        baggageDiff: 0,
      },
    };
  }

  const payload = getBookingPayload<any>(booking.payloadStorageKey);
  const draft = payload?.manageDraft || {};

  const seatDiff = calcDiffTotal(draft.seats || []);
  const mealDiff = calcDiffTotal(draft.meals || []);
  const baggageDiff = calcDiffTotal(draft.baggage || []);

  const total = round2(seatDiff + mealDiff + baggageDiff);

  return {
    totalAmount: total,
    currency: "INR",
    breakdown: {
      seatDiff,
      mealDiff,
      baggageDiff,
    },
  };
}

export function finalize({
  bookingId,
  seatSelections = [],
  mealSelections = [],
  baggageSelections = [],
  payment,
}: FinalizeParams) {
  const booking = getFlightBookingById(bookingId);

  if (!booking) {
    throw new Error("Flight booking not found");
  }

  const payloadStorageKey = booking.payloadStorageKey;
  const payload = getBookingPayload<any>(payloadStorageKey);

  if (!payload) {
    throw new Error("Booking payload not found");
  }

  if (seatSelections.length) {
    saveFlightSeatChanges({
      bookingId,
      payloadStorageKey,
      seats: seatSelections,
    });
  }

  if (mealSelections.length) {
    saveFlightMealChanges({
      bookingId,
      payloadStorageKey,
      meals: mealSelections,
      mealCatalog: FLIGHT_ANCILLARY_CATALOG.meals,
    });
  }

  if (baggageSelections.length) {
    saveFlightBaggageChanges({
      bookingId,
      payloadStorageKey,
      baggage: baggageSelections,
    });
  }

  const refreshedPayload = getBookingPayload<any>(payloadStorageKey);

  if (refreshedPayload) {
    refreshedPayload.managePayment = {
      method: payment?.method || "",
      paidAmount: Number(payment?.paidAmount || 0),
      promoUsed: Number(payment?.promoUsed || 0),
      earnedUsed: Number(payment?.earnedUsed || 0),
      refundUsed: Number(payment?.refundUsed || 0),
      totalWalletUsed: Number(payment?.totalWalletUsed || 0),
      refundCredit: Number(payment?.refundCredit || 0),
      paidAt: new Date().toISOString(),
    };

    if (refreshedPayload.manageDraft) {
      delete refreshedPayload.manageDraft;
    }

    localStorage.setItem(
      payloadStorageKey,
      JSON.stringify(refreshedPayload)
    );
  }

  return {
    success: true,
  };
}