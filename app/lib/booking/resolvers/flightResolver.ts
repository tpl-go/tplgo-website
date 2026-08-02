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

function asRecord(value: unknown): Record<string, any> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, any>)
    : {};
}

function dateOnly(value: unknown): string {
  const raw = asString(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toISOString().slice(0, 10);
}

function timeOnly(value: unknown): string {
  const raw = asString(value);
  if (!raw) return "";
  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) return raw;
  return parsed.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function normalizeBackendItinerarySnapshot(payload: any): ResolvedFlightJourney[] {
  const itineraries = asArray<any>(payload?.itinerarySnapshot);
  return itineraries.map((itinerary, itineraryIndex) => {
    const segments = asArray<any>(itinerary?.segments).map((segment, segmentIndex) => {
      const departure = asRecord(segment?.departure);
      const arrival = asRecord(segment?.arrival);

      return {
        airline:
          asString(segment?.airlineName) ||
          asString(segment?.airline) ||
          asString(segment?.airlineCode) ||
          "Flight",
        flightNumber: asString(segment?.flightNumber) || "Flight Number Pending",
        from: asString(departure.airport) || asString(segment?.from),
        to: asString(arrival.airport) || asString(segment?.to),
        fromCode: asString(departure.airport) || asString(segment?.fromCode),
        toCode: asString(arrival.airport) || asString(segment?.toCode),
        departureTime: timeOnly(departure.at || segment?.departureTime),
        arrivalTime: timeOnly(arrival.at || segment?.arrivalTime),
        departureDate: dateOnly(departure.at || segment?.departureDate),
        arrivalDate: dateOnly(arrival.at || segment?.arrivalDate),
        duration: asString(segment?.duration),
        cabinBaggage: asString(segment?.cabinBaggage),
        checkinBaggage: asString(segment?.checkinBaggage),
        aircraft: asString(segment?.aircraft),
        terminalFrom: asString(departure.terminal),
        terminalTo: asString(arrival.terminal),
      } satisfies ResolvedFlightSegment;
    });

    return {
      journeyLabel:
        asString(itinerary?.journeyLabel) ||
        `Journey ${itineraryIndex + 1}`,
      segments,
      layovers: asArray(itinerary?.layovers),
    };
  });
}

function normalizeBackendTravellerValidation(payload: any) {
  const travellerSnapshot = asRecord(payload?.travellerSnapshot);
  if (!Object.keys(travellerSnapshot).length) {
    return payload?.travellerValidation || {};
  }

  return {
    travellers: asArray<any>(travellerSnapshot.travellers).map((item, index) => ({
      ...item,
      id: item?.id || `traveller-${index + 1}`,
      title: item?.title || "Mr",
      travellerType: item?.travellerType || item?.type || "adult",
    })),
    contactDetails: asRecord(travellerSnapshot.contactDetails),
  };
}

function normalizeBackendPaymentData(payload: any): ResolvedPaymentData {
  const paymentData = asRecord(payload?.paymentData);
  const payment = asRecord(payload?.payment);
  const attempt = asRecord(payload?.flightPaymentAttempt);
  const price = asRecord(payload?.priceSnapshot);

  return {
    ...paymentData,
    method:
      asString(paymentData.method) ||
      asString(payment.paymentMethod) ||
      asString(payment.gateway) ||
      "Online Payment",
    paidAt: asString(paymentData.paidAt) || asString(payment.paidAt) || null,
    totalPaid:
      asNumber(paymentData.totalPaid) ||
      asNumber(payment.amount) ||
      asNumber(attempt.amount) ||
      asNumber(price.total),
    currency:
      asString(paymentData.currency) ||
      asString(payment.currency) ||
      asString(attempt.currency) ||
      asString(price.currency),
    paymentStatus:
      asString(paymentData.paymentStatus) ||
      asString(payment.status) ||
      asString(payload?.paymentStatus),
    paymentRef:
      asString(paymentData.paymentRef) ||
      asString(payload?.paymentRef) ||
      asString(payment.paymentRef),
  };
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
  const backendJourneys = normalizeBackendItinerarySnapshot(payload);
  const reviewData = payload?.reviewData || {
    bookingType: "oneWay",
    tripMode: "domestic",
    cabinClass: "",
    journeys: backendJourneys,
  };
  const travellerValidation = normalizeBackendTravellerValidation(payload);
  const seatMealData: ResolvedSeatMealData = payload?.seatMealData || {};
  const cabData: ResolvedCabData = payload?.cabData || {};
  const insuranceData: ResolvedInsuranceData = payload?.insuranceData || {};
  const addonsData: ResolvedAddonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;
  const paymentData: ResolvedPaymentData = normalizeBackendPaymentData(payload);

  const journeys =
    asArray<ResolvedFlightJourney>(reviewData?.journeys).length > 0
      ? asArray<ResolvedFlightJourney>(reviewData?.journeys)
      : backendJourneys;
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
  const priceSnapshot = asRecord(payload?.priceSnapshot);
  if (!priceBreakup.totalAmount && asNumber(priceSnapshot.total)) {
    priceBreakup.totalAmount = asNumber(priceSnapshot.total);
  }

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
    testStatus:
      asString(payload?.testStatus) ||
      asString(payload?.status) ||
      asString(booking.bookingStatus),
    supplierBookingDisabled: payload?.supplierBookingDisabled === true,
    bookingAllowed:
      typeof payload?.bookingAllowed === "boolean" ? payload.bookingAllowed : undefined,
    ticketingAllowed:
      typeof payload?.ticketingAllowed === "boolean" ? payload.ticketingAllowed : undefined,
    paymentCaptureAllowed:
      typeof payload?.paymentCaptureAllowed === "boolean"
        ? payload.paymentCaptureAllowed
        : undefined,
    pnr:
      typeof payload?.pnr === "string" || payload?.pnr === null
        ? payload.pnr
        : undefined,
    ticketNumber:
      typeof payload?.ticketNumber === "string" || payload?.ticketNumber === null
        ? payload.ticketNumber
        : undefined,
  };
}
