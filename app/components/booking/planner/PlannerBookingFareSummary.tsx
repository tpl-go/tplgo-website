"use client";

import { IndianRupee, ReceiptText } from "lucide-react";

import type { BenefitPricingResult } from "@/app/lib/pricing/applyBenefitPricing";
import type { PlannerFareSummary } from "@/app/lib/ecosystem/planner/plannerPricing";
import type { PackageOfferItem } from "@/app/components/booking/packages/BookingPackageOffersSection";
import {
  formatPlannerCurrency,
  type PlannerBookingBasketItem,
  type PlannerBookingPayload,
} from "./PlannerBookingPageShell";

export default function PlannerBookingFareSummary({
  basketItems,
  basketValue,
  benefitPricing,
  plannerFareSummary,
  payload,
  selectedOffer,
  taxesAndFees,
}: {
  basketItems: PlannerBookingBasketItem[];
  basketValue: number;
  benefitPricing: BenefitPricingResult;
  plannerFareSummary?: PlannerFareSummary;
  payload: PlannerBookingPayload;
  selectedOffer?: PackageOfferItem | null;
  taxesAndFees: number;
}) {
  const quoteValue =
    Number(payload.quoteEstimate?.estimatedTotal || 0) ||
    Number(payload.quoteEstimate?.totalQuoteEstimate || 0);
  const selectedValue = plannerFareSummary?.selectedBasketValue || basketValue || quoteValue;
  const walletBenefit =
    plannerFareSummary?.totalWalletBenefit ??
    benefitPricing.tplCreditUsed + benefitPricing.refundUsed;
  const offerDiscount = plannerFareSummary?.offerDiscount ?? benefitPricing.offerDiscount;
  const baseAfterOffer = plannerFareSummary?.baseAfterOffer ?? benefitPricing.baseAfterOffer;
  const finalPayable = plannerFareSummary?.finalPayable ?? benefitPricing.finalPayable;
  const earnedCredit =
    plannerFareSummary?.earnedCreditAmount ??
    Math.floor(benefitPricing.baseAfterOffer * 0.02);
  const taxes = plannerFareSummary?.taxesAndFees ?? taxesAndFees;

  return (
    <section className="rounded-[24px] border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-5 py-4">
        <div className="flex items-center gap-2 text-xl font-black text-slate-950">
          <ReceiptText className="h-5 w-5 text-orange-500" />
          Fare Summary
        </div>
        <p className="mt-1 text-sm font-semibold text-slate-500">
          Uses Smart Planner selected basket value only.
        </p>
      </div>

      <div className="space-y-3 px-5 py-5">
        <FareRow label="Selected Basket Value" value={selectedValue} />
        <FareRow label="Offer Discount" value={offerDiscount} negative />
        <FareRow label="Base After Offer" value={baseAfterOffer} />
        <FareRow label="Fees & Taxes" value={taxes} />
        <FareRow label="TPL Wallet Benefit" value={walletBenefit} negative />

        {selectedOffer ? (
          <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-xs font-black text-orange-700">
            Coupon applied: {selectedOffer.code}
          </div>
        ) : null}
      </div>

      <div className="border-t border-slate-200 bg-orange-50/50 px-5 py-5">
        <div className="text-xs font-black uppercase tracking-wide text-slate-500">
          Final Payable
        </div>
        <div className="mt-2 flex items-center gap-1 text-3xl font-black text-slate-950">
          <IndianRupee className="h-7 w-7" />
          <span>{Math.round(finalPayable || 0).toLocaleString("en-IN")}</span>
        </div>
        <div className="mt-2 text-xs font-bold text-slate-500">
          {basketItems.length} selected basket item{basketItems.length === 1 ? "" : "s"}
        </div>
        <div className="mt-2 text-xs font-bold text-emerald-700">
          Earned Credit after booking: {formatPlannerCurrency(earnedCredit)}
        </div>
      </div>
    </section>
  );
}

function FareRow({
  label,
  negative,
  value,
}: {
  label: string;
  negative?: boolean;
  value: number;
}) {
  return (
    <div className="flex items-center justify-between gap-4 text-sm">
      <span className="font-bold text-slate-600">{label}</span>
      <span className={negative ? "font-black text-emerald-700" : "font-black text-slate-950"}>
        {negative && value > 0 ? "-" : ""}
        {formatPlannerCurrency(value)}
      </span>
    </div>
  );
}
