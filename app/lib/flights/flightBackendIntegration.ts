import type { FlightState } from "@/app/components/flight/hooks";
import type { FlightSearchCabinClass } from "@/app/lib/api/flightSearchApi";
import {
  normalizeFlightCurrency,
  readFlightDisplayCurrencyPreference,
  type FlightCurrency,
} from "@/app/lib/flights/flightCurrency";
import type { FlightReviewPayload } from "@/app/lib/flights/review/buildFlightReviewData";

export const FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE =
  "This provider fare is currently not eligible for INR test payment.";

const SUPPORTED_CABINS = new Set([
  "Economy",
  "Premium Economy",
  "Business",
  "First",
]);

const BACKEND_ERROR_MESSAGES: Record<string, string> = {
  PROVIDER_NOT_CONFIGURED:
    "Flight provider is not configured. Please retry later.",
  PROVIDER_AUTH_FAILED:
    "Flight provider authentication failed. Please retry later.",
  PROVIDER_TIMEOUT:
    "Flight provider timed out. Please retry the search.",
  PROVIDER_RATE_LIMITED:
    "Flight provider is busy. Please wait briefly and retry.",
  PROVIDER_SEARCH_FAILED:
    "Flight search failed. Please retry.",
  PROVIDER_MAPPING_FAILED:
    "Flight provider returned an unreadable response. Please retry.",
  PROVIDER_OFFER_EXPIRED:
    "Selected fare expired. Please search again.",
  PROVIDER_OFFER_UNAVAILABLE:
    "Selected fare is no longer available. Please search again.",
  FLIGHT_PROVIDER_NOT_CONFIGURED:
    "Flight provider is not configured. Please retry later.",
  FLIGHT_PROVIDER_TIMEOUT:
    "Flight provider timed out. Please retry the search.",
  FLIGHT_PROVIDER_RATE_LIMITED:
    "Flight provider is busy. Please wait briefly and retry.",
  FLIGHT_PROVIDER_SEARCH_FAILED:
    "Flight search failed. Please retry.",
  FLIGHT_PROVIDER_MAPPING_FAILED:
    "Flight provider returned an unreadable response. Please retry.",
  FLIGHT_OFFER_NOT_FOUND:
    "Selected fare is no longer available. Please search again.",
  FLIGHT_OFFER_EXPIRED:
    "Selected fare expired. Please search again.",
  FLIGHT_PRICE_CHANGED:
    "Price changed. Please review and accept the latest fare.",
  FLIGHT_PAYMENT_CURRENCY_UNSUPPORTED: FLIGHT_INR_TEST_PAYMENT_UNSUPPORTED_MESSAGE,
  TPL_API_NETWORK_ERROR:
    "TPL backend is unavailable. Please retry when your connection is stable.",
  TPL_API_INVALID_RESPONSE:
    "TPL backend returned an unexpected response. Please retry.",
};

export type FlightSearchValidationResult =
  | {
      ok: true;
      request: {
        tripType: "oneway" | "roundtrip";
        origin: string;
        destination: string;
        departureDate: string;
        returnDate?: string;
        adults: number;
        children: number;
        infants: number;
        cabinClass: FlightSearchCabinClass;
        currency: "INR";
        displayCurrency?: FlightCurrency;
        nonStop: false;
        maxResults: number;
      };
    }
  | {
      ok: false;
      errors: string[];
    };

export type TravellerValidationResult =
  | {
      ok: true;
      travellers: Array<{
        type: "adult" | "child" | "infant";
        title?: string;
        firstName: string;
        lastName: string;
        dateOfBirth?: string;
        gender?: string;
        nationality?: string;
      }>;
      contactDetails: {
        countryCode: string;
        mobile: string;
        email: string;
      };
    }
  | {
      ok: false;
      errors: string[];
    };

