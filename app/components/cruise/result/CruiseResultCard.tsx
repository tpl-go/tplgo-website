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
      <div className="overflow-hidden rounded-[24px] border border-slate-200 bg-white shadow-sm">
        <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-5 py-3">
          <h3 className="min-w-0 flex-1 text-[17px] font-semibold leading-snug text-slate-900">
            {item.title}
          </h3>

          <div className="shrink-0 text-right text-[16px] font-medium text-slate-800">
            {item.tripLabel}
          </div>
        </div>

        <div className="px-5 py-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[210px_minmax(0,1fr)_240px_190px]">
            <div
              className="cursor-pointer overflow-hidden rounded-[18px] border border-slate-200 bg-slate-100 transition hover:shadow-md"
              onClick={openImagePreview}
            >
              <div className="relative h-full min-h-[230px] w-full overflow-hidden">
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
              <div className="flex items-start justify-between">
                <div className="min-w-0 flex-1">
                  <div className="mb-3 text-[18px] font-bold text-slate-900">
                    {item.cruiseLine}
                  </div>

                  <div className="space-y-2.5 text-[14.5px] text-slate-800">
                    <div className="flex items-center gap-2">
                      <Ship size={18} />
                      <span className="min-w-0 truncate">{item.shipName}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={18} />
                      <span>{item.departurePort}</span>
                      <RotateCcw size={16} />
                    </div>

                    <div className="flex items-center gap-2">
                      <Moon size={18} />
                      <span>{item.durationNights} Nights</span>
                    </div>

                    <div className="flex items-start gap-2">
                      <Anchor size={18} className="mt-[2px] shrink-0" />
                      <span>
                        {item.departurePort}, Australia | {item.arrivalPort}
                      </span>
                    </div>
                  </div>

                  <div className="mt-2 text-[13px] italic text-slate-500">
                    Ports of Call may vary by departure date and subject to
                    weather and other conditions.
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveInfo(videoInfo)}
                  className="ml-3 flex h-[42px] w-[42px] shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white shadow-sm transition hover:bg-slate-100"
                >
                  <Video size={20} className="text-slate-700" />
                </button>
              </div>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-300 bg-white self-start">
              <div className="border-b border-slate-200 px-3 py-2.5 text-[15px] font-semibold text-slate-800">
                Lowest Rate
              </div>

              <RateRow label="INSIDE" value={item.lowestRates.inside} />
              <RateRow label="OUTSIDE" value={item.lowestRates.outside} />
              <RateRow label="BALCONY" value={item.lowestRates.balcony} />
              <RateRow label="SUITE" value={item.lowestRates.suite} />
            </div>

            <div className="flex min-w-0 flex-col justify-between self-start">
              <div className="text-right">
                <div className="text-[15px] font-medium text-slate-600">
                  From
                </div>

                {resultPricing.hasOffer && (
                  <div className="mt-1 text-[15px] font-bold text-black line-through">
                    {formatPrice(resultPricing.originalBaseFare)}
                  </div>
                )}

                <div className="mt-1 text-[22px] font-bold leading-none tracking-tight text-slate-900">
                  {formatPrice(resultPricing.displayFare)}
                </div>

                {resultPricing.hasOffer && (
                  <div className="mt-2 inline-flex rounded-full bg-emerald-50 px-3 py-1 text-[12px] font-bold text-emerald-700">
                    {resultPricing.offerCode
                      ? `${resultPricing.offerCode} applied • `
                      : ""}
                    Save {formatPrice(resultPricing.offerDiscount)}
                  </div>
                )}

                <div className="mt-2 text-[15px] font-semibold text-slate-800">
                  {item.durationNights > 0 && resultPricing.displayFare
                    ? `₹${Math.round(
                        resultPricing.displayFare / item.durationNights
                      ).toLocaleString("en-IN")}/ night(s)`
                    : ""}
                </div>

                <div className="mt-3 text-[14px] font-medium leading-6 text-slate-700">
                  {item.taxesText}
                </div>
              </div>

              <div className="mt-5 flex justify-end">
                <button
                  type="button"
                  onClick={openOtherDatesModal}
                  className="rounded-full bg-gradient-to-r from-orange-500 via-orange-600 to-amber-500 px-5 py-2.5 text-[14px] font-semibold text-white shadow-md transition hover:scale-[1.02] hover:shadow-lg active:scale-[0.98]"
                >
                  SHOW DATES
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4">
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
    <div className="flex items-center justify-between border-t border-slate-200 px-3 py-2.5">
      <span className="text-[14px] font-medium text-slate-700">{label}</span>
      <span className="text-[15px] font-semibold text-emerald-600">
        {value ? `₹${value.toLocaleString("en-IN")}` : "—"}
      </span>
    </div>
  );
}