"use client";

import React from "react";
import { ManageQuote } from "@/lib/manage/manageTypes";
import {
  formatCurrency,
  getSettlementDescription,
  getSettlementLabel,
} from "@/app/lib/manage/manageUtils";

interface ManageActionPanelProps {
  quote: ManageQuote;
  currency?: string;
  onContinue?: () => void;
}

export default function ManageActionPanel({
  quote,
  currency = "INR",
  onContinue,
}: ManageActionPanelProps) {
  return (
    <div className="rounded-[24px] border border-black/5 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#ff6b00]">
            Settlement Summary
          </p>
          <h3 className="mt-1 text-lg font-bold text-[#111827]">
            {getSettlementLabel(quote)}
          </h3>
          <p className="mt-2 text-sm text-[#6b7280]">
            {getSettlementDescription(quote)}
          </p>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        <Row label="Seat Difference" value={formatCurrency(quote.seatDiff, currency)} />
        <Row label="Meal Difference" value={formatCurrency(quote.mealDiff, currency)} />
        <Row label="Baggage Difference" value={formatCurrency(quote.baggageDiff, currency)} />
        <Row label="Upgrade Total" value={formatCurrency(quote.upgradeTotal, currency)} />
        <Row label="Downgrade Total" value={formatCurrency(quote.downgradeTotal, currency)} />
        <Row label="Airline / Supplier Charges" value={formatCurrency(quote.airlineCharges, currency)} />
      </div>

      <div className="mt-5 rounded-2xl bg-[#fff7f2] p-4">
        {quote.settlementMode === "payment" && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                Net Payable
              </p>
              <p className="mt-1 text-xl font-bold text-[#111827]">
                {formatCurrency(quote.netPayable, currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={onContinue}
              className="rounded-full bg-[#ff6b00] px-5 py-3 text-sm font-semibold text-white"
            >
              Continue to Payment
            </button>
          </div>
        )}

        {quote.settlementMode === "wallet_credit" && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#6b7280]">
                Refund Wallet Credit
              </p>
              <p className="mt-1 text-xl font-bold text-[#111827]">
                {formatCurrency(quote.walletCredit, currency)}
              </p>
            </div>
            <button
              type="button"
              onClick={onContinue}
              className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
            >
              Save Changes
            </button>
          </div>
        )}

        {quote.settlementMode === "save" && (
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-[#111827]">
                No payment required
              </p>
              <p className="mt-1 text-sm text-[#6b7280]">
                Changes can be saved directly.
              </p>
            </div>
            <button
              type="button"
              onClick={onContinue}
              className="rounded-full bg-[#111827] px-5 py-3 text-sm font-semibold text-white"
            >
              Save Changes
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl bg-[#f8f9fb] px-4 py-3">
      <p className="text-sm text-[#4b5563]">{label}</p>
      <p className="text-sm font-semibold text-[#111827]">{value}</p>
    </div>
  );
}