"use client";

import type { WalletLedgerItem } from "@/app/lib/wallet/walletStorage";
import { formatWalletPrice } from "@/app/lib/wallet/walletStorage";

type WalletLedgerListProps = {
  items: WalletLedgerItem[];
};

export default function WalletLedgerList({
  items,
}: WalletLedgerListProps) {
  return (
    <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-[18px] font-black text-slate-900">
            Wallet Activity
          </h2>
          <p className="mt-1 text-[13px] text-slate-500">
            Promo, earned, refund and usage history
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-4">
        {items.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
            No wallet activity found.
          </div>
        ) : (
          items.map((item) => {
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

                    <div className="mt-2 flex flex-wrap gap-4 text-[12px] text-slate-500">
                      <span>{formatDateTime(item.createdAt)}</span>
                      {item.bookingId ? <span>Booking ID: {item.bookingId}</span> : null}
                      <span className="uppercase">{item.type.replaceAll("_", " ")}</span>
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
  );
}

function formatDateTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}