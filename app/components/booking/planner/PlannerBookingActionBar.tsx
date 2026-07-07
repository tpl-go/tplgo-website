"use client";

import { ArrowRight, Save } from "lucide-react";

import { formatPlannerCurrency } from "./PlannerBookingPageShell";

export default function PlannerBookingActionBar({
  basketItemsCount,
  basketValue,
  canContinue,
  disabledReason,
  onContinue,
  statusMessage,
}: {
  basketItemsCount: number;
  basketValue: number;
  canContinue: boolean;
  disabledReason?: string;
  onContinue: () => void;
  statusMessage: string;
}) {
  return (
    <section className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-sm">
      <div className="text-lg font-black text-slate-950">Continue to Payment</div>
      <p className="mt-1 text-sm font-semibold text-slate-500">
        Validates traveller details and prepares the existing TPL payment handoff.
      </p>

      <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
        <div className="flex items-center justify-between gap-4 text-sm">
          <span className="font-bold text-slate-600">Selected items</span>
          <span className="font-black text-slate-950">{basketItemsCount}</span>
        </div>
        <div className="mt-2 flex items-center justify-between gap-4 text-sm">
          <span className="font-bold text-slate-600">Basket value</span>
          <span className="font-black text-slate-950">{formatPlannerCurrency(basketValue)}</span>
        </div>
      </div>

      <button
        type="button"
        disabled={!canContinue}
        onClick={onContinue}
        className={`mt-5 inline-flex h-12 w-full items-center justify-center gap-2 rounded-full text-sm font-black transition ${
          canContinue
            ? "bg-[linear-gradient(135deg,#f97316,#ea580c)] text-white shadow-lg shadow-orange-500/25"
            : "cursor-not-allowed bg-slate-200 text-slate-500"
        }`}
      >
        <Save className="h-4 w-4" />
        Proceed to Payment
        <ArrowRight className="h-4 w-4" />
      </button>

      {!canContinue && disabledReason ? (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-bold leading-6 text-red-700">
          {disabledReason}
        </div>
      ) : null}

      {statusMessage ? (
        <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 px-4 py-3 text-sm font-bold leading-6 text-blue-800">
          {statusMessage}
        </div>
      ) : null}
    </section>
  );
}
