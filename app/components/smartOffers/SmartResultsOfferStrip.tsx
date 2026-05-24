"use client";

import { useEffect, useMemo } from "react";
import { Sparkles, Tag, BadgeCheck, Zap } from "lucide-react";

import {
  SMART_OFFERS_DATA,
  calculateSmartOfferDiscount,
  getSmartActiveOfferItem,
  activateSmartOffer,
} from "@/app/lib/smartOffers";

type Props = {
  service:
    | "hotel"
    | "flight"
    | "holiday"
    | "homestay"
    | "bus"
    | "train"
    | "cab"
    | "cruise"
    | "insurance"
    | "visa";

  destination?: string;
  bookingValue?: number;
  isInternational?: boolean;
};

function getServiceLabel(service: Props["service"]) {
  const map: Record<Props["service"], string> = {
    hotel: "Hotel",
    flight: "Flight",
    holiday: "Package",
    homestay: "Homestay",
    bus: "Bus",
    train: "Train",
    cab: "Cab",
    cruise: "Cruise",
    insurance: "Insurance",
    visa: "Visa",
  };

  return map[service] || "Travel";
}

function clearPreviousAIAutoOffer() {
  if (typeof window === "undefined") return;

  try {
    const rawPayload = sessionStorage.getItem("tplActiveOfferPayload");
    const rawActivation = sessionStorage.getItem("tplActiveOfferActivation");

    const payload = rawPayload ? JSON.parse(rawPayload) : null;
    const activation = rawActivation ? JSON.parse(rawActivation) : null;

    const isAIAutoOffer =
      payload?.source === "ai_auto" ||
      payload?.autoApplied === true ||
      activation?.source === "ai_auto" ||
      activation?.autoApplied === true;

    if (!isAIAutoOffer) return;

    sessionStorage.removeItem("tplActiveOfferPayload");
    sessionStorage.removeItem("tplActiveOfferActivation");
    sessionStorage.removeItem("tpl_smart_active_offer_v1");
    sessionStorage.removeItem("tpl_smart_offer_source_v1");

    window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
    window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
  } catch {
    sessionStorage.removeItem("tplActiveOfferPayload");
    sessionStorage.removeItem("tplActiveOfferActivation");
    sessionStorage.removeItem("tpl_smart_active_offer_v1");
    sessionStorage.removeItem("tpl_smart_offer_source_v1");

    window.dispatchEvent(new CustomEvent("TPL_ACTIVE_OFFER_UPDATED"));
    window.dispatchEvent(new CustomEvent("TPL_SMART_OFFER_UPDATED"));
  }
}

