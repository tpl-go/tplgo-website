import { tplApiRequest, type TplApiResult } from "./tplApiClient";

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

const emptyWallet: BackendWalletShape = {
  promoCredit: 0,
  earnedCredit: 0,
  refundableBalance: 0,
};

export async function fetchBackendWallet(
  mobile?: string
): Promise<BackendWalletResult> {
  const path = mobile?.trim()
    ? `/api/v1/wallet?mobile=${encodeURIComponent(mobile.trim())}`
    : "/api/v1/wallet";

  const result = await tplApiRequest<unknown>(path);
  return normalizeWalletResult(result);
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

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
