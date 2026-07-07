import { tplApiRequest, type TplApiResult } from "./tplApiClient";

export type ServiceCheckoutApiServiceType =
  | "flight"
  | "hotel"
  | "homestay"
  | "package"
  | "bus"
  | "train"
  | "cab"
  | "cruise"
  | "visa"
  | "insurance"
  | "smart-planner";

export type ServiceCheckoutPreviewResponse = {
  serviceType: ServiceCheckoutApiServiceType;
  normalizedSummary: Record<string, unknown>;
  pricingInput: Record<string, unknown>;
  travellerSummary: Record<string, unknown>;
  bookingCreateInput: Record<string, unknown>;
  checkoutQuoteInput: Record<string, unknown>;
};

export type ServiceCheckoutCreateResponse = {
  booking: unknown;
  detail: unknown;
  quote: unknown;
  normalizedSummary: Record<string, unknown>;
};

export type ServiceCheckoutStartResponse = {
  checkout: unknown;
  payment: unknown;
  booking?: unknown;
  quote?: unknown;
  normalizedSummary?: Record<string, unknown>;
};

export type ServiceCheckoutConfirmResponse = {
  checkout: unknown;
  payment?: unknown;
  booking?: unknown;
  wallet?: unknown;
  offerRedemption?: unknown;
};

export type ServiceCheckoutGetResponse = {
  checkout: unknown;
  booking?: unknown;
  normalizedSummary?: Record<string, unknown>;
};

export type ServiceCheckoutConfirmPayload = Record<string, unknown>;

export function previewServiceCheckout(
  serviceType: ServiceCheckoutApiServiceType,
  rawPayload: unknown
): Promise<TplApiResult<ServiceCheckoutPreviewResponse>> {
  return tplApiRequest<ServiceCheckoutPreviewResponse>(serviceCheckoutPath(serviceType, "preview"), {
    method: "POST",
    body: { rawPayload },
  });
}

export function createServiceCheckout(
  serviceType: ServiceCheckoutApiServiceType,
  rawPayload: unknown,
  idempotencyKey: string
): Promise<TplApiResult<ServiceCheckoutCreateResponse>> {
  return tplApiRequest<ServiceCheckoutCreateResponse>(serviceCheckoutPath(serviceType, "create"), {
    method: "POST",
    body: { rawPayload },
    idempotencyKey,
  });
}

export function startServiceCheckout(
  serviceType: ServiceCheckoutApiServiceType,
  rawPayload: unknown,
  idempotencyKey: string
): Promise<TplApiResult<ServiceCheckoutStartResponse>> {
  return tplApiRequest<ServiceCheckoutStartResponse>(serviceCheckoutPath(serviceType, "start"), {
    method: "POST",
    body: { rawPayload },
    idempotencyKey,
  });
}

export function confirmServiceCheckout(
  serviceType: ServiceCheckoutApiServiceType,
  checkoutId: string,
  payload: ServiceCheckoutConfirmPayload,
  idempotencyKey: string
): Promise<TplApiResult<ServiceCheckoutConfirmResponse>> {
  return tplApiRequest<ServiceCheckoutConfirmResponse>(
    serviceCheckoutPath(serviceType, `${encodeURIComponent(checkoutId)}/confirm`),
    {
      method: "POST",
      body: payload,
      idempotencyKey,
    }
  );
}

export function getServiceCheckout(
  serviceType: ServiceCheckoutApiServiceType,
  checkoutId: string
): Promise<TplApiResult<ServiceCheckoutGetResponse>> {
  return tplApiRequest<ServiceCheckoutGetResponse>(
    serviceCheckoutPath(serviceType, encodeURIComponent(checkoutId))
  );
}

function serviceCheckoutPath(serviceType: ServiceCheckoutApiServiceType, suffix: string): string {
  return `/api/v1/services/${encodeURIComponent(serviceType)}/checkout/${suffix}`;
}

