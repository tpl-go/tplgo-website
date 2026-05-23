"use client";

export type Wallet = {
  promoCredit: number;
  earnedCredit: number;
  refundableBalance: number;
};

export type WalletLedgerItem = {
  id: string;
  type: "promo_added" | "earned_added" | "refund_credit" | "wallet_used";
  title: string;
  description: string;
  amount: number;
  createdAt: string;
  bookingId?: string;
};

const WALLET_STORAGE_KEY = "tpl_wallet_v1";
const WALLET_LEDGER_STORAGE_KEY = "tpl_wallet_ledger_v1";
export const WALLET_UPDATED_EVENT = "tpl_wallet_updated_event";

const defaultWallet: Wallet = {
  promoCredit: 0,
  earnedCredit: 0,
  refundableBalance: 0,
};

function getSafeMobileKey(mobile?: string) {
  return String(mobile || "guest")
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w\-+]/g, "");
}

function getWalletStorageKey(mobile?: string) {
  return `${WALLET_STORAGE_KEY}_${getSafeMobileKey(mobile)}`;
}

function getWalletLedgerStorageKey(mobile?: string) {
  return `${WALLET_LEDGER_STORAGE_KEY}_${getSafeMobileKey(mobile)}`;
}

function dispatchWalletUpdate() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new Event(WALLET_UPDATED_EVENT));
}

function normalizeWallet(value: any): Wallet {
  return {
    promoCredit: Number(value?.promoCredit || 0),
    earnedCredit: Number(value?.earnedCredit || 0),
    refundableBalance: Number(value?.refundableBalance || 0),
  };
}

function isWalletEmpty(wallet: Wallet) {
  return (
    Number(wallet.promoCredit || 0) === 0 &&
    Number(wallet.earnedCredit || 0) === 0 &&
    Number(wallet.refundableBalance || 0) === 0
  );
}

function readWalletByKey(key: string): Wallet | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return normalizeWallet(parsed);
  } catch {
    return null;
  }
}

function readLedgerByKey(key: string): WalletLedgerItem[] | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WalletLedgerItem[]) : [];
  } catch {
    return null;
  }
}

function migrateOldGlobalWalletIfNeeded(mobile?: string) {
  if (typeof window === "undefined") return;
  if (!mobile) return;

  const mobileWalletKey = getWalletStorageKey(mobile);
  const existingMobileWallet = readWalletByKey(mobileWalletKey);

  if (existingMobileWallet && !isWalletEmpty(existingMobileWallet)) return;

  const oldGlobalWallet = readWalletByKey(WALLET_STORAGE_KEY);
  if (!oldGlobalWallet || isWalletEmpty(oldGlobalWallet)) return;

  localStorage.setItem(mobileWalletKey, JSON.stringify(oldGlobalWallet));

  const mobileLedgerKey = getWalletLedgerStorageKey(mobile);
  const existingMobileLedger = readLedgerByKey(mobileLedgerKey);

  if (existingMobileLedger && existingMobileLedger.length > 0) return;

  const oldGlobalLedger = readLedgerByKey(WALLET_LEDGER_STORAGE_KEY);
  if (oldGlobalLedger && oldGlobalLedger.length > 0) {
    localStorage.setItem(mobileLedgerKey, JSON.stringify(oldGlobalLedger));
  }
}

export function getWallet(mobile?: string): Wallet {
  if (typeof window === "undefined") return defaultWallet;

  try {
    migrateOldGlobalWalletIfNeeded(mobile);

    const raw = localStorage.getItem(getWalletStorageKey(mobile));
    if (!raw) return defaultWallet;

    const parsed = JSON.parse(raw);
    return normalizeWallet(parsed);
  } catch {
    return defaultWallet;
  }
}

export function saveWallet(wallet: Wallet, mobile?: string) {
  if (typeof window === "undefined") return;

  const safeWallet = normalizeWallet(wallet);

  localStorage.setItem(getWalletStorageKey(mobile), JSON.stringify(safeWallet));
  dispatchWalletUpdate();
}

export function getWalletLedger(mobile?: string): WalletLedgerItem[] {
  if (typeof window === "undefined") return [];

  try {
    migrateOldGlobalWalletIfNeeded(mobile);

    const raw = localStorage.getItem(getWalletLedgerStorageKey(mobile));
    if (!raw) return [];

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as WalletLedgerItem[]) : [];
  } catch {
    return [];
  }
}

export function saveWalletLedger(items: WalletLedgerItem[], mobile?: string) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    getWalletLedgerStorageKey(mobile),
    JSON.stringify(Array.isArray(items) ? items : [])
  );

  dispatchWalletUpdate();
}

export function addWalletLedgerItem(
  item: Omit<WalletLedgerItem, "id" | "createdAt">,
  mobile?: string
) {
  const existing = getWalletLedger(mobile);

  const nextItem: WalletLedgerItem = {
    ...item,
    id: `WALLET-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    createdAt: new Date().toISOString(),
  };

  saveWalletLedger([nextItem, ...existing], mobile);
  return nextItem;
}

export function clearWalletLedger(mobile?: string) {
  saveWalletLedger([], mobile);
}

export function resetWalletForTesting(mobile?: string) {
  saveWallet(
    {
      promoCredit: 2500,
      earnedCredit: 2500,
      refundableBalance: 2500,
    },
    mobile
  );

  saveWalletLedger([], mobile);
}

export function seedWalletForTesting(mobile?: string) {
  const wallet = getWallet(mobile);
  const ledger = getWalletLedger(mobile);

  if (isWalletEmpty(wallet)) {
    saveWallet(
      {
        promoCredit: 2500,
        earnedCredit: 2500,
        refundableBalance: 2500,
      },
      mobile
    );
  }

  if (ledger.length === 0) {
    saveWalletLedger([], mobile);
  }
}

export function formatWalletPrice(amount: number) {
  return `₹${Number(amount || 0).toLocaleString("en-IN")}`;
}