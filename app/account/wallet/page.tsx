"use client";

import { useState } from "react";
import WalletSidebar from "@/app/components/account/wallet/WalletSidebar";
import WalletDetails from "@/app/components/account/wallet/WalletDetails";

export type WalletSectionKey =
  | "overview"
  | "tplCredit"
  | "refundWallet"
  | "activity"
  | "statement";

export default function WalletPage() {
  const [activeSection, setActiveSection] =
    useState<WalletSectionKey>("overview");

  return (
    <div className="overflow-hidden rounded-[22px] border border-gray-200 bg-white shadow-[0_10px_35px_rgba(15,23,42,0.06)]">
      <div className="grid grid-cols-1 lg:grid-cols-[280px_minmax(0,1fr)]">
        <WalletSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
        />
        <WalletDetails activeSection={activeSection} />
      </div>
    </div>
  );
}