export function validateFlightSearchState(
  state: FlightState
): FlightSearchValidationResult {
  const errors: string[] = [];
  const firstSegment = state.segments[0];
  const origin = normalizeAirportCode(firstSegment?.from?.code);
  const destination = normalizeAirportCode(firstSegment?.to?.code);
  const departureDate = formatBackendDate(firstSegment?.departure);
  const returnDate = formatBackendDate(state.returnDate);
  const adults = clampInteger(state.travellers.adults, 1, 9);
  const children = clampInteger(state.travellers.children, 0, 9);
  const infants = clampInteger(state.travellers.infants, 0, 9);
  const cabinClass = normalizeCabinClass(state.travellers.cabin);

  if (!origin) errors.push("Origin is required.");
  if (!destination) errors.push("Destination is required.");
  if (origin && destination && origin === destination) {
    errors.push("Origin and destination must be different.");
  }
  if (!departureDate) errors.push("Valid departure date is required.");
  if (state.tripType === "roundtrip" && !returnDate) {
    errors.push("Valid return date is required.");
  }
  if (departureDate && returnDate && returnDate < departureDate) {
    errors.push("Return date must be after departure date.");
  }
  if (adults < 1) errors.push("At least one adult traveller is required.");
  if (infants > adults) errors.push("Infants cannot exceed adult travellers.");
  if (!SUPPORTED_CABINS.has(state.travellers.cabin || "")) {
    errors.push("Selected cabin class is not supported.");
  }
  if (state.tripType === "multicity") {
    errors.push("Production backend search is currently enabled for one-way and round-trip flights.");
  }

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    request: {
      tripType: state.tripType === "roundtrip" ? "roundtrip" : "oneway",
      origin,
      destination,
      departureDate: departureDate || "",
      ...(returnDate ? { returnDate } : {}),
      adults,
      children,
      infants,
      cabinClass,
      currency: "INR",
      displayCurrency: readFlightDisplayCurrencyPreference(),
      nonStop: false,
      maxResults: 30,
    },
  };
}

export function validateAndMapFlightTravellers(
  travellerValidation: unknown,
  passengers: FlightReviewPayload["passengers"]
): TravellerValidationResult {
  const errors: string[] = [];
  const source = asRecord(travellerValidation);
  const sourceTravellers = Array.isArray(source?.travellers)
    ? source.travellers
    : [];
  const adultCount = clampInteger(passengers.adults, 1, 9);
  const childCount = clampInteger(passengers.children, 0, 9);
  const infantCount = clampInteger(passengers.infants, 0, 9);
  const expectedTypes: Array<"adult" | "child" | "infant"> = [
    ...Array.from({ length: adultCount }, () => "adult" as const),
    ...Array.from({ length: childCount }, () => "child" as const),
    ...Array.from({ length: infantCount }, () => "infant" as const),
  ];

  if (infantCount > adultCount) {
    errors.push("Infants cannot exceed adult travellers.");
  }
  if (sourceTravellers.length !== expectedTypes.length) {
    errors.push("Traveller count must match the selected passengers.");
  }

  const travellers = expectedTypes.map((type, index) => {
    const traveller = asRecord(sourceTravellers[index]);
    const firstName = safeName(traveller?.firstName || traveller?.name);
    const lastName = safeName(traveller?.lastName);

    if (!firstName) errors.push(`Traveller ${index + 1} first name is required.`);
    if (!lastName) errors.push(`Traveller ${index + 1} last name is required.`);

    return {
      type,
      ...(safeName(traveller?.title) ? { title: safeName(traveller?.title) } : {}),
      firstName,
      lastName,
      ...(safeDate(traveller?.dateOfBirth || traveller?.dob)
        ? { dateOfBirth: safeDate(traveller?.dateOfBirth || traveller?.dob) }
        : {}),
      ...(safeName(traveller?.gender) ? { gender: safeName(traveller?.gender) } : {}),
      ...(safeName(traveller?.nationality)
        ? { nationality: safeName(traveller?.nationality) }
        : {}),
    };
  });

  const contact = asRecord(source?.contactDetails);
  const mobile = String(contact?.mobile || contact?.phone || "").replace(/\D/g, "");
  const email = String(contact?.email || "").trim().toLowerCase();

  if (!/^\d{10}$/.test(mobile)) errors.push("A valid 10 digit contact phone is required.");
  if (!/\S+@\S+\.\S+/.test(email)) errors.push("A valid contact email is required.");

  if (errors.length > 0) return { ok: false, errors };

  return {
    ok: true,
    travellers,
    contactDetails: {
      countryCode: safeName(contact?.countryCode) || "+91",
      mobile,
      email,
    },
  };
}

export function normalizeFlightBackendError(code?: string, message?: string): string {
  const safeCode = String(code || "").trim().toUpperCase();
  if (BACKEND_ERROR_MESSAGES[safeCode]) return BACKEND_ERROR_MESSAGES[safeCode];
  const lowerMessage = String(message || "").toLowerCase();
  if (lowerMessage.includes("draft") && lowerMessage.includes("expired")) {
    return "Booking draft expired. Please refresh price and try again.";
  }
  if (lowerMessage.includes("signature")) {
    return "Payment confirmation could not be verified by TPL.";
  }
  if (lowerMessage.includes("amount")) {
    return "Payment amount did not match the backend booking draft.";
  }
  if (lowerMessage.includes("currency")) {
    return "Payment currency did not match the backend booking draft.";
  }
  return message && message.length < 180
    ? message
    : "Flight backend request failed. Please retry.";
}