export default function SmartResultsOfferStrip({
  service,
  destination = "",
  bookingValue = 12000,
  isInternational = false,
}: Props) {
  const offers = useMemo(() => {
    const target = destination.toLowerCase();
    const activeOffer = getSmartActiveOfferItem();

    return SMART_OFFERS_DATA.filter((offer: any) => {
      if (!offer.active) return false;

      const serviceOk = offer.service === service || offer.service === "all";

      if (!serviceOk) return false;

      if (offer.offerType === "membership") return false;

      if (offer.rule?.internationalOnly && !isInternational) {
        return false;
      }

      if (offer.rule?.domesticOnly && isInternational) {
        return false;
      }

      if (offer.rule?.destinations?.length && target) {
        const matched = offer.rule.destinations.some((item: string) => {
          const current = String(item || "").toLowerCase();

          return (
            current === target ||
            current.includes(target) ||
            target.includes(current)
          );
        });

        if (!matched) return false;
      }

      return true;
    })
      .map((offer: any) => ({
        rawOffer: offer,
        code: offer.couponCode || offer.slug,
        title: offer.title,
        subtitle:
          offer.subtitle ||
          offer.description ||
          "Smart offer matched for your search.",
        discountAmount: calculateSmartOfferDiscount(offer, bookingValue),
      }))
      .filter((offer) => offer.code && offer.discountAmount > 0)
      .sort((a: any, b: any) => {
        const activeCode = activeOffer?.couponCode || activeOffer?.slug || "";

        if (a.code === activeCode) return -1;
        if (b.code === activeCode) return 1;

        return 0;
      })
      .slice(0, 2);
  }, [service, destination, bookingValue, isInternational]);

  const bestOffer = offers[0] || null;
  const otherOffer = offers[1] || null;

  const serviceLabel = getServiceLabel(service);

  useEffect(() => {
    clearPreviousAIAutoOffer();

    if (!bestOffer?.rawOffer) return;

    activateSmartOffer(bestOffer.rawOffer, "ai_auto", {
      service,
      destination,
      bookingValue,
      discountAmount: bestOffer.discountAmount,
      entryPoint: `${service}_results_smart_strip`,
    });
  }, [bestOffer?.code, service, destination, bookingValue, isInternational]);

  if (!bestOffer) return null;

  return (
    <div className="relative mb-4 overflow-hidden rounded-[22px] border border-[#7dd3fc]/40 bg-[linear-gradient(135deg,#081c4b_0%,#0b74ff_42%,#06b6d4_100%)] shadow-[0_20px_50px_rgba(2,132,199,0.32)] sm:rounded-[28px]">
      {/* Glow Layers */}
      <div className="absolute -left-14 top-0 h-44 w-44 rounded-full bg-white/15 blur-3xl" />

      <div className="absolute bottom-0 right-0 h-52 w-52 rounded-full bg-cyan-300/20 blur-3xl" />

      <div className="absolute left-[30%] top-5 h-2 w-2 rounded-full bg-white/40" />

      <div className="absolute right-[18%] top-8 h-3 w-3 rounded-full bg-cyan-200/50" />

      <div className="absolute bottom-6 left-[52%] h-2 w-2 rounded-full bg-white/30" />

      <div className="relative grid items-center gap-4 px-3 py-4 sm:px-5 sm:py-5 lg:grid-cols-[1.08fr_1.15fr_0.72fr] lg:gap-5">
        {/* LEFT */}
        <div className="flex min-w-0 items-start gap-3 sm:items-center sm:gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 shadow-[0_10px_24px_rgba(0,0,0,0.2)] backdrop-blur-xl sm:h-14 sm:w-14">
            <Sparkles className="h-6 w-6 text-white sm:h-7 sm:w-7" />
          </div>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/20 bg-white/15 px-2.5 py-1 text-[9px] font-black uppercase tracking-[0.14em] text-white backdrop-blur-xl sm:px-3 sm:text-[10px] sm:tracking-[0.18em]">
                AI Smart Match
              </span>

              <div className="flex h-[28px] items-center gap-1 rounded-full border border-[#fdba74] bg-[linear-gradient(135deg,#f97316,#ea580c)] px-2.5 shadow-[0_6px_16px_rgba(249,115,22,0.42)] sm:h-[30px] sm:px-3">
                <BadgeCheck className="h-3.5 w-3.5 shrink-0 text-white" />

                <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white sm:text-[10px] sm:tracking-[0.14em]">
                  OFFER APPLIED
                </span>
              </div>
            </div>

            <div className="mt-2 text-[18px] font-black leading-tight text-white sm:text-[20px]">
              {serviceLabel} Smart Offer Active
            </div>

            <div className="mt-1 text-[12px] font-semibold leading-[17px] text-white/80 sm:text-[13px] sm:leading-[18px]">
              Best saving unlocked for{" "}
              <span className="font-black text-white">
                {destination || "your search"}
              </span>
            </div>
          </div>
        </div>

        {/* CENTER */}
        <div className="min-w-0">
          <div className="relative flex min-h-[88px] items-center gap-3 overflow-hidden rounded-2xl border border-white/15 bg-white/12 px-3 py-4 shadow-[0_14px_34px_rgba(0,0,0,0.2)] backdrop-blur-2xl sm:min-h-[92px] sm:gap-4 sm:px-4">
            <div className="absolute right-0 top-0 h-full w-[120px] bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.12),transparent_70%)]" />

            <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white text-[#0b74ff] shadow-md sm:h-12 sm:w-12">
              <Tag className="h-5 w-5" />
            </div>

            <div className="relative min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="max-w-full truncate rounded-full bg-white px-2.5 py-1 text-[10px] font-black text-[#0f172a] shadow-sm">
                  {bestOffer.code}
                </span>

                <span className="rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-2.5 py-1 text-[10px] font-black text-white shadow-[0_4px_12px_rgba(249,115,22,0.35)]">
                  {bestOffer.rawOffer?.displayMode === "upTo"
                    ? "Save up to ₹"
                    : "Save ₹"}
                  {bestOffer.discountAmount.toLocaleString("en-IN")}
                </span>
              </div>

              <div className="mt-2 line-clamp-2 text-[15px] font-black leading-tight text-white sm:truncate sm:text-[17px]">
                {bestOffer.title}
              </div>

              <div className="mt-1 text-[11px] font-semibold leading-[15px] text-white/75 sm:text-[12px] sm:leading-[16px]">
                Smart pricing optimization successfully applied.
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="hidden min-w-0 lg:block">
          {otherOffer ? (
            <div className="flex min-h-[80px] items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7ed] text-[#f97316] shadow-sm">
                <Zap className="h-4 w-4" />
              </div>

              <div className="min-w-0">
                <div className="text-[10px] font-black uppercase tracking-wide text-white/70">
                  More Saving
                </div>

                <div className="mt-0.5 truncate text-[13px] font-black text-white">
                  {otherOffer.code}
                </div>

                <div className="mt-1 inline-flex rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-2 py-1 text-[10px] font-black text-white shadow-[0_4px_10px_rgba(249,115,22,0.35)]">
                  {otherOffer.rawOffer?.displayMode === "upTo"
                    ? "Extra up to ₹"
                    : "Extra ₹"}
                  {otherOffer.discountAmount.toLocaleString("en-IN")} Saving
                </div>
              </div>
            </div>
          ) : (
            <div className="flex min-h-[80px] items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-xl">
              <BadgeCheck className="h-5 w-5 shrink-0 text-[#fdba74]" />

              <div>
                <div className="text-[12px] font-black text-white">
                  Smart Savings Active
                </div>

                <div className="text-[11px] font-semibold text-white/70">
                  AI optimized pricing enabled
                </div>
              </div>
            </div>
          )}
        </div>

        {/* MOBILE OTHER OFFER */}
        {otherOffer && (
          <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-xl lg:hidden">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff7ed] text-[#f97316] shadow-sm">
              <Zap className="h-4 w-4" />
            </div>

            <div className="min-w-0">
              <div className="text-[10px] font-black uppercase tracking-wide text-white/70">
                More Saving
              </div>

              <div className="mt-0.5 truncate text-[13px] font-black text-white">
                {otherOffer.code}
              </div>

              <div className="mt-1 inline-flex rounded-full bg-[linear-gradient(135deg,#f97316,#ea580c)] px-2 py-1 text-[10px] font-black text-white shadow-[0_4px_10px_rgba(249,115,22,0.35)]">
                {otherOffer.rawOffer?.displayMode === "upTo"
                  ? "Extra up to ₹"
                  : "Extra ₹"}
                {otherOffer.discountAmount.toLocaleString("en-IN")} Saving
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}