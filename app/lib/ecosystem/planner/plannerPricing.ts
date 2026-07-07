"use client";

import type { BenefitPricingResult } from "@/app/lib/pricing/applyBenefitPricing";

export type PlannerFareSummary = {
  addOnsTotal: number;
  baseAfterOffer: number;
  baseAmount: number;
  convenienceFee: number;
  currency: "INR";
  earnedCreditAmount: number;
  earnedCreditUsed: number;
  finalPayable: number;
  offerData: Record<string, unknown> | null;
  offerDiscount: number;
  promoCreditUsed: number;
  refundWalletUsed: number;
  selectedBasketValue: number;
  taxesAndFees: number;
  totalWalletBenefit: number;
};

function amount(value: unknown) {
  const numeric = Number(value || 0);
  return Number.isFinite(numeric) ? Math.max(Math.round(numeric), 0) : 0;
}

export function buildPlannerFareSummary(params: {
  addOnsTotal?: number;
  benefitPricing: BenefitPricingResult;
  convenienceFee?: number;
  currency?: "INR";
  earnedCreditAmount?: number;
  offerData?: Record<string, unknown> | null;
  selectedBasketValue: number;
  taxesAndFees?: number;
}): PlannerFareSummary {
  const benefit = params.benefitPricing;
  const selectedBasketValue = amount(params.selectedBasketValue);
  const promoCreditUsed = amount(benefit.promoUsed);
  const earnedCreditUsed = amount(benefit.earnedUsed);
  const refundWalletUsed = amount(benefit.refundUsed);

  return {
    addOnsTotal: amount(params.addOnsTotal),
    baseAfterOffer: amount(benefit.baseAfterOffer),
    baseAmount: selectedBasketValue,
    convenienceFee: amount(params.convenienceFee),
    currency: params.currency || "INR",
    earnedCreditAmount:
      params.earnedCreditAmount !== undefined
        ? amount(params.earnedCreditAmount)
        : Math.floor(amount(benefit.baseAfterOffer) * 0.02),
    earnedCreditUsed,
    finalPayable: amount(benefit.finalPayable),
    offerData: params.offerData || null,
    offerDiscount: amount(benefit.offerDiscount),
    promoCreditUsed,
    refundWalletUsed,
    selectedBasketValue,
    taxesAndFees: amount(params.taxesAndFees),
    totalWalletBenefit: promoCreditUsed + earnedCreditUsed + refundWalletUsed,
  };
}

export function plannerFareSummaryToFare(summary: PlannerFareSummary) {
  return {
    appliedCoupon:
      typeof summary.offerData?.code === "string" ? summary.offerData.code : "",
    baseAfterOffer: summary.baseAfterOffer,
    basePrice: summary.selectedBasketValue,
    couponDiscount: summary.offerDiscount,
    earnedCreditAmount: summary.earnedCreditAmount,
    feesAndTaxes: summary.taxesAndFees,
    finalPayableAmount: summary.finalPayable,
    grandTotal: summary.finalPayable,
    totalBeforeWallet:
      summary.baseAfterOffer +
      summary.taxesAndFees +
      summary.convenienceFee +
      summary.addOnsTotal,
    tplCreditUsed: summary.totalWalletBenefit,
    upgradedDiffTotal: 0,
    walletBreakdown: {
      earnedOnThisBooking: summary.earnedCreditAmount,
      earnedUsed: summary.earnedCreditUsed,
      promoUsed: summary.promoCreditUsed,
      refundUsed: summary.refundWalletUsed,
      totalWalletUsed: summary.totalWalletBenefit,
    },
  };
}

export function normalizePlannerFareSummary(value: unknown): PlannerFareSummary | null {
  if (typeof value !== "object" || value === null) return null;
  const record = value as Record<string, unknown>;

  return {
    addOnsTotal: amount(record.addOnsTotal),
    baseAfterOffer: amount(record.baseAfterOffer),
    baseAmount: amount(record.baseAmount),
    convenienceFee: amount(record.convenienceFee),
    currency: "INR",
    earnedCreditAmount: amount(record.earnedCreditAmount),
    earnedCreditUsed: amount(record.earnedCreditUsed),
    finalPayable: amount(record.finalPayable),
    offerData:
      typeof record.offerData === "object" && record.offerData !== null
        ? (record.offerData as Record<string, unknown>)
        : null,
    offerDiscount: amount(record.offerDiscount),
    promoCreditUsed: amount(record.promoCreditUsed),
    refundWalletUsed: amount(record.refundWalletUsed),
    selectedBasketValue: amount(record.selectedBasketValue),
    taxesAndFees: amount(record.taxesAndFees),
    totalWalletBenefit: amount(record.totalWalletBenefit),
  };
}
