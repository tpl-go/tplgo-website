"use client";

import type { Wallet } from "@/app/lib/wallet/walletStorage";
import { formatWalletPrice } from "@/app/lib/wallet/walletStorage";

type WalletUsageRulesProps = {
  wallet: Wallet;
};

export default function WalletUsageRules({
  wallet,
}: WalletUsageRulesProps) {
  return (
    <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
        <div className="text-[18px] font-black text-slate-900">
          How your wallet works
        </div>

        <div className="mt-4 space-y-4 text-[14px] leading-7 text-slate-600">
          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-bold text-slate-900">TPL Promo Credit</div>
            <div className="mt-1">
              Can be used up to <span className="font-bold text-slate-900">5%</span> of booking value.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-bold text-slate-900">TPL Earned Credit</div>
            <div className="mt-1">
              Can be used up to <span className="font-bold text-slate-900">10%</span> of booking value.
              You earn <span className="font-bold text-slate-900">2%</span> on eligible bookings.
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
            <div className="font-bold text-slate-900">Combined TPL Credit Limit</div>
            <div className="mt-1">
              Promo + Earned together can be used up to{" "}
              <span className="font-bold text-slate-900">12%</span> per booking.
            </div>
          </div>

          <div className="rounded-2xl border border-green-100 bg-green-50 p-4">
            <div className="font-bold text-slate-900">Refund Wallet</div>
            <div className="mt-1">
              Refund Wallet is <span className="font-bold text-slate-900">100% usable</span> on future bookings.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
        <div className="text-[18px] font-black text-slate-900">
          Current wallet breakup
        </div>

        <div className="mt-5 space-y-4">
          <WalletLine label="Promo Credit" value={wallet.promoCredit} />
          <WalletLine label="Earned Credit" value={wallet.earnedCredit} />
          <WalletLine label="Refund Wallet" value={wallet.refundableBalance} />
          <div className="border-t border-dashed border-slate-300 pt-4">
            <WalletLine
              label="TPL Credit Total"
              value={wallet.promoCredit + wallet.earnedCredit}
              strong
            />
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-[#dbeafe] bg-[#eff6ff] p-4 text-[13px] leading-6 text-slate-700">
          On payment page, user ko clear message jayega:
          <div className="mt-2 font-semibold text-slate-900">
            “You used TPL Credit / Refund Wallet and saved {formatWalletPrice(wallet.promoCredit > 0 ? Math.min(wallet.promoCredit, 300) : 0)} on this booking.”
          </div>
        </div>
      </div>
    </div>
  );
}

function WalletLine({
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