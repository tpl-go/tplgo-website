import { backendFeatureFlags, isBackendCheckoutEnabled } from "./backendFeatureFlags";
import { fetchBackendWallet, type BackendWalletShape } from "./walletApi";

type WalletSyncStatus = "synced" | "unavailable" | "fallback_local";

type GuardedPayloadResult<TPayload extends Record<string, unknown>> = {
  payload: TPayload;
  wallet: BackendWalletShape | null;
  status: WalletSyncStatus;
};

const walletObjectKeys = [
  "walletBreakdown",
  "walletUse",
  "walletUsage",
  "wallet",
] as const;

const nestedWalletPaths = [
  ["fare", "walletBreakdown"],
  ["pricingSnapshot", "walletBreakdown"],
] as const;

export async function prepareBackendCheckoutWalletPayload<
  TPayload extends Record<string, unknown>,
>(
  serviceType: string,
  rawPayload: TPayload
): Promise<GuardedPayloadResult<TPayload>> {
  if (!isBackendCheckoutEnabled(serviceType)) {
    return { payload: rawPayload, wallet: null, status: "fallback_local" };
  }

  const walletResult = await fetchBackendWallet(readMobile(rawPayload));

  if (!walletResult.ok) {
    if (backendFeatureFlags.fallbackToLocalFlow) {
      return {
        payload: addWalletSyncMetadata(rawPayload, "unavailable"),
        wallet: null,
        status: "unavailable",
      };
    }

    return {
      payload: addWalletSyncMetadata(rawPayload, "unavailable"),
      wallet: null,
      status: "unavailable",
    };
  }

  const cloned = clonePayload(rawPayload);
  clampWalletFields(cloned, walletResult.wallet);

  return {
    payload: addWalletSyncMetadata(cloned, "synced", walletResult.wallet),
    wallet: walletResult.wallet,
    status: "synced",
  };
}

function clampWalletFields(
  payload: Record<string, unknown>,
  backendWallet: BackendWalletShape
) {
  let applied = false;

  for (const key of walletObjectKeys) {
    const current = payload[key];
    if (isRecord(current)) {
      payload[key] = clampWalletRecord(current, backendWallet);
      applied = true;
    }
  }

  for (const [parentKey, childKey] of nestedWalletPaths) {
    const parent = payload[parentKey];
    if (isRecord(parent) && isRecord(parent[childKey])) {
      parent[childKey] = clampWalletRecord(parent[childKey], backendWallet);
      applied = true;
    }
  }

  if (!applied) {
    payload.walletUse = {
      promoCredit: 0,
      earnedCredit: 0,
      refundableBalance: 0,
      promoUsed: 0,
      earnedUsed: 0,
      refundUsed: 0,
      totalWalletUsed: 0,
    };
  }
}

function clampWalletRecord(
  value: Record<string, unknown>,
  backendWallet: BackendWalletShape
): Record<string, unknown> {
  const promoRequested = readWalletAmount(value, [
    "promoUsed",
    "promoCredit",
    "promo",
  ]);
  const earnedRequested = readWalletAmount(value, [
    "earnedUsed",
    "earnedCredit",
    "earned",
  ]);
  const refundRequested = readWalletAmount(value, [
    "refundUsed",
    "refundableBalance",
    "refundWallet",
    "refundWalletBalance",
  ]);

  const promoUsed = roundMoney(Math.min(promoRequested, backendWallet.promoCredit));
  const earnedUsed = roundMoney(Math.min(earnedRequested, backendWallet.earnedCredit));
  const refundUsed = roundMoney(
    Math.min(refundRequested, backendWallet.refundableBalance)
  );
  const totalWalletUsed = roundMoney(promoUsed + earnedUsed + refundUsed);

  return {
    ...value,
    promoUsed,
    earnedUsed,
    refundUsed,
    promoCredit: promoUsed,
    earnedCredit: earnedUsed,
    refundableBalance: refundUsed,
    refundWallet: refundUsed,
    totalWalletUsed,
    promoAvailable: backendWallet.promoCredit,
    earnedAvailable: backendWallet.earnedCredit,
    refundWalletAvailable: backendWallet.refundableBalance,
    walletSource: "backend",
  };
}

function addWalletSyncMetadata<TPayload extends Record<string, unknown>>(
  payload: TPayload,
  status: WalletSyncStatus,
  wallet?: BackendWalletShape
): TPayload {
  const syncedAt = new Date().toISOString();
  const existingMetadata = isRecord(payload.metadata) ? payload.metadata : {};

  return {
    ...payload,
    walletSource: status === "synced" ? "backend" : "local_fallback",
    walletSyncedAt: syncedAt,
    walletSyncStatus: status,
    ...(wallet ? { backendWalletSnapshot: wallet } : {}),
    metadata: {
      ...existingMetadata,
      walletSource: status === "synced" ? "backend" : "local_fallback",
      walletSyncedAt: syncedAt,
      walletSyncStatus: status,
    },
  };
}

function readMobile(payload: Record<string, unknown>): string | undefined {
  const candidates = [
    payload.mobile,
    readPath(payload, ["contact", "mobile"]),
    readPath(payload, ["contactDetails", "mobile"]),
    readPath(payload, ["guestValidation", "contactDetails", "mobile"]),
    readPath(payload, ["leadTraveller", "mobile"]),
    readPath(payload, ["traveller", "phone"]),
    readPath(payload, ["traveller", "mobile"]),
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate.trim();
    }
    if (typeof candidate === "number" && Number.isFinite(candidate)) {
      return String(candidate);
    }
  }

  return undefined;
}

function readPath(source: unknown, path: string[]): unknown {
  return path.reduce<unknown>((current, key) => {
    if (!isRecord(current)) return undefined;
    return current[key];
  }, source);
}

function readWalletAmount(
  value: Record<string, unknown>,
  keys: string[]
): number {
  for (const key of keys) {
    const current = value[key];
    if (typeof current === "number" && Number.isFinite(current) && current > 0) {
      return roundMoney(current);
    }
    if (typeof current === "string" && current.trim()) {
      const parsed = Number(current);
      if (Number.isFinite(parsed) && parsed > 0) return roundMoney(parsed);
    }
  }

  return 0;
}

function clonePayload<TPayload extends Record<string, unknown>>(
  payload: TPayload
): TPayload {
  return JSON.parse(JSON.stringify(payload)) as TPayload;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function roundMoney(value: number): number {
  return Math.round(value * 100) / 100;
}
