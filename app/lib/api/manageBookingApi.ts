"use client";

import {
  getStoredAuthToken,
  tplApiRequest,
  type TplApiResult,
} from "@/app/lib/api/tplApiClient";

export type ManageServiceType =
  | "cab"
  | "bus"
  | "flight"
  | "hotel"
  | "homestay"
  | "package"
  | "train"
  | "cruise"
  | "visa"
  | "insurance"
  | "smart-planner";

export type ManageChangeType =
  | "same_price"
  | "upgrade"
  | "downgrade"
  | "cancellation"
  | "traveller_update"
  | "contact_update"
  | "seat_update"
  | "date_change"
  | "add_on_update";

export type ManageQuoteRequest = {
  serviceType: string;
  changeType: string;
  currentBooking?: unknown;
  requestedChange?: unknown;
  beforeSnapshot?: unknown;
  afterSnapshot?: unknown;
  currentAmount?: number;
  requestedAmount?: number;
  supplierChargeAmount?: number;
  penaltyAmount?: number;
  refundWalletRequested?: number;
  actor?: unknown;
  owner?: unknown;
  metadata?: Record<string, unknown>;
};

export type ManageRequestRequest = ManageQuoteRequest & {
  quoteId?: string;
  idempotencyKey?: string;
};

export type ManageQuoteResponse = {
  quoteId?: string;
  id?: string;
  requestId?: string;
  bookingId?: string;
  serviceType?: string;
  changeType?: string;
  settlementType?: string;
  currentAmount?: number;
  requestedAmount?: number;
  supplierChargeAmount?: number;
  penaltyAmount?: number;
  grossDelta?: number;
  netPayable?: number;
  refundWalletEligibleAmount?: number;
  originalPaymentRefundEligibleAmount?: number;
  paymentRequired?: boolean;
  directSaveEligible?: boolean;
  promoCreditEligible?: boolean;
  earnedCreditEligible?: boolean;
  earnedCreditGeneration?: number;
  refundWalletUsageAllowed?: boolean;
  supplierDecision?: unknown;
  beforeSnapshot?: unknown;
  afterSnapshot?: unknown;
  adapterName?: string;
  adapterVersion?: string;
  expiresAt?: string;
  idempotencyKey?: string;
};

export type ManageRequestResponse = {
  requestId?: string;
  id?: string;
  quoteId?: string;
  bookingId?: string;
  serviceType?: string;
  changeType?: string;
  settlementType?: string;
  status?: string;
  payment?: ManagePaymentResponse;
  downgrade?: ManageSettlementResponse;
  cancellation?: ManageSettlementResponse;
  booking?: unknown;
  metadata?: Record<string, unknown>;
};

export type ManagePaymentResponse = {
  paymentId?: string;
  id?: string;
  status?: string;
  paymentStatus?: string;
  netPayable?: number;
  remainingPayable?: number;
  refundWalletRequested?: number;
  refundWalletApplied?: number;
  metadata?: Record<string, unknown>;
};

export type ManageSettlementResponse = {
  status?: string;
  walletLedgerId?: string;
  refundId?: string;
  amount?: number;
  metadata?: Record<string, unknown>;
};

export type BookingCancellationResponse = {
  bookingId?: string;
  bookingRef?: string;
  status?: string;
  bookingStatus?: string;
  cancellationId?: string;
  cancellationStatus?: string;
  refundId?: string;
  refundStatus?: string;
  refundMethod?: string;
  refundAmount?: number;
  amount?: number;
  paymentId?: string;
  liveProviderRefundExecuted?: boolean;
  supplierCancellationExecuted?: boolean;
  pnr?: string | null;
  ticketNumber?: string | null;
  metadata?: Record<string, unknown>;
};

export type BookingRefundReadbackResponse = {
  bookingId?: string;
  bookingRef?: string;
  refunds?: BookingCancellationResponse[];
  refund?: BookingCancellationResponse;
  items?: BookingCancellationResponse[];
  status?: string;
  refundStatus?: string;
  refundMethod?: string;
  refundId?: string;
  amount?: number;
  refundAmount?: number;
  paymentId?: string;
  liveProviderRefundExecuted?: boolean;
  supplierCancellationExecuted?: boolean;
};

const MANAGE_ENABLED_FLAG = "NEXT_PUBLIC_TPL_USE_BACKEND_MANAGE_BOOKING";
const MANAGE_SERVICES_FLAG = "NEXT_PUBLIC_TPL_BACKEND_MANAGE_BOOKING_SERVICES";
const MANAGE_FALLBACK_FLAG = "NEXT_PUBLIC_TPL_BACKEND_MANAGE_FALLBACK_TO_LOCAL";
const MANAGE_DEBUG_FLAG = "NEXT_PUBLIC_TPL_DEBUG_MANAGE_PAYLOADS";

export function isBackendManageBookingEnabled(serviceType: string): boolean {
  if (!readBooleanEnv(MANAGE_ENABLED_FLAG, false)) return false;
  if (!getStoredAuthToken()) return false;

  const allowlist = readServiceAllowlist();
  if (!allowlist.length) return false;
  return allowlist.includes(serviceType.trim().toLowerCase());
}

