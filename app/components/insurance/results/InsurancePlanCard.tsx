"use client";

import { useEffect, useMemo, useState } from "react";
import { InsurancePlan } from "@/app/lib/insurance/insuranceDummyData";
import {
  formatCoverageAmount,
  formatInsuranceMoney,
} from "@/app/lib/insurance/insurancePricing";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import { getSmartActiveOfferItem } from "@/app/lib/smartOffers";

type InsurancePlanWithPricing = InsurancePlan & {
  originalPremium?: number;
  pricingSnapshot?: any;
  benefitPricing?: any;
  baseAfterOffer?: number;
  nonBenefitAmount?: number;
  grossAmount?: number;
  appliedOfferAmount?: number;
  appliedOfferCode?: string;
  appliedOfferTitle?: string;
  promoUsed?: number;
  earnedUsed?: number;
  refundUsed?: number;
  tplCreditUsed?: number;
  payableBeforeRefundWallet?: number;
  finalPayable?: number;
  earnedOnThisBooking?: number;
  finalTotal?: number;
};

type Props = {
  plan: InsurancePlanWithPricing;
  isCompared?: boolean;
  compareDisabled?: boolean;
  onCompareToggle?: (plan: InsurancePlanWithPricing) => void;
  onViewDetails?: (plan: InsurancePlanWithPricing) => void;
  onBuyNow?: (plan: InsurancePlanWithPricing) => void;
};

function toAmount(value: any, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : fallback;
}

function resolveBenefitValue(source: any, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source?.[key];

    if (Number.isFinite(Number(value))) {
      return Math.round(Number(value));
    }
  }

  return fallback;
}

function getPlanBaseAndCharges(plan: InsurancePlanWithPricing) {
  const snapshot = plan.pricingSnapshot || {};

  const premiumWithGst = toAmount(
    plan.originalPremium ||
      snapshot.originalPremium ||
      snapshot.rawPremium ||
      snapshot.premium ||
      snapshot.baseAmount ||
      plan.premium,
    0
  );

  const explicitGst = toAmount(
    snapshot.gstAmount ||
      snapshot.gst ||
      snapshot.taxes ||
      (plan as any)?.gst ||
      (plan as any)?.taxes,
    0
  );

  const medicalSurcharge = toAmount(
    snapshot.medicalSurcharge || (plan as any)?.medicalSurcharge,
    0
  );

  const adventureSportsAddon = toAmount(
    snapshot.adventureSportsAddon ||
      (plan as any)?.adventureSportsAddon ||
      (plan as any)?.adventureSportsCharge,
    0
  );

  const seniorCitizenSurcharge = toAmount(
    snapshot.seniorCitizenSurcharge || (plan as any)?.seniorCitizenSurcharge,
    0
  );

  const convenienceFee = toAmount(
    snapshot.convenienceFee || (plan as any)?.convenienceFee,
    0
  );

  const gatewayFee = toAmount(
    snapshot.gatewayFee || (plan as any)?.gatewayFee,
    0
  );

  const markup = toAmount(snapshot.markup || (plan as any)?.markup, 0);

  const visaLinkedSurcharge = toAmount(
    snapshot.visaLinkedSurcharge || (plan as any)?.visaLinkedSurcharge,
    0
  );

  const addonCoverCharges = toAmount(
    snapshot.addonCoverCharges || (plan as any)?.addonCoverCharges,
    0
  );

  const baseAmount =
    explicitGst > 0
      ? Math.max(premiumWithGst - explicitGst, 0)
      : Math.round(premiumWithGst / 1.18);

  const gstAmount =
    explicitGst > 0 ? explicitGst : Math.max(premiumWithGst - baseAmount, 0);

  const nonBenefitAmount =
    gstAmount +
    medicalSurcharge +
    adventureSportsAddon +
    seniorCitizenSurcharge +
    convenienceFee +
    gatewayFee +
    markup +
    visaLinkedSurcharge +
    addonCoverCharges;

  return {
    premiumWithGst,
    baseAmount,
    gstAmount,
    medicalSurcharge,
    adventureSportsAddon,
    seniorCitizenSurcharge,
    convenienceFee,
    gatewayFee,
    markup,
    visaLinkedSurcharge,
    addonCoverCharges,
    nonBenefitAmount,
  };
}

