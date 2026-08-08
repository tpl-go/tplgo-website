import { tplApiRequest, type TplApiResult } from "./tplApiClient";
import type {
  FlightCurrency,
  FlightDisplayPriceSnapshot,
  FlightPaymentQuoteSnapshot,
  FlightPriceSnapshot,
} from "@/app/lib/flights/flightCurrency";

export type BackendFlightAncillaryOption = {
  id: string;
  category: "seat" | "paid_baggage" | "meal";
  travellerRefs: string[];
  segmentRefs: string[];
  label: string;
  code?: string;
  available: boolean;
  supplierPrice: {
    amount: number;
    currency: FlightCurrency;
  };
  displayPrice: FlightDisplayPriceSnapshot;
  details?: Record<string, unknown>;
};

export type BackendFlightAncillarySet = {
  ancillarySetId: string;
  searchId: string;
  offerId: string;
  priceConfirmationId?: string;
  providerId: string;
  source: "mock-flight" | "amadeus-test" | "duffel-test" | "tripjack-test" | string;
  expiresAt: string;
  seats: BackendFlightAncillaryOption[];
  paidBaggage: BackendFlightAncillaryOption[];
  meals: BackendFlightAncillaryOption[];
  capabilities: {
    seatMap: "available" | "unavailable";
    paidBaggage: "available" | "unavailable";
    meals: "available" | "unavailable";
  };
  warnings: string[];
};

export type BackendFlightAncillaryQuote = {
  quoteId: string;
  searchId: string;
  offerId: string;
  ancillarySetId: string;
  priceConfirmationId: string;
  providerId: string;
  selectedAncillaries: BackendFlightAncillaryOption[];
  baseSupplierPrice: FlightPriceSnapshot;
  ancillarySupplierTotal: {
    amount: number;
    currency: FlightCurrency;
  };
  displayTotal: FlightDisplayPriceSnapshot;
  payableQuote: FlightPaymentQuoteSnapshot;
  expiresAt: string;
  warnings: string[];
};

export function fetchBackendFlightAncillaries(
  offerId: string,
  input: {
    searchId: string;
    priceConfirmationId?: string;
    displayCurrency?: FlightCurrency;
  }
): Promise<TplApiResult<BackendFlightAncillarySet>> {
  const query = new URLSearchParams({ searchId: input.searchId });
  if (input.priceConfirmationId) query.set("priceConfirmationId", input.priceConfirmationId);
  if (input.displayCurrency) query.set("displayCurrency", input.displayCurrency);
  return tplApiRequest<BackendFlightAncillarySet>(
    `/api/v1/flights/offers/${encodeURIComponent(offerId)}/ancillaries?${query.toString()}`,
    { method: "GET", fallbackOnError: false }
  );
}

export function quoteBackendFlightAncillaries(
  offerId: string,
  input: {
    searchId: string;
    priceConfirmationId: string;
    ancillarySetId: string;
    displayCurrency?: FlightCurrency;
    selectedAncillaryIds: string[];
  }
): Promise<TplApiResult<BackendFlightAncillaryQuote>> {
  return tplApiRequest<BackendFlightAncillaryQuote>(
    `/api/v1/flights/offers/${encodeURIComponent(offerId)}/ancillaries/quote`,
    {
      method: "POST",
      body: input,
      fallbackOnError: false,
    }
  );
}
