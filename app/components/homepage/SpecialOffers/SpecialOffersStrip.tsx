"use client";

import { useMemo, useRef, useState } from "react";
import OfferCard from "./OfferCard";
import OfferTabs from "./OfferTabs";
import useAutoScroll from "./useAutoScroll";

import { SMART_OFFERS_DATA } from "@/app/lib/smartOffers";

function getOfferType(service: string, offerType: string) {
  if (offerType === "membership") return "membership";
  if (service === "holiday") return "holiday";
  return service;
}

function mapOffer(offer: any) {
  return {
    img: "",
    type: getOfferType(offer.service, offer.offerType),
    title: offer.title,
    desc: offer.subtitle || offer.description || "Smart travel offer",
    smartOfferSlug: offer.slug,
    smartOfferCode: offer.couponCode || "",
  };
}

export default function SpecialOffersStrip() {
  const scrollRef = useRef<any>(null);
  const pauseRef = useRef(false);
  const [activeTab, setActiveTab] = useState("all");

  const allOffers = useMemo(() => {
    return SMART_OFFERS_DATA.filter((offer) => offer.active && offer.featured)
      .map(mapOffer)
      .slice(0, 40);
  }, []);

  const fallbackOffers = useMemo(() => {
    return SMART_OFFERS_DATA.filter(
      (offer) =>
        offer.active &&
        (offer.service === "all" ||
          offer.offerType === "membership" ||
          offer.featured)
    )
      .map(mapOffer)
      .slice(0, 25);
  }, []);

  const filtered = useMemo(() => {
    if (activeTab === "all") return allOffers;

    const list = allOffers.filter((offer) => offer.type === activeTab);

    if (list.length > 0) return list;

    return fallbackOffers;
  }, [activeTab, allOffers, fallbackOffers]);

  const minLoop = 8;
  let loopData = [...filtered];

  while (loopData.length < minLoop && filtered.length > 0) {
    loopData = [...loopData, ...filtered];
  }

  useAutoScroll(scrollRef, pauseRef, activeTab);

  return (
    <div
      className="relative mt-2 w-full rounded-[24px] bg-cover bg-center px-3 py-5 sm:rounded-3xl sm:px-8 sm:py-6"
      style={{ backgroundImage: "url('/bg/offerbg.jpg')" }}
    >
      <div className="pointer-events-none absolute inset-0 rounded-[24px] bg-black/10 sm:rounded-3xl"></div>

      <div className="relative z-10 mb-5 flex flex-col gap-4 sm:mb-7 lg:flex-row lg:items-center lg:justify-between lg:gap-5">
        <div className="order-2 lg:order-1">
          <OfferTabs activeTab={activeTab} setActiveTab={setActiveTab} />
        </div>

        <div className="order-1 text-center lg:order-2 lg:flex-1">
          <h2 className="text-2xl font-black text-white drop-shadow sm:text-4xl">
            Special Offers
          </h2>
          <p className="mt-1 text-xs font-semibold text-white/80 sm:text-sm">
            Smart deals matched from TPL master offer engine
          </p>
        </div>

        <div className="order-3 hidden w-[260px] text-right text-xs font-bold text-white/80 lg:block">
          {activeTab === "all"
            ? "Showing all active offers"
            : `Showing ${activeTab} offers`}
        </div>
      </div>

      <div
        ref={scrollRef}
        data-pause="true"
        className="offer-scroll flex gap-3 overflow-x-auto pb-3 sm:gap-6 lg:overflow-x-hidden"
      >
        {loopData.map((o, i) => (
          <OfferCard key={`${o.smartOfferSlug}-${activeTab}-${i}`} o={o} />
        ))}
      </div>
    </div>
  );
}