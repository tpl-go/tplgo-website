"use client";

import { IndianRupee } from "lucide-react";
import type { TiyaPackagePrice } from "@/app/lib/ecosystem/planner/plannerPackageBuilder";

type TiyaPackagePriceCardProps = {
  price: TiyaPackagePrice;
};

function MoneyLine({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/10 px-3 py-2">
      <span className="text-xs font-bold text-white/65">{label}</span>
      <span className="text-sm font-black text-white">
        ₹{value.toLocaleString("en-IN")}
      </span>
    </div>
  );
}

export default function TiyaPackagePriceCard({
  price,
}: TiyaPackagePriceCardProps) {
  return (
    <aside className="rounded-3xl border border-orange-300/20 bg-orange-400/10 p-3 sm:p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.16em] text-orange-100">
        <IndianRupee size={15} />
        Dynamic pricing simulation
      </div>
      <div className="mt-4 grid gap-2">
        <MoneyLine label="Base package estimate" value={price.basePackageEstimate} />
        <MoneyLine label="Transport estimate" value={price.transportEstimate} />
        <MoneyLine label="Stay estimate" value={price.stayEstimate} />
        <MoneyLine label="Activity estimate" value={price.activityEstimate} />
        <MoneyLine label="Add-ons" value={price.addOnsEstimate} />
        <MoneyLine label="Tax/fees estimate" value={price.taxFeesEstimate} />
      </div>
      <div className="mt-4 rounded-3xl bg-orange-500 p-4 text-white shadow-[0_14px_36px_rgba(249,115,22,0.24)]">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/70">
          Total estimate
        </p>
        <p className="mt-1 text-3xl font-black">
          ₹{price.totalEstimate.toLocaleString("en-IN")}
        </p>
      </div>
    </aside>
  );
}
