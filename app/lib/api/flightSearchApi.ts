import type { DummyFlight, FlightFareOption, FlightStopDetail } from "@/app/components/flight/data/flightDummyData";
import {
  normalizeFlightCurrency,
  type FlightDisplayPriceSnapshot,
  type FlightPriceSnapshot,
  type FlightCurrency,
} from "@/app/lib/flights/flightCurrency";
import { normalizeFlightBackendError } from "@/app/lib/flights/flightBackendIntegration";
import { tplApiRequest, isTplApiConfigured } from "./tplApiClient";

export type FlightSearchTripType = "oneway" | "roundtrip" | "multicity";
export type FlightSearchCabinClass = "Economy" | "Premium Economy" | "Business" | "First";

export type BackendFlightSearchRequest = {
  tripType: FlightSearchTripType;
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
  nonStop: boolean;
  maxResults: number;
};

export type BackendFlightMoney = {
  baseFare: number;
  taxes: number;
  fees: number;
  total: number;
  currency: FlightCurrency;
};

export type BackendFlightSupplierPrice = {
  amount: number;
  currency: FlightCurrency;
};

export type BackendFlightDisplayPrice = BackendFlightSupplierPrice & {
  fxRate?: string;
  fxSource?: string;
  fxTimestamp?: string;
  roundingVersion?: string;
};

export type BackendFlightBaggageAllowance = {
  cabin?: string;
  checked?: string;
  summary?: string;
  source: "provider" | "not_provided";
};

export type BackendFlightAvailability = {
  seatsRemaining?: number;
  source: "provider" | "not_provided";
};

export type BackendFlightSegment = {
  segmentId: string;
  airlineCode: string;
  airlineName: string;
  flightNumber: string;
  departure: {
    airport: string;
    terminal?: string;
    at: string;
    localDateTime?: string;
    timeZone?: string;
    utcDateTime?: string;
    offset?: string;
  };
  arrival: {
    airport: string;
    terminal?: string;
    at: string;
    localDateTime?: string;
    timeZone?: string;
    utcDateTime?: string;
    offset?: string;
  };
  duration: string;
  dayOffset?: number;
  aircraft?: string;
};

export type BackendFlightItinerary = {
  itineraryId: string;
  duration: string;
  stops: number;
  segments: BackendFlightSegment[];
};

export type BackendFlightFareOption = {
  fareId: string;
  label: string;
  baggageSummary: string;
  price: BackendFlightMoney;
  refundable: boolean;
  changeAllowed: boolean;
  cancellationAllowed: boolean;
};

export type BackendFlightOffer = {
  offerId: string;
  providerId: string;
  source: string;
  itineraries: BackendFlightItinerary[];
  baggageSummary: string;
  fareOptions: BackendFlightFareOption[];
  price: BackendFlightMoney;
  supplierPrice?: BackendFlightSupplierPrice;
  displayPrice?: BackendFlightDisplayPrice;
  baggageAllowance?: BackendFlightBaggageAllowance;
  availability?: BackendFlightAvailability;
  expiresAt?: string;
  refundable: boolean;
  changeAllowed: boolean;
  cancellationAllowed: boolean;
  bookingAllowed?: boolean;
  ticketingAllowed?: boolean;
  warnings?: string[];
};

export type BackendFlightSearchResponse = {
  searchId: string;
  providerId: string;
  source: string;
  tripType: FlightSearchTripType;
  offers: BackendFlightOffer[];
  warnings: string[];
};

export type FlightBackendSearchResult =
  | {
      ok: true;
      flights: DummyFlight[];
      requestId: string;
      source: "backend";
    }
  | {
      ok: false;
      flights: [];
      requestId: string;
      source: "local";
      error: {
        code: string;
        message: string;
      };
    };

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isBackendFlightSearchEnabled(): boolean {
  return readBoolean(process.env.NEXT_PUBLIC_TPL_USE_BACKEND_FLIGHT_SEARCH, false) && isTplApiConfigured();
}

export function isBackendFlightSearchFallbackEnabled(): boolean {
  return readBoolean(process.env.NEXT_PUBLIC_TPL_BACKEND_FLIGHT_SEARCH_FALLBACK_TO_LOCAL, false);
}

