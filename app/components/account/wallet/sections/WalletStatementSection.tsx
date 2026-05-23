"use client";

import { useMemo, useState } from "react";
import type { Wallet, WalletLedgerItem } from "@/app/lib/wallet/walletStorage";
import { formatWalletPrice } from "@/app/lib/wallet/walletStorage";

type WalletStatementSectionProps = {
  wallet: Wallet;
  items: WalletLedgerItem[];
};

export default function WalletStatementSection({
  wallet,
  items,
}: WalletStatementSectionProps) {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const itemDate = new Date(item.createdAt).getTime();
      const from = fromDate ? new Date(fromDate).getTime() : null;
      const to = toDate ? new Date(toDate).getTime() : null;

      if (from && itemDate < from) return false;
      if (to) {
        const endOfDay = new Date(toDate);
        endOfDay.setHours(23, 59, 59, 999);
        if (itemDate > endOfDay.getTime()) return false;
      }

      return true;
    });
  }, [items, fromDate, toDate]);

  const summary = useMemo(() => {
    let credits = 0;
    let debits = 0;

    filteredItems.forEach((item) => {
      if (item.amount >= 0) credits += item.amount;
      else debits += Math.abs(item.amount);
    });

    return {
      credits,
      debits,
    };
  }, [filteredItems]);

  const handlePrintStatement = () => {
    window.print();
  };

  return (
    <div className="bg-white">
      <div className="border-b border-gray-200 px-6 py-5">
        <h1 className="text-[18px] font-semibold text-slate-900">
          Generate Statement
        </h1>
      </div>

      <div className="space-y-6 px-6 py-6">
        <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-[1fr_1fr_auto]">
            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                From Date
              </label>
              <input
                type="date"
                value={fromDate}
                onChange={(e) => setFromDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-[14px] font-semibold text-slate-900 outline-none transition focus:border-[#0b5fff]"
              />
            </div>

            <div>
              <label className="mb-2 block text-[11px] font-bold uppercase tracking-[0.06em] text-slate-500">
                To Date
              </label>
              <input
                type="date"
                value={toDate}
                onChange={(e) => setToDate(e.target.value)}
                className="h-11 w-full rounded-xl border border-gray-300 bg-white px-4 text-[14px] font-semibold text-slate-900 outline-none transition focus:border-[#0b5fff]"
              />
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={handlePrintStatement}
                className="h-11 rounded-xl bg-[#0b5fff] px-5 text-[12px] font-bold text-white transition hover:bg-[#094ee0]"
              >
                Generate PDF Statement
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-4">
          <MiniCard label="Promo Credit" value={wallet.promoCredit} />
          <MiniCard label="Earned Credit" value={wallet.earnedCredit} />
          <MiniCard label="Refund Wallet" value={wallet.refundableBalance} />
          <MiniCard
            label="Filtered Txns"
            value={filteredItems.length}
            plain
          />
        </div>

        <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
          <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <h2 className="text-[17px] font-black text-slate-900">
              Statement Summary
            </h2>

            <div className="mt-5 space-y-4">
              <SummaryRow label="Total Credits" value={summary.credits} positive />
              <SummaryRow label="Total Debits" value={summary.debits} negative />
              <SummaryRow
                label="Current Wallet Snapshot"
                value={
                  wallet.promoCredit + wallet.earnedCredit + wallet.refundableBalance
                }
                strong
              />
            </div>
          </div>

          <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
            <h2 className="text-[17px] font-black text-slate-900">
              Statement Notes
            </h2>

            <div className="mt-4 space-y-3 text-[14px] leading-6 text-slate-700">
              <p>• Wallet transactions will be filtered based on the selected date range</p>
              <p>• Statement can be generated using browser print / Save as PDF</p>
              <p>• Branded downloadable PDF will be integrated in a future backend phase</p>
            </div>
          </div>
        </div>

        <div className="rounded-[24px] border border-[#d9e2ec] bg-white p-5 shadow-sm">
          <h2 className="text-[18px] font-black text-slate-900">
            Statement Transactions
          </h2>

          <div className="mt-5 space-y-4">
            {filteredItems.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-8 text-[13px] text-slate-600">
                No transactions found for selected date range.
              </div>
            ) : (
              filteredItems.map((item) => {
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

function MiniCard({
  label,
  value,
  plain = false,
}: {
  label: string;
  value: number;
  plain?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-[#d9e2ec] bg-white p-4 shadow-sm">
      <div className="text-[11px] font-black uppercase tracking-[0.08em] text-slate-500">
        {label}
      </div>
      <div className="mt-2 text-[24px] font-black text-slate-900">
        {plain ? value : formatWalletPrice(value)}
      </div>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  positive = false,
  negative = false,
  strong = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
  negative?: boolean;
  strong?: boolean;
}) {
  const color = strong
    ? "text-slate-900"
    : positive
    ? "text-green-700"
    : negative
    ? "text-red-600"
    : "text-slate-900";

  return (
    <div className="flex items-center justify-between gap-4">
      <div className={`text-[14px] ${strong ? "font-bold text-slate-900" : "font-medium text-slate-600"}`}>
        {label}
      </div>
      <div className={`text-[15px] font-black ${color}`}>
        {formatWalletPrice(value)}
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