export function shouldFallbackToLocalManage(): boolean {
  return readBooleanEnv(MANAGE_FALLBACK_FLAG, true);
}

export async function createManageQuote(
  bookingId: string,
  payload: ManageQuoteRequest,
  idempotencyKey?: string
): Promise<TplApiResult<ManageQuoteResponse>> {
  return manageRequest<ManageQuoteResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/quote`,
    payload,
    idempotencyKey
  );
}

export async function createManageRequest(
  bookingId: string,
  payload: ManageRequestRequest,
  idempotencyKey?: string
): Promise<TplApiResult<ManageRequestResponse>> {
  return manageRequest<ManageRequestResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests`,
    payload,
    idempotencyKey || payload.idempotencyKey
  );
}

export async function getManageRequest(
  bookingId: string,
  requestId: string
): Promise<TplApiResult<ManageRequestResponse>> {
  return tplApiRequest<ManageRequestResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}`
  );
}

export async function listManageRequests(
  bookingId: string
): Promise<TplApiResult<ManageRequestResponse[]>> {
  return tplApiRequest<ManageRequestResponse[]>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests`
  );
}

export async function confirmSamePriceManageRequest(
  bookingId: string,
  requestId: string,
  payload: Record<string, unknown> = {},
  idempotencyKey?: string
): Promise<TplApiResult<ManageRequestResponse>> {
  return manageRequest<ManageRequestResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/confirm`,
    payload,
    idempotencyKey
  );
}

export async function startManageUpgradePayment(
  bookingId: string,
  requestId: string,
  payload: Record<string, unknown>,
  idempotencyKey?: string
): Promise<TplApiResult<ManagePaymentResponse>> {
  return manageRequest<ManagePaymentResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/payment/start`,
    payload,
    idempotencyKey
  );
}

export async function confirmManageUpgradePayment(
  bookingId: string,
  requestId: string,
  payload: Record<string, unknown>,
  idempotencyKey?: string
): Promise<TplApiResult<ManagePaymentResponse>> {
  return manageRequest<ManagePaymentResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/payment/confirm`,
    payload,
    idempotencyKey
  );
}

export async function getManageUpgradePayment(
  bookingId: string,
  requestId: string
): Promise<TplApiResult<ManagePaymentResponse>> {
  return tplApiRequest<ManagePaymentResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/payment`
  );
}

export async function settleManageDowngrade(
  bookingId: string,
  requestId: string,
  payload: Record<string, unknown>,
  idempotencyKey?: string
): Promise<TplApiResult<ManageSettlementResponse>> {
  return manageRequest<ManageSettlementResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/downgrade/settle`,
    payload,
    idempotencyKey
  );
}

export async function getManageDowngradeSettlement(
  bookingId: string,
  requestId: string
): Promise<TplApiResult<ManageSettlementResponse>> {
  return tplApiRequest<ManageSettlementResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/downgrade`
  );
}

export async function settleManageCancellation(
  bookingId: string,
  requestId: string,
  payload: Record<string, unknown>,
  idempotencyKey?: string
): Promise<TplApiResult<ManageSettlementResponse>> {
  return manageRequest<ManageSettlementResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/cancellation/settle`,
    payload,
    idempotencyKey
  );
}

export async function getManageCancellationSettlement(
  bookingId: string,
  requestId: string
): Promise<TplApiResult<ManageSettlementResponse>> {
  return tplApiRequest<ManageSettlementResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/manage/requests/${encodeURIComponent(requestId)}/cancellation`
  );
}

export async function cancelBackendBooking(
  bookingId: string,
  payload: Record<string, unknown>,
  idempotencyKey?: string
): Promise<TplApiResult<BookingCancellationResponse>> {
  return manageRequest<BookingCancellationResponse>(
    `/api/v1/bookings/${encodeURIComponent(bookingId)}/cancel`,
    payload,
    idempotencyKey
  );
}

export async function getRefundByBooking(
  bookingId: string
): Promise<TplApiResult<BookingRefundReadbackResponse>> {
  return tplApiRequest<BookingRefundReadbackResponse>(
    `/api/v1/refunds/by-booking/${encodeURIComponent(bookingId)}`
  );
}

async function manageRequest<TData>(
  path: string,
  payload: unknown,
  idempotencyKey?: string
): Promise<TplApiResult<TData>> {
  debugManagePayload(path, payload);
  return tplApiRequest<TData>(path, {
    method: "POST",
    body: payload,
    idempotencyKey,
  });
}

function readServiceAllowlist(): string[] {
  return String(process.env[MANAGE_SERVICES_FLAG] || "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function readBooleanEnv(key: string, defaultValue: boolean): boolean {
  const value = process.env[key];
  if (typeof value === "undefined" || value === "") return defaultValue;
  return value === "true" || value === "1" || value === "yes";
}

function debugManagePayload(path: string, payload: unknown) {
  if (!readBooleanEnv(MANAGE_DEBUG_FLAG, false)) return;
  console.debug("[TPL Manage Booking]", path, payload);
}
