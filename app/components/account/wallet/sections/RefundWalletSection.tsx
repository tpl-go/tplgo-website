"use client";

import type { Wallet } from "@/app/lib/wallet/walletStorage";
import { formatWalletPrice } from "@/app/lib/wallet/walletStorage";

type RefundWalletSectionProps = {
  wallet: Wallet;
};

export default function RefundWalletSection({
  wallet,
}: RefundWalletSectionProps) {
  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Refund Wallet
        </h1>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="rounded-[24px] border border-[#d9e2ec] bg-[linear-gradient(180deg,#f6fff7_0%,#ffffff_100%)] p-5 shadow-sm">
          <div className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
            Refund Wallet Balance
          </div>
          <div className="mt-2 text-[32px] font-black leading-none text-slate-900">
            {formatWalletPrice(wallet.refundableBalance)}
          </div>
          <p className="mt-3 text-[13px] leading-6 text-slate-600">
            Balance received from downgrade adjustments and internal refund settlements. This wallet is 100% usable.
          </p>
        </div>

        <div className="rounded-[24px] border border-slate-200 bg-slate-50 p-5">
          <h2 className="text-[16px] font-black text-slate-900">
            Refund Wallet Rules
          </h2>

          <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
            <p>• Downgrade settlement will be credited directly to the Refund Wallet</p>
            <p>• Cancellation refunds will be processed to the original payment method</p>
            <p>• Refund Wallet balance is 100% usable for future bookings</p>
            <p>• Wallet benefits will be clearly shown on the payment page</p>
          </div>
        </div>
      </div>
    </div>
  );
}