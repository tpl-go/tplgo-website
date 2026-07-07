"use client";

import Link from "next/link";
import { ArrowLeft, BadgeIndianRupee, PackageCheck } from "lucide-react";

type ReviewStickyBookingPanelProps = {
  basketItemsCount: number;
  basketValue: string;
  isProcessing: boolean;
  onProceed: () => void;
  readiness: string;
  tripMode: string;
  warningsCount: number;
};

export default function ReviewStickyBookingPanel({
  basketItemsCount,
  basketValue,
  isProcessing,
  onProceed,
  readiness,
  tripMode,
  warningsCount,
}: ReviewStickyBookingPanelProps) {
  return (
    <aside className="sticky top-6 grid gap-4 rounded-[1.75rem] border border-orange-100 bg-white p-5 shadow-[0_18px_54px_rgba(154,52,18,0.08)]">
      <div className="flex items-center gap-2">
        <PackageCheck size={18} className="text-orange-700" />
        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-stone-500">
          Final Booking Panel
        </p>
      </div>
      <div className="grid gap-2">
        {[
          ["Basket Items", basketItemsCount],
          ["Basket Value", basketValue],
          ["Trip Mode", tripMode],
          ["Booking Readiness", readiness],
          ["Warnings", warningsCount],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex items-center justify-between rounded-2xl border border-orange-100 bg-orange-50/70 px-3 py-2"
          >
            <span className="text-xs font-bold text-stone-600">{label}</span>
            <span className="text-sm font-black text-slate-950">{value}</span>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onProceed}
        disabled={isProcessing}
        className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-5 text-sm font-black text-white shadow-[0_18px_38px_rgba(255,123,0,0.30)] transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60"
      >
        <BadgeIndianRupee size={16} />
        {isProcessing ? "Preparing..." : "Proceed To Book"}
      </button>

      <Link
        href="/smart-planner/workspace"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-5 text-sm font-black text-slate-700"
      >
        <ArrowLeft size={15} />
        Back to Workspace
      </Link>
    </aside>
  );
}
