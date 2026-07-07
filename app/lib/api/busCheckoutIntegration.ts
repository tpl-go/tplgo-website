import {
  backendFeatureFlags,
  isBackendCheckoutEnabled,
} from "./backendFeatureFlags";
import {
  confirmServiceCheckout,
  startServiceCheckout,
} from "./serviceCheckoutApi";
import { isTplApiConfigured } from "./tplApiClient";
import { prepareBackendCheckoutWalletPayload } from "./backendCheckoutWalletGuard";

export type BusBackendCheckoutRefs = {
  backendCheckoutId?: string;
  backendBookingId?: string;
  backendPaymentId?: string;
  backendRequestId?: string;
  backendServiceType?: "bus";
  backendCheckoutStatus?: string;
};

export type BusBackendAttemptResult<TPayload> = {
  payload: TPayload;
  refs: BusBackendCheckoutRefs;
  attempted: boolean;
  ok: boolean;
};

const BUS_START_KEY_PREFIX = "tpl_bus_backend_start_key_";
const BUS_CONFIRM_KEY_PREFIX = "tpl_bus_backend_confirm_key_";

export function isBusBackendCheckoutReady(): boolean {
  return isBackendCheckoutEnabled("bus") && isTplApiConfigured();
}

export async function startBusBackendCheckout<TPayload extends Record<string, unknown>>(
  rawPayload: TPayload
): Promise<BusBackendAttemptResult<TPayload>> {
  if (!isBusBackendCheckoutReady()) {
    return { payload: rawPayload, refs: {}, attempted: false, ok: false };
  }

  const guarded = await prepareBackendCheckoutWalletPayload("bus", rawPayload);
  const guardedPayload = guarded.payload as TPayload;
  const hash = hashPayload(guardedPayload);
  const idempotencyKey = readOrCreateSessionKey(
    `${BUS_START_KEY_PREFIX}${hash}`,
    `bus:start:${hash}`
  );

  const result = await startServiceCheckout("bus", guardedPayload, idempotencyKey);

  if (!result.ok) {
    const errorPayload = "error" in result ? result.error : undefined;
    logBusBackendDebug("Bus backend checkout start failed", {
      requestId: result.requestId,
      error: errorPayload,
    });

    if (backendFeatureFlags.fallbackToLocalFlow) {
      return { payload: rawPayload, refs: {}, attempted: true, ok: false };
    }

    throw new Error("Bus backend checkout start failed.");
  }

  const refs: BusBackendCheckoutRefs = {
    backendCheckoutId: readStringPath(result.data, ["checkout.id", "checkout.checkoutId", "checkout.checkoutRef"]),
    backendBookingId: readStringPath(result.data, ["booking.bookingId", "booking.id", "checkout.bookingId"]),
    backendPaymentId: readStringPath(result.data, ["payment.id", "payment.paymentId", "checkout.paymentId"]),
    backendRequestId: result.requestId,
    backendServiceType: "bus",
    backendCheckoutStatus: readStringPath(result.data, ["checkout.status"]),
  };

  const payloadWithRefs = {
    ...guardedPayload,
    ...removeEmptyRefs(refs),
  };

  logBusBackendDebug("Bus backend checkout start succeeded", refs);

  return {
    payload: payloadWithRefs,
    refs,
    attempted: true,
    ok: true,
  };
}