export async function searchBackendFlights(input: BackendFlightSearchRequest): Promise<FlightBackendSearchResult> {
  const result = await tplApiRequest<BackendFlightSearchResponse>("/api/v1/flights/search", {
    method: "POST",
    body: input,
    fallbackOnError: false,
    requestId: createFlightSearchRequestId(),
  });

  if (!result.ok) {
    return {
      ok: false,
      flights: [],
      requestId: result.requestId,
      source: "local",
      error: {
        code: result.error.code,
        message: normalizeFlightBackendError(result.error.code, result.error.message),
      },
    };
  }

  if (!Array.isArray(result.data?.offers)) {
    return {
      ok: false,
      flights: [],
      requestId: result.requestId,
      source: "local",
      error: {
        code: "TPL_API_INVALID_RESPONSE",
        message: normalizeFlightBackendError("TPL_API_INVALID_RESPONSE"),
      },
    };
  }

  return {
    ok: true,
    flights: mapBackendFlightOffersToDummyFlights(result.data.offers, {
      searchId: result.data.searchId,
      backendRequestId: result.requestId,
      source: result.data.source,
      warnings: result.data.warnings,
    }),
    requestId: result.requestId,
    source: "backend",
  };
}

export function mapBackendFlightOffersToDummyFlights(
  offers: BackendFlightOffer[],
  context?: {
    searchId?: string;
    backendRequestId?: string;
    source?: string;
    warnings?: string[];
  }
): DummyFlight[] {
  return offers
    .filter(isUsableBackendFlightOffer)
    .map((offer, index) => mapBackendFlightOfferToDummyFlight(offer, index, context));
}

function mapBackendFlightOfferToDummyFlight(
  offer: BackendFlightOffer,
  index: number,
  context?: {
    searchId?: string;
    backendRequestId?: string;
    source?: string;
    warnings?: string[];
  }
): DummyFlight {
  const itinerary = offer.itineraries[0];
  const firstSegment = itinerary?.segments[0];
  const lastSegment = itinerary?.segments[itinerary.segments.length - 1] ?? firstSegment;
  const departMinutes = minutesFromDateTime(firstSegment?.departure.at);
  const arriveMinutes = minutesFromDateTime(lastSegment?.arrival.at);
  const durationMinutes = durationToMinutes(itinerary?.duration || firstSegment?.duration) || minutesBetween(departMinutes, arriveMinutes);
  const stops = Math.max(itinerary?.stops ?? Math.max((itinerary?.segments.length ?? 1) - 1, 0), 0);
  const displayPrice = normalizeDisplayPrice(offer.displayPrice, offer.price);
  const supplierPrice = normalizeSupplierPrice(offer.supplierPrice, offer.price);
  const currency = normalizeFlightCurrency(displayPrice.currency);
  const basePrice = Number(displayPrice.amount || offer.price.total || offer.price.baseFare || 0);
  const fareOptions = offer.fareOptions.length ? offer.fareOptions : [{
    fareId: `${offer.offerId}-published`,
    label: "Published",
    baggageSummary: providerBaggageSummary(offer),
    price: {
      ...offer.price,
      total: displayPrice.amount,
      currency,
    },
    refundable: offer.refundable,
    changeAllowed: offer.changeAllowed,
    cancellationAllowed: offer.cancellationAllowed,
  }];
  const displayFareOptions = fareOptions.map((fare) => ({
    ...fare,
    baggageSummary: fare.baggageSummary || providerBaggageSummary(offer),
    price: {
      ...fare.price,
      total: displayPrice.amount,
      currency,
    },
  }));

  return {
    id: offer.offerId || `backend-flight-${index + 1}`,
    airline: firstSegment?.airlineName || firstSegment?.airlineCode || "TPL Flight",
    code: firstSegment?.flightNumber || `${firstSegment?.airlineCode || "TPL"} ${index + 1}`,
    from: firstSegment?.departure.airport || "",
    to: lastSegment?.arrival.airport || "",
    departMinutes,
    arriveMinutes,
    stops,
    stopLabel: stopLabel(stops),
    durationMinutes,
    basePrice,
    tag: index === 0 ? "recommended" : stops === 0 ? "fastest" : "cheapest",
    timing: index === 0 ? "Backend matched fare" : stops === 0 ? "Non-stop backend fare" : "Backend fare option",
    promo: supplierPrice.currency !== currency
      ? `Supplier fare ${supplierPrice.currency} ${supplierPrice.amount}. Display converted by TPL backend.`
      : "TPL backend search result. Pricing is search-only until offer confirmation is enabled.",
    stopDetails: mapStopDetails(itinerary?.segments ?? []),
    fares: displayFareOptions.map((fare, fareIndex) => mapBackendFareOption(fare, fareIndex)),
    ...(context?.searchId ? {
      backendOffer: {
        searchId: context.searchId,
        offerId: offer.offerId,
        ...(displayFareOptions[0]?.fareId ? { fareId: displayFareOptions[0].fareId } : {}),
        ...(context.backendRequestId ? { backendRequestId: context.backendRequestId } : {}),
        ...(Number.isFinite(displayPrice.amount) ? { priceTotal: Number(displayPrice.amount) } : {}),
        currency,
        supplierPrice,
        displayPrice,
        baggageAllowance: offer.baggageAllowance,
        availability: offer.availability,
        providerLabel: safeProviderLabel(offer.source || context.source || offer.providerId),
        source: safeProviderLabel(offer.source || context.source || "backend"),
        itineraries: offer.itineraries,
        bookingAllowed: offer.bookingAllowed === true,
        ticketingAllowed: offer.ticketingAllowed === true,
        ...(offer.expiresAt ? { expiresAt: offer.expiresAt } : {}),
        warnings: [...(context.warnings || []), ...(offer.warnings || [])].filter(Boolean),
      },
    } : {}),
  };
}

