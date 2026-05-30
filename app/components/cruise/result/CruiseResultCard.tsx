"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import {
  Anchor,
  Moon,
  RotateCcw,
  MapPin,
  Ship,
  Video,
} from "lucide-react";
import {
  CruiseInfoItem,
  CruiseResultItem,
} from "@/app/lib/cruise/cruiseResultTypes";
import CruiseInfoPopup from "./CruiseInfoPopup";
import CruisePromotionsRow from "./CruisePromotionsRow";
import CruiseShipPreviewModal from "./CruiseShipPreviewModal";
import CruiseOtherSailingDatesModal from "./CruiseOtherSailingDatesModal";

import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";
import {
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
} from "@/app/lib/smartOffers";

type Props = {
  item: CruiseResultItem;
};

function formatPrice(value?: number) {
  if (!value) return "—";
  return `₹${value.toLocaleString("en-IN")}`;
}

export default function CruiseResultCard({ item }: Props) {
  const [activeInfo, setActiveInfo] = useState<CruiseInfoItem | null>(null);
  const [showShipPreview, setShowShipPreview] = useState(false);
  const [showOtherDatesModal, setShowOtherDatesModal] = useState(false);
  const [offerRefreshKey, setOfferRefreshKey] = useState(0);
  const [isMounted, setIsMounted] = useState(false);

  const [previewInitialTab, setPreviewInitialTab] = useState<
    "itinerary" | "otherDates" | "cruiseInfo" | "policies"
  >("itinerary");

  useEffect(() => {
  setIsMounted(true);

  const refresh = () => setOfferRefreshKey((prev) => prev + 1);

  window.addEventListener("TPL_ACTIVE_OFFER_UPDATED", refresh);
  window.addEventListener("TPL_SMART_OFFER_UPDATED", refresh);
  window.addEventListener("storage", refresh);

  return () => {
    window.removeEventListener("TPL_ACTIVE_OFFER_UPDATED", refresh);
    window.removeEventListener("TPL_SMART_OFFER_UPDATED", refresh);
    window.removeEventListener("storage", refresh);
  };
}, []);

  const videoInfo = useMemo<CruiseInfoItem>(
    () => ({
      id: `${item.id}-video`,
      label: "Ship Videos",
      title: "Ship Videos",
      description: `Videos, walkthroughs, and visual highlights for ${item.shipName} will appear here in the next phase. This action is reserved for ship media preview.`,
    }),
    [item.id, item.shipName]
  );

  const displayBaseFare =
    [
      Number(item.lowestRates.inside || 0),
      Number(item.lowestRates.outside || 0),
      Number(item.lowestRates.balcony || 0),
      Number(item.lowestRates.suite || 0),
    ]
      .filter((price) => price > 0)
      .sort((a, b) => a - b)[0] || 0;

  const resultPricing = useMemo(() => {
    const activeOffer = isMounted ? getSmartActiveOfferItem() : null;

    const activeOfferService = String(
      (activeOffer as any)?.service || ""
    ).toLowerCase();

    const offerAllowed =
      !!activeOffer &&
      displayBaseFare > 0 &&
      (activeOfferService === "cruise" || activeOfferService === "all");

    const rawOfferDiscount = offerAllowed
      ? calculateSmartOfferDiscount(activeOffer as any, displayBaseFare)
      : 0;

    const pricing = applyBenefitPricing({
      baseAmount: displayBaseFare,
      offerDiscount: rawOfferDiscount,
      promoCredit: 0,
      earnedCredit: 0,
      refundWallet: 0,
    });

    const offerCode =
      (activeOffer as any)?.couponCode ||
      (activeOffer as any)?.slug ||
      "";

    return {
      activeOffer,
      offerCode,
      originalBaseFare: pricing.baseAmount,
      offerDiscount: pricing.offerDiscount,
      baseAfterOffer: pricing.baseAfterOffer,
      displayFare: pricing.baseAfterOffer || pricing.baseAmount,
      hasOffer:
        pricing.offerDiscount > 0 &&
        pricing.baseAfterOffer < pricing.baseAmount,
      earnedCreditAmount: Math.floor(pricing.baseAfterOffer * 0.02),
      pricingSnapshot: pricing,
    };
  }, [displayBaseFare, offerRefreshKey, isMounted]);

  function openImagePreview() {
    setPreviewInitialTab("itinerary");
    setShowShipPreview(true);
  }

  function openMainPreview(
    tab: "itinerary" | "otherDates" | "cruiseInfo" | "policies" = "itinerary"
  ) {
    setPreviewInitialTab(tab);
    setShowShipPreview(true);
  }

  function openOtherDatesModal() {
    setShowOtherDatesModal(true);
  }

  return (
    <>
      <div className="overflow-hidden rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_24px_rgba(15,23,42,0.07)] lg:rounded-[24px] lg:shadow-sm">
        <div className="flex flex-col gap-2 border-b border-slate-200 px-4 py-3 lg:flex-row lg:items-start lg:justify-between lg:gap-4 lg:px-5">
          <h3 className="min-w-0 text-[16px] font-black leading-snug text-slate-900 lg:flex-1 lg:text-[17px] lg:font-semibold">
            {item.title}
          </h3>

          <div className="inline-flex w-fit max-w-full rounded-full bg-slate-100 px-3 py-1 text-left text-[12px] font-extrabold text-slate-700 lg:block lg:w-auto lg:shrink-0 lg:bg-transparent lg:px-0 lg:py-0 lg:text-right lg:text-[16px] lg:font-medium lg:text-slate-800">
            {item.tripLabel}
          </div>
        </div>

        <div className="px-4 py-4 lg:px-5">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[210px_minmax(0,1fr)_240px_190px]">
            <div
              className="cursor-pointer overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100 transition hover:shadow-md"
              onClick={openImagePreview}
            >
              <div className="relative h-[190px] w-full overflow-hidden sm:h-[220px] lg:h-full lg:min-h-[230px]">
                <Image
                  src={item.mapImage}
                  alt={item.tripLabel}
                  fill
                  className="object-cover"
                />

                <div className="absolute right-2 top-2 z-10">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openImagePreview();
                    }}
                    className="rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-slate-800 shadow"
                  >
                    View All
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 z-[5] bg-slate-900/95 px-3 py-2.5">
                  <p className="truncate text-[13px] font-medium leading-none text-white">
                    {item.tripLabel}
                  </p>
                </div>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 text-[18px] font-black leading-tight text-slate-900 lg:font-bold">
                    {item.cruiseLine}
                  </div>

                  <div className="flex flex-wrap gap-2 text-[13px] text-slate-800 lg:block lg:space-y-2.5 lg:text-[14.5px]">
                    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 lg:flex lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                      <Ship size={16} className="shrink-0 lg:h-[18px] lg:w-[18px]" />
                      <span className="min-w-0 truncate">{item.shipName}</span>
                    </div>

                    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 lg:flex lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                      <MapPin size={16} className="shrink-0 lg:h-[18px] lg:w-[18px]" />
                      <span className="min-w-0 truncate">{item.departurePort}</span>
                      <RotateCcw size={14} className="shrink-0 lg:h-4 lg:w-4" />
                    </div>

                    <div className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 lg:flex lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                      <Moon size={16} className="shrink-0 lg:h-[18px] lg:w-[18px]" />
                      <span>{item.durationNights} Nights</span>
                    </div>

                    <div className="inline-flex max-w-full items-start gap-1.5 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-1.5 lg:flex lg:rounded-none lg:border-0 lg:bg-transparent lg:px-0 lg:py-0">
                      <Anchor size={16} className="mt-[1px] shrink-0 lg:h-[18px] lg:w-[18px]" />
                      <span className="min-w-0 break-words">
                        {item.departurePort}, Australia | {item.arrivalPort}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-[12px] italic leading-5 text-slate-500 lg:mt-2 lg:text-[13px]">
                    Ports of Call may vary by departure date and subject to
                    weather and other conditions.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveInfo(videoInfo)}
                  className="flex h-[40px] w-[40px] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100 lg:ml-3 lg:h-[42px] lg:w-[42px]"
                >
                  <Video size={20} className="text-slate-700" />
                </button>
              </div>
            </div>

            <div className="self-start overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 lg:rounded-xl lg:border-slate-300 lg:bg-white">
              <div className="border-b border-slate-200 px-3 py-2.5 text-[14px] font-black text-slate-800 lg:text-[15px] lg:font-semibold">
                Lowest Rate
              </div>

              <div className="grid grid-cols-2 lg:block">
                <RateRow label="INSIDE" value={item.lowestRates.inside} />
                <RateRow label="OUTSIDE" value={item.lowestRates.outside} />
                <RateRow label="BALCONY" value={item.lowestRates.balcony} />
                <RateRow label="SUITE" value={item.lowestRates.suite} />
              </div>
            </div>

            <div className="flex min-w-0 flex-col justify-between self-start rounded-2xl border border-orange-100 bg-orange-50/40 p-4 lg:rounded-none lg:border-0 lg:bg-transparent lg:p-0">
              <div className="text-left lg:text-right">
                <div className="text-[13px] font-extrabold uppercase tracking-wide text-slate-500 lg:text-[15px] lg:font-medium lg:normal-case lg:tracking-normal lg:text-slate-600">
                  From
                </div>

                {resultPricing.hasOffer && (
                  <div className="mt-1 text-[14px] font-bold text-black line-through lg:text-[15px]">
                    {formatPrice(resultPricing.originalBaseFare)}
                  </div>
                )}

                <div className="mt-1 text-[26px] font-black leading-none tracking-tight text-slate-900 lg:text-[22px] lg:font-bold">
                  {formatPrice(resultPricing.displayFare)}
                </div>

                {resultPricing.hasOffer && (
                  <div className="mt-2 inline-flex max-w-full rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                    {resultPricing.offerCode
                      ? `${resultPricing.offerCode} applied • `
                      : ""}
                    Save {formatPrice(resultPricing.offerDiscount)}
                  </div>
                )}

                <div className="mt-2 text-[14px] font-semibold text-slate-800 lg:text-[15px]">
                  {item.durationNights > 0 && resultPricing.displayFare
                    ? `₹${Math.round(
                        resultPricing.displayFare / item.durationNights
                      ).toLocaleString("en-IN")}/ night(s)`
                    : ""}
                </div>

                <div className="mt-3 text-[13px] font-medium leading-5 text-slate-700 lg:text-[14px] lg:leading-6">
                  {item.taxesText}
                </div>
              </div>

              <div className="mt-4 flex lg:mt-5 lg:justify-end">
                <button
                  type="button"
                  onClick={openOtherDatesModal}
                  className="h-11 w-full rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-5 text-[14px] font-extrabold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.98] lg:w-auto lg:py-2.5 lg:font-semibold"
                >
                  SHOW DATES
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 min-w-0">
            <CruisePromotionsRow
              items={item.promoItems}
              onOpenInfo={setActiveInfo}
            />
          </div>
        </div>
      </div>

      <CruiseInfoPopup
        open={!!activeInfo}
        item={activeInfo}
        onClose={() => setActiveInfo(null)}
      />

      <CruiseShipPreviewModal
        open={showShipPreview}
        onClose={() => setShowShipPreview(false)}
        item={item}
        
      />

      <CruiseOtherSailingDatesModal
        open={showOtherDatesModal}
        onClose={() => setShowOtherDatesModal(false)}
        item={item}
        onOpenMainPreview={openMainPreview}
      />
    </>
  );
}

function RateRow({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-2 border-t border-slate-200 px-3 py-2.5">
      <span className="min-w-0 truncate text-[12px] font-extrabold text-slate-600 lg:text-[14px] lg:font-medium lg:text-slate-700">{label}</span>
      <span className="whitespace-nowrap text-[13px] font-black text-emerald-600 lg:text-[15px] lg:font-semibold">
        {value ? `₹${value.toLocaleString("en-IN")}` : "—"}
      </span>
    </div>
  );
}
