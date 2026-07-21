import { tplApiRequest, type TplApiResult } from "./tplApiClient";

export type BackendFlightTestPaymentOrderRequest = {
  amount: number;
  currency: "INR";
  paymentMethod?: string;
  contactDetails?: {
    mobile?: string;
    email?: string;
  };
  idempotencyKey?: string;
};

export type BackendFlightTestPaymentOrderResponse = {
  bookingDraftId: string;
  bookingRef: string;
  paymentId: string;
  paymentRef: string;
  attemptId: string;
  gateway: "mock" | "razorpay" | "cashfree";
  amount: number;
  currency: "INR";
  status: "PAYMENT_PENDING_TEST_ONLY";
  supplierBookingDisabled: true;
  bookingAllowed: false;
  ticketingAllowed: false;
  paymentCaptureAllowed: false;
  pnr: null;
  ticketNumber: null;
  checkout?: BackendFlightRazorpayTestCheckout;
  warnings: string[];
};

export type BackendFlightRazorpayTestCheckout = {
  provider: "razorpay";
  mode: "test";
  keyId: string;
  orderId: string;
  amountMinor: number;
  currency: "INR";
  name: "TPL";
  description: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  testOnly: true;
};

export type BackendFlightTestPaymentConfirmRequest = {
  paymentId: string;
  gatewayPaymentId?: string;
  gatewaySignature?: string;
  testOutcome?: "success" | "failure";
  idempotencyKey?: string;
};

export type BackendFlightTestPaymentConfirmResponse = {
  bookingDraftId: string;
  bookingRef: string;
  backendBookingId?: string;
  backendBookingRef?: string;
  bookingPersisted?: boolean;
  paymentId: string;
  paymentRef: string;
  attemptId: string;
  status: "PAYMENT_TEST_AUTHORIZED" | "PAYMENT_TEST_FAILED" | "TPL_TEST_BOOKING_CONFIRMED";
  supplierBookingDisabled: true;
  bookingAllowed: false;
  ticketingAllowed: false;
  paymentCaptureAllowed: false;
  pnr: null;
  ticketNumber: null;
  simulatedConfirmation: {
    confirmationRef: string;
    bookingRef: string;
    confirmedAt?: string;
  };
  warnings: string[];
};

export function createFlightTestPaymentOrder(
  bookingDraftId: string,
  input: BackendFlightTestPaymentOrderRequest
): Promise<TplApiResult<BackendFlightTestPaymentOrderResponse>> {
  return tplApiRequest<BackendFlightTestPaymentOrderResponse>(
    `/api/v1/flights/bookings/${encodeURIComponent(bookingDraftId)}/payment/test-order`,
    {
      method: "POST",
      body: input,
      fallbackOnError: false,
    }
  );
}

export function confirmFlightTestPayment(
  bookingDraftId: string,
  input: BackendFlightTestPaymentConfirmRequest
): Promise<TplApiResult<BackendFlightTestPaymentConfirmResponse>> {
  return tplApiRequest<BackendFlightTestPaymentConfirmResponse>(
    `/api/v1/flights/bookings/${encodeURIComponent(bookingDraftId)}/payment/test-confirm`,
    {
      method: "POST",
      body: input,
      fallbackOnError: false,
    }
  );
}
