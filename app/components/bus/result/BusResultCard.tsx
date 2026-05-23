"use client";

import { useEffect, useMemo, useState } from "react";
import type { BusResultItem } from "@/app/lib/bus/busTypes";
import { applyBenefitPricing } from "@/app/lib/pricing/applyBenefitPricing";

type Props = {
  bus: BusResultItem;
  onViewDetails?: (bus: BusResultItem) => void;
  onSelectSeats?: (bus: BusResultItem) => void;
};

const SMART_ACTIVE_OFFER_KEY = "tpl_smart_active_offer_v1";
const SMART_OFFER_SOURCE_KEY = "tpl_smart_offer_source_v1";
const SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY = "tplActiveOfferPayload";

function readActiveBusOffer() {
  if (typeof window === "undefined") return null;

  try {
    const specialRaw = sessionStorage.getItem(SPECIAL_ACTIVE_OFFER_PAYLOAD_KEY);

    if (specialRaw) {
      const special = JSON.parse(specialRaw);
      const service = String(special?.service || "").toLowerCase();

      if (!service || service === "bus" || service === "all") {
        return special;
      }
    }

    const smartRaw = sessionStorage.getItem(SMART_ACTIVE_OFFER_KEY);
    if (!smartRaw) return null;

    const smart = JSON.parse(smartRaw);
    const offer = smart?.offer || smart;

    const service = String(offer?.service || "").toLowerCase();
    if (service && service !== "bus" && service !== "all") return null;

    return {
      ...offer,
      source: smart?.source || offer?.source || "ai_auto",
      activatedAt: smart?.activatedAt || offer?.activatedAt,
    };
  } catch {
    return null;
  }
}

function resolveBusBaseFare(bus: any) {
  return Number(
    bus?.baseFare ||
      bus?.fare ||
      bus?.lowestFare ||
      bus?.finalFare ||
      bus?.price ||
      0
  );
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

  if (minBookingValue > 0 && baseAmount < minBookingValue) {
    return 0;
  }

  const discountMode = String(
    offer?.discountMode || offer?.offer?.discountMode || ""
  ).toLowerCase();

  const discountValue = Number(
    offer?.discountValue || offer?.offer?.discountValue || 0
  );

  const maxDiscount = Number(
    offer?.maxDiscount ||
      offer?.offer?.maxDiscount ||
      discountValue ||
      0
  );

  let discount = 0;

  if (discountMode === "percent") {
    discount = Math.round((baseAmount * discountValue) / 100);
  } else {
    discount = Math.round(discountValue);
  }

  if (maxDiscount > 0) {
    discount = Math.min(discount, maxDiscount);
  }

  return Math.min(Math.max(discount, 0), baseAmount);
}

