"use client";

import type { Wallet } from "@/app/lib/wallet/walletStorage";
import { formatWalletPrice } from "@/app/lib/wallet/walletStorage";

type TplCreditSectionProps = {
  wallet: Wallet;
};

export default function TplCreditSection({
  wallet,
}: TplCreditSectionProps) {
  const tplCredit = wallet.promoCredit + wallet.earnedCredit;

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          TPL Credit
        </h1>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="rounded-[24px] border border-[#d9e2ec] bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_100%)] p-5 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
            TPL Credit Total
          </div>
          <div className="mt-2 text-[32px] font-black leading-none text-slate-900">
            {formatWalletPrice(tplCredit)}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <div className="text-[17px] font-black text-slate-900">
              Promo Credit
            </div>
            <div className="mt-2 text-[28px] font-black text-slate-900">
              {formatWalletPrice(wallet.promoCredit)}
            </div>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">
              Company offer based credit. Per booking max 5% use allowed.
            </p>
          </div>

          <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <div className="text-[17px] font-black text-slate-900">
              Earned Credit
            </div>
            <div className="mt-2 text-[28px] font-black text-slate-900">
              {formatWalletPrice(wallet.earnedCredit)}
            </div>
            <p className="mt-3 text-[13px] leading-6 text-slate-600">
              Booking rewards se earned balance. Per booking max 10% use allowed.
            </p>
          </div>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-[16px] font-black text-slate-900">
            Usage Rules
          </h2>

          <div className="mt-4 grid grid-cols-1 gap-3 text-[14px] leading-6 text-slate-700">
            <p>• Promo Credit max 5% per booking</p>
            <p>• Earned Credit max 10% per booking</p>
            <p>• Promo + Earned combined max 12% per booking</p>
            <p>• Earned Credit accrual rate: 2% on eligible bookings</p>
          </div>
        </div>
      </div>
    </div>
  );
}