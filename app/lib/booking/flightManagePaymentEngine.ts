import { getBookingPayload } from "@/app/lib/booking/bookingActionHelpers";
import { getAllBookings } from "@/app/lib/booking/bookingStorage";
import {
  saveFlightSeatChanges,
  saveFlightMealChanges,
  saveFlightBaggageChanges,
} from "@/app/lib/booking/flightManageUpdate";

type ManageSection = "seats" | "meals" | "baggage";

type WalletState = {
  promoCredit: number;
  earnedCredit: number;
  refundableBalance: number;
};

type WalletUsageInput = {
  quotePayable: number;
  usePromo: boolean;
  useEarned: boolean;
  useRefundWallet: boolean;
  wallet: WalletState;
};

type WalletUsageResult = {
  promoUsed: number;
  earnedUsed: number;
  refundWalletUsed: number;
  totalWalletUsed: number;
  finalPayable: number;
  promoCap: number;
  earnedCap: number;
  combinedTplCap: number;
};

type SeatSelection = {
  travellerId: string;
  oldSeatCode?: string | null;
  newSeatCode?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

type MealSelection = {
  travellerId: string;
  oldMealId?: string | null;
  newMealId?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

type BaggageSelection = {
  travellerId: string;
  oldBaggageCode?: string | null;
  newBaggageCode?: string | null;
  oldPrice: number;
  newPrice: number;
  skipped?: boolean;
};

type FinalizeManagePaymentParams = {
  bookingId: string;
  payloadStorageKey: string;
  section: ManageSection;
  paymentMethod: string;
  walletUsage: WalletUsageResult;
  seats?: SeatSelection[];
  meals?: MealSelection[];
  baggage?: BaggageSelection[];
  mealCatalog?: Array<{ id: string; name: string; price: number }>;
};

const WALLET_STORAGE_KEY = "tpl_wallet_state";
const WALLET_LEDGER_STORAGE_KEY = "tpl_wallet_ledger";

function round2(value: number) {
  return Number(value.toFixed(2));
}

export function getWalletState(): WalletState {
  if (typeof window === "undefined") {
    return {
      promoCredit: 2500,
      earnedCredit: 2500,
      refundableBalance: 2500,
    };
  }

  const raw = localStorage.getItem(WALLET_STORAGE_KEY);
  if (!raw) {
    const seeded = {
      promoCredit: 2500,
      earnedCredit: 2500,
      refundableBalance: 2500,
    };
    localStorage.setItem(WALLET_STORAGE_KEY, JSON.stringify(seeded));
    return seeded;
  }

  try {
    const parsed = JSON.parse(raw);
    return {
      promoCredit: Number(parsed?.promoCredit || 0),
      earnedCredit: Number(parsed?.earnedCredit || 0),
      refundableBalance: Number(parsed?.refundableBalance || 0),
    };
  } catch {
    return {
      promoCredit: 2500,
      earnedCredit: 2500,
      refundableBalance: 2500,
    };
  }
}

export function saveWalletState(next: WalletState) {
  localStorage.setItem(
    WALLET_STORAGE_KEY,
    JSON.stringify({
      promoCredit: round2(next.promoCredit),
      earnedCredit: round2(next.earnedCredit),
      refundableBalance: round2(next.refundableBalance),
    })
  );
}

export function addWalletLedgerEntry(entry: {
  type: "promo" | "earned" | "refund_credit" | "wallet_usage";
  amount: number;
  source: string;
  bookingId?: string;
  createdAt?: string;
}) {
  const raw = localStorage.getItem(WALLET_LEDGER_STORAGE_KEY);
  const existing = raw ? JSON.parse(raw) : [];

  const next = [
    {
      id: `WLT-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type: entry.type,
      amount: round2(entry.amount),
      source: entry.source,
      bookingId: entry.bookingId,
      createdAt: entry.createdAt || new Date().toISOString(),
    },
    ...existing,
  ];

  localStorage.setItem(WALLET_LEDGER_STORAGE_KEY, JSON.stringify(next));
}

export function calculateManageWalletUsage(
  input: WalletUsageInput
): WalletUsageResult {
  const { quotePayable, usePromo, useEarned, useRefundWallet, wallet } = input;

  const payable = Math.max(quotePayable, 0);

  const promoCap = round2(payable * 0.05);
  const earnedCap = round2(payable * 0.1);
  const combinedTplCap = round2(payable * 0.12);

  let promoUsed = 0;
  let earnedUsed = 0;
  let refundWalletUsed = 0;

  if (usePromo) {
    promoUsed = Math.min(wallet.promoCredit, promoCap);
  }

  if (useEarned) {
    const maxEarnedAllowedAfterPromo = Math.max(combinedTplCap - promoUsed, 0);
    earnedUsed = Math.min(wallet.earnedCredit, earnedCap, maxEarnedAllowedAfterPromo);
  }

  const remainingAfterTpl = Math.max(payable - promoUsed - earnedUsed, 0);

  if (useRefundWallet) {
    refundWalletUsed = Math.min(wallet.refundableBalance, remainingAfterTpl);
  }

  const totalWalletUsed = round2(promoUsed + earnedUsed + refundWalletUsed);
  const finalPayable = round2(Math.max(payable - totalWalletUsed, 0));

  return {
    promoUsed: round2(promoUsed),
    earnedUsed: round2(earnedUsed),
    refundWalletUsed: round2(refundWalletUsed),
    totalWalletUsed,
    finalPayable,
    promoCap,
    earnedCap,
    combinedTplCap,
  };
}

function updatePayloadPaymentBlock(params: {
  payloadStorageKey: string;
  paymentMethod: string;
  walletUsage: WalletUsageResult;
  section: ManageSection;
}) {
  const payload = getBookingPayload<any>(params.payloadStorageKey);
  if (!payload) throw new Error("Booking payload not found.");

  const previousPaymentData = payload.paymentData || {};

  payload.paymentData = {
    ...previousPaymentData,
    method: params.paymentMethod,
    paidAt: new Date().toISOString(),
    managePaymentContext: {
      section: params.section,
      promoUsed: params.walletUsage.promoUsed,
      earnedUsed: params.walletUsage.earnedUsed,
      refundWalletUsed: params.walletUsage.refundWalletUsed,
      walletTotalUsed: params.walletUsage.totalWalletUsed,
      extraPaid: params.walletUsage.finalPayable,
    },
  };

  localStorage.setItem(params.payloadStorageKey, JSON.stringify(payload));
  return payload;
}

function refreshBookingAmountFromPayload(bookingId: string, payloadStorageKey: string) {
  const payload = getBookingPayload<any>(payloadStorageKey);
  if (!payload) return;

  const reviewData = payload?.reviewData || {};
  const paymentData = payload?.paymentData || {};
  const seatMealData = payload?.seatMealData || {};
  const cabData = payload?.cabData || {};
  const insuranceData = payload?.insuranceData || {};
  const addonsData = payload?.addonsData || {};
  const offerData = payload?.offerData || null;
  const pricing = reviewData?.pricing || {};

  const totalAmount =
    paymentData?.totalPaid ||
    Math.max(
      (pricing.perAdultBaseFare || 0) *
        ((reviewData?.passengers?.adults || 0) +
          (reviewData?.passengers?.children || 0) +
          (reviewData?.passengers?.infants || 0)) +
        (pricing.tax || 0) +
        (pricing.surcharge || 0) +
        (seatMealData?.seatTotal || 0) +
        (seatMealData?.mealTotal || 0) +
        (cabData?.cabPrice || 0) +
        (insuranceData?.insurancePrice || 0) +
        (addonsData?.addonsPrice || 0) -
        (offerData?.discountAmount || 0) -
        (pricing.discount || 0) -
        (pricing.tplCredit || 0),
      0
    );

  const allBookings = getAllBookings();
  const updated = allBookings.map((item) =>
    item.id === bookingId
      ? {
          ...item,
          amount: round2(totalAmount),
        }
      : item
  );

  localStorage.setItem("tpl_bookings", JSON.stringify(updated));
}

export function finalizeManagePayment(params: FinalizeManagePaymentParams) {
  const {
    bookingId,
    payloadStorageKey,
    section,
    paymentMethod,
    walletUsage,
    seats,
    meals,
    baggage,
    mealCatalog,
  } = params;

  const currentWallet = getWalletState();

  const nextWallet: WalletState = {
    promoCredit: Math.max(currentWallet.promoCredit - walletUsage.promoUsed, 0),
    earnedCredit: Math.max(currentWallet.earnedCredit - walletUsage.earnedUsed, 0),
    refundableBalance: Math.max(
      currentWallet.refundableBalance - walletUsage.refundWalletUsed,
      0
    ),
  };

  saveWalletState(nextWallet);

  if (walletUsage.promoUsed > 0) {
    addWalletLedgerEntry({
      type: "wallet_usage",
      amount: walletUsage.promoUsed,
      source: "Manage Payment - Promo Credit Used",
      bookingId,
    });
  }

  if (walletUsage.earnedUsed > 0) {
    addWalletLedgerEntry({
      type: "wallet_usage",
      amount: walletUsage.earnedUsed,
      source: "Manage Payment - Earned Credit Used",
      bookingId,
    });
  }

  if (walletUsage.refundWalletUsed > 0) {
    addWalletLedgerEntry({
      type: "wallet_usage",
      amount: walletUsage.refundWalletUsed,
      source: "Manage Payment - Refund Wallet Used",
      bookingId,
    });
  }

  if (section === "seats") {
    saveFlightSeatChanges({
      bookingId,
      payloadStorageKey,
      seats: seats || [],
    });
  }

  if (section === "meals") {
    saveFlightMealChanges({
      bookingId,
      payloadStorageKey,
      meals: meals || [],
      mealCatalog: mealCatalog || [],
    });
  }

  if (section === "baggage") {
    saveFlightBaggageChanges({
      bookingId,
      payloadStorageKey,
      baggage: baggage || [],
    });
  }

  updatePayloadPaymentBlock({
    payloadStorageKey,
    paymentMethod,
    walletUsage,
    section,
  });

  refreshBookingAmountFromPayload(bookingId, payloadStorageKey);

  return {
    success: true,
    wallet: getWalletState(),
  };
}