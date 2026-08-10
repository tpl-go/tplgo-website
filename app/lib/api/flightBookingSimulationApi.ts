import { tplApiRequest, type TplApiResult } from "./tplApiClient";
import type {
  FlightCurrency,
  FlightDisplayPriceSnapshot,
  FlightPaymentQuoteSnapshot,
  FlightPriceSnapshot,
} from "@/app/lib/flights/flightCurrency";

export type BackendFlightBookingSimulationRequest = {
  searchId: string;
  offerId: string;
  fareId?: string;
  priceConfirmationId: string;
  acceptedPriceChange?: boolean;
  passengers: {
    adults: number;
    children: number;
    infants: number;
  };
  travellers: Array<{
    type: "adult" | "child" | "infant";
    title?: string;
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    gender?: string;
    nationality?: string;
    passportNumber?: string;
    passportIssuingCountry?: string;
    passportExpiryDate?: string;
  }>;
  contactDetails: {
    countryCode: string;
    mobile: string;
    email: string;
  };
  gstDetails?: {
    hasGst: boolean;
    gstNumber?: string;
    companyName?: string;
    state?: string;
  };
  ancillaries?: Record<string, unknown>;
  clientPricingSnapshot?: {
    total: number;
    currency: FlightCurrency;
    displayTotal?: number;
    displayCurrency?: FlightCurrency;
    paymentQuoteId?: string;
  };
  idempotencyKey?: string;
};

export type BackendFlightBookingSimulationResponse = {
  simulationId: string;
  bookingDraftId: string;
  bookingRef: string;
  searchId: string;
  offerId: string;
  fareId?: string;
  priceConfirmationId: string;
  providerId: string;
  status: "SIMULATION_CREATED" | "PAYMENT_PENDING_TEST_ONLY";
  supplierBookingDisabled: true;
  bookingAllowed: false;
  ticketingAllowed: false;
  paymentCaptureAllowed: false;
  pnr: null;
  ticketNumber: null;
  expiresAt: string;
  createdAt: string;
  priceSnapshot: {
    baseFare: number;
    taxes: number;
    fees: number;
    total: number;
    currency: FlightCurrency;
  };
  supplierPriceSnapshot?: FlightPriceSnapshot;
  displayPriceSnapshot?: FlightDisplayPriceSnapshot;
  paymentQuote?: FlightPaymentQuoteSnapshot;
  warnings: string[];
  nextAction: "test_payment_pending" | "refresh_price" | "search_again";
};

export function simulateBackendFlightBooking(
  input: BackendFlightBookingSimulationRequest
): Promise<TplApiResult<BackendFlightBookingSimulationResponse>> {
  return tplApiRequest<BackendFlightBookingSimulationResponse>("/api/v1/flights/bookings/simulate", {
    method: "POST",
    body: input,
    fallbackOnError: false,
  });
}
