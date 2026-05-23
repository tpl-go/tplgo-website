import { getWallet } from "@/app/lib/wallet/walletStorage";
import { applyWallet } from "@/app/lib/manage/payment/managePaymentEngine";

export type WalletResolution = {
  isLoggedIn: boolean;
  wallet: {
    promoCredit: number;
    earnedCredit: number;
    refundableBalance: number;
  } | null;
  calculation: {
    promoUsed: number;
    earnedUsed: number;
    refundUsed: number;
    refundCredit: number;
    finalPayable: number;
    settlementMode: "payment" | "save" | "wallet_credit";
  };
};

export function resolveWalletForUser({
  totalAmount,
  mobile,
}: {
  totalAmount: number;
  mobile?: string;
}): WalletResolution {
  // 🔴 Guest User
  if (!mobile) {
    return {
      isLoggedIn: false,
      wallet: null,
      calculation: applyWallet({
        totalAmount,
        tplPromo: 0,
        tplEarned: 0,
        refundWallet: 0,
      }),
    };
  }

  // 🟢 Logged In User
  const wallet = getWallet(mobile);

  const calculation = applyWallet({
    totalAmount,
    tplPromo: wallet.promoCredit,
    tplEarned: wallet.earnedCredit,
    refundWallet: wallet.refundableBalance,
  });

  return {
    isLoggedIn: true,
    wallet,
    calculation,
  };
}