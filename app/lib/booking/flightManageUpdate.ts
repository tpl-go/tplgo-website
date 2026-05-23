import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import {
  getAllBookings,
  BOOKING_UPDATED_EVENT,
} from "@/app/lib/booking/bookingStorage";

type SeatSelection = {
  travellerId: string;
  oldSeatCode?: string | null;
  newSeatCode?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

type MealSelection = {
  travellerId: string;
  oldMealId?: string | null;
  newMealId?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

type BaggageSelection = {
  travellerId: string;
  oldBaggageCode?: string | null;
  newBaggageCode?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

const BOOKING_STORAGE_KEY = "tpl_bookings_v1";

function savePayload(payloadStorageKey: string, payload: any) {
  if (typeof window === "undefined") return;
  if (!payloadStorageKey) return;

  localStorage.setItem(payloadStorageKey, JSON.stringify(payload));
}

function dispatchBookingUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
}

function updateBookingAmount(bookingId: string, nextAmount: number) {
  const all = getAllBookings();

  const updated = all.map((item) =>
    item.id === bookingId
      ? {
          ...item,
          amount: Number(nextAmount || 0),
        }
      : item
  );

  localStorage.setItem(BOOKING_STORAGE_KEY, JSON.stringify(updated));
  dispatchBookingUpdate();
}

function getPassengerCount(payload: any) {
  const passengers = payload?.reviewData?.passengers || {};

  return (
    Number(passengers?.adults || 0) +
    Number(passengers?.children || 0) +
    Number(passengers?.infants || 0)
  );
}

function recalculateTotal(payload: any) {
  const reviewData = payload?.reviewData || {};
  const seatMealData = payload?.seatMealData || {};
  const cabData = payload?.cabData || {};
  const insuranceData = payload?.insuranceData || {};
  const addonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;

  const pricing = reviewData?.pricing || {};
  const passengerCount = getPassengerCount(payload);

  return Math.max(
    Number(pricing.perAdultBaseFare || 0) * passengerCount +
      Number(pricing.tax || 0) +
      Number(pricing.surcharge || 0) +
      Number(seatMealData?.seatTotal || 0) +
      Number(seatMealData?.mealTotal || 0) +
      Number(cabData?.cabPrice || 0) +
      Number(insuranceData?.insurancePrice || 0) +
      Number(addonsData?.addonsPrice || 0) -
      Number(offerData?.discountAmount || 0) -
      Number(pricing.discount || 0) -
      Number(pricing.tplCredit || 0),
    0
  );
}

function getCurrentPaidAmount(payload: any) {
  return Number(
    payload?.managePayment?.updatedTotalAmount ||
      payload?.paymentData?.totalPaid ||
      0
  );
}

function syncManagePaymentTotal(payload: any, nextTotal: number) {
  const previousTotal = getCurrentPaidAmount(payload);
  const originalPaidAmount = Number(
    payload?.managePayment?.originalPaidAmount ||
      payload?.paymentData?.originalPaidAmount ||
      payload?.paymentData?.totalPaid ||
      previousTotal ||
      nextTotal ||
      0
  );

  const differenceAmount = Number(nextTotal || 0) - Number(previousTotal || 0);

  const settlementMode =
    differenceAmount > 0
      ? "payment"
      : differenceAmount < 0
      ? "wallet_credit"
      : "save";

  payload.managePayment = {
    ...(payload.managePayment || {}),
    originalPaidAmount,
    previousTotalAmount: previousTotal,
    updatedTotalAmount: Number(nextTotal || 0),
    differenceAmount,
    settlementMode,
    updatedAt: new Date().toISOString(),
  };

  payload.paymentData = {
    ...(payload.paymentData || {}),
    originalPaidAmount,
    totalPaid: Number(nextTotal || 0),
    updatedAt: new Date().toISOString(),
  };

  payload.manageHistory = [
    ...(Array.isArray(payload.manageHistory) ? payload.manageHistory : []),
    {
      id: `MG-${Date.now()}`,
      previousTotalAmount: previousTotal,
      updatedTotalAmount: Number(nextTotal || 0),
      differenceAmount,
      settlementMode,
      updatedAt: new Date().toISOString(),
    },
  ];
}

export function saveFlightTravellerChanges(params: {
  payloadStorageKey?: string;
  travellers: any[];
}) {
  const { payloadStorageKey, travellers } = params;

  if (!payloadStorageKey) {
    throw new Error("Booking payload storage key not found.");
  }

  const payload = getBookingPayload<any>(payloadStorageKey);
  if (!payload) throw new Error("Booking payload not found.");

  const existingTravellers = payload?.travellerValidation?.travellers || [];

  payload.travellerValidation = {
    ...(payload.travellerValidation || {}),
    travellers: travellers.map((item, index) => {
      const existing = existingTravellers[index] || {};

      return {
        ...existing,
        id: item.id || existing.id || `traveller-${index + 1}`,
        title: item.title || existing.title || "",
        firstName: item.firstName || "",
        middleName: item.middleName || "",
        lastName: item.lastName || "",
        travellerType: item.type || existing.travellerType || "adult",
      };
    }),
  };

  savePayload(payloadStorageKey, payload);
  dispatchBookingUpdate();

  return payload;
}

export function saveFlightContactChanges(params: {
  payloadStorageKey?: string;
  contact: {
    email: string;
    phone: string;
  };
}) {
  const { payloadStorageKey, contact } = params;

  if (!payloadStorageKey) {
    throw new Error("Booking payload storage key not found.");
  }

  const payload = getBookingPayload<any>(payloadStorageKey);
  if (!payload) throw new Error("Booking payload not found.");

  payload.travellerValidation = {
    ...(payload.travellerValidation || {}),
    contactDetails: {
      ...(payload.travellerValidation?.contactDetails || {}),
      email: contact.email || "",
      mobile: contact.phone || "",
    },
  };

  savePayload(payloadStorageKey, payload);
  dispatchBookingUpdate();

  return payload;
}

export function saveFlightSpecialRequestChanges(params: {
  payloadStorageKey?: string;
  specialRequest: string;
}) {
  const { payloadStorageKey, specialRequest } = params;

  if (!payloadStorageKey) {
    throw new Error("Booking payload storage key not found.");
  }

  const payload = getBookingPayload<any>(payloadStorageKey);
  if (!payload) throw new Error("Booking payload not found.");

  payload.reviewData = {
    ...(payload.reviewData || {}),
    specialRequest: specialRequest || "",
  };

  savePayload(payloadStorageKey, payload);
  dispatchBookingUpdate();

  return payload;
}

export function saveFlightSeatChanges(params: {
  bookingId: string;
  payloadStorageKey?: string;
  seats: SeatSelection[];
}) {
  const { bookingId, payloadStorageKey, seats } = params;

  if (!payloadStorageKey) {
    throw new Error("Booking payload storage key not found.");
  }

  const payload = getBookingPayload<any>(payloadStorageKey);
  if (!payload) throw new Error("Booking payload not found.");

  const nextSeats = (seats || [])
    .filter((item) => !item.skipped && item.newSeatCode)
    .map((item) => ({
      travellerId: item.travellerId,
      seatNumber: item.newSeatCode as string,
      price: Number(item.newPrice || 0),
    }));

  const seatTotal = nextSeats.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  payload.seatMealData = {
    ...(payload.seatMealData || {}),
    seats: nextSeats,
    seatTotal,
    seatStatus: nextSeats.length > 0 ? "selected" : "skipped",
  };

  const total = recalculateTotal(payload);
  syncManagePaymentTotal(payload, total);

  savePayload(payloadStorageKey, payload);
  updateBookingAmount(bookingId, total);

  return payload;
}

export function saveFlightMealChanges(params: {
  bookingId: string;
  payloadStorageKey?: string;
  meals: MealSelection[];
  mealCatalog: Array<{ id: string; name: string; price: number }>;
}) {
  const { bookingId, payloadStorageKey, meals, mealCatalog } = params;

  if (!payloadStorageKey) {
    throw new Error("Booking payload storage key not found.");
  }

  const payload = getBookingPayload<any>(payloadStorageKey);
  if (!payload) throw new Error("Booking payload not found.");

  const nextMeals = (meals || [])
    .filter((item) => !item.skipped && item.newMealId)
    .map((item) => {
      const meal = (mealCatalog || []).find((m) => m.id === item.newMealId);

      return {
        travellerId: item.travellerId,
        mealId: item.newMealId,
        mealName: meal?.name || item.newMealId || "",
        price: Number(item.newPrice || meal?.price || 0),
      };
    });

  const mealTotal = nextMeals.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  payload.seatMealData = {
    ...(payload.seatMealData || {}),
    meals: nextMeals,
    mealTotal,
    mealStatus: nextMeals.length > 0 ? "selected" : "skipped",
  };

  const total = recalculateTotal(payload);
  syncManagePaymentTotal(payload, total);

  savePayload(payloadStorageKey, payload);
  updateBookingAmount(bookingId, total);

  return payload;
}

export function saveFlightBaggageChanges(params: {
  bookingId: string;
  payloadStorageKey?: string;
  baggage: BaggageSelection[];
}) {
  const { bookingId, payloadStorageKey, baggage } = params;

  if (!payloadStorageKey) {
    throw new Error("Booking payload storage key not found.");
  }

  const payload = getBookingPayload<any>(payloadStorageKey);
  if (!payload) throw new Error("Booking payload not found.");

  const baggageSelections = (baggage || [])
    .filter((item) => !item.skipped && item.newBaggageCode)
    .map((item) => ({
      travellerId: item.travellerId,
      baggageCode: item.newBaggageCode as string,
      price: Number(item.newPrice || 0),
    }));

  const baggageTotal = baggageSelections.reduce(
    (sum, item) => sum + Number(item.price || 0),
    0
  );

  payload.addonsData = {
    ...(payload.addonsData || {}),
    baggageSelections,
    baggageTotal,
    addonsPrice: baggageTotal,
    addonsStatus: baggageSelections.length > 0 ? "selected" : "skipped",
  };

  const total = recalculateTotal(payload);
  syncManagePaymentTotal(payload, total);

  savePayload(payloadStorageKey, payload);
  updateBookingAmount(bookingId, total);

  return payload;
}