export type FlightReviewPayload = {
  bookingType: "oneWay" | "roundTrip" | "multiCity";
  tripMode: "domestic" | "international";
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  cabinClass?: string;
  backendOffer?: {
    searchId: string;
    offerId: string;
    fareId?: string;
    expiresAt?: string;
    backendRequestId?: string;
    priceConfirmationId?: string;
    priceStatus?: string;
  };
  pricing: {
    perAdultBaseFare: number;
    baseFareTotal?: number;
    baseAfterOffer?: number;

    tax: number;
    surcharge: number;

    appliedOffer: number;
    appliedOfferCode?: string;
    appliedOfferTitle?: string;

    discount: number;
    tplCredit: number;

    earnedOnThisBooking?: number;
    totalAmount: number;

    benefitRule?: {
      offerOnBaseOnly?: boolean;
      promoEarnedOnBaseAfterOfferOnly?: boolean;
      refundWalletOnFinalPayable?: boolean;
      nonBenefitAmounts?: string[];
    };
  };
  journeys: Array<{
    journeyLabel: string;
    segments: Array<{
      airline: string;
      flightNumber: string;
      from: string;
      to: string;
      departureTime: string;
      arrivalTime: string;
      departureDate?: string;
      arrivalDate?: string;
      duration?: string;
      cabinBaggage?: string;
      checkinBaggage?: string;
      aircraft?: string;
      terminalFrom?: string;
      terminalTo?: string;
      fromCode?: string;
      toCode?: string;
    }>;
    layovers?: Array<{
      airport: string;
      code?: string;
      duration: string;
      note?: string;
    }>;
  }>;
};

function formatDateInput(value?: string | Date) {
  if (!value) return "";

  if (typeof value === "string") {
    const clean = value.trim();

    if (!clean) return "";

    const match = clean.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (match) return clean;

    const isoWithTime = clean.match(/^(\d{4})-(\d{2})-(\d{2})T/);
    if (isoWithTime) {
      return `${isoWithTime[1]}-${isoWithTime[2]}-${isoWithTime[3]}`;
    }

    const indian = clean.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (indian) {
      const day = indian[1].padStart(2, "0");
      const month = indian[2].padStart(2, "0");
      const year = indian[3];

      return `${year}-${month}-${day}`;
    }

    return clean;
  }

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return "";

    const year = value.getFullYear();
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const day = String(value.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
  }

  return "";
}

function normalizeCode(value?: string) {
  if (!value) return "";

  const match = value.match(/\(([A-Z]{3,4})\)/);
  if (match) return match[1];

  return value;
}

function normalizePricing(payload: FlightReviewPayload) {
  const pricing = payload.pricing || ({} as FlightReviewPayload["pricing"]);

  const adults = Math.max(Number(payload.passengers?.adults || 1), 1);
  const perAdultBaseFare = Number(pricing.perAdultBaseFare || 0);
  const baseFareTotal = Number(pricing.baseFareTotal ?? perAdultBaseFare * adults);
  const appliedOffer = Number(pricing.appliedOffer || 0);
  const baseAfterOffer = Number(
    pricing.baseAfterOffer ?? Math.max(baseFareTotal - appliedOffer, 0)
  );

  return {
    ...pricing,
    perAdultBaseFare,
    baseFareTotal,
    appliedOffer,
    appliedOfferCode: pricing.appliedOfferCode || "",
    appliedOfferTitle: pricing.appliedOfferTitle || "",
    baseAfterOffer,
    tax: Number(pricing.tax || 0),
    surcharge: Number(pricing.surcharge || 0),
    discount: Number(pricing.discount || 0),
    tplCredit: Number(pricing.tplCredit || 0),
    earnedOnThisBooking: Number(
      pricing.earnedOnThisBooking ?? Math.round(baseAfterOffer * 0.02)
    ),
    totalAmount: Number(pricing.totalAmount || 0),
    benefitRule: {
      offerOnBaseOnly: true,
      promoEarnedOnBaseAfterOfferOnly: true,
      refundWalletOnFinalPayable: true,
      nonBenefitAmounts: [
        "tax",
        "seats",
        "meals",
        "baggage",
        "insurance",
        "convenienceFee",
        "gatewayFee",
        "addons",
      ],
      ...(pricing.benefitRule || {}),
    },
  };
}

export function normalizeFlightReviewPayload(
  payload: FlightReviewPayload
): FlightReviewPayload {
  return {
    ...payload,
    ...(payload.backendOffer ? { backendOffer: normalizeBackendOffer(payload.backendOffer) } : {}),
    pricing: normalizePricing(payload),
    journeys: (payload.journeys || []).map((journey, journeyIndex) => ({
      journeyLabel: journey.journeyLabel || `Journey ${journeyIndex + 1}`,
      segments: (journey.segments || []).map((segment) => ({
        ...segment,
        departureDate: formatDateInput(segment.departureDate),
        arrivalDate: formatDateInput(segment.arrivalDate),
        duration: segment.duration || "",
        cabinBaggage: segment.cabinBaggage || "7 Kg / Adult",
        checkinBaggage: segment.checkinBaggage || "15 Kg / Adult",
        aircraft: segment.aircraft || "",
        terminalFrom: segment.terminalFrom || segment.from || "",
        terminalTo: segment.terminalTo || segment.to || "",
        fromCode: segment.fromCode || normalizeCode(segment.from),
        toCode: segment.toCode || normalizeCode(segment.to),
      })),
      layovers: (journey.layovers || []).map((layover) => ({
        ...layover,
        code: layover.code || normalizeCode(layover.airport),
        duration: layover.duration || "",
      })),
    })),
  };
}

function normalizeBackendOffer(value: FlightReviewPayload["backendOffer"]): FlightReviewPayload["backendOffer"] {
  if (!value) return undefined;
  return {
    searchId: value.searchId,
    offerId: value.offerId,
    ...(value.fareId ? { fareId: value.fareId } : {}),
    ...(value.expiresAt ? { expiresAt: value.expiresAt } : {}),
    ...(value.backendRequestId ? { backendRequestId: value.backendRequestId } : {}),
    ...(value.priceConfirmationId ? { priceConfirmationId: value.priceConfirmationId } : {}),
    ...(value.priceStatus ? { priceStatus: value.priceStatus } : {}),
  };
}

export function saveFlightReviewPayload(payload: FlightReviewPayload) {
  if (typeof window === "undefined") return;

  const normalized = normalizeFlightReviewPayload(payload);

  sessionStorage.setItem("tplFlightReviewPayload", JSON.stringify(normalized));
}

export function getFlightReviewPayload(): FlightReviewPayload | null {
  if (typeof window === "undefined") return null;

  const raw = sessionStorage.getItem("tplFlightReviewPayload");
  if (!raw) return null;

  try {
    const parsed = JSON.parse(raw) as FlightReviewPayload;
    return normalizeFlightReviewPayload(parsed);
  } catch {
    return null;
  }
}
