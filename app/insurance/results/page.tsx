"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import InsuranceResultsSearchBar from "@/app/components/insurance/results/InsuranceResultsSearchBar";
import InsuranceResultsSortBar from "@/app/components/insurance/results/InsuranceResultsSortBar";
import InsuranceFiltersSidebar from "@/app/components/insurance/results/InsuranceFiltersSidebar";
import InsurancePlanCard from "@/app/components/insurance/results/InsurancePlanCard";
import InsurancePlanDetailsModal from "@/app/components/insurance/results/InsurancePlanDetailsModal";
import InsuranceCompareBar from "@/app/components/insurance/results/InsuranceCompareBar";
import InsuranceCompareModal from "@/app/components/insurance/results/InsuranceCompareModal";
import SmartResultsOfferStrip from "@/app/components/smartOffers/SmartResultsOfferStrip";

import {
  insurancePlans,
  type InsurancePlan,
} from "@/app/lib/insurance/insuranceDummyData";

import {
  applyInsuranceFilters,
  defaultInsuranceFilters,
  type InsuranceFilterState,
} from "@/app/lib/insurance/insuranceFilters";

import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

type SortKey = "recommended" | "premiumLow" | "coverageHigh" | "claimHigh";

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

function getSearchValue(params: URLSearchParams, keys: string[], fallback = "") {
  for (const key of keys) {
    const value = params.get(key);
    if (value) return value;
  }

  return fallback;
}

function toAmount(value: any, fallback = 0) {
  const amount = Number(value);
  return Number.isFinite(amount) && amount > 0 ? Math.round(amount) : fallback;
}

function resolveOfferCode(activeOffer: any) {
  return (
    activeOffer?.couponCode ||
    activeOffer?.code ||
    activeOffer?.offerCode ||
    activeOffer?.slug ||
    ""
  );
}

function resolveOfferTitle(activeOffer: any) {
  return activeOffer?.title || activeOffer?.name || activeOffer?.offerTitle || "";
}

function buildInsuranceBenefitPricing(
  plan: InsurancePlan,
  activeOffer: any
): Omit<InsurancePlanWithPricing, keyof InsurancePlan> {
  const premiumWithGst = toAmount(plan?.premium, 0);

const explicitGst = toAmount((plan as any)?.gst || (plan as any)?.taxes, 0);

const baseAmount =
  explicitGst > 0
    ? Math.max(premiumWithGst - explicitGst, 0)
    : Math.round(premiumWithGst / 1.18);

const autoGstAmount =
  explicitGst > 0 ? explicitGst : Math.max(premiumWithGst - baseAmount, 0);

  const gstAmount = autoGstAmount;
  const medicalSurcharge = toAmount((plan as any)?.medicalSurcharge, 0);
  const adventureSportsAddon = toAmount(
    (plan as any)?.adventureSportsAddon || (plan as any)?.adventureSportsCharge,
    0
  );
  const seniorCitizenSurcharge = toAmount(
    (plan as any)?.seniorCitizenSurcharge,
    0
  );
  const convenienceFee = toAmount((plan as any)?.convenienceFee, 0);
  const gatewayFee = toAmount((plan as any)?.gatewayFee, 0);
  const markup = toAmount((plan as any)?.markup, 0);
  const visaLinkedSurcharge = toAmount((plan as any)?.visaLinkedSurcharge, 0);
  const addonCoverCharges = toAmount((plan as any)?.addonCoverCharges, 0);

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

  const serviceOk =
    activeOffer?.service === "insurance" || activeOffer?.service === "all";

  const appliedOfferAmount =
    activeOffer && serviceOk
      ? Math.min(
          baseAmount,
          Math.max(0, Math.round(calculateSmartOfferDiscount(activeOffer, baseAmount)))
        )
      : 0;

  const baseAfterOffer = Math.max(baseAmount - appliedOfferAmount, 0);
  const grossAmount = baseAmount + nonBenefitAmount;
  const payableBeforeRefundWallet = baseAfterOffer + nonBenefitAmount;
  const finalPayable = payableBeforeRefundWallet;
  const earnedOnThisBooking = Math.round(baseAfterOffer * 0.02);

  let benefitPricing: any = null;

  try {
    benefitPricing = (applyBenefitPricing as any)({
      baseAmount,
      nonBenefitAmount,
      offerData: activeOffer,
      wallet: null,
      allowPromoCredit: false,
      allowEarnedCredit: false,
      allowRefundWallet: false,
    });
  } catch {
    benefitPricing = null;
  }

  return {
    originalPremium: baseAmount,
    pricingSnapshot: {
      baseAmount,
      premium: baseAmount,
      gstAmount,
      taxes: gstAmount,
      medicalSurcharge,
      adventureSportsAddon,
      seniorCitizenSurcharge,
      convenienceFee,
      gatewayFee,
      markup,
      visaLinkedSurcharge,
      addonCoverCharges,
      nonBenefitAmount,
      grossAmount,
      appliedOfferAmount,
      appliedOfferCode: resolveOfferCode(activeOffer),
      appliedOfferTitle: resolveOfferTitle(activeOffer),
      baseAfterOffer,
      promoUsed: 0,
      earnedUsed: 0,
      refundUsed: 0,
      tplCreditUsed: 0,
      payableBeforeRefundWallet,
      finalPayable,
      earnedOnThisBooking,
      finalTotal: finalPayable,
    },
    benefitPricing,
    baseAfterOffer,
    nonBenefitAmount,
    grossAmount,
    appliedOfferAmount,
    appliedOfferCode: resolveOfferCode(activeOffer),
    appliedOfferTitle: resolveOfferTitle(activeOffer),
    promoUsed: 0,
    earnedUsed: 0,
    refundUsed: 0,
    tplCreditUsed: 0,
    payableBeforeRefundWallet,
    finalPayable,
    earnedOnThisBooking,
    finalTotal: finalPayable,
  };
}

