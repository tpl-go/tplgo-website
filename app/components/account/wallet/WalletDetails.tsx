"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/app/hooks/useAuth";
import { AUTH_UPDATED_EVENT } from "@/app/lib/booking/guestAuth";
import type { WalletSectionKey } from "@/app/account/wallet/page";
import WalletOverviewSection from "@/app/components/account/wallet/sections/WalletOverviewSection";
import TplCreditSection from "@/app/components/account/wallet/sections/TplCreditSection";
import RefundWalletSection from "@/app/components/account/wallet/sections/RefundWalletSection";
import WalletActivitySection from "@/app/components/account/wallet/sections/WalletActivitySection";
import WalletStatementSection from "@/app/components/account/wallet/sections/WalletStatementSection";
import {
  type Wallet,
  type WalletLedgerItem,
  WALLET_UPDATED_EVENT,
} from "@/app/lib/wallet/walletStorage";
import {
  getBackendFirstWallet,
  getBackendFirstWalletLedger,
} from "@/app/lib/api/walletApi";

type WalletDetailsProps = {
  activeSection: WalletSectionKey;
};

export default function WalletDetails({
  activeSection,
}: WalletDetailsProps) {
  const { authError, isAuthLoading, isAuthenticated, openLoginModal, user } = useAuth();

  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });
  const [ledger, setLedger] = useState<WalletLedgerItem[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadWalletData = async () => {
      if (isAuthLoading) return;

      if (!isAuthenticated || !user?.id) {
        setWallet({
          promoCredit: 0,
          earnedCredit: 0,
          refundableBalance: 0,
        });
        setLedger([]);
        setStatus("idle");
        setErrorMessage(null);
        return;
      }

      setStatus("loading");
      setErrorMessage(null);
      const [walletResult, ledgerResult] = await Promise.all([
        getBackendFirstWallet(undefined, { allowLocalFallback: false }),
        getBackendFirstWalletLedger(undefined, { allowLocalFallback: false }),
      ]);

      if (cancelled) return;
      setWallet(walletResult.wallet);
      setLedger(ledgerResult.ledger);
      if (walletResult.source === "backend" && ledgerResult.source === "backend") {
        setStatus("idle");
      } else {
        setStatus("error");
        setErrorMessage(walletResult.error?.message || ledgerResult.error?.message || "We could not load your wallet. Please retry.");
      }
    };

    void loadWalletData();
    window.addEventListener(WALLET_UPDATED_EVENT, loadWalletData);
    window.addEventListener(AUTH_UPDATED_EVENT, loadWalletData);
    window.addEventListener("storage", loadWalletData);

    return () => {
      cancelled = true;
      window.removeEventListener(WALLET_UPDATED_EVENT, loadWalletData);
      window.removeEventListener(AUTH_UPDATED_EVENT, loadWalletData);
      window.removeEventListener("storage", loadWalletData);
    };
  }, [authError, isAuthLoading, isAuthenticated, user?.id]);

  const accountNotice = renderWalletNotice({
    authError,
    errorMessage,
    isAuthLoading,
    isAuthenticated,
    onSignIn: () => openLoginModal({ redirectAfterLogin: "/account/wallet" }),
    status,
  });

  if (activeSection === "tplCredit") {
    return <>{accountNotice}<TplCreditSection wallet={wallet} /></>;
  }

  if (activeSection === "refundWallet") {
    return <>{accountNotice}<RefundWalletSection wallet={wallet} /></>;
  }

  if (activeSection === "activity") {
    return <>{accountNotice}<WalletActivitySection items={ledger} /></>;
  }

  if (activeSection === "statement") {
    return <>{accountNotice}<WalletStatementSection wallet={wallet} items={ledger} /></>;
  }

  return <>{accountNotice}<WalletOverviewSection wallet={wallet} items={ledger} /></>;
}

function renderWalletNotice({
  authError,
  errorMessage,
  isAuthLoading,
  isAuthenticated,
  onSignIn,
  status,
}: {
  authError?: string | null;
  errorMessage: string | null;
  isAuthLoading: boolean;
  isAuthenticated: boolean;
  onSignIn: () => void;
  status: "idle" | "loading" | "error";
}) {
  if (isAuthLoading || status === "loading") {
    return (
      <div className="mb-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-[13px] font-medium text-blue-800">
        Loading your wallet…
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="mb-4 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-[13px] text-amber-900">
        {authError || "Sign in to view your wallet."}{" "}
        <button type="button" onClick={onSignIn} className="font-semibold underline">
          Sign in
        </button>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="mb-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-[13px] text-red-800">
        {errorMessage}
      </div>
    );
  }

  return null;
}
