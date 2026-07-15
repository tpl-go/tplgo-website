"use client";

import {
  BOOKING_UPDATED_EVENT,
  type BookingItem,
} from "@/app/lib/booking/bookingStorage";
import {
  confirmManageUpgradePayment,
  confirmSamePriceManageRequest,
  createManageQuote,
  createManageRequest,
  isBackendManageBookingEnabled,
  settleManageDowngrade,
  shouldFallbackToLocalManage,
  startManageUpgradePayment,
  type ManageQuoteRequest,
} from "@/app/lib/api/manageBookingApi";

export type BackendManageOutcome<T = unknown> = {
  ok: boolean;
  startedFinancialSettlement?: boolean;
  fallbackAllowed: boolean;
  payload?: T;
  error?: string;
};

export type BackendManagePrepareInput = {
  booking: BookingItem;
  payload: Record<string, unknown>;
  serviceType: "cab" | "bus" | "hotel" | "homestay" | "cruise" | "package" | "train" | "flight" | "smart-planner";
  section: string;
  changeType: string;
  settlementMode: "save" | "payment" | "wallet_credit";
  currentAmount: number;
  requestedAmount: number;
  requestedChange: Record<string, unknown>;
  beforeSnapshot?: unknown;
  afterSnapshot?: unknown;
};

export type BackendManagePaymentInput = {
  booking: BookingItem;
  payload: Record<string, unknown>;
  serviceType: "cab" | "bus" | "hotel" | "homestay" | "cruise" | "package" | "train" | "flight" | "smart-planner";
  section: string;
  settlementMode: "payment" | "wallet_credit" | "save";
  amount: number;
  refundWalletRequested?: number;
  paymentAttemptId?: string;
};

export type BackendManageRefs = {
  backendManageQuoteId?: string;
  backendManageRequestId?: string;
  backendManagePaymentId?: string;
  backendManageRefundId?: string;
  backendManageWalletLedgerId?: string;
  backendManageStatus?: string;
  backendManageRequestStatus?: string;
  backendManageSettlementStarted?: boolean;
};

export function isBackendManageEligible(
  serviceType: string,
  booking: BookingItem | null | undefined
): boolean {
  if (!booking) return false;
  if (!isBackendManageBookingEnabled(serviceType)) return false;
  return Boolean(resolveBackendBookingId(booking));
}

export function resolveBackendBookingId(booking: BookingItem): string {
  const record = booking as BookingItem & {
    backendBookingId?: string;
    bookingRef?: string;
    legacyFrontendId?: string;
  };

  return (
    stringValue(record.backendBookingId) ||
    stringValue(record.bookingId) ||
    stringValue(record.id) ||
    stringValue(record.bookingRef) ||
    ""
  );
}

export async function executeBackendSamePriceManage(
  input: BackendManagePrepareInput
): Promise<BackendManageOutcome<Record<string, unknown>>> {
  if (!isBackendManageEligible(input.serviceType, input.booking)) {
    return localFallback("Backend manage booking is disabled or unavailable.");
  }

  const prepared = await prepareBackendManageRequest(input);
  if (!prepared.ok || !prepared.payload?.backendManageRequestId) return prepared;

  const backendBookingId = resolveBackendBookingId(input.booking);
  const requestId = stringValue(prepared.payload.backendManageRequestId);
  if (!requestId) return localFallback("Backend manage request was not prepared.");
  const confirmKey = getOrCreateSessionKey(
    `tpl_manage_same_price_key_${requestId}`,
    `manage:${backendBookingId}:save:${requestId}`
  );

  const result = await confirmSamePriceManageRequest(
    backendBookingId,
    requestId,
    {
      serviceType: input.serviceType,
      changeType: input.changeType,
      beforeSnapshot: input.beforeSnapshot,
      afterSnapshot: input.afterSnapshot,
      metadata: buildMetadata(input),
    },
    confirmKey
  );

  if (!result.ok) {
    return localFallback(result.error.message);
  }

  return {
    ok: true,
    fallbackAllowed: false,
    payload: mergeBackendRefs(prepared.payload, {
      backendManageStatus: "confirmed",
      backendManageRequestStatus: result.data.status || "confirmed",
    }),
  };
}

