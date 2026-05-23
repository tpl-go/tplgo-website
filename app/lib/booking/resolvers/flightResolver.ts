import type { BookingItem } from "@/app/lib/booking/bookingStorage";
import type {
  ResolvedAddonsData,
  ResolvedCabData,
  ResolvedFlightJourney,
  ResolvedFlightSegment,
  ResolvedFlightSource,
  ResolvedInsuranceData,
  ResolvedPaymentData,
  ResolvedPriceBreakup,
  ResolvedSeatMealData,
  ResolvedTraveller,
} from "@/app/lib/booking/resolvers/sharedTypes";

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

function asNumber(value: unknown, fallback = 0): number {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function buildRouteTitle(params: {
  bookingType?: string;
  firstSegment?: ResolvedFlightSegment;
  lastSegment?: ResolvedFlightSegment;
}) {
  const { bookingType, firstSegment, lastSegment } = params;

  if (bookingType === "roundTrip") {
    return `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
      firstSegment?.toCode || firstSegment?.to || "DST"
    } → ${lastSegment?.toCode || lastSegment?.to || "ORG"}`;
  }

  if (bookingType === "multiCity") {
    return "Multi City Flight Booking";
  }

  return `${firstSegment?.fromCode || firstSegment?.from || "ORG"} → ${
    firstSegment?.toCode || firstSegment?.to || "DST"
  }`;
}

function buildAirlineSummary(firstSegment?: ResolvedFlightSegment) {
  if (firstSegment?.airline && firstSegment?.flightNumber) {
    return `${firstSegment.airline} • ${firstSegment.flightNumber}`;
  }
  return "Flight Ticket";
}

function buildPriceBreakup(params: {
  reviewData: any;
  paymentData: ResolvedPaymentData;
  seatMealData: ResolvedSeatMealData;
  cabData: ResolvedCabData;
  insuranceData: ResolvedInsuranceData;
  addonsData: ResolvedAddonsData;
  offerData: any;
}): ResolvedPriceBreakup {
  const { reviewData, paymentData, seatMealData, cabData, insuranceData, addonsData, offerData } =
    params;

  const pricing = reviewData?.pricing || {};

  const passengerCount =
    asNumber(reviewData?.passengers?.adults) +
    asNumber(reviewData?.passengers?.children) +
    asNumber(reviewData?.passengers?.infants);

  const baseFare = asNumber(pricing.perAdultBaseFare) * passengerCount;
  const tax = asNumber(pricing.tax);
  const surcharge = asNumber(pricing.surcharge);
  const seatTotal = asNumber(seatMealData?.seatTotal);
  const mealTotal = asNumber(seatMealData?.mealTotal);
  const cabTotal = asNumber(cabData?.cabPrice);
  const insuranceTotal = asNumber(insuranceData?.insurancePrice);
  const addonsTotal = asNumber(addonsData?.addonsPrice);
  const appliedOffer = asNumber(offerData?.discountAmount);
  const discount = asNumber(pricing.discount);
  const tplCredit = asNumber(pricing.tplCredit);

  const totalAmount =
    asNumber(paymentData?.totalPaid) ||
    Math.max(
      baseFare +
        tax +
        surcharge +
        seatTotal +
        mealTotal +
        cabTotal +
        insuranceTotal +
        addonsTotal -
        appliedOffer -
        discount -
        tplCredit,
      0
    );

  return {
    baseFare,
    tax,
    surcharge,
    seatTotal,
    mealTotal,
    cabTotal,
    insuranceTotal,
    addonsTotal,
    appliedOffer,
    discount,
    tplCredit,
    totalAmount,
  };
}

export function resolveFlightBookingSource(
  booking: BookingItem,
  payload: any
): ResolvedFlightSource {
  const reviewData = payload?.reviewData || {};
  const travellerValidation = payload?.travellerValidation || {};
  const seatMealData: ResolvedSeatMealData = payload?.seatMealData || {};
  const cabData: ResolvedCabData = payload?.cabData || {};
  const insuranceData: ResolvedInsuranceData = payload?.insuranceData || {};
  const addonsData: ResolvedAddonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;
  const paymentData: ResolvedPaymentData = payload?.paymentData || {};

  const journeys = asArray<ResolvedFlightJourney>(reviewData?.journeys);
  const firstJourney = journeys[0];
  const firstSegment = firstJourney?.segments?.[0];
  const lastJourney = journeys[journeys.length - 1];
  const lastSegment =
    lastJourney?.segments?.[lastJourney?.segments?.length - 1] || firstSegment;

  const routeTitle = buildRouteTitle({
    bookingType: asString(reviewData?.bookingType),
    firstSegment,
    lastSegment,
  });

  const airlineSummary = buildAirlineSummary(firstSegment);

  const journeyDateLabel = firstSegment?.departureDate || null;

  const resolvedTravellers = asArray<ResolvedTraveller>(travellerValidation?.travellers);

  const priceBreakup = buildPriceBreakup({
    reviewData,
    paymentData,
    seatMealData,
    cabData,
    insuranceData,
    addonsData,
    offerData,
  });

  return {
    service: "flight",
    booking,
    payload,
    reviewData,
    travellerValidation: {
      travellers: resolvedTravellers,
      contactDetails: travellerValidation?.contactDetails,
      gstDetails: travellerValidation?.gstDetails,
    },
    seatMealData,
    cabData,
    insuranceData,
    addonsData,
    offerData,
    paymentData,
    journeys,
    firstJourney,
    firstSegment,
    lastJourney,
    lastSegment,
    routeTitle,
    airlineSummary,
    journeyDateLabel,
    priceBreakup,
  };
}