export function isFlightBackendStateExpired(expiresAt?: string): boolean {
  if (!expiresAt) return false;
  const expiresTime = new Date(expiresAt).getTime();
  return Number.isFinite(expiresTime) && expiresTime <= Date.now();
}

export function getBackendAmountAuthority(payload: {
  backendSimulation?: { currency?: FlightCurrency };
  reviewData?: {
    backendOffer?: {
      priceTotal?: number;
      currency?: FlightCurrency;
      displayPrice?: { amount?: number; currency?: FlightCurrency };
      paymentQuote?: { payableAmount?: number; payableCurrency?: FlightCurrency };
    };
    pricing?: { totalAmount?: number; currency?: FlightCurrency };
  };
}): { amount: number; currency: FlightCurrency } {
  const payableAmount = Number(payload.reviewData?.backendOffer?.paymentQuote?.payableAmount || 0);
  const payableCurrency = normalizeFlightCurrency(payload.reviewData?.backendOffer?.paymentQuote?.payableCurrency);
  if (Number.isFinite(payableAmount) && payableAmount > 0) {
    return { amount: payableAmount, currency: payableCurrency };
  }

  const backendTotal = Number(payload.reviewData?.backendOffer?.priceTotal || 0);
  const pricingTotal = Number(payload.reviewData?.pricing?.totalAmount || 0);
  return {
    amount: Number.isFinite(backendTotal) && backendTotal > 0 ? backendTotal : pricingTotal,
    currency: normalizeFlightCurrency(
      payload.backendSimulation?.currency ||
        payload.reviewData?.backendOffer?.currency ||
        payload.reviewData?.pricing?.currency
    ),
  };
}

export function assertSafeFlightSimulationFlags(data: {
  bookingDraftId?: string;
  bookingRef?: string;
  bookingAllowed?: boolean;
  ticketingAllowed?: boolean;
  paymentCaptureAllowed?: boolean;
  pnr?: unknown;
  ticketNumber?: unknown;
}): string[] {
  const errors: string[] = [];
  if (!data.bookingDraftId) errors.push("Backend booking draft was missing.");
  if (!data.bookingRef) errors.push("Backend booking reference was missing.");
  if (data.bookingAllowed !== false) errors.push("Supplier booking must remain disabled.");
  if (data.ticketingAllowed !== false) errors.push("Ticketing must remain disabled.");
  if (data.paymentCaptureAllowed !== false) {
    errors.push("Live payment capture must remain disabled.");
  }
  if (data.pnr !== null) errors.push("PNR must not be issued in test mode.");
  if (data.ticketNumber !== null) errors.push("Ticket must not be issued in test mode.");
  return errors;
}

export function sanitizeFlightStoragePayload<T>(value: T): T {
  const blockedKeys = new Set([
    "authHeaders",
    "authorization",
    "providerRef",
    "providerRefs",
    "providerRequest",
    "providerResponse",
    "rawProviderResponse",
    "gatewaySignature",
    "razorpay_signature",
    "rawRazorpay",
    "rawResponse",
    "razorpayResponse",
  ]);

  if (Array.isArray(value)) {
    return value.map((item) => sanitizeFlightStoragePayload(item)) as T;
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>)
        .filter(([key]) => !blockedKeys.has(key))
        .map(([key, item]) => [key, sanitizeFlightStoragePayload(item)])
    ) as T;
  }

  return value;
}

function normalizeAirportCode(value: unknown): string {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 4);
}

function normalizeCabinClass(value: string): FlightSearchCabinClass {
  if (value === "Premium Economy" || value === "Business" || value === "First") {
    return value;
  }
  return "Economy";
}

function formatBackendDate(value: Date | null | undefined): string | null {
  if (!value || Number.isNaN(value.getTime())) return null;
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function clampInteger(value: unknown, min: number, max: number): number {
  const parsed = Math.trunc(Number(value));
  if (!Number.isFinite(parsed)) return min;
  return Math.min(Math.max(parsed, min), max);
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function safeName(value: unknown): string {
  return String(value || "").trim().replace(/\s+/g, " ").slice(0, 80);
}

function safeDate(value: unknown): string {
  const raw = String(value || "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(raw) ? raw : "";
}
