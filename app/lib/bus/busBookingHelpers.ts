import type {
  BusAddonState,
  BusBookingPageState,
  BusBookingPayload,
  BusContactDetails,
  BusOfferItem,
  BusTravellerItem,
} from "./busBookingTypes";

export const BUS_BOOKING_OFFERS: BusOfferItem[] = [
  {
    code: "MEGABUS",
    title: "Get discount up to 10% on your bus bookings",
    description: "Applicable on selected routes and operators.",
    discountAmount: 120,
  },
  {
    code: "IDBICC",
    title: "Exclusive Offer - Get Flat 10% off",
    description: "Valid on selected card users only.",
    discountAmount: 180,
  },
  {
    code: "BUSPASS",
    title: "Travel pass savings for bus users",
    description: "Extra benefit for repeat bookings.",
    discountAmount: 150,
  },
  {
    code: "TPLBUS",
    title: "Special TPL bus offer",
    description: "Limited-time instant savings on your booking.",
    discountAmount: 200,
  },
];

export const BUS_STATES = [
  "Rajasthan",
  "Delhi",
  "Uttar Pradesh",
  "Haryana",
  "Punjab",
  "Gujarat",
  "Madhya Pradesh",
  "Maharashtra",
];

export function getBusBookingPayload(): BusBookingPayload | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem("tplBusBookingData");
  if (!raw) return null;

  try {
    return JSON.parse(raw) as BusBookingPayload;
  } catch {
    return null;
  }
}

export function buildInitialTravellers(
  bookingPayload: BusBookingPayload
): BusTravellerItem[] {
  return bookingPayload.selectedSeats.map((seat) => ({
    seatNumber: seat.seatNumber,
    fullName: "",
    age: "",
    gender: "",
  }));
}

export function buildInitialContactDetails(): BusContactDetails {
  return {
    email: "",
    mobile: "",
    hasGst: false,
    state: "Rajasthan",
    saveBilling: false,
  };
}

export function buildInitialAddons(
  travellerCount: number
): BusAddonState {
  return {
    tripAssuredSelected: false,
    tripAssuredTotal: travellerCount * 20,
    freeCancellationSelected: false,
    freeCancellationTotal: travellerCount * 146,
  };
}

export function calculateBusSeatPricing(
  bookingPayload: BusBookingPayload
) {
  const selectedSeats = bookingPayload.selectedSeats || [];

  const travellerCount =
    bookingPayload.travellerCount || selectedSeats.length || 1;

  const baseFarePerTraveller = Number(
    bookingPayload.baseFare ||
      bookingPayload.baseAmount ||
      bookingPayload.bus?.baseFare ||
      bookingPayload.bus?.price ||
      0
  );

  const baseFareTotal =
    baseFarePerTraveller * travellerCount;

  const selectedSeatTotal = selectedSeats.reduce(
    (sum, seat) => sum + Number(seat.price || 0),
    0
  );

  const seatUpgradeTotal = Math.max(
    selectedSeatTotal - baseFareTotal,
    0
  );

  const finalSeatTotal =
    baseFareTotal + seatUpgradeTotal;

  return {
    travellerCount,

    baseFarePerTraveller,

    baseFareTotal,

    selectedSeatTotal,

    seatUpgradeTotal,

    finalSeatTotal,
  };
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function isValidMobile(mobile: string) {
  return /^[6-9]\d{9}$/.test(mobile.trim());
}

export function areTravellersValid(travellers: BusTravellerItem[]) {
  return travellers.every(
    (traveller) =>
      traveller.fullName.trim().length >= 2 &&
      Number(traveller.age) >= 1 &&
      Number(traveller.age) <= 100 &&
      !!traveller.gender
  );
}

export function isContactValid(contactDetails: BusContactDetails) {
  return (
    isValidEmail(contactDetails.email) &&
    isValidMobile(contactDetails.mobile) &&
    contactDetails.state.trim().length > 0
  );
}

export function buildBusBookingPageState(
  bookingPayload: BusBookingPayload,
  timerLeft: number = 10 * 60
): BusBookingPageState {
  return {
    bookingPayload,
    travellers: buildInitialTravellers(bookingPayload),
    contactDetails: buildInitialContactDetails(),
    addons: buildInitialAddons(bookingPayload.travellerCount),
    appliedOffer: null,
    timerLeft,
  };
}