function isUsableBackendFlightOffer(offer: BackendFlightOffer): boolean {
  if (!offer || typeof offer !== "object") return false;
  if (!offer.offerId || !offer.price || !Number.isFinite(Number(offer.price.total))) {
    return false;
  }
  const itinerary = offer.itineraries?.[0];
  return Boolean(itinerary?.segments?.length);
}

function safeProviderLabel(value: unknown): string {
  return String(value || "TPL backend")
    .replace(/[^a-zA-Z0-9 _.-]/g, "")
    .trim()
    .slice(0, 80);
}

function mapBackendFareOption(fare: BackendFlightFareOption, index: number): FlightFareOption {
  const refundable = fare.refundable ? "Refundable" : "Non-refundable";
  return {
    id: fare.fareId || `backend-fare-${index + 1}`,
    title: fare.label || "Published",
    price: Number(fare.price.total || 0),
    currency: normalizeFlightCurrency(fare.price.currency),
    baggage: `${fare.baggageSummary || "Baggage as per airline rules"}, ${refundable}`,
    meals: "As per fare rules",
    seatCharge: "As per fare rules",
    cancellationFee: fare.cancellationAllowed ? "As per fare rules" : "Not permitted",
    dateChangeFee: fare.changeAllowed ? "As per fare rules" : "Not permitted",
  };
}

function normalizeSupplierPrice(
  supplierPrice: BackendFlightSupplierPrice | undefined,
  fallback: BackendFlightMoney
): FlightPriceSnapshot {
  return {
    amount: Number(supplierPrice?.amount ?? fallback.total ?? 0),
    currency: normalizeFlightCurrency(supplierPrice?.currency || fallback.currency),
  };
}

function normalizeDisplayPrice(
  displayPrice: BackendFlightDisplayPrice | undefined,
  fallback: BackendFlightMoney
): FlightDisplayPriceSnapshot {
  return {
    amount: Number(displayPrice?.amount ?? fallback.total ?? 0),
    currency: normalizeFlightCurrency(displayPrice?.currency || fallback.currency),
    ...(displayPrice?.fxRate ? { fxRate: displayPrice.fxRate } : {}),
    ...(displayPrice?.fxSource ? { fxSource: displayPrice.fxSource } : {}),
    ...(displayPrice?.fxTimestamp ? { fxTimestamp: displayPrice.fxTimestamp } : {}),
    ...(displayPrice?.roundingVersion ? { roundingVersion: displayPrice.roundingVersion } : {}),
  };
}

function providerBaggageSummary(offer: BackendFlightOffer): string {
  if (offer.baggageAllowance?.source === "provider" && offer.baggageAllowance.summary) {
    return offer.baggageAllowance.summary;
  }
  return offer.baggageSummary || "Not provided by supplier";
}

function mapStopDetails(segments: BackendFlightSegment[]): FlightStopDetail[] {
  if (segments.length <= 1) return [];
  return segments.slice(0, -1).map((segment) => ({
    airport: segment.arrival.airport,
    layover: "Layover details pending provider confirmation",
    type: segment.arrival.terminal ? `Terminal ${segment.arrival.terminal}` : "Plane change",
  }));
}

function stopLabel(stops: number): string {
  if (stops <= 0) return "Non stop";
  if (stops === 1) return "1 Stop";
  return `${stops} Stop`;
}

function durationToMinutes(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/^PT(?:(\d+)H)?(?:(\d+)M)?$/i);
  if (!match) return 0;
  return Number(match[1] || 0) * 60 + Number(match[2] || 0);
}

function minutesFromDateTime(value: string | undefined): number {
  if (!value) return 0;
  const match = value.match(/T(\d{2}):(\d{2})/);
  if (match) return Number(match[1] || 0) * 60 + Number(match[2] || 0);
  return 0;
}

function minutesBetween(departMinutes: number, arriveMinutes: number): number {
  const diff = arriveMinutes - departMinutes;
  return diff > 0 ? diff : diff + 24 * 60;
}

function readBoolean(value: string | undefined, fallback: boolean): boolean {
  if (typeof value !== "string") return fallback;
  return TRUE_VALUES.has(value.trim().toLowerCase());
}

function createFlightSearchRequestId(): string {
  const randomValue =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
  return `tpl_flight_search_${randomValue}`;
}
