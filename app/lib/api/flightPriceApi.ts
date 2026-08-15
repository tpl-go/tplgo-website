import { tplApiRequest, type TplApiResult } from "./tplApiClient";
import type { FlightCurrency } from "@/app/lib/flights/flightCurrency";

export type BackendFlightPriceConfirmRequest = {
  searchId: string;
  fareId?: string;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  currency: "INR";
  clientOfferSnapshot?: {
    total: number;
    currency: FlightCurrency;
  };
};

export type BackendFlightPriceConfirmResponse = {
  priceConfirmationId: string;
  searchId: string;
  offerId: string;
  fareId?: string;
  providerId: string;
  status: "confirmed" | "price_changed" | "expired" | "unavailable" | "provider_pending";
  expiresAt: string;
  pricedAt: string;
  fareRulesSummary: string;
  baggageSummary: string;
  price: {
    baseFare: number;
    taxes: number;
    fees: number;
    total: number;
    currency: FlightCurrency;
  };
  priceChanged: boolean;
  previousTotal?: number;
  ticketingAllowed: false;
  bookingAllowed: false;
  warnings: string[];
};

export function confirmBackendFlightPrice(
  offerId: string,
  input: BackendFlightPriceConfirmRequest
): Promise<TplApiResult<BackendFlightPriceConfirmResponse>> {
  return tplApiRequest<BackendFlightPriceConfirmResponse>(`/api/v1/flights/offers/${encodeURIComponent(offerId)}/price`, {
    method: "POST",
    body: input,
    fallbackOnError: false,
  });
}