function buildFallbackPricing(plan: InsurancePlanWithPricing, smartOffer: any) {
  const charges = getPlanBaseAndCharges(plan);
  const baseAmount = charges.baseAmount;
  const nonBenefitAmount = charges.nonBenefitAmount;

  let benefitPricing: any = null;

  try {
    benefitPricing = (applyBenefitPricing as any)({
      baseAmount,
      nonBenefitAmount,
      offerData: smartOffer,
      wallet: null,
      allowPromoCredit: false,
      allowEarnedCredit: false,
      allowRefundWallet: false,
    });
  } catch {
    benefitPricing = null;
  }

  const appliedOfferAmount = resolveBenefitValue(
    benefitPricing,
    [
      "appliedOfferAmount",
      "offerDiscount",
      "couponDiscount",
      "discountAmount",
      "baseDiscount",
    ],
    0
  );

  const baseAfterOffer = resolveBenefitValue(
    benefitPricing,
    ["baseAfterOffer", "benefitEligibleAfterOffer", "netBaseAmount"],
    Math.max(baseAmount - appliedOfferAmount, 0)
  );

  const finalPayable = resolveBenefitValue(
    benefitPricing,
    ["finalPayable", "finalTotal", "payableAmount", "grandTotal"],
    Math.max(baseAfterOffer + nonBenefitAmount, 0)
  );

  return {
    benefitPricing,
    baseAmount,
    gstAmount: charges.gstAmount,
    nonBenefitAmount,
    grossAmount: baseAmount + nonBenefitAmount,
    appliedOfferAmount,
    appliedOfferCode:
      smartOffer?.couponCode ||
      smartOffer?.code ||
      smartOffer?.offerCode ||
      smartOffer?.slug ||
      "",
    appliedOfferTitle: smartOffer?.title || smartOffer?.name || "",
    baseAfterOffer,
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: 0,
    tplCreditUsed: 0,
    payableBeforeRefundWallet: finalPayable,
    finalPayable,
    earnedOnThisBooking: Math.round(baseAfterOffer * 0.02),
    finalTotal: finalPayable,
  };
}

