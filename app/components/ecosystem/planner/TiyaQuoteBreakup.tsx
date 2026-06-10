"use client";

import { ReceiptIndianRupee } from "lucide-react";
import type { TiyaQuoteBreakup as TiyaQuoteBreakupData } from "@/app/lib/ecosystem/planner/plannerQuoteEngine";

type TiyaQuoteBreakupProps = {
  breakup: TiyaQuoteBreakupData;
};

function QuoteLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
      <span className="text-xs font-bold text-white/65">{label}</span>
      <span className="text-sm font-black text-white">
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

export default function TiyaQuoteBreakup({ breakup }: TiyaQuoteBreakupProps) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-cyan-100">
        <ReceiptIndianRupee size={15} />
        Fare breakup
      </div>
      <div className="mt-4 grid gap-2">
        <QuoteLine label="Base trip cost" value={breakup.baseTripCost} />
        <QuoteLine label="Transport estimate" value={breakup.transportEstimate} />
        <QuoteLine label="Stay estimate" value={breakup.stayEstimate} />
        <QuoteLine label="Activity estimate" value={breakup.activityEstimate} />
        <QuoteLine label="Local transfer estimate" value={breakup.localTransferEstimate} />
        <QuoteLine label="Insurance estimate" value={breakup.insuranceEstimate} />
        <QuoteLine label="Creator experience estimate" value={breakup.creatorExperienceEstimate} />
        <QuoteLine label="Local market add-ons" value={breakup.localMarketAddOns} />
        <QuoteLine label="Taxes/fees estimate" value={breakup.taxesFeesEstimate} />
      </div>
      <div className="mt-4 rounded-3xl bg-orange-500 p-4 text-white shadow-[0_14px_36px_rgba(249,115,22,0.24)]">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
          Total quote estimate
        </p>
        <p className="mt-1 text-3xl font-black">
          ₹{breakup.totalQuoteEstimate.toLocaleString("en-IN")}
        </p>
      </div>
    </div>
  );
}