function sortInsurancePlans(plans: InsurancePlan[], sortKey: SortKey) {
  const next = [...plans];

  if (sortKey === "premiumLow") {
    return next.sort((a, b) => a.premium - b.premium);
  }

  if (sortKey === "coverageHigh") {
    return next.sort((a, b) => b.coverageAmount - a.coverageAmount);
  }

  if (sortKey === "claimHigh") {
    return next.sort(
      (a, b) => b.claimSettlementRatio - a.claimSettlementRatio
    );
  }

  return next.sort((a, b) => {
    const aScore =
      a.claimSettlementRatio +
      (a.visaCompliant ? 5 : 0) +
      (a.cashlessHospitals ? 4 : 0) +
      (a.medicalCovered ? 4 : 0) -
      a.premium / 1000;

    const bScore =
      b.claimSettlementRatio +
      (b.visaCompliant ? 5 : 0) +
      (b.cashlessHospitals ? 4 : 0) +
      (b.medicalCovered ? 4 : 0) -
      b.premium / 1000;

    return bScore - aScore;
  });
}

function matchInsuranceIntent(
  plan: InsurancePlan,
  insuranceType: string,
  destination: string,
  age: string
) {
  const typeText = insuranceType.toLowerCase();
  const destinationText = destination.toLowerCase();
  const ageNumber = Number(age || 0);

  if (typeText.includes("domestic")) {
    return plan.destinationType === "Domestic";
  }

  if (typeText.includes("student")) {
    return plan.studentFriendly || plan.destinationType === "Student";
  }

  if (typeText.includes("senior") || ageNumber >= 60) {
    return plan.seniorFriendly || plan.destinationType === "Senior";
  }

  if (typeText.includes("family")) {
    return plan.familyFriendly;
  }

  if (
    typeText.includes("visa") ||
    destinationText.includes("schengen") ||
    destinationText.includes("france") ||
    destinationText.includes("germany") ||
    destinationText.includes("italy") ||
    destinationText.includes("spain")
  ) {
    return plan.visaCompliant || plan.schengenCompliant;
  }

  if (
    destinationText.includes("domestic") ||
    destinationText.includes("india")
  ) {
    return plan.destinationType === "Domestic";
  }

  return plan.destinationType !== "Domestic";
}

function InsuranceResultsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [filters, setFilters] = useState<InsuranceFilterState>(
    defaultInsuranceFilters
  );
  const [sortKey, setSortKey] = useState<SortKey>("recommended");
  const [detailPlan, setDetailPlan] = useState<InsurancePlanWithPricing | null>(
    null
  );
  const [comparePlans, setComparePlans] = useState<InsurancePlanWithPricing[]>(
    []
  );
  const [compareOpen, setCompareOpen] = useState(false);
  const [offerVersion, setOfferVersion] = useState(0);

  useEffect(() => {
    const refreshOffer = () => setOfferVersion((prev) => prev + 1);

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", refreshOffer);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", refreshOffer);
    window.addEventListener("tpl_smart_offer_updated", refreshOffer);
    window.addEventListener("storage", refreshOffer);

    refreshOffer();

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", refreshOffer);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", refreshOffer);
      window.removeEventListener("tpl_smart_offer_updated", refreshOffer);
      window.removeEventListener("storage", refreshOffer);
    };
  }, []);

  const params = useMemo(
    () => new URLSearchParams(searchParams.toString()),
    [searchParams]
  );

  const insuranceType = getSearchValue(
    params,
    ["type", "insuranceType", "planType"],
    "Travel Insurance"
  );

  const destination = getSearchValue(
    params,
    ["destination", "country", "city"],
    "International"
  );

  const fromDate = getSearchValue(params, [
    "fromDate",
    "startDate",
    "departure",
  ]);

  const toDate = getSearchValue(params, ["toDate", "endDate", "returnDate"]);

  const travellers = getSearchValue(
    params,
    ["travellers", "traveller", "pax"],
    "1 Traveller"
  );

  const age = getSearchValue(params, ["age", "travellerAge"], "");

  const travellerAgesParam = getSearchValue(params, ["travellerAges"], "");
  const travellerAges = travellerAgesParam
    ? travellerAgesParam.split(",").filter(Boolean)
    : age
    ? [age]
    : [];

  const travelDates =
    fromDate && toDate
      ? `${fromDate} - ${toDate}`
      : fromDate
      ? fromDate
      : "Select Dates";

  const intentPlans = useMemo(() => {
    const matched = insurancePlans.filter((plan) =>
      matchInsuranceIntent(plan, insuranceType, destination, age)
    );

    return matched.length > 0 ? matched : insurancePlans;
  }, [insuranceType, destination, age]);

  const filteredPlans = useMemo(() => {
    const filtered = applyInsuranceFilters(intentPlans, filters);
    return sortInsurancePlans(filtered, sortKey);
  }, [intentPlans, filters, sortKey]);

  const activeOffer = useMemo(() => {
    offerVersion;
    return getSmartActiveOfferItem();
  }, [offerVersion]);

  const pricedPlans = useMemo<InsurancePlanWithPricing[]>(() => {
    return filteredPlans.map((plan) => {
      const pricing = buildInsuranceBenefitPricing(plan, activeOffer);

      return {
        ...plan,
        ...pricing,
        premium: pricing.finalPayable || plan.premium,
      };
    });
  }, [filteredPlans, activeOffer]);

  const offerBookingValue = useMemo(() => {
    const prices = filteredPlans
      .map((plan) => Number(plan?.premium || 0))
      .filter((price) => price > 0);

    return prices.length > 0 ? Math.max(...prices) : 2000;
  }, [filteredPlans]);

  const handleCompareToggle = (plan: InsurancePlanWithPricing) => {
    setComparePlans((prev) => {
      const exists = prev.some((item) => item.id === plan.id);

      if (exists) {
        return prev.filter((item) => item.id !== plan.id);
      }

      if (prev.length >= 3) {
        return prev;
      }

      return [...prev, plan];
    });
  };

  const isInternational = useMemo(() => {
    const target = `${insuranceType} ${destination}`.toLowerCase();

    if (target.includes("domestic") || target.includes("india")) {
      return false;
    }

    return true;
  }, [insuranceType, destination]);

  const handleViewDetails = (plan: InsurancePlanWithPricing) => {
    sessionStorage.setItem("tplSelectedInsurancePlan", JSON.stringify(plan));
    setDetailPlan(plan);
  };

  const handleBuyNow = (plan: InsurancePlanWithPricing) => {
    const payload = {
      plan,
      pricingSnapshot: plan.pricingSnapshot,
      benefitPricing: plan.benefitPricing,
      baseAfterOffer: plan.baseAfterOffer,
      nonBenefitAmount: plan.nonBenefitAmount,
      grossAmount: plan.grossAmount,
      appliedOfferAmount: plan.appliedOfferAmount,
      appliedOfferCode: plan.appliedOfferCode,
      appliedOfferTitle: plan.appliedOfferTitle,
      promoUsed: plan.promoUsed,
      earnedUsed: plan.earnedUsed,
      refundUsed: plan.refundUsed,
      tplCreditUsed: plan.tplCreditUsed,
      payableBeforeRefundWallet: plan.payableBeforeRefundWallet,
      finalPayable: plan.finalPayable,
      earnedOnThisBooking: plan.earnedOnThisBooking,
      finalTotal: plan.finalTotal,
      search: {
        insuranceType,
        destination,
        fromDate,
        toDate,
        travellers,
        age,
        travellerAges,
        travelDates,
      },
      selectedAt: new Date().toISOString(),
    };

    sessionStorage.setItem("tplSelectedInsurancePlan", JSON.stringify(plan));
    sessionStorage.setItem("tplInsuranceSearchData", JSON.stringify(payload));
    router.push("/insurance/booking");
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <InsuranceResultsSearchBar
        insuranceType={insuranceType}
        destination={destination}
        travelDates={travelDates}
        travellers={travellers}
        fromDate={fromDate}
        toDate={toDate}
        age={age}
        travellerAges={travellerAges}
        onSearchUpdate={(data) => {
          const query = new URLSearchParams();

          query.set("insuranceType", data.insuranceType);
          query.set("destination", data.destination);
          query.set("fromDate", data.fromDate);
          query.set("toDate", data.toDate);
          query.set("travellers", data.travellers);
          query.set("travellerAges", data.travellerAges.join(","));
          query.set("age", data.age);

          router.push(`/insurance/results?${query.toString()}`);
        }}
      />

      <section className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 rounded-3xl bg-gradient-to-r from-[#0f3cc9] via-[#2563eb] to-[#3b82f6] p-5 text-white shadow-[0_12px_35px_rgba(37,99,235,0.28)]">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-semibold text-white/90">
                TPL Insurance Protect
              </p>
              <h1 className="mt-1 text-2xl font-extrabold">
                Smart insurance plans for your trip
              </h1>
              <p className="mt-1 text-sm text-white/90">
                Compare coverage, claim ratio, medical benefits and visa-ready
                plans before booking.
              </p>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur">
              <p className="text-xs font-semibold text-white/80">
                Recommended for
              </p>
              <p className="text-sm font-extrabold">
                {destination || "International"} • {insuranceType}
              </p>
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-[280px_1fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <InsuranceFiltersSidebar
              plans={intentPlans}
              filters={filters}
              onChange={setFilters}
            />
          </div>

          <div>
            <InsuranceResultsSortBar
              total={pricedPlans.length}
              sortKey={sortKey}
              onSortChange={setSortKey}
            />

            <SmartResultsOfferStrip
              service="insurance"
              destination={destination}
              bookingValue={offerBookingValue}
              isInternational={isInternational}
            />

            {pricedPlans.length > 0 ? (
              <div className="space-y-4">
                {pricedPlans.map((plan) => (
                  <InsurancePlanCard
                    key={`${plan.id}-${offerVersion}`}
                    plan={plan}
                    isCompared={comparePlans.some(
                      (item) => item.id === plan.id
                    )}
                    compareDisabled={
                      comparePlans.length >= 3 &&
                      !comparePlans.some((item) => item.id === plan.id)
                    }
                    onCompareToggle={handleCompareToggle}
                    onViewDetails={handleViewDetails}
                    onBuyNow={handleBuyNow}
                  />
                ))}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-white p-10 text-center">
                <h2 className="text-xl font-extrabold text-gray-900">
                  No insurance plan found
                </h2>
                <p className="mt-2 text-sm text-gray-500">
                  Try clearing filters or modifying your search details.
                </p>

                <button
                  type="button"
                  onClick={() => setFilters(defaultInsuranceFilters)}
                  className="mt-5 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-orange-600"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      <InsurancePlanDetailsModal
        plan={detailPlan}
        onClose={() => setDetailPlan(null)}
        onBuyNow={handleBuyNow}
      />

      <InsuranceCompareBar
        selectedPlans={comparePlans}
        onRemove={(planId) =>
          setComparePlans((prev) => prev.filter((item) => item.id !== planId))
        }
        onClear={() => setComparePlans([])}
        onCompare={() => setCompareOpen(true)}
      />

      {compareOpen && (
        <InsuranceCompareModal
          plans={comparePlans}
          onClose={() => setCompareOpen(false)}
          onBuyNow={handleBuyNow}
        />
      )}
    </main>
  );
}

export default function InsuranceResultsPage() {
  return (
    <Suspense fallback={<div />}>
      <InsuranceResultsPageContent />
    </Suspense>
  );
}