export async function prepareBackendManageRequest(
  input: BackendManagePrepareInput
): Promise<BackendManageOutcome<Record<string, unknown>>> {
  if (!isBackendManageEligible(input.serviceType, input.booking)) {
    return localFallback("Backend manage booking is disabled or unavailable.");
  }

  const backendBookingId = resolveBackendBookingId(input.booking);
  const changeHash = stableHash({
    serviceType: input.serviceType,
    section: input.section,
    changeType: input.changeType,
    currentAmount: input.currentAmount,
    requestedAmount: input.requestedAmount,
    requestedChange: input.requestedChange,
  });

  const quoteKey = getOrCreateSessionKey(
    `tpl_manage_quote_key_${backendBookingId}_${changeHash}`,
    `manage:${backendBookingId}:quote:${changeHash}`
  );

  const quotePayload = buildQuotePayload(input);
  const quoteResult = await createManageQuote(backendBookingId, quotePayload, quoteKey);

  if (!quoteResult.ok) {
    return localFallback(quoteResult.error.message);
  }

  const quoteId = quoteResult.data.quoteId || quoteResult.data.id;
  if (!quoteId) {
    return localFallback("Backend manage quote response did not include a quote id.");
  }

  const requestKey = getOrCreateSessionKey(
    `tpl_manage_request_key_${backendBookingId}_${changeHash}`,
    `manage:${backendBookingId}:request:${changeHash}`
  );

  const requestResult = await createManageRequest(
    backendBookingId,
    {
      ...quotePayload,
      quoteId,
      idempotencyKey: requestKey,
    },
    requestKey
  );

  if (!requestResult.ok) {
    return localFallback(requestResult.error.message);
  }

  const requestId = requestResult.data.requestId || requestResult.data.id;
  if (!requestId) {
    return localFallback("Backend manage request response did not include a request id.");
  }

  return {
    ok: true,
    fallbackAllowed: false,
    payload: mergeBackendRefs(input.payload, {
      backendManageQuoteId: quoteId,
      backendManageRequestId: requestId,
      backendManageStatus: "request_created",
      backendManageRequestStatus: requestResult.data.status || "created",
    }),
  };
}

export async function settleBackendManagePayment(
  input: BackendManagePaymentInput
): Promise<BackendManageOutcome<BackendManageRefs>> {
  if (!isBackendManageEligible(input.serviceType, input.booking)) {
    return localFallback("Backend manage booking is disabled or unavailable.");
  }

  const draft = asRecord(input.payload.manageDraft);
  const requestId = stringValue(input.payload.backendManageRequestId) || stringValue(draft.backendManageRequestId);
  if (!requestId) {
    return localFallback("Backend manage request was not prepared.");
  }

  const backendBookingId = resolveBackendBookingId(input.booking);

  if (input.settlementMode === "wallet_credit") {
    const settleKey = getOrCreateSessionKey(
      `tpl_manage_downgrade_key_${requestId}`,
      `manage:${backendBookingId}:downgrade-settlement:${requestId}`
    );

    const result = await settleManageDowngrade(
      backendBookingId,
      requestId,
      {
        serviceType: input.serviceType,
        settlementMode: input.settlementMode,
        metadata: {
          section: input.section,
          localBookingId: input.booking.id,
        },
      },
      settleKey
    );

    if (!result.ok) {
      return backendSettlementFailure(result.error.message);
    }

    return {
      ok: true,
      fallbackAllowed: false,
      startedFinancialSettlement: true,
      payload: {
        backendManageRequestId: requestId,
        backendManageWalletLedgerId: result.data.walletLedgerId,
        backendManageStatus: result.data.status || "confirmed",
        backendManageRequestStatus: result.data.status || "confirmed",
        backendManageSettlementStarted: true,
      },
    };
  }

  if (input.settlementMode === "payment") {
    const amountHash = stableHash({
      amount: input.amount,
      refundWalletRequested: input.refundWalletRequested || 0,
    });
    const startKey = getOrCreateSessionKey(
      `tpl_manage_payment_start_key_${requestId}_${amountHash}`,
      `manage:${backendBookingId}:payment:start:${requestId}:${amountHash}`
    );

    const startResult = await startManageUpgradePayment(
      backendBookingId,
      requestId,
      {
        serviceType: input.serviceType,
        amount: input.amount,
        refundWalletRequested: input.refundWalletRequested || 0,
        metadata: {
          section: input.section,
          localBookingId: input.booking.id,
        },
      },
      startKey
    );

    if (!startResult.ok) {
      return backendSettlementFailure(startResult.error.message);
    }

    const paymentAttemptId =
      input.paymentAttemptId ||
      startResult.data.paymentId ||
      startResult.data.id ||
      `attempt_${requestId}`;
    const confirmKey = getOrCreateSessionKey(
      `tpl_manage_payment_confirm_key_${requestId}_${paymentAttemptId}`,
      `manage:${backendBookingId}:payment:confirm:${requestId}:${paymentAttemptId}`
    );

    const confirmResult = await confirmManageUpgradePayment(
      backendBookingId,
      requestId,
      {
        serviceType: input.serviceType,
        paymentAttemptId,
        paymentId: startResult.data.paymentId || startResult.data.id,
        metadata: {
          section: input.section,
          localBookingId: input.booking.id,
        },
      },
      confirmKey
    );

    if (!confirmResult.ok) {
      return backendSettlementFailure(confirmResult.error.message);
    }

    return {
      ok: true,
      fallbackAllowed: false,
      startedFinancialSettlement: true,
      payload: {
        backendManageRequestId: requestId,
        backendManagePaymentId:
          confirmResult.data.paymentId ||
          confirmResult.data.id ||
          startResult.data.paymentId ||
          startResult.data.id,
        backendManageStatus: confirmResult.data.status || confirmResult.data.paymentStatus || "confirmed",
        backendManageRequestStatus: confirmResult.data.status || "confirmed",
        backendManageSettlementStarted: true,
      },
    };
  }

  return executeBackendSamePriceManage({
    booking: input.booking,
    payload: input.payload,
    serviceType: input.serviceType,
    section: input.section,
    changeType: "same_price",
    settlementMode: "save",
    currentAmount: input.amount,
    requestedAmount: input.amount,
    requestedChange: asRecord(input.payload.manageDraft),
    beforeSnapshot: input.payload,
    afterSnapshot: input.payload,
  });
}