export async function confirmBusBackendCheckout<TPayload extends Record<string, unknown>>(
  confirmationPayload: TPayload
): Promise<BusBackendAttemptResult<TPayload>> {
  if (!isBusBackendCheckoutReady()) {
    return { payload: confirmationPayload, refs: {}, attempted: false, ok: false };
  }

  const checkoutId = readOwnString(confirmationPayload, "backendCheckoutId");
  if (!checkoutId) {
    return { payload: confirmationPayload, refs: {}, attempted: false, ok: false };
  }

  const paymentAttemptId =
    readOwnString(confirmationPayload, "backendPaymentId") ||
    readOwnString(confirmationPayload, "paymentId") ||
    readOwnString(confirmationPayload, "transactionId") ||
    hashPayload(confirmationPayload);

  const sessionKey = `${BUS_CONFIRM_KEY_PREFIX}${checkoutId}_${paymentAttemptId}`;
  const idempotencyKey = readOrCreateSessionKey(
    sessionKey,
    `bus:confirm:${checkoutId}:${paymentAttemptId}`
  );

  const result = await confirmServiceCheckout(
    "bus",
    checkoutId,
    {
      gatewayPaymentId: readOwnString(confirmationPayload, "paymentId") || paymentAttemptId,
      metadata: {
        source: "bus_frontend_phase_15",
        paymentMethod: readOwnString(confirmationPayload, "paymentMethod"),
        paymentId: readOwnString(confirmationPayload, "paymentId"),
      },
    },
    idempotencyKey
  );

  if (!result.ok) {
    const errorPayload = "error" in result ? result.error : undefined;
    logBusBackendDebug("Bus backend checkout confirm failed", {
      requestId: result.requestId,
      error: errorPayload,
    });

    if (backendFeatureFlags.fallbackToLocalFlow) {
      return { payload: confirmationPayload, refs: {}, attempted: true, ok: false };
    }

    throw new Error("Bus backend checkout confirmation failed.");
  }

  const refs: BusBackendCheckoutRefs = {
    backendCheckoutId: readStringPath(result.data, ["checkout.id", "checkout.checkoutId", "checkout.checkoutRef"]) || checkoutId,
    backendBookingId: readStringPath(result.data, ["booking.bookingId", "booking.id", "checkout.bookingId"]),
    backendPaymentId: readStringPath(result.data, ["payment.id", "payment.paymentId", "checkout.paymentId"]),
    backendRequestId: result.requestId,
    backendServiceType: "bus",
    backendCheckoutStatus: readStringPath(result.data, ["checkout.status"]),
  };

  const payloadWithRefs = {
    ...confirmationPayload,
    ...removeEmptyRefs(refs),
  };

  logBusBackendDebug("Bus backend checkout confirm succeeded", refs);

  return {
    payload: payloadWithRefs,
    refs,
    attempted: true,
    ok: true,
  };
}

function readOrCreateSessionKey(storageKey: string, fallbackValue: string): string {
  if (typeof window === "undefined") return fallbackValue;

  const existing = window.sessionStorage.getItem(storageKey);
  if (existing) return existing;

  window.sessionStorage.setItem(storageKey, fallbackValue);
  return fallbackValue;
}

function readStringPath(source: unknown, paths: string[]): string | undefined {
  for (const path of paths) {
    const value = path.split(".").reduce<unknown>((current, part) => {
      if (!current || typeof current !== "object" || Array.isArray(current)) return undefined;
      return (current as Record<string, unknown>)[part];
    }, source);

    if (typeof value === "string" && value.trim()) return value.trim();
  }

  return undefined;
}

function readOwnString(source: Record<string, unknown>, key: string): string | undefined {
  const value = source[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function removeEmptyRefs(refs: BusBackendCheckoutRefs): BusBackendCheckoutRefs {
  return Object.fromEntries(
    Object.entries(refs).filter(([, value]) => typeof value !== "undefined" && value !== "")
  ) as BusBackendCheckoutRefs;
}

function logBusBackendDebug(message: string, value: unknown): void {
  if (!backendFeatureFlags.debugBackendPayloads) return;
  console.info(message, value);
}

function hashPayload(value: unknown): string {
  const input = stableStringify(value);
  let hash = 5381;

  for (let index = 0; index < input.length; index += 1) {
    hash = (hash * 33) ^ input.charCodeAt(index);
  }

  return (hash >>> 0).toString(36);
}

function stableStringify(value: unknown): string {
  if (value === null || typeof value !== "object") return JSON.stringify(value);

  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(",")}]`;
  }

  const record = value as Record<string, unknown>;
  return `{${Object.keys(record)
    .sort()
    .map((key) => `${JSON.stringify(key)}:${stableStringify(record[key])}`)
    .join(",")}}`;
}
