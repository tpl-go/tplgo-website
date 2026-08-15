import {
  getStoredAuthToken,
  tplApiRequest,
  type TplApiResult,
} from "./tplApiClient";
import {
  getWallet,
  getWalletLedger,
  type Wallet,
  type WalletLedgerItem,
} from "@/app/lib/wallet/walletStorage";

export type BackendWalletShape = {
  promoCredit: number;
  earnedCredit: number;
  refundableBalance: number;
};

export type BackendWalletResult =
  | {
      ok: true;
      wallet: BackendWalletShape;
      requestId: string;
    }
  | {
      ok: false;
      wallet: BackendWalletShape;
      requestId?: string;
      status?: number;
      code: string;
      message: string;
    };

export type BackendWalletLedgerResult =
  | {
      ok: true;
      ledger: WalletLedgerItem[];
      requestId: string;
    }
  | {
      ok: false;
      ledger: WalletLedgerItem[];
      requestId?: string;
      status?: number;
      code: string;
      message: string;
    };

export type BackendFirstWalletResult = {
  wallet: Wallet;
  source: "backend" | "local_fallback";
  requestId?: string;
  error?: {
    status?: number;
    code: string;
    message: string;
  };
};

export type BackendFirstWalletLedgerResult = {
  ledger: WalletLedgerItem[];
  source: "backend" | "local_fallback";
  requestId?: string;
  error?: {
    status?: number;
    code: string;
    message: string;
  };
};

const emptyWallet: BackendWalletShape = {
  promoCredit: 0,
  earnedCredit: 0,
  refundableBalance: 0,
};

const backendLedgerTypes = new Set<WalletLedgerItem["type"]>([
  "promo_added",
  "earned_added",
  "refund_credit",
  "wallet_used",
  "wallet_reversal",
  "expiry",
  "adjustment",
]);

export async function fetchBackendWallet(
  mobile?: string
): Promise<BackendWalletResult> {
  const path = mobile?.trim()
    ? `/api/v1/wallet?mobile=${encodeURIComponent(mobile.trim())}`
    : "/api/v1/wallet";

  const result = await tplApiRequest<unknown>(path);
  return normalizeWalletResult(result);
}

export async function fetchBackendWalletLedger(
  mobile?: string
): Promise<BackendWalletLedgerResult> {
  const path = mobile?.trim()
    ? `/api/v1/wallet/ledger?mobile=${encodeURIComponent(mobile.trim())}`
    : "/api/v1/wallet/ledger";

  const result = await tplApiRequest<unknown>(path);
  return normalizeLedgerResult(result);
}

export async function getBackendFirstWallet(
  mobile?: string
): Promise<BackendFirstWalletResult> {
  if (!getStoredAuthToken()) {
    return {
      wallet: getWallet(mobile),
      source: "local_fallback",
    };
  }

  const result = await fetchBackendWallet();
  if (result.ok) {
    return {
      wallet: result.wallet,
      source: "backend",
      requestId: result.requestId,
    };
  }

  return {
    wallet: getWallet(mobile),
    source: "local_fallback",
    requestId: result.requestId,
    error: {
      status: result.status,
      code: result.code,
      message: result.message,
    },
  };
}

export async function getBackendFirstWalletLedger(
  mobile?: string
): Promise<BackendFirstWalletLedgerResult> {
  if (!getStoredAuthToken()) {
    return {
      ledger: getWalletLedger(mobile),
      source: "local_fallback",
    };
  }

  const result = await fetchBackendWalletLedger();
  if (result.ok) {
    return {
      ledger: result.ledger,
      source: "backend",
      requestId: result.requestId,
    };
  }

  return {
    ledger: getWalletLedger(mobile),
    source: "local_fallback",
    requestId: result.requestId,
    error: {
      status: result.status,
      code: result.code,
      message: result.message,
    },
  };
}

function normalizeWalletResult(
  result: TplApiResult<unknown>
): BackendWalletResult {
  if (!result.ok) {
    return {
      ok: false,
      wallet: emptyWallet,
      requestId: result.requestId,
      status: result.status,
      code: result.error.code,
      message: result.error.message,
    };
  }

  return {
    ok: true,
    wallet: normalizeWallet(result.data),
    requestId: result.requestId,
  };
}

function normalizeLedgerResult(
  result: TplApiResult<unknown>
): BackendWalletLedgerResult {
  if (!result.ok) {
    return {
      ok: false,
      ledger: [],
      requestId: result.requestId,
      status: result.status,
      code: result.error.code,
      message: result.error.message,
    };
  }

  return {
    ok: true,
    ledger: normalizeWalletLedger(result.data),
    requestId: result.requestId,
  };
}

export function normalizeWallet(value: unknown): BackendWalletShape {
  const input =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  return {
    promoCredit: safeAmount(input.promoCredit),
    earnedCredit: safeAmount(input.earnedCredit),
    refundableBalance: safeAmount(input.refundableBalance),
  };
}

export function normalizeWalletLedger(value: unknown): WalletLedgerItem[] {
  const items = Array.isArray(value) ? value : [];
  return items.map(normalizeWalletLedgerItem).filter(Boolean) as WalletLedgerItem[];
}

function normalizeWalletLedgerItem(value: unknown): WalletLedgerItem | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const input = value as Record<string, unknown>;
  const id = stringValue(input.id) || `wallet_${stringValue(input.createdAt) || Date.now()}`;
  const type = normalizeLedgerType(input.type);
  const amount = signedLedgerAmount(input);

  return {
    id,
    type,
    title: stringValue(input.title) || titleForLedgerType(type),
    description: stringValue(input.description),
    amount,
    createdAt: stringValue(input.createdAt) || new Date().toISOString(),
    ...(stringValue(input.bookingId) ? { bookingId: stringValue(input.bookingId) } : {}),
  };
}

function safeAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value) && value > 0) {
    return roundMoney(value);
  }

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed) && parsed > 0) return roundMoney(parsed);
  }

  return 0;
}

function signedLedgerAmount(input: Record<string, unknown>): number {
  const amount = safeSignedAmount(input.amount);
  if (amount !== 0) return amount;

  return roundMoney(
    safeSignedAmount(input.promoDelta) +
      safeSignedAmount(input.earnedDelta) +
      safeSignedAmount(input.refundableDelta)
  );
}

function safeSignedAmount(value: unknown): number {
  if (typeof value === "number" && Number.isFinite(value)) return roundMoney(value);

  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return roundMoney(parsed);
  }

  return 0;
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function normalizeLedgerType(value: unknown): WalletLedgerItem["type"] {
  return typeof value === "string" && backendLedgerTypes.has(value as WalletLedgerItem["type"])
    ? (value as WalletLedgerItem["type"])
    : "adjustment";
}

function titleForLedgerType(type: WalletLedgerItem["type"]): string {
  switch (type) {
    case "promo_added":
      return "Promo Credit Added";
    case "earned_added":
      return "Earned Credit Added";
    case "refund_credit":
      return "Refund Wallet Credit";
    case "wallet_used":
      return "Wallet Used";
    case "wallet_reversal":
      return "Wallet Reversal";
    case "expiry":
      return "Wallet Expiry";
    default:
      return "Wallet Adjustment";
  }
}
