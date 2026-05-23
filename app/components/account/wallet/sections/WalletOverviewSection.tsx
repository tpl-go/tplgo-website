"use client";

import WalletSummaryCards from "@/app/components/account/wallet/WalletSummaryCards";
import type { Wallet, WalletLedgerItem } from "@/app/lib/wallet/walletStorage";
import { formatWalletPrice } from "@/app/lib/wallet/walletStorage";

type WalletOverviewSectionProps = {
  wallet: Wallet;
  items: WalletLedgerItem[];
};

export default function WalletOverviewSection({
  wallet,
  items,
}: WalletOverviewSectionProps) {
  const tplCredit = wallet.promoCredit + wallet.earnedCredit;
  const recentItems = items.slice(0, 4);

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Wallet Overview
        </h1>
      </div>

      <div className="space-y-6 px-6 py-6">
        <WalletSummaryCards wallet={wallet} />

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <div className="text-[18px] font-black text-slate-900">
              Credit Summary
            </div>

            <div className="mt-5 space-y-4">
              <Row label="Promo Credit" value={wallet.promoCredit} />
              <Row label="Earned Credit" value={wallet.earnedCredit} />
              <Row label="TPL Credit Total" value={tplCredit} strong />
              <Row label="Refund Wallet" value={wallet.refundableBalance} strong />
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <div className="text-[18px] font-black text-slate-900">
              Booking Benefit Message
            </div>

            <div className="mt-5 rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-4 text-[14px] leading-7 text-slate-700">
              
              <div className="mt-3 text-[15px] font-bold text-slate-900">
                “At payment, you will see exactly how much TPL Credit and Refund Wallet value helped you save on this booking.”
              </div>
            </div>

            <div className="mt-4 rounded-2xl border border-slate-200 bg-slate-50 p-4 text-[13px] leading-6 text-slate-600">
              Your eligible wallet balance will be applied during payment, and your total benefit will be shown before final confirmation.
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-[18px] font-black text-slate-900">
                Recent Wallet Activity
              </h2>
              <p className="mt-1 text-[13px] text-slate-500">
                Latest wallet movements
              </p>
            </div>
          </div>

          <div className="mt-5 space-y-4">
            {recentItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
                No wallet activity found.
              </div>
            ) : (
              recentItems.map((item) => {
                const isNegative = item.amount < 0;

                return (
                  <div
                    key={item.id}
                    className="rounded-2xl border border-slate-200 bg-white px-4 py-4"
                  >
                    <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                      <div className="min-w-0">
                        <div className="text-[15px] font-bold text-slate-900">
                          {item.title}
                        </div>
                        <div className="mt-1 text-[13px] leading-6 text-slate-600">
                          {item.description}
                        </div>
                      </div>

                      <div
                        className={`shrink-0 text-[16px] font-black ${
                          isNegative ? "text-red-600" : "text-green-700"
                        }`}
                      >
                        {isNegative ? "- " : "+ "}
                        {formatWalletPrice(Math.abs(item.amount))}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className={`text-[14px] ${strong ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
        {label}
      </div>
      <div className={`text-[15px] ${strong ? "font-black text-slate-900" : "font-bold text-slate-900"}`}>
        {formatWalletPrice(value)}
      </div>
    </div>
  );
}