export default function InsurancePlanCard({
  plan,
  isCompared = false,
  compareDisabled = false,
  onCompareToggle,
  onViewDetails,
  onBuyNow,
}: Props) {
  const [refreshKey, setRefreshKey] = useState(0);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const update = () => setRefreshKey((prev) => prev + 1);

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", update);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", update);
    window.addEventListener("tpl_smart_offer_updated", update);
    window.addEventListener("storage", update);

    update();

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", update);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", update);
      window.removeEventListener("tpl_smart_offer_updated", update);
      window.removeEventListener("storage", update);
    };
  }, []);

  const smartOffer = useMemo(() => {
    if (!mounted) return null;
    return getSmartActiveOfferItem();
  }, [mounted, refreshKey]);

  const pricing = useMemo(() => {
    const snapshot = plan.pricingSnapshot || {};
    const fallback = buildFallbackPricing(plan, smartOffer);

    const baseAmount = fallback.baseAmount;

    const appliedOfferAmount = resolveBenefitValue(
      {
        appliedOfferAmount: plan.appliedOfferAmount,
        snapshotAppliedOfferAmount: snapshot.appliedOfferAmount,
        fallbackAppliedOfferAmount: fallback.appliedOfferAmount,
      },
      [
        "appliedOfferAmount",
        "snapshotAppliedOfferAmount",
        "fallbackAppliedOfferAmount",
      ],
      0
    );

    const baseAfterOffer = Math.max(baseAmount - appliedOfferAmount, 0);

    const nonBenefitAmount = fallback.nonBenefitAmount;
    const grossAmount = baseAmount + nonBenefitAmount;
    const finalPayable = baseAfterOffer + nonBenefitAmount;

    return {
      baseAmount,
      appliedOfferAmount,
      appliedOfferCode:
        plan.appliedOfferCode ||
        snapshot.appliedOfferCode ||
        fallback.appliedOfferCode ||
        "",
      appliedOfferTitle:
        plan.appliedOfferTitle ||
        snapshot.appliedOfferTitle ||
        fallback.appliedOfferTitle ||
        "",
      baseAfterOffer,
      nonBenefitAmount,
      grossAmount,
      finalPayable,
      earnedOnThisBooking: Math.round(baseAfterOffer * 0.02),
    };
  }, [plan, smartOffer]);

  const displayPlan: InsurancePlanWithPricing = useMemo(() => {
    return {
      ...plan,
      originalPremium: pricing.baseAmount,
      premium: pricing.finalPayable,
      baseAfterOffer: pricing.baseAfterOffer,
      nonBenefitAmount: pricing.nonBenefitAmount,
      grossAmount: pricing.grossAmount,
      appliedOfferAmount: pricing.appliedOfferAmount,
      appliedOfferCode: pricing.appliedOfferCode,
      appliedOfferTitle: pricing.appliedOfferTitle,
      promoUsed: 0,
      earnedUsed: 0,
      refundUsed: 0,
      tplCreditUsed: 0,
      payableBeforeRefundWallet: pricing.finalPayable,
      finalPayable: pricing.finalPayable,
      earnedOnThisBooking: pricing.earnedOnThisBooking,
      finalTotal: pricing.finalPayable,
      pricingSnapshot: {
        ...(plan.pricingSnapshot || {}),
        baseAmount: pricing.baseAmount,
        premium: pricing.baseAmount,
        nonBenefitAmount: pricing.nonBenefitAmount,
        grossAmount: pricing.grossAmount,
        appliedOfferAmount: pricing.appliedOfferAmount,
        appliedOfferCode: pricing.appliedOfferCode,
        appliedOfferTitle: pricing.appliedOfferTitle,
        baseAfterOffer: pricing.baseAfterOffer,
        promoUsed: 0,
        earnedUsed: 0,
        refundUsed: 0,
        tplCreditUsed: 0,
        payableBeforeRefundWallet: pricing.finalPayable,
        finalPayable: pricing.finalPayable,
        earnedOnThisBooking: pricing.earnedOnThisBooking,
        finalTotal: pricing.finalPayable,
      },
    };
  }, [plan, pricing]);

  return (
    <article className="rounded-3xl border border-gray-100 bg-white p-4 shadow-sm transition hover:shadow-md">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex flex-1 gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-lg font-extrabold text-orange-700">
            {plan.logoText}
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-xl font-extrabold text-gray-900">
                {plan.provider}
              </h3>

              {plan.visaCompliant && (
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700">
                  Visa Compliant
                </span>
              )}

              {plan.cashlessHospitals && (
                <span className="rounded-full bg-green-50 px-2.5 py-1 text-[11px] font-bold text-green-700">
                  Cashless
                </span>
              )}

              {plan.schengenCompliant && (
                <span className="rounded-full bg-purple-50 px-2.5 py-1 text-[11px] font-bold text-purple-700">
                  Schengen
                </span>
              )}
            </div>

            <p className="mt-1 text-sm font-semibold text-gray-700">
              {plan.planName}
            </p>

            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">
                  Coverage
                </p>
                <p className="text-sm font-extrabold text-gray-900">
                  {formatCoverageAmount(plan.coverageAmount)}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">
                  Claim Ratio
                </p>
                <p className="text-sm font-extrabold text-gray-900">
                  {plan.claimSettlementRatio}%
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">
                  Medical
                </p>
                <p className="text-sm font-extrabold text-gray-900">
                  {plan.medicalCovered ? "Covered" : "Not Covered"}
                </p>
              </div>

              <div className="rounded-xl bg-gray-50 p-3">
                <p className="text-[11px] font-semibold text-gray-500">
                  Covid
                </p>
                <p className="text-sm font-extrabold text-gray-900">
                  {plan.covidCover ? "Included" : "No"}
                </p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {plan.features.slice(0, 4).map((feature) => (
                <span
                  key={feature}
                  className="rounded-full border border-gray-200 px-3 py-1 text-xs font-semibold text-gray-600"
                >
                  {feature}
                </span>
              ))}
            </div>

            <button
              type="button"
              disabled={compareDisabled && !isCompared}
              onClick={() => onCompareToggle?.(displayPlan)}
              className={`mt-4 rounded-full border px-4 py-2 text-xs font-extrabold transition ${
                isCompared
                  ? "border-orange-500 bg-orange-500 text-white"
                  : compareDisabled
                  ? "cursor-not-allowed border-gray-200 bg-gray-100 text-gray-400"
                  : "border-orange-200 bg-orange-50 text-orange-700 hover:bg-orange-100"
              }`}
            >
              {isCompared ? "✓ Added to Compare" : "Add to Compare"}
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-orange-100 bg-orange-50 p-4 lg:w-56">
          <p className="text-xs font-semibold text-gray-500">Premium starts</p>

          <div className="mt-1">
            {pricing.appliedOfferAmount > 0 ? (
              <>
                <p className="text-sm font-bold text-gray-400 line-through">
                  {formatInsuranceMoney(pricing.baseAmount)}
                </p>

                <p className="text-2xl font-extrabold text-gray-900">
                  {formatInsuranceMoney(pricing.baseAfterOffer)}
                </p>
              </>
            ) : (
              <p className="text-2xl font-extrabold text-gray-900">
                {formatInsuranceMoney(pricing.baseAmount)}
              </p>
            )}
          </div>

          <p className="text-xs text-gray-500">
            Total {formatInsuranceMoney(pricing.finalPayable)} incl. GST
          </p>

          {pricing.appliedOfferAmount > 0 && (
            <div className="mt-2 flex items-center justify-between rounded-xl border border-green-200 bg-white px-2.5 py-1.5">
              <span className="max-w-[110px] truncate text-[10px] font-extrabold text-green-700">
                {pricing.appliedOfferCode || "OFFER"} Applied
              </span>
              <span className="text-[10px] font-extrabold text-green-700">
                -{formatInsuranceMoney(pricing.appliedOfferAmount)}
              </span>
            </div>
          )}

          {pricing.appliedOfferAmount > 0 && (
            <p className="mt-1 text-[10px] font-semibold text-gray-500">
              Offer applied on base premium only
            </p>
          )}

          <div className="mt-3 space-y-2">
            <button
              type="button"
              onClick={() => onBuyNow?.(displayPlan)}
              className="w-full rounded-xl bg-orange-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-orange-600"
            >
              Buy Now
            </button>

            <button
              type="button"
              onClick={() => onViewDetails?.(displayPlan)}
              className="w-full rounded-xl border border-orange-200 bg-white px-4 py-2.5 text-sm font-bold text-orange-600 transition hover:border-orange-400"
            >
              View Details
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}