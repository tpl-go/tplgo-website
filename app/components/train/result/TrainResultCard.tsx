"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type {
  TrainClassAvailability,
  TrainDateAvailability,
  TrainQuotaType,
  TrainResultItem,
} from "@/app/lib/train/trainResultTypes";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import TrainRouteModal from "./TrainRouteModal";
import TrainConfirmOptionModal from "./TrainConfirmOptionModal";

type Props = {
  train: TrainResultItem;
  expandedTrainId: string | null;
  onExpandTrain: (trainId: string | null) => void;
};

const QUOTA_TABS: { label: string; value: TrainQuotaType }[] = [
  { label: "General", value: "general" },
  { label: "Tatkal", value: "tatkal" },
  { label: "Senior Citizen", value: "seniorCitizen" },
  { label: "Ladies", value: "ladies" },
];

const SMART_ACTIVE_OFFER_KEY = "tpl_smart_active_offer_v1";
const SMART_OFFER_SOURCE_KEY = "tpl_smart_offer_source_v1";
const SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY = "tplActiveOfferPayload";

function toNumber(value: any, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function readActiveTrainOffer() {
  if (typeof window === "undefined") return null;

  try {
    const specialRaw = sessionStorage.getItem(SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY);

    if (specialRaw) {
      const special = JSON.parse(specialRaw);
      const service = String(special?.service || "").toLowerCase();

      if (!service || service === "train" || service === "trains" || service === "all") {
        return special;
      }
    }

    const smartRaw = sessionStorage.getItem(SMART_ACTIVE_OFFER_KEY);
    if (!smartRaw) return null;

    const smart = JSON.parse(smartRaw);
    const offer = smart?.offer || smart;

    const service = String(offer?.service || "").toLowerCase();
    if (service && service !== "train" && service !== "trains" && service !== "all") {
      return null;
    }

    return {
      ...offer,
      source: smart?.source || offer?.source || "ai_auto",
      activatedAt: smart?.activatedAt || offer?.activatedAt,
    };
  } catch {
    return null;
  }
}

function getOfferCode(offer: any) {
  return (
    offer?.couponCode ||
    offer?.code ||
    offer?.offerCode ||
    offer?.offer?.couponCode ||
    offer?.offer?.code ||
    ""
  );
}

function getOfferTitle(offer: any) {
  return (
    offer?.title ||
    offer?.offerTitle ||
    offer?.offer?.title ||
    "Offer Applied"
  );
}

function getOfferDiscountAmount(offer: any, baseAmount: number) {
  if (!offer || baseAmount <= 0) return 0;

  const minBookingValue = Number(
    offer?.rule?.minBookingValue ||
      offer?.minBookingValue ||
      offer?.offer?.rule?.minBookingValue ||
      offer?.offer?.minBookingValue ||
      0
  );

  if (minBookingValue > 0 && baseAmount < minBookingValue) return 0;

  const discountMode = String(
    offer?.discountMode || offer?.offer?.discountMode || ""
  ).toLowerCase();

  const discountValue = Number(
    offer?.discountValue || offer?.offer?.discountValue || 0
  );

  const maxDiscount = Number(
    offer?.maxDiscount || offer?.offer?.maxDiscount || discountValue || 0
  );

  let discount = 0;

  if (discountMode === "percent") {
    discount = Math.round((baseAmount * discountValue) / 100);
  } else {
    discount = Math.round(discountValue);
  }

  if (maxDiscount > 0) discount = Math.min(discount, maxDiscount);

  return Math.min(Math.max(discount, 0), baseAmount);
}

function resolveTrainPricing(baseFare: number, activeOffer: any) {
  const safeBaseFare = Math.max(0, Math.round(toNumber(baseFare)));
  const offerDiscount = getOfferDiscountAmount(activeOffer, safeBaseFare);

  const benefitPricing = applyBenefitPricing({
    baseAmount: safeBaseFare,
    offerDiscount,
  });

  return {
    baseFare: safeBaseFare,
    offerDiscount,
    baseAfterOffer: benefitPricing.baseAfterOffer,
    finalPayable: benefitPricing.finalPayable,
    displayPrice: offerDiscount > 0 ? benefitPricing.baseAfterOffer : safeBaseFare,
    strikePrice: offerDiscount > 0 ? safeBaseFare : 0,
    isOfferApplied: Boolean(activeOffer && offerDiscount > 0 && safeBaseFare > 0),
    benefitPricing,
  };
}

export default function TrainResultCard({
  train,
  expandedTrainId,
  onExpandTrain,
}: Props) {
  const router = useRouter();

  const [activeOffer, setActiveOffer] = useState<any>(null);
  const [selectedClassCode, setSelectedClassCode] = useState<string | null>(null);
  const [activeQuota, setActiveQuota] = useState<TrainQuotaType>("general");
  const [showRouteModal, setShowRouteModal] = useState(false);
  const [confirmModalData, setConfirmModalData] = useState<{
    classCode: string;
    date: string;
    confirmChance?: number;
    confirmTicketPrice?: number;
    basePrice?: number;
    statusText?: string;
    statusType?: string;
  } | null>(null);

  useEffect(() => {
    setActiveOffer(readActiveTrainOffer());

    const syncOffer = () => {
      setActiveOffer(readActiveTrainOffer());
    };

    window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer);
    window.addEventListener("TPL_SMART_OFFER_UPDATED", syncOffer);
    window.addEventListener("storage", syncOffer);

    return () => {
      window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", syncOffer);
      window.removeEventListener("TPL_SMART_OFFER_UPDATED", syncOffer);
      window.removeEventListener("storage", syncOffer);
    };
  }, []);

  const offerCode = useMemo(() => getOfferCode(activeOffer), [activeOffer]);
  const offerTitle = useMemo(() => getOfferTitle(activeOffer), [activeOffer]);

  const isExpanded = expandedTrainId === train.id;

  const selectedClass = useMemo<TrainClassAvailability | null>(() => {
    if (!selectedClassCode || !isExpanded) return null;

    return (
      train.classes.find((item) => item.classCode === selectedClassCode) || null
    );
  }, [selectedClassCode, train.classes, isExpanded]);

  const expandedRows: TrainDateAvailability[] = useMemo(() => {
    if (!selectedClass) return [];
    return selectedClass.dateWiseAvailability[activeQuota] || [];
  }, [selectedClass, activeQuota]);

  function getResolvedClassPrice(item: TrainClassAvailability) {
    const firstGeneralRow = item.dateWiseAvailability?.general?.[0];
    const baseFare = toNumber(firstGeneralRow?.price || item.price || 0);
    return resolveTrainPricing(baseFare, activeOffer);
  }

  function getResolvedRowPrice(row: TrainDateAvailability) {
    return resolveTrainPricing(toNumber(row.price), activeOffer);
  }

  function handleToggleClass(classCode: string) {
    if (isExpanded && selectedClassCode === classCode) {
      setSelectedClassCode(null);
      onExpandTrain(null);
      return;
    }

    setSelectedClassCode(classCode);
    setActiveQuota("general");
    onExpandTrain(train.id);
  }

  function persistActiveOfferForTrain(params: {
    baseFare: number;
    offerDiscount: number;
    baseAfterOffer: number;
    finalPayable: number;
    classCode: string;
    journeyDate: string;
    ticketType: "regular" | "confirm";
  }) {
    if (typeof window === "undefined" || !activeOffer) return;

    try {
      const enrichedOffer = {
        ...activeOffer,
        service: "train",
        appliedOfferAmount: params.offerDiscount,
        discountAmount: params.offerDiscount,
        baseAmount: params.baseFare,
        baseAfterOffer: params.baseAfterOffer,
        finalPayable: params.finalPayable,
      };

      sessionStorage.setItem(
        SMART_ACTIVE_OFFER_KEY,
        JSON.stringify(enrichedOffer)
      );

      sessionStorage.setItem(
        SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY,
        JSON.stringify(enrichedOffer)
      );

      sessionStorage.setItem(
        SMART_OFFER_SOURCE_KEY,
        JSON.stringify({
          service: "train",
          source: "results",
          selectedAt: new Date().toISOString(),
          baseAmount: params.baseFare,
          offerDiscount: params.offerDiscount,
          baseAfterOffer: params.baseAfterOffer,
          trainId: train.id,
          trainName: train.trainName,
          trainNumber: train.trainNumber,
          classCode: params.classCode,
          journeyDate: params.journeyDate,
          ticketType: params.ticketType,
          route: {
            fromCity: train.fromCity,
            fromCode: train.fromCode,
            toCity: train.toCity,
            toCode: train.toCode,
            departureTime: train.departureTime,
            arrivalTime: train.arrivalTime,
          },
        })
      );

      window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
      window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
    } catch {}
  }

  function buildBookingPayload(params: {
    journeyDate: string;
    classCode: string;
    quota: TrainQuotaType;
    ticketPrice: number;
    ticketType: "regular" | "confirm";
    statusText: string;
    statusType: string;
    confirmChance?: number;
    confirmTicketPrice?: number;
    originalBasePrice?: number;
  }) {
    const trueBaseFare =
      params.ticketType === "confirm"
        ? toNumber(params.originalBasePrice || params.ticketPrice)
        : toNumber(params.ticketPrice);

    const confirmUpgradeAmount =
      params.ticketType === "confirm"
        ? Math.max(0, toNumber(params.ticketPrice) - trueBaseFare)
        : 0;

    const resolvedPricing = resolveTrainPricing(trueBaseFare, activeOffer);

    const totalBeforeWallet =
      resolvedPricing.baseAfterOffer + confirmUpgradeAmount;

    const earnedOnThisBooking = Math.round(resolvedPricing.baseAfterOffer * 0.02);

    const pricingSnapshot = {
      pricingVersion: "TPL_TRAIN_PRICING_RULE_V1",

      baseFare: resolvedPricing.baseFare,
      trueBaseFare: resolvedPricing.baseFare,

      appliedOfferAmount: resolvedPricing.offerDiscount,
      offerDiscount: resolvedPricing.offerDiscount,
      couponDiscount: resolvedPricing.offerDiscount,
      appliedOfferCode: offerCode,
      appliedOfferTitle: offerTitle,
      offerData: activeOffer || null,

      baseAfterOffer: resolvedPricing.baseAfterOffer,

      taxesAndFees: 0,
      taxes: 0,
      seatBerthCharges: 0,
      mealAmount: 0,
      insuranceAmount: 0,
      serviceFee: 0,
      convenienceFee: 0,
      cancellationFreeChangeAmount: 0,
      confirmUpgradeAmount,

      nonBenefitTotal: confirmUpgradeAmount,
      totalBeforeWallet,

      promoCreditEligibleBase: resolvedPricing.baseAfterOffer,
      earnedCreditEligibleBase: resolvedPricing.baseAfterOffer,
      refundWalletEligibleAmount: totalBeforeWallet,

      tplCreditUsed: 0,
      promoUsed: 0,
      earnedUsed: 0,
      refundUsed: 0,

      walletCalc: {
        promoUsed: 0,
        earnedUsed: 0,
        refundUsed: 0,
      },

      earnedOnThisBooking,
      grandTotal: totalBeforeWallet,
      payableAmount: totalBeforeWallet,

      rules: {
        offerAppliesOn: "true_base_train_fare",
        promoEarnedAppliesOn: "base_after_offer",
        refundWalletAppliesOn: "final_payable",
        earnedCreditRate: 0.02,
        nonBenefitAmounts: [
          "taxesAndFees",
          "seatBerthCharges",
          "mealAmount",
          "insuranceAmount",
          "serviceFee",
          "convenienceFee",
          "cancellationFreeChangeAmount",
          "confirmUpgradeAmount",
        ],
      },
    };

    return {
      train: {
        id: train.id,
        trainName: train.trainName,
        trainNumber: train.trainNumber,
        offerTag: train.offerTag || "",
        confirmedOptionTag: train.confirmedOptionTag || "",
        confirmedOptionDescription: train.confirmedOptionDescription || "",
        fromCity: train.fromCity,
        fromCode: train.fromCode,
        toCity: train.toCity,
        toCode: train.toCode,
        departureTime: train.departureTime,
        departureDateLabel: train.departureDateLabel,
        arrivalTime: train.arrivalTime,
        arrivalDateLabel: train.arrivalDateLabel,
        duration: train.duration,
        fromStationCode: train.fromStationCode,
        toStationCode: train.toStationCode,
        runDays: train.runDays,
      },

      searchMeta: {
        fromCity: train.fromCity,
        fromCode: train.fromCode,
        toCity: train.toCity,
        toCode: train.toCode,
        date: params.journeyDate,
        travelDate: params.journeyDate,
      },

      journeyDate: params.journeyDate,
      travelDate: params.journeyDate,

      bookingSelection: {
        journeyDate: params.journeyDate,
        date: params.journeyDate,
        travelDate: params.journeyDate,
        classCode: params.classCode,
        quota: params.quota,

        ticketPrice: totalBeforeWallet,
        originalTicketPrice: params.ticketPrice,
        baseFare: pricingSnapshot.baseFare,
        trueBaseFare: pricingSnapshot.trueBaseFare,
        baseAfterOffer: pricingSnapshot.baseAfterOffer,
        payableAmount: pricingSnapshot.payableAmount,

        ticketType: params.ticketType,
        statusText: params.statusText,
        statusType: params.statusType,
        confirmChance: params.confirmChance || null,
        confirmTicketPrice: params.confirmTicketPrice || null,
        confirmUpgradeAmount,
      },

      selectedClass: selectedClass
        ? {
            classCode: selectedClass.classCode,
            price: selectedClass.price,
            refundTag: selectedClass.refundTag || "",
            lastUpdatedText: selectedClass.lastUpdatedText,
          }
        : null,

      pricingSnapshot,
      fareSnapshot: pricingSnapshot,
      priceBreakup: pricingSnapshot,

      routeStops: train.routeStops,
      savedAt: Date.now(),
    };
  }

  function handleBookRegular(row: TrainDateAvailability) {
    if (!selectedClass) return;

    const resolvedPricing = getResolvedRowPrice(row);

    persistActiveOfferForTrain({
      baseFare: resolvedPricing.baseFare,
      offerDiscount: resolvedPricing.offerDiscount,
      baseAfterOffer: resolvedPricing.baseAfterOffer,
      finalPayable: resolvedPricing.finalPayable,
      classCode: selectedClass.classCode,
      journeyDate: row.date,
      ticketType: "regular",
    });

    const payload = buildBookingPayload({
      journeyDate: row.date,
      classCode: selectedClass.classCode,
      quota: activeQuota,
      ticketPrice: row.price,
      ticketType: "regular",
      statusText: row.statusText,
      statusType: row.statusType,
    });

    sessionStorage.setItem("tplTrainBookingData", JSON.stringify(payload));
    router.push("/train/booking");
  }

  function handleBookConfirmTicket() {
    if (!selectedClass || !confirmModalData) return;

    const trueBaseFare = toNumber(
      confirmModalData.basePrice || confirmModalData.confirmTicketPrice || 0
    );
    const resolvedPricing = resolveTrainPricing(trueBaseFare, activeOffer);

    persistActiveOfferForTrain({
      baseFare: resolvedPricing.baseFare,
      offerDiscount: resolvedPricing.offerDiscount,
      baseAfterOffer: resolvedPricing.baseAfterOffer,
      finalPayable: resolvedPricing.finalPayable,
      classCode: confirmModalData.classCode,
      journeyDate: confirmModalData.date,
      ticketType: "confirm",
    });

    const payload = buildBookingPayload({
      journeyDate: confirmModalData.date,
      classCode: confirmModalData.classCode,
      quota: activeQuota,
      ticketPrice: confirmModalData.confirmTicketPrice || 0,
      ticketType: "confirm",
      statusText: confirmModalData.statusText || "Confirmed Option",
      statusType: confirmModalData.statusType || "AVAILABLE",
      confirmChance: confirmModalData.confirmChance,
      confirmTicketPrice: confirmModalData.confirmTicketPrice,
      originalBasePrice: confirmModalData.basePrice,
    });

    sessionStorage.setItem("tplTrainBookingData", JSON.stringify(payload));
    router.push("/train/booking");
  }

  return (
    <>
      <div className="min-w-0 overflow-hidden rounded-[22px] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-md">
        <div className="px-4 py-4">
          <div className="grid min-w-0 grid-cols-1 items-start gap-4 md:grid-cols-[1.25fr_0.85fr_0.65fr_0.85fr]">
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-2">
                {train.offerTag ? (
                  <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    {train.offerTag}
                  </div>
                ) : null}

                {activeOffer ? (
                  <div className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold text-emerald-700">
                    {offerCode ? `${offerCode} Applied` : "Offer Applied"}
                  </div>
                ) : null}
              </div>

              <div className="break-words text-[18px] font-extrabold uppercase leading-tight text-slate-900 md:truncate">
                {train.trainName}
              </div>

              <div className="mt-1 text-[13px] font-semibold text-slate-500">
                #{train.trainNumber}
              </div>

              {activeOffer ? (
                <div className="mt-1 truncate text-[11px] font-medium text-emerald-700">
                  {offerTitle}
                </div>
              ) : null}

              <div className="mt-2 text-[12px] text-slate-500">
                Depart on:{" "}
                <span className="font-semibold tracking-[0.08em] text-slate-700 md:tracking-[0.15em]">
                  {Array.isArray(train.runDays)
                    ? train.runDays.join(" ")
                    : train.runDays}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 rounded-2xl bg-slate-50 px-3 py-3 md:contents">
              <div className="text-left md:text-center">
                <div className="text-[18px] font-extrabold text-slate-900 md:text-[16px]">
                  {train.departureTime}
                </div>
                <div className="mt-1 text-[12px] text-slate-500">
                  {train.departureDateLabel}
                </div>
                <div className="mt-1 text-[13px] font-bold text-slate-700">
                  {train.fromStationCode}
                </div>
              </div>

              <div className="pt-1 text-center">
                <div className="text-[13px] font-bold text-slate-700 md:text-[15px]">
                  {train.duration}
                </div>
                <button
                  type="button"
                  onClick={() => setShowRouteModal(true)}
                  className="mt-2 min-h-9 rounded-full bg-white px-3 text-[13px] font-bold text-sky-600 shadow-sm ring-1 ring-slate-200 transition hover:text-sky-700 md:min-h-0 md:rounded-none md:bg-transparent md:px-0 md:shadow-none md:ring-0"
                >
                  View Route
                </button>
              </div>

              <div className="text-right md:text-center">
                <div className="text-[18px] font-extrabold text-slate-900 md:text-[16px]">
                  {train.arrivalTime}
                </div>
                <div className="mt-1 text-[12px] text-slate-500">
                  {train.arrivalDateLabel}
                </div>
                <div className="mt-1 text-[13px] font-bold text-slate-700">
                  {train.toStationCode}
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 min-w-0 overflow-hidden rounded-[18px] train-class-scroll-container">
            <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-0 train-class-scroll">
              {train.classes.map((item) => {
                const active = isExpanded && selectedClassCode === item.classCode;
                const resolvedPrice = getResolvedClassPrice(item);

                return (
                  <button
                    key={item.classCode}
                    type="button"
                    onClick={() => handleToggleClass(item.classCode)}
                    className={`min-w-[172px] shrink-0 rounded-[18px] border px-3 py-3 text-left transition md:min-w-[210px] md:px-4 md:py-4 ${
                      active
                        ? "border-sky-400 bg-sky-50 shadow-sm"
                        : "border-slate-200 bg-white hover:border-sky-200"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="text-[15px] font-extrabold text-slate-900 md:text-[16px]">
                        {item.classCode}
                      </div>

                      <div className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          {resolvedPrice.strikePrice > resolvedPrice.displayPrice ? (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{resolvedPrice.strikePrice}
                            </span>
                          ) : null}

                          <span className="text-[15px] font-extrabold text-slate-900">
                            ₹{resolvedPrice.displayPrice}
                          </span>
                        </div>

                        {resolvedPrice.isOfferApplied ? (
                          <div className="mt-1 text-[10px] font-semibold text-emerald-700">
                            ₹{resolvedPrice.offerDiscount} saved
                          </div>
                        ) : null}
                      </div>
                    </div>

                    <div className="mt-3 text-[13px] font-bold text-sky-700">
                      {item.statusText}
                    </div>

                    {item.refundTag ? (
                      <div className="mt-2 line-clamp-1 text-[12px] font-medium text-slate-500">
                        {item.refundTag}
                      </div>
                    ) : null}

                    <div className="mt-2 text-[12px] text-slate-500">
                      {item.lastUpdatedText}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {isExpanded && selectedClass && (
          <div className="border-t border-slate-200 bg-slate-50 px-3 py-4 md:px-4">
            <div className="flex items-center gap-4 overflow-x-auto border-b border-slate-200 md:gap-6">
              {QUOTA_TABS.map((tab) => {
                const active = activeQuota === tab.value;

                return (
                  <button
                    key={tab.value}
                    type="button"
                    onClick={() => setActiveQuota(tab.value)}
                    className={`min-h-11 whitespace-nowrap border-b-[3px] px-1 py-3 text-[14px] font-medium transition md:text-[15px] ${
                      active
                        ? "border-emerald-700 text-slate-900"
                        : "border-transparent text-slate-700"
                    }`}
                  >
                    {tab.label}
                  </button>
                );
              })}
            </div>

            <div className="overflow-hidden rounded-b-[16px] bg-white">
              <div className="divide-y divide-slate-200">
                {expandedRows.map((row, index) => {
                  const resolvedPrice = getResolvedRowPrice(row);
                  const confirmResolvedPrice = resolveTrainPricing(
                    toNumber(row.confirmTicketPrice || row.price),
                    activeOffer
                  );

                  return (
                    <div
                      key={`${row.date}-${index}`}
                      className="grid grid-cols-1 gap-3 px-3 py-3 md:grid-cols-[0.85fr_1fr_0.9fr_0.9fr] md:items-center md:gap-4 md:px-4"
                    >
                      <div className="flex items-start justify-between gap-3 md:block">
                        <div>
                          <div className="text-[15px] font-semibold text-slate-900">
                            {formatDateShort(row.date)}
                          </div>
                          <div className="text-[12px] text-slate-500">
                            {row.dayLabel}
                          </div>
                        </div>

                        <div
                          className={`text-right text-[15px] font-semibold md:text-left ${
                            row.statusType === "AVAILABLE"
                              ? "text-emerald-700"
                              : row.statusType === "RAC"
                              ? "text-amber-700"
                              : row.statusType === "WL"
                              ? "text-emerald-800"
                              : "text-rose-700"
                          }`}
                        >
                          {row.statusText}
                        </div>

                        <div className="text-right text-[12px] text-slate-500 md:text-left">
                          {row.statusType === "WL" ? "Waitlist" : ""}
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleBookRegular(row)}
                        className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-[15px] font-medium leading-tight text-slate-800 transition hover:border-slate-500 md:mx-auto md:min-w-[118px] md:w-auto"
                      >
                        <div>Book</div>

                        <div className="flex items-center justify-center gap-1">
                          {resolvedPrice.strikePrice > resolvedPrice.displayPrice ? (
                            <span className="text-[11px] text-slate-400 line-through">
                              ₹{resolvedPrice.strikePrice}
                            </span>
                          ) : null}
                          <span>₹{resolvedPrice.displayPrice}</span>
                        </div>

                        {resolvedPrice.isOfferApplied ? (
                          <div className="text-[10px] font-semibold text-emerald-700">
                            Offer Applied
                          </div>
                        ) : null}
                      </button>

                      <div className="flex justify-center">
                        {row.confirmChance && row.confirmTicketPrice ? (
                          <button
                            type="button"
                            onClick={() =>
                              setConfirmModalData({
                                classCode: selectedClass.classCode,
                                date: row.date,
                                confirmChance: row.confirmChance,
                                confirmTicketPrice: row.confirmTicketPrice,
                                basePrice: row.price,
                                statusText: row.statusText,
                                statusType: row.statusType,
                              })
                            }
                            className="min-h-12 w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-[14px] font-medium leading-tight text-slate-700 transition hover:border-emerald-400 hover:text-emerald-700 md:min-w-[118px] md:w-auto"
                          >
                            <div>{row.confirmChance}% Chance</div>

                            <div className="flex items-center justify-center gap-1">
                              {confirmResolvedPrice.strikePrice >
                              confirmResolvedPrice.displayPrice ? (
                                <span className="text-[11px] text-slate-400 line-through">
                                  ₹{confirmResolvedPrice.strikePrice}
                                </span>
                              ) : null}
                              <span>₹{confirmResolvedPrice.displayPrice}</span>
                            </div>
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="border-t border-slate-200 bg-white px-4 py-3 text-center text-[14px] font-medium text-slate-700">
                Check 2 Months Calendar
              </div>
            </div>
          </div>
        )}
      </div>

      <TrainRouteModal
        open={showRouteModal}
        onClose={() => setShowRouteModal(false)}
        trainName={train.trainName}
        trainNumber={train.trainNumber}
        routeStops={train.routeStops}
      />

      <TrainConfirmOptionModal
        open={!!confirmModalData}
        onClose={() => setConfirmModalData(null)}
        trainName={train.trainName}
        travelDate={confirmModalData?.date || ""}
        classCode={confirmModalData?.classCode || ""}
        confirmChance={confirmModalData?.confirmChance}
        confirmTicketPrice={confirmModalData?.confirmTicketPrice}
        onBookConfirmTicket={handleBookConfirmTicket}
      />
    </>
  );
}

function formatDateShort(dateStr: string) {
  const date = new Date(dateStr);
  if (Number.isNaN(date.getTime())) return dateStr;

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}
