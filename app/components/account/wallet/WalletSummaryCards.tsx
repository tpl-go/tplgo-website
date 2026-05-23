"use client";

import type { Wallet } from "@/app/lib/wallet/walletStorage";
import { formatWalletPrice } from "@/app/lib/wallet/walletStorage";

type WalletSummaryCardsProps = {
  wallet: Wallet;
};

export default function WalletSummaryCards({
  wallet,
}: WalletSummaryCardsProps) {
  const tplCredit = wallet.promoCredit + wallet.earnedCredit;
  const totalWalletValue = tplCredit + wallet.refundableBalance;

  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
      <div className="rounded-[24px] border border-[#d9e2ec] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-sm">
        <div className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
          TPL Credit
        </div>
        <div className="mt-2 text-[30px] font-black leading-none text-slate-900">
          {formatWalletPrice(tplCredit)}
        </div>
        <p className="mt-3 text-[13px] leading-6 text-slate-600">
          Promo Credit + Earned Credit combined value.
        </p>
      </div>

      <div className="rounded-[24px] border border-[#d9e2ec] bg-[linear-gradient(180deg,#f6fff7_0%,#ffffff_100%)] p-5 shadow-sm">
        <div className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
          Refund Wallet
        </div>
        <div className="mt-2 text-[30px] font-black leading-none text-slate-900">
          {formatWalletPrice(wallet.refundableBalance)}
        </div>
        <p className="mt-3 text-[13px] leading-6 text-slate-600">
          100% usable balance from downgrade settlement and internal adjustments.
        </p>
      </div>

      <div className="rounded-[24px] border border-[#d9e2ec] bg-[linear-gradient(180deg,#fffaf3_0%,#ffffff_100%)] p-5 shadow-sm">
        <div className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
          Total Wallet Value
        </div>
        <div className="mt-2 text-[30px] font-black leading-none text-slate-900">
          {formatWalletPrice(totalWalletValue)}
        </div>
        <p className="mt-3 text-[13px] leading-6 text-slate-600">
          Combined visible value across all wallet buckets.
        </p>
      </div>
    </div>
  );
}