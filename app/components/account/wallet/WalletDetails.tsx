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
  const { user } = useAuth();

  const [wallet, setWallet] = useState<Wallet>({
    promoCredit: 0,
    earnedCredit: 0,
    refundableBalance: 0,
  });
  const [ledger, setLedger] = useState<WalletLedgerItem[]>([]);

  useEffect(() => {
    let cancelled = false;

    const loadWalletData = async () => {
      let activeMobile = user?.mobile || "";

      try {
        const raw = localStorage.getItem("tpl_auth_session_v1");
        const parsed = raw ? JSON.parse(raw) : null;
        activeMobile = parsed?.user?.mobile || activeMobile;
      } catch {}

      if (!activeMobile) {
        setWallet({
          promoCredit: 0,
          earnedCredit: 0,
          refundableBalance: 0,
        });
        setLedger([]);
        return;
      }

      const [walletResult, ledgerResult] = await Promise.all([
        getBackendFirstWallet(activeMobile),
        getBackendFirstWalletLedger(activeMobile),
      ]);

      if (cancelled) return;
      setWallet(walletResult.wallet);
      setLedger(ledgerResult.ledger);
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
  }, [user?.mobile]);

  if (activeSection === "tplCredit") {
    return <TplCreditSection wallet={wallet} />;
  }

  if (activeSection === "refundWallet") {
    return <RefundWalletSection wallet={wallet} />;
  }

  if (activeSection === "activity") {
    return <WalletActivitySection items={ledger} />;
  }

  if (activeSection === "statement") {
    return <WalletStatementSection wallet={wallet} items={ledger} />;
  }

  return <WalletOverviewSection wallet={wallet} items={ledger} />;
}
