"use client";

import Link from "next/link";
import { ArrowLeft, PackageCheck } from "lucide-react";

import type { ReviewProceedController } from "./useReviewProceedToBook";

type ReviewStickyBottomBarProps = {
  proceed: ReviewProceedController;
};

export default function ReviewStickyBottomBar({
  proceed,
}: ReviewStickyBottomBarProps) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 hidden w-full max-w-full overflow-hidden border-t border-orange-100 bg-white/92 px-4 py-3 shadow-[0_-18px_48px_rgba(15,23,42,0.12)] backdrop-blur-xl lg:block lg:px-6 xl:px-8">
      <div className="mx-auto flex w-full max-w-7xl min-w-0 items-center justify-between gap-5">
        <div className="flex min-w-0 items-center gap-3">
          <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-orange-100 bg-orange-50 text-orange-700">
            <PackageCheck size={22} />
          </span>
          <div className="min-w-0">
            <p className="text-sm font-black text-slate-950">
              Smart Planner booking handoff
            </p>
            <p className="mt-1 truncate text-xs font-bold text-slate-500">
              Only selected basket items continue to booking.
            </p>
          </div>
        </div>

        <div className="grid min-w-0 flex-1 grid-cols-5 gap-2">
          {[
            ["Basket Items", proceed.basketItemsCount],
            ["Basket Value", proceed.basketValue],
            ["Readiness", proceed.readiness],
            ["Warnings", proceed.warningsCount],
            [
              "Trip Mode",
              proceed.mode === "FULL_TRIP_BOOKING"
                ? "Full Trip"
                : "Partial Trip",
            ],
          ].map(([label, value]) => (
            <div
              key={label}
              className="min-w-0 rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2"
            >
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-slate-400">
                {label}
              </p>
              <p className="mt-1 truncate text-sm font-black text-slate-950">
                {value}
              </p>
            </div>
          ))}
        </div>

        <div className="flex min-w-0 shrink-0 items-center gap-2">
          <Link
            href="/smart-planner/workspace"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-full border border-slate-200 bg-white px-4 text-xs font-black text-slate-700"
          >
            <ArrowLeft size={14} />
            Workspace
          </Link>
          <button
            type="button"
            onClick={proceed.onProceed}
            disabled={proceed.isProcessing}
            className="inline-flex min-h-11 items-center justify-center rounded-full bg-gradient-to-r from-[#ff7b00] via-[#ff9500] to-[#ffb300] px-6 text-sm font-black text-white shadow-[0_14px_30px_rgba(255,123,0,0.28)] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {proceed.isProcessing ? "Preparing..." : "Proceed To Book"}
          </button>
        </div>
      </div>
    </div>
  );
}