export function mergeBackendRefs<T extends Record<string, unknown>>(
  payload: T,
  refs: BackendManageRefs
): T & BackendManageRefs {
  const draft = asRecord(payload.manageDraft);
  return {
    ...payload,
    ...refs,
    manageDraft: {
      ...draft,
      ...refs,
    },
  };
}

export function persistBackendManageCache(
  payloadStorageKey: string | undefined,
  payload: Record<string, unknown>
): boolean {
  if (typeof window === "undefined" || !payloadStorageKey) return false;
  window.localStorage.setItem(payloadStorageKey, JSON.stringify(payload));
  window.dispatchEvent(new Event(BOOKING_UPDATED_EVENT));
  return true;
}

export function buildManageSuccessQuery(refs: BackendManageRefs): string {
  const params = new URLSearchParams();
  if (refs.backendManageQuoteId) params.set("backendManageQuoteId", refs.backendManageQuoteId);
  if (refs.backendManageRequestId) params.set("backendManageRequestId", refs.backendManageRequestId);
  if (refs.backendManagePaymentId) params.set("backendManagePaymentId", refs.backendManagePaymentId);
  if (refs.backendManageWalletLedgerId) params.set("backendManageWalletLedgerId", refs.backendManageWalletLedgerId);
  if (refs.backendManageStatus) params.set("backendManageStatus", refs.backendManageStatus);
  const query = params.toString();
  return query ? `&${query}` : "";
}

function buildQuotePayload(input: BackendManagePrepareInput): ManageQuoteRequest {
  const ownerMobile = input.booking.mobile || input.booking.leadTraveller?.mobile || "";
  const metadata = buildMetadata(input);

  return {
    serviceType: input.serviceType,
    changeType: input.changeType,
    currentBooking: input.booking,
    requestedChange: input.requestedChange,
    beforeSnapshot: input.beforeSnapshot || input.payload,
    afterSnapshot: input.afterSnapshot || input.payload,
    currentAmount: input.currentAmount,
    requestedAmount: input.requestedAmount,
    supplierChargeAmount: 0,
    penaltyAmount: 0,
    refundWalletRequested: 0,
    actor: {
      type: "customer",
      mobile: ownerMobile,
    },
    owner: {
      mobile: ownerMobile,
    },
    metadata,
  };
}

function buildMetadata(input: BackendManagePrepareInput): Record<string, unknown> {
  return {
    section: input.section,
    localBookingId: input.booking.id,
    payloadStorageKey: input.booking.payloadStorageKey,
    settlementMode: input.settlementMode,
  };
}

function localFallback(error: string): BackendManageOutcome<Record<string, unknown>> {
  return {
    ok: false,
    fallbackAllowed: shouldFallbackToLocalManage(),
    error,
  };
}

function backendSettlementFailure(error: string): BackendManageOutcome<BackendManageRefs> {
  return {
    ok: false,
    startedFinancialSettlement: true,
    fallbackAllowed: false,
    error,
  };
}

function getOrCreateSessionKey(storageKey: string, value: string): string {
  if (typeof window === "undefined") return value;

  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  window.sessionStorage.setItem(storageKey, value);
  return value;
}

function stableHash(value: unknown): string {
  const serialized = stableStringify(value);
  let hash = 0;
  for (let index = 0; index < serialized.length; index += 1) {
    hash = (hash << 5) - hash + serialized.charCodeAt(index);
    hash |= 0;
  }
  return Math.abs(hash).toString(36);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};
}

function stringValue(value: unknown): string {
  return typeof value === "string" || typeof value === "number"
    ? String(value).trim()
    : "";
}