export default function BusResultCard({
  bus,
  onViewDetails,
  onSelectSeats,
}: Props) {
  const [activeOffer, setActiveOffer] = useState<any>(null);

  useEffect(() => {
    setActiveOffer(readActiveBusOffer());

    const syncOffer = () => {
      setActiveOffer(readActiveBusOffer());
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

  const baseFare = useMemo(() => resolveBusBaseFare(bus), [bus]);

  const offerCode = useMemo(() => getOfferCode(activeOffer), [activeOffer]);
  const offerTitle = useMemo(() => getOfferTitle(activeOffer), [activeOffer]);

  const offerDiscount = useMemo(() => {
    return getOfferDiscountAmount(activeOffer, baseFare);
  }, [activeOffer, baseFare]);

  const benefitPricing = useMemo(() => {
    return applyBenefitPricing({
      baseAmount: baseFare,
      offerDiscount,
    });
  }, [baseFare, offerDiscount]);

  const displayPrice =
    offerDiscount > 0 ? benefitPricing.baseAfterOffer : Number(bus.price || 0);

  const strikePrice = offerDiscount > 0 ? baseFare : Number(bus.originalPrice || 0);

  const isOfferApplied = Boolean(activeOffer && offerDiscount > 0 && baseFare > 0);

  function handleSelectSeats() {
    if (typeof window !== "undefined" && activeOffer) {
      try {
        const enrichedOffer = {
          ...activeOffer,
          service: "bus",
          appliedOfferAmount: offerDiscount,
          discountAmount: offerDiscount,
          baseAmount: baseFare,
          baseAfterOffer: benefitPricing.baseAfterOffer,
          finalPayable: benefitPricing.finalPayable,
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
            service: "bus",
            source: "results",
            selectedAt: new Date().toISOString(),
            baseAmount: baseFare,
            offerDiscount,
            baseAfterOffer: benefitPricing.baseAfterOffer,
            busId: (bus as any)?.id || "",
            operatorName: bus.operatorName,
            route: {
              departureTime: bus.departureTime,
              arrivalTime: bus.arrivalTime,
            },
          })
        );

        window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
        window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
      } catch {}
    }

    onSelectSeats?.(bus);
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg">
      <div className="px-4 py-3">
        <div className="grid grid-cols-[1.15fr_0.9fr_0.7fr] items-center gap-4">
          <div className="min-w-0">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              <span className="rounded bg-blue-600 px-2 py-[2px] text-[10px] font-semibold text-white">
                ★ {bus.rating}
              </span>

              {bus.isAssured && (
                <span className="rounded bg-sky-50 px-2 py-[2px] text-[10px] font-semibold text-sky-700">
                  Assured
                </span>
              )}

              {bus.busTag && (
                <span className="rounded bg-orange-50 px-2 py-[2px] text-[10px] font-semibold text-orange-700">
                  {bus.busTag}
                </span>
              )}

              {bus.isNewBus && (
                <span className="rounded bg-emerald-50 px-2 py-[2px] text-[10px] font-semibold text-emerald-700">
                  New Bus
                </span>
              )}

              {isOfferApplied && (
                <span className="rounded bg-emerald-50 px-2 py-[2px] text-[10px] font-semibold text-emerald-700">
                  {offerCode ? `${offerCode} Applied` : "Offer Applied"}
                </span>
              )}
            </div>

            <h3 className="truncate text-[18px] font-semibold text-slate-900">
              {bus.operatorName}
            </h3>

            <p className="truncate text-[14px] font-medium text-slate-700">
              {bus.busName}
            </p>

            <p className="text-[12px] text-slate-500">{bus.busType}</p>

            {isOfferApplied && (
              <p className="mt-1 truncate text-[11px] font-medium text-emerald-700">
                {offerTitle}
              </p>
            )}
          </div>

          <div className="flex items-center justify-center">
            <div className="flex items-center justify-center gap-6 text-center">
              <div className="min-w-[72px]">
                <p className="text-[20px] font-semibold text-slate-900">
                  {bus.departureTime}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {bus.departureDate}
                </p>
              </div>

              <div className="w-[90px]">
                <p className="text-[12px] text-slate-500">{bus.duration}</p>
                <div className="mt-1 h-[1px] w-full bg-slate-300" />
              </div>

              <div className="min-w-[72px]">
                <p className="text-[20px] font-semibold text-slate-900">
                  {bus.arrivalTime}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  {bus.arrivalDate}
                </p>
              </div>
            </div>
          </div>

          <div className="min-w-0 text-right">
            <div className="flex items-end justify-end gap-2">
              {strikePrice > 0 && strikePrice > displayPrice && (
                <span className="text-[12px] text-slate-400 line-through">
                  ₹{strikePrice}
                </span>
              )}

              <span className="text-[22px] font-bold text-slate-900">
                ₹{displayPrice}
              </span>
            </div>

            {isOfferApplied && (
              <div className="mt-1 text-[11px] font-semibold text-emerald-700">
                ₹{offerDiscount} saved on base fare
              </div>
            )}

            <div className="mt-2 text-[11px] text-slate-500">
              {bus.seatsAvailable} Seats Left • {bus.singleSeatsLeft} Single
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-50 px-4 py-2">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-4 text-[12px] text-slate-500">
            <button
              type="button"
              onClick={() => onViewDetails?.(bus)}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2 text-[14px] font-semibold text-slate-700 transition hover:border-sky-400 hover:text-sky-600"
            >
              View Details
            </button>

            <span>{bus.reviewCount} Reviews</span>

            <span className="max-w-[200px] truncate">
              {bus.amenities.slice(0, 3).join(" • ")}
            </span>
          </div>

          <button
            type="button"
            onClick={handleSelectSeats}
            className="rounded-lg bg-orange-500 px-5 py-2 text-[13px] font-semibold text-white shadow-sm transition hover:bg-orange-600"
          >
            SELECT SEATS
          </button>
        </div>
      </div>
    </div>
  );
}