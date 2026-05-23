"use client";

import WalletLedgerList from "@/app/components/account/wallet/WalletLedgerList";
import type { WalletLedgerItem } from "@/app/lib/wallet/walletStorage";

type WalletActivitySectionProps = {
  items: WalletLedgerItem[];
};

export default function WalletActivitySection({
  items,
}: WalletActivitySectionProps) {
  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Wallet Activity
        </h1>
      </div>

      <div className="px-6 py-6">
        <WalletLedgerList items={items} />
      </div>
    </div